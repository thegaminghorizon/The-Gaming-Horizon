'use client'

import { PageHeader } from '@/components/page-header'
import { Platform as PlatformDiagram } from '@/components/sections/platform'
import { Reveal, GhButton, SectionHeading } from '@/components/ui/primitives'
import { MODULES } from '@/lib/data'
import { useUI } from '@/components/providers/ui-provider'

export default function PlatformPage() {
  const { openWaitlist } = useUI()
  return (
    <main id="connected-ecosystem" className="relative scroll-mt-32">
      <PageHeader
        eyebrow="The Ecosystem"
        title={<>One platform. <span className="gh-text-gradient">Every layer of play.</span></>}
        subtitle="Gaming Horizon is not a single feature — it is a connected system where discovery, play, identity, community and progression reinforce each other. Here is every module and when it arrives."
      >
        <GhButton onClick={openWaitlist} size="lg">Join the Waitlist</GhButton>
        <GhButton href="/roadmap" variant="glass" size="lg">See the Roadmap</GhButton>
      </PageHeader>

      <section id="player-experience" className="scroll-mt-32 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <PlatformDiagram />
        </div>
      </section>

      <section id="platform-modules" className="scroll-mt-32 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            center
            eyebrow="Module by module"
            title="What each part of the ecosystem does"
            subtitle="Every module is being designed to feel native to the browser — instant, connected and premium."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m, i) => (
              <Reveal key={m.key} delay={(i % 3) * 0.05}>
                <div id={`module-${m.key}`} className="glass gh-card-hover h-full scroll-mt-32 rounded-2xl p-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 data-focus-target className="font-heading text-lg font-semibold outline-none">{m.name}</h3>
                    <span className="rounded-full border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.08)] px-2.5 py-1 text-[11px] font-medium text-foreground/80">
                      {m.eta}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
