'use client'

import { Coffee, Swords, Compass, Code2 } from 'lucide-react'
import { SectionHeading, Reveal } from '@/components/ui/primitives'

const PERSONAS = [
  {
    icon: Coffee,
    who: 'The casual player',
    tag: 'Play in a break',
    desc: 'Wants to jump into a quick, fun game between tasks — no setup, no commitment. Gets instant sessions, short-session picks and easy pick-up-anywhere play.',
  },
  {
    icon: Swords,
    who: 'The competitor',
    tag: 'Climb the ranks',
    desc: 'Lives for leaderboards and skill. Gets ranked play, achievements, rivals, stats and multiplayer titles worth mastering — all tied to one profile.',
  },
  {
    icon: Compass,
    who: 'The explorer',
    tag: 'Find hidden gems',
    desc: 'Loves discovering something new. Gets AI-powered recommendations, curated collections, trending titles and genres tuned to their taste and mood.',
  },
  {
    icon: Code2,
    who: 'The creator',
    tag: 'Build & publish',
    desc: 'Makes browser games and wants players. A future developer platform and creator tools will make it easy to publish, reach an audience and grow.',
  },
]

export function WhoItsFor() {
  return (
    <section className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="Who it's for"
          title="Built for everyone who plays"
          subtitle="Whether you have five minutes or five hours, whether you chase ranks or hidden gems — Gaming Horizon is designed around how you actually play."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONAS.map((p, i) => {
            const Icon = p.icon
            return (
              <Reveal key={p.who} delay={i * 0.08}>
                <div className="glass gh-card-hover flex h-full flex-col rounded-3xl p-6">
                  <span className="grid size-14 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                    <Icon className="size-7" />
                  </span>
                  <span className="mt-5 w-fit rounded-full border border-[rgb(var(--accent-1)/0.35)] bg-[rgb(var(--accent-1)/0.08)] px-2.5 py-0.5 text-[11px] font-medium text-[rgb(var(--accent-1))]">
                    {p.tag}
                  </span>
                  <h3 className="mt-3 font-heading text-lg font-semibold">{p.who}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
