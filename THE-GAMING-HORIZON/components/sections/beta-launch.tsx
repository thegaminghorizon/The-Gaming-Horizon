'use client'

import { Rocket, Star, MessageSquare, Gift, Crown, Bell } from 'lucide-react'
import { SectionHeading, Reveal, GhButton, Pill } from '@/components/ui/primitives'
import { Countdown } from '@/components/countdown'
import { useUI } from '@/components/providers/ui-provider'
import { BETA_DATE, LAUNCH_DATE } from '@/lib/data'

const BENEFITS = [
  { icon: Gift, title: 'Early access', desc: 'Waitlist members may be invited before the public.' },
  { icon: Crown, title: 'Founder recognition', desc: 'A permanent founder badge on your future profile.' },
  { icon: Bell, title: 'Development updates', desc: 'Behind-the-scenes progress straight to your inbox.' },
]

export function BetaLaunch() {
  const { openWaitlist } = useUI()

  return (
    <section id="beta" className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="Public Beta"
          title="The first public milestone"
          subtitle="The beta is where Gaming Horizon becomes real and playable — a foundation, not the finished product."
        />

        <Reveal className="mt-14">
          <div className="glass relative overflow-hidden rounded-3xl p-8 md:p-10">
            <div
              className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full opacity-30 blur-3xl"
              style={{ background: 'radial-gradient(circle, rgb(var(--accent-1)/0.6), transparent 70%)' }}
            />
            <div className="grid gap-8 lg:grid-cols-[1fr_1px_1fr] lg:items-center">
              <div>
                <Pill className="mb-4">
                  <Rocket className="size-3.5 text-[rgb(var(--accent-1))]" />
                  Public Beta
                </Pill>
                <p className="mb-4 text-sm text-muted-foreground">Launches in</p>
                <Countdown target={BETA_DATE} />
                <p className="mt-4 text-sm text-muted-foreground">
                  1 January 2027 · 12:01 AM IST · Feedback Portal opens 15 January 2027.
                </p>
              </div>

              <div className="hidden h-full w-px bg-border lg:block" />

              <div className="flex flex-col gap-4">
                {BENEFITS.map((b) => {
                  const Icon = b.icon
                  return (
                    <div key={b.title} className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.16)] text-[rgb(var(--accent-1))]">
                        <Icon className="size-4.5" style={{ width: 18, height: 18 }} />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold">{b.title}</h3>
                        <p className="text-xs text-muted-foreground">{b.desc}</p>
                      </div>
                    </div>
                  )
                })}
                <GhButton className="mt-2 w-fit" onClick={openWaitlist}>
                  Join the Waitlist
                </GhButton>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Official launch */}
        <Reveal delay={0.1} className="mt-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-3)/0.16)] text-[rgb(var(--accent-3))]">
                <Star className="size-5" />
              </span>
              <div>
                <h3 className="font-heading text-xl font-semibold">Official Launch</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  The complete Gaming Horizon ecosystem — full library, communities,
                  tournaments, creator tools and more — arrives on 1 March 2028 at 12:01 AM IST.
                </p>
              </div>
            </div>
            <Countdown target={LAUNCH_DATE} variant="launch" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
