'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, Download, Loader2, XCircle, type LucideIcon } from 'lucide-react'
import {
  downloadContributionReceipt,
  getMyContributions,
  getTotalVerifiedInr,
  type SupportContribution,
} from '@/lib/support-contributions'

const STATUS_META: Record<SupportContribution['status'], { label: string; className: string; icon: LucideIcon }> = {
  verified: { label: 'Verified', className: 'border-emerald-500/40 text-emerald-500', icon: CheckCircle2 },
  pending: { label: 'Pending', className: 'border-[rgb(var(--accent-1)/0.4)] text-[rgb(var(--accent-1))]', icon: Clock },
  rejected: { label: 'Rejected', className: 'border-red-500/40 text-red-500', icon: XCircle },
}

/**
 * Full "everything you've paid" list — every contribution the signed-in
 * user has ever submitted, newest first, each with its own receipt
 * download. Used both inside the Horizon Pay checkout flow (a "Payment
 * history" step, see support-us-modal.tsx) and on the account page's
 * Support tab (account-support-panel.tsx).
 */
export function PaymentHistoryList({ onBack }: { onBack?: () => void }) {
  const [contributions, setContributions] = useState<SupportContribution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  }, [])

  const totalVerified = getTotalVerifiedInr(contributions)

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-heading text-base font-bold text-foreground">Payment history</p>
          <p className="text-xs text-muted-foreground">
            {contributions.length === 0
              ? 'Every contribution you make will show up here.'
              : `₹${totalVerified.toLocaleString('en-IN')} verified across ${contributions.length} contribution${contributions.length === 1 ? '' : 's'}`}
          </p>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Back
          </button>
        )}
      </div>

      <div className="mt-4 space-y-2.5">
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading your contributions…
          </p>
        ) : contributions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/70 p-5 text-sm text-muted-foreground">
            No contributions yet — support Gaming Horizon and it&apos;ll show up here.
          </p>
        ) : (
          contributions.map((c) => {
            const meta = STATUS_META[c.status]
            const Icon = meta.icon
            return (
              <div key={c.id} className="rounded-2xl border border-border/70 bg-background/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      ₹{c.amountInr.toLocaleString('en-IN')} ·{' '}
                      {c.tierId.charAt(0).toUpperCase() + c.tierId.slice(1)} tier
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">Ref {c.clientRef}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/70">
                      {new Date(c.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}
                    >
                      <Icon className="size-3" /> {meta.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => downloadContributionReceipt(c)}
                      className="gh-interactive inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <Download className="size-3.5" /> Receipt
                    </button>
                  </div>
                </div>
                {c.status === 'rejected' && c.rejectionReason && (
                  <p className="mt-2 text-xs text-red-500">{c.rejectionReason}</p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
