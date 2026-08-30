'use client'

import {
  Gamepad2,
  Sparkles,
  UserCircle,
  Award,
  Trophy,
  Users,
  Star,
  Library,
} from 'lucide-react'
import { SectionHeading, Reveal, DetailButton } from '@/components/ui/primitives'

const CAPS = [
  {
    icon: Gamepad2,
    title: 'Instant game library',
    desc: 'A growing catalogue of browser games across every genre, playable in a click.',
  },
  {
    icon: Sparkles,
    title: 'AI recommendations',
    desc: 'A companion that learns your taste and suggests what to play next, with reasoning.',
  },
  {
    icon: UserCircle,
    title: 'Unified profile',
    desc: 'One identity and history that follows you across every game you touch.',
  },
  {
    icon: Award,
    title: 'Achievements',
    desc: 'Cross-game progression, rare unlocks and a showcase of everything you have earned.',
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    desc: 'Global and friends-only rankings that turn any session into a competition.',
  },
  {
    icon: Users,
    title: 'Friends & communities',
    desc: 'Presence, invites, shared sessions and hubs built around the games you love.',
  },
  {
    icon: Star,
    title: 'Reviews',
    desc: 'Trusted, structured reviews from real players to help you decide what to try.',
  },
  {
    icon: Library,
    title: 'Collections',
    desc: 'Curate, save and share personal libraries of your favourite games.',
  },
]

export function Capabilities() {
  return (
    <section className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="What You Can Do"
          title="Everything in one place"
          subtitle="Gaming Horizon brings the tools that today live across a dozen disconnected sites into a single, premium home."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPS.map((c, i) => {
            const Icon = c.icon
            return (
              <Reveal key={c.title} delay={(i % 4) * 0.06}>
                <div className="glass gh-card-hover group h-full rounded-2xl p-5">
                  <span className="grid size-11 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))] transition-transform group-hover:scale-110">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-heading text-base font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {c.desc}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.1} className="mt-10 flex justify-center">
          <DetailButton href="/platform" label="Explore the full ecosystem" />
        </Reveal>
      </div>
    </section>
  )
}
