export type ComparisonLevel = 'Included' | 'Enhanced' | 'Advanced' | 'Complete' | 'Creator'

export type PlannedPlan = {
  id: string
  name: string
  priceMonthly: number
  priceAnnualPlanned: number
  audience: string
  intendedUser: string
  summary: string
  valueStatement: string
  features: string[]
  limitations: string[]
  availability: string
  modules: string[]
  previousTierComparison: string
  recommended?: boolean
  comparison: {
    browserAccess: string
    aiDiscovery: string
    profile: string
    progression: string
    cloudSaves: string
    community: string
    family: string
    tournaments: string
    creator: string
    developer: string
    priority: string
  }
}

export const PLANNED_PRICING_NOTICE = 'Planned pricing — subject to change before launch'

export const COMPARISON_ROWS: Array<{ key: keyof PlannedPlan['comparison']; label: string }> = [
  { key: 'browserAccess', label: 'Browser-game access' },
  { key: 'aiDiscovery', label: 'AI discovery' },
  { key: 'profile', label: 'Profile customization' },
  { key: 'progression', label: 'Persistent progression' },
  { key: 'cloudSaves', label: 'Cloud saves' },
  { key: 'community', label: 'Community tools' },
  { key: 'family', label: 'Family support' },
  { key: 'tournaments', label: 'Tournament tools' },
  { key: 'creator', label: 'Creator features' },
  { key: 'developer', label: 'Developer tools' },
  { key: 'priority', label: 'Priority access' },
]

export const PLANNED_PLANS: PlannedPlan[] = [
  {
    id: 'essential',
    name: 'Horizon Essential',
    priceMonthly: 4.99,
    priceAnnualPlanned: 49.90,
    audience: 'Casual players',
    intendedUser: 'For players who want a polished, connected place to enjoy browser games without added complexity.',
    summary: 'The connected browser-gaming essentials for players who want a simple, premium home.',
    valueStatement: 'Move from discovery to play in one click, keep your progress, and return through one consistent player identity.',
    features: [
      'Core browser gameplay across supported experiences',
      'Cloud progression and cross-session continuity',
      'Standard AI recommendations',
      'Basic profile customization',
      'Collections and saved games',
      'Community access',
    ],
    limitations: [
      'Standard recommendation controls',
      'Base cloud-save allocation',
      'No family, tournament, or creator toolset',
    ],
    availability: 'Planned for commercial launch, subject to regional availability.',
    modules: ['Games', 'Identity', 'Progress', 'Community'],
    previousTierComparison: 'Entry membership — no previous paid tier.',
    comparison: {
      browserAccess: 'Core access',
      aiDiscovery: 'Standard',
      profile: 'Basic',
      progression: 'Cloud progression',
      cloudSaves: 'Standard capacity',
      community: 'Core access',
      family: 'Not included',
      tournaments: 'Community viewing',
      creator: 'Not included',
      developer: 'Not included',
      priority: 'Standard release access',
    },
  },
  {
    id: 'plus',
    name: 'Horizon Plus',
    priceMonthly: 8.99,
    priceAnnualPlanned: 89.90,
    audience: 'Regular players',
    intendedUser: 'For players who return often and want richer discovery, organization, and self-expression.',
    summary: 'More discovery, expression, and organization for players who make browser gaming part of their routine.',
    valueStatement: 'Spend less time searching, shape a more personal identity, and keep a larger connected library ready across sessions.',
    features: [
      'Everything planned for Horizon Essential',
      'Enhanced recommendations and preference controls',
      'Expanded cloud-save capacity',
      'Advanced collections and organization',
      'Enhanced profile customization',
      'Priority access to selected Beta waves',
    ],
    limitations: [
      'No family-management suite',
      'No advanced tournament administration',
      'Creator publishing tools are not included',
    ],
    availability: 'Planned for commercial launch, with selected Beta-wave priority where capacity permits.',
    modules: ['Games', 'AI Discovery', 'Identity', 'Collections', 'Cloud Progress'],
    previousTierComparison: 'Adds enhanced AI discovery, expanded storage, deeper collections, and priority Beta-wave eligibility over Essential.',
    recommended: true,
    comparison: {
      browserAccess: 'Core access',
      aiDiscovery: 'Enhanced',
      profile: 'Expanded',
      progression: 'Enhanced history',
      cloudSaves: 'Expanded capacity',
      community: 'Core + collections',
      family: 'Not included',
      tournaments: 'Community viewing',
      creator: 'Not included',
      developer: 'Not included',
      priority: 'Selected Beta waves',
    },
  },
  {
    id: 'pro',
    name: 'Horizon Pro',
    priceMonthly: 14.99,
    priceAnnualPlanned: 149.90,
    audience: 'Dedicated players and families',
    intendedUser: 'For dedicated players and households that want deeper insight, control, and safer shared access.',
    summary: 'Deeper progression intelligence and flexible household tools for players who want more from every session.',
    valueStatement: 'Understand how you play, tune discovery with more precision, and manage connected experiences for a household.',
    features: [
      'Everything planned for Horizon Plus',
      'Deeper progression insights and analytics',
      'Premium AI discovery controls',
      'Family profiles and household tools',
      'Advanced community moderation features',
      'Early access to selected platform capabilities',
    ],
    limitations: [
      'Priority support is not included',
      'Maximum cloud-service allocation is reserved for Ultimate',
      'Publishing and monetization tools require Creator',
    ],
    availability: 'Planned after the core platform reaches commercial readiness; some tools may roll out progressively.',
    modules: ['Progress Analytics', 'AI Companion', 'Family', 'Community', 'Early Access'],
    previousTierComparison: 'Adds advanced progression insight, family support, premium AI controls, and selected early platform capabilities over Plus.',
    comparison: {
      browserAccess: 'Core access',
      aiDiscovery: 'Premium controls',
      profile: 'Advanced',
      progression: 'Deep analytics',
      cloudSaves: 'High capacity',
      community: 'Advanced tools',
      family: 'Included',
      tournaments: 'Participation tools',
      creator: 'Not included',
      developer: 'Not included',
      priority: 'Selected feature access',
    },
  },
  {
    id: 'ultimate',
    name: 'Horizon Ultimate',
    priceMonthly: 24.99,
    priceAnnualPlanned: 249.90,
    audience: 'Players seeking the complete experience',
    intendedUser: 'For players who want the broadest personalization, social, support, and cloud experience Gaming Horizon plans to offer.',
    summary: 'The most complete planned player membership, bringing every player-facing system together at its highest service level.',
    valueStatement: 'Use the full player ecosystem with maximum personalization, richer social competition, and priority assistance.',
    features: [
      'Everything planned for Horizon Pro',
      'Maximum personalization options',
      'Priority player support',
      'Advanced social and tournament tools',
      'Expanded cloud services',
      'Exclusive cosmetic options',
    ],
    limitations: [
      'Developer publishing controls are not included',
      'Creator monetization and distribution require Horizon Creator',
      'Cosmetic availability may vary by game and region',
    ],
    availability: 'Planned for commercial launch or a phased period shortly afterward, depending on service readiness.',
    modules: ['Identity', 'Social', 'Tournaments', 'Cloud Services', 'Priority Support'],
    previousTierComparison: 'Adds maximum personalization, priority support, advanced tournament and social tools, and the largest player cloud allocation over Pro.',
    comparison: {
      browserAccess: 'Complete player access',
      aiDiscovery: 'Premium controls',
      profile: 'Maximum',
      progression: 'Deep analytics',
      cloudSaves: 'Maximum player capacity',
      community: 'Advanced + social',
      family: 'Included',
      tournaments: 'Advanced tools',
      creator: 'Limited creator identity',
      developer: 'Not included',
      priority: 'Player priority support',
    },
  },
  {
    id: 'creator',
    name: 'Horizon Creator',
    priceMonthly: 39.99,
    priceAnnualPlanned: 399.90,
    audience: 'Developers and creators',
    intendedUser: 'For studios, independent developers, and creators preparing browser games for testing, publishing, distribution, and sustainable growth.',
    summary: 'A planned professional toolkit for building, testing, understanding, publishing, and distributing browser-game experiences.',
    valueStatement: 'Bring a browser game from private testing to public discovery with connected analytics, distribution, and creator operations.',
    features: [
      'Publishing and release-management tools',
      'Testing access and controlled distribution',
      'Creator and product analytics',
      'Planned monetization features',
      'Distribution and visibility controls',
      'Priority developer support',
    ],
    limitations: [
      'Publishing eligibility will require platform review',
      'Monetization availability will depend on region and compliance',
      'Service limits will be documented before commercial release',
    ],
    availability: 'Planned as a phased developer program before or around commercial launch, subject to review and regional support.',
    modules: ['Developer Platform', 'Publishing', 'Analytics', 'Monetization', 'Distribution'],
    previousTierComparison: 'Introduces professional publishing, testing, analytics, monetization, and distribution controls beyond the player-focused Ultimate tier.',
    comparison: {
      browserAccess: 'Creator testing access',
      aiDiscovery: 'Creator insights',
      profile: 'Creator identity',
      progression: 'Product analytics',
      cloudSaves: 'Testing allocation',
      community: 'Creator communities',
      family: 'Not applicable',
      tournaments: 'Event integration tools',
      creator: 'Complete planned toolkit',
      developer: 'Publishing + analytics',
      priority: 'Priority developer support',
    },
  },
]
