'use client'

import { PageHeader } from '@/components/page-header'
import { AiCompanion } from '@/components/sections/ai-companion'
import { Reveal, GhButton, SectionHeading } from '@/components/ui/primitives'
import { AiChat } from '@/components/ai-chat'
import { useUI } from '@/components/providers/ui-provider'
import { Brain, Shield, Sparkles, Clock, Gauge, Users } from 'lucide-react'

const PRINCIPLES = [
  { icon: Brain, title: 'Context over queries', desc: 'The companion reasons about your mood, time budget and device — not just keywords you type.' },
  { icon: Sparkles, title: 'Explainable picks', desc: 'Every recommendation comes with a clear reason, so you always know why a game fits.' },
  { icon: Shield, title: 'Privacy by design', desc: 'Built to work with minimal data. You control what is shared, and nothing is sold.' },
  { icon: Clock, title: 'Time-aware', desc: 'Got five minutes or an hour? Suggestions adapt to the session you actually have.' },
  { icon: Gauge, title: 'Device-aware', desc: 'Low-end laptop or flagship phone, it only surfaces games that will run beautifully.' },
  { icon: Users, title: 'Social signal', desc: 'See what friends are playing and get picks that turn into shared sessions.' },
]

const USE_CASES = [
  '"I have 10 minutes and want something relaxing" → calm, short-session picks.',
  '"Find me a competitive shooter my friends already play" → ranked titles with presence.',
  '"Something that runs on my old Chromebook" → featherweight, browser-native games.',
  '"Surprise me with a hidden gem" → underrated titles tuned to your taste.',
]

export default function AiPage() {
  const { openWaitlist } = useUI()
  return (
    <main id="ai-companion" className="relative scroll-mt-32">
      <PageHeader
        eyebrow="AI Companion"
        title={<>Discovery that <span className="gh-text-gradient">actually understands you.</span></>}
        subtitle="Not a chatbot bolted onto a store. The Gaming Horizon AI Companion is a discovery engine that reasons about how you want to play right now — and tells you why each game fits."
      >
        <GhButton onClick={openWaitlist} size="lg">Join the Waitlist</GhButton>
      </PageHeader>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <AiCompanion />
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading center eyebrow="How it thinks" title="The principles behind the companion" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 0.05}>
                <div className="glass gh-card-hover h-full rounded-2xl p-6">
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                    <p.icon className="size-5" />
                  </div>
                  <h3 className="font-heading mb-2 text-lg font-semibold">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-3xl">
          <SectionHeading center eyebrow="Example use cases" title="Just say what you feel like" />
          <div className="mt-10 space-y-3">
            {USE_CASES.map((u, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="glass rounded-xl px-5 py-4 text-sm leading-relaxed text-foreground/90">
                  {u}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Chat ── */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            center
            eyebrow="Talk to the Companion"
            title="Ask the AI anything"
            subtitle="Type any question about Gaming Horizon — games, beta, features, the roadmap, or anything else."
          />
          <Reveal className="mt-10">
            <AiChat />
          </Reveal>
          <Reveal delay={0.08} className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Pre-launch preview. The full personalised engine launches with the Public Beta on{' '}
              <span className="font-medium text-foreground/70">1 January 2027</span>.
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
