-- Security patch for public.blog_posts.
--
-- Run this in the Supabase SQL editor (or `supabase db push`) AFTER
-- 0001_blog_posts.sql has been applied. Safe to re-run.
--
-- What this fixes:
-- 1. Author spoofing: publishUserBlogPost() (lib/user-posts.ts) sends
--    author_name/author_initials as plain client-supplied strings. RLS only
--    checked auth.uid() = author_id, not that the name actually matches the
--    signed-in user — so a crafted request (bypassing the UI) could publish
--    a post under someone else's author_id-less display name, impersonating
--    another player. A trigger now derives both fields server-side from the
--    user's own auth profile, using the same precedence the UI already uses
--    (components/providers/auth-provider.tsx: display_name > full_name >
--    name > preferred_username > email prefix > "Player"), and ignores
--    whatever the client sent.
-- 2. Missing input bounds: title/excerpt/category/slug/content had no size
--    limits, so a single row could carry arbitrarily large payloads.
-- 3. RLS bypass for the table owner: `force row level security` closes the
--    gap where the owning Postgres role (not just other users) would
--    otherwise skip RLS.

create or replace function public.blog_posts_set_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  name text;
  initials text;
  words text[];
begin
  select raw_user_meta_data into meta from auth.users where id = new.author_id;

  name := nullif(trim(meta ->> 'display_name'), '');
  if name is null then name := nullif(trim(meta ->> 'full_name'), ''); end if;
  if name is null then name := nullif(trim(meta ->> 'name'), ''); end if;
  if name is null then name := nullif(trim(meta ->> 'preferred_username'), ''); end if;
  if name is null then
    select nullif(split_part(email, '@', 1), '') into name from auth.users where id = new.author_id;
  end if;
  if name is null then name := 'Player'; end if;

  words := (select array_agg(w) from unnest(string_to_array(trim(name), ' ')) w where w <> '');
  if words is null or array_length(words, 1) is null then
    initials := 'GH';
  else
    initials := '';
    for i in 1 .. least(array_length(words, 1), 2) loop
      initials := initials || upper(left(words[i], 1));
    end loop;
  end if;

  new.author_name := name;
  new.author_initials := initials;
  return new;
end;
$$;

drop trigger if exists blog_posts_set_author_trigger on public.blog_posts;
create trigger blog_posts_set_author_trigger
  before insert on public.blog_posts
  for each row execute function public.blog_posts_set_author();

-- Bound every free-text field so one row can't carry an oversized payload.
alter table public.blog_posts
  drop constraint if exists blog_posts_slug_format,
  drop constraint if exists blog_posts_title_len,
  drop constraint if exists blog_posts_excerpt_len,
  drop constraint if exists blog_posts_category_len,
  drop constraint if exists blog_posts_content_is_array,
  drop constraint if exists blog_posts_content_size,
  drop constraint if exists blog_posts_cover_image_size;

alter table public.blog_posts
  add constraint blog_posts_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  add constraint blog_posts_title_len check (char_length(title) between 1 and 200),
  add constraint blog_posts_excerpt_len check (char_length(excerpt) <= 500),
  add constraint blog_posts_category_len check (char_length(category) <= 60),
  add constraint blog_posts_content_is_array check (jsonb_typeof(content) = 'array'),
  add constraint blog_posts_content_size check (pg_column_size(content) <= 2000000),
  -- Cover images are compressed base64 data URLs (see lib/images.ts); 8MB of
  -- base64 text comfortably covers that while still capping row size.
  add constraint blog_posts_cover_image_size check (cover_image is null or char_length(cover_image) <= 8000000);

-- Enforce RLS even for the table owner (defense in depth).
alter table public.blog_posts force row level security;
