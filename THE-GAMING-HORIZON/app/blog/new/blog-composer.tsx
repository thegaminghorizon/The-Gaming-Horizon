'use client'

import { FormEvent, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CalendarClock, CheckCircle2, ImagePlus, Loader2, PenSquare, ShieldAlert, Sparkles, X } from 'lucide-react'
import { LegalConsent, PreReleaseNotice, buildLegalAcceptance } from '@/components/legal-consent'
import { useAuth } from '@/components/providers/auth-provider'
import { useNotifications } from '@/components/providers/notifications-provider'
import { publishUserBlogPost } from '@/lib/user-posts'
import { htmlToText, sanitizeHtml, splitHtmlIntoBlocks } from '@/lib/rich-content'
import { BLOG_ARTICLES } from '@/lib/blog'
import { GhButton } from '@/components/ui/primitives'
import { RichTextEditor, type RichTextEditorHandle } from '@/components/rich-text-editor'

const RESERVED_SLUGS = BLOG_ARTICLES.map((article) => article.slug)
const CATEGORY_SUGGESTIONS = ['Community', 'Opinion', 'Guide', 'Dev Log', 'Announcement']
const inputClass =
  'rounded-xl border border-border bg-background/65 px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--accent-1)/0.7)] focus:ring-2 focus:ring-[rgb(var(--accent-1)/0.15)]'

// Resizes and compresses an image client-side into a JPEG data URL, the same
// technique already used for profile avatars (components/profile-editor.tsx),
// so a photo from a phone doesn't blow past localStorage's quota.
async function compressImage(file: File, maxDim: number, quality: number): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
  if (file.size > 12 * 1024 * 1024) throw new Error('Please choose an image smaller than 12 MB.')
  const src = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('That image could not be read.'))
      img.src = src
    })
    const scale = Math.min(1, maxDim / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Image processing is unavailable in this browser.')
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    URL.revokeObjectURL(src)
  }
}

// Formats a Date as the local "YYYY-MM-DDTHH:mm" value a <input type="datetime-local"> expects.
function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function BlogComposer() {
  const { user, loading, displayName, initials } = useAuth()
  const { notify } = useNotifications()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [hasBody, setHasBody] = useState(false)
  const [coverImage, setCoverImage] = useState('')
  const [coverBusy, setCoverBusy] = useState(false)
  const [inlineBusy, setInlineBusy] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [error, setError] = useState('')
  const [published, setPublished] = useState<{ slug: string; title: string; scheduledFor?: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const coverInputRef = useRef<HTMLInputElement>(null)
  const inlineInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<RichTextEditorHandle>(null)
  const minScheduleValue = toDatetimeLocalValue(new Date(Date.now() + 5 * 60 * 1000))

  if (loading) return null

  if (!user) {
    return (
      <div className="glass rounded-3xl p-8 text-center md:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
          <PenSquare className="size-6" />
        </span>
        <h2 className="mt-5 font-heading text-2xl font-bold">Sign up to write a post</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Posts are published under your Gaming Horizon profile, so you&apos;ll need a signed-up account before you can write one.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[rgb(var(--accent-1))] px-5 py-3 text-sm font-semibold text-white shadow-lg"
          >
            Create an account
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-muted/60"
          >
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  if (published) {
    const isScheduled = Boolean(published.scheduledFor)
    return (
      <div className="glass rounded-3xl p-8 text-center md:p-12">
        <CheckCircle2 className="mx-auto size-12 text-[rgb(var(--accent-1))]" />
        <h2 className="mt-5 font-heading text-2xl font-bold">{isScheduled ? 'Post scheduled' : 'Post published'}</h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          {isScheduled ? (
            <>
              &ldquo;{published.title}&rdquo; will go live for everyone on{' '}
              {new Date(published.scheduledFor!).toLocaleString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
              . Until then it&apos;s only visible to you, under{' '}
            </>
          ) : (
            <>&ldquo;{published.title}&rdquo; is live in the blog for everyone to see, and always visible to you under{' '}</>
          )}
          <Link href="/blog#your-posts" className="font-medium text-foreground underline underline-offset-2">
            your posts
          </Link>
          .
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href={`/blog/${published.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[rgb(var(--accent-1))] px-5 py-3 text-sm font-semibold text-white shadow-lg">
            View your post
          </Link>
          <Link href="/blog" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-muted/60">
            Back to the blog
          </Link>
        </div>
      </div>
    )
  }

  async function handleCoverFile(file: File | undefined) {
    if (!file) return
    setError('')
    setCoverBusy(true)
    try {
      setCoverImage(await compressImage(file, 1600, 0.78))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That image could not be used.')
    } finally {
      setCoverBusy(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  async function handleInlineFile(file: File | undefined) {
    if (!file) return
    setError('')
    setInlineBusy(true)
    try {
      const dataUrl = await compressImage(file, 1200, 0.75)
      const alt = file.name.replace(/\.[a-z0-9]+$/i, '').replace(/"/g, '')
      editorRef.current?.insertHtml(`<img src="${dataUrl}" alt="${alt}" />`)
      setHasBody(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That image could not be used.')
    } finally {
      setInlineBusy(false)
      if (inlineInputRef.current) inlineInputRef.current.value = ''
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const trimmedTitle = title.trim()
    const trimmedExcerpt = excerpt.trim()
    const sanitizedHtml = sanitizeHtml(editorRef.current?.getHtml() ?? '')
    const blocks = splitHtmlIntoBlocks(sanitizedHtml)

    if (!trimmedTitle || trimmedTitle.length < 6) {
      setError('Give your post a title with at least 6 characters.')
      return
    }
    if (blocks.length === 0) {
      setError('Your post needs some content before it can be published.')
      return
    }
    if (!policyAccepted) {
      setError('Please confirm your post follows the Gaming Horizon content guidelines.')
      return
    }
    if (!legalAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy to publish.')
      return
    }

    let scheduledForIso: string | undefined
    if (scheduleEnabled) {
      if (!scheduledAt) {
        setError('Choose a date and time to schedule this post for.')
        return
      }
      const scheduledDate = new Date(scheduledAt)
      if (Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= Date.now()) {
        setError('Pick a scheduled time in the future.')
        return
      }
      scheduledForIso = scheduledDate.toISOString()
    }

    const fallbackExcerpt = blocks.map(htmlToText).join(' ').trim().slice(0, 160)
    setSubmitting(true)
    const result = await publishUserBlogPost({
      title: trimmedTitle,
      excerpt: trimmedExcerpt || fallbackExcerpt,
      category: category.trim(),
      content: blocks,
      coverImage: coverImage || undefined,
      authorId: user.id,
      authorName: displayName || 'Gaming Horizon player',
      authorInitials: initials || 'GH',
      reservedSlugs: RESERVED_SLUGS,
      scheduledFor: scheduledForIso,
    })

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    buildLegalAcceptance('blog-post', user.email ?? undefined)

    notify({
      title: scheduledForIso ? 'Post scheduled' : 'Post published',
      body: scheduledForIso
        ? `"${result.post.title}" is scheduled to go live on ${new Date(scheduledForIso).toLocaleString()}. It'll publish automatically at that time under the ${category.trim()} category — you can still edit or reschedule it before then.`
        : `"${result.post.title}" is now live in the ${category.trim()} category of the blog for everyone to read. Share the link, or head back to your posts any time to edit it.`,
      icon: 'success',
    })
    setPublished({ slug: result.post.slug, title: result.post.title, scheduledFor: scheduledForIso })
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="glass rounded-3xl p-6 md:p-9">
      <PreReleaseNotice />
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <span>
          Keep it about Gaming Horizon — the platform, its games, your beta experience, or the community. Off-topic posts, and
          especially restricted content (illegal, hateful, sexual, or otherwise against our{' '}
          <Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2">
            Terms of Service
          </Link>
          ), will be removed and can lead to your account being suspended.
        </span>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 className="font-heading text-xl font-bold">Write a new post</h2>
          <p className="text-sm text-muted-foreground">Publishing as {displayName || 'you'}.</p>
        </div>
      </div>

      <div className="mt-7 grid gap-5">
        <label className="grid gap-2 text-sm font-medium">
          Title *
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={6}
            maxLength={120}
            placeholder="e.g. My first week in the Gaming Horizon beta"
            className={`h-12 ${inputClass}`}
          />
        </label>

        <div className="grid gap-2 text-sm font-medium">
          Cover image <span className="font-normal text-muted-foreground">(optional, shown at the top of your post)</span>
          {coverImage ? (
            <div className="relative overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage} alt="Cover preview" className="h-44 w-full object-cover" />
              <button
                type="button"
                onClick={() => setCoverImage('')}
                aria-label="Remove cover image"
                className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/75"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverBusy}
              className="flex h-32 items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/40 text-sm font-medium text-muted-foreground transition-colors hover:border-[rgb(var(--accent-1)/0.5)] hover:text-foreground disabled:opacity-60"
            >
              {coverBusy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              {coverBusy ? 'Processing image…' : 'Upload a cover image'}
            </button>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => void handleCoverFile(e.target.files?.[0])}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Category
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="blog-category-suggestions"
              placeholder="Community"
              className={`h-12 ${inputClass}`}
            />
            <datalist id="blog-category-suggestions">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Excerpt <span className="font-normal text-muted-foreground">(shown on the blog list)</span>
            <input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={160}
              placeholder="A one-line summary of your post"
              className={`h-12 ${inputClass}`}
            />
          </label>
        </div>

        <div className="grid gap-2 text-sm font-medium">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Content *</span>
            <button
              type="button"
              onClick={() => inlineInputRef.current?.click()}
              disabled={inlineBusy}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-[rgb(var(--accent-1)/0.5)] hover:text-foreground disabled:opacity-60"
            >
              {inlineBusy ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
              {inlineBusy ? 'Adding image…' : 'Insert image'}
            </button>
            <input
              ref={inlineInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => void handleInlineFile(e.target.files?.[0])}
            />
          </div>
          <RichTextEditor
            ref={editorRef}
            onChange={(html) => setHasBody(Boolean(html.replace(/<[^>]+>/g, '').trim()) || /<img/i.test(html))}
            placeholder='Write your post here. Use the toolbar for bold, italic, colors, fonts and more. Use "Insert image" to drop a photo in at your cursor.'
          />
        </div>

        <div className="grid gap-2 text-sm font-medium">
          <span>Publishing</span>
          <div className="flex flex-wrap gap-3">
            <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${!scheduleEnabled ? 'border-[rgb(var(--accent-1)/0.6)] bg-[rgb(var(--accent-1)/0.08)]' : 'border-border bg-background/40'}`}>
              <input
                type="radio"
                name="publish-timing"
                checked={!scheduleEnabled}
                onChange={() => setScheduleEnabled(false)}
                className="size-4 accent-[rgb(var(--accent-1))]"
              />
              Publish now
            </label>
            <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${scheduleEnabled ? 'border-[rgb(var(--accent-1)/0.6)] bg-[rgb(var(--accent-1)/0.08)]' : 'border-border bg-background/40'}`}>
              <input
                type="radio"
                name="publish-timing"
                checked={scheduleEnabled}
                onChange={() => setScheduleEnabled(true)}
                className="size-4 accent-[rgb(var(--accent-1))]"
              />
              <CalendarClock className="size-4" />
              Schedule for later
            </label>
          </div>
          {scheduleEnabled && (
            <input
              type="datetime-local"
              value={scheduledAt}
              min={minScheduleValue}
              onChange={(e) => setScheduledAt(e.target.value)}
              required={scheduleEnabled}
              className={`mt-1 h-12 max-w-xs ${inputClass}`}
            />
          )}
          {scheduleEnabled && (
            <p className="text-xs font-normal text-muted-foreground">
              Your post stays private to you until this time, then goes live in the blog automatically.
            </p>
          )}
        </div>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <div className="space-y-3">
          <label htmlFor="blog-content-policy" className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
            <input
              id="blog-content-policy"
              type="checkbox"
              checked={policyAccepted}
              onChange={(e) => setPolicyAccepted(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[rgb(var(--accent-1))]"
              required
            />
            <span>I confirm this post is about Gaming Horizon and doesn&apos;t contain restricted or off-topic content, understanding that violations can lead to my account being suspended.</span>
          </label>
        </div>

        <LegalConsent checked={legalAccepted} onChange={setLegalAccepted} source="blog-post" id="blog-post-consent" />

        <div className="flex flex-wrap items-center gap-3">
          <GhButton
            type="submit"
            magnetic={false}
            disabled={!title.trim() || !hasBody || !policyAccepted || !legalAccepted || (scheduleEnabled && !scheduledAt) || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> {scheduleEnabled ? 'Scheduling…' : 'Publishing…'}
              </>
            ) : scheduleEnabled ? (
              'Schedule post'
            ) : (
              'Publish post'
            )}
          </GhButton>
          <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  )
}
