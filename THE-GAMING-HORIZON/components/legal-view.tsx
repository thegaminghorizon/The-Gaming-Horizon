'use client'

import { PageHeader } from '@/components/page-header'
import { Reveal } from '@/components/ui/primitives'
import { WaitlistCTA } from '@/components/waitlist-cta'
import type { LegalPage } from '@/lib/content'

export function LegalView({ page }: { page: LegalPage }) {
  return (
    <div data-selectable-content="true">
      <PageHeader eyebrow={page.eyebrow} title={page.title} subtitle={page.intro} />
      <div className="mx-auto max-w-4xl px-4 pb-8">
        <div className="glass relative overflow-hidden rounded-3xl border border-border/70 p-6 shadow-[0_28px_80px_-56px_rgb(var(--accent-1)/0.42)] sm:p-10">
          <div aria-hidden className="pointer-events-none absolute inset-x-[12%] top-0 h-24 bg-[radial-gradient(ellipse_at_top,rgb(var(--accent-1)/0.10),transparent_72%)]" />
          <p className="relative mb-8 text-xs uppercase tracking-widest text-muted-foreground">
            Last updated · Pre-launch draft
          </p>
          <div className="relative space-y-8">
            {page.sections.map((s, i) => (
              <Reveal key={s.heading} delay={i * 0.04}>
                <section>
                  <h2 className="font-heading text-xl font-semibold">{s.heading}</h2>
                  <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      <WaitlistCTA />
    </div>
  )
}
