'use client'

import { Award, Crown, Gem, Shield, type LucideIcon } from 'lucide-react'
import { SpringCard } from '@/components/ui/primitives'
import { SUPPORTER_TIERS, type SupporterTier } from '@/lib/support-us'
import { cn } from '@/lib/utils'

const TIER_ICONS: Record<string, LucideIcon> = {
  backer: Shield,
  supporter: Award,
  champion: Gem,
  legend: Crown,
}

const TIER_ACCENT: Record<string, 1 | 2 | 3> = {
  backer: 1,
  supporter: 3,
  champion: 2,
  legend: 1,
}

function TierCard({
  tier,
  compact,
  active,
}: {
  tier: SupporterTier
  compact?: boolean
  /** True when this is the tier the modal's currently-selected amount unlocks. */
  active?: boolean
}) {
  const Icon = TIER_ICONS[tier.id] ?? Shield
  const accent = TIER_ACCENT[tier.id] ?? 1
  return (
    <div
      className={cn(
        'glass gh-card-hover relative flex h-full flex-col rounded-2xl border border-border/70 p-5',
        !compact && 'p-6',
      )}
      style={
        active
          ? {
              borderColor: `rgb(var(--accent-${accent}) / 0.55)`,
              boxShadow: `0 0 0 1px rgb(var(--accent-${accent}) / 0.28), 0 16px 40px -18px rgb(var(--accent-${accent}) / 0.55)`,
            }
          : undefined
      }
    >
      {active && (
        <span
          className="absolute -top-2.5 right-4 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
          style={{ background: `rgb(var(--accent-${accent}))` }}
        >
          Selected
        </span>
      )}
      <div className="flex items-center gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl"
          style={{ background: `rgb(var(--accent-${accent}) / 0.16)`, color: `rgb(var(--accent-${accent}))` }}
        >
          <Icon className="size-5" />
        </span>
        <div>
          <p className="font-heading text-base font-bold leading-tight">{tier.name}</p>
          <p className="text-xs font-medium text-muted-foreground">₹{tier.minAmountInr.toLocaleString('en-IN')}+</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{tier.tagline}</p>
      <ul className="mt-4 space-y-2">
        {tier.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-xs leading-relaxed text-foreground/85">
            <span
              className="mt-1 size-1.5 shrink-0 rounded-full"
              style={{ background: `rgb(var(--accent-${accent}))` }}
            />
            {perk}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The four supporter-tier cards (Backer → Legend). Used on the homepage
 * Support section, the account Support tab, and the Support modal.
 *
 * Column count is driven by a *container* query (the `@container` wrapper
 * below), not a viewport breakpoint. This component is reused inside a
 * max-w-2xl modal and a tabbed account panel, both far narrower than the
 * homepage section it was designed for — a viewport-based `lg:grid-cols-4`
 * switches to 4 columns any time the *browser* is wide, even when the card
 * itself only has ~600px to work with, which is what crushed the tiers down
 * to unreadable slivers inside the modal. Measuring the grid's own box
 * instead means it always gets exactly as many columns as it actually has
 * room for, wherever it ends up being placed.
 */
export function SupporterTierGrid({
  compact,
  activeTierId,
}: {
  compact?: boolean
  /** Highlights the matching card — e.g. the tier the modal's currently-selected amount unlocks. */
  activeTierId?: string | null
}) {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-4 @[640px]:grid-cols-2 @[1024px]:grid-cols-4">
        {SUPPORTER_TIERS.map((tier, i) => (
          <SpringCard key={tier.id} delay={Math.min(i * 0.05, 0.15)}>
            <TierCard tier={tier} compact={compact} active={activeTierId === tier.id} />
          </SpringCard>
        ))}
      </div>
    </div>
  )
}
