-- Real UPI "Support Us" donations.
--
-- Important constraint this whole design works around: UPI has no webhook
-- or callback to a third-party website. When someone scans the QR in
-- lib/support-us.ts and pays from their own banking app, this site is never
-- told that happened. So a contribution always starts as 'pending' with the
-- payer's self-reported UPI transaction reference (UTR); an admin (see
-- public.admins below) checks that reference against the project's own
-- bank/UPI statement by hand and marks it 'verified'. Only a verified row
-- ever grants a supporter badge or appears on the public Supporters Wall —
-- nothing is auto-approved just because someone clicked a button.
--
-- Run this once in the Supabase SQL editor for this project (or via the
-- Supabase CLI: `supabase db push`), same as the earlier migrations here.

-- ---------------------------------------------------------------------
-- Admins: who is allowed to verify contributions.
--
-- Deliberately has NO row-level-security policies at all, so nobody can
-- read or write it from the browser — not even a signed-in admin. The only
-- way in is running SQL directly against this project. The app only ever
-- reads it indirectly, through the SECURITY DEFINER function below.
--
-- To make yourself an admin: Supabase dashboard → Authentication → Users →
-- copy your own user's UID, then run:
--   insert into public.admins (user_id) values ('paste-your-uid-here');
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.am_i_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.am_i_admin() to authenticated;

-- ---------------------------------------------------------------------
-- Contributions
-- ---------------------------------------------------------------------
create table if not exists public.support_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  amount_inr integer not null check (amount_inr >= 49),
  tier_id text not null default 'backer' check (tier_id in ('backer', 'supporter', 'champion', 'legend')),
  client_ref text not null,
  upi_ref text not null check (char_length(trim(upi_ref)) >= 6),
  note text not null default '',
  is_public boolean not null default true,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid references auth.users(id)
);

create index if not exists support_contributions_user_id_idx on public.support_contributions (user_id);
create index if not exists support_contributions_status_idx on public.support_contributions (status);
create index if not exists support_contributions_created_at_idx on public.support_contributions (created_at desc);

-- Recompute the tier from the amount server-side — a client can send
-- whatever tier_id it wants, this always overwrites it — and force every
-- new row to start clean (pending, unverified) no matter what was posted.
create or replace function public.support_contributions_before_insert()
returns trigger
language plpgsql
as $$
begin
  new.tier_id := case
    when new.amount_inr >= 10000 then 'legend'
    when new.amount_inr >= 1000 then 'champion'
    when new.amount_inr >= 500 then 'supporter'
    else 'backer'
  end;
  new.status := 'pending';
  new.verified_at := null;
  new.verified_by := null;
  new.rejection_reason := null;
  return new;
end;
$$;

drop trigger if exists support_contributions_before_insert on public.support_contributions;
create trigger support_contributions_before_insert
  before insert on public.support_contributions
  for each row execute function public.support_contributions_before_insert();

-- Auto-stamp who verified a contribution and when (never trust a
-- client-supplied verified_at/verified_by), clear the stamp again if a row
-- ever moves back out of 'verified', and keep the payment-identifying
-- fields immutable after submission — only status/rejection_reason/
-- is_public can change once a contribution exists.
create or replace function public.support_contributions_before_update()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'verified' and old.status is distinct from 'verified' then
    new.verified_at := now();
    new.verified_by := auth.uid();
    new.rejection_reason := null;
  elsif new.status <> 'verified' then
    new.verified_at := null;
    new.verified_by := null;
  end if;
  new.amount_inr := old.amount_inr;
  new.tier_id := old.tier_id;
  new.user_id := old.user_id;
  new.upi_ref := old.upi_ref;
  new.client_ref := old.client_ref;
  new.display_name := old.display_name;
  new.created_at := old.created_at;
  return new;
end;
$$;

drop trigger if exists support_contributions_before_update on public.support_contributions;
create trigger support_contributions_before_update
  before update on public.support_contributions
  for each row execute function public.support_contributions_before_update();

alter table public.support_contributions enable row level security;

-- Payers can submit a contribution, only under their own user id.
drop policy if exists "Users can submit their own contribution" on public.support_contributions;
create policy "Users can submit their own contribution"
  on public.support_contributions for insert
  with check (auth.uid() = user_id);

-- Payers can see their own contributions, to show status on their account page.
drop policy if exists "Users can read their own contributions" on public.support_contributions;
create policy "Users can read their own contributions"
  on public.support_contributions for select
  using (auth.uid() = user_id);

-- Payers can withdraw a mistaken submission while it's still pending.
drop policy if exists "Users can delete their own pending contribution" on public.support_contributions;
create policy "Users can delete their own pending contribution"
  on public.support_contributions for delete
  using (auth.uid() = user_id and status = 'pending');

-- Admins can see every contribution, to review and verify them.
drop policy if exists "Admins can read all contributions" on public.support_contributions;
create policy "Admins can read all contributions"
  on public.support_contributions for select
  using (public.am_i_admin());

-- Only admins can change a contribution's status.
drop policy if exists "Admins can update contributions" on public.support_contributions;
create policy "Admins can update contributions"
  on public.support_contributions for update
  using (public.am_i_admin())
  with check (public.am_i_admin());

-- ---------------------------------------------------------------------
-- Public Supporters Wall.
--
-- This view is owned by the migration role, not the querying visitor, so
-- (per standard Postgres view semantics) it is evaluated against its own
-- privileges rather than being blocked by the base table's row-level
-- security — the same technique the earlier design_suggestions migration
-- effectively relies on for public reads. That's safe here specifically
-- because the view's WHERE clause hard-codes "verified + opted-in only"
-- and its column list hard-codes "no amount, no UPI reference, no raw user
-- id" — the only columns a visitor should ever see.
-- ---------------------------------------------------------------------
create or replace view public.support_wall as
select id, display_name, tier_id, verified_at
from public.support_contributions
where status = 'verified' and is_public = true
order by verified_at asc;

grant select on public.support_wall to anon, authenticated;
