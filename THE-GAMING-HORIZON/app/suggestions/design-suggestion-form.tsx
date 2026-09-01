'use client'

import { FormEvent, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ImagePlus, Link2, Loader2, PenSquare, Send, X } from 'lucide-react'
import { LegalConsent, PreReleaseNotice, buildLegalAcceptance } from '@/components/legal-consent'
import { useAuth } from '@/components/providers/auth-provider'
import { useNotifications } from '@/components/providers/notifications-provider'
import { compressImage } from '@/lib/images'
import { DESIGN_SUGGESTION_CATEGORIES, submitDesignSuggestion } from '@/lib/design-suggestions'
import { GhButton } from '@/components/ui/primitives'

const inputClass =
  'rounded-xl border border-border bg-background/65 px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--accent-1)/0.7)] focus:ring-2 focus:ring-[rgb(var(--accent-1)/0.15)]'

export function DesignSuggestionForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { user, loading, displayName, initials } = useAuth()
  const { notify } = useNotifications()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>(DESIGN_SUGGESTION_CATEGORIES[0])
  const [link, setLink] = useState('')
  const [image, setImage] = useState('')
  const [imageBusy, setImageBusy] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)

  if (loading) return null

  if (!user) {
    return (
      <div className="glass rounded-3xl p-8 text-center md:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
          <PenSquare className="size-6" />
        </span>
        <h2 className="mt-5 font-heading text-2xl font-bold">Sign up to share a design</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Submissions are credited to your Gaming Horizon profile, so you&apos;ll need a signed-up account before uploading one.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/sign-up" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[rgb(var(--accent-1))] px-5 py-3 text-sm font-semibold text-white shadow-lg">
            Create an account
          </Link>
          <Link href="/sign-in" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-muted/60">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="glass rounded-3xl p-8 text-center md:p-12">
        <CheckCircle2 className="mx-auto size-12 text-[rgb(var(--accent-1))]" />
        <h2 className="mt-5 font-heading text-2xl font-bold">Design submitted</h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Your submission is live in the gallery below for everyone to see.
        </p>
        <button
          onClick={() => {
            setTitle('')
            setDescription('')
            setLink('')
            setImage('')
            setPolicyAccepted(false)
            setLegalAccepted(false)
            setDone(false)
          }}
          className="mt-7 rounded-xl bg-[rgb(var(--accent-1))] px-5 py-3 text-sm font-semibold text-[var(--accent-button-fg)] shadow-lg"
        >
          Submit another design
        </button>
      </div>
    )
  }

  async function handleImageFile(file: File | undefined) {
    if (!file) return
    setError('')
    setImageBusy(true)
    try {
      setImage(await compressImage(file, 1600, 0.82))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That image could not be used.')
    } finally {
      setImageBusy(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const trimmedTitle = title.trim()
    if (!trimmedTitle || trimmedTitle.length < 3) {
      setError('Give your design a title with at least 3 characters.')
      return
    }
    if (!image) {
      setError('Upload an image of your design before submitting.')
      return
    }
    if (!policyAccepted) {
      setError('Please confirm this is your own original work.')
      return
    }
    if (!legalAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy to submit.')
      return
    }

    setSubmitting(true)
    const result = await submitDesignSuggestion({
      title: trimmedTitle,
      description: description.trim(),
      category,
      image,
      link: link.trim() || undefined,
      authorId: user!.id,
      authorName: displayName || 'Gaming Horizon player',
      authorInitials: initials || 'GH',
    })
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    buildLegalAcceptance('design-suggestion', user!.email ?? undefined)
    notify({ title: 'Design submitted', body: `"${result.suggestion.title}" is live in the ${category} gallery for the community to browse and upvote. Keep an eye on it to see how the votes come in — popular suggestions are what shape what gets built next.`, icon: 'success' })
    setDone(true)
    onSubmitted?.()
  }

  return (
    <form onSubmit={submit} className="glass rounded-3xl p-6 md:p-9">
      <PreReleaseNotice />
      <div className="mt-6 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
          <ImagePlus className="size-5" />
        </span>
        <div>
          <h2 className="font-heading text-xl font-bold">Share a design</h2>
          <p className="text-sm text-muted-foreground">Submitting as {displayName || 'you'}.</p>
        </div>
      </div>

      <div className="mt-7 grid gap-5">
        <div className="grid gap-2 text-sm font-medium">
          Image *
          {image ? (
            <div className="relative overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Design preview" className="max-h-72 w-full object-contain bg-background/60" />
              <button
                type="button"
                onClick={() => setImage('')}
                aria-label="Remove image"
                className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/75"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={imageBusy}
              className="flex h-40 items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/40 text-sm font-medium text-muted-foreground transition-colors hover:border-[rgb(var(--accent-1)/0.5)] hover:text-foreground disabled:opacity-60"
            >
              {imageBusy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              {imageBusy ? 'Processing image…' : 'Upload a logo, screenshot, or mockup'}
            </button>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => void handleImageFile(e.target.files?.[0])}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Title *
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={80}
              placeholder="e.g. Horizon wordmark concept"
              className={`h-12 ${inputClass}`}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={`h-12 ${inputClass}`}>
              {DESIGN_SUGGESTION_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium">
          Description <span className="font-normal text-muted-foreground">(optional — what were you going for?)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={400}
            placeholder="Tell the community about your design..."
            className={`resize-none py-3 ${inputClass}`}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Link <span className="font-normal text-muted-foreground">(optional — a live site, Figma, Behance, etc.)</span>
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://"
              className={`h-12 w-full pl-10 ${inputClass}`}
            />
          </div>
        </label>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <label htmlFor="design-suggestion-policy" className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
          <input
            id="design-suggestion-policy"
            type="checkbox"
            checked={policyAccepted}
            onChange={(e) => setPolicyAccepted(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[rgb(var(--accent-1))]"
            required
          />
          <span>I confirm this is my own original work and I have the right to share it, understanding that stolen or off-topic submissions can lead to my account being suspended.</span>
        </label>

        <LegalConsent checked={legalAccepted} onChange={setLegalAccepted} source="design-suggestion" id="design-suggestion-consent" />

        <div className="flex flex-wrap items-center gap-3">
          <GhButton type="submit" magnetic={false} disabled={!title.trim() || !image || !policyAccepted || !legalAccepted || submitting}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <Send className="size-4" /> Submit design
              </>
            )}
          </GhButton>
        </div>
      </div>
    </form>
  )
}
