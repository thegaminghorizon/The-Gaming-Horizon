'use client'

import { SectionHeading, DetailButton, Reveal } from '@/components/ui/primitives'
import { FaqList } from '@/components/faq-list'

export function FaqPreview() {
  return (
    <section id="faq" className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="FAQ"
          title="Questions, answered"
          subtitle="The essentials about Gaming Horizon, the beta and what comes next."
        />

        <Reveal className="mt-14">
          <FaqList limit={6} withAsk />
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex justify-center">
          <DetailButton href="/faq" label="Read the full FAQ" />
        </Reveal>
      </div>
    </section>
  )
}
