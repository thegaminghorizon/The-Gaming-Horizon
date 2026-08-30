'use client'

import { PageHeader } from '@/components/page-header'
import { Reveal, GhButton } from '@/components/ui/primitives'
import { Logo } from '@/components/ui/logo'
import { useUI } from '@/components/providers/ui-provider'
import { BRAND_COLORS, PRESS_FACTS } from '@/lib/content'

export function PressView() {
  const { openComingSoon } = useUI()
  return (
    <>
      <PageHeader
        eyebrow="Press Kit"
        title={
          <>
            The Gaming Horizon <span className="text-gradient">brand</span>
          </>
        }
        subtitle="Everything media, partners and creators need to write about Gaming Horizon. Full downloadable assets arrive closer to the Public Beta."
      >
        <GhButton onClick={() => openComingSoon('Press Kit Download')} size="lg">
          Download full kit
        </GhButton>
        <GhButton href="/contact" variant="glass" size="lg">
          Media enquiries
        </GhButton>
      </PageHeader>

      <div className="mx-auto max-w-4xl space-y-6 px-4 pb-8">
        <Reveal>
          <div className="glass flex flex-col items-center gap-6 rounded-3xl p-10 text-center">
            <Logo />
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Primary logo. Please keep clear space around the mark and avoid
              recolouring or distorting it.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="glass h-full rounded-3xl p-8">
              <h2 className="font-heading text-xl font-semibold">Fast facts</h2>
              <dl className="mt-5 space-y-4">
                {PRESS_FACTS.map((f) => (
                  <div key={f.label} className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0">
                    <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                      {f.label}
                    </dt>
                    <dd className="text-sm font-medium">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="glass h-full rounded-3xl p-8">
              <h2 className="font-heading text-xl font-semibold">Brand palette</h2>
              <div className="mt-5 space-y-3">
                {BRAND_COLORS.map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span
                      className="size-9 shrink-0 rounded-lg border border-border"
                      style={{ background: c.value }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="font-mono text-xs uppercase text-muted-foreground">
                        {c.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  )
}
