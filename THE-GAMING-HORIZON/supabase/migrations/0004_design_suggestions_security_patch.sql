-- Security patch for public.design_suggestions.
--
-- Run this in the Supabase SQL editor (or `supabase db push`) AFTER
-- 0002_design_suggestions.sql has been applied. Safe to re-run.
--
-- Mirrors 0003_blog_posts_security_patch.sql: this table has the same
-- author-spoofing gap (author_name/author_initials are plain client-supplied
-- strings, see lib/design-suggestions.ts) and the same lack of size bounds
-- on free-text fields and the image payload.

create or replace function public.design_suggestions_set_author()
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

drop trigger if exists design_suggestions_set_author_trigger on public.design_suggestions;
create trigger design_suggestions_set_author_trigger
  before insert on public.design_suggestions
  for each row execute function public.design_suggestions_set_author();

alter table public.design_suggestions
  drop constraint if exists design_suggestions_title_len,
  drop constraint if exists design_suggestions_description_len,
  drop constraint if exists design_suggestions_category_len,
  drop constraint if exists design_suggestions_link_format,
  drop constraint if exists design_suggestions_image_size;

alter table public.design_suggestions
  add constraint design_suggestions_title_len check (char_length(title) between 1 and 200),
  add constraint design_suggestions_description_len check (char_length(description) <= 1000),
  add constraint design_suggestions_category_len check (char_length(category) <= 60),
  add constraint design_suggestions_link_format check (link is null or link ~* '^https?://'),
  -- image is a compressed base64 data URL (see lib/images.ts); 8MB of
  -- base64 text comfortably covers that while still capping row size.
  add constraint design_suggestions_image_size check (char_length(image) <= 8000000);

-- Enforce RLS even for the table owner (defense in depth).
alter table public.design_suggestions force row level security;
