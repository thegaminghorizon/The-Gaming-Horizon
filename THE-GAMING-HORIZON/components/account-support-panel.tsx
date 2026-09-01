'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Award, Clock, Heart, QrCode, XCircle } from 'lucide-react'
import { GhButton, Pill } from '@/components/ui/primitives'
import { SupporterTierGrid } from '@/components/supporter-tier-grid'
import { useAuth } from '@/components/providers/auth-provider'
import { useUI } from '@/components/providers/ui-provider'
import { PaymentHistoryList } from '@/components/payment-history-list'
import { getMyContributions, type SupportContribution } from '@/lib/support-contributions'
import { MIN_SUPPORT_AMOUNT_INR, SUPPORTER_TIERS } from '@/lib/support-us'

const TIER_ORDER = SUPPORTER_TIERS.map((t) => t.id)

/** Picks the highest tier among a set of verified contributions — same "highest wins" rule as lib/support-us.ts's getSupporterTier. */
function bestTier(contributions: SupportContribution[]) {
  const verified = contributions.filter((c) => c.status === 'verified')
  if (!verified.length) return null
  const bestId = verified.reduce((best, c) => {
    const bestIdx = TIER_ORDER.indexOf(best)
    const idx = TIER_ORDER.indexOf(c.tierId)
    return idx > bestIdx ? c.tierId : best
  }, verified[0].tierId)
  return SUPPORTER_TIERS.find((t) => t.id === bestId) ?? null
}

/** The account page's "Support Us" tab: shows the signed-in user's real contribution status (verified badge, pending review, or not a supporter yet) plus the donate CTA and tier showcase. */
export function AccountSupportPanel() {
  const { openSupport } = useUI()
  const { user } = useAuth()
  const [contributions, setContributions] = useState<SupportContribution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setContributions([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getMyContributions().then((rows) => {
      if (!cancelled) {
        setContributions(rows)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [user])

  const tier = bestTier(contributions)
  const pending = contributions.filter((c) => c.status === 'pending')
  const latestRejected = contributions.find((c) => c.status === 'rejected')

  return (
    <div className="space-y-6">
      <div className="glass relative overflow-hidden rounded-2xl border border-[rgb(var(--accent-1)/0.22)] p-6 sm:p-7">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent-1)/0.10)] via-transparent to-[rgb(var(--accent-2)/0.08)]" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
              {tier ? <Award className="size-5" /> : <Heart className="size-5" />}
            </span>
            <div>
              {loading ? (
                <p className="font-heading text-lg font-bold text-muted-foreground">Checking your supporter status…</p>
              ) : tier ? (
                <>
                  <p className="font-heading text-lg font-bold">
                    You&apos;re a <span className="text-[rgb(var(--accent-1))]">{tier.name}</span> supporter
                  </p>
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">{tier.tagline}</p>
                </>
              ) : (
                <>
                  <p className="font-heading text-lg font-bold">You&apos;re not a supporter yet</p>
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Donate from just ₹{MIN_SUPPORT_AMOUNT_INR} by UPI and your supporter badge will show up here — and
                    on the Supporters Wall — once your payment is verified.
                  </p>
                </>
              )}
            </div>
          </div>
          <GhButton onClick={() => openSupport()} magnetic={false} className="w-full shrink-0 sm:w-auto">
            <Heart className="size-4" /> {tier ? 'Support again' : 'Support Us'}
          </GhButton>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-[rgb(var(--accent-1)/0.32)] bg-[rgb(var(--accent-1)/0.09)] px-4 py-3.5">
          <Clock className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
          <p className="text-sm text-muted-foreground">
            {pending.length === 1 ? '1 contribution is' : `${pending.length} contributions are`} awaiting manual
            verification (usually within a day). Reference{pending.length > 1 ? 's' : ''}:{' '}
            {pending.map((c) => c.clientRef).join(', ')}.
          </p>
        </div>
      )}

      {latestRejected && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3.5">
          <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
          <p className="text-sm text-muted-foreground">
            Contribution {latestRejected.clientRef} couldn&apos;t be verified
            {latestRejected.rejectionReason ? `: ${latestRejected.rejectionReason}` : '.'} Reach out via the Support
            Center if you think this is a mistake.
          </p>
        </div>
      )}

      <Pill>
        <QrCode className="size-3.5 text-[rgb(var(--accent-1))]" /> UPI-only · Manually verified for real
      </Pill>

      <p className="text-sm text-muted-foreground">
        Want the full breakdown — fund allocation, tiers, and FAQ?{' '}
        <Link href="/support-us" className="font-medium text-[rgb(var(--accent-1))] hover:underline">
          See the full Support Us page
        </Link>
      </p>

      {user && (
        <div className="glass rounded-2xl border border-border/60 p-5 sm:p-6">
          <PaymentHistoryList />
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Supporter tiers &amp; badges
        </p>
        <div className="mt-3">
          <SupporterTierGrid compact activeTierId={tier?.id ?? null} />
        </div>
      </div>
    </div>
  )
}
