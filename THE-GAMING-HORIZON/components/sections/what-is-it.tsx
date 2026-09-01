'use client'

import { Library, Zap, UserCircle, Users2, X, Check } from 'lucide-react'
import { SectionHeading, Reveal } from '@/components/ui/primitives'

const TRAITS = [
  {
    icon: Library,
    title: 'One unified library',
    desc: 'Every browser game worth playing, curated and organized in a single premium catalog — instead of scattered across dozens of aging portals.',
  },
  {
    icon: Zap,
    title: 'Instant, install-free play',
    desc: 'Games launch directly in your browser in seconds. No downloads, no launchers, no updates, no storage — on any device you already own.',
  },
  {
    icon: UserCircle,
    title: 'One persistent identity',
    desc: 'A single profile carries your achievements, history, collections and rank across every game and every device you sign in from.',
  },
  {
    icon: Users2,
    title: 'A living community',
    desc: 'Friends, communities, reviews, leaderboards and events turn solo sessions into a shared place worth coming back to.',
  },
]

const NOT = ['A single game', 'A downloadable app', 'An emulator or store', 'Available to play yet']
const IS = ['A whole ecosystem', 'Instant in-browser play', 'A discovery + social layer', 'In active development']

export function WhatIsIt() {
  return (
    <section className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="What is Gaming Horizon"
          title="One home for all of browser gaming"
          subtitle="In plain terms: Gaming Horizon is a premium platform that brings discovery, instant play, progression, AI and community together in a single place — the way browser gaming should have worked all along."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {TRAITS.map((t, i) => {
            const Icon = t.icon
            return (
              <Reveal key={t.title} delay={i * 0.08}>
                <div className="glass gh-card-hover flex h-full gap-4 rounded-3xl p-6">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-semibold">{t.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {t.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* What it is / isn't — quick myth-buster for instant clarity */}
        <Reveal delay={0.1}>
          <div className="mt-6 grid gap-6 overflow-hidden rounded-3xl md:grid-cols-2">
            <div className="glass rounded-3xl p-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <span className="grid size-6 place-items-center rounded-full bg-[rgb(244_114_182/0.16)] text-[rgb(244_114_182)]">
                  <X className="size-4" />
                </span>
                What it is not
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {NOT.map((n) => (
                  <li key={n} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <X className="size-4 shrink-0 text-[rgb(244_114_182)]" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-3xl p-6 glow-accent">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <span className="grid size-6 place-items-center rounded-full bg-[rgb(var(--accent-1)/0.18)] text-[rgb(var(--accent-1))]">
                  <Check className="size-4" />
                </span>
                What it is
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {IS.map((n) => (
                  <li key={n} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-[rgb(var(--accent-1))]" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
