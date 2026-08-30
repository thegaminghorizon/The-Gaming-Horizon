'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Info,
  Layers3,
  Sparkles,
  X,
} from 'lucide-react'
import { useUI } from '@/components/providers/ui-provider'
import { useLocale } from '@/components/providers/locale-provider'
import { GhButton, Pill, Reveal, SectionHeading } from '@/components/ui/primitives'
import { SectionDivider } from '@/components/ui/section-divider'
import {
  COMPARISON_ROWS,
  PLANNED_PLANS,
  PLANNED_PRICING_NOTICE,
  type PlannedPlan,
} from '@/lib/pricing'
import { cn } from '@/lib/utils'

function PurchasePreviewModal({
  plan,
  onClose,
  returnFocus,
}: {
  plan: PlannedPlan | null
  onClose: () => void
  returnFocus: RefObject<HTMLElement | null>
}) {
  const { openWaitlist } = useUI()
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { t, formatPrice } = useLocale()

  useEffect(() => {
    if (!plan) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 30)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      window.setTimeout(() => returnFocus.current?.focus(), 0)
    }
  }, [plan, onClose, returnFocus])

  if (!plan || typeof document === 'undefined') return null

  const openUpdates = () => {
    onClose()
    window.setTimeout(openWaitlist, 80)
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[700] grid place-items-center overflow-y-auto bg-slate-950/20 px-4 py-8 backdrop-blur-[2px] dark:bg-black/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => {
          if (event.currentTarget === event.target) onClose()
        }}
      >
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-preview-title"
          aria-describedby="plan-preview-description"
          className="glass-panel relative w-full max-w-xl overflow-hidden rounded-[30px] border border-[rgb(var(--accent-1)/0.28)] p-5 shadow-[0_36px_100px_-42px_rgb(var(--accent-1)/0.52)] sm:p-7"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.975 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.985 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-x-[12%] top-0 h-24 bg-[radial-gradient(ellipse_at_top,rgb(var(--accent-1)/0.16),transparent_72%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[rgb(var(--accent-1)/0.18)] bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]">
              <CreditCard className="size-5" />
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close plan preview"
              className="gh-interactive grid size-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-background/65 text-muted-foreground outline-none"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="relative mt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]">Future subscription preview</p>
            <h2 id="plan-preview-title" className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              {plan.name}
            </h2>
            <p className="mt-2 font-heading text-xl font-bold tabular-nums">
              {formatPrice(plan.priceMonthly)} <span className="font-sans text-xs font-medium text-muted-foreground">{t('pricing.plannedMonthly')}</span>
            </p>
          </div>

          <div id="plan-preview-description" data-selectable-content="true" className="relative mt-5 space-y-4 rounded-2xl border border-border/70 bg-background/62 p-4 text-sm leading-7 text-muted-foreground">
            <p className="font-semibold text-foreground">Plan purchases are not available yet.</p>
            <p>
              This is a frontend preview of the future Gaming Horizon subscription experience. Payments, billing, and account upgrades will become available only after the platform launches and commercial details are finalized.
            </p>
            <p className="text-xs leading-5">No payment details, billing addresses, passwords, or account credentials are requested on this website.</p>
          </div>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
            <GhButton onClick={openUpdates} magnetic={false} className="w-full">
              Join the Waitlist <ArrowRight className="size-4" />
            </GhButton>
            <GhButton onClick={openUpdates} magnetic={false} variant="glass" className="w-full">
              Get Pricing Updates
            </GhButton>
            <button
              type="button"
              onClick={onClose}
              className="gh-interactive min-h-11 rounded-xl border border-border/70 bg-background/55 px-4 text-sm font-semibold text-muted-foreground outline-none sm:col-span-2"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

export function PlansView() {
  const { openWaitlist } = useUI()
  const { t, formatPrice, currency } = useLocale()
  const [selectedPlan, setSelectedPlan] = useState<PlannedPlan | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const closePlan = useCallback(() => setSelectedPlan(null), [])

  const choosePlan = (plan: PlannedPlan, trigger: HTMLElement) => {
    triggerRef.current = trigger
    setSelectedPlan(plan)
  }

  return (
    <main className="relative overflow-hidden px-4 pb-28 pt-[calc(var(--banner-h,0px)+var(--nav-h,64px)+3rem)] sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(65%_55%_at_50%_0%,rgb(var(--accent-1)/0.12),transparent_72%)]" />

      <div className="relative mx-auto max-w-7xl">
        <Reveal className="text-center">
          <Pill className="mb-6"><Layers3 className="size-3.5 text-[rgb(var(--accent-1))]" /> Planned memberships</Pill>
          <h1 className="mx-auto max-w-5xl font-heading text-[clamp(2.8rem,6.7vw,6.5rem)] font-black leading-[0.95] tracking-[-0.055em]">
            A plan for every way you <span className="text-gradient">play and create.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg">
            Gaming Horizon plans are a transparent preview of how the future platform may support casual players, dedicated households, communities, and creators. No subscriptions are available today.
          </p>
        </Reveal>

        <Reveal delay={0.06} className="mx-auto mt-8 max-w-3xl">
          <div className="flex items-start gap-3 rounded-2xl border border-[rgb(var(--accent-1)/0.24)] bg-[rgb(var(--accent-1)/0.065)] p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
            <div data-selectable-content="true">
              <p className="text-sm font-bold text-foreground">{PLANNED_PRICING_NOTICE}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Features, service limits, annual equivalents, taxes, regions, and rollout timing may change as the platform is tested and prepared for commercial release.</p>
              {currency.code !== 'USD' && (
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground/80">{t('pricing.currencyNotice')}</p>
              )}
            </div>
          </div>
        </Reveal>

        <div className="mt-14 space-y-6">
          {PLANNED_PLANS.map((plan, index) => (
            <Reveal key={plan.id} delay={Math.min(index * 0.04, 0.16)}>
              <article id={`plan-${plan.id}`} className={cn('glass relative scroll-mt-32 overflow-hidden rounded-[32px] border p-5 sm:p-7 lg:p-9', plan.recommended ? 'border-[rgb(var(--accent-1)/0.42)] shadow-[0_30px_90px_-52px_rgb(var(--accent-1)/0.66)]' : 'border-border/72')}>
                {plan.recommended && <span className="mb-5 inline-flex rounded-full border border-[rgb(var(--accent-1)/0.25)] bg-[rgb(var(--accent-1)/0.09)] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[rgb(var(--accent-1))]">Balanced recommendation</span>}
                <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground">{plan.audience}</p>
                    <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{plan.name}</h2>
                    <p className="mt-4 text-base leading-7 text-muted-foreground">{plan.summary}</p>
                    <div className="mt-6 flex flex-wrap items-end gap-x-5 gap-y-2">
                      <div>
                        <span className="font-heading text-5xl font-bold tabular-nums">{formatPrice(plan.priceMonthly)}</span>
                        <span className="ml-1 text-xs text-muted-foreground">{t('pricing.perMonth')}</span>
                      </div>
                      <div className="pb-1 text-xs leading-5 text-muted-foreground">
                        <span className="font-semibold text-foreground">{formatPrice(plan.priceAnnualPlanned)}{t('pricing.perYear')}</span><br />{t('pricing.plannedAnnualEquivalent')}
                      </div>
                    </div>
                    <p className="mt-5 rounded-2xl border border-border/65 bg-background/52 p-4 text-sm leading-6 text-foreground/85">{plan.valueStatement}</p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={(event) => choosePlan(plan, event.currentTarget)}
                        className="gh-interactive inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[rgb(var(--accent-1)/0.38)] bg-[rgb(var(--accent-1))] px-5 text-sm font-bold text-white shadow-[0_14px_34px_-20px_rgb(var(--accent-1)/0.9)] outline-none"
                      >
                        Choose Plan <ArrowRight className="size-4" />
                      </button>
                      <button type="button" onClick={openWaitlist} className="gh-interactive min-h-12 rounded-xl border border-border/75 bg-background/58 px-5 text-sm font-semibold outline-none">Get Pricing Updates</button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-border/70 bg-background/52 p-5">
                      <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[rgb(var(--accent-1))]">Designed for</h3>
                      <p data-selectable-content="true" className="mt-3 text-sm leading-7 text-muted-foreground">{plan.intendedUser}</p>
                    </div>
                    <div className="rounded-3xl border border-border/70 bg-background/52 p-5">
                      <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[rgb(var(--accent-1))]">Planned availability</h3>
                      <p data-selectable-content="true" className="mt-3 text-sm leading-7 text-muted-foreground">{plan.availability}</p>
                    </div>
                    <div className="rounded-3xl border border-border/70 bg-background/52 p-5 sm:col-span-2">
                      <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[rgb(var(--accent-1))]">Included experience</h3>
                      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                        {plan.features.map((feature) => <li key={feature} className="flex gap-2.5 text-sm leading-6 text-foreground/85"><CheckCircle2 className="mt-1 size-4 shrink-0 text-[rgb(var(--accent-1))]" />{feature}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-3xl border border-border/70 bg-background/52 p-5">
                      <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Planned boundaries</h3>
                      <ul className="mt-3 space-y-2.5">{plan.limitations.map((item) => <li key={item} className="text-xs leading-5 text-muted-foreground">• {item}</li>)}</ul>
                    </div>
                    <div className="rounded-3xl border border-border/70 bg-background/52 p-5">
                      <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Connected modules</h3>
                      <div className="mt-3 flex flex-wrap gap-2">{plan.modules.map((module) => <span key={module} className="rounded-full border border-[rgb(var(--accent-1)/0.2)] bg-[rgb(var(--accent-1)/0.06)] px-2.5 py-1 text-[10px] font-semibold">{module}</span>)}</div>
                      <p className="mt-4 text-xs leading-5 text-muted-foreground">{plan.previousTierComparison}</p>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <SectionDivider variant="beam" />

        <section id="comparison" className="scroll-mt-32 py-8 sm:py-12">
          <SectionHeading
            center
            eyebrow="Plan comparison"
            title={<>See how the planned tiers <span className="text-gradient">build on one another.</span></>}
            subtitle="This comparison describes the current product direction, not final contractual benefits or service limits."
          />

          <div className="mt-10 hidden overflow-x-auto rounded-[28px] border border-border/70 bg-card/55 shadow-sm lg:block">
            <table className="w-full min-w-[1120px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border/70">
                  <th className="sticky left-0 z-10 bg-card/95 px-5 py-5 text-xs font-bold">Capability</th>
                  {PLANNED_PLANS.map((plan) => <th key={plan.id} className={cn('min-w-[190px] px-4 py-5 align-bottom', plan.recommended && 'bg-[rgb(var(--accent-1)/0.055)]')}><span className="block font-heading text-sm font-bold">{plan.name.replace('Horizon ', '')}</span><span className="mt-1 block text-[10px] font-normal text-muted-foreground">{formatPrice(plan.priceMonthly)}{t('pricing.perMonth')} planned</span></th>)}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.key} className="border-b border-border/55 last:border-0">
                    <th className="sticky left-0 z-10 bg-card/95 px-5 py-4 text-xs font-semibold text-foreground">{row.label}</th>
                    {PLANNED_PLANS.map((plan) => <td key={plan.id} className={cn('px-4 py-4 text-xs leading-5 text-muted-foreground', plan.recommended && 'bg-[rgb(var(--accent-1)/0.04)]')}><span className="inline-flex items-start gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-[rgb(var(--accent-1))]" />{plan.comparison[row.key]}</span></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 space-y-3 lg:hidden">
            {PLANNED_PLANS.map((plan) => (
              <details key={plan.id} className="group glass rounded-3xl border border-border/70 open:border-[rgb(var(--accent-1)/0.4)]">
                <summary className="gh-interactive flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-4 py-4 outline-none [&::-webkit-details-marker]:hidden">
                  <span><span className="block font-heading text-base font-bold">{plan.name}</span><span className="mt-1 block text-[10px] text-muted-foreground">{formatPrice(plan.priceMonthly)}{t('pricing.perMonth')} planned</span></span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[rgb(var(--accent-1))] group-open:hidden">Compare</span>
                  <span className="hidden text-[10px] font-bold uppercase tracking-[0.12em] text-[rgb(var(--accent-1))] group-open:block">Close</span>
                </summary>
                <dl className="border-t border-border/65 px-4 pb-5 pt-4">
                  {COMPARISON_ROWS.map((row) => <div key={row.key} className="grid grid-cols-[0.9fr_1.1fr] gap-3 border-b border-border/50 py-3 last:border-0"><dt className="text-xs font-semibold">{row.label}</dt><dd className="text-xs leading-5 text-muted-foreground">{plan.comparison[row.key]}</dd></div>)}
                </dl>
              </details>
            ))}
          </div>
        </section>

        <Reveal className="mt-12 rounded-[32px] border border-[rgb(var(--accent-1)/0.25)] bg-[rgb(var(--accent-1)/0.065)] p-6 text-center sm:p-9">
          <Sparkles className="mx-auto size-5 text-[rgb(var(--accent-1))]" />
          <h2 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">Follow the plans as the platform takes shape.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">Join the waitlist for Public Beta news and meaningful pricing updates. Gaming Horizon will publish changes before any commercial subscription becomes available.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <GhButton onClick={openWaitlist} magnetic={false}>Join the Waitlist <ArrowRight className="size-4" /></GhButton>
            <GhButton href="/platform" variant="glass" magnetic={false}><ArrowLeft className="size-4" /> Explore the Platform</GhButton>
          </div>
        </Reveal>
      </div>

      <PurchasePreviewModal plan={selectedPlan} onClose={closePlan} returnFocus={triggerRef} />
    </main>
  )
}
