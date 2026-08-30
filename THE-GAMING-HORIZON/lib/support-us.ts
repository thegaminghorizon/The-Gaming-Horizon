// Community support ("donate") data for Gaming Horizon.
//
// Mirrors the "preview" pattern already used by lib/pricing.ts and
// app/plans/plans-view.tsx: Gaming Horizon has no payment processor wired
// up yet (see PLANNED_PRICING_NOTICE / PurchasePreviewModal), so real UPI
// collection isn't live either. This file holds the display data for the
// Support Us section/modal — amounts, minimums, and the supporter tiers —
// so the whole feature can flip on later just by setting
// SUPPORT_DONATIONS_LIVE to true and dropping a real QR image at
// /public/support/upi-qr.png. Nothing here requests or stores payment
// details; everyone still pays by scanning a QR in their own UPI app.

/** Flip to true once a real UPI QR code + manual verification flow is ready. */
export const SUPPORT_DONATIONS_LIVE = false

export const MIN_SUPPORT_AMOUNT_INR = 49

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
 * How supporter contributions are planned to be split once donations go
 * live. This is the team's allocation plan, not a report of funds already
 * collected — nothing has been collected yet (see SUPPORT_DONATIONS_LIVE
 * above). Percentages sum to 100.
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
 * before the Public Beta ships. This is a goal the Support Us page shows
 * progress toward, not a live count — donations aren't open yet.
 */
export const FOUNDING_SUPPORTER_GOAL = 250

export interface SupportFaqItem {
  q: string
  a: string
}

export const SUPPORT_FAQ: SupportFaqItem[] = [
  {
    q: 'Is Support Us live yet?',
    a: "Not yet. Gaming Horizon hasn't wired up a payment processor, so this page is a full preview of the flow — amounts, tiers, and the QR panel all work, but the actual pay step shows an \"opening soon\" notice instead of taking a real payment. No payment details are collected anywhere on this site.",
  },
  {
    q: 'Where does my money go?',
    a: 'Once donations open, contributions are split across servers and infrastructure, development and tooling, community rewards, and an operating reserve — see the breakdown above. There is no advertising or data-selling in the plan; supporter contributions are the intended funding model.',
  },
  {
    q: 'Is this a one-time payment or a subscription?',
    a: "One-time. Pick an amount, scan the UPI QR in your own app, and that's the whole flow — no recurring charge and no account required to donate.",
  },
  {
    q: 'How do I get my supporter badge?',
    a: 'Once donations go live, a completed payment is manually verified and the matching badge is added to your account and the Supporters Wall — sign in (or create an account) so there is a profile for the badge to attach to.',
  },
  {
    q: 'Can I get a refund?',
    a: "Supporting Gaming Horizon is a voluntary contribution to an independent, pre-launch project rather than a purchase, so it isn't built around refunds. Full terms will be published alongside the real payment flow before it goes live.",
  },
  {
    q: 'Is my payment information stored anywhere?',
    a: 'No. Donations go through your own UPI app by scanning a QR code — Gaming Horizon never sees or stores your card, bank, or UPI details.',
  },
]
