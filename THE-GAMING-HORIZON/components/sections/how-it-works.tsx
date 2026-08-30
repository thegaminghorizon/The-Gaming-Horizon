'use client'

import { motion } from 'framer-motion'
import { Compass, Zap, Trophy } from 'lucide-react'
import { SectionHeading, Reveal } from '@/components/ui/primitives'

const STEPS = [
  {
    icon: Compass,
    step: '01',
    title: 'Discover',
    desc: 'Browse a curated library or let the AI Companion suggest the perfect game for your mood, time and device — no endless scrolling across scattered portals.',
    points: ['AI recommendations', 'Genre & mood filters', 'Trending and hidden gems'],
  },
  {
    icon: Zap,
    step: '02',
    title: 'Play instantly',
    desc: 'Click once and you are in. Games run directly in your browser with zero downloads, zero installs and sub-second load times on any device.',
    points: ['No downloads', 'Runs in any browser', 'Continue on any device'],
  },
  {
    icon: Trophy,
    step: '03',
    title: 'Progress & connect',
    desc: 'Build one profile that follows you everywhere. Earn achievements, climb leaderboards, add friends, join communities and review the games you love.',
    points: ['Unified profile', 'Achievements & leaderboards', 'Friends & communities'],
  },
]

export function HowItWorks() {
  return (
    <section className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="How It Works"
          title="Three steps, zero friction"
          subtitle="From finding a game to becoming a regular, the entire journey is designed to be instant and effortless."
        />

        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          {/* connecting line */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px md:block"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgb(var(--accent-1)/0.4), rgb(var(--accent-3)/0.4), transparent)',
            }}
          />
          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <Reveal key={s.title} delay={i * 0.12} className="relative">
                <div className="glass gh-card-hover h-full rounded-3xl p-6">
                  <div className="flex items-center justify-between">
                    <motion.span
                      className="relative grid size-16 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]"
                      whileHover={{ scale: 1.06 }}
                    >
                      <Icon className="size-7" />
                    </motion.span>
                    <span className="font-heading text-4xl font-bold text-muted-foreground/25">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="mt-6 font-heading text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                  <ul className="mt-5 flex flex-col gap-2">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm">
                        <span className="size-1.5 rounded-full bg-[rgb(var(--accent-1))]" />
                        <span className="text-muted-foreground">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
