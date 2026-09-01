'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  History,
  Info,
  Loader2,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { GhButton } from '@/components/ui/primitives'
import { UpiAppSheet } from '@/components/upi-app-sheet'
import {
  downloadContributionReceipt,
  submitContribution,
  subscribeToContribution,
  type SupportContribution,
} from '@/lib/support-contributions'
import {
  PAYMENT_SESSION_SECONDS,
  SUPPORT_UPI_ID,
  buildUpiPaymentUri,
  buildUpiQrImageUrl,
  generateClientRef,
  tryOpenUpiApp,
  type UpiAppId,
} from '@/lib/support-us'
import { cn } from '@/lib/utils'

type CheckoutStep = 'pay' | 'confirm' | 'pending' | 'verified' | 'rejected'

/**
 * The "Horizon Pay" branded checkout screen — reached from SupportUsModal
 * once an amount is chosen and "Continue to payment" is tapped. Everything
 * below the amount step lives here: the QR + session timer, the UPI app
 * picker, the post-payment UTR confirmation, and a live status view that
 * updates the instant an admin verifies the contribution.
 *
 * The one thing this deliberately does NOT do is pretend to detect the
 * bank transfer itself — UPI gives no website a way to do that without
 * being a registered payment aggregator with its own merchant API and
 * webhooks (Razorpay, Cashfree, PayU, etc.), which this project isn't. See
 * the 'pending' step below and lib/support-contributions.ts's
 * subscribeToContribution for exactly what "automatic" means here instead:
 * an admin still checks the UTR by hand, but the screen updates itself the
 * moment that check happens, with no refresh needed.
 */
export function HorizonPayCheckout({
  amountInr,
  tierName,
  userId,
  displayName,
  onBack,
  onVerified,
  onViewHistory,
}: {
  amountInr: number
  tierName: string
  /** Null when signed out — the QR/app-picker steps work either way, but submitting for verification needs a profile to attach the badge to. */
  userId: string | null
  displayName: string
  onBack: () => void
  onVerified: (contribution: SupportContribution) => void
  onViewHistory: () => void
}) {
  const [step, setStep] = useState<CheckoutStep>('pay')
  const [clientRef, setClientRef] = useState(() => generateClientRef())
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_SESSION_SECONDS)
  const [qrFailed, setQrFailed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [appSheetOpen, setAppSheetOpen] = useState(false)

  const [utr, setUtr] = useState('')
  const [note, setNote] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [contribution, setContribution] = useState<SupportContribution | null>(null)
  const notifiedRef = useRef(false)

  const expired = step === 'pay' && secondsLeft <= 0

  // Session countdown — purely a UX pacing device (see PAYMENT_SESSION_SECONDS).
  useEffect(() => {
    if (step !== 'pay' || expired) return
    const t = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(t)
  }, [step, expired])

  function regenerateSession() {
    setClientRef(generateClientRef())
    setSecondsLeft(PAYMENT_SESSION_SECONDS)
    setQrFailed(false)
    setAppSheetOpen(false)
  }

  // Live status: once a contribution is submitted, watch its row for the
  // admin's verify/reject action and flip the screen automatically.
  useEffect(() => {
    if (step !== 'pending' || !contribution) return
    const unsubscribe = subscribeToContribution(contribution.id, (updated) => {
      setContribution(updated)
      if (updated.status === 'verified') setStep('verified')
      else if (updated.status === 'rejected') setStep('rejected')
    })
    return unsubscribe
  }, [step, contribution])

  useEffect(() => {
    if (step === 'verified' && contribution && !notifiedRef.current) {
      notifiedRef.current = true
      onVerified(contribution)
    }
  }, [step, contribution, onVerified])

  const upiUri = useMemo(() => buildUpiPaymentUri(amountInr, clientRef), [amountInr, clientRef])
  const qrImageUrl = useMemo(() => buildUpiQrImageUrl(upiUri), [upiUri])

  const mm = Math.floor(secondsLeft / 60)
  const ss = secondsLeft % 60
  const timerLabel = `${mm}:${ss.toString().padStart(2, '0')}`

  async function handleCopyUpiId() {
    try {
      await navigator.clipboard.writeText(SUPPORT_UPI_ID)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard permission can be blocked — the UPI ID is shown as plain text either way.
    }
  }

  function handleChooseApp(appId: UpiAppId) {
    tryOpenUpiApp(appId, amountInr, clientRef)
  }

  async function handleSubmit() {
    if (!userId) return
    const trimmedUtr = utr.trim()
    if (trimmedUtr.length < 6) {
      setSubmitError(
        'Enter the UPI transaction ID (UTR) from your payment — find it in your UPI app under this transaction\u2019s details.',
      )
      return
    }
    if (!confirmChecked) {
      setSubmitError('Please confirm you completed this payment before submitting.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    const result = await submitContribution({
      userId,
      displayName,
      amountInr,
      clientRef,
      upiRef: trimmedUtr,
      note,
      isPublic,
    })
    setSubmitting(false)
    if (!result.ok) {
      setSubmitError(result.error)
      return
    }
    setContribution(result.contribution)
    setStep('pending')
  }

  function handleRetry() {
    notifiedRef.current = false
    setContribution(null)
    setUtr('')
    setNote('')
    setConfirmChecked(false)
    setSubmitError(null)
    regenerateSession()
    setStep('pay')
  }

  return (
    <div className="rounded-2xl border border-[rgb(var(--accent-1)/0.3)] bg-background/60">
      {/* Horizon Pay chrome */}
      <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-[rgb(var(--accent-1)/0.22)] bg-[rgb(var(--accent-1)/0.08)] px-4 py-3">
        <div className="flex items-center gap-2.5">
          {step === 'pay' && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to amount"
              className="gh-interactive grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-[rgb(var(--accent-1))]" />
            <span className="font-heading text-sm font-bold tracking-tight text-foreground">Horizon Pay</span>
          </div>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          ₹{amountInr.toLocaleString('en-IN')} · Ref {clientRef}
        </span>
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {step === 'pay' && (
            <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Scan or tap to pay
                </p>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                    expired
                      ? 'border-red-500/40 text-red-500'
                      : secondsLeft < 60
                        ? 'border-amber-500/40 text-amber-500'
                        : 'border-border/70 text-muted-foreground',
                  )}
                >
                  <Clock className="size-3" /> {expired ? 'Session expired' : `Expires in ${timerLabel}`}
                </span>
              </div>

              <div className="mt-4 grid gap-5 rounded-2xl border border-border/70 bg-background/50 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className="relative mx-auto grid size-40 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-[rgb(var(--accent-1)/0.35)] bg-white p-2">
                  {expired ? (
                    <div className="flex flex-col items-center gap-2 px-2 text-center">
                      <QrCode className="size-8 text-muted-foreground/40" />
                      <button
                        type="button"
                        onClick={regenerateSession}
                        className="gh-interactive inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--accent-1)/0.5)] px-2.5 py-1.5 text-[11px] font-semibold text-foreground outline-none"
                      >
                        <RefreshCw className="size-3" /> Get a new QR
                      </button>
                    </div>
                  ) : !qrFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrImageUrl}
                      alt={`UPI QR code to pay ₹${amountInr.toLocaleString('en-IN')} to ${SUPPORT_UPI_ID}`}
                      className="size-full object-contain"
                      onError={() => setQrFailed(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 px-2 text-center text-[10px] leading-snug text-muted-foreground">
                      <QrCode className="size-8 text-[rgb(var(--accent-1)/0.5)]" />
                      QR image didn&apos;t load — use &quot;Open UPI app&quot; or the UPI ID instead
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Pay only by UPI — no cards, no accounts</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Scan with any UPI app, or open one directly below. Paying{' '}
                    <span className="font-semibold text-foreground">₹{amountInr.toLocaleString('en-IN')}</span> to{' '}
                    <span className="font-mono font-medium text-foreground">{SUPPORT_UPI_ID}</span>.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAppSheetOpen((v) => !v)}
                      disabled={expired}
                      className="gh-interactive inline-flex items-center gap-1.5 rounded-xl border border-[rgb(var(--accent-1)/0.5)] bg-[rgb(var(--accent-1)/0.1)] px-3 py-2 text-xs font-semibold text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ExternalLink className="size-3.5" /> Open UPI app
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyUpiId}
                      className="gh-interactive inline-flex items-center gap-1.5 rounded-xl border border-border/70 px-3 py-2 text-xs font-semibold text-muted-foreground outline-none hover:text-foreground"
                    >
                      <Copy className="size-3.5" /> {copied ? 'Copied!' : 'Copy UPI ID'}
                    </button>
                  </div>
                  <UpiAppSheet open={appSheetOpen && !expired} onChoose={handleChooseApp} />
                  <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground/80">
                    <Info className="mt-0.5 size-3.5 shrink-0 text-[rgb(var(--accent-1))]" />
                    Mention reference <span className="font-mono font-medium">{clientRef}</span> in the UPI note if
                    your app allows it — makes matching your payment faster.
                  </p>
                </div>
              </div>

              <GhButton
                onClick={() => setStep('confirm')}
                disabled={expired}
                magnetic={false}
                className="mt-5 w-full"
              >
                <CheckCircle2 className="size-4" /> I&apos;ve completed the payment
              </GhButton>
              {userId && (
                <button
                  type="button"
                  onClick={onViewHistory}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <History className="size-3.5" /> View payment history
                </button>
              )}
            </motion.div>
          )}

          {step === 'confirm' && !userId && (
            <motion.div key="confirm-signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm font-semibold text-foreground">Sign in to submit your payment</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                So there&apos;s a profile for your badge and Supporters Wall entry to attach to once this is
                verified.{' '}
                <Link href="/signin" className="font-medium text-[rgb(var(--accent-1))] hover:underline">
                  Sign in
                </Link>{' '}
                and come back to this screen — your QR and reference stay the same.
              </p>
              <button
                type="button"
                onClick={() => setStep('pay')}
                className="mt-4 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Back
              </button>
            </motion.div>
          )}

          {step === 'confirm' && userId && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm font-semibold text-foreground">Confirm your payment</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                UPI gives no website a way to confirm a transfer on its own, so we check each UTR by hand against our
                bank/UPI statement. This screen updates itself the moment that check happens — no need to come back
                and refresh.
              </p>
              <div className="mt-4 space-y-3">
                <div>
                  <label htmlFor="hp-utr" className="text-xs font-medium text-muted-foreground">
                    UPI transaction ID (UTR)
                  </label>
                  <input
                    id="hp-utr"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="e.g. 412345678901"
                    className="mt-1 h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 text-sm outline-none focus:border-[rgb(var(--accent-1))]"
                  />
                </div>
                <div>
                  <label htmlFor="hp-note" className="text-xs font-medium text-muted-foreground">
                    Message (optional)
                  </label>
                  <input
                    id="hp-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Say hi to the team"
                    maxLength={140}
                    className="mt-1 h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 text-sm outline-none focus:border-[rgb(var(--accent-1))]"
                  />
                </div>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="mt-0.5"
                  />
                  Show my name on the public Supporters Wall once verified
                </label>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={confirmChecked}
                    onChange={(e) => setConfirmChecked(e.target.checked)}
                    className="mt-0.5"
                  />
                  I confirm I completed this ₹{amountInr.toLocaleString('en-IN')} UPI payment to {SUPPORT_UPI_ID}
                </label>
                {submitError && <p className="text-xs font-medium text-red-500">{submitError}</p>}
                <div className="flex items-center gap-3 pt-1">
                  <GhButton onClick={handleSubmit} disabled={submitting} magnetic={false}>
                    {submitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                    Submit for verification
                  </GhButton>
                  <button
                    type="button"
                    onClick={() => setStep('pay')}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Back
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'pending' && contribution && (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-4 text-center"
            >
              <span className="relative grid size-14 place-items-center rounded-full bg-[rgb(var(--accent-1)/0.12)]">
                <Loader2 className="size-6 animate-spin text-[rgb(var(--accent-1))]" />
              </span>
              <p className="mt-4 font-heading text-lg font-bold text-foreground">Checking your payment…</p>
              <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Reference <span className="font-mono font-medium text-foreground">{contribution.clientRef}</span> ·
                ₹{contribution.amountInr.toLocaleString('en-IN')} · {contribution.tierId} tier. We check every UTR by
                hand against our bank/UPI statement, usually within a day — this screen will update itself the
                instant that happens, so you don&apos;t need to keep checking.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <GhButton
                  onClick={() => downloadContributionReceipt(contribution)}
                  variant="glass"
                  size="sm"
                  magnetic={false}
                >
                  <Download className="size-4" /> Download submission receipt
                </GhButton>
                <button
                  type="button"
                  onClick={onViewHistory}
                  className="gh-interactive inline-flex items-center gap-1.5 rounded-xl border border-border/70 px-3 py-2 text-xs font-semibold text-muted-foreground outline-none hover:text-foreground"
                >
                  <History className="size-3.5" /> View payment history
                </button>
              </div>
            </motion.div>
          )}

          {step === 'verified' && contribution && (
            <motion.div
              key="verified"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-4 text-center"
            >
              <span className="grid size-14 place-items-center rounded-full bg-emerald-500/12 text-emerald-500">
                <CheckCircle2 className="size-7" />
              </span>
              <p className="mt-4 font-heading text-lg font-bold text-foreground">Payment successful</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-[rgb(var(--accent-1))]">
                <Sparkles className="size-4" /> You&apos;re now a {tierName} supporter
              </p>
              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
                Verified against our bank/UPI statement. Your badge and Supporters Wall entry are live on your
                profile now — reference {contribution.clientRef}.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <GhButton onClick={() => downloadContributionReceipt(contribution)} magnetic={false} size="sm">
                  <Download className="size-4" /> Download receipt
                </GhButton>
                <button
                  type="button"
                  onClick={onViewHistory}
                  className="gh-interactive inline-flex items-center gap-1.5 rounded-xl border border-border/70 px-3 py-2 text-xs font-semibold text-muted-foreground outline-none hover:text-foreground"
                >
                  <History className="size-3.5" /> Payment history
                </button>
              </div>
            </motion.div>
          )}

          {step === 'rejected' && contribution && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-4 text-center"
            >
              <span className="grid size-14 place-items-center rounded-full bg-red-500/12 text-red-500">
                <XCircle className="size-7" />
              </span>
              <p className="mt-4 font-heading text-lg font-bold text-foreground">Couldn&apos;t verify this payment</p>
              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
                {contribution.rejectionReason || 'We couldn\u2019t match this UTR against our bank/UPI statement.'}{' '}
                Reference {contribution.clientRef}. If you think this is a mistake, reach out via the Support Center.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <GhButton onClick={handleRetry} magnetic={false} size="sm">
                  <RefreshCw className="size-4" /> Try again
                </GhButton>
                <button
                  type="button"
                  onClick={onViewHistory}
                  className="gh-interactive inline-flex items-center gap-1.5 rounded-xl border border-border/70 px-3 py-2 text-xs font-semibold text-muted-foreground outline-none hover:text-foreground"
                >
                  <History className="size-3.5" /> Payment history
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
