'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { useAuth } from '@/components/providers/auth-provider'
import { useNotifications } from '@/components/providers/notifications-provider'
import { hasSentWelcomeNotification, markWelcomeNotificationSent } from '@/lib/notifications'
import { useExperience, EMPTY_EXPERIENCE, type ExperienceProfile } from '@/components/providers/experience-provider'

const STEPS = [
  { key: 'genres', title: 'What do you love to play?', options: ['FPS','Racing','RPG','Strategy','Puzzle','Adventure','Sports','Indie'] },
  { key: 'sessionLength', title: 'How long are your usual sessions?', options: ['Quick 10–20 min','30–60 min','1–2 hours','Long sessions'] },
  { key: 'playStyle', title: 'How do you like to play?', options: ['Competitive','Co-op','Solo','Relaxed','I like variety'] },
  { key: 'difficulty', title: 'What challenge feels right?', options: ['Easy','Balanced','Hard','Give me a challenge'] },
  { key: 'device', title: 'Where do you usually game?', options: ['Desktop','Laptop','Mobile','Tablet'] },
]

export function WelcomeExperience({ initial: initialProfile }: { initial?: ExperienceProfile }) {
  const router = useRouter()
  const { user, displayName, saveExperience } = useAuth()
  const { notify } = useNotifications()
  const { saved, save } = useExperience()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<ExperienceProfile>({ ...EMPTY_EXPERIENCE, ...(initialProfile || saved), completed: false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reaching this page at all (server-gated in app/welcome/page.tsx to a
  // signed-in account with onboarding_completed === false) means an account
  // was just created — by email/password, email OTP, or an OAuth provider
  // (Google, Discord, GitHub). Firing the signup notification here, instead
  // of from the signup form, covers every path: OAuth signups never re-run
  // the form's own JS after the provider redirect, so a form-only trigger
  // never reached them. Guarded per-account so a page refresh mid-wizard
  // doesn't re-fire it.
  useEffect(() => {
    if (!user) return
    if (hasSentWelcomeNotification(user.id)) return
    markWelcomeNotificationSent(user.id)
    notify({
      title: 'Welcome to Gaming Horizon!',
      body: [
        'Your account was created successfully — welcome aboard.',
        "Next up: a few quick questions about how you like to play (genres, session length, play style, difficulty, and device), so the site can feel tailored from your very first visit. You can change any of these later from your profile.",
        "Once you're in, the Music Room, Customization Studio, and AI Companion are all ready to explore — and there's more beyond those three: browse or publish in the Blog, pitch ideas in Design Suggestions, grab an API key from the Developer Portal, and reach the team any time through Support. Check the What's New notice above for a full rundown of what's live right now.",
        'You can manage notification preferences and review security alerts for this account any time from this Notifications tab.',
      ].join('\n\n'),
      icon: 'success',
    })
  }, [user, notify])

  const current = STEPS[step]
  const value = current.key === 'genres' ? profile.genres : String(profile[current.key as keyof ExperienceProfile] || '')
  const choose = (option: string) => {
    setProfile(p => current.key === 'genres' ? { ...p, genres: p.genres.includes(option) ? p.genres.filter(x => x !== option) : [...p.genres, option] } : { ...p, [current.key]: option })
  }
  const selected = (option: string) => Array.isArray(value) ? value.includes(option) : value === option

  async function finish() {
    setSaving(true); setError(null)
    const final = { ...profile, completed: true }
    save(final)
    const result = await saveExperience({ experience_profile: final, onboarding_completed: true })
    if (!result.ok) { setError(result.error || 'Could not save your experience yet.'); setSaving(false); return }
    router.replace('/'); router.refresh()
  }

  return (
    <main className="flex min-h-[calc(100vh-var(--nav-h,56px))] items-center justify-center px-4 pt-[calc(var(--nav-h,56px)+2rem)] pb-16 sm:px-6 sm:pt-[calc(var(--nav-h,56px)+2.5rem)] sm:pb-20">
      <section className="glass relative w-full max-w-4xl overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-[rgb(var(--accent-1)/0.14)] blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]"><Sparkles className="size-5" /></span><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]">Welcome to Gaming Horizon</p><h1 className="mt-1 font-heading text-2xl font-semibold sm:text-3xl">Welcome, {displayName}!</h1></div></div>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">Your account is ready. Let’s create your Gaming Horizon experience so the site can feel more personal from your first visit.</p>
          <div className="mt-6 flex gap-1.5">{STEPS.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[rgb(var(--accent-1))]' : 'bg-muted'}`} />)}</div>
          <div className="mt-9"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Step {step + 1} of {STEPS.length}</p><h2 className="mt-2 font-heading text-2xl font-semibold">{current.title}</h2><p className="mt-2 text-sm text-muted-foreground">Choose one or more options that fit you.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">{current.options.map(option => <button key={option} type="button" onClick={() => choose(option)} className={`rounded-2xl border p-4 text-left text-sm font-semibold transition-all hover:-translate-y-px ${selected(option) ? 'border-[rgb(var(--accent-1)/0.65)] bg-[rgb(var(--accent-1)/0.11)] shadow-[0_16px_40px_-28px_rgb(var(--accent-1))]' : 'border-border bg-background/35 hover:bg-muted/40'}`}><span className="flex items-center justify-between gap-3">{option}{selected(option) && <Check className="size-4 text-[rgb(var(--accent-1))]" />}</span></button>)}</div>
          </div>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3"><button type="button" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))} className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2.5 text-sm disabled:opacity-40"><ChevronLeft className="size-4" />Back</button>{step < STEPS.length - 1 ? <GhButton magnetic={false} disabled={Array.isArray(value) ? value.length === 0 : !value} onClick={() => setStep(s => s + 1)}>Continue <ChevronRight className="size-4" /></GhButton> : <GhButton magnetic={false} disabled={saving || (Array.isArray(value) ? value.length === 0 : !value)} onClick={() => void finish()}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} {saving ? 'Saving your experience…' : 'Finish & enter Gaming Horizon'}</GhButton>}</div>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">You can change these preferences later from your profile.</p>
        </div>
      </section>
    </main>
  )
}
