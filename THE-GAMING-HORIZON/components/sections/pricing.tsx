'use client'

import { ArrowRight, Check, ChevronDown, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useUI } from '@/components/providers/ui-provider'
import { useLocale } from '@/components/providers/locale-provider'
import { PLANNED_PLANS } from '@/lib/pricing'
import { GhButton, Reveal, SectionHeading } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

export function Pricing() {
  const { openWaitlist } = useUI()
  const { t, formatPrice, currency } = useLocale()

  return (
    <section id="pricing" className="gh-pricing-atmosphere relative scroll-mt-32 overflow-hidden px-4 py-20 cq-py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          center
          eyebrow={t('pricing.eyebrow')}
          title={<>A clear path for every kind of <span className="text-gradient">player and creator.</span></>}
          subtitle="Gaming Horizon is still in development. These planned memberships show how the ecosystem may support casual play, deeper progression, families, communities, and creators without locking the essential browser experience behind confusion."
        />

        <div className="mx-auto mt-7 flex max-w-2xl items-start gap-3 rounded-2xl border border-[rgb(var(--accent-1)/0.22)] bg-[rgb(var(--accent-1)/0.055)] px-4 py-3 text-sm text-foreground/85">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
          <div>
            <p className="font-semibold">{t('pricing.notice')}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{t('pricing.noPayment')}</p>
            {currency.code !== 'USD' && (
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground/80">{t('pricing.currencyNotice')}</p>
            )}
          </div>
        </div>

        <div className="mt-10 hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-5">
          {PLANNED_PLANS.map((plan, index) => (
            <Reveal key={plan.id} delay={Math.min(index * 0.04, 0.16)}>
              <article className={cn('glass gh-card-hover relative flex h-full min-h-[520px] flex-col rounded-[26px] border p-5', plan.recommended ? 'border-[rgb(var(--accent-1)/0.45)] shadow-[0_24px_70px_-42px_rgb(var(--accent-1)/0.75)]' : 'border-border/70')}>
                {plan.recommended && <span className="mb-4 inline-flex w-fit rounded-full border border-[rgb(var(--accent-1)/0.24)] bg-[rgb(var(--accent-1)/0.1)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[rgb(var(--accent-1))]">{t('pricing.balancedChoice')}</span>}
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{plan.audience}</p>
                <h3 className="mt-2 font-heading text-xl font-bold tracking-tight">{plan.name}</h3>
                <div className="mt-5 flex items-end gap-1">
                  <span className="font-heading text-4xl font-bold tabular-nums">{formatPrice(plan.priceMonthly)}</span>
                  <span className="pb-1 text-xs text-muted-foreground">{t('pricing.perMonth')}</span>
                </div>
                <p className="mt-4 min-h-[72px] text-sm leading-6 text-muted-foreground">{plan.summary}</p>
                <ul className="mt-5 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-xs leading-5 text-foreground/85">
                      <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]"><Check className="size-2.5" /></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={`/plans#plan-${plan.id}`} className="gh-interactive mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/75 bg-background/55 px-4 text-xs font-semibold outline-none">
                  {t('pricing.explorePlan')} <ArrowRight className="size-3.5" />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-9 space-y-3 md:hidden">
          {PLANNED_PLANS.map((plan, index) => (
            <Reveal key={plan.id} delay={Math.min(index * 0.03, 0.12)}>
              <details className={cn('group glass rounded-3xl border border-border/70 p-0 open:border-[rgb(var(--accent-1)/0.4)]', plan.recommended && 'border-[rgb(var(--accent-1)/0.36)]')}>
                <summary className="gh-interactive flex min-h-[92px] cursor-pointer list-none items-center gap-3 rounded-3xl px-4 py-4 outline-none [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-base font-bold">{plan.name}</h3>
                      {plan.recommended && <span className="rounded-full bg-[rgb(var(--accent-1)/0.1)] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[rgb(var(--accent-1))]">{t('pricing.balanced')}</span>}
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">{plan.audience}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-xl font-bold">{formatPrice(plan.priceMonthly)}</p>
                    <p className="text-[9px] text-muted-foreground">{t('pricing.plannedMonthly')}</p>
                  </div>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="border-t border-border/65 px-4 pb-5 pt-4">
                  <p className="text-sm leading-6 text-muted-foreground">{plan.summary}</p>
                  <ul className="mt-4 space-y-2.5">
                    {plan.features.map((feature) => <li key={feature} className="flex gap-2.5 text-xs leading-5"><Check className="mt-0.5 size-3.5 shrink-0 text-[rgb(var(--accent-1))]" />{feature}</li>)}
                  </ul>
                  <Link href={`/plans#plan-${plan.id}`} className="gh-interactive mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[rgb(var(--accent-1)/0.28)] bg-[rgb(var(--accent-1)/0.08)] px-4 text-xs font-semibold outline-none">{t('pricing.explorePlan')} <ArrowRight className="size-3.5" /></Link>
                </div>
              </details>
            </Reveal>
          ))}
        </div>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <GhButton href="/plans" size="lg">{t('pricing.comparePlans')} <ArrowRight className="size-4" /></GhButton>
          <GhButton onClick={openWaitlist} variant="glass" size="lg">{t('pricing.getPricingUpdates')}</GhButton>
        </div>
      </div>
    </section>
  )
}
