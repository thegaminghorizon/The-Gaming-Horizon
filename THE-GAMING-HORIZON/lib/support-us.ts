// Real UPI "Support Us" donations for Gaming Horizon.
//
// Unlike lib/pricing.ts (still a PLANNED_PRICING_NOTICE preview — see
// PurchasePreviewModal in app/plans/plans-view.tsx), this feature is live:
// SUPPORT_DONATIONS_LIVE is true, and contributions are collected for
// real, to the UPI ID below. This file holds the display data plus the
// UPI-link/QR helpers; the actual submission + manual-verification flow
// lives in lib/support-contributions.ts and
// supabase/migrations/0006_support_contributions.sql. Nobody's card or
// bank details ever touch this site — every payment happens inside the
// payer's own UPI app.

/** Real UPI QR + manual-verification flow is wired up (see support-us-modal.tsx and supabase/migrations/0006_support_contributions.sql). */
export const SUPPORT_DONATIONS_LIVE = true

export const MIN_SUPPORT_AMOUNT_INR = 49

/** The UPI VPA every Support Us contribution is paid to. UPI-only, by design — no cards, no bank details ever touch this site. */
export const SUPPORT_UPI_ID = '7895866077@fam'

/** Payee name shown in the payer's own UPI app when they scan or tap to pay. */
export const SUPPORT_UPI_PAYEE_NAME = 'Gaming Horizon'

/**
 * Builds a standard NPCI UPI deep link (`upi://pay?...`) for an exact
 * amount, with a short merchant-generated reference (`tr`) baked into both
 * the reference field and the note, so it's easy to match a payer's bank
 * statement line back to their submission later. This same URI doubles as
 * a QR-code payload (via buildUpiQrImageUrl) and as a tap-to-pay link for
 * anyone opening the site on the same phone they'll pay from.
 */
export function buildUpiPaymentUri(amountInr: number, clientRef: string): string {
  const params = new URLSearchParams({
    pa: SUPPORT_UPI_ID,
    pn: SUPPORT_UPI_PAYEE_NAME,
    am: amountInr.toFixed(2),
    cu: 'INR',
    tn: `Support Gaming Horizon ${clientRef}`,
    tr: clientRef,
  })
  return `upi://pay?${params.toString()}`
}

/**
 * How long a Horizon Pay checkout session stays "live" before its QR and
 * reference expire and the screen offers a fresh one. This is a UX/session-
 * hygiene window only (matches the "this order has expired" pattern of any
 * checkout flow) — it has no bearing on UPI itself, and does not mean a
 * transfer can no longer be verified after it lapses.
 */
export const PAYMENT_SESSION_SECONDS = 300

export type UpiAppId = 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other'

export interface UpiAppOption {
  id: UpiAppId
  name: string
  /** Close to each app's real brand color, for a recognizable badge — no logos are reproduced, just a labelled color chip. */
  colorHex: string
}

/** Shown as the "Open UPI app" choices on the Horizon Pay screen. */
export const UPI_APPS: UpiAppOption[] = [
  { id: 'gpay', name: 'Google Pay', colorHex: '#4285F4' },
  { id: 'phonepe', name: 'PhonePe', colorHex: '#5F259F' },
  { id: 'paytm', name: 'Paytm', colorHex: '#00BAF2' },
  { id: 'bhim', name: 'BHIM', colorHex: '#EE7623' },
  { id: 'other', name: 'Other UPI app', colorHex: '#64748B' },
]

/**
 * The app-specific deep-link scheme for a given UPI app, carrying the same
 * payment fields as buildUpiPaymentUri. `tez://`, `phonepe://`, and
 * `paytmmp://` are the real intent schemes those three apps register on
 * Android/iOS; BHIM and "Other" fall back to the standard `upi://pay`
 * scheme, which any UPI-enabled app can register as a handler for, so the
 * OS offers a chooser instead of a specific app.
 */
export function buildUpiAppLink(appId: UpiAppId, amountInr: number, clientRef: string): string {
  const generic = buildUpiPaymentUri(amountInr, clientRef)
  if (appId === 'gpay' || appId === 'phonepe' || appId === 'paytm') {
    const query = generic.split('?')[1] ?? ''
    const scheme = appId === 'gpay' ? 'tez://upi/pay' : appId === 'phonepe' ? 'phonepe://pay' : 'paytmmp://pay'
    return `${scheme}?${query}`
  }
  return generic
}

/**
 * Best-effort "open this specific UPI app" helper for the Horizon Pay
 * screen. Tries the app's own deep-link scheme first; if the page hasn't
 * been hidden ~1.4s later (the closest signal a browser gives to "nothing
 * intercepted that link"), falls back to the generic upi://pay link so the
 * OS can offer its own chooser instead. No browser API can actually
 * confirm an app is installed, so this is best-effort — the QR code and
 * "Copy UPI ID" next to it always work regardless of whether a specific
 * app opens.
 */
export function tryOpenUpiApp(appId: UpiAppId, amountInr: number, clientRef: string) {
  if (typeof window === 'undefined') return
  const primary = buildUpiAppLink(appId, amountInr, clientRef)
  if (appId === 'bhim' || appId === 'other') {
    window.location.href = primary
    return
  }
  const fallback = buildUpiPaymentUri(amountInr, clientRef)
  let hidden = false
  const onVisibility = () => {
    if (document.hidden) hidden = true
  }
  document.addEventListener('visibilitychange', onVisibility)
  window.location.href = primary
  window.setTimeout(() => {
    document.removeEventListener('visibilitychange', onVisibility)
    if (!hidden) window.location.href = fallback
  }, 1400)
}

/**
 * Renders a UPI payment URI as a scannable QR PNG via a public QR-image
 * service (api.qrserver.com) — no extra package or backend needed, and
 * nothing sensitive is in the payload beyond what the QR is meant to show
 * anyone pointing a camera at it (the UPI ID, the amount, and a reference
 * code). If this image ever fails to load, the raw upi:// link below still
 * works on its own as a tap-to-pay button.
 */
export function buildUpiQrImageUrl(upiUri: string, sizePx = 260): string {
  const size = `${sizePx}x${sizePx}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&margin=10&data=${encodeURIComponent(upiUri)}`
}

/** Short reference shown alongside the QR so a payer can mention it in their UPI app's note field, making it easier to match against a bank statement during manual verification. Not a security token. */
export function generateClientRef(): string {
  const raw =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`
  return `GH-${raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)}`
}

export type SupportContributionStatus = 'pending' | 'verified' | 'rejected'

/** Quick-pick chips shown above the custom-amount field. */
export const QUICK_SUPPORT_AMOUNTS = [100, 500, 1000, 5000, 10000]

export interface SupporterTier {
  id: string
  name: string
  minAmountInr: number
  tagline: string
  perks: string[]
}

// Ordered lowest → highest; getSupporterTier() relies on that order.
export const SUPPORTER_TIERS: SupporterTier[] = [
  {
    id: 'backer',
    name: 'Backer',
    minAmountInr: MIN_SUPPORT_AMOUNT_INR,
    tagline: 'Every rupee keeps the servers running.',
    perks: ['Backer badge on your profile', 'Your name on the Supporters Wall', 'Access to supporter-only dev updates'],
  },
  {
    id: 'supporter',
    name: 'Supporter',
    minAmountInr: 500,
    tagline: 'A solid push toward beta infrastructure.',
    perks: ['Coloured Supporter badge', 'Supporter role in Discord', 'Vote on community polls', 'Everything in Backer'],
  },
  {
    id: 'champion',
    name: 'Champion',
    minAmountInr: 1000,
    tagline: 'Real fuel for the roadmap.',
    perks: ['Animated Champion badge frame', 'Priority replies on the Suggestions board', 'Early look at roadmap updates', 'Everything in Supporter'],
  },
  {
    id: 'legend',
    name: 'Legend',
    minAmountInr: 10000,
    tagline: 'Founding-tier generosity.',
    perks: ['Exclusive Legend badge + frame', 'Name in the official launch credits', 'A personal thank-you from the team', 'Everything in Champion'],
  },
]

/** The highest tier an amount qualifies for, or null if below the minimum. */
export function getSupporterTier(amountInr: number): SupporterTier | null {
  let match: SupporterTier | null = null
  for (const tier of SUPPORTER_TIERS) {
    if (amountInr >= tier.minAmountInr) match = tier
  }
  return match
}

/** The next tier above an amount, or null once it already clears the top tier (Legend). */
export function getNextTier(amountInr: number): SupporterTier | null {
  return SUPPORTER_TIERS.find((tier) => amountInr < tier.minAmountInr) ?? null
}

export const WHY_SUPPORT = [
  {
    title: 'Servers & hosting',
    desc: 'Every beta build, game preview, and page load runs on infrastructure your support pays for directly — not on ad revenue catching up with the community.',
  },
  {
    title: 'Faster development',
    desc: 'Contributions fund the tooling and testing time that turns roadmap items into shipped features, instead of features waiting on whatever time is left over.',
  },
  {
    title: 'A truly independent platform',
    desc: 'No publisher, no investor pressure, no ads, no selling player data. Supporters are the business model, which keeps the incentives pointed at players.',
  },
]

export interface FundAllocation {
  id: string
  label: string
  percent: number
  desc: string
}

/**
 * How supporter contributions are planned to be split. This is the team's
 * allocation plan, not an audited report of funds already spent — it
 * describes intent, not a running ledger. Percentages sum to 100.
 */
export const FUND_ALLOCATION: FundAllocation[] = [
  {
    id: 'infra',
    label: 'Servers & infrastructure',
    percent: 45,
    desc: 'Hosting, CDN, and database costs that keep the site, beta builds, and game previews fast as the community grows.',
  },
  {
    id: 'dev',
    label: 'Development & tooling',
    percent: 30,
    desc: 'Editor, testing, and build tooling time that goes straight back into shipping features on the roadmap.',
  },
  {
    id: 'community',
    label: 'Community rewards',
    percent: 15,
    desc: 'Supporter badges, Discord perks, and the small touches that say thank you to the people funding the beta.',
  },
  {
    id: 'reserve',
    label: 'Operating reserve',
    percent: 10,
    desc: 'A buffer for scaling costs and, once donations open, secure payment processing.',
  },
]

/**
 * The number of Founding Supporter badge slots the team is aiming to fill
 * before the Public Beta ships. The Support Us page and homepage section
 * show real progress toward this goal, pulled from verified contributions
 * (see lib/support-contributions.ts's getSupportWall()).
 */
export const FOUNDING_SUPPORTER_GOAL = 250

export interface SupportFaqItem {
  q: string
  a: string
}

export const SUPPORT_FAQ: SupportFaqItem[] = [
  {
    q: 'Is Support Us live yet?',
    a: "Yes. Pick an amount, scan the QR (or tap it on mobile to open your UPI app directly), and pay. No payment details are ever collected on this site — the whole transaction happens inside your own UPI app.",
  },
  {
    q: 'Where does my money go?',
    a: 'Contributions are split across servers and infrastructure, development and tooling, community rewards, and an operating reserve — see the breakdown above. There is no advertising or data-selling in the plan; supporter contributions are the intended funding model.',
  },
  {
    q: 'Is this a one-time payment or a subscription?',
    a: "One-time — no recurring charge. You can pay via the QR without an account, but signing in first means your badge and Supporters Wall entry can be attached to your profile as soon as the payment is verified, instead of waiting on you to link it up later.",
  },
  {
    q: 'How do I get my supporter badge?',
    a: "Sign in (or create an account) so there's a profile for the badge to attach to, pay via the QR, then submit the UPI transaction reference (UTR) from your payment when prompted. UPI has no way to notify a website automatically when a transfer completes, so that reference is checked by hand against the project's own bank statement — usually within a day — and your badge and Supporters Wall entry appear the moment that check passes.",
  },
  {
    q: 'Can I get a refund?',
    a: "Supporting Gaming Horizon is a voluntary contribution to an independent, pre-launch project rather than a purchase, so it isn't built around refunds. Full terms will be published alongside the real payment flow before it goes live.",
  },
  {
    q: 'Is my payment information stored anywhere?',
    a: "The payment itself happens entirely inside your own UPI app — Gaming Horizon never sees or stores your card, bank account, or UPI PIN. The only thing saved here is what you type in afterwards: the amount and the UPI transaction reference (UTR), so it can be checked and your badge granted.",
  },
]
