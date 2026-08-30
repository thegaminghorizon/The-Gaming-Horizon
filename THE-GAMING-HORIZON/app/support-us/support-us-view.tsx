'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bell,
  CheckCircle2,
  ChevronDown,
  Crown,
  Gem,
  Gift,
  Heart,
  IndianRupee,
  Info,
  Lock,
  QrCode,
  Rocket,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { GhButton, Reveal, SectionHeading } from '@/components/ui/primitives'
import { SupporterTierGrid } from '@/components/supporter-tier-grid'
import { useUI } from '@/components/providers/ui-provider'
import { cn } from '@/lib/utils'
import {
  FOUNDING_SUPPORTER_GOAL,
  FUND_ALLOCATION,
  MIN_SUPPORT_AMOUNT_INR,
  QUICK_SUPPORT_AMOUNTS,
  SUPPORT_DONATIONS_LIVE,
  SUPPORT_FAQ,
  WHY_SUPPORT,
  getNextTier,
  getSupporterTier,
} from '@/lib/support-us'

const WHY_ICONS = [Server, Rocket, ShieldCheck]
const ALLOCATION_ICONS = [Server, Rocket, Gift, Shield]
const WALL_PREVIEW_ICONS = [Shield, Award, Gem, Crown]

const HOW_IT_WORKS: { title: string; desc: string; icon: LucideIcon }[] = [
  {
    title: 'Pick an amount',
    desc: `Use a quick amount or enter your own, starting from just ₹${MIN_SUPPORT_AMOUNT_INR}.`,
    icon: IndianRupee,
  },
  {
    title: 'Scan the UPI QR',
    desc: 'Open any UPI app on your phone and scan the code — no cards, no accounts, nothing stored on this site.',
    icon: QrCode,
  },
  {
    title: 'Get your badge',
    desc: 'Once verified, your supporter badge is added to your profile and the Supporters Wall.',
    icon: BadgeCheck,
  },
]

const TRUST_POINTS: { icon: LucideIcon; text: string }[] = [
  {
    icon: QrCode,
    text: 'QR-only payments through your own UPI app — Gaming Horizon never asks for card or bank details.',
  },
  {
    icon: Lock,
    text: 'Nothing is stored. No payment details are collected or saved anywhere on this site.',
  },
  {
    icon: Info,
    text: "This is a preview feature. Donations open alongside the Public Beta — nothing is charged yet.",
  },
  {
    icon: CheckCircle2,
    text: 'No ads, no data-selling. Supporter contributions are the intended funding model.',
  },
]

/** Live amount picker with real-time tier preview. Browsing is fully self-contained here; the actual "pay" step reuses the existing Support Us modal via openSupport(), same as the rest of the site. */
function AmountExplorer() {
  const { openSupport } = useUI()
  const [amount, setAmount] = useState<number>(500)
  const [customValue, setCustomValue] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const customNumber = Number(customValue)
  const effectiveAmount = useCustom ? customNumber : amount
  const customError =
    useCustom && customValue.trim() !== '' && (!Number.isFinite(customNumber) || customNumber < MIN_SUPPORT_AMOUNT_INR)
  const validAmount = Number.isFinite(effectiveAmount) && effectiveAmount >= MIN_SUPPORT_AMOUNT_INR

  const tier = useMemo(() => (validAmount ? getSupporterTier(effectiveAmount) : null), [validAmount, effectiveAmount])
  const nextTier = useMemo(() => (tier ? getNextTier(effectiveAmount) : null), [tier, effectiveAmount])
  const tierProgress = useMemo(() => {
    if (!tier) return 0
    if (!nextTier) return 1
    const span = nextTier.minAmountInr - tier.minAmountInr
    return span <= 0 ? 1 : Math.min(1, Math.max(0, (effectiveAmount - tier.minAmountInr) / span))
  }, [tier, nextTier, effectiveAmount])

  return (
    <div className="glass relative overflow-hidden rounded-3xl border border-[rgb(var(--accent-1)/0.22)] p-6 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent-1)/0.10)] via-transparent to-[rgb(var(--accent-2)/0.08)]"
      />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Choose an amount</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {QUICK_SUPPORT_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={!useCustom && amount === value}
              onClick={() => {
                setUseCustom(false)
                setAmount(value)
              }}
              className={cn(
                'gh-interactive rounded-xl border px-3 py-2.5 text-sm font-semibold outline-none transition-colors',
                !useCustom && amount === value
                  ? 'border-[rgb(var(--accent-1)/0.6)] bg-[rgb(var(--accent-1)/0.14)] text-foreground'
                  : 'border-border/70 text-muted-foreground hover:border-border hover:text-foreground',
              )}
            >
              ₹{value.toLocaleString('en-IN')}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <label htmlFor="support-page-custom-amount" className="sr-only">
            Custom amount in rupees
          </label>
          <div
            className={cn(
              'flex h-12 items-center gap-2 rounded-xl border bg-background/60 px-4 transition-colors focus-within:border-[rgb(var(--accent-1))]',
              customError ? 'border-red-500/70' : 'border-input',
            )}
          >
            <IndianRupee className="size-4 shrink-0 text-muted-foreground" />
            <input
              id="support-page-custom-amount"
              type="number"
              inputMode="numeric"
              min={MIN_SUPPORT_AMOUNT_INR}
              placeholder={`Or enter a custom amount (min ₹${MIN_SUPPORT_AMOUNT_INR})`}
              value={customValue}
              onChange={(e) => {
                setUseCustom(true)
                setCustomValue(e.target.value)
              }}
              onFocus={() => setUseCustom(true)}
              className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {customError && (
            <p className="mt-1.5 text-xs font-medium text-red-500">Minimum donation is ₹{MIN_SUPPORT_AMOUNT_INR}.</p>
          )}
        </div>

        {validAmount && tier && (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            aria-live="polite"
            className="mt-4 rounded-xl border border-[rgb(var(--accent-1)/0.28)] bg-[rgb(var(--accent-1)/0.07)] px-3.5 py-3"
          >
            <div className="flex items-start gap-2.5">
              {tier.id === 'legend' ? (
                <Crown className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
              ) : (
                <Sparkles className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
              )}
              <p className="text-xs leading-relaxed text-foreground/90">
                <span className="font-semibold">₹{effectiveAmount.toLocaleString('en-IN')}</span> unlocks the{' '}
                <span className="font-semibold">{tier.name}</span> supporter tier — {tier.tagline.toLowerCase()}
              </p>
            </div>
            <div className="mt-2.5 pl-6.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-[rgb(var(--accent-1)/0.15)]">
                <motion.div
                  className="h-full origin-left rounded-full bg-[rgb(var(--accent-1))]"
                  initial={false}
                  animate={{ scaleX: tierProgress }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                {nextTier
                  ? `₹${(nextTier.minAmountInr - effectiveAmount).toLocaleString('en-IN')} more unlocks ${nextTier.name}`
                  : "You've reached the top supporter tier"}
              </p>
            </div>
          </motion.div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <GhButton
            onClick={() => openSupport(effectiveAmount)}
            disabled={!validAmount}
            magnetic={false}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Heart className="size-4" /> Continue with ₹{validAmount ? effectiveAmount.toLocaleString('en-IN') : '—'}
          </GhButton>
          <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground/80">
            <Info className="mt-0.5 size-3.5 shrink-0 text-[rgb(var(--accent-1))]" />
            {SUPPORT_DONATIONS_LIVE
              ? 'Opens the QR code to pay.'
              : "Opens a preview of the pay flow — donations aren't live yet."}
          </p>
        </div>
      </div>
    </div>
  )
}

function FundAllocationGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {FUND_ALLOCATION.map((item, i) => {
        const Icon = ALLOCATION_ICONS[i] ?? Server
        return (
          <Reveal key={item.id} delay={0.05 * i}>
            <div className="glass gh-card-hover h-full rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                    <Icon className="size-4.5" />
                  </span>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                </div>
                <p className="font-heading text-lg font-bold text-[rgb(var(--accent-1))]">{item.percent}%</p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[rgb(var(--accent-1)/0.14)]">
                <motion.div
                  className="h-full origin-left rounded-full bg-[rgb(var(--accent-1))]"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: item.percent / 100 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}

function SupportFaq() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-3">
      {SUPPORT_FAQ.map((item) => {
        const isOpen = open === item.q
        return (
          <div key={item.q} className="glass overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.q)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-medium">{item.q}</span>
              <ChevronDown
                className={cn('size-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
              />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export function SupportUsView() {
  const { openSupport, openWaitlist } = useUI()

  return (
    <main id="support-us-page" className="relative min-h-screen pb-24">
      <PageHeader
        eyebrow="Community powered"
        title={
          <>
            Help fuel the <span className="text-gradient">Horizon</span>
          </>
        }
        subtitle={`Gaming Horizon is built by a small, independent team — no publisher, no ads, no selling player data. Every contribution from just ₹${MIN_SUPPORT_AMOUNT_INR} funds real infrastructure and comes back to you as a real supporter badge.`}
      >
        <GhButton onClick={() => openSupport()} size="lg">
          <Heart className="size-4" /> Support Us
        </GhButton>
        <GhButton href="#tiers" variant="glass" size="lg">
          See supporter tiers
        </GhButton>
      </PageHeader>

      {/* Amount explorer */}
      <section className="relative px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <AmountExplorer />
          </Reveal>
        </div>
      </section>

      {/* Why it matters */}
      <section className="relative px-4 py-16 cq-py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading center eyebrow="Why it matters" title="What your support actually changes" />
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
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
        </div>
      </section>

      {/* Fund allocation */}
      <section className="relative px-4 py-16 cq-py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            center
            eyebrow="Full transparency"
            title="Where every rupee is planned to go"
            subtitle="This is the team's planned split once donations open — not a report of funds already collected, since nothing has been collected yet."
          />
          <div className="mt-10">
            <FundAllocationGrid />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative px-4 py-16 cq-py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading center eyebrow="How it works" title="Three steps, no accounts required" />
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon
              return (
                <Reveal key={step.title} delay={0.06 * i}>
                  <div className="relative h-full rounded-2xl border border-border/70 bg-background/40 p-6 text-center">
                    <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                      <Icon className="size-5" />
                    </span>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--accent-1))]">
                      Step {i + 1}
                    </p>
                    <p className="mt-1 font-heading text-base font-bold">{step.title}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Supporter tiers */}
      <section id="tiers" className="relative scroll-mt-32 px-4 py-16 cq-py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            center
            eyebrow="Supporter tiers"
            title="Pick the tier that fits"
            subtitle="Every tier below stacks the perks of the one before it."
          />
          <div className="mt-10">
            <SupporterTierGrid />
          </div>
        </div>
      </section>

      {/* Founding supporters goal */}
      <section className="relative px-4 py-16 cq-py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="rounded-3xl border border-dashed border-border/70 bg-background/40 px-6 py-10 text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                <Target className="size-5" />
              </span>
              <p className="mt-4 font-heading text-xl font-bold">
                Aiming for the first {FOUNDING_SUPPORTER_GOAL} Founding Supporters
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                That&apos;s the goal before the Public Beta ships. The Supporters Wall is empty for now — be one of
                the first names on it.
              </p>
              <div className="mx-auto mt-5 h-1.5 max-w-xs overflow-hidden rounded-full bg-[rgb(var(--accent-1)/0.14)]">
                <div className="h-full w-0 rounded-full bg-[rgb(var(--accent-1))]" />
              </div>
              <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                0 of {FOUNDING_SUPPORTER_GOAL} claimed
              </p>
              <div className="mt-6 flex items-center justify-center -space-x-2">
                {WALL_PREVIEW_ICONS.map((Icon, i) => (
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
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trust & transparency */}
      <section className="relative px-4 py-16 cq-py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="glass rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                  <ShieldCheck className="size-5" />
                </span>
                <p className="font-heading text-lg font-bold">Built to be trusted, not just used</p>
              </div>
              <ul className="mt-5 space-y-3">
                {TRUST_POINTS.map((row) => {
                  const Icon = row.icon
                  return (
                    <li key={row.text} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/85">
                      <Icon className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
                      {row.text}
                    </li>
                  )
                })}
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                Questions about a donation? Visit the{' '}
                <Link href="/support" className="font-medium text-[rgb(var(--accent-1))] hover:underline">
                  Support Center
                </Link>{' '}
                or read the{' '}
                <Link href="/privacy" className="font-medium text-[rgb(var(--accent-1))] hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="support-faq" className="relative scroll-mt-32 px-4 py-16 cq-py-24">
        <div className="mx-auto max-w-3xl">
          <SectionHeading center eyebrow="Questions" title="Support Us FAQ" />
          <div className="mt-10">
            <SupportFaq />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="glass relative overflow-hidden rounded-3xl border border-[rgb(var(--accent-1)/0.22)] px-6 py-10 text-center sm:px-10">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent-1)/0.10)] via-transparent to-[rgb(var(--accent-2)/0.08)]"
              />
              <div className="relative">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(var(--accent-1))]">
                  Ready when you are
                </p>
                <h2 className="font-heading text-balance text-2xl font-semibold sm:text-4xl">Help fuel the Horizon</h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Every contribution, big or small, goes straight into servers, tooling, and getting the Public Beta
                  out the door faster.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <GhButton onClick={() => openSupport()} size="lg">
                    <Heart className="size-4" /> Support Us{' '}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </GhButton>
                  <GhButton onClick={openWaitlist} variant="glass" size="lg">
                    <Bell className="size-4" /> Notify me instead
                  </GhButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
