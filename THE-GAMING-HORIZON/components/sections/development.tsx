'use client'

import { SectionHeading, DetailButton, Reveal } from '@/components/ui/primitives'
import { DevDashboard } from '@/components/dev-dashboard'

export function Development() {
  return (
    <section id="development" className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="Development Progress"
          title="Built in the open, tracked honestly"
          subtitle="Verified milestones remain the source of truth. A lightweight schedule layer advances in small daily steps, while manual overrides let the team reflect real work completed ahead of plan."
        />

        <Reveal className="mt-14">
          <DevDashboard limit={6} />
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex justify-center">
          <DetailButton href="/roadmap#development" label="Open Development Hub" />
        </Reveal>
      </div>
    </section>
  )
}
