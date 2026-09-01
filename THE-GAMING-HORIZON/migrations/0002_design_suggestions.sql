-- Community design suggestions (logos, website concepts, UI mockups, etc.)
-- that players can upload and everyone can browse. Same visibility model as
-- blog_posts: stored centrally in Supabase, public to read, author-only to
-- publish/delete.
--
-- Run this once in the Supabase SQL editor for this project (or via the
-- Supabase CLI: `supabase db push`).

create table if not exists public.design_suggestions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'Logo',
  image text not null,
  link text,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  author_initials text not null,
  created_at timestamptz not null default now()
);

create index if not exists design_suggestions_author_id_idx on public.design_suggestions (author_id);
create index if not exists design_suggestions_created_at_idx on public.design_suggestions (created_at desc);

alter table public.design_suggestions enable row level security;

-- Everyone (including signed-out visitors) can browse every submission.
drop policy if exists "Public can read design suggestions" on public.design_suggestions;
create policy "Public can read design suggestions"
  on public.design_suggestions for select
  using (true);

-- Only a signed-in player can submit, and only under their own author id.
drop policy if exists "Authors can submit their own design suggestions" on public.design_suggestions;
create policy "Authors can submit their own design suggestions"
  on public.design_suggestions for insert
  with check (auth.uid() = author_id);

-- Only the author can remove their own submission.
drop policy if exists "Authors can delete their own design suggestions" on public.design_suggestions;
create policy "Authors can delete their own design suggestions"
  on public.design_suggestions for delete
  using (auth.uid() = author_id);
