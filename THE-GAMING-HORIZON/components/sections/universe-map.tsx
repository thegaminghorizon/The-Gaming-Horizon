'use client'

import { useMemo, useState, type ComponentType } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Bot,
  CalendarDays,
  Gamepad2,
  Sparkles,
  Trophy,
  Users,
  Medal,
} from 'lucide-react'
import { DetailButton, Reveal, SectionHeading } from '@/components/ui/primitives'
import { useSettings } from '@/components/providers/settings-provider'

interface UniverseNode {
  key: string
  name: string
  description: string
  details: string[]
  outcome: string
  x: number
  y: number
  icon: ComponentType<{ className?: string }>
}

const NODES: UniverseNode[] = [
  { key: 'ai', name: 'AI Companion', description: 'Natural game discovery, platform guidance and recommendations shaped around each session.', details: ['Understands mood, genre and session length', 'Explains why each recommendation fits', 'Answers platform and beta questions'], outcome: 'Helps players move from “I do not know what to play” to a confident choice.', x: 50, y: 9, icon: Bot },
  { key: 'games', name: 'Games', description: 'A curated universe of instant-play browser games with no downloads or installations.', details: ['Curated categories and collections', 'Search, favorites and recent activity', 'Game pages with controls and compatibility'], outcome: 'Makes discovering and starting a browser game feel immediate and trustworthy.', x: 13, y: 31, icon: Gamepad2 },
  { key: 'community', name: 'Community', description: 'Places for players to discuss games, share feedback and build communities around what they play.', details: ['Game-focused discussions and clubs', 'Bug reports and feature suggestions', 'Community discovery built around interests'], outcome: 'Turns isolated play sessions into shared conversations and useful feedback.', x: 87, y: 31, icon: Users },
  { key: 'leaderboards', name: 'Leaderboards', description: 'Global, seasonal and friend-based rankings that make every achievement visible.', details: ['Global and seasonal rankings', 'Game-specific performance views', 'Future friend and community comparisons'], outcome: 'Gives progress a visible, competitive layer without replacing casual play.', x: 18, y: 75, icon: Trophy },
  { key: 'achievements', name: 'Achievements', description: 'Cross-game XP, badges and milestones that create one connected player journey.', details: ['Cross-game XP and player levels', 'Founder and beta participation badges', 'Progress tracking with rarity indicators'], outcome: 'Connects activity across many games into one meaningful player identity.', x: 50, y: 91, icon: Medal },
  { key: 'events', name: 'Events', description: 'Seasonal challenges, tournaments and special experiences that keep the universe moving.', details: ['Seasonal challenges and collections', 'Community tournaments and milestones', 'Time-limited discovery experiences'], outcome: 'Creates fresh reasons to return while highlighting different parts of the catalog.', x: 82, y: 75, icon: CalendarDays },
]

export function UniverseMap() {
  const systemReducedMotion = useReducedMotion()
  const { settings } = useSettings()
  const reduceMotion = systemReducedMotion || settings.motionMode !== 'full'
  const [active, setActive] = useState('games')
  const selected = useMemo(() => NODES.find((node) => node.key === active) ?? NODES[0], [active])
  const ActiveIcon = selected.icon

  return (
    <section id="universe" className="relative scroll-mt-32 overflow-hidden px-4 py-20 cq-py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="The Connected Universe"
          title={<>Explore the <span className="text-gradient">Gaming Horizon</span></>}
          subtitle="Every part of the platform connects back to one shared player experience. Hover, focus or tap a node to see how the universe fits together."
        />

        <div className="mt-14 grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <div className="glass-strong relative mx-auto aspect-square w-full max-w-[620px] overflow-hidden rounded-[2.5rem] border border-[rgb(var(--accent-1)/0.22)] p-4 shadow-[0_30px_100px_-50px_rgb(var(--accent-1)/0.75)] sm:p-8">
              <div aria-hidden className="absolute inset-[12%] rounded-full border border-[rgb(var(--accent-2)/0.14)]" />
              <div aria-hidden className="absolute inset-[24%] rounded-full border border-dashed border-[rgb(var(--accent-3)/0.2)]" />
              <motion.div aria-hidden className="absolute inset-[18%] rounded-full border border-[rgb(var(--accent-1)/0.16)]" animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 32, repeat: Infinity, ease: 'linear' }} />

              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
                <defs>
                  <linearGradient id="universe-line" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="rgb(var(--accent-1))" />
                    <stop offset="0.5" stopColor="rgb(var(--accent-2))" />
                    <stop offset="1" stopColor="rgb(var(--accent-3))" />
                  </linearGradient>
                </defs>
                {NODES.map((node) => {
                  const isActive = node.key === active
                  return (
                    <line
                      key={node.key}
                      x1="50"
                      y1="50"
                      x2={node.x}
                      y2={node.y}
                      stroke={isActive ? 'url(#universe-line)' : 'rgb(var(--accent-1) / 0.56)'}
                      strokeWidth={isActive ? 0.9 : 0.62}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      opacity={isActive ? 1 : 0.9}
                      className="transition-[stroke,stroke-width] duration-200"
                    />
                  )
                })}
              </svg>

              <motion.button
                type="button"
                onClick={() => setActive('games')}
                className="absolute left-1/2 top-1/2 z-20 flex size-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[rgb(var(--accent-1)/0.48)] bg-background/75 text-center shadow-[0_0_70px_-10px_rgb(var(--accent-1)/0.9)] backdrop-blur-xl sm:size-40"
                animate={reduceMotion ? undefined : { scale: [1, 1.035, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                aria-label="Gaming Horizon center"
              >
                <Sparkles className="mb-2 size-5 text-[rgb(var(--accent-1))]" />
                <span className="font-heading text-sm font-bold sm:text-lg">Gaming<br />Horizon</span>
                <span className="mt-1 text-[9px] uppercase tracking-[0.25em] text-muted-foreground sm:text-[10px]">Connected Core</span>
              </motion.button>

              {NODES.map((node) => {
                const Icon = node.icon
                const isActive = node.key === active
                return (
                  <button
                    key={node.key}
                    type="button"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    onMouseEnter={() => setActive(node.key)}
                    onFocus={() => setActive(node.key)}
                    onClick={() => setActive(node.key)}
                    className="group absolute z-30 -translate-x-1/2 -translate-y-1/2 text-center"
                    aria-label={`Preview ${node.name}`}
                  >
                    <motion.span
                      className={`mx-auto flex size-11 items-center justify-center rounded-2xl border backdrop-blur-md transition-colors sm:size-14 ${isActive ? 'border-[rgb(var(--accent-1))] bg-[rgb(var(--accent-1)/0.2)] text-[rgb(var(--accent-1))] shadow-[0_0_28px_rgb(var(--accent-1)/0.55)]' : 'border-border bg-card/70 text-muted-foreground group-hover:text-foreground'}`}
                      animate={reduceMotion ? undefined : isActive ? { y: [0, -3, 0] } : { y: 0 }}
                      transition={{ duration: 2.2, repeat: isActive ? Infinity : 0 }}
                    >
                      <Icon className="size-5 sm:size-6" />
                    </motion.span>
                    <span className={`mt-1.5 block whitespace-nowrap text-[10px] font-semibold sm:text-xs ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{node.name}</span>
                  </button>
                )
              })}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <motion.article
              key={selected.key}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-7 md:p-9"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                <ActiveIcon className="size-6" />
              </div>
              <p className="mt-6 text-label text-[rgb(var(--accent-1))]">Connected Module</p>
              <h3 className="mt-2 font-heading text-3xl font-bold">{selected.name}</h3>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{selected.description}</p>
              <div className="mt-6 grid gap-2.5">
                {selected.details.map((detail) => (
                  <div key={detail} className="flex items-start gap-3 rounded-2xl border border-[rgb(var(--accent-1)/0.18)] bg-[rgb(var(--accent-1)/0.05)] px-4 py-3 text-sm leading-relaxed">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent-1))] shadow-[0_0_10px_rgb(var(--accent-1)/0.8)]" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-border bg-background/45 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Player value</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{selected.outcome}</p>
              </div>
              <div className="mt-7"><DetailButton href="/platform" label="Explore the ecosystem in detail" /></div>
            </motion.article>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
