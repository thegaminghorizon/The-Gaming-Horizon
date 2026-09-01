// Data layer for real UPI "Support Us" contributions.
//
// A contribution is self-reported by the payer after completing a UPI
// transfer in their own banking app — this site has no way to be notified
// when that transfer actually completes, so every contribution starts
// 'pending' until an admin checks the reported UTR against the project's
// own bank/UPI statement and marks it 'verified'. See
// supabase/migrations/0006_support_contributions.sql for the schema and
// row-level-security rules everything here relies on — the database, not
// this file, is what actually stops a client from forging a tier or a
// verified status.

import { createClient } from '@/lib/supabase/client'
import { SUPPORT_UPI_ID, type SupportContributionStatus } from '@/lib/support-us'

export interface SupportContribution {
  id: string
  displayName: string
  amountInr: number
  tierId: string
  clientRef: string
  upiRef: string
  note: string
  isPublic: boolean
  status: SupportContributionStatus
  rejectionReason: string | null
  createdAt: string
  verifiedAt: string | null
}

export interface SupportWallEntry {
  id: string
  displayName: string
  tierId: string
  verifiedAt: string
}

interface ContributionRow {
  id: string
  display_name: string
  amount_inr: number
  tier_id: string
  client_ref: string
  upi_ref: string
  note: string
  is_public: boolean
  status: SupportContributionStatus
  rejection_reason: string | null
  created_at: string
  verified_at: string | null
}

function rowToContribution(row: ContributionRow): SupportContribution {
  return {
    id: row.id,
    displayName: row.display_name,
    amountInr: row.amount_inr,
    tierId: row.tier_id,
    clientRef: row.client_ref,
    upiRef: row.upi_ref,
    note: row.note,
    isPublic: row.is_public,
    status: row.status,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    verifiedAt: row.verified_at,
  }
}

/**
 * Submits a new contribution for the signed-in user. amount_inr is the only
 * payment fact trusted from the client — tier, status, and the verified
 * stamp are all re-derived or reset server-side by database triggers no
 * matter what this sends.
 */
export async function submitContribution(input: {
  userId: string
  displayName: string
  amountInr: number
  clientRef: string
  upiRef: string
  note?: string
  isPublic: boolean
}): Promise<{ ok: true; contribution: SupportContribution } | { ok: false; error: string }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('support_contributions')
    .insert({
      user_id: input.userId,
      display_name: input.displayName.trim() || 'A supporter',
      amount_inr: Math.round(input.amountInr),
      client_ref: input.clientRef,
      upi_ref: input.upiRef.trim(),
      note: input.note?.trim() || '',
      is_public: input.isPublic,
    })
    .select('*')
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message || 'Could not submit your contribution. Please try again.' }
  }
  return { ok: true, contribution: rowToContribution(data as ContributionRow) }
}

/** Every contribution the signed-in user has ever submitted, newest first. */
export async function getMyContributions(): Promise<SupportContribution[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('support_contributions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return (data as ContributionRow[]).map(rowToContribution)
}

/** Lets a payer withdraw a mistaken submission — only works while it's still pending (enforced by RLS, not just this check). */
export async function withdrawContribution(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('support_contributions').delete().eq('id', id).eq('status', 'pending')
}

/** Public Supporters Wall — verified, opted-in contributions only. Safe to call while signed out. */
export async function getSupportWall(limit = 250): Promise<SupportWallEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('support_wall')
    .select('*')
    .order('verified_at', { ascending: true })
    .limit(limit)
  if (error || !data) return []
  return (data as { id: string; display_name: string; tier_id: string; verified_at: string }[]).map((row) => ({
    id: row.id,
    displayName: row.display_name,
    tierId: row.tier_id,
    verifiedAt: row.verified_at,
  }))
}

/**
 * Live-watches a single contribution row so the Horizon Pay checkout screen
 * can flip to "Payment successful" the instant an admin verifies it,
 * without a page refresh or re-fetch.
 *
 * Important: this is NOT a bank/UPI notification. UPI still gives this site
 * no way to observe money moving between accounts — what this subscribes
 * to is this project's own database row, which only changes when an admin
 * has checked the reported UTR against the bank/UPI statement by hand and
 * clicked Verify (see verifyContribution above, and support-admin-panel.tsx).
 * "Automatic" here means the UI updates itself once that human check has
 * happened — not that the check itself is automated.
 *
 * Returns an unsubscribe function; always call it on unmount.
 */
export function subscribeToContribution(
  id: string,
  onUpdate: (contribution: SupportContribution) => void,
): () => void {
  const supabase = createClient()
  const channel = supabase
    .channel(`support-contribution-${id}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'support_contributions', filter: `id=eq.${id}` },
      (payload) => onUpdate(rowToContribution(payload.new as ContributionRow)),
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

/** Sum of a user's verified contributions — the "total supported" figure shown on the payment history view. */
export function getTotalVerifiedInr(contributions: SupportContribution[]): number {
  return contributions.filter((c) => c.status === 'verified').reduce((sum, c) => sum + c.amountInr, 0)
}

/** Whether the signed-in user can verify contributions (see public.admins in the migration). Always false when signed out or not an admin. */
export async function amIAdmin(): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('am_i_admin')
  if (error) return false
  return Boolean(data)
}

/** Every contribution, for the admin review panel. RLS only returns rows at all if the caller is actually an admin — a non-admin gets an empty list, not an error. */
export async function listAllContributions(): Promise<SupportContribution[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('support_contributions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return (data as ContributionRow[]).map(rowToContribution)
}

/** Approves a contribution — this is the one action that actually grants the badge and Supporters Wall entry (via support_wall reading only 'verified' rows). Only succeeds for an admin; RLS rejects everyone else. */
export async function verifyContribution(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { error } = await supabase.from('support_contributions').update({ status: 'verified' }).eq('id', id)
  return error ? { ok: false, error: error.message } : { ok: true }
}

export async function rejectContribution(id: string, reason: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('support_contributions')
    .update({ status: 'rejected', rejection_reason: reason.trim() || 'Could not verify this payment.' })
    .eq('id', id)
  return error ? { ok: false, error: error.message } : { ok: true }
}

/**
 * Downloads a Horizon Pay receipt as a PDF — built client-side with jsPDF
 * (dynamically imported, same pattern as lib/whats-new.ts) so it never
 * touches the main bundle for people who never click the button.
 *
 * The heading and footer note both change with contribution.status: a
 * pending row gets a "submission receipt" that explicitly says the
 * transfer isn't confirmed yet, and only a verified row gets the "payment
 * receipt" framing with a verified-on date. That distinction is
 * deliberate — see the file header for why.
 */
export async function downloadContributionReceipt(contribution: SupportContribution) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a5' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40
  let y = 0

  const isVerified = contribution.status === 'verified'
  const isRejected = contribution.status === 'rejected'
  const statusLabel = isVerified ? 'Verified' : isRejected ? 'Rejected' : 'Pending verification'
  const statusColor: [number, number, number] = isVerified ? [16, 150, 90] : isRejected ? [220, 38, 38] : [139, 92, 246]

  // Header bar
  doc.setFillColor(139, 92, 246)
  doc.rect(0, 0, pageWidth, 64, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('Horizon Pay', margin, 32)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('UPI checkout for Gaming Horizon', margin, 47)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(isVerified ? 'PAYMENT RECEIPT' : 'SUBMISSION RECEIPT', pageWidth - margin, 32, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(contribution.clientRef, pageWidth - margin, 47, { align: 'right' })

  y = 96
  doc.setTextColor(30, 30, 35)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(`Rs. ${contribution.amountInr.toLocaleString('en-IN')}`, margin, y)

  // Status chip
  const chipLabel = statusLabel
  doc.setFontSize(9)
  const chipWidth = doc.getTextWidth(chipLabel) + 20
  doc.setDrawColor(...statusColor)
  doc.setTextColor(...statusColor)
  doc.roundedRect(pageWidth - margin - chipWidth, y - 14, chipWidth, 20, 10, 10, 'S')
  doc.text(chipLabel, pageWidth - margin - chipWidth / 2, y - 0.5, { align: 'center' })

  y += 20
  doc.setTextColor(120, 120, 128)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`${contribution.tierId.charAt(0).toUpperCase() + contribution.tierId.slice(1)} tier · Gaming Horizon support`, margin, y)

  y += 22
  doc.setDrawColor(225, 225, 230)
  doc.line(margin, y, pageWidth - margin, y)
  y += 26

  const rows: [string, string][] = [
    ['Paid to', SUPPORT_UPI_ID],
    ['Submitted', new Date(contribution.createdAt).toLocaleString('en-IN')],
    ['UPI transaction ref (UTR)', contribution.upiRef],
    ['Supporter', contribution.displayName],
  ]
  if (isVerified && contribution.verifiedAt) {
    rows.push(['Verified on', new Date(contribution.verifiedAt).toLocaleString('en-IN')])
  }
  if (isRejected && contribution.rejectionReason) {
    rows.push(['Reason', contribution.rejectionReason])
  }

  doc.setFontSize(10.5)
  for (const [label, value] of rows) {
    doc.setTextColor(120, 120, 128)
    doc.setFont('helvetica', 'normal')
    doc.text(label, margin, y)
    doc.setTextColor(30, 30, 35)
    doc.setFont('helvetica', 'bold')
    const wrapped = doc.splitTextToSize(value, pageWidth - margin * 2 - 170)
    doc.text(wrapped, margin + 170, y)
    y += 20 * wrapped.length
  }

  y += 16
  doc.setDrawColor(225, 225, 230)
  doc.line(margin, y, pageWidth - margin, y)
  y += 20

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8.5)
  doc.setTextColor(140, 140, 148)
  const note = isVerified
    ? 'This contribution has been checked by hand against the project\u2019s own UPI/bank statement and verified. It is a voluntary contribution to an independent, pre-launch project, not a purchase of goods or services.'
    : 'This confirms a contribution was submitted for review, not that the transfer has been confirmed. UPI gives no automatic way to notify a website when a transfer completes, so every contribution is checked by hand against the project\u2019s own UPI/bank statement before it counts as verified.'
  const wrapped = doc.splitTextToSize(note, pageWidth - margin * 2)
  doc.text(wrapped, margin, y)

  doc.save(`horizon-pay-${contribution.clientRef}.pdf`)
}
