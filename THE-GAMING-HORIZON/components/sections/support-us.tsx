'use client'

import Link from 'next/link'
import { Award, Crown, Gem, Heart, QrCode, Rocket, Server, Shield, ShieldCheck, Sparkles } from 'lucide-react'
import { SectionHeading, Reveal, GhButton, Pill } from '@/components/ui/primitives'
import { SupporterTierGrid } from '@/components/supporter-tier-grid'
import { useUI } from '@/components/providers/ui-provider'
import { MIN_SUPPORT_AMOUNT_INR, QUICK_SUPPORT_AMOUNTS, WHY_SUPPORT } from '@/lib/support-us'

const WHY_ICONS = [Server, Rocket, ShieldCheck]
const TIER_PREVIEW_ICONS = [Shield, Award, Gem, Crown]

export function SupportUs() {
  const { openSupport } = useUI()

  return (
    <section id="support-us" className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="Community powered"
          title={
            <>
              Help fuel the <span className="text-gradient">Horizon</span>
            </>
          }
          subtitle={`Gaming Horizon is built by a small, independent team — no big publisher behind it. Chip in from just ₹${MIN_SUPPORT_AMOUNT_INR} and get a supporter badge to show for it.`}
        />

        {/* Quick-amount CTA */}
        <Reveal delay={0.08} className="mt-10">
          <div className="glass relative overflow-hidden rounded-3xl border border-[rgb(var(--accent-1)/0.22)] p-6 sm:p-8">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent-1)/0.10)] via-transparent to-[rgb(var(--accent-2)/0.08)]" />
            <div className="relative flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
              <div className="flex items-start gap-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                  <Heart className="size-5" />
                </span>
                <div>
                  <p className="font-heading text-xl font-bold text-balance sm:text-2xl">Pick an amount, pay by QR</p>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Any UPI app, one scan, no accounts or cards. Higher amounts unlock higher supporter tiers.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-wrap items-center justify-center gap-2.5 lg:w-auto lg:justify-end">
                {QUICK_SUPPORT_AMOUNTS.slice(0, 3).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => openSupport(value)}
                    className="gh-interactive rounded-xl border border-[rgb(var(--accent-1)/0.3)] bg-background/60 px-4 py-2.5 text-sm font-semibold text-foreground outline-none transition-colors hover:border-[rgb(var(--accent-1)/0.6)] hover:bg-[rgb(var(--accent-1)/0.1)]"
                  >
                    ₹{value.toLocaleString('en-IN')}
                  </button>
                ))}
                <GhButton onClick={() => openSupport()} magnetic={false}>
                  <Heart className="size-4" /> Support Us
                </GhButton>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Why it matters */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {WHY_SUPPORT.map((item, i) => {
            const Icon = WHY_ICONS[i] ?? Server
            return (
              <Reveal key={item.title} delay={0.05 * i}>
                <div className="glass gh-card-hover h-full rounded-2xl p-5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                    <Icon className="size-4.5" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* Supporter tiers */}
        <Reveal delay={0.06} className="mt-10">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Supporter tiers &amp; badges
          </p>
          <div className="mt-4">
            <SupporterTierGrid />
          </div>
        </Reveal>

        {/* Supporters wall preview */}
        <Reveal delay={0.1} className="mt-10">
          <div className="rounded-3xl border border-dashed border-border/70 bg-background/40 px-6 py-8 text-center">
            <div className="mx-auto flex max-w-md flex-col items-center">
              <div className="flex -space-x-2">
                {TIER_PREVIEW_ICONS.map((Icon, i) => (
                  <span
                    key={i}
                    className="grid size-10 place-items-center rounded-full border-2 border-background bg-muted text-muted-foreground"
                  >
                    <Icon className="size-4" />
                  </span>
                ))}
                <span className="grid size-10 place-items-center rounded-full border-2 border-dashed border-[rgb(var(--accent-1)/0.5)] bg-[rgb(var(--accent-1)/0.08)] text-[10px] font-bold text-[rgb(var(--accent-1))]">
                  You?
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-foreground">The Supporters Wall is empty — for now</p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                Once donations open, every supporter&apos;s badge and name will be featured right here. Be the first to claim a spot.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Trust / preview note */}
        <Reveal delay={0.12} className="mt-8">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
            <Pill>
              <QrCode className="size-3.5 text-[rgb(var(--accent-1))]" /> QR-only · Preview feature
            </Pill>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Payments aren&apos;t live yet — this is a preview of how supporting Gaming Horizon will work once the Public Beta ships. No payment details are collected on this website.
            </p>
            <button
              type="button"
              onClick={() => openSupport()}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[rgb(var(--accent-1))] outline-none"
            >
              <Sparkles className="size-4" /> Quick support
            </button>
            <Link
              href="/support-us"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[rgb(var(--accent-1))] outline-none hover:underline"
            >
              See the full Support Us page
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
