'use client'

import { PageHeader } from '@/components/page-header'
import { FaqList } from '@/components/faq-list'
import { GhButton } from '@/components/ui/primitives'
import { useUI } from '@/components/providers/ui-provider'

export default function FaqPage() {
  const { openWaitlist } = useUI()
  return (
    <main id="faq" className="relative min-h-screen scroll-mt-32 pb-24">
      <PageHeader
        eyebrow="Answers"
        title="Frequently asked questions"
        subtitle="Clear answers about why Gaming Horizon exists, how the Public Beta will work, what AI-assisted discovery means, how player data is handled, and what remains in development."
      >
        <GhButton onClick={openWaitlist}>Join the Waitlist</GhButton>
        <GhButton variant="glass" href="/vision">
          Read the Vision
        </GhButton>
      </PageHeader>

      <section className="mx-auto max-w-3xl px-4">
        <FaqList withSearch withCategories withPopular withAsk />
      </section>
    </main>
  )
}
