'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarDays, LockKeyhole, Radio, ShieldCheck, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Countdown } from '@/components/countdown'
import { GhButton, Pill, Reveal } from '@/components/ui/primitives'
import { useUI } from '@/components/providers/ui-provider'
import { BETA_DATE } from '@/lib/data'

const statusDetails = [
  { label: 'Access Status', value: 'Closed until Public Beta', icon: LockKeyhole },
  { label: 'Public Beta Opens', value: 'January 1, 2027 • 12:01 AM IST', icon: CalendarDays },
  { label: 'Official Launch', value: 'March 1, 2028', icon: ArrowRight },
  { label: 'Development Mode', value: 'Building in Public', icon: Radio },
]

export default function BetaPlatformPage() {
  const { openWaitlist } = useUI()
  const reduceMotion = useReducedMotion()

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-24 pt-[calc(var(--banner-h,0px)+var(--nav-h,64px)+3rem)] sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[16%] top-[-2%] h-[720px] w-[720px] rounded-full bg-[radial-gradient(circle,rgb(var(--accent-1)/.15),transparent_68%)]" />
        <div className="absolute -right-[15%] top-[22%] h-[680px] w-[680px] rounded-full bg-[radial-gradient(circle,rgb(var(--accent-2)/.12),transparent_68%)]" />
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]" style={{ backgroundImage: 'linear-gradient(to right,currentColor 1px,transparent 1px),linear-gradient(to bottom,currentColor 1px,transparent 1px)', backgroundSize: '48px 48px', maskImage: 'linear-gradient(to bottom,black,transparent 84%)' }} />
      </div>

      <div className="relative mx-auto max-w-[1540px]">
        <Reveal className="text-center">
          <Pill className="mb-6">
            <LockKeyhole className="size-3.5 text-[rgb(var(--accent-1))]" />
            PUBLIC BETA · CLOSED ACCESS
          </Pill>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Gaming Horizon Beta Platform</p>
          <h1 className="mx-auto mt-3 max-w-6xl bg-gradient-to-br from-foreground via-foreground to-[rgb(var(--accent-1))] bg-clip-text text-balance font-heading text-[clamp(2.8rem,6vw,6.2rem)] font-black leading-[0.96] tracking-[-0.055em] text-transparent">
            Public Beta Access Closed
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg">
            The private gateway to the Gaming Horizon experience is being prepared for its first players. Access remains locked until Public Beta begins on January 1, 2027 at 12:01 AM IST.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-10">
          <section className="glass-strong relative overflow-hidden rounded-[36px] border border-border/70 p-5 shadow-[0_36px_110px_-58px_rgb(var(--accent-1)/.52)] sm:p-9 lg:p-12">
            <div aria-hidden className="pointer-events-none absolute inset-x-[12%] top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgb(var(--accent-1)/0.13),transparent_70%)]" />

            <div className="relative grid gap-6 xl:grid-cols-[1.12fr_.88fr] xl:items-stretch">
              <div className="rounded-3xl border border-border/70 bg-background/55 p-5 sm:p-7 lg:p-8">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))] shadow-sm">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]">Controlled Beta Access</p>
                    <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">A first look, opened with intention.</h2>
                  </div>
                </div>

                <div className="mt-6 max-w-3xl space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
                  <p>
                    Selected testers will use this portal to enter Gaming Horizon during Public Beta, explore early systems, and help us refine the experience before wider release.
                  </p>
                  <p>
                    Until the opening moment, the platform remains securely closed while development, testing, accessibility work, and performance optimization continue. There are no fake login screens or inactive controls—only a clear view of what is coming and when access begins.
                  </p>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {statusDetails.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-2xl border border-border/70 bg-background/70 p-4 transition-colors duration-200 hover:border-[rgb(var(--accent-1)/0.28)]">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        <Icon className="size-3.5 text-[rgb(var(--accent-1))]" />{label}
                      </div>
                      <p className="mt-2 text-sm font-semibold leading-6 text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="relative flex min-h-[510px] flex-col justify-between overflow-hidden rounded-3xl border border-[rgb(var(--accent-1)/0.2)] bg-background/72 p-5 text-center ring-1 ring-white/60 dark:ring-white/5 sm:p-7 lg:p-8">
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent-1)/0.10)] via-transparent to-[rgb(var(--accent-2)/0.08)]" />
                <div className="relative">
                  <motion.span
                    className="mx-auto grid size-14 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.11)] text-[rgb(var(--accent-1))] shadow-[0_14px_38px_-24px_rgb(var(--accent-1)/0.8)]"
                    animate={reduceMotion ? undefined : { y: [0, -2, 0], scale: [1, 1.02, 1] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <LockKeyhole className="size-6" />
                  </motion.span>
                  <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-[rgb(var(--accent-1))]">PUBLIC BETA</p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Closed · Opens in</p>
                  <h2 className="mt-2 font-heading text-xl font-bold">The portal unlocks for its first players.</h2>
                </div>

                <div className="relative my-7">
                  <Countdown target={BETA_DATE} variant="beta" size="lg" className="mx-auto w-full max-w-[620px]" />
                </div>

                <div className="relative rounded-2xl border border-border/65 bg-background/62 px-4 py-3">
                  <p className="text-xs font-semibold text-foreground">January 1, 2027 • 12:01 AM IST</p>
                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">Access becomes available only when the countdown reaches zero.</p>
                </div>
              </aside>
            </div>

            <div className="relative mt-7 flex flex-col items-center justify-between gap-5 border-t border-border/70 pt-7 md:flex-row">
              <div className="flex max-w-2xl items-start gap-3 text-left">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
                <p className="text-sm leading-6 text-muted-foreground">Join the waitlist to receive launch updates and details about how Public Beta access will be introduced.</p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <GhButton size="lg" magnetic={false} onClick={openWaitlist} className="group">
                  Join the Waitlist <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </GhButton>
                <GhButton href="/" size="lg" variant="glass" magnetic={false}>
                  <ArrowLeft className="size-4" /> Return Home
                </GhButton>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mx-auto mt-9 max-w-2xl text-center text-pretty text-sm leading-7 text-muted-foreground">
            Thank you for supporting Gaming Horizon from the beginning. We cannot wait to welcome you when the Beta Platform officially opens.
          </p>
          <div className="mt-4 text-center">
            <Link href="/beta" className="inline-flex text-xs font-semibold text-[rgb(var(--accent-1))] transition-opacity hover:opacity-70">
              Explore the Public Beta program
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  )
}
