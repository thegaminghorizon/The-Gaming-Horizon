-- Community blog posts, stored centrally in Supabase so a published post is
-- visible to every player (not just the device that created it).
--
-- Run this once in the Supabase SQL editor for this project (or via the
-- Supabase CLI: `supabase db push`).

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  category text not null default 'Community',
  content jsonb not null default '[]'::jsonb,
  cover_image text,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  author_initials text not null,
  created_at timestamptz not null default now(),
  -- If set and in the future, the post is scheduled rather than live yet.
  scheduled_for timestamptz
);

create index if not exists blog_posts_author_id_idx on public.blog_posts (author_id);
create index if not exists blog_posts_created_at_idx on public.blog_posts (created_at desc);

alter table public.blog_posts enable row level security;

-- Everyone (including signed-out visitors) can read live posts. A post that
-- is still scheduled for the future is only readable by its own author.
drop policy if exists "Public can read live posts" on public.blog_posts;
create policy "Public can read live posts"
  on public.blog_posts for select
  using (scheduled_for is null or scheduled_for <= now() or auth.uid() = author_id);

-- Only a signed-in player can publish, and only under their own author id.
drop policy if exists "Authors can publish their own posts" on public.blog_posts;
create policy "Authors can publish their own posts"
  on public.blog_posts for insert
  with check (auth.uid() = author_id);

-- Only the author can delete their own post.
drop policy if exists "Authors can delete their own posts" on public.blog_posts;
create policy "Authors can delete their own posts"
  on public.blog_posts for delete
  using (auth.uid() = author_id);
