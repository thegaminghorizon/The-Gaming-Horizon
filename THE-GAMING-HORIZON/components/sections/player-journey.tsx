'use client'

import { motion } from 'framer-motion'
import { Search, MousePointerClick, Play, Trophy, Sparkles, Users, Medal, UserRound, RotateCcw } from 'lucide-react'
import { SectionHeading, Reveal } from '@/components/ui/primitives'

const STEPS = [
  { icon: Search, title: 'Find something worth playing', copy: 'Browse with intent instead of digging through disconnected portals.' },
  { icon: MousePointerClick, title: 'Click once', copy: 'Move from curiosity to gameplay without installs, launchers, or setup.' },
  { icon: Play, title: 'Play instantly', copy: 'The browser becomes the platform, ready wherever a modern device is available.' },
  { icon: Trophy, title: 'Unlock meaningful progress', copy: 'Achievements and milestones stay connected to your Gaming Horizon identity.' },
  { icon: Sparkles, title: 'Discovery gets smarter', copy: 'Recommendations learn from the experiences you choose—not invasive tracking.' },
  { icon: Users, title: 'Find the people around the game', copy: 'Communities, guides, and conversations live beside the experiences they support.' },
  { icon: Medal, title: 'Compete with context', copy: 'Leaderboards and challenges make progress visible across supported games.' },
  { icon: UserRound, title: 'Build your player identity', copy: 'Your profile becomes a lasting record of what you play and accomplish.' },
  { icon: RotateCcw, title: 'Return without starting over', copy: 'Come back tomorrow and continue from one connected home.' },
]

export function PlayerJourney() {
  return (
    <section id="player-journey" className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="The Player Journey"
          title="One connected loop, from discovery to belonging"
          subtitle="Gaming Horizon is designed as an ecosystem rather than a list of links. Each step improves the next, so finding a game, playing it, progressing, and joining its community finally feels continuous."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <Reveal key={step.title} delay={(index % 6) * 0.05}>
                <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="glass glow-hover h-full rounded-3xl p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-11 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]"><Icon className="size-5" /></span>
                    <span className="font-mono text-xs text-muted-foreground/55">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-5 font-heading text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.copy}</p>
                </motion.article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
