'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, Loader2, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import {
  listAllContributions,
  rejectContribution,
  verifyContribution,
  type SupportContribution,
} from '@/lib/support-contributions'

/**
 * Admin-only review queue for real UPI contributions. Only rendered for
 * signed-in admins (see AccountTabs, gated by amIAdmin()) — but the actual
 * security boundary is the database's row-level security in
 * supabase/migrations/0006_support_contributions.sql, not this component.
 * A non-admin who somehow lands here just sees an empty list, because
 * Supabase's RLS policies silently return zero rows rather than the data.
 *
 * Verifying a contribution here is the one action in the whole feature
 * that actually grants a badge and a Supporters Wall entry — everything
 * upstream of this (the QR, the submitted UTR) is just a claim until an
 * admin checks it against the project's own bank/UPI statement and clicks
 * Verify.
 */
export function SupportAdminPanel() {
  const [contributions, setContributions] = useState<SupportContribution[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  async function refresh() {
    setLoading(true)
    const rows = await listAllContributions()
    setContributions(rows)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleVerify(id: string) {
    setBusyId(id)
    await verifyContribution(id)
    await refresh()
    setBusyId(null)
  }

  async function handleReject(id: string) {
    setBusyId(id)
    await rejectContribution(id, rejectReason)
    setRejectingId(null)
    setRejectReason('')
    await refresh()
    setBusyId(null)
  }

  const pending = contributions.filter((c) => c.status === 'pending')
  const decided = contributions.filter((c) => c.status !== 'pending')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="size-5 text-[rgb(var(--accent-1))]" />
        <div>
          <p className="font-heading text-lg font-bold">Verify supporter payments</p>
          <p className="text-xs text-muted-foreground">
            Check each UTR against the project&apos;s UPI/bank statement before verifying — this is what actually
            grants the badge.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading contributions…
        </p>
      ) : pending.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 p-5 text-sm text-muted-foreground">
          Nothing pending — you&apos;re all caught up.
        </p>
      ) : (
        <div className="space-y-3">
          {pending.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border/70 bg-background/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {c.displayName} · ₹{c.amountInr.toLocaleString('en-IN')} · {c.tierId} tier
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    UTR: {c.upiRef} · Ref: {c.clientRef}
                  </p>
                  {c.note && <p className="mt-1 text-xs italic text-muted-foreground">&ldquo;{c.note}&rdquo;</p>}
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground/70">
                    <Clock className="size-3" /> Submitted {new Date(c.createdAt).toLocaleString('en-IN')}
                    {!c.isPublic && ' · opted out of the public wall'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <GhButton
                    onClick={() => handleVerify(c.id)}
                    disabled={busyId === c.id}
                    size="sm"
                    magnetic={false}
                  >
                    {busyId === c.id ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                    Verify
                  </GhButton>
                  <button
                    type="button"
                    onClick={() => setRejectingId(rejectingId === c.id ? null : c.id)}
                    disabled={busyId === c.id}
                    className="gh-interactive inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-500 outline-none hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <XCircle className="size-3.5" /> Reject
                  </button>
                </div>
              </div>
              {rejectingId === c.id && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                  <input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason (shown to the supporter)"
                    className="h-9 min-w-[200px] flex-1 rounded-lg border border-input bg-background/60 px-3 text-xs outline-none focus:border-[rgb(var(--accent-1))]"
                  />
                  <button
                    type="button"
                    onClick={() => handleReject(c.id)}
                    disabled={busyId === c.id}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Confirm reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {decided.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recent decisions</p>
          <div className="mt-3 space-y-2">
            {decided.slice(0, 20).map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 px-3.5 py-2.5 text-xs"
              >
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  {c.status === 'verified' ? (
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                  ) : (
                    <ShieldAlert className="size-3.5 text-red-500" />
                  )}
                  {c.displayName} · ₹{c.amountInr.toLocaleString('en-IN')} · {c.clientRef} · {c.status}
                </span>
                <span className="text-muted-foreground/70">
                  {c.verifiedAt ? new Date(c.verifiedAt).toLocaleDateString('en-IN') : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
