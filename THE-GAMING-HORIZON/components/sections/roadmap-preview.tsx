'use client'

import { SectionHeading, DetailButton, Reveal } from '@/components/ui/primitives'
import { RoadmapTimeline } from '@/components/roadmap-timeline'

export function RoadmapPreview() {
  return (
    <section id="roadmap" className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="Roadmap"
          title="The road to launch"
          subtitle="From foundation to the official 2028 launch — a clear, milestone-driven path. Expand any milestone for detail."
        />

        <Reveal className="mt-14">
          <RoadmapTimeline />
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex justify-center">
          <DetailButton href="/roadmap" label="View detailed roadmap" />
        </Reveal>
      </div>
    </section>
  )
}
