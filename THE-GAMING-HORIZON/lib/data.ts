export const BETA_DATE = '2027-01-01T00:01:00+05:30'
export const LAUNCH_DATE = '2028-03-01T00:01:00+05:30'

export const DISCORD_INVITE_URL = 'https://discord.gg/M5PeNThBwF'
export const X_PROFILE_URL = 'https://x.com/gamingshorizon'
export const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/thegaminghorizon/'
export const GITHUB_URL = 'https://github.com/thegaminghorizon/The-Gaming-Horizon'

// Bump whenever DISCORD_INVITE_URL (or the announcement copy) changes, so
// everyone who already has the old "Join the Gaming Horizon Discord"
// notification gets it replaced with a fresh one carrying the new link,
// instead of being left holding a dead invite forever.
// v3: notification now carries a real clickable action link instead of a
// bare URL sitting in the body text.
export const DISCORD_NOTIFICATION_VERSION = 'v3'

// Same mechanism as DISCORD_NOTIFICATION_VERSION above, for the "Follow us
// on X" announcement — bump whenever X_PROFILE_URL (or the announcement
// copy) changes so everyone with the old entry gets a fresh one.
export const X_NOTIFICATION_VERSION = 'v1'

// Same mechanism again, for the "our Instagram is live" announcement —
// bump whenever INSTAGRAM_PROFILE_URL (or the announcement copy) changes
// so everyone with the old entry gets a fresh one.
export const INSTAGRAM_NOTIFICATION_VERSION = 'v1'

// Same mechanism again, for the "check out our GitHub" announcement — bump
// whenever GITHUB_URL (or the announcement copy) changes so everyone with
// the old entry gets a fresh one.
export const GITHUB_NOTIFICATION_VERSION = 'v1'

// Guards a single milestone notice — "all 4 social channels are live" —
// separate from the four individual per-platform notices above. Bump
// whenever that milestone copy changes so everyone with an old entry gets
// a fresh one; this is intentionally its own version so it can be
// re-announced independently of any single platform's link changing.
export const ALL_SOCIALS_LIVE_NOTIFICATION_VERSION = 'v1'

export interface SocialPlatformInfo {
  key: 'discord' | 'x' | 'instagram' | 'github'
  label: string
  href: string
  /** Verb-first label for the confirm button, e.g. "Join Discord" / "Follow on X". */
  joinLabel: string
  /** Shown in the leave-site confirmation popup before someone is sent to the platform. */
  description: string
}

// The platforms Gaming Horizon actually links out to. Any link pointing at
// one of these hrefs — the footer icons, a notification action, anywhere
// else a link like this shows up — gets routed through SocialConfirmModal
// (see getSocialPlatformByHref below) instead of navigating straight out,
// so people always see what they're about to join before they leave.
export const SOCIAL_PLATFORMS: SocialPlatformInfo[] = [
  {
    key: 'discord',
    label: 'Discord',
    href: DISCORD_INVITE_URL,
    joinLabel: 'Join Discord',
    description:
      'The Gaming Horizon Discord is where the community hangs out day to day — chat about games, get help, share feedback that reaches the team, and hear about beta invites and events before they go public.',
  },
  {
    key: 'x',
    label: 'X',
    href: X_PROFILE_URL,
    joinLabel: 'Follow on X',
    description:
      'Gaming Horizon on X posts development updates, feature previews, and quick announcements — the fastest way to catch news in short form as it happens.',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    href: INSTAGRAM_PROFILE_URL,
    joinLabel: 'Follow on Instagram',
    description:
      'Gaming Horizon on Instagram is the visual side of the project — behind-the-scenes design work, screenshots, and community moments, in a more relaxed, photo-first feed.',
  },
  {
    key: 'github',
    label: 'GitHub',
    href: GITHUB_URL,
    joinLabel: 'View GitHub',
    description:
      "The Gaming Horizon GitHub is where the project's code lives in the open — browse the source, track progress between releases, and see how the platform is actually being built.",
  },
]

/**
 * Looks up a known Gaming Horizon social platform by its outbound URL, so
 * any link pointing at one of these — the footer, a notification action,
 * wherever — can be routed through the same "leaving to X" confirmation
 * instead of navigating straight out. Returns undefined for any other URL
 * (e.g. a non-social notification action link), which callers should treat
 * as "render a normal link."
 */
export function getSocialPlatformByHref(href: string | undefined | null): SocialPlatformInfo | undefined {
  if (!href) return undefined
  return SOCIAL_PLATFORMS.find((platform) => platform.href === href)
}

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Vision', href: '/vision' },
  { label: 'Platform', href: '/platform' },
  { label: 'AI', href: '/ai' },
  { label: 'Games', href: '/games' },
  { label: 'Music', href: '/music' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: 'Beta', href: '/beta' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
]

export type BetaStatus = 'Planned for Beta' | 'Browser Ready' | 'Under Review'

export interface Game {
  name: string
  genre: string
  multiplayer: boolean
  browserReady: boolean
  aiSupport: boolean
  status: BetaStatus
  color: string
  tagline: string
}

export const GAMES: Game[] = [
  { name: 'PolyTrack', genre: 'Racing', multiplayer: false, browserReady: true, aiSupport: true, status: 'Browser Ready', color: '250 100% 70%', tagline: 'Low-poly time-trial racing.' },
  { name: 'Rocket Bot Royale', genre: 'Battle Royale', multiplayer: true, browserReady: true, aiSupport: true, status: 'Planned for Beta', color: '190 90% 55%', tagline: 'Tank battle royale, last bot standing.' },
  { name: 'Shell Shockers', genre: 'FPS', multiplayer: true, browserReady: true, aiSupport: true, status: 'Planned for Beta', color: '40 95% 60%', tagline: 'Egg-based first-person shooter.' },
  { name: 'Krunker', genre: 'FPS', multiplayer: true, browserReady: true, aiSupport: true, status: 'Under Review', color: '10 90% 60%', tagline: 'Fast-paced arena shooter.' },
  { name: 'Ev.io', genre: 'FPS', multiplayer: true, browserReady: true, aiSupport: true, status: 'Under Review', color: '280 85% 65%', tagline: 'Sci-fi movement shooter.' },
  { name: 'Narrow One', genre: 'Archery', multiplayer: true, browserReady: true, aiSupport: false, status: 'Planned for Beta', color: '150 70% 50%', tagline: 'Team archery capture-the-flag.' },
  { name: 'Smash Karts', genre: 'Kart', multiplayer: true, browserReady: true, aiSupport: true, status: 'Planned for Beta', color: '330 85% 62%', tagline: 'Chaotic kart combat.' },
  { name: 'Slow Roads', genre: 'Driving', multiplayer: false, browserReady: true, aiSupport: true, status: 'Browser Ready', color: '200 80% 60%', tagline: 'Endless meditative driving.' },
  { name: '2048', genre: 'Puzzle', multiplayer: false, browserReady: true, aiSupport: true, status: 'Browser Ready', color: '45 90% 58%', tagline: 'Merge tiles, chase the number.' },
  { name: 'Chess', genre: 'Strategy', multiplayer: true, browserReady: true, aiSupport: true, status: 'Browser Ready', color: '220 15% 70%', tagline: 'The timeless strategy classic.' },
  { name: 'Sudoku', genre: 'Puzzle', multiplayer: false, browserReady: true, aiSupport: true, status: 'Browser Ready', color: '260 60% 65%', tagline: 'Logic number placement.' },
  { name: 'Tetris', genre: 'Puzzle', multiplayer: true, browserReady: true, aiSupport: true, status: 'Browser Ready', color: '190 85% 55%', tagline: 'Stack, clear, repeat forever.' },
  { name: 'Moto X3M', genre: 'Racing', multiplayer: false, browserReady: true, aiSupport: true, status: 'Planned for Beta', color: '25 95% 58%', tagline: 'Stunt bike obstacle courses.' },
  { name: 'Fireboy & Watergirl', genre: 'Co-op Puzzle', multiplayer: true, browserReady: true, aiSupport: false, status: 'Planned for Beta', color: '15 90% 60%', tagline: 'Two-player elemental co-op.' },
]

export interface Module {
  key: string
  name: string
  desc: string
  eta: string
}

export const MODULES: Module[] = [
  { key: 'games', name: 'Browser Games', desc: 'Instant-play library across genres, no downloads, no installs.', eta: 'Public Beta' },
  { key: 'ai', name: 'AI Companion', desc: 'Context-aware recommendations tuned to mood, time and device.', eta: 'Public Beta' },
  { key: 'profiles', name: 'Profiles', desc: 'A unified identity that follows you across every game.', eta: 'Public Beta' },
  { key: 'achievements', name: 'Achievements', desc: 'Cross-game progression, rare unlocks and showcases.', eta: 'Beta + 1' },
  { key: 'communities', name: 'Communities', desc: 'Hubs, threads and events built around the games you love.', eta: 'Community Testing' },
  { key: 'friends', name: 'Friends', desc: 'Presence, invites and shared sessions in real time.', eta: 'Public Beta' },
  { key: 'reviews', name: 'Reviews', desc: 'Trusted, structured reviews from real players.', eta: 'Beta + 1' },
  { key: 'leaderboards', name: 'Leaderboards', desc: 'Global and friend-scoped competitive rankings.', eta: 'Public Beta' },
  { key: 'collections', name: 'Collections', desc: 'Curate, save and share personal game libraries.', eta: 'Beta + 1' },
  { key: 'events', name: 'Events', desc: 'Seasonal challenges, drops and limited-time modes.', eta: 'Community Testing' },
  { key: 'recommendations', name: 'Recommendations', desc: 'Discovery engine that learns as you play.', eta: 'Public Beta' },
  { key: 'developer', name: 'Developer Platform', desc: 'Publish, update and monetise browser games.', eta: 'Official Launch' },
  { key: 'creator', name: 'Creator Tools', desc: 'Assets, analytics and distribution for creators.', eta: 'Official Launch' },
  { key: 'tournaments', name: 'Tournaments', desc: 'Organised competitive brackets and prize events.', eta: 'Community Testing' },
]

export interface DevItem {
  name: string
  progress: number
  status: 'Shipped' | 'In Progress' | 'Planned'
  updated: string
  note: string
}

export const DEV_PROGRESS: DevItem[] = [
  { name: 'Frontend', progress: 72, status: 'In Progress', updated: 'Jul 08, 2026', note: 'Design system + hero, nav and section shells landed.' },
  { name: 'Backend', progress: 48, status: 'In Progress', updated: 'Jul 07, 2026', note: 'Core API contracts drafted; auth service scaffolding.' },
  { name: 'Infrastructure', progress: 55, status: 'In Progress', updated: 'Jul 06, 2026', note: 'Edge network + CDN topology finalised.' },
  { name: 'Authentication', progress: 40, status: 'In Progress', updated: 'Jul 05, 2026', note: 'Provider abstraction under review.' },
  { name: 'AI', progress: 35, status: 'In Progress', updated: 'Jul 08, 2026', note: 'Recommendation prototype producing first results.' },
  { name: 'Database', progress: 60, status: 'In Progress', updated: 'Jul 04, 2026', note: 'Schema v2 modelling profiles + progression.' },
  { name: 'Game Library', progress: 30, status: 'In Progress', updated: 'Jul 03, 2026', note: 'Ingestion pipeline for browser titles started.' },
  { name: 'Profiles', progress: 25, status: 'Planned', updated: 'Jul 01, 2026', note: 'Identity model spec complete, build pending.' },
  { name: 'Community', progress: 12, status: 'Planned', updated: 'Jun 28, 2026', note: 'Scoped for post-beta phase.' },
  { name: 'Security', progress: 50, status: 'In Progress', updated: 'Jul 06, 2026', note: 'Threat modelling + audit checklist in place.' },
  { name: 'Performance', progress: 58, status: 'In Progress', updated: 'Jul 07, 2026', note: 'Sub-second cold-load budget being enforced.' },
  { name: 'Accessibility', progress: 44, status: 'In Progress', updated: 'Jul 05, 2026', note: 'Keyboard + reduced-motion baseline shipped.' },
  { name: 'Testing', progress: 33, status: 'In Progress', updated: 'Jul 02, 2026', note: 'E2E harness for critical flows building out.' },
  { name: 'Documentation', progress: 28, status: 'In Progress', updated: 'Jun 30, 2026', note: 'Internal architecture docs in progress.' },
  { name: 'Beta Preparation', progress: 20, status: 'Planned', updated: 'Jun 27, 2026', note: 'Launch checklist and staging plan drafted.' },
]

export {
  ROADMAP_MILESTONES as ROADMAP,
  BETA_TIMELINE_MILESTONES,
  type Milestone,
  type RoadmapState,
} from '@/lib/milestones'

export interface AiMood {
  key: string
  label: string
  desc: string
}

export const AI_MOODS: AiMood[] = [
  { key: 'chill', label: 'Chill', desc: 'Relaxing, low-pressure sessions.' },
  { key: 'competitive', label: 'Competitive', desc: 'Ranked, skill-driven play.' },
  { key: 'story', label: 'Story', desc: 'Narrative-forward experiences.' },
  { key: 'puzzle', label: 'Puzzle', desc: 'Brain teasers and logic.' },
  { key: 'racing', label: 'Racing', desc: 'Speed, drift and lap times.' },
  { key: 'horror', label: 'Horror', desc: 'Tense, atmospheric thrills.' },
  { key: 'multiplayer', label: 'Multiplayer', desc: 'Play with the world.' },
  { key: 'coop', label: 'Co-op', desc: 'Team up with a friend.' },
  { key: 'short', label: 'Short Session', desc: 'Under 10 minutes.' },
  { key: 'gems', label: 'Hidden Gems', desc: 'Underrated favourites.' },
  { key: 'lowend', label: 'Low-End Browser', desc: 'Runs great anywhere.' },
]

export interface AiRec {
  game: string
  reason: string
  playtime: string
  difficulty: string
  browser: string
  achievements: number
  friends: number
}

export const AI_RECS: Record<string, AiRec[]> = {
  chill: [
    { game: 'Slow Roads', reason: 'Endless calm driving with zero pressure — perfect to unwind.', playtime: '10–30 min', difficulty: 'Relaxed', browser: 'All modern browsers', achievements: 6, friends: 2 },
    { game: '2048', reason: 'Simple, satisfying tile merging you can pick up and drop.', playtime: '5–15 min', difficulty: 'Easy', browser: 'All modern browsers', achievements: 9, friends: 4 },
  ],
  competitive: [
    { game: 'Krunker', reason: 'Fast arena FPS with a high skill ceiling and ranked ladders.', playtime: '15–40 min', difficulty: 'Hard', browser: 'Chrome, Edge, Firefox', achievements: 18, friends: 7 },
    { game: 'Shell Shockers', reason: 'Twitchy, competitive shooting with quick matchmaking.', playtime: '10–25 min', difficulty: 'Medium', browser: 'All modern browsers', achievements: 14, friends: 5 },
  ],
  puzzle: [
    { game: 'Sudoku', reason: 'Pure logic that scales from casual to expert.', playtime: '8–20 min', difficulty: 'Adaptive', browser: 'All modern browsers', achievements: 11, friends: 1 },
    { game: 'Tetris', reason: 'The definitive puzzle flow state, now with online play.', playtime: '5–30 min', difficulty: 'Medium', browser: 'All modern browsers', achievements: 15, friends: 6 },
  ],
  racing: [
    { game: 'PolyTrack', reason: 'Precision time-trials with instant restarts and ghost racing.', playtime: '10–25 min', difficulty: 'Medium', browser: 'All modern browsers', achievements: 12, friends: 3 },
    { game: 'Moto X3M', reason: 'Stunt-heavy bike courses that reward mastery.', playtime: '10–20 min', difficulty: 'Medium', browser: 'All modern browsers', achievements: 10, friends: 2 },
  ],
  multiplayer: [
    { game: 'Smash Karts', reason: 'Chaotic kart combat that is instantly social.', playtime: '10–20 min', difficulty: 'Easy', browser: 'All modern browsers', achievements: 13, friends: 8 },
    { game: 'Rocket Bot Royale', reason: 'Battle-royale tension with friends in the lobby.', playtime: '12–25 min', difficulty: 'Medium', browser: 'Chrome, Edge', achievements: 16, friends: 9 },
  ],
  coop: [
    { game: 'Fireboy & Watergirl', reason: 'Classic two-player co-op puzzles built for teamwork.', playtime: '15–30 min', difficulty: 'Medium', browser: 'All modern browsers', achievements: 8, friends: 1 },
    { game: 'Narrow One', reason: 'Team archery objectives that reward coordination.', playtime: '10–20 min', difficulty: 'Medium', browser: 'All modern browsers', achievements: 10, friends: 5 },
  ],
  short: [
    { game: '2048', reason: 'A complete session in a few minutes flat.', playtime: '3–8 min', difficulty: 'Easy', browser: 'All modern browsers', achievements: 9, friends: 4 },
    { game: 'Chess', reason: 'Blitz formats deliver a full game fast.', playtime: '3–10 min', difficulty: 'Adaptive', browser: 'All modern browsers', achievements: 12, friends: 6 },
  ],
  gems: [
    { game: 'Slow Roads', reason: 'An underrated, hypnotic driving experience.', playtime: '10–30 min', difficulty: 'Relaxed', browser: 'All modern browsers', achievements: 6, friends: 2 },
    { game: 'Narrow One', reason: 'A quietly brilliant team archery gem.', playtime: '10–20 min', difficulty: 'Medium', browser: 'All modern browsers', achievements: 10, friends: 5 },
  ],
  lowend: [
    { game: 'Chess', reason: 'Runs beautifully on any device or browser.', playtime: '5–20 min', difficulty: 'Adaptive', browser: 'Everything', achievements: 12, friends: 6 },
    { game: '2048', reason: 'Featherlight and instant, even on old hardware.', playtime: '3–10 min', difficulty: 'Easy', browser: 'Everything', achievements: 9, friends: 4 },
  ],
  story: [
    { game: 'Slow Roads', reason: 'A quiet, personal journey rather than a plot — perfect wind-down.', playtime: '15–40 min', difficulty: 'Relaxed', browser: 'All modern browsers', achievements: 6, friends: 2 },
    { game: 'Chess', reason: 'Every match tells its own tense story.', playtime: '10–30 min', difficulty: 'Adaptive', browser: 'Everything', achievements: 12, friends: 6 },
  ],
  horror: [
    { game: 'Krunker', reason: 'Custom horror maps deliver tense, atmospheric rounds.', playtime: '10–25 min', difficulty: 'Hard', browser: 'Chrome, Edge, Firefox', achievements: 18, friends: 7 },
    { game: 'Ev.io', reason: 'Dark sci-fi arenas with an eerie edge.', playtime: '10–20 min', difficulty: 'Hard', browser: 'Chrome, Edge', achievements: 14, friends: 4 },
  ],
}

export interface Faq {
  q: string
  a: string
  category: string
  popular?: boolean
}

export const FAQS: Faq[] = [
  { q: 'What is Gaming Horizon?', a: 'Gaming Horizon is an upcoming premium browser gaming ecosystem — one home to discover games, play instantly, get AI recommendations, build a profile, earn achievements, join communities and compete, all without downloads.', category: 'General', popular: true },
  { q: 'Is Gaming Horizon available now?', a: 'Not yet. This is the official pre-launch portal. The platform is in active development and the first public milestone is the Public Beta on 1 January 2027.', category: 'General', popular: true },
  { q: 'When does the Public Beta start?', a: 'The Public Beta launches on 1 January 2027 at 12:01 AM IST. Join the waitlist to be considered for early access.', category: 'Beta', popular: true },
  { q: 'Can I play games right now?', a: 'No. The games shown are planned for the beta and are not playable on this site yet. They are previews of what the library will include.', category: 'Games', popular: true },
  { q: 'Which browsers will be supported?', a: 'Gaming Horizon targets all modern browsers — Chrome, Edge, Firefox, Safari, Brave and more — on desktop and mobile. Each game lists its own compatibility.', category: 'Platform' },
  { q: 'What is the AI Companion?', a: 'The AI Companion is a recommendation experience that understands your mood, available time and device, then suggests games with clear reasoning — not a generic chatbot.', category: 'AI', popular: true },
  { q: 'How is my privacy handled?', a: 'Privacy is a core principle. Recommendations are designed to work with minimal data, you stay in control of what is shared, and we will publish clear policies before launch.', category: 'AI' },
  { q: 'Do I need an account?', a: 'Accounts are optional for browsing but will unlock profiles, progression, friends and personalised AI. Authentication becomes functional closer to the Public Beta.', category: 'Accounts' },
  { q: 'What does the waitlist do?', a: 'Waitlist members may receive early beta access, founder recognition and regular development updates. It is the best way to be first in line.', category: 'Beta' },
  { q: 'When does the Feedback Portal open?', a: 'The Feedback Portal opens on 15 January 2027, shortly after the beta, and closes on 30 November 2027.', category: 'Beta' },
  { q: 'When is the official launch?', a: 'The complete Gaming Horizon platform officially launches on 1 March 2028 at 12:01 AM IST.', category: 'General' },
  { q: 'What future features are planned?', a: 'Communities, tournaments, events, a developer platform, creator tools, collections and deeper AI are all on the roadmap beyond beta.', category: 'Platform' },
  { q: 'Is Gaming Horizon free?', a: 'The core experience is designed to be free to play in your browser. Details on any optional premium features will be shared closer to launch.', category: 'General', popular: true },
]

export const FAQ_CATEGORIES = ['All', 'General', 'Beta', 'Games', 'Platform', 'AI', 'Accounts']

/* ------------------------------------------------------------------ */
/* Public Beta program                                                 */
/* ------------------------------------------------------------------ */

export { BETA_TIMELINE_MILESTONES as BETA_TIMELINE } from '@/lib/milestones'

export const BETA_EXPECT: { title: string; desc: string }[] = [
  { title: 'A real, playable slice', desc: 'The beta is the first genuinely usable version of Gaming Horizon — not a mockup or a video.' },
  { title: 'Instant browser play', desc: 'Launch a curated set of games directly in your browser with no downloads or installs.' },
  { title: 'Your AI Companion', desc: 'An early version of mood- and time-aware recommendations you can try and react to.' },
  { title: 'A profile that grows', desc: 'Create an identity, earn early achievements and watch progression take shape.' },
]

export const BETA_TESTABLE: { title: string; desc: string }[] = [
  { title: 'Game discovery', desc: 'Browse, search and filter the beta library and tell us what is missing.' },
  { title: 'AI recommendations', desc: 'Ask for suggestions by mood or session length and rate how good they feel.' },
  { title: 'Profiles & achievements', desc: 'Set up your profile and unlock the first cross-game achievements.' },
  { title: 'Friends & presence', desc: 'Add friends, see who is online and start shared sessions where supported.' },
  { title: 'Leaderboards', desc: 'Compete on global and friend-scoped rankings for supported titles.' },
  { title: 'Performance & devices', desc: 'Help us validate speed and stability across browsers and hardware.' },
]

export const BETA_CHANGES: { title: string; desc: string }[] = [
  { title: 'This is not the final product', desc: 'The beta is a foundation. Expect rough edges, placeholder content and features that are still incomplete.' },
  { title: 'Some bugs are expected', desc: 'You may encounter glitches or unfinished flows. Reporting them is exactly how you help.' },
  { title: 'Features may shift', desc: 'Modules can change, be added, or be reworked between beta and official launch based on feedback.' },
  { title: 'Library will expand', desc: 'The beta ships with a curated set of games; the catalogue grows throughout community testing.' },
]

export const BETA_FEEDBACK_STEPS: { step: string; title: string; desc: string }[] = [
  { step: '01', title: 'Play & explore', desc: 'Use the beta naturally and note anything that feels off, confusing or missing.' },
  { step: '02', title: 'Submit via the portal', desc: 'The Feedback Portal (opens 15 Jan 2027) collects bug reports, ideas and feature votes.' },
  { step: '03', title: 'We prioritise together', desc: 'Popular, high-impact feedback is triaged into the public roadmap during community testing.' },
  { step: '04', title: 'Shape the launch', desc: 'When the portal closes on 30 Nov 2027, your input directly informs the final 1 Mar 2028 release.' },
]

export interface BetaCompareRow {
  aspect: string
  beta: string
  official: string
}

export const BETA_VS: BetaCompareRow[] = [
  { aspect: 'Purpose', beta: 'Test, learn and iterate in the open', official: 'The complete, polished experience' },
  { aspect: 'Availability', beta: '1 Jan 2027 (waitlist-first)', official: '1 Mar 2028 (everyone)' },
  { aspect: 'Game library', beta: 'Curated starter set', official: 'Full, continuously growing catalogue' },
  { aspect: 'Modules', beta: 'Core set, some in preview', official: 'Communities, tournaments, creator tools & more' },
  { aspect: 'Stability', beta: 'Bugs & incomplete features expected', official: 'Production-ready and hardened' },
  { aspect: 'Your role', beta: 'Co-builder and founding tester', official: 'Player in the finished ecosystem' },
]

export const BETA_ELIGIBILITY: string[] = [
  'Anyone can join the waitlist today — no cost, no commitment.',
  'Waitlist members are considered first for early beta invitations.',
  'A modern browser (Chrome, Edge, Firefox, Safari or Brave) on desktop or mobile.',
  'No special hardware — if it runs a modern browser, it can run the beta.',
]

export const BETA_DEVICES: { title: string; desc: string }[] = [
  { title: 'Desktop', desc: 'Windows, macOS and Linux via Chrome, Edge, Firefox, Safari and Brave.' },
  { title: 'Mobile', desc: 'Modern Android and iOS browsers, with layouts tuned for touch.' },
  { title: 'Low-end friendly', desc: 'Many titles are built to run smoothly even on modest hardware.' },
]

export const BETA_LIMITATIONS: string[] = [
  'Not all planned games are available at beta launch — the library expands over time.',
  'Some modules (communities, tournaments, creator tools) arrive after beta.',
  'Occasional bugs, downtime or resets may occur as we iterate.',
  'AI recommendations are early and improve as the system learns.',
  'Accounts and progression may evolve; early data could be migrated or reset.',
]

export const BETA_FAQS: Faq[] = [
  { q: 'What exactly is the Public Beta?', a: 'It is the first public, playable milestone of Gaming Horizon — a real, usable slice of the platform launching 1 January 2027 at 12:01 AM IST. It is a foundation to test and improve, not the finished product.', category: 'Beta', popular: true },
  { q: 'How do I get access?', a: 'Join the waitlist. Waitlist members are considered first for early beta invitations and receive founder recognition and development updates.', category: 'Beta', popular: true },
  { q: 'Will everything work perfectly?', a: 'No — and that is expected. The beta will have bugs, placeholder content and incomplete features. Reporting issues through the Feedback Portal is exactly how you help shape the final launch.', category: 'Beta' },
  { q: 'When can I give feedback?', a: 'The Feedback Portal opens on 15 January 2027 and closes on 30 November 2027. It collects bug reports, feature votes and surveys.', category: 'Beta' },
  { q: 'What happens after feedback closes?', a: 'After 30 November 2027 we move into feature freeze and release-candidate testing, culminating in the Official Launch on 1 March 2028.', category: 'Beta' },
  { q: 'What do I get for participating?', a: 'Founding testers may receive a permanent founder badge, early-access benefits and recognition for helping build Gaming Horizon.', category: 'Beta', popular: true },
  { q: 'Which devices are supported?', a: 'Any modern browser on desktop or mobile — Chrome, Edge, Firefox, Safari and Brave. No downloads or special hardware required.', category: 'Beta' },
  { q: 'Is the beta free?', a: 'Yes. Joining the waitlist and participating in the beta is free.', category: 'Beta', popular: true },
]

export const LOADING_MESSAGES = [
  'Initializing Gaming Horizon',
  'Loading browser gaming ecosystem',
  'Preparing AI Companion',
  'Syncing platform modules',
  'Rendering horizon interface',
  'Optimizing experience',
  'Finalizing launch sequence',
]
