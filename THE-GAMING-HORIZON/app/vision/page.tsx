import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/ui/primitives'
import { WaitlistCTA } from '@/components/waitlist-cta'
import { Compass, Layers, Users, Sparkles, ShieldCheck, Infinity as Inf } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Vision',
  description:
    'Why Gaming Horizon exists — a manifesto for a better browser gaming ecosystem: unified discovery, instant play, community, progression and intelligent AI.',
}

const PILLARS = [
  { icon: Compass, title: 'Discovery, reimagined', desc: 'No more digging through cluttered portals. Intelligent, personal discovery that surfaces the right game for the right moment.' },
  { icon: Layers, title: 'One unified home', desc: 'Every game, profile, achievement and friend in a single, coherent product — not a dozen disconnected sites.' },
  { icon: Users, title: 'Community at the core', desc: 'Games are better together. Communities, friends and events are first-class citizens, not afterthoughts.' },
  { icon: Sparkles, title: 'Intelligence everywhere', desc: 'An AI companion that understands intent, time and device to make gaming effortless and delightful.' },
  { icon: ShieldCheck, title: 'Respect by default', desc: 'Privacy-first, no dark patterns, no pay-to-win pressure. A platform built to earn trust.' },
  { icon: Inf, title: 'Play that persists', desc: 'Progression, collections and identity that follow you across every game, forever.' },
]

const GOALS = [
  { year: '2027', title: 'Prove the foundation', desc: 'Ship a real, usable beta that demonstrates instant play, AI discovery and unified profiles.' },
  { year: '2027–2028', title: 'Grow with the community', desc: 'Expand the library, add communities, tournaments and events driven by player feedback.' },
  { year: '2028+', title: 'Open the ecosystem', desc: 'Launch the developer platform and creator tools so anyone can build and publish for the horizon.' },
]

export default function VisionPage() {
  return (
    <main id="vision-overview" className="relative scroll-mt-32">
      <PageHeader
        eyebrow="The Vision"
        title={<>Browser gaming deserves a <span className="text-gradient">better home</span></>}
        subtitle="A manifesto for what instant play could be — and why we are building Gaming Horizon."
      />

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="glass rounded-3xl p-8 md:p-10">
              <p className="text-lg leading-relaxed text-muted-foreground">
                <span className="font-heading text-foreground">Browser gaming is the most accessible way to play</span> —
                no downloads, no installs, no expensive hardware. Yet for over a
                decade the experience around it has stayed broken. Games are
                scattered across dated portals buried in ads. Progress never
                follows you. Discovery is a slot machine. Communities are an
                afterthought.
              </p>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                Gaming Horizon exists to fix this. We are building a single,
                premium home for discovery, play, community, progression and AI —
                designed with the craft of a modern product, not the clutter of a
                legacy portal. A place where you click and play, where an AI
                companion understands how you want to spend your time, and where
                your identity and achievements are yours across every game.
              </p>
              <p className="mt-5 text-lg leading-relaxed text-foreground">
                This is not a games list. It is an ecosystem — and it deserves to
                be built properly.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center font-heading text-2xl font-semibold sm:text-3xl">
            Our design philosophy
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p, i) => {
              const Icon = p.icon
              return (
                <Reveal key={p.title} delay={i * 0.06}>
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
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center font-heading text-2xl font-semibold sm:text-3xl">
            Long-term goals
          </h2>
          <div className="flex flex-col gap-4">
            {GOALS.map((g, i) => (
              <Reveal key={g.title} delay={i * 0.08}>
                <div className="glass flex flex-col gap-3 rounded-3xl p-7 sm:flex-row sm:items-center sm:gap-8">
                  <span className="font-heading text-2xl font-semibold text-gradient sm:w-40">
                    {g.year}
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-semibold">{g.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{g.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WaitlistCTA />
    </main>
  )
}
