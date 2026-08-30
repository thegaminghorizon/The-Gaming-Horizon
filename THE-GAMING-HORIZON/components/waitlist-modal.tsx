'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Check, Sparkles, Award, Bell } from 'lucide-react'
import { useUI } from '@/components/providers/ui-provider'
import { useAuth } from '@/components/providers/auth-provider'
import { useNotifications } from '@/components/providers/notifications-provider'
import { GhButton, Pill } from '@/components/ui/primitives'
import { LogoMark } from '@/components/ui/logo'
import { cn } from '@/lib/utils'
import { LegalConsent, PreReleaseNotice, buildLegalAcceptance } from '@/components/legal-consent'

const GENRES = [
  'FPS',
  'Racing',
  'Puzzle',
  'Strategy',
  'Battle Royale',
  'Co-op',
  'Casual',
  'Multiplayer',
]
const BROWSERS = ['Chrome', 'Edge', 'Firefox', 'Safari', 'Brave', 'Other']
const PLATFORMS = ['Desktop', 'Laptop', 'Mobile', 'Tablet']

const field =
  'w-full rounded-xl border border-input bg-background/60 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-[rgb(var(--accent-1))]'

export function WaitlistModal() {
  const { waitlistOpen, closeWaitlist, openExperience } = useUI()
  const { user, displayName } = useAuth()
  const { notify } = useNotifications()
  const [done, setDone] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    country: '',
    genres: [] as string[],
    browser: 'Chrome',
    platform: 'Desktop',
    discord: '',
    newsletter: true,
  })

  useEffect(() => {
    if (!waitlistOpen || !user) return

    setForm((current) => ({
      ...current,
      name: current.name || displayName,
      email: current.email || user.email || '',
    }))
  }, [displayName, user, waitlistOpen])

  const toggleGenre = (g: string) =>
    setForm((f) => ({
      ...f,
      genres: f.genres.includes(g)
        ? f.genres.filter((x) => x !== g)
        : [...f.genres, g],
    }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const list = JSON.parse(localStorage.getItem('gh-waitlist') || '[]')
      list.push({ ...form, at: new Date().toISOString(), legalAcceptance: buildLegalAcceptance('waitlist', form.email) })
      localStorage.setItem('gh-waitlist', JSON.stringify(list))
    } catch {
      /* ignore */
    }
    notify({
      title: "You're on the waitlist!",
      body: `You've successfully joined the waitlist${form.name ? `, ${form.name}` : ''}${form.genres.length ? ` — we've noted your interest in ${form.genres.join(', ')}` : ''}. We'll email ${form.email || 'you'} as soon as your spot opens up, with no spam in between.`,
      icon: 'waitlist',
      toast: false,
    })
    setDone(true)
  }

  const close = () => {
    closeWaitlist()
    setTimeout(() => setDone(false), 300)
  }

  return (
    <AnimatePresence>
      {waitlistOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="glass-strong relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 sm:p-8"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            role="dialog"
            aria-label="Join the waitlist"
          >
            <button
              onClick={close}
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg hover:bg-muted"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            {done ? (
              <div className="flex flex-col items-center py-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                  className="flex size-20 items-center justify-center rounded-full glow-accent"
                  style={{
                    background:
                      'linear-gradient(135deg, rgb(var(--accent-1)), rgb(var(--accent-3)))',
                  }}
                >
                  <Check className="size-10 text-white" />
                </motion.div>
                <h2 className="font-heading mt-6 text-2xl font-semibold">
                  You&apos;re on the list
                </h2>
                <p className="mt-2 max-w-sm text-pretty text-sm text-muted-foreground">
                  Welcome aboard, {form.name || 'pioneer'}. As a waitlist member you
                  may receive early beta access, founder recognition, and regular
                  development updates.
                </p>
                <div className="mt-6 grid w-full gap-2 sm:grid-cols-3">
                  {[
                    { icon: Sparkles, label: 'Beta access' },
                    { icon: Award, label: 'Founder badge' },
                    { icon: Bell, label: 'Dev updates' },
                  ].map((b) => (
                    <div
                      key={b.label}
                      className="glass flex flex-col items-center gap-1.5 rounded-xl p-3"
                    >
                      <b.icon className="size-5 text-[rgb(var(--accent-1))]" />
                      <span className="text-xs text-muted-foreground">{b.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                  <GhButton onClick={() => { close(); openExperience() }} magnetic={false}>Personalize Your Future Experience</GhButton>
                  <GhButton variant="outline" onClick={close} magnetic={false}>Done</GhButton>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <LogoMark className="size-9" />
                  <div>
                    <Pill className="mb-1">Pre-Launch</Pill>
                    <h2 className="font-heading text-xl font-semibold">
                      Join the Waitlist
                    </h2>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Be first in line for the Public Beta on 1 January 2027. Stored
                  locally for this preview.
                </p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                  <PreReleaseNotice />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Name</label>
                      <input
                        required
                        className={field}
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Email</label>
                      <input
                        required
                        type="email"
                        className={field}
                        placeholder="you@email.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  {user?.email && (
                    <p className="-mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      Filled from your signed-in account. You can change the name or email before submitting.
                    </p>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">
                        Country
                      </label>
                      <input
                        className={field}
                        placeholder="Country"
                        value={form.country}
                        onChange={(e) =>
                          setForm({ ...form, country: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">
                        Discord (optional)
                      </label>
                      <input
                        className={field}
                        placeholder="username"
                        value={form.discord}
                        onChange={(e) =>
                          setForm({ ...form, discord: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">
                      Favourite genres
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleGenre(g)}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-xs transition-colors',
                            form.genres.includes(g)
                              ? 'border-[rgb(var(--accent-1))] bg-[rgb(var(--accent-1)/0.14)]'
                              : 'border-border text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">
                        Preferred browser
                      </label>
                      <select
                        className={field}
                        value={form.browser}
                        onChange={(e) =>
                          setForm({ ...form, browser: e.target.value })
                        }
                      >
                        {BROWSERS.map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">
                        Gaming platform
                      </label>
                      <select
                        className={field}
                        value={form.platform}
                        onChange={(e) =>
                          setForm({ ...form, platform: e.target.value })
                        }
                      >
                        {PLATFORMS.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={form.newsletter}
                      onChange={(e) =>
                        setForm({ ...form, newsletter: e.target.checked })
                      }
                      className="size-4 accent-[rgb(var(--accent-1))]"
                    />
                    <span className="text-muted-foreground">
                      Send me development updates and beta news
                    </span>
                  </label>

                  <LegalConsent checked={legalAccepted} onChange={setLegalAccepted} source="waitlist" id="waitlist-legal" />

                  <GhButton
                    type="submit"
                    disabled={!legalAccepted}
                    size="lg"
                    className="w-full"
                    magnetic={false}
                  >
                    Secure my spot
                  </GhButton>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
