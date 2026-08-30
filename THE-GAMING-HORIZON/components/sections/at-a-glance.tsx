'use client'

import {
  Sparkles,
  CalendarClock,
  Rocket,
  MousePointerClick,
  Wallet,
  Globe,
} from 'lucide-react'
import { Reveal, Pill, SpringCard } from '@/components/ui/primitives'

const FACTS = [
  {
    icon: Sparkles,
    label: 'What it is',
    value: 'Browser gaming ecosystem',
    sub: 'Discover, play, progress — one home',
  },
  {
    icon: MousePointerClick,
    label: 'How you play',
    value: 'Instantly, in-browser',
    sub: 'No downloads, no installs, ever',
  },
  {
    icon: CalendarClock,
    label: 'Public Beta',
    value: '1 Jan 2027',
    sub: 'First public milestone',
  },
  {
    icon: Rocket,
    label: 'Official Launch',
    value: '1 Mar 2028',
    sub: 'The complete platform',
  },
  {
    icon: Wallet,
    label: 'Price',
    value: 'Free to play',
    sub: 'Core experience in your browser',
  },
  {
    icon: Globe,
    label: 'Where it runs',
    value: 'Every modern browser',
    sub: 'Desktop and mobile',
  },
]

export function AtAGlance() {
  return (
    <section id="at-a-glance" className="relative scroll-mt-24 px-4 py-20 cq-py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <Pill className="mb-5">The project in 30 seconds</Pill>
          <h2 className="font-heading text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            Gaming Horizon at a glance
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
            A quick snapshot of what we&apos;re building, how it works, and when it arrives —
            so you know exactly where the project stands today.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FACTS.map((f, i) => {
            const Icon = f.icon
            return (
              <SpringCard key={f.label} delay={i * 0.06} className="h-full">
                <div className="glass gh-card-hover h-full rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {f.label}
                    </span>
                  </div>
                  <p className="mt-4 font-heading text-xl font-semibold">{f.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.sub}</p>
                </div>
              </SpringCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
