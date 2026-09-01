'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Crown, Heart, History, IndianRupee, Sparkles, X } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useSettings } from '@/components/providers/settings-provider'
import { useUI } from '@/components/providers/ui-provider'
import { GhButton } from '@/components/ui/primitives'
import { SupporterTierGrid } from '@/components/supporter-tier-grid'
import { HorizonPayCheckout } from '@/components/horizon-pay-checkout'
import { PaymentHistoryList } from '@/components/payment-history-list'
import { getMyContributions, type SupportContribution } from '@/lib/support-contributions'
import {
  MIN_SUPPORT_AMOUNT_INR,
  QUICK_SUPPORT_AMOUNTS,
  SUPPORT_DONATIONS_LIVE,
  WHY_SUPPORT,
  getNextTier,
  getSupporterTier,
} from '@/lib/support-us'
import { cn } from '@/lib/utils'

type ModalStep = 'amount' | 'checkout' | 'history'

/**
 * The global "Support Gaming Horizon" donation modal. Opened from the
 * homepage Support section, the footer, and the account Support tab via
 * useUI().openSupport() — mounted once in SiteShell, same pattern as
 * WaitlistModal / ComingSoonModal.
 *
 * Three steps: pick an amount, then "Continue to Payment" hands off to the
 * Horizon Pay checkout screen (components/horizon-pay-checkout.tsx) for the
 * QR/UPI-app/UTR flow, or "View payment history" shows every contribution
 * the signed-in user has ever submitted (components/payment-history-list.tsx).
 *
 * Real money movement happens entirely inside the payer's own UPI app —
 * this site only ever generates a upi://pay deep link (as a QR and as
 * app-specific tap-to-pay links) for SUPPORT_UPI_ID in lib/support-us.ts.
 * UPI has no callback to a website, so nothing here can detect a transfer
 * on its own; the payer submits their UPI transaction reference (UTR)
 * afterwards, which lands in Supabase as a 'pending' row for an admin to
 * check by hand. Only that manual verification grants a badge or a
 * Supporters Wall entry — the Horizon Pay screen just watches that row live
 * (via Supabase Realtime) so it can update itself the instant that happens,
 * without a refresh.
 */
export function SupportUsModal() {
  const { supportOpen, supportPresetAmount, closeSupport } = useUI()
  const { settings } = useSettings()
  const { user, displayName } = useAuth()
  const reduced = settings.motionMode !== 'full'
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const [step, setStep] = useState<ModalStep>('amount')
  const [amount, setAmount] = useState<number>(QUICK_SUPPORT_AMOUNTS[0])
  const [customValue, setCustomValue] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const [myPending, setMyPending] = useState<SupportContribution[]>([])

  useEffect(() => {
    if (!supportOpen) return
    triggerRef.current = document.activeElement as HTMLElement
    if (supportPresetAmount && supportPresetAmount > 0) {
      if (QUICK_SUPPORT_AMOUNTS.includes(supportPresetAmount)) {
        setUseCustom(false)
        setAmount(supportPresetAmount)
      } else {
        setUseCustom(true)
        setCustomValue(String(supportPresetAmount))
      }
    } else {
      setUseCustom(false)
      setAmount(QUICK_SUPPORT_AMOUNTS[0])
      setCustomValue('')
    }
    setStep('amount')
  }, [supportOpen, supportPresetAmount])

  // Pick up any contribution this signed-in user already has awaiting
  // review, so reopening the modal doesn't lose track of it.
  useEffect(() => {
    if (!supportOpen || !user) {
      setMyPending([])
      return
    }
    let cancelled = false
    getMyContributions().then((rows) => {
      if (!cancelled) setMyPending(rows.filter((row) => row.status === 'pending'))
    })
    return () => {
      cancelled = true
    }
  }, [supportOpen, user])

  useEffect(() => {
    if (supportOpen) {
      document.body.style.overflow = 'hidden'
      const t = window.setTimeout(() => closeRef.current?.focus(), 0)
      return () => window.clearTimeout(t)
    }
    document.body.style.overflow = ''
    return undefined
  }, [supportOpen])

  function handleClose() {
    closeSupport()
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!supportOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supportOpen])

  const customNumber = Number(customValue)
  const effectiveAmount = useCustom ? customNumber : amount
  const customError =
    useCustom && customValue.trim() !== '' && (!Number.isFinite(customNumber) || customNumber < MIN_SUPPORT_AMOUNT_INR)
  const validAmount = Number.isFinite(effectiveAmount) && effectiveAmount >= MIN_SUPPORT_AMOUNT_INR

  const tier = useMemo(() => (validAmount ? getSupporterTier(effectiveAmount) : null), [validAmount, effectiveAmount])
  const nextTier = useMemo(() => (tier ? getNextTier(effectiveAmount) : null), [tier, effectiveAmount])
  // Progress across the *current* tier's range, e.g. 40% of the way from Backer to Supporter.
  const tierProgress = useMemo(() => {
    if (!tier) return 0
    if (!nextTier) return 1
    const span = nextTier.minAmountInr - tier.minAmountInr
    return span <= 0 ? 1 : Math.min(1, Math.max(0, (effectiveAmount - tier.minAmountInr) / span))
  }, [tier, nextTier, effectiveAmount])

  return (
    <AnimatePresence>
      {supportOpen && (
        <div className="fixed inset-0 z-[240] flex items-end justify-center p-0 sm:items-center sm:p-6 landscape:items-center landscape:p-3">
          <motion.button
            aria-label="Close Support Gaming Horizon"
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Support Gaming Horizon"
            className="glass-panel-large relative z-10 flex max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] bg-background/97 sm:max-h-[92vh] sm:rounded-[2rem] landscape:max-h-[94dvh] landscape:rounded-[1.5rem]"
            initial={{ opacity: 0, y: reduced ? 0 : 40, scale: reduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.98 }}
            transition={{ duration: reduced ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="relative flex items-center gap-3 border-b border-border px-6 py-5 pr-16 sm:px-8 sm:pr-20">
              <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                <Heart className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-bold leading-tight text-foreground sm:text-2xl">
                  Support Gaming Horizon
                </h2>
                <p className="text-xs text-muted-foreground">Fund the beta, get a supporter badge in return</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="gh-interactive absolute right-6 top-1/2 grid size-10 shrink-0 -translate-y-1/2 place-items-center rounded-xl text-muted-foreground outline-none hover:bg-muted hover:text-foreground sm:right-8"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
              {step === 'amount' && (
                <>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Gaming Horizon is built by a small, independent team. Every contribution — big or small, starting from
                    just ₹{MIN_SUPPORT_AMOUNT_INR} — goes straight into servers, tooling, and getting the Public Beta out
                    the door faster.
                  </p>

                  {/* Amount picker */}
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Choose an amount
                    </p>
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
                      <label htmlFor="support-custom-amount" className="sr-only">
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
                          id="support-custom-amount"
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
                        <p className="mt-1.5 text-xs font-medium text-red-500">
                          Minimum donation is ₹{MIN_SUPPORT_AMOUNT_INR}.
                        </p>
                      )}
                    </div>

                    {validAmount && tier && (
                      <motion.div
                        key={tier.id}
                        initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 6, scale: reduced ? 1 : 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: reduced ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                        aria-live="polite"
                        className="mt-3 rounded-xl border border-[rgb(var(--accent-1)/0.28)] bg-[rgb(var(--accent-1)/0.07)] px-3.5 py-3"
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
                              transition={{ duration: reduced ? 0.12 : 0.45, ease: [0.22, 1, 0.36, 1] }}
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
                  </div>

                  {!SUPPORT_DONATIONS_LIVE ? (
                    <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-[rgb(var(--accent-1)/0.32)] bg-[rgb(var(--accent-1)/0.09)] px-4 py-3.5">
                      <Clock className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
                      <p className="text-sm text-muted-foreground">Donations are opening soon — check back shortly.</p>
                    </div>
                  ) : (
                    <>
                      <GhButton
                        onClick={() => setStep('checkout')}
                        disabled={!validAmount}
                        magnetic={false}
                        className="mt-6 w-full"
                      >
                        Continue to Payment →
                      </GhButton>
                      <p className="mt-2 text-center text-[11px] text-muted-foreground/80">
                        Opens Horizon Pay — pay by UPI, no cards or accounts ever collected here.
                      </p>

                      {myPending.length > 0 && (
                        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[rgb(var(--accent-1)/0.32)] bg-[rgb(var(--accent-1)/0.09)] px-4 py-3.5">
                          <Clock className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
                          <div className="text-xs leading-relaxed text-muted-foreground">
                            <p className="text-sm font-semibold text-foreground">
                              {myPending.length === 1 ? '1 contribution' : `${myPending.length} contributions`} pending
                              verification
                            </p>
                            Usually reviewed within a day. Reference{myPending.length > 1 ? 's' : ''}:{' '}
                            {myPending.map((c) => c.clientRef).join(', ')}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                        {!user ? (
                          <p className="text-sm text-muted-foreground">
                            Already paid?{' '}
                            <Link href="/signin" className="font-medium text-[rgb(var(--accent-1))] hover:underline">
                              Sign in
                            </Link>{' '}
                            so there&apos;s a profile to attach your badge to.
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStep('history')}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[rgb(var(--accent-1))] hover:underline"
                          >
                            <History className="size-4" /> View payment history
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {/* Why it matters */}
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {WHY_SUPPORT.map((item) => (
                      <div key={item.title} className="rounded-xl border border-border/60 p-3.5">
                        <p className="text-xs font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tiers */}
                  <div className="mt-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Supporter tiers &amp; badges
                    </p>
                    <div className="mt-3">
                      <SupporterTierGrid compact activeTierId={tier?.id ?? null} />
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col items-center gap-3">
                    <Link
                      href="/support-us#wall"
                      onClick={handleClose}
                      className="text-xs font-semibold text-[rgb(var(--accent-1))] hover:underline"
                    >
                      See the Supporters Wall →
                    </Link>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="gh-interactive min-h-11 w-full rounded-xl border border-border/70 bg-background/55 px-4 text-sm font-semibold text-muted-foreground outline-none hover:text-foreground"
                    >
                      Maybe later
                    </button>
                  </div>
                </>
              )}

              {step === 'checkout' && SUPPORT_DONATIONS_LIVE && (
                <HorizonPayCheckout
                  amountInr={effectiveAmount}
                  tierName={tier?.name ?? 'Backer'}
                  userId={user?.id ?? null}
                  displayName={displayName}
                  onBack={() => setStep('amount')}
                  onVerified={(c) => setMyPending((prev) => prev.filter((p) => p.id !== c.id))}
                  onViewHistory={() => setStep('history')}
                />
              )}

              {step === 'history' && <PaymentHistoryList onBack={() => setStep('amount')} />}
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  )
}
