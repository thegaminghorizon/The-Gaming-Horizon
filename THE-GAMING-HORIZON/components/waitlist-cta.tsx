'use client'

import { GhButton, Reveal } from '@/components/ui/primitives'
import { Countdown } from '@/components/countdown'
import { useUI } from '@/components/providers/ui-provider'
import { BETA_DATE } from '@/lib/data'

export function WaitlistCTA({
  title = 'Be first through the horizon',
  subtitle = 'Join the waitlist for a chance at early beta access, founder recognition and behind-the-scenes development updates.',
}: {
  title?: string
  subtitle?: string
}) {
  const { openWaitlist } = useUI()
  return (
    <section className="px-4 py-24">
      <Reveal className="mx-auto max-w-4xl">
        <div className="glass relative overflow-hidden rounded-3xl p-10 text-center md:p-14">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
            style={{
              background:
                'radial-gradient(60% 80% at 50% 0%, rgb(var(--accent-1)/0.18), transparent 70%)',
            }}
          />
          <h2 className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
          <div className="mt-8 flex justify-center">
            <Countdown target={BETA_DATE} />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <GhButton onClick={openWaitlist} size="lg">
              Join the Waitlist
            </GhButton>
            <GhButton href="/roadmap" variant="glass" size="lg">
              View Roadmap
            </GhButton>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
