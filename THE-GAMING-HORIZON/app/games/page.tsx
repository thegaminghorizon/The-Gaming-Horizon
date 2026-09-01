'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { GameCard } from '@/components/game-card'
import { GhButton } from '@/components/ui/primitives'
import { GAMES, type BetaStatus } from '@/lib/data'
import { useUI } from '@/components/providers/ui-provider'

const FILTERS: ('All' | BetaStatus)[] = ['All', 'Browser Ready', 'Planned for Beta', 'Under Review']

export default function GamesPage() {
  const { openWaitlist } = useUI()
  const [filter, setFilter] = useState<'All' | BetaStatus>('All')
  const games = filter === 'All' ? GAMES : GAMES.filter((g) => g.status === filter)

  return (
    <main id="games-library" className="relative scroll-mt-32">
      <PageHeader
        eyebrow="Featured Library"
        title={<>Real browser games, <span className="gh-text-gradient">planned for beta.</span></>}
        subtitle="These are titles we are preparing for the Public Beta — not playable here yet. Each one is being evaluated for instant-play, multiplayer and AI recommendation support."
      >
        <GhButton onClick={openWaitlist} size="lg">Join the Waitlist</GhButton>
      </PageHeader>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  filter === f
                    ? 'border-[rgb(var(--accent-1)/0.5)] bg-[rgb(var(--accent-1)/0.16)] text-foreground'
                    : 'border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g, i) => (
              <GameCard key={g.name} game={g} index={i} />
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Games are shown for preview only and are not playable on this site. Availability and compatibility may change before the beta.
          </p>
        </div>
      </section>
    </main>
  )
}
