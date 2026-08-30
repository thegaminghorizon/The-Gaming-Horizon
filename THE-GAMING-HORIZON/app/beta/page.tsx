'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Rocket,
  Compass,
  FlaskConical,
  RefreshCw,
  MessageSquare,
  GitCompareArrows,
  ShieldCheck,
  Monitor,
  AlertTriangle,
  ChevronDown,
  Check,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Countdown } from '@/components/countdown'
import { GhButton, Reveal, SectionHeading, Pill } from '@/components/ui/primitives'
import { useUI } from '@/components/providers/ui-provider'
import { resolveMilestones } from '@/lib/milestones'
import { useMilestoneClock } from '@/lib/use-milestone-clock'
import {
  BETA_DATE,
  LAUNCH_DATE,
  BETA_TIMELINE,
  BETA_EXPECT,
  BETA_TESTABLE,
  BETA_CHANGES,
  BETA_FEEDBACK_STEPS,
  BETA_VS,
  BETA_ELIGIBILITY,
  BETA_DEVICES,
  BETA_LIMITATIONS,
  BETA_FAQS,
} from '@/lib/data'

function BetaFaqs() {
  const [open, setOpen] = useState<string | null>(BETA_FAQS[0]?.q ?? null)
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      {BETA_FAQS.map((f) => {
        const isOpen = open === f.q
        return (
          <div key={f.q} className="glass overflow-hidden rounded-2xl">
            <button
              onClick={() => setOpen(isOpen ? null : f.q)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-medium">{f.q}</span>
              <ChevronDown
                className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export default function BetaProgramPage() {
  const { openWaitlist } = useUI()
  const now = useMilestoneClock()
  const timeline = useMemo(() => resolveMilestones(BETA_TIMELINE, now), [now])

  return (
    <main id="beta-program" className="relative min-h-screen scroll-mt-32 pb-24">
      <PageHeader
        eyebrow="Public Beta Program"
        title="The full Public Beta program"
        subtitle="The Public Beta is where Gaming Horizon becomes something players can shape. You will be able to test the browser-first foundation, understand what already works, see what is still evolving, and give feedback that directly informs the road to the official launch."
      >
        <GhButton onClick={openWaitlist}>Join the Waitlist</GhButton>
        <GhButton href="/roadmap" variant="ghost" magnetic={false}>
          View Roadmap
        </GhButton>
      </PageHeader>

      <div className="mx-auto max-w-6xl px-4">
        {/* Countdowns */}
        <Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass gh-card-hover rounded-3xl p-6 text-center">
              <Pill className="mb-4">
                <Rocket className="size-3.5 text-[rgb(var(--accent-3))]" />
                Public Beta
              </Pill>
              <p className="text-sm text-muted-foreground">Launches in</p>
              <div className="mt-4 flex justify-center">
                <Countdown target={BETA_DATE} variant="beta" />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                1 January 2027 · 12:01 AM IST
              </p>
            </div>
            <div className="glass gh-card-hover rounded-3xl p-6 text-center">
              <Pill className="mb-4">
                <Rocket className="size-3.5 text-[rgb(var(--accent-2))]" />
                Official Launch
              </Pill>
              <p className="text-sm text-muted-foreground">Arrives in</p>
              <div className="mt-4 flex justify-center">
                <Countdown target={LAUNCH_DATE} variant="launch" />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                1 March 2028 · 12:01 AM IST
              </p>
            </div>
          </div>
        </Reveal>

        {/* Timeline */}
        <section className="mt-20">
          <SectionHeading
            center
            eyebrow="Timeline"
            title="From beta to official launch"
            subtitle="Every key date on the road to the finished product."
          />
          <Reveal className="mt-12">
            <ol className="relative mx-auto max-w-3xl border-l border-border pl-6">
              {timeline.map((p, i) => (
                <li key={i} className="relative pb-8 last:pb-0">
                  <span
                    className={
                      'absolute -left-[31px] top-1 grid size-4 place-items-center rounded-full ring-4 ring-background ' +
                      (p.state === 'In Progress'
                        ? 'animate-dot-pulse bg-[rgb(var(--accent-3))]'
                        : p.state === 'Completed'
                          ? 'bg-emerald-500'
                          : p.state === 'Scheduled Reached'
                            ? 'bg-amber-500'
                            : 'bg-[rgb(var(--accent-1))]')
                    }
                  />
                  <span className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--accent-1))]">
                    {p.when}
                  </span>
                  <h3 className="mt-1 font-heading text-lg font-semibold text-balance">
                    {p.title}
                  </h3>
                  <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${p.state === 'Completed' ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300' : p.state === 'Scheduled Reached' ? 'bg-amber-500/12 text-amber-700 dark:text-amber-300' : 'bg-muted/60 text-muted-foreground'}`}>{p.statusLabel}</span>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        {/* What to expect / test / change */}
        <section className="mt-20 grid gap-6 lg:grid-cols-3">
          <Reveal>
            <div className="glass h-full rounded-2xl p-6">
              <Compass className="mb-3 size-6 text-[rgb(var(--accent-1))]" />
              <h3 className="font-heading text-lg font-semibold">What to expect</h3>
              <ul className="mt-4 space-y-3">
                {BETA_EXPECT.map((x) => (
                  <li key={x.title}>
                    <p className="text-sm font-medium">{x.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{x.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="glass h-full rounded-2xl p-6">
              <FlaskConical className="mb-3 size-6 text-[rgb(var(--accent-3))]" />
              <h3 className="font-heading text-lg font-semibold">What you can test</h3>
              <ul className="mt-4 space-y-3">
                {BETA_TESTABLE.map((x) => (
                  <li key={x.title}>
                    <p className="text-sm font-medium">{x.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{x.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="glass h-full rounded-2xl p-6">
              <RefreshCw className="mb-3 size-6 text-[rgb(var(--accent-2))]" />
              <h3 className="font-heading text-lg font-semibold">What may still change</h3>
              <ul className="mt-4 space-y-3">
                {BETA_CHANGES.map((x) => (
                  <li key={x.title}>
                    <p className="text-sm font-medium">{x.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{x.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        {/* Feedback */}
        <section className="mt-20">
          <SectionHeading
            center
            eyebrow="Feedback"
            title="How your feedback helps"
            subtitle="The Feedback Portal opens 15 January 2027 and closes 30 November 2027. Here is how your input shapes the final launch."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BETA_FEEDBACK_STEPS.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.05}>
                <div className="glass gh-card-hover h-full rounded-2xl p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <MessageSquare className="size-4 text-[rgb(var(--accent-3))]" />
                    <span className="font-heading text-lg font-bold text-[rgb(var(--accent-3))]">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold">{s.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Beta vs Official */}
        <section className="mt-20">
          <SectionHeading
            center
            eyebrow="Comparison"
            title="Beta vs official launch"
            subtitle="What is different between the first milestone and the finished product."
          />
          <Reveal className="mt-12">
            <div className="glass mx-auto max-w-4xl overflow-hidden rounded-2xl">
              <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span className="flex items-center gap-2 px-4 py-3">
                  <GitCompareArrows className="size-4" />
                  Aspect
                </span>
                <span className="px-4 py-3 text-[rgb(var(--accent-3))]">Public Beta</span>
                <span className="px-4 py-3 text-[rgb(var(--accent-2))]">Official Launch</span>
              </div>
              {BETA_VS.map((row, i) => (
                <div
                  key={row.aspect}
                  className={
                    'grid grid-cols-[1.1fr_1fr_1fr] text-sm ' +
                    (i % 2 ? 'bg-transparent' : 'bg-muted/20')
                  }
                >
                  <span className="px-4 py-3 font-medium">{row.aspect}</span>
                  <span className="px-4 py-3 text-muted-foreground">{row.beta}</span>
                  <span className="px-4 py-3 text-muted-foreground">{row.official}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Eligibility + Devices + Limitations */}
        <section className="mt-20 grid gap-6 lg:grid-cols-3">
          <Reveal>
            <div className="glass h-full rounded-2xl p-6">
              <ShieldCheck className="mb-3 size-6 text-[rgb(var(--accent-1))]" />
              <h3 className="font-heading text-lg font-semibold">Eligibility & access</h3>
              <ul className="mt-4 space-y-2.5">
                {BETA_ELIGIBILITY.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="glass h-full rounded-2xl p-6">
              <Monitor className="mb-3 size-6 text-[rgb(var(--accent-3))]" />
              <h3 className="font-heading text-lg font-semibold">Supported devices</h3>
              <ul className="mt-4 space-y-3">
                {BETA_DEVICES.map((x) => (
                  <li key={x.title}>
                    <p className="text-sm font-medium">{x.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{x.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="glass h-full rounded-2xl p-6">
              <AlertTriangle className="mb-3 size-6 text-[rgb(var(--accent-2))]" />
              <h3 className="font-heading text-lg font-semibold">Known limitations</h3>
              <ul className="mt-4 space-y-2.5">
                {BETA_LIMITATIONS.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent-2))]" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        {/* FAQs */}
        <section className="mt-20">
          <SectionHeading
            center
            eyebrow="FAQ"
            title="Beta questions, answered"
            subtitle="Everything you need to know before joining the Public Beta."
          />
          <div className="mt-12">
            <BetaFaqs />
          </div>
        </section>

        {/* Final CTA */}
        <Reveal className="mt-20">
          <div className="gh-banner-ring rounded-3xl">
            <div className="glass-strong flex flex-col items-center gap-5 rounded-[23px] p-8 text-center md:flex-row md:justify-between md:text-left">
              <div>
                <h3 className="font-heading text-2xl font-semibold text-balance">
                  Be a founding tester
                </h3>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Join the waitlist to secure early-access consideration, a founder badge and
                  development updates as we build toward launch.
                </p>
              </div>
              <GhButton className="shrink-0" onClick={openWaitlist}>
                Join the Waitlist
              </GhButton>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  )
}
