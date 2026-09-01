'use client'

import { useMemo } from 'react'
import {
  Rocket,
  Compass,
  FlaskConical,
  RefreshCw,
  MessageSquare,
  GitCompareArrows,
} from 'lucide-react'
import {
  SectionHeading,
  Reveal,
  SpringCard,
  GhButton,
  DetailButton,
  Pill,
} from '@/components/ui/primitives'
import {
  BETA_TIMELINE,
  BETA_EXPECT,
  BETA_TESTABLE,
  BETA_CHANGES,
  BETA_FEEDBACK_STEPS,
  BETA_VS,
} from '@/lib/data'
import { useUI } from '@/components/providers/ui-provider'
import { resolveMilestones } from '@/lib/milestones'
import { useMilestoneClock } from '@/lib/use-milestone-clock'

function CardShell({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: typeof Rocket
  title: string
  accent: 1 | 2 | 3
  children: React.ReactNode
}) {
  return (
    <div className="glass gh-card-hover h-full rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl"
          style={{
            background: `rgb(var(--accent-${accent}) / 0.16)`,
            color: `rgb(var(--accent-${accent}))`,
          }}
        >
          <Icon className="size-5" />
        </span>
        <h3 className="font-heading text-lg font-semibold text-balance">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export function BetaProgram() {
  const { openWaitlist } = useUI()
  const now = useMilestoneClock()
  const timeline = useMemo(() => resolveMilestones(BETA_TIMELINE, now), [now])

  return (
    <section id="beta-program" className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="Know more about the Public Beta"
          title="What the Public Beta really is"
          subtitle="Gaming Horizon is still in active development. The Public Beta on 1 January 2027 is the first playable milestone — a foundation you help shape, not the finished product. The full platform officially launches 1 March 2028."
        />

        {/* Timeline */}
        <Reveal className="mt-14">
          <div className="glass relative overflow-hidden rounded-3xl p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              <Rocket className="size-4 text-[rgb(var(--accent-1))]" />
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Beta timeline
              </span>
            </div>
            <ol className="relative grid gap-6 md:grid-cols-3 lg:grid-cols-6">
              {timeline.map((p, i) => (
                <li key={i} className="relative">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        'size-3 shrink-0 rounded-full ' +
                        (p.state === 'In Progress'
                          ? 'animate-dot-pulse bg-[rgb(var(--accent-3))]'
                          : p.state === 'Completed'
                            ? 'bg-emerald-500'
                            : p.state === 'Scheduled Reached'
                              ? 'bg-amber-500'
                              : 'bg-muted-foreground/40')
                      }
                    />
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {p.when}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-balance">{p.title}</h4>
                  <span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${p.state === 'Completed' ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300' : p.state === 'Scheduled Reached' ? 'bg-amber-500/12 text-amber-700 dark:text-amber-300' : 'bg-muted/60 text-muted-foreground'}`}>{p.statusLabel}</span>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        {/* Card grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <SpringCard delay={0.05}>
            <CardShell icon={Compass} title="What to expect" accent={1}>
              <ul className="space-y-3">
                {BETA_EXPECT.map((x) => (
                  <li key={x.title}>
                    <p className="text-sm font-medium">{x.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{x.desc}</p>
                  </li>
                ))}
              </ul>
            </CardShell>
          </SpringCard>

          <SpringCard delay={0.1}>
            <CardShell icon={FlaskConical} title="What you can test" accent={3}>
              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {BETA_TESTABLE.map((x) => (
                  <li
                    key={x.title}
                    className="rounded-lg border border-border/60 px-3 py-2"
                  >
                    <p className="text-xs font-semibold">{x.title}</p>
                    <p className="text-[11px] leading-snug text-muted-foreground">{x.desc}</p>
                  </li>
                ))}
              </ul>
            </CardShell>
          </SpringCard>

          <SpringCard delay={0.15}>
            <CardShell icon={RefreshCw} title="What may still change" accent={2}>
              <ul className="space-y-3">
                {BETA_CHANGES.map((x) => (
                  <li key={x.title}>
                    <p className="text-sm font-medium">{x.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{x.desc}</p>
                  </li>
                ))}
              </ul>
            </CardShell>
          </SpringCard>
        </div>

        {/* Feedback + Beta vs Official */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SpringCard delay={0.05}>
            <CardShell icon={MessageSquare} title="How feedback helps" accent={3}>
              <ol className="space-y-4">
                {BETA_FEEDBACK_STEPS.map((s) => (
                  <li key={s.step} className="flex gap-3">
                    <span className="font-heading text-sm font-bold text-[rgb(var(--accent-3))]">
                      {s.step}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardShell>
          </SpringCard>

          <SpringCard delay={0.1}>
            <CardShell icon={GitCompareArrows} title="Beta vs official launch" accent={1}>
              <div className="overflow-hidden rounded-xl border border-border/60">
                <div className="grid grid-cols-[1.1fr_1fr_1fr] bg-muted/40 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <span className="px-3 py-2">Aspect</span>
                  <span className="px-3 py-2 text-[rgb(var(--accent-3))]">Beta</span>
                  <span className="px-3 py-2 text-[rgb(var(--accent-2))]">Official</span>
                </div>
                {BETA_VS.map((row, i) => (
                  <div
                    key={row.aspect}
                    className={
                      'grid grid-cols-[1.1fr_1fr_1fr] text-xs ' +
                      (i % 2 ? 'bg-transparent' : 'bg-muted/20')
                    }
                  >
                    <span className="px-3 py-2 font-medium">{row.aspect}</span>
                    <span className="px-3 py-2 text-muted-foreground">{row.beta}</span>
                    <span className="px-3 py-2 text-muted-foreground">{row.official}</span>
                  </div>
                ))}
              </div>
            </CardShell>
          </SpringCard>
        </div>

        {/* CTA */}
        <Reveal delay={0.1} className="mt-10">
          <div className="gh-banner-ring rounded-3xl">
            <div className="glass-strong flex flex-col items-center gap-5 rounded-[23px] p-8 text-center md:flex-row md:justify-between md:text-left">
              <div>
                <Pill className="mb-3">
                  <Rocket className="size-3.5 text-[rgb(var(--accent-1))]" />
                  Founding testers wanted
                </Pill>
                <h3 className="font-heading text-2xl font-semibold text-balance">
                  Explore the full Beta program
                </h3>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Dive into complete details — FAQs, launch dates, eligibility, supported
                  devices, known limitations and how to secure early access.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-3 sm:flex-row">
                <DetailButton href="/beta" label="Explore the Full Beta Program" />
                <GhButton onClick={openWaitlist}>Join the Waitlist</GhButton>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
