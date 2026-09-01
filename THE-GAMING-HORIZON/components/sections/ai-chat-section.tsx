'use client'

import { Sparkles, MessageCircle, Zap } from 'lucide-react'
import { SectionHeading, Reveal } from '@/components/ui/primitives'
import { AiChat } from '@/components/ai-chat'

const CALLOUTS = [
  {
    icon: MessageCircle,
    title: 'Ask anything',
    desc: 'Games, features, the beta, the roadmap, the AI — no topic is off-limits.',
  },
  {
    icon: Zap,
    title: 'Instant answers',
    desc: 'No waiting. The companion responds in under a second with context-aware replies.',
  },
  {
    icon: Sparkles,
    title: 'Quick-reply chips',
    desc: 'Every answer comes with follow-up suggestions so the conversation flows naturally.',
  },
]

export function AiChatSection() {
  return (
    <section
      id="ai-chat"
      className="relative scroll-mt-28 px-4 py-20 cq-py-28"
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 0%, rgb(var(--accent-2)/0.14), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="Talk to the Companion"
          title="Ask the AI anything about Gaming Horizon"
          subtitle="The companion knows every game, every feature, the entire roadmap, and the full beta timeline. Type a question or pick a suggested topic."
        />

        <Reveal className="mt-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Chat */}
            <AiChat />

            {/* Side callouts */}
            <div className="flex flex-col gap-4">
              {CALLOUTS.map((c, i) => (
                <Reveal key={c.title} delay={i * 0.06}>
                  <div className="glass glow-hover rounded-2xl p-5">
                    <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                      <c.icon className="size-5" />
                    </div>
                    <h3 className="font-heading mb-1.5 text-base font-semibold">{c.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                  </div>
                </Reveal>
              ))}

              {/* Scope note */}
              <Reveal delay={0.18}>
                <div className="rounded-2xl border border-[rgb(var(--accent-1)/0.2)] bg-[rgb(var(--accent-1)/0.05)] p-4 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground/80">Pre-launch companion.</span>{' '}
                  This is a frontend-only preview of the AI Companion. The full
                  personalised recommendation engine — learning your taste across games
                  — launches with the Public Beta on 1 January 2027.
                </div>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
