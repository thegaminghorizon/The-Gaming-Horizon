'use client'

import { ArrowRight, Brain, Check, Gamepad2, Palette, Save, Sparkles } from 'lucide-react'
import { useExperience, type ExperienceProfile } from '@/components/providers/experience-provider'
import { getAccentTones, useSettings } from '@/components/providers/settings-provider'
import { useUI } from '@/components/providers/ui-provider'

function profileLabel(profile: ExperienceProfile) {
  if (profile.sessionLength === 'Under 15 minutes') return 'Quick-Session Player'
  if (profile.playStyle === 'Competitive' || profile.priorities.includes('Competition')) return 'Competitive Explorer'
  if (profile.playStyle === 'Friends' || profile.playStyle === 'Co-op') return 'Social Challenger'
  if (profile.priorities.includes('Relaxation')) return 'Relaxed Discoverer'
  return profile.genres.length ? 'Future Explorer' : 'Your Future Profile'
}

function completion(profile: ExperienceProfile) {
  const checks = [
    profile.genres.length > 0,
    Boolean(profile.sessionLength),
    Boolean(profile.playStyle),
    Boolean(profile.device),
    Boolean(profile.browser),
    profile.aiPriorities.length > 0,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

export function ExperienceCta() {
  const { openExperience } = useUI()
  const { saved } = useExperience()
  const { settings } = useSettings()
  const progress = completion(saved)
  const accent = getAccentTones(settings)
  const genres = saved.genres.slice(0, 3)

  return (
    <section className="px-4 py-10 cq-px-6-sm cq-py-14-sm">
      <div className="glass-panel-large mx-auto max-w-6xl overflow-hidden rounded-[2rem] p-5 sm:p-8 lg:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)] lg:gap-10">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.08)] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--accent-1))]">
              <Sparkles className="size-3.5" />
              Optional beta preparation
            </div>

            <h2 className="font-heading max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Create Your Gaming Horizon Experience
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Shape a personalized preview of how Gaming Horizon may recommend games, adapt to your play style, and prepare your future profile for Public Beta. Your choices stay on this device until you decide to save them.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                [Brain, 'Personalized AI recommendations'],
                [Palette, 'A tailored visual experience'],
                [Gamepad2, 'A future-ready player profile'],
                [Save, 'Preferences saved locally'],
              ].map(([Icon, label]) => {
                const FeatureIcon = Icon as typeof Brain
                return (
                  <div key={label as string} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/35 px-4 py-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                      <FeatureIcon className="size-4.5" />
                    </span>
                    <span className="text-sm font-medium">{label as string}</span>
                  </div>
                )
              })}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={openExperience}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[rgb(var(--accent-1))] px-5 font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgb(var(--accent-1)/0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1))] focus-visible:ring-offset-2"
              >
                {progress > 0 ? 'Continue Experience' : 'Start Experience'}
                <ArrowRight className="size-4" />
              </button>
              <p className="self-center text-xs leading-5 text-muted-foreground sm:max-w-xs">
                Takes about 3–5 minutes. You can pause and continue later.
              </p>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="pointer-events-none absolute -inset-8 rounded-full bg-[rgb(var(--accent-1)/0.10)] blur-3xl" />
            <div className="glass-strong relative overflow-hidden rounded-[1.75rem] border border-[rgb(var(--accent-1)/0.24)] p-5 shadow-[0_28px_90px_rgb(0_0_0/0.22)] sm:p-6">
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: `linear-gradient(90deg, rgb(${accent.a1}), rgb(${accent.a2}), rgb(${accent.a3}))` }}
              />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Your future profile</p>
                  <h3 className="font-heading mt-2 text-2xl font-bold">{profileLabel(saved)}</h3>
                </div>
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.14)] ring-1 ring-[rgb(var(--accent-1)/0.22)]">
                  <Gamepad2 className="size-5 text-[rgb(var(--accent-1))]" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <PreviewRow label="Genres" value={genres.length ? genres.join(' • ') : 'Choose your favorites'} />
                <PreviewRow label="AI Priority" value={saved.aiPriorities[0] || 'Balanced discoveries'} />
                <PreviewRow label="Preferred Device" value={saved.device || 'Not selected'} />
                <PreviewRow label="Theme" value={accent.label} />
              </div>

              <div className="mt-6 rounded-2xl border border-border/70 bg-background/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Progress</span>
                  <span className="font-mono text-sm font-bold text-[rgb(var(--accent-1))]">{progress}% Complete</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, rgb(${accent.a1}), rgb(${accent.a3}))`,
                    }}
                  />
                </div>
              </div>

              <button
                onClick={openExperience}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[rgb(var(--accent-1)/0.34)] bg-[rgb(var(--accent-1)/0.10)] px-4 text-sm font-semibold text-foreground transition duration-200 hover:bg-[rgb(var(--accent-1)/0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1))]"
              >
                {progress > 0 ? 'Continue Setup' : 'Start Experience'}
                {progress === 100 ? <Check className="size-4 text-[rgb(var(--accent-1))]" /> : <ArrowRight className="size-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-semibold">{value}</span>
    </div>
  )
}
