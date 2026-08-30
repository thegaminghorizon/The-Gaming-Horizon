'use client'

import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2, Gamepad2, Send } from 'lucide-react'
import { LegalConsent, PreReleaseNotice, buildLegalAcceptance } from '@/components/legal-consent'
import { useAuth } from '@/components/providers/auth-provider'

export function GameRequestForm() {
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [legalAccepted, setLegalAccepted] = useState(false)

  useEffect(() => {
    if (!user?.email) return
    setEmail((current) => current || user.email || '')
  }, [user])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const request = {
      game: String(data.get('game') ?? '').trim(),
      link: String(data.get('link') ?? '').trim(),
      reason: String(data.get('reason') ?? '').trim(),
      email: String(data.get('email') ?? email).trim(),
      createdAt: new Date().toISOString(),
      legalAcceptance: buildLegalAcceptance('game-request', String(data.get('email') ?? '').trim() || undefined),
    }
    if (!request.game || !request.reason) {
      setMessage('Please add the game name and tell us why it belongs on Gaming Horizon.')
      return
    }
    const existing = JSON.parse(localStorage.getItem('gh-game-requests') ?? '[]')
    localStorage.setItem('gh-game-requests', JSON.stringify([...existing, request]))
    event.currentTarget.reset()
    setMessage('')
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="glass rounded-3xl p-8 text-center md:p-12">
        <CheckCircle2 className="mx-auto size-12 text-[rgb(var(--accent-1))]" />
        <h2 className="mt-5 font-heading text-2xl font-bold">Request saved</h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">This prototype stores your suggestion on this device. Backend submission and review tracking will be connected before the portal opens publicly.</p>
        <button onClick={() => setSubmitted(false)} className="mt-7 rounded-xl bg-[rgb(var(--accent-1))] px-5 py-3 text-sm font-semibold text-white shadow-lg">Suggest another game</button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="glass rounded-3xl p-6 md:p-9">
      <PreReleaseNotice />
      <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]"><Gamepad2 className="size-5" /></span><div><h2 className="font-heading text-xl font-bold">Suggest a browser game</h2><p className="text-sm text-muted-foreground">Requests are reviewed for quality, licensing and safe embedding.</p></div></div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">Game name *<input name="game" required className="h-12 rounded-xl border border-border bg-background/65 px-4 outline-none transition focus:border-[rgb(var(--accent-1)/0.7)] focus:ring-2 focus:ring-[rgb(var(--accent-1)/0.15)]" placeholder="e.g. PolyTrack" /></label>
        <label className="grid gap-2 text-sm font-medium">Official game link<input name="link" type="url" className="h-12 rounded-xl border border-border bg-background/65 px-4 outline-none transition focus:border-[rgb(var(--accent-1)/0.7)] focus:ring-2 focus:ring-[rgb(var(--accent-1)/0.15)]" placeholder="https://" /></label>
      </div>
      <label className="mt-5 grid gap-2 text-sm font-medium">Why should it be added? *<textarea name="reason" required rows={5} className="resize-none rounded-xl border border-border bg-background/65 px-4 py-3 outline-none transition focus:border-[rgb(var(--accent-1)/0.7)] focus:ring-2 focus:ring-[rgb(var(--accent-1)/0.15)]" placeholder="Tell us what makes this game a good fit..." /></label>
      <label className="mt-5 grid gap-2 text-sm font-medium">Email for request updates (optional)<input name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-xl border border-border bg-background/65 px-4 outline-none transition focus:border-[rgb(var(--accent-1)/0.7)] focus:ring-2 focus:ring-[rgb(var(--accent-1)/0.15)]" placeholder="you@example.com" />{user?.email && <span className="text-[11px] font-normal leading-relaxed text-muted-foreground">Filled from your signed-in account. You can change it before sending.</span>}</label>
      <div className="mt-5"><LegalConsent checked={legalAccepted} onChange={setLegalAccepted} source="game-request" id="game-request-legal" /></div>
      {message && <p role="alert" className="mt-4 text-sm text-destructive">{message}</p>}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-lg text-xs leading-relaxed text-muted-foreground">Submitting a game does not guarantee inclusion. Gaming Horizon will only add titles with suitable permissions, quality and browser compatibility.</p><button type="submit" disabled={!legalAccepted} className="inline-flex h-12 disabled:cursor-not-allowed disabled:opacity-50 shrink-0 items-center justify-center gap-2 rounded-xl bg-[rgb(var(--accent-1))] px-6 font-semibold text-white shadow-[0_12px_35px_-12px_rgb(var(--accent-1)/0.8)] transition hover:-translate-y-0.5"><Send className="size-4" />Send request</button></div>
    </form>
  )
}
