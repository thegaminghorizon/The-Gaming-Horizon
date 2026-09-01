// User-authored blog posts. These are stored centrally in Supabase (see
// supabase/migrations/0001_blog_posts.sql), so a published post is visible
// to every player, not just the device that created it. Row Level Security
// keeps a scheduled-for-later post private to its author until it goes
// live; everything else is public to read.
//
// Images (cover + inline) are stored as compressed base64 data URLs directly
// on the post, the same technique already used for profile avatars
// (components/profile-editor.tsx). Inline images live inside `content` as
// their own paragraph using standard markdown image syntax
// (`![alt](data:...)`) so a plain-text export or future rich renderer can
// still make sense of them.

import { createClient } from '@/lib/supabase/client'

export const USER_POSTS_EVENT = 'gh:user-blog-posts-changed'

export interface UserBlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  content: string[]
  coverImage?: string
  authorId: string
  authorName: string
  authorInitials: string
  createdAt: string
  /** ISO timestamp. If set and in the future, the post is scheduled rather than live yet. */
  scheduledFor?: string
}

/** Whether a post is currently visible to the public (i.e. not scheduled for the future). */
export function isPostLive(post: UserBlogPost, now: Date = new Date()): boolean {
  return !post.scheduledFor || new Date(post.scheduledFor).getTime() <= now.getTime()
}

const IMAGE_PARAGRAPH_RE = /^!\[([^\]]*)\]\((data:[^)]+)\)$/

export function parseImageParagraph(paragraph: string): { alt: string; src: string } | null {
  const match = IMAGE_PARAGRAPH_RE.exec(paragraph.trim())
  return match ? { alt: match[1], src: match[2] } : null
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

// Row shape as stored in Supabase (snake_case) -> the UserBlogPost shape the
// rest of the app already renders everywhere.
interface BlogPostRow {
  slug: string
  title: string
  excerpt: string
  category: string
  content: unknown
  cover_image: string | null
  author_id: string
  author_name: string
  author_initials: string
  created_at: string
  scheduled_for: string | null
}

function rowToPost(row: BlogPostRow): UserBlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    content: Array.isArray(row.content) ? (row.content as string[]) : [],
    coverImage: row.cover_image ?? undefined,
    authorId: row.author_id,
    authorName: row.author_name,
    authorInitials: row.author_initials,
    createdAt: row.created_at,
    scheduledFor: row.scheduled_for ?? undefined,
  }
}

function notifyChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(USER_POSTS_EVENT))
}

// Newest first, so freshly published posts lead the list. Row Level Security
// on the blog_posts table already limits this to live posts plus (if
// signed in) the current player's own scheduled posts — everyone else's
// posts are visible here regardless of which device published them.
export async function readUserBlogPosts(): Promise<UserBlogPost[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return (data as BlogPostRow[]).map(rowToPost)
}

// Posts by one specific author — used so a signed-in player can always find
// their own posts regardless of what else has been published.
export async function readUserBlogPostsByAuthor(authorId: string): Promise<UserBlogPost[]> {
  const posts = await readUserBlogPosts()
  return posts.filter((post) => post.authorId === authorId)
}

export async function getUserBlogPost(slug: string): Promise<UserBlogPost | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).maybeSingle()
  if (error || !data) return null
  return rowToPost(data as BlogPostRow)
}

// Guarantees a unique slug against both existing user posts and the
// official articles, so a new post never shadows or collides with one.
export async function uniqueSlug(title: string, reservedSlugs: string[]): Promise<string> {
  const base = slugify(title) || 'post'
  const supabase = createClient()
  const { data } = await supabase.from('blog_posts').select('slug').ilike('slug', `${base}%`)
  const taken = new Set([...reservedSlugs, ...((data as { slug: string }[] | null)?.map((row) => row.slug) ?? [])])
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}

export async function publishUserBlogPost(input: {
  title: string
  excerpt: string
  category: string
  content: string[]
  coverImage?: string
  authorId: string
  authorName: string
  authorInitials: string
  reservedSlugs: string[]
  scheduledFor?: string
}): Promise<{ ok: true; post: UserBlogPost } | { ok: false; error: string }> {
  const slug = await uniqueSlug(input.title, input.reservedSlugs)
  const supabase = createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      slug,
      title: input.title.trim(),
      excerpt: input.excerpt.trim(),
      category: input.category.trim() || 'Community',
      content: input.content,
      cover_image: input.coverImage ?? null,
      author_id: input.authorId,
      author_name: input.authorName,
      author_initials: input.authorInitials,
      scheduled_for: input.scheduledFor ?? null,
    })
    .select('*')
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message || 'This post could not be published. Please try again.' }
  }
  notifyChanged()
  return { ok: true, post: rowToPost(data as BlogPostRow) }
}

export async function deleteUserBlogPost(slug: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('blog_posts').delete().eq('slug', slug)
  notifyChanged()
}
