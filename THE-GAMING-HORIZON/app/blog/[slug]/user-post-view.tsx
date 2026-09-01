'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CalendarClock, Clock3, PenSquare, Trash2 } from 'lucide-react'
import { deleteUserBlogPost, getUserBlogPost, isPostLive, parseImageParagraph, type UserBlogPost } from '@/lib/user-posts'
import { countWords, isHtmlBlock, sanitizeHtml } from '@/lib/rich-content'
import { useAuth } from '@/components/providers/auth-provider'

function readingTime(content: string[]): string {
  return `${Math.max(1, Math.round(countWords(content) / 200))} min read`
}

function formatScheduledFor(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function UserPostView({ slug }: { slug: string }) {
  const [status, setStatus] = useState<'loading' | 'found' | 'missing'>('loading')
  const [post, setPost] = useState<UserBlogPost | null>(null)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for the auth check to finish before fetching: a scheduled post
    // is only readable by its own author (enforced server-side by RLS), so
    // fetching too early could show "not found" to the owner for a moment.
    if (authLoading) return
    let cancelled = false
    getUserBlogPost(slug).then((found) => {
      if (cancelled) return
      setPost(found)
      setStatus(found ? 'found' : 'missing')
    })
    return () => {
      cancelled = true
    }
  }, [slug, authLoading])

  if (status === 'loading') return null

  const isOwner = Boolean(post && user && user.id === post.authorId)
  const scheduled = Boolean(post && !isPostLive(post))

  if (status === 'missing' || !post || (scheduled && !isOwner)) {
    return (
      <main className="px-4 pb-24 pt-[calc(var(--banner-h,0px)+var(--nav-h,64px)+3rem)] sm:pt-[calc(var(--banner-h,0px)+var(--nav-h,64px)+4rem)]">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-heading text-3xl font-bold">Post not found</h1>
          <p className="mt-4 text-muted-foreground">
            This post doesn&apos;t exist, or it&apos;s no longer available.
          </p>
          <Link href="/blog" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to the blog
          </Link>
        </div>
      </main>
    )
  }

  async function handleDelete() {
    if (!window.confirm('Delete this post? This can\u2019t be undone.')) return
    await deleteUserBlogPost(post!.slug)
    router.push('/blog')
    router.refresh()
  }

  return (
    <main className="px-4 pb-24 pt-[calc(var(--banner-h,0px)+var(--nav-h,64px)+3rem)] sm:pt-[calc(var(--banner-h,0px)+var(--nav-h,64px)+4rem)]">
      <article className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/blog" className="group inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Back to the blog
          </Link>
          {isOwner && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-destructive/30 px-3 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" /> Delete post
            </button>
          )}
        </div>
        <header className="mt-8">
          {scheduled && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
              <CalendarClock className="mt-0.5 size-4 shrink-0" />
              <span>This post is scheduled and will go live on {formatScheduledFor(post.scheduledFor!)}. Only you can see it until then.</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--accent-1))]">
            <PenSquare className="size-4" />
            {post.category}
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="inline-flex items-center gap-1.5 normal-case tracking-normal text-muted-foreground">
              <Clock3 className="size-3.5" />
              {readingTime(post.content)}
            </span>

          </div>
          <h1 className="mt-5 text-balance font-heading text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">{post.title}</h1>
          <p className="mt-6 text-pretty text-xl leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            By {post.authorName} · {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.title} className="mt-8 max-h-[420px] w-full rounded-3xl object-cover" />
        )}

        <div className="mt-12 space-y-10">
          <section className="glass rounded-3xl p-6 sm:p-8">
            <div className="gh-rich-content space-y-4 text-base leading-8 text-muted-foreground [&_a]:text-[rgb(var(--accent-1))] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[rgb(var(--accent-1)/0.4)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_img]:w-full [&_img]:rounded-2xl [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 sm:text-lg">
              {post.content.map((paragraph, i) => {
                // Older posts store plain-text paragraphs (with a markdown-style
                // image line); posts from the rich-text composer store sanitized
                // HTML blocks directly.
                if (isHtmlBlock(paragraph)) {
                  return <div key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(paragraph) }} />
                }
                const image = parseImageParagraph(paragraph)
                if (image) {
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={image.src} alt={image.alt || post.title} className="w-full rounded-2xl" />
                  )
                }
                return <p key={i}>{paragraph}</p>
              })}
            </div>
          </section>
        </div>
      </article>
    </main>
  )
}
