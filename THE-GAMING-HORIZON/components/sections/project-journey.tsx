'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, Rocket, Flag } from 'lucide-react'
import { SectionHeading, Reveal } from '@/components/ui/primitives'
import { ROADMAP_MILESTONES, resolveMilestones } from '@/lib/milestones'
import { useMilestoneClock } from '@/lib/use-milestone-clock'

const STAGES = [
  {
    id: 'architecture',
    icon: Loader2,
    phase: 'Pre-Launch',
    when: 'Now · 2026',
    desc: 'Architecture, design, frontend, and backend are being built in public. Manual project updates remain the source of truth for engineering completion.',
  },
  {
    id: 'public-beta',
    icon: Rocket,
    phase: 'Public Beta',
    when: '1 Jan 2027',
    desc: 'The first public milestone: a growing browser-game library, early AI Companion, and player feedback that guides the platform.',
  },
  {
    id: 'community-testing',
    icon: CheckCircle2,
    phase: 'Community Testing',
    when: '2027',
    desc: 'An open feedback period, iterative releases, new modules, and a growing game library as the ecosystem matures with players.',
  },
  {
    id: 'official-launch',
    icon: Flag,
    phase: 'Official Launch',
    when: '1 Mar 2028',
    desc: 'The complete Gaming Horizon ecosystem arrives for everyone at its configured Asia/Kolkata launch timestamp.',
  },
] as const

export function ProjectJourney() {
  const now = useMilestoneClock()
  const resolved = useMemo(() => resolveMilestones(ROADMAP_MILESTONES, now), [now])

  return (
    <section className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="The journey"
          title="You are here"
          subtitle="Gaming Horizon is being built toward two clear public milestones. Date-driven launch events update automatically, while engineering completion remains explicitly verified through project updates."
        />

        <div className="relative mt-16 grid gap-6 md:grid-cols-4">
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px md:block"
            style={{
              background: 'linear-gradient(90deg, rgb(var(--accent-1)/0.5), rgb(var(--accent-2)/0.35) 33%, rgb(var(--border)) 66%, rgb(var(--border)))',
            }}
          />
          {STAGES.map((stage, index) => {
            const milestone = resolved.find((item) => item.id === stage.id)
            const Icon = stage.icon
            const active = milestone?.state === 'In Progress'
            const completed = milestone?.state === 'Completed'
            const reached = milestone?.state === 'Scheduled Reached'
            const highlighted = active || milestone?.state === 'Major Launch'

            return (
              <Reveal key={stage.phase} delay={index * 0.1} className="relative">
                <div className={`glass gh-card-hover h-full rounded-3xl p-6 ${active ? 'glow-accent' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`relative grid size-14 place-items-center rounded-2xl ${
                        active || highlighted || completed || reached
                          ? 'bg-[rgb(var(--accent-1)/0.16)] text-[rgb(var(--accent-1))]'
                          : 'bg-muted/60 text-muted-foreground'
                      }`}
                    >
                      <Icon className={`size-6 ${active ? 'animate-spin-slow' : ''}`} />
                      {active && (
                        <motion.span
                          className="absolute inset-0 rounded-2xl ring-2 ring-[rgb(var(--accent-1)/0.5)]"
                          animate={{ opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 2.4, repeat: Infinity }}
                        />
                      )}
                    </span>
                    {milestone && (
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                        completed
                          ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
                          : reached
                            ? 'bg-amber-500/12 text-amber-700 dark:text-amber-300'
                            : 'bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]'
                      }`}>
                        {milestone.statusLabel}
                      </span>
                    )}
                  </div>
                  <p className="mt-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">{stage.when}</p>
                  <h3 className="mt-1 font-heading text-lg font-semibold">{stage.phase}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stage.desc}</p>
                  {milestone && <span className="sr-only">{milestone.accessibleStatus}</span>}
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
