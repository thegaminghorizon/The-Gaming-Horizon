'use client'

import { Puzzle, Home, Sparkles, Trophy } from 'lucide-react'
import { SectionHeading, DetailButton, Reveal } from '@/components/ui/primitives'

const POINTS = [
  { icon: Puzzle, title: 'Fragmented today', desc: 'Browser games are scattered across dated portals, buried in ads and impossible to track across.' },
  { icon: Home, title: 'One premium home', desc: 'A single, beautiful place to discover, play, progress and belong — built like a real product.' },
  { icon: Sparkles, title: 'Intelligent discovery', desc: 'An AI companion that understands your mood, time and device instead of endless scrolling.' },
  { icon: Trophy, title: 'Progression that follows you', desc: 'Profiles, achievements and communities that persist across every game you play.' },
]

export function Vision() {
  return (
    <section id="vision" className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="The Vision"
          title="Browser gaming deserves a better home"
          subtitle="Instant play made browser games accessible, but accessibility alone never created a complete platform. Gaming Horizon exists to connect discovery, identity, progression, and community without sacrificing the speed that made the browser special."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {POINTS.map((p, i) => {
            const Icon = p.icon
            return (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="glass glow-hover h-full rounded-3xl p-7">
                  <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="font-heading text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.15} className="mt-10 flex justify-center">
          <DetailButton href="/vision" />
        </Reveal>
      </div>
    </section>
  )
}
