-- Developer Portal: real OAuth 2.0 apps (branding + authorization-code flow +
-- token issuance) plus the existing sandbox/live API key concept, all backed
-- by Supabase instead of the browser's localStorage (see lib/services.ts —
-- the old `devApps` section there is superseded by this migration and by
-- lib/developer-apps.ts).
--
-- Run this once in the Supabase SQL editor for this project (or via the
-- Supabase CLI: `supabase db push`), after 0001-0004.
--
-- Design notes:
-- * Every secret (OAuth client secret, sandbox/live API keys, authorization
--   codes, access/refresh tokens) is stored ONLY as a SHA-256 hash. The
--   plaintext value is generated and returned to the caller exactly once (at
--   creation/regeneration/issuance time) and is never persisted or readable
--   again afterward — the same approach Stripe and GitHub use for API keys
--   and OAuth secrets. SHA-256 (not bcrypt) is intentional: these are
--   already 96+ bits of server-generated randomness, not user-chosen
--   passwords, so a fast, unsalted cryptographic hash is the correct choice
--   (bcrypt's slow-hashing is a defense against guessing low-entropy
--   secrets, which does not apply here) and lets a busy token/userinfo
--   endpoint verify a presented token cheaply.
-- * Everything uses core PostgreSQL functions (gen_random_uuid, sha256,
--   convert_to) — no extensions to enable.
-- * All four tables below are RLS-enabled with ZERO direct client policies.
--   Every read and write is mediated by a `security definer` RPC function
--   that does its own explicit authorization check (auth.uid() = owner,
--   client_secret verification, token-hash lookup, etc.) — this sidesteps
--   any ambiguity around how RLS interacts with views/FORCE RLS/security
--   definer functions, and mirrors this project's own precedent
--   (blog_posts_set_author / design_suggestions_set_author) of using
--   security-definer functions to safely bridge auth.users into a
--   client-writable table.
-- * The token endpoint (gh_oauth_token) and userinfo endpoint
--   (gh_oauth_userinfo) are called by an external server (the third-party
--   app's own backend), not a signed-in browser — they authenticate the
--   caller themselves (client_secret / bearer token) rather than relying on
--   auth.uid(), and return `{"error": "..."}` as ordinary JSON (matching
--   RFC 6749 §5.2) instead of raising a Postgres exception, so the Next.js
--   route handlers in app/api/oauth/ can pass a spec-shaped error straight
--   through with the right HTTP status.

/* ------------------------------- Scopes -------------------------------- */

-- The fixed set of data an app can request access to. Every scope here maps
-- to data that genuinely exists in this schema today (profile fields on
-- auth.users, and the player's own blog posts / design suggestions) — no
-- scope is offered for a feature (friends, achievements, leaderboards) that
-- doesn't have a real table behind it yet.
create or replace function public.gh_oauth_available_scopes()
returns text[]
language sql
immutable
as $$
  select array['profile:read', 'email:read', 'posts:read', 'designs:read'];
$$;

/* ------------------------------- Tables -------------------------------- */

create table if not exists public.developer_apps (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  logo text,
  homepage_url text,
  privacy_url text,
  tos_url text,
  redirect_uris text[] not null default '{}',
  webhook_url text,
  scopes text[] not null default '{}',
  client_id text not null unique,
  client_secret_hash text not null,
  client_secret_last4 text not null,
  sandbox_api_key_hash text not null,
  sandbox_api_key_last4 text not null,
  sandbox_api_key_created_at timestamptz not null default now(),
  -- Reserved for when Public Beta opens production access — see
  -- gh_request_live_key_access below. Nothing currently mints a live key;
  -- these stay null until that feature actually ships.
  live_api_key_hash text,
  live_api_key_last4 text,
  live_api_key_created_at timestamptz,
  live_key_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists developer_apps_owner_id_idx on public.developer_apps (owner_id);
create index if not exists developer_apps_client_id_idx on public.developer_apps (client_id);

alter table public.developer_apps
  drop constraint if exists developer_apps_name_len,
  drop constraint if exists developer_apps_description_len,
  drop constraint if exists developer_apps_logo_size,
  drop constraint if exists developer_apps_homepage_format,
  drop constraint if exists developer_apps_privacy_format,
  drop constraint if exists developer_apps_tos_format,
  drop constraint if exists developer_apps_webhook_format,
  drop constraint if exists developer_apps_redirect_uris_len,
  drop constraint if exists developer_apps_scopes_len,
  drop constraint if exists developer_apps_scopes_valid;

alter table public.developer_apps
  add constraint developer_apps_name_len check (char_length(name) between 3 and 80),
  add constraint developer_apps_description_len check (char_length(description) <= 400),
  -- Logo is a compressed base64 data URL (see lib/images.ts), same technique
  -- already used for avatars/blog covers/design images elsewhere in the app.
  add constraint developer_apps_logo_size check (logo is null or char_length(logo) <= 2000000),
  add constraint developer_apps_homepage_format check (homepage_url is null or homepage_url ~* '^https?://'),
  add constraint developer_apps_privacy_format check (privacy_url is null or privacy_url ~* '^https?://'),
  add constraint developer_apps_tos_format check (tos_url is null or tos_url ~* '^https?://'),
  add constraint developer_apps_webhook_format check (webhook_url is null or webhook_url ~* '^https?://'),
  add constraint developer_apps_redirect_uris_len check (array_length(redirect_uris, 1) is null or array_length(redirect_uris, 1) <= 10),
  add constraint developer_apps_scopes_len check (array_length(scopes, 1) is null or array_length(scopes, 1) <= 20),
  add constraint developer_apps_scopes_valid check (scopes <@ public.gh_oauth_available_scopes());

alter table public.developer_apps enable row level security;
alter table public.developer_apps force row level security;
-- No direct select/insert/update/delete policy for developer_apps at all —
-- see design notes above. Every access path is one of the RPCs below.

create table if not exists public.oauth_authorization_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  app_id uuid not null references public.developer_apps(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  redirect_uri text not null,
  scopes text[] not null default '{}',
  code_challenge text,
  code_challenge_method text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create index if not exists oauth_authorization_codes_app_id_idx on public.oauth_authorization_codes (app_id);

alter table public.oauth_authorization_codes enable row level security;
alter table public.oauth_authorization_codes force row level security;
-- No direct client policy — codes are minted and consumed only by the RPCs.

create table if not exists public.oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.developer_apps(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  access_token_hash text not null unique,
  refresh_token_hash text unique,
  scopes text[] not null default '{}',
  access_expires_at timestamptz not null,
  refresh_expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists oauth_tokens_app_id_idx on public.oauth_tokens (app_id);
create index if not exists oauth_tokens_user_id_idx on public.oauth_tokens (user_id);
-- At most one ACTIVE (non-revoked) grant per app+user — re-authorizing an
-- already-connected app updates that one row instead of piling up rows, so
-- "Connected Apps" always shows one entry per app a player has approved.
create unique index if not exists oauth_tokens_active_app_user_idx
  on public.oauth_tokens (app_id, user_id) where revoked_at is null;

alter table public.oauth_tokens enable row level security;
alter table public.oauth_tokens force row level security;
-- No direct client policy — tokens are minted/read/revoked only by the RPCs.

create table if not exists public.oauth_events (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.developer_apps(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists oauth_events_app_id_idx on public.oauth_events (app_id, created_at desc);

alter table public.oauth_events enable row level security;
alter table public.oauth_events force row level security;
-- No direct client policy — written by the RPCs, read via gh_list_app_events.

/* --------------------------- Small shared helper ------------------------ */

create or replace function public.gh_oauth_hash(p_value text)
returns text
language sql
immutable
as $$
  select encode(sha256(convert_to(p_value, 'UTF8')), 'hex');
$$;

-- 64 hex characters from two concatenated random UUIDs (~244 bits of
-- cryptographically-random entropy) — avoids depending on the pgcrypto
-- extension's gen_random_bytes(), since gen_random_uuid() is core Postgres.
create or replace function public.gh_oauth_random_token()
returns text
language sql
volatile
as $$
  select replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
$$;

/* ------------------------- Developer-facing RPCs ------------------------ */

-- The signed-in developer's own apps for the "Keys & Apps" dashboard.
-- Deliberately returns json (not table columns) so it's easy to widen the
-- shape later without a client migration; every field here is safe to show
-- the owner (no secret hashes).
create or replace function public.gh_list_my_apps()
returns setof json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'id', id, 'name', name, 'description', description, 'logo', logo,
    'homepageUrl', homepage_url, 'privacyUrl', privacy_url, 'tosUrl', tos_url,
    'redirectUris', redirect_uris, 'webhookUrl', webhook_url, 'scopes', scopes,
    'clientId', client_id, 'clientSecretLast4', client_secret_last4,
    'sandboxApiKeyLast4', sandbox_api_key_last4, 'sandboxApiKeyCreatedAt', sandbox_api_key_created_at,
    'liveApiKeyLast4', live_api_key_last4, 'liveApiKeyCreatedAt', live_api_key_created_at,
    'liveKeyRequestedAt', live_key_requested_at,
    'createdAt', created_at, 'updatedAt', updated_at
  )
  from public.developer_apps
  where owner_id = auth.uid()
  order by created_at desc;
$$;

-- Shared validation for create/update — raises a descriptive exception
-- rather than silently truncating or dropping bad input.
create or replace function public.gh_oauth_validate_app_input(p_redirect_uris text[], p_scopes text[])
returns void
language plpgsql
immutable
as $$
declare
  v_uri text;
begin
  if array_length(p_redirect_uris, 1) is not null then
    foreach v_uri in array p_redirect_uris loop
      if v_uri !~* '^https://' and v_uri !~* '^http://localhost' and v_uri !~* '^http://127\.0\.0\.1' then
        raise exception 'Redirect URI "%" must start with https:// (http://localhost is allowed for local testing).', v_uri;
      end if;
    end loop;
  end if;
  if not (p_scopes <@ public.gh_oauth_available_scopes()) then
    raise exception 'Unknown scope requested. Allowed scopes: %', array_to_string(public.gh_oauth_available_scopes(), ', ');
  end if;
end;
$$;

create or replace function public.gh_create_app(
  p_name text,
  p_description text,
  p_logo text,
  p_homepage_url text,
  p_privacy_url text,
  p_tos_url text,
  p_redirect_uris text[],
  p_webhook_url text,
  p_scopes text[]
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid := auth.uid();
  v_client_id text;
  v_client_secret text;
  v_sandbox_key text;
  v_app_count int;
  v_row public.developer_apps;
begin
  if v_owner is null then
    raise exception 'You must be signed in to create an app.';
  end if;
  if p_name is null or char_length(trim(p_name)) < 3 then
    raise exception 'Name your app (3+ characters).';
  end if;

  select count(*) into v_app_count from public.developer_apps where owner_id = v_owner;
  if v_app_count >= 20 then
    raise exception 'You have reached the limit of 20 apps per account. Delete an existing app to create a new one.';
  end if;

  perform public.gh_oauth_validate_app_input(coalesce(p_redirect_uris, '{}'), coalesce(p_scopes, '{}'));

  v_client_id := 'gh_client_' || replace(gen_random_uuid()::text, '-', '');
  v_client_secret := 'gh_secret_' || public.gh_oauth_random_token();
  v_sandbox_key := 'gh_test_' || public.gh_oauth_random_token();

  insert into public.developer_apps (
    owner_id, name, description, logo, homepage_url, privacy_url, tos_url,
    redirect_uris, webhook_url, scopes, client_id, client_secret_hash, client_secret_last4,
    sandbox_api_key_hash, sandbox_api_key_last4
  ) values (
    v_owner, trim(p_name), coalesce(trim(p_description), ''), p_logo,
    nullif(trim(coalesce(p_homepage_url, '')), ''), nullif(trim(coalesce(p_privacy_url, '')), ''),
    nullif(trim(coalesce(p_tos_url, '')), ''), coalesce(p_redirect_uris, '{}'),
    nullif(trim(coalesce(p_webhook_url, '')), ''), coalesce(p_scopes, '{}'),
    v_client_id, public.gh_oauth_hash(v_client_secret), right(v_client_secret, 4),
    public.gh_oauth_hash(v_sandbox_key), right(v_sandbox_key, 4)
  )
  returning * into v_row;

  insert into public.oauth_events (app_id, user_id, event, detail)
  values (v_row.id, v_owner, 'app_created', v_row.name);

  return json_build_object(
    'app', json_build_object(
      'id', v_row.id, 'name', v_row.name, 'description', v_row.description, 'logo', v_row.logo,
      'homepageUrl', v_row.homepage_url, 'privacyUrl', v_row.privacy_url, 'tosUrl', v_row.tos_url,
      'redirectUris', v_row.redirect_uris, 'webhookUrl', v_row.webhook_url, 'scopes', v_row.scopes,
      'clientId', v_row.client_id, 'clientSecretLast4', v_row.client_secret_last4,
      'sandboxApiKeyLast4', v_row.sandbox_api_key_last4, 'sandboxApiKeyCreatedAt', v_row.sandbox_api_key_created_at,
      'liveApiKeyLast4', v_row.live_api_key_last4, 'liveApiKeyCreatedAt', v_row.live_api_key_created_at,
      'liveKeyRequestedAt', v_row.live_key_requested_at,
      'createdAt', v_row.created_at, 'updatedAt', v_row.updated_at
    ),
    'clientSecret', v_client_secret,
    'sandboxApiKey', v_sandbox_key
  );
end;
$$;

create or replace function public.gh_update_app(
  p_app_id uuid,
  p_name text,
  p_description text,
  p_logo text,
  p_homepage_url text,
  p_privacy_url text,
  p_tos_url text,
  p_redirect_uris text[],
  p_webhook_url text,
  p_scopes text[]
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.developer_apps;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to edit an app.';
  end if;
  if p_name is null or char_length(trim(p_name)) < 3 then
    raise exception 'Name your app (3+ characters).';
  end if;

  perform public.gh_oauth_validate_app_input(coalesce(p_redirect_uris, '{}'), coalesce(p_scopes, '{}'));

  update public.developer_apps set
    name = trim(p_name),
    description = coalesce(trim(p_description), ''),
    logo = p_logo,
    homepage_url = nullif(trim(coalesce(p_homepage_url, '')), ''),
    privacy_url = nullif(trim(coalesce(p_privacy_url, '')), ''),
    tos_url = nullif(trim(coalesce(p_tos_url, '')), ''),
    redirect_uris = coalesce(p_redirect_uris, '{}'),
    webhook_url = nullif(trim(coalesce(p_webhook_url, '')), ''),
    scopes = coalesce(p_scopes, '{}'),
    updated_at = now()
  where id = p_app_id and owner_id = auth.uid()
  returning * into v_row;

  if v_row.id is null then
    raise exception 'App not found or you do not have access to it.';
  end if;

  return json_build_object(
    'id', v_row.id, 'name', v_row.name, 'description', v_row.description, 'logo', v_row.logo,
    'homepageUrl', v_row.homepage_url, 'privacyUrl', v_row.privacy_url, 'tosUrl', v_row.tos_url,
    'redirectUris', v_row.redirect_uris, 'webhookUrl', v_row.webhook_url, 'scopes', v_row.scopes,
    'clientId', v_row.client_id, 'clientSecretLast4', v_row.client_secret_last4,
    'sandboxApiKeyLast4', v_row.sandbox_api_key_last4, 'sandboxApiKeyCreatedAt', v_row.sandbox_api_key_created_at,
    'liveApiKeyLast4', v_row.live_api_key_last4, 'liveApiKeyCreatedAt', v_row.live_api_key_created_at,
    'liveKeyRequestedAt', v_row.live_key_requested_at,
    'createdAt', v_row.created_at, 'updatedAt', v_row.updated_at
  );
end;
$$;

create or replace function public.gh_delete_app(p_app_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to delete an app.';
  end if;
  delete from public.developer_apps where id = p_app_id and owner_id = auth.uid()
  returning id into v_deleted;
  if v_deleted is null then
    raise exception 'App not found or you do not have access to it.';
  end if;
end;
$$;

create or replace function public.gh_regenerate_client_secret(p_app_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret text := 'gh_secret_' || public.gh_oauth_random_token();
  v_updated uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to manage an app.';
  end if;
  update public.developer_apps
    set client_secret_hash = public.gh_oauth_hash(v_secret),
        client_secret_last4 = right(v_secret, 4),
        updated_at = now()
    where id = p_app_id and owner_id = auth.uid()
    returning id into v_updated;
  if v_updated is null then
    raise exception 'App not found or you do not have access to it.';
  end if;
  insert into public.oauth_events (app_id, user_id, event) values (p_app_id, auth.uid(), 'secret_regenerated');
  return json_build_object('clientSecret', v_secret);
end;
$$;

create or replace function public.gh_regenerate_api_key(p_app_id uuid, p_env text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
  v_updated uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to manage an app.';
  end if;
  if p_env <> 'sandbox' then
    -- Live keys stay waitlisted until Public Beta — see
    -- gh_request_live_key_access. There is nothing to regenerate yet.
    raise exception 'Live keys are not available yet — request access instead, it opens with Public Beta.';
  end if;

  v_key := 'gh_test_' || public.gh_oauth_random_token();
  update public.developer_apps
    set sandbox_api_key_hash = public.gh_oauth_hash(v_key),
        sandbox_api_key_last4 = right(v_key, 4),
        sandbox_api_key_created_at = now(),
        updated_at = now()
    where id = p_app_id and owner_id = auth.uid()
    returning id into v_updated;
  if v_updated is null then
    raise exception 'App not found or you do not have access to it.';
  end if;
  insert into public.oauth_events (app_id, user_id, event, detail) values (p_app_id, auth.uid(), 'api_key_regenerated', p_env);
  return json_build_object('apiKey', v_key);
end;
$$;

create or replace function public.gh_request_live_key_access(p_app_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.developer_apps;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to manage an app.';
  end if;
  update public.developer_apps
    set live_key_requested_at = coalesce(live_key_requested_at, now())
    where id = p_app_id and owner_id = auth.uid()
    returning * into v_row;
  if v_row.id is null then
    raise exception 'App not found or you do not have access to it.';
  end if;
  return json_build_object('liveKeyRequestedAt', v_row.live_key_requested_at);
end;
$$;

create or replace function public.gh_list_app_events(p_app_id uuid)
returns setof json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object('event', e.event, 'detail', e.detail, 'createdAt', e.created_at)
  from public.oauth_events e
  join public.developer_apps a on a.id = e.app_id
  where e.app_id = p_app_id and a.owner_id = auth.uid()
  order by e.created_at desc
  limit 50;
$$;

/* ---------------------------- OAuth protocol ----------------------------- */

-- Public branding lookup for the consent screen — any signed-in visitor
-- needs to see a REQUESTING app's name/logo/homepage by client_id alone,
-- the same way every "Sign in with X" consent screen works. Exposes nothing
-- else (no redirect_uris, no scopes config, no secrets).
create or replace function public.gh_get_oauth_app_public_info(p_client_id text)
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'clientId', client_id, 'name', name, 'description', description,
    'logo', logo, 'homepageUrl', homepage_url
  )
  from public.developer_apps
  where client_id = p_client_id
  limit 1;
$$;

-- Called by the signed-in resource owner's browser when they approve (or the
-- consent screen approves on their behalf after they click "Allow").
create or replace function public.gh_oauth_authorize(
  p_client_id text,
  p_redirect_uri text,
  p_scopes text[],
  p_code_challenge text,
  p_code_challenge_method text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_app public.developer_apps;
  v_code text;
begin
  if v_user is null then
    raise exception 'You must be signed in to approve an app.';
  end if;

  select * into v_app from public.developer_apps where client_id = p_client_id;
  if v_app.id is null then
    raise exception 'Unknown application.';
  end if;
  if not (p_redirect_uri = any(v_app.redirect_uris)) then
    raise exception 'This app''s redirect URI is not registered.';
  end if;
  if array_length(p_scopes, 1) is not null and not (p_scopes <@ v_app.scopes) then
    raise exception 'This app is requesting access it is not configured for.';
  end if;
  if p_code_challenge is not null and p_code_challenge_method not in ('S256', 'plain') then
    raise exception 'Unsupported code_challenge_method.';
  end if;

  v_code := 'gh_ac_' || public.gh_oauth_random_token();

  insert into public.oauth_authorization_codes (
    code_hash, app_id, user_id, redirect_uri, scopes, code_challenge, code_challenge_method, expires_at
  ) values (
    public.gh_oauth_hash(v_code), v_app.id, v_user, p_redirect_uri, coalesce(p_scopes, '{}'),
    p_code_challenge, p_code_challenge_method, now() + interval '10 minutes'
  );

  insert into public.oauth_events (app_id, user_id, event) values (v_app.id, v_user, 'authorized');

  return json_build_object('code', v_code);
end;
$$;

-- The token endpoint. Called by the third-party app's OWN backend server
-- (no browser session, no auth.uid()) — see app/api/oauth/token/route.ts.
-- Authenticates the caller itself via client_id/client_secret, and returns
-- `{"error": "..."}` (RFC 6749 §5.2 shape) instead of raising, so the route
-- handler can pass a spec-correct error straight through.
create or replace function public.gh_oauth_token(
  p_grant_type text,
  p_client_id text,
  p_client_secret text,
  p_code text,
  p_redirect_uri text,
  p_code_verifier text,
  p_refresh_token text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app public.developer_apps;
  v_auth_code public.oauth_authorization_codes;
  v_existing_token public.oauth_tokens;
  v_access_token text;
  v_refresh_token text;
  v_computed_challenge text;
begin
  if p_client_id is null or p_client_secret is null then
    return json_build_object('error', 'invalid_client', 'error_description', 'client_id and client_secret are required.');
  end if;

  select * into v_app from public.developer_apps where client_id = p_client_id;
  if v_app.id is null or v_app.client_secret_hash <> public.gh_oauth_hash(p_client_secret) then
    return json_build_object('error', 'invalid_client', 'error_description', 'Unknown client_id or incorrect client_secret.');
  end if;

  if p_grant_type = 'authorization_code' then
    if p_code is null or p_redirect_uri is null then
      return json_build_object('error', 'invalid_request', 'error_description', 'code and redirect_uri are required.');
    end if;

    select * into v_auth_code from public.oauth_authorization_codes
      where code_hash = public.gh_oauth_hash(p_code) and app_id = v_app.id;

    if v_auth_code.id is null then
      return json_build_object('error', 'invalid_grant', 'error_description', 'Unknown or already-used authorization code.');
    end if;
    if v_auth_code.used_at is not null then
      return json_build_object('error', 'invalid_grant', 'error_description', 'This authorization code has already been used.');
    end if;
    if v_auth_code.expires_at < now() then
      return json_build_object('error', 'invalid_grant', 'error_description', 'This authorization code has expired.');
    end if;
    if v_auth_code.redirect_uri <> p_redirect_uri then
      return json_build_object('error', 'invalid_grant', 'error_description', 'redirect_uri does not match the one used to request this code.');
    end if;

    if v_auth_code.code_challenge is not null then
      if p_code_verifier is null then
        return json_build_object('error', 'invalid_grant', 'error_description', 'code_verifier is required for this authorization code.');
      end if;
      if v_auth_code.code_challenge_method = 'plain' then
        v_computed_challenge := p_code_verifier;
      else
        v_computed_challenge := replace(replace(replace(
          encode(sha256(convert_to(p_code_verifier, 'UTF8')), 'base64'),
          '+', '-'), '/', '_'), '=', '');
      end if;
      if v_computed_challenge <> v_auth_code.code_challenge then
        return json_build_object('error', 'invalid_grant', 'error_description', 'code_verifier does not match.');
      end if;
    end if;

    update public.oauth_authorization_codes set used_at = now() where id = v_auth_code.id;

    v_access_token := 'gh_at_' || public.gh_oauth_random_token();
    v_refresh_token := 'gh_rt_' || public.gh_oauth_random_token();

    insert into public.oauth_tokens (app_id, user_id, access_token_hash, refresh_token_hash, scopes, access_expires_at, refresh_expires_at)
    values (v_app.id, v_auth_code.user_id, public.gh_oauth_hash(v_access_token), public.gh_oauth_hash(v_refresh_token),
            v_auth_code.scopes, now() + interval '1 hour', now() + interval '180 days')
    on conflict (app_id, user_id) where revoked_at is null
    do update set
      access_token_hash = excluded.access_token_hash,
      refresh_token_hash = excluded.refresh_token_hash,
      scopes = excluded.scopes,
      access_expires_at = excluded.access_expires_at,
      refresh_expires_at = excluded.refresh_expires_at,
      created_at = now(),
      last_used_at = null;

    insert into public.oauth_events (app_id, user_id, event) values (v_app.id, v_auth_code.user_id, 'token_issued');

    return json_build_object(
      'access_token', v_access_token, 'refresh_token', v_refresh_token,
      'token_type', 'Bearer', 'expires_in', 3600, 'scope', array_to_string(v_auth_code.scopes, ' ')
    );

  elsif p_grant_type = 'refresh_token' then
    if p_refresh_token is null then
      return json_build_object('error', 'invalid_request', 'error_description', 'refresh_token is required.');
    end if;

    select * into v_existing_token from public.oauth_tokens
      where refresh_token_hash = public.gh_oauth_hash(p_refresh_token) and app_id = v_app.id;

    if v_existing_token.id is null or v_existing_token.revoked_at is not null then
      return json_build_object('error', 'invalid_grant', 'error_description', 'Unknown or revoked refresh token.');
    end if;
    if v_existing_token.refresh_expires_at is not null and v_existing_token.refresh_expires_at < now() then
      return json_build_object('error', 'invalid_grant', 'error_description', 'This refresh token has expired.');
    end if;

    v_access_token := 'gh_at_' || public.gh_oauth_random_token();
    v_refresh_token := 'gh_rt_' || public.gh_oauth_random_token();

    update public.oauth_tokens set
      access_token_hash = public.gh_oauth_hash(v_access_token),
      refresh_token_hash = public.gh_oauth_hash(v_refresh_token),
      access_expires_at = now() + interval '1 hour',
      refresh_expires_at = now() + interval '180 days',
      last_used_at = now()
    where id = v_existing_token.id;

    insert into public.oauth_events (app_id, user_id, event) values (v_app.id, v_existing_token.user_id, 'token_refreshed');

    return json_build_object(
      'access_token', v_access_token, 'refresh_token', v_refresh_token,
      'token_type', 'Bearer', 'expires_in', 3600, 'scope', array_to_string(v_existing_token.scopes, ' ')
    );

  else
    return json_build_object('error', 'unsupported_grant_type', 'error_description', 'Use authorization_code or refresh_token.');
  end if;
end;
$$;

-- The userinfo endpoint. Also called by the third-party app's backend with a
-- bearer access token — see app/api/oauth/userinfo/route.ts.
create or replace function public.gh_oauth_userinfo(p_access_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token public.oauth_tokens;
  v_meta jsonb;
  v_email text;
  v_result jsonb;
begin
  if p_access_token is null then
    return json_build_object('error', 'invalid_token');
  end if;

  select * into v_token from public.oauth_tokens where access_token_hash = public.gh_oauth_hash(p_access_token);
  if v_token.id is null or v_token.revoked_at is not null or v_token.access_expires_at < now() then
    return json_build_object('error', 'invalid_token');
  end if;

  update public.oauth_tokens set last_used_at = now() where id = v_token.id;
  insert into public.oauth_events (app_id, user_id, event) values (v_token.app_id, v_token.user_id, 'userinfo_accessed');

  select raw_user_meta_data, email into v_meta, v_email from auth.users where id = v_token.user_id;
  v_result := jsonb_build_object('sub', v_token.user_id);

  if 'profile:read' = any(v_token.scopes) then
    v_result := v_result || jsonb_build_object(
      'display_name', coalesce(
        nullif(trim(v_meta ->> 'display_name'), ''), nullif(trim(v_meta ->> 'full_name'), ''),
        nullif(trim(v_meta ->> 'name'), ''), nullif(trim(v_meta ->> 'preferred_username'), ''),
        nullif(split_part(v_email, '@', 1), ''), 'Player'
      ),
      'gamer_tag', v_meta ->> 'gamer_tag',
      'avatar_url', v_meta ->> 'avatar_data_url',
      'bio', v_meta ->> 'bio',
      'favorite_platform', v_meta ->> 'favorite_platform',
      'favorite_genre', v_meta ->> 'favorite_genre',
      'play_style', v_meta ->> 'play_style'
    );
  end if;

  if 'email:read' = any(v_token.scopes) then
    v_result := v_result || jsonb_build_object('email', v_email);
  end if;

  if 'posts:read' = any(v_token.scopes) then
    v_result := v_result || jsonb_build_object('posts', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', id, 'slug', slug, 'title', title, 'excerpt', excerpt, 'createdAt', created_at
      ) order by created_at desc), '[]'::jsonb)
      from (select * from public.blog_posts where author_id = v_token.user_id order by created_at desc limit 20) p
    ));
  end if;

  if 'designs:read' = any(v_token.scopes) then
    v_result := v_result || jsonb_build_object('designs', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', id, 'title', title, 'category', category, 'createdAt', created_at
      ) order by created_at desc), '[]'::jsonb)
      from (select * from public.design_suggestions where author_id = v_token.user_id order by created_at desc limit 20) d
    ));
  end if;

  return v_result;
end;
$$;

create or replace function public.gh_oauth_revoke(p_client_id text, p_client_secret text, p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app public.developer_apps;
begin
  if p_client_id is null or p_client_secret is null or p_token is null then
    return json_build_object('error', 'invalid_request');
  end if;
  select * into v_app from public.developer_apps where client_id = p_client_id;
  if v_app.id is null or v_app.client_secret_hash <> public.gh_oauth_hash(p_client_secret) then
    return json_build_object('error', 'invalid_client');
  end if;
  update public.oauth_tokens set revoked_at = now()
    where app_id = v_app.id
      and (access_token_hash = public.gh_oauth_hash(p_token) or refresh_token_hash = public.gh_oauth_hash(p_token))
      and revoked_at is null;
  return json_build_object('revoked', true);
end;
$$;

/* --------------------------- End-user-facing RPCs ------------------------ */

-- "Connected Apps": every app the signed-in player has personally approved,
-- for a Settings-style panel that lets them see and revoke access — the
-- same idea as GitHub/Google's "Third-party apps" page.
create or replace function public.gh_list_connected_apps()
returns setof json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'appId', a.id, 'name', a.name, 'logo', a.logo, 'homepageUrl', a.homepage_url,
    'scopes', t.scopes, 'connectedAt', t.created_at, 'lastUsedAt', t.last_used_at
  )
  from public.oauth_tokens t
  join public.developer_apps a on a.id = t.app_id
  where t.user_id = auth.uid() and t.revoked_at is null
  order by t.created_at desc;
$$;

create or replace function public.gh_revoke_connected_app(p_app_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;
  update public.oauth_tokens set revoked_at = now()
    where app_id = p_app_id and user_id = auth.uid() and revoked_at is null;
  insert into public.oauth_events (app_id, user_id, event) values (p_app_id, auth.uid(), 'token_revoked');
end;
$$;
