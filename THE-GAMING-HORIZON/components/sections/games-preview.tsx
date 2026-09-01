'use client'

import { SectionHeading, DetailButton, Reveal } from '@/components/ui/primitives'
import { GameCard } from '@/components/game-card'
import { GAMES } from '@/lib/data'

export function GamesPreview() {
  return (
    <section id="games" className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="Featured Games"
          title="Real browser games, planned for beta"
          subtitle="A preview of titles being prepared for the Gaming Horizon library. None are playable yet — every card shows its current beta status."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {GAMES.slice(0, 8).map((g, i) => (
            <GameCard key={g.name} game={g} index={i} />
          ))}
        </div>

        <Reveal delay={0.1} className="mt-10 flex justify-center">
          <DetailButton href="/games" label="Explore full library" />
        </Reveal>
      </div>
    </section>
  )
}
