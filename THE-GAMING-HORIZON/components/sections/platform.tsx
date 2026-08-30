'use client'

import { useState, type ComponentType } from 'react'
import { motion } from 'framer-motion'
import {
  Gamepad2,
  Sparkles,
  UserCircle2,
  Trophy,
  Users,
  UserPlus,
  Star,
  BarChart3,
  Library,
  CalendarDays,
  Wand2,
  Code2,
  Palette,
  Swords,
} from 'lucide-react'
import { SectionHeading, DetailButton, Reveal } from '@/components/ui/primitives'
import { MODULES } from '@/lib/data'

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  games: Gamepad2,
  ai: Sparkles,
  profiles: UserCircle2,
  achievements: Trophy,
  communities: Users,
  friends: UserPlus,
  reviews: Star,
  leaderboards: BarChart3,
  collections: Library,
  events: CalendarDays,
  recommendations: Wand2,
  developer: Code2,
  creator: Palette,
  tournaments: Swords,
}

export function Platform() {
  const [active, setActive] = useState(MODULES[0].key)
  const activeMod = MODULES.find((m) => m.key === active)!
  const ActiveIcon = ICONS[active] ?? Gamepad2

  const n = MODULES.length
  const R = 43 // percent radius

  return (
    <section id="platform" className="relative scroll-mt-28 px-4 py-20 cq-py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="Platform Ecosystem"
          title="One core, connected to everything"
          subtitle="Gaming Horizon isn't a single feature — it's an ecosystem of modules working together around one intelligent core. Hover a node to explore."
        />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_0.85fr]">
          {/* Interactive diagram — desktop only */}
          <Reveal className="hidden lg:block">
            <div className="relative mx-auto aspect-square w-full max-w-[460px]">
              {/* connecting lines */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                {MODULES.map((m, i) => {
                  const angle = (i / n) * Math.PI * 2 - Math.PI / 2
                  const x = 50 + Math.cos(angle) * R
                  const y = 50 + Math.sin(angle) * R
                  const on = m.key === active
                  return (
                    <line
                      key={m.key}
                      x1="50"
                      y1="50"
                      x2={x}
                      y2={y}
                      stroke={on ? 'rgb(var(--accent-1))' : 'rgb(var(--accent-1)/0.12)'}
                      strokeWidth={on ? 0.6 : 0.25}
                    />
                  )
                })}
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke="rgb(var(--accent-2)/0.14)"
                  strokeWidth="0.2"
                  strokeDasharray="1 1.5"
                />
              </svg>

              {/* center core */}
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-1/2 top-1/2 flex size-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border border-[rgb(var(--accent-1)/0.4)] bg-[rgb(var(--accent-1)/0.1)] text-center shadow-[0_0_60px_-8px_rgb(var(--accent-1)/0.75)] backdrop-blur-sm"
              >
                <ActiveIcon className="size-5 text-[rgb(var(--accent-1))]" />
                <span className="px-1 font-heading text-[11px] font-semibold leading-tight">
                  Gaming
                  <br />
                  Horizon
                </span>
              </motion.div>

              {/* icon nodes */}
              {MODULES.map((m, i) => {
                const angle = (i / n) * Math.PI * 2 - Math.PI / 2
                const x = 50 + Math.cos(angle) * R
                const y = 50 + Math.sin(angle) * R
                const on = m.key === active
                const Icon = ICONS[m.key] ?? Gamepad2
                return (
                  <button
                    key={m.key}
                    onMouseEnter={() => setActive(m.key)}
                    onFocus={() => setActive(m.key)}
                    onClick={() => setActive(m.key)}
                    aria-label={m.name}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  >
                    <span
                      className={`flex items-center justify-center rounded-full border transition-all duration-300 ${
                        on
                          ? 'size-12 border-[rgb(var(--accent-1))] bg-[rgb(var(--accent-1)/0.2)] text-[rgb(var(--accent-1))] shadow-[0_0_20px_2px_rgb(var(--accent-1)/0.6)]'
                          : 'size-10 border-border bg-muted/70 text-muted-foreground backdrop-blur-sm hover:border-[rgb(var(--accent-1)/0.5)] hover:text-foreground'
                      }`}
                    >
                      <Icon className={on ? 'size-5' : 'size-4'} />
                    </span>
                    {/* hover/active tooltip */}
                    <span
                      className={`glass-strong pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium shadow-lg transition-opacity duration-200 ${
                        on ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {m.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </Reveal>

          {/* Interactive module chips — mobile / tablet */}
          <Reveal className="lg:hidden">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MODULES.map((m) => {
                const on = m.key === active
                const Icon = ICONS[m.key] ?? Gamepad2
                return (
                  <button
                    key={m.key}
                    onClick={() => setActive(m.key)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                      on
                        ? 'border-[rgb(var(--accent-1)/0.6)] bg-[rgb(var(--accent-1)/0.16)] text-foreground'
                        : 'glass text-muted-foreground'
                    }`}
                  >
                    <Icon className="size-4 shrink-0 text-[rgb(var(--accent-1))]" />
                    <span className="truncate">{m.name}</span>
                  </button>
                )
              })}
            </div>
          </Reveal>

          {/* preview panel */}
          <Reveal delay={0.1}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass flex min-h-[280px] flex-col justify-center rounded-3xl p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[rgb(var(--accent-1)/0.16)] text-[rgb(var(--accent-1))]">
                  <ActiveIcon className="size-5" />
                </span>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[rgb(var(--accent-1))]">
                  Module
                </p>
              </div>
              <h3 className="mt-4 font-heading text-2xl font-semibold">{activeMod.name}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{activeMod.desc}</p>
              <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs">
                <span className="size-1.5 rounded-full bg-[rgb(var(--accent-3))]" />
                Expected: {activeMod.eta}
              </div>
              <div className="mt-6">
                <DetailButton href="/platform" label="Explore all modules" />
              </div>
            </motion.div>
          </Reveal>
        </div>
      </div>

      {/* bottom gradient fade into the next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background"
      />
    </section>
  )
}
