'use client'

import { PageHeader } from '@/components/page-header'
import { Reveal, Pill } from '@/components/ui/primitives'
import { WaitlistCTA } from '@/components/waitlist-cta'
import { SERVICE_STATUS } from '@/lib/content'

export function StatusView() {
  return (
    <>
      <PageHeader
        eyebrow="System Status"
        title={
          <>
            Building in the <span className="text-gradient">open</span>
          </>
        }
        subtitle="Gaming Horizon is in active development. Nothing is live to the public yet — this page tracks where each service stands on the road to the Public Beta."
      >
        <Pill>
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[rgb(var(--accent-3))] opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-[rgb(var(--accent-3))]" />
          </span>
          All systems in development
        </Pill>
      </PageHeader>

      <div className="mx-auto max-w-3xl px-4 pb-8">
        <div className="glass overflow-hidden rounded-3xl">
          {SERVICE_STATUS.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.03}>
              <div className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4 last:border-0 sm:px-7">
                <div className="min-w-0">
                  <p className="font-medium">{s.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{s.note}</p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                    s.state === 'Development'
                      ? 'bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      s.state === 'Development'
                        ? 'bg-[rgb(var(--accent-1))]'
                        : 'bg-muted-foreground'
                    }`}
                  />
                  {s.state}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          A real-time status dashboard with uptime history goes live alongside the Public Beta.
        </p>
      </div>

      <WaitlistCTA />
    </>
  )
}
