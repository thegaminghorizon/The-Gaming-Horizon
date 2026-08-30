'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  Clock,
  Crown,
  Heart,
  IndianRupee,
  Info,
  QrCode,
  Sparkles,
  X,
} from 'lucide-react'
import { useSettings } from '@/components/providers/settings-provider'
import { useUI } from '@/components/providers/ui-provider'
import { GhButton } from '@/components/ui/primitives'
import { SupporterTierGrid } from '@/components/supporter-tier-grid'
import {
  MIN_SUPPORT_AMOUNT_INR,
  QUICK_SUPPORT_AMOUNTS,
  SUPPORT_DONATIONS_LIVE,
  WHY_SUPPORT,
  getNextTier,
  getSupporterTier,
} from '@/lib/support-us'
import { cn } from '@/lib/utils'

/**
 * The global "Support Gaming Horizon" donation modal. Opened from the
 * homepage Support section, the footer, and the account Support tab via
 * useUI().openSupport() — mounted once in SiteShell, same pattern as
 * WaitlistModal / ComingSoonModal.
 *
 * Donations aren't live yet (SUPPORT_DONATIONS_LIVE in lib/support-us.ts),
 * matching the rest of the site's pre-launch payment stance (see
 * PurchasePreviewModal in app/plans/plans-view.tsx). The amount picker and
 * QR panel are fully built so flipping that flag — once a real UPI QR
 * image is dropped in and a manual-verification flow exists for badges —
 * is the only change needed to go live.
 *
 * Until then, the section stays fully open for browsing (amounts, tiers,
 * the "why support" cards, all visible with nothing locked behind a
 * teaser) — it's only the actual pay action (tapping the QR or the "Pay
 * now" button) that surfaces the "Payments are opening soon" notice below,
 * since that's the one step that can't actually be completed yet.
 */
export function SupportUsModal() {
  const { supportOpen, supportPresetAmount, closeSupport, openWaitlist } = useUI()
  const { settings } = useSettings()
  const reduced = settings.motionMode !== 'full'
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const [amount, setAmount] = useState<number>(QUICK_SUPPORT_AMOUNTS[0])
  const [customValue, setCustomValue] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [paymentAttempted, setPaymentAttempted] = useState(false)
  const paymentNoticeTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null)

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
    setPaymentAttempted(false)
  }, [supportOpen, supportPresetAmount])

  useEffect(() => {
    return () => {
      if (paymentNoticeTimer.current) window.clearTimeout(paymentNoticeTimer.current)
    }
  }, [])

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

  const notifyMe = () => {
    handleClose()
    window.setTimeout(openWaitlist, 80)
  }

  // The actual "go pay" action — tapping the QR or the Pay button. Real
  // donations aren't live yet, so this is where that gets surfaced: right
  // at the point of paying, not before. Once SUPPORT_DONATIONS_LIVE flips
  // to true and a real UPI QR + verification flow exists, this is the spot
  // to launch that flow instead.
  const handleAttemptPayment = () => {
    if (!validAmount) return
    if (SUPPORT_DONATIONS_LIVE) return
    setPaymentAttempted(true)
    if (paymentNoticeTimer.current) window.clearTimeout(paymentNoticeTimer.current)
    paymentNoticeTimer.current = window.setTimeout(() => setPaymentAttempted(false), 5000)
  }

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

              {/* QR panel — the QR itself is the "go pay" trigger. Real
                  donations aren't live yet, so tapping it (like tapping the
                  Pay button below) surfaces the "opening soon" notice
                  instead of a real payment. */}
              <div className="mt-6 grid gap-5 rounded-2xl border border-border/70 bg-background/50 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
                <button
                  type="button"
                  onClick={handleAttemptPayment}
                  disabled={!validAmount}
                  aria-label={
                    validAmount
                      ? `Pay ₹${effectiveAmount.toLocaleString('en-IN')} via UPI QR`
                      : 'Enter a valid amount to pay via UPI QR'
                  }
                  className="gh-interactive relative mx-auto grid size-36 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-[rgb(var(--accent-1)/0.4)] bg-[rgb(var(--accent-1)/0.06)] outline-none transition-colors hover:border-[rgb(var(--accent-1)/0.65)] hover:bg-[rgb(var(--accent-1)/0.1)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <QrCode className="size-14 text-[rgb(var(--accent-1)/0.6)]" />
                  <span className="absolute -top-2.5 right-2 rounded-full bg-[rgb(var(--accent-1))] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    Preview
                  </span>
                </button>
                <div>
                  <p className="text-sm font-semibold text-foreground">Pay only by UPI QR — no cards, no accounts</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Open any UPI app, scan the code, and pay {validAmount ? `₹${effectiveAmount.toLocaleString('en-IN')}` : 'your amount'}. That&apos;s the whole flow — nothing is ever stored on this site.
                  </p>
                  <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground/80">
                    <Info className="mt-0.5 size-3.5 shrink-0 text-[rgb(var(--accent-1))]" />
                    {SUPPORT_DONATIONS_LIVE
                      ? 'Scan the code above to donate now.'
                      : "Donations aren't open yet — you're previewing how Support will work. The real scannable code goes live alongside the Public Beta."}
                  </p>
                </div>
              </div>

              {/* Payment-opening-soon notice — only appears the moment
                  someone actually tries to pay (QR or Pay button), not
                  while they're just browsing amounts and tiers above. */}
              <AnimatePresence>
                {paymentAttempted && !SUPPORT_DONATIONS_LIVE && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div
                      role="status"
                      aria-live="polite"
                      className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[rgb(var(--accent-1)/0.32)] bg-[rgb(var(--accent-1)/0.09)] px-4 py-3.5"
                    >
                      <Clock className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Payments are opening soon</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          UPI donations aren&apos;t open yet, but they&apos;re on the way alongside the Public Beta.
                          Hit &quot;Notify me&quot; below and we&apos;ll let you know the moment they go live.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <GhButton onClick={handleAttemptPayment} disabled={!validAmount} magnetic={false} className="w-full">
                  <IndianRupee className="size-4" /> Pay {validAmount ? `₹${effectiveAmount.toLocaleString('en-IN')}` : ''} now
                </GhButton>
                <GhButton onClick={notifyMe} variant="glass" magnetic={false} className="w-full">
                  <Bell className="size-4" /> Notify me when donations open
                </GhButton>
                <button
                  type="button"
                  onClick={handleClose}
                  className="gh-interactive min-h-11 rounded-xl border border-border/70 bg-background/55 px-4 text-sm font-semibold text-muted-foreground outline-none hover:text-foreground sm:col-span-2"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  )
}
