'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CalendarClock, PenSquare, Trash2, UserRound } from 'lucide-react'
import { deleteUserBlogPost, isPostLive, readUserBlogPosts, USER_POSTS_EVENT, type UserBlogPost } from '@/lib/user-posts'
import { countWords } from '@/lib/rich-content'
import { useAuth } from '@/components/providers/auth-provider'
import { createClient } from '@/lib/supabase/client'

function readingTime(content: string[]): string {
  return `${Math.max(1, Math.round(countWords(content) / 200))} min read`
}

function formatScheduledFor(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function PostCard({ post, mine, onDelete }: { post: UserBlogPost; mine: boolean; onDelete: (slug: string) => void }) {
  const scheduled = mine && !isPostLive(post)
  return (
    <div className="relative">
      <Link href={`/blog/${post.slug}`}>
        <article className="glass gh-card-hover group relative h-full overflow-hidden rounded-3xl">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage} alt="" className="h-40 w-full object-cover" />
          ) : (
            <div aria-hidden className="absolute -right-20 -top-20 size-56 rounded-full bg-[rgb(var(--accent-1)/0.12)] blur-3xl transition-transform duration-500 group-hover:scale-125" />
          )}
          <div className="relative p-7">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--accent-1))]">
              <PenSquare className="size-4" />
              {post.category}
              {mine && <span className="rounded-full bg-[rgb(var(--accent-1)/0.14)] px-2 py-0.5 normal-case tracking-normal text-[rgb(var(--accent-1))]">You</span>}
              {scheduled && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 normal-case tracking-normal text-amber-600 dark:text-amber-400">
                  <CalendarClock className="size-3" /> Scheduled
                </span>
              )}
            </div>
            <h2 className="mt-5 font-heading text-2xl font-bold">{post.title}</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{post.excerpt}</p>
            <div className="mt-7 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                {scheduled ? (
                  <>Goes live {formatScheduledFor(post.scheduledFor!)}</>
                ) : (
                  <>By {post.authorName} · {readingTime(post.content)}</>
                )}
              </span>
              <span
                aria-label={`Read ${post.title}`}
                className="inline-flex size-11 items-center justify-center rounded-xl border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.08)] text-[rgb(var(--accent-1))] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
              >
                <ArrowUpRight className="size-5" />
              </span>
            </div>
          </div>
        </article>
      </Link>
      {mine && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onDelete(post.slug)
          }}
          aria-label={`Delete ${post.title}`}
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/70 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  )
}

export function UserBlogPosts() {
  const [posts, setPosts] = useState<UserBlogPost[] | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    let cancelled = false
    const load = () => {
      readUserBlogPosts().then((next) => {
        if (!cancelled) setPosts(next)
      })
    }
    load()
    window.addEventListener(USER_POSTS_EVENT, load)

    // Live-updates the list when anyone (on any device) publishes or
    // removes a post, so the blog doesn't need a manual refresh to show
    // what the rest of the community just posted.
    const supabase = createClient()
    const channel = supabase
      .channel('blog_posts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_posts' }, load)
      .subscribe()

    return () => {
      cancelled = true
      window.removeEventListener(USER_POSTS_EVENT, load)
      supabase.removeChannel(channel)
    }
  }, [])

  function handleDelete(slug: string) {
    if (!window.confirm('Delete this post? This can\u2019t be undone.')) return
    void deleteUserBlogPost(slug)
  }

  // Avoid a hydration flash: render nothing until posts have loaded.
  if (!posts) return null

  // A signed-in player always sees all of their own posts, including ones
  // still scheduled for the future. Everyone else's scheduled posts stay
  // hidden until they actually go live (enforced server-side by RLS too).
  const mine = user ? posts.filter((post) => post.authorId === user.id) : []
  const others = (user ? posts.filter((post) => post.authorId !== user.id) : posts).filter((post) => isPostLive(post))

  if (mine.length === 0 && others.length === 0) return null

  return (
    <div className="mx-auto mt-14 max-w-6xl space-y-14">
      {mine.length > 0 && (
        <div id="your-posts" className="scroll-mt-32">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--accent-1))]">
            <UserRound className="size-4" /> Your posts
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {mine.map((post) => (
              <PostCard key={post.slug} post={post} mine onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--accent-1))]">
            <PenSquare className="size-4" /> From the community
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {others.map((post) => (
              <PostCard key={post.slug} post={post} mine={false} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
