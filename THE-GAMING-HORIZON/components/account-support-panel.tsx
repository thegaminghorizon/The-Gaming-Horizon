'use client'

import Link from 'next/link'
import { Heart, QrCode } from 'lucide-react'
import { GhButton, Pill } from '@/components/ui/primitives'
import { SupporterTierGrid } from '@/components/supporter-tier-grid'
import { useUI } from '@/components/providers/ui-provider'
import { MIN_SUPPORT_AMOUNT_INR } from '@/lib/support-us'

/** The account page's "Support Us" tab: a donate CTA plus the supporter-tier showcase, no account-specific data needed since donations aren't tied to accounts yet. */
export function AccountSupportPanel() {
  const { openSupport } = useUI()

  return (
    <div className="space-y-6">
      <div className="glass relative overflow-hidden rounded-2xl border border-[rgb(var(--accent-1)/0.22)] p-6 sm:p-7">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent-1)/0.10)] via-transparent to-[rgb(var(--accent-2)/0.08)]" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
              <Heart className="size-5" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold">You&apos;re not a supporter yet</p>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
                Donate from just ₹{MIN_SUPPORT_AMOUNT_INR} by UPI QR and your supporter badge will show up here — and on
                your public profile — once donations go live.
              </p>
            </div>
          </div>
          <GhButton onClick={() => openSupport()} magnetic={false} className="w-full shrink-0 sm:w-auto">
            <Heart className="size-4" /> Support Us
          </GhButton>
        </div>
      </div>

      <Pill>
        <QrCode className="size-3.5 text-[rgb(var(--accent-1))]" /> QR-only · Preview feature, not live yet
      </Pill>

      <p className="text-sm text-muted-foreground">
        Want the full breakdown — fund allocation, tiers, and FAQ?{' '}
        <Link href="/support-us" className="font-medium text-[rgb(var(--accent-1))] hover:underline">
          See the full Support Us page
        </Link>
      </p>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Supporter tiers &amp; badges
        </p>
        <div className="mt-3">
          <SupporterTierGrid compact />
        </div>
      </div>
    </div>
  )
}
