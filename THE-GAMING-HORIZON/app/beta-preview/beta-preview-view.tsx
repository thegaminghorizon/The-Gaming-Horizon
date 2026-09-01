'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Bot, Bug, Gamepad2, LockKeyhole, Map, Sparkles, Trophy, Users } from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { useUI } from '@/components/providers/ui-provider'
import { useMilestoneClock } from '@/lib/use-milestone-clock'
import { BETA_DATE, LAUNCH_DATE } from '@/lib/data'

function splitTime(target: string, now: number) {
  const remaining = new Date(target).getTime() - now
  const safe = Math.max(0, remaining)
  return {
    done: remaining <= 0,
    days: Math.floor(safe / 86_400_000),
    hours: Math.floor((safe / 3_600_000) % 24),
    minutes: Math.floor((safe / 60_000) % 60),
    seconds: Math.floor((safe / 1_000) % 60),
  }
}

function MilestoneClock({ title, date, target, now, primary = false }: { title: string; date: string; target: string; now: number; primary?: boolean }) {
  const time = splitTime(target, now)
  const units = [['Days', time.days], ['Hours', time.hours], ['Minutes', time.minutes], ['Seconds', time.seconds]] as const
  return (
    <article className={`h-full rounded-3xl border p-5 sm:p-6 ${primary ? 'border-[rgb(var(--accent-1)/0.38)] bg-[rgb(var(--accent-1)/0.08)] shadow-[0_24px_70px_-48px_rgb(var(--accent-1)/0.74)]' : 'border-border/70 bg-card/55'}`}>
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[rgb(var(--accent-1))]">{title}</p><p className="mt-1 text-xs text-muted-foreground">{date}</p></div>
        <span className={`size-2.5 rounded-full ${primary ? 'bg-[rgb(var(--accent-3))] shadow-[0_0_18px_rgb(var(--accent-3)/0.7)]' : 'bg-[rgb(var(--accent-2))]'}`} aria-hidden />
      </div>
      {time.done ? (
        <p className="mt-5 rounded-2xl border border-[rgb(var(--accent-1)/0.25)] bg-background/60 px-4 py-5 text-center text-sm font-bold text-[rgb(var(--accent-1))]" role="status">{primary ? 'Public Beta milestone reached' : 'Official Launch milestone reached'}</p>
      ) : (
        <div className="mt-5 grid grid-cols-4 gap-2" role="timer" aria-label={`${title}: ${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds`}>
          {units.map(([label, value]) => (
            <span key={label} className="flex min-h-16 min-w-0 flex-col items-center justify-center rounded-2xl border border-[rgb(var(--accent-1)/0.18)] bg-background/68 px-1">
              <strong suppressHydrationWarning className="font-mono text-lg font-black tabular-nums tracking-tight text-foreground sm:text-xl">{String(value).padStart(2, '0')}</strong>
              <small className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label.slice(0, 1)}</small>
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

const modules = [
  { title: 'Instant Browser Play', icon: Gamepad2, copy: 'Launch supported browser games without downloads or a separate launcher.' },
  { title: 'AI Discovery', icon: Bot, copy: 'Test planned contextual recommendations based on time, mood, device, and play preferences.' },
  { title: 'Persistent Identity', icon: Trophy, copy: 'Preview profiles, achievements, collections, and progress across supported experiences.' },
  { title: 'Friends and Community', icon: Users, copy: 'Explore planned shared sessions, communities, events, invitations, and nearby activity.' },
  { title: 'Feedback Portal', icon: Bug, copy: 'Report bugs, submit ideas, vote on improvements, and follow project responses.' },
] as const

export function WebsiteBetaPreview() {
  const router = useRouter()
  const { openWaitlist } = useUI()
  const now = useMilestoneClock()

  const closePreview = () => {
    try {
      const referrer = document.referrer ? new URL(document.referrer) : null
      if (referrer?.origin === window.location.origin && window.history.length > 1) {
        router.back()
        return
      }
    } catch {
      // Fall through to the website homepage.
    }
    router.push('/')
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-24 pt-[calc(var(--banner-h,0px)+var(--nav-h,64px)+2.5rem)] sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-[12%] top-[4%] size-[680px] rounded-full bg-[radial-gradient(circle,rgb(var(--accent-1)/0.15),transparent_68%)]" />
        <div className="absolute -left-[14%] top-[45%] size-[620px] rounded-full bg-[radial-gradient(circle,rgb(var(--accent-3)/0.09),transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-[1380px]">
        <button type="button" onClick={closePreview} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border/70 bg-background/60 px-4 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:border-[rgb(var(--accent-1)/0.42)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.72)]">
          <ArrowLeft className="size-4" aria-hidden /> Return to Website
        </button>

        <section className="mt-6 overflow-hidden rounded-[36px] border border-[rgb(var(--accent-1)/0.23)] bg-card/62 p-5 shadow-[0_40px_120px_-64px_rgb(var(--accent-1)/0.62)] backdrop-blur-xl sm:p-8 lg:p-11">
          <div className="grid gap-9 xl:grid-cols-[1.04fr_.96fr] xl:items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--accent-1)/0.28)] bg-[rgb(var(--accent-1)/0.08)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]"><LockKeyhole className="size-3.5" aria-hidden /> Website Beta Preview</span>
              <h1 className="mt-5 max-w-4xl font-heading text-[clamp(2.7rem,6vw,5.8rem)] font-black leading-[0.94] tracking-[-0.055em]">Public Beta access is closed.</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">This landing-site preview explains what Gaming Horizon plans to test during Public Beta. It does not provide unfinished authentication, payments, account access, or a live platform.</p>
              <div className="mt-7 rounded-3xl border border-border/70 bg-background/55 p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[rgb(var(--accent-1))]">How feedback shapes launch</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">Beta feedback will guide browser compatibility, performance, accessibility, discovery quality, identity continuity, community safeguards, and the priorities leading to Official Launch on March 1, 2028.</p>
              </div>
            </div>

            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <MilestoneClock title="Public Beta" date="January 1, 2027 · 12:01 AM IST" target={BETA_DATE} now={now} primary />
              <MilestoneClock title="Official Launch" date="March 1, 2028 · 12:01 AM IST" target={LAUNCH_DATE} now={now} />
            </div>
          </div>

          <div className="mt-10 border-t border-border/70 pt-8">
            <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.17em] text-[rgb(var(--accent-1))]">Planned Beta experience</p><h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Core systems visitors will help refine.</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Every item below describes planned preview functionality, not a feature that is publicly live today.</p></div>
            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {modules.map(({ title, icon: Icon, copy }) => (
                <article key={title} className="rounded-2xl border border-border/70 bg-background/55 p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.10)] text-[rgb(var(--accent-1))]"><Icon className="size-[18px]" aria-hidden /></span>
                  <h3 className="mt-4 text-sm font-bold">{title}</h3>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">{copy}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-3 border-t border-border/70 pt-7 lg:flex-row lg:flex-wrap lg:items-center">
            <GhButton size="lg" magnetic={false} onClick={openWaitlist} className="group">Join the Waitlist <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></GhButton>
            <GhButton href="/beta" size="lg" variant="glass" magnetic={false}><Sparkles className="size-4" /> Explore the Full Beta Program</GhButton>
            <GhButton href="/roadmap" size="lg" variant="glass" magnetic={false}><Map className="size-4" /> View the Roadmap</GhButton>
            <button type="button" onClick={closePreview} className="min-h-12 rounded-2xl px-5 text-sm font-bold text-muted-foreground outline-none transition-colors hover:bg-muted/55 hover:text-foreground focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.72)]">Close Preview</button>
          </div>
        </section>
      </div>
    </main>
  )
}
