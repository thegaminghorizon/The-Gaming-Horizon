// Frontend-only AI chat engine for Gaming Horizon.
// Detects intent from user messages and returns context-rich scripted responses.
// Responses cover every major topic: games (by genre), AI companion, beta, roadmap,
// platform, accounts, security, pricing plans, music room, customization, blog, press,
// contact/support, accessibility, status, legal/terms, cookies, design suggestions,
// game requests, vision, notifications, and community/social features.

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
  chips?: string[]   // quick-reply suggestions shown below an assistant message
  topic?: Topic       // which topic this assistant message answered (used for follow-up context)
}

let msgCounter = 0
export function makeId() { return `m-${++msgCounter}-${Date.now()}` }

// ── Intent → topic matching ───────────────────────────────────────────────────

export type Topic =
  | 'greeting'
  | 'what_is'
  | 'games'
  | 'ai_companion'
  | 'beta'
  | 'roadmap'
  | 'accounts'
  | 'platform'
  | 'privacy'
  | 'free'
  | 'browser'
  | 'dev_progress'
  | 'feedback'
  | 'multiplayer'
  | 'recommend_game'
  | 'competitive'
  | 'chill'
  | 'puzzle'
  | 'racing'
  | 'horror'
  | 'friends'
  | 'achievements'
  | 'dashboard'
  | 'waitlist'
  | 'community'
  | 'launch_date'
  | 'pricing_plans'
  | 'music'
  | 'customization'
  | 'blog'
  | 'press'
  | 'contact_support'
  | 'accessibility'
  | 'status'
  | 'legal'
  | 'cookies'
  | 'design_suggestions'
  | 'game_request'
  | 'vision'
  | 'security'
  | 'notifications'
  | 'farewell'
  | 'thanks'
  | 'capabilities'
  | 'identity'
  | 'small_talk'
  | 'fallback'

// Every quick-reply chip and suggested-starter string in this file is routed here to
// an exact topic. Chips are clicked verbatim as "user messages" (see components/ai-chat.tsx),
// so this table guarantees they always land on the intended answer instead of falling through
// to keyword scoring, where a generic word like "game" inside "Recommend me a game" used to
// out-rank the more specific intent.
const EXACT_MATCHES: Record<string, Topic> = {
  'what is gaming horizon?': 'what_is',
  'when does beta start?': 'beta',
  'when does the beta start?': 'beta',
  'recommend me a game': 'recommend_game',
  'recommend me a game to play': 'recommend_game',
  'what features are coming?': 'platform',
  'when does it launch?': 'launch_date',
  'what games are included?': 'games',
  'what games will be available?': 'games',
  'what games are available?': 'games',
  'tell me about the ai': 'ai_companion',
  'tell me about the ai companion': 'ai_companion',
  'tell me more about the ai': 'ai_companion',
  'is it free?': 'free',
  'show me racing games': 'racing',
  'any co-op games?': 'multiplayer',
  'what runs on low-end devices?': 'browser',
  'which games run on low-end devices?': 'browser',
  'competitive games': 'competitive',
  'chill games': 'chill',
  'puzzle games': 'puzzle',
  'multiplayer games': 'multiplayer',
  'quick 5-minute game': 'chill',
  'what about co-op?': 'multiplayer',
  'any racing games?': 'racing',
  'tell me about leaderboards': 'platform',
  'when does ranked launch?': 'beta',
  'what about puzzle games?': 'puzzle',
  'any short session games?': 'chill',
  'show me hidden gems': 'chill',
  'any solo puzzle games?': 'puzzle',
  'two-player puzzles?': 'puzzle',
  'what about brain games?': 'puzzle',
  'what about fps games?': 'competitive',
  'any multiplayer racing?': 'racing',
  'tell me about polytrack': 'racing',
  'tell me more about ev.io': 'horror',
  'what about scary puzzle games?': 'horror',
  'what genres are coming after beta?': 'roadmap',
  'when do friends features launch?': 'friends',
  'tell me about communities': 'community',
  'tell me about privacy': 'privacy',
  'how does it learn my taste?': 'ai_companion',
  'can it recommend right now?': 'ai_companion',
  'when is it live?': 'beta',
  'how do i join the waitlist?': 'waitlist',
  'what will beta include?': 'beta',
  'when is the full launch?': 'launch_date',
  'when does the feedback portal open?': 'feedback',
  'what comes after beta?': 'roadmap',
  'show me the roadmap': 'roadmap',
  'what is currently in progress?': 'dev_progress',
  'when does beta open?': 'beta',
  'what launches at official launch?': 'launch_date',
  'what does the profile show?': 'dashboard',
  'when does auth go live?': 'accounts',
  'when do communities launch?': 'community',
  'what is in beta?': 'beta',
  'is there a developer platform?': 'platform',
  'what data does it collect?': 'privacy',
  'when are policies published?': 'privacy',
  'what is included for free?': 'free',
  'will there be a premium tier?': 'free',
  'what about mobile?': 'browser',
  'tell me about the platform': 'platform',
  'what is built so far?': 'dev_progress',
  'how do i ask a question now?': 'feedback',
  'tell me about profiles': 'dashboard',
  'what games have achievements?': 'achievements',
  'when does the beta launch?': 'beta',
  'when does beta launch?': 'beta',
  'tell me about achievements': 'achievements',
  'what does the ai recommend?': 'ai_companion',
  'what does founder status include?': 'waitlist',
  'tell me about multiplayer games': 'multiplayer',
  'what about communities?': 'community',
  'tell me about events': 'platform',
  'what other social features are there?': 'platform',
  'what are the pricing plans?': 'pricing_plans',
  'what does horizon plus include?': 'pricing_plans',
  'is there a premium plan?': 'pricing_plans',
  'what is horizon ultimate?': 'pricing_plans',
  'tell me about the creator plan': 'pricing_plans',
  'how much is horizon pro?': 'pricing_plans',
  'tell me about the music room': 'music',
  'can i listen to music while i play?': 'music',
  'how do i queue a song?': 'music',
  'does spotify work in the music room?': 'music',
  'how do i customize my cursor?': 'customization',
  'can i change the theme?': 'customization',
  'tell me about the customization studio': 'customization',
  'what accent colors are there?': 'customization',
  'can i write a blog post?': 'blog',
  'tell me about the blog': 'blog',
  'how do i publish a blog post?': 'blog',
  'is there a press page?': 'press',
  'how do i contact press?': 'press',
  'how do i contact you?': 'contact_support',
  'how do i get support?': 'contact_support',
  'is gaming horizon accessible?': 'accessibility',
  'do you support screen readers?': 'accessibility',
  'is there a status page?': 'status',
  'are the servers down?': 'status',
  'what is the system status?': 'status',
  'where are the terms of service?': 'legal',
  'what are the terms of service?': 'legal',
  'do you use cookies?': 'cookies',
  'what is the cookie policy?': 'cookies',
  'can i submit a design?': 'design_suggestions',
  'how do i submit a design suggestion?': 'design_suggestions',
  'can i suggest a game?': 'game_request',
  'how do i request a game?': 'game_request',
  'what is the vision behind gaming horizon?': 'vision',
  'why are you building this?': 'vision',
  'is my password secure?': 'security',
  'how do i change my password?': 'security',
  'does it use two-factor authentication?': 'security',
  'how do notifications work?': 'notifications',
  'can i turn off notifications?': 'notifications',
  'bye': 'farewell',
  'goodbye': 'farewell',
  'bye bye': 'farewell',
  'see you later': 'farewell',
  'see ya': 'farewell',
  'talk to you later': 'farewell',
  'talk later': 'farewell',
  'catch you later': 'farewell',
  'gotta go': 'farewell',
  'take care': 'farewell',
  'thanks': 'thanks',
  'thank you': 'thanks',
  'thanks a lot': 'thanks',
  'thank you so much': 'thanks',
  'appreciate it': 'thanks',
  'cheers': 'thanks',
  'what can you do?': 'capabilities',
  'what can you help me with?': 'capabilities',
  'what can you help with?': 'capabilities',
  'how can you help me?': 'capabilities',
  'what do you know?': 'capabilities',
  'who are you?': 'identity',
  'what are you?': 'identity',
  'are you a real ai?': 'identity',
  'are you a bot?': 'identity',
  'are you human?': 'identity',
  'is this a real ai?': 'identity',
  'how are you?': 'small_talk',
  'how are you doing?': 'small_talk',
  'how is it going?': 'small_talk',
  "what's up?": 'small_talk',
  'how much does it cost?': 'free',
  'how much is it?': 'free',
  'what does it cost?': 'free',
  'is there a mobile app?': 'browser',
  'can i play on mobile?': 'browser',
  'do i need to download anything?': 'browser',
  'how do i sign up?': 'accounts',
  'how do i create an account?': 'accounts',
  'how do i log in?': 'accounts',
  'what should i play?': 'recommend_game',
  'what can i play?': 'recommend_game',
  'got any good games?': 'recommend_game',
}

// Weighted keyword scoring for free-typed questions (anything not caught by EXACT_MATCHES
// above). Every pattern uses \b word boundaries so short tokens like "ai" or "when" can never
// match as a substring inside an unrelated word (the old /ai|.../ regex, for example, matched
// inside "available", "explain", and "waitlist", which is why answers looked "random").
// Each topic scores as the sum of its matched pattern weights; the highest-scoring topic wins,
// and ties are broken by PRIORITY (lower number = more specific topic wins the tie).
const TOPIC_PATTERNS: Partial<Record<Topic, Array<{ re: RegExp; weight: number }>>> = {
  greeting: [
    // Includes common typo'd/shorthand spellings ("hlo", "helo", "hiya",
    // "heyy", "hii") so a quick, fat-fingered greeting still lands here
    // instead of falling through to the generic fallback reply.
    { re: /^(hi+|hello|helo|hlo|hey+a?|heya|sup|yo|howdy|hiya|hai)\b/i, weight: 3 },
    { re: /good (morning|evening|afternoon)/i, weight: 3 },
  ],
  recommend_game: [
    { re: /\brecommend\b/i, weight: 3 },
    { re: /\bsuggest\b/i, weight: 3 },
    { re: /what should (i|we) play/i, weight: 3 },
    { re: /pick (a game|games)/i, weight: 3 },
  ],
  competitive: [
    { re: /\bcompetitive\b/i, weight: 3 },
    { re: /\branked\b/i, weight: 3 },
    { re: /\bpvp\b/i, weight: 3 },
    { re: /\bskill\b/i, weight: 2 },
    { re: /\bleaderboards?\b/i, weight: 2 },
    { re: /\btournaments?\b/i, weight: 3 },
    { re: /\bfps\b/i, weight: 2 },
  ],
  chill: [
    { re: /\bchill\b/i, weight: 3 },
    { re: /\brelax(ing)?\b/i, weight: 3 },
    { re: /\bcasual\b/i, weight: 3 },
    { re: /low[- ]pressure/i, weight: 3 },
    { re: /wind down/i, weight: 3 },
    { re: /\bcalm\b/i, weight: 2 },
    { re: /\bshort session\b/i, weight: 2 },
    { re: /hidden gems?/i, weight: 2 },
  ],
  puzzle: [
    { re: /\bpuzzles?\b/i, weight: 3 },
    { re: /\bbrain\b/i, weight: 2 },
    { re: /\blogic\b/i, weight: 2 },
    { re: /\bsudoku\b/i, weight: 3 },
    { re: /\btetris\b/i, weight: 3 },
    { re: /\b2048\b/i, weight: 3 },
  ],
  racing: [
    { re: /\brac(e|es|ing|er)\b/i, weight: 3 },
    { re: /\bspeed\b/i, weight: 2 },
    { re: /\bcars?\b/i, weight: 2 },
    { re: /\bkarts?\b/i, weight: 2 },
    { re: /\bmoto\b/i, weight: 2 },
    { re: /\bpolytrack\b/i, weight: 3 },
  ],
  horror: [
    { re: /\bhorror\b/i, weight: 3 },
    { re: /\bscary\b/i, weight: 3 },
    { re: /\bspooky\b/i, weight: 3 },
    { re: /\batmospheric\b/i, weight: 2 },
    { re: /\bev\.?io\b/i, weight: 3 },
  ],
  multiplayer: [
    { re: /\bmultiplayer\b/i, weight: 3 },
    { re: /multi[- ]player/i, weight: 3 },
    { re: /\bfriends?\b/i, weight: 2 },
    { re: /\btogether\b/i, weight: 2 },
    { re: /co[- ]op/i, weight: 3 },
    { re: /\bteam\b/i, weight: 2 },
  ],
  ai_companion: [
    { re: /\bai\b/i, weight: 3 },
    { re: /\bcompanion\b/i, weight: 3 },
    { re: /recommendation engine/i, weight: 3 },
    { re: /artificial intelligence/i, weight: 3 },
    { re: /machine learning/i, weight: 3 },
    { re: /\brecommendations?\b/i, weight: 1 },
  ],
  beta: [
    { re: /\bbeta\b/i, weight: 3 },
    { re: /early access/i, weight: 3 },
    { re: /\brelease\b/i, weight: 1 },
  ],
  launch_date: [
    { re: /\bwhen\b/i, weight: 1 },
    { re: /\bdate\b/i, weight: 2 },
    { re: /\blaunch(es|ed|ing)?\b/i, weight: 2 },
    { re: /\bready\b/i, weight: 1 },
  ],
  roadmap: [
    { re: /\broadmap\b/i, weight: 3 },
    { re: /\bmilestones?\b/i, weight: 3 },
    { re: /\btimeline\b/i, weight: 3 },
    { re: /\bschedule\b/i, weight: 2 },
    { re: /\bplans?\b/i, weight: 1 },
  ],
  accounts: [
    { re: /\baccounts?\b/i, weight: 3 },
    { re: /sign[- ]?(up|in)/i, weight: 3 },
    { re: /\blogin\b/i, weight: 3 },
    { re: /\bregister\b/i, weight: 3 },
    { re: /\bauth(entication)?\b/i, weight: 2 },
  ],
  platform: [
    { re: /\bplatform\b/i, weight: 3 },
    { re: /\bfeatures?\b/i, weight: 2 },
    { re: /\bmodules?\b/i, weight: 2 },
    { re: /\becosystem\b/i, weight: 3 },
    { re: /\bevents?\b/i, weight: 2 },
  ],
  privacy: [
    { re: /\bprivac(y|ies)\b/i, weight: 3 },
    { re: /\bdata\b/i, weight: 2 },
    { re: /\btrack(ing)?\b/i, weight: 2 },
    { re: /\bcollect(s|ed|ion)?\b/i, weight: 2 },
    { re: /\bsell(ing)?\b/i, weight: 2 },
  ],
  free: [
    { re: /\bfree\b/i, weight: 3 },
    { re: /\bcost\b/i, weight: 2 },
    { re: /\bprice\b/i, weight: 2 },
    { re: /\bpaid\b/i, weight: 2 },
    { re: /\bmoney\b/i, weight: 2 },
    { re: /\bsubscription\b/i, weight: 3 },
    { re: /\bpremium\b/i, weight: 2 },
  ],
  browser: [
    { re: /\bbrowsers?\b/i, weight: 3 },
    { re: /\bchrome\b/i, weight: 3 },
    { re: /\bfirefox\b/i, weight: 3 },
    { re: /\bsafari\b/i, weight: 3 },
    { re: /\bedge\b/i, weight: 3 },
    { re: /\bmobile\b/i, weight: 2 },
    { re: /\bdownload\b/i, weight: 2 },
    { re: /\binstall\b/i, weight: 2 },
    { re: /low[- ]end/i, weight: 2 },
  ],
  dev_progress: [
    { re: /\bdevelopment\b/i, weight: 2 },
    { re: /\bprogress\b/i, weight: 3 },
    { re: /\bbuilt\b/i, weight: 2 },
    { re: /\bcoding\b/i, weight: 2 },
    { re: /\bstatus\b/i, weight: 2 },
  ],
  feedback: [
    { re: /\bfeedback\b/i, weight: 3 },
    { re: /\breport\b/i, weight: 2 },
    { re: /\bbug\b/i, weight: 2 },
    { re: /\bsuggestions?\b/i, weight: 2 },
    { re: /\bportal\b/i, weight: 2 },
    { re: /ask a question/i, weight: 3 },
  ],
  achievements: [
    { re: /\bachievements?\b/i, weight: 3 },
    { re: /\bbadges?\b/i, weight: 2 },
    { re: /\btrophy\b/i, weight: 2 },
    { re: /\bprogression\b/i, weight: 2 },
    { re: /\bunlocks?\b/i, weight: 2 },
  ],
  dashboard: [
    { re: /\bdashboard\b/i, weight: 3 },
    { re: /profile page/i, weight: 3 },
    { re: /\bprofiles?\b/i, weight: 2 },
    { re: /\bstats\b/i, weight: 2 },
    { re: /\bstreaks?\b/i, weight: 2 },
  ],
  waitlist: [
    { re: /\bwaitlist\b/i, weight: 3 },
    { re: /wait list/i, weight: 3 },
    { re: /\bjoin\b/i, weight: 2 },
    { re: /\bnotify\b/i, weight: 2 },
    { re: /founder status/i, weight: 3 },
  ],
  friends: [
    { re: /\bsocial\b/i, weight: 3 },
    { re: /\bpresence\b/i, weight: 3 },
    { re: /\bonline\b/i, weight: 2 },
    { re: /who.?s playing/i, weight: 3 },
  ],
  community: [
    { re: /\bcommunit(y|ies)\b/i, weight: 3 },
    { re: /\bhub\b/i, weight: 2 },
    { re: /\bforum\b/i, weight: 2 },
    { re: /\bdiscord\b/i, weight: 2 },
  ],
  what_is: [
    { re: /what (is|are)\b/i, weight: 2 },
    { re: /tell me about/i, weight: 1 },
    { re: /\bexplain\b/i, weight: 2 },
    { re: /\boverview\b/i, weight: 2 },
    { re: /\bsummary\b/i, weight: 2 },
  ],
  games: [
    { re: /\bgames?\b/i, weight: 2 },
    { re: /\bplay\b/i, weight: 1 },
    { re: /\btitles?\b/i, weight: 2 },
    { re: /\blibrary\b/i, weight: 2 },
    { re: /\bavailable\b/i, weight: 1 },
  ],
  pricing_plans: [
    { re: /\bplans?\b/i, weight: 2 },
    { re: /\btiers?\b/i, weight: 2 },
    { re: /\bmembership\b/i, weight: 2 },
    { re: /\bessential\b/i, weight: 3 },
    { re: /\bhorizon plus\b/i, weight: 3 },
    { re: /\bhorizon pro\b/i, weight: 3 },
    { re: /\bultimate\b/i, weight: 3 },
    { re: /\bcreator plan\b/i, weight: 3 },
  ],
  music: [
    { re: /\bmusic\b/i, weight: 3 },
    { re: /\bsong(s)?\b/i, weight: 3 },
    { re: /\bplaylist\b/i, weight: 3 },
    { re: /\bqueue\b/i, weight: 2 },
    { re: /\bspotify\b/i, weight: 2 },
    { re: /\byoutube\b/i, weight: 1 },
    { re: /music room/i, weight: 3 },
  ],
  customization: [
    { re: /\bcustomi[sz]e\b/i, weight: 3 },
    { re: /\bcustomi[sz]ation\b/i, weight: 3 },
    { re: /\bcursor\b/i, weight: 3 },
    { re: /\btheme\b/i, weight: 2 },
    { re: /\baccent\b/i, weight: 2 },
    { re: /\bappearance\b/i, weight: 2 },
  ],
  blog: [
    { re: /\bblog\b/i, weight: 3 },
    { re: /\barticles?\b/i, weight: 2 },
    { re: /\bwrite a post\b/i, weight: 3 },
  ],
  press: [
    { re: /\bpress\b/i, weight: 3 },
    { re: /\bmedia\b/i, weight: 2 },
    { re: /\bjournalists?\b/i, weight: 2 },
  ],
  contact_support: [
    { re: /\bcontact\b/i, weight: 3 },
    { re: /\bsupport\b/i, weight: 1 },
    { re: /\bhelp\b/i, weight: 1 },
    { re: /\bget in touch\b/i, weight: 3 },
    { re: /\bcareers?\b/i, weight: 2 },
    { re: /\bpartnerships?\b/i, weight: 2 },
  ],
  accessibility: [
    { re: /\baccessib(le|ility)\b/i, weight: 3 },
    { re: /screen reader/i, weight: 3 },
    { re: /\bcolor[- ]?blind\b/i, weight: 2 },
    { re: /\bkeyboard navigation\b/i, weight: 2 },
  ],
  status: [
    { re: /\bstatus\b/i, weight: 2 },
    { re: /\bdowntime\b/i, weight: 3 },
    { re: /\bservers? down\b/i, weight: 3 },
    { re: /\boutage\b/i, weight: 3 },
    { re: /\buptime\b/i, weight: 2 },
  ],
  legal: [
    { re: /terms of service/i, weight: 3 },
    { re: /\bterms\b/i, weight: 2 },
    { re: /\blegal\b/i, weight: 2 },
    { re: /\bagreement\b/i, weight: 2 },
  ],
  cookies: [
    { re: /\bcookies?\b/i, weight: 3 },
    { re: /\bconsent\b/i, weight: 2 },
  ],
  design_suggestions: [
    { re: /design suggestion/i, weight: 3 },
    { re: /\bmockup\b/i, weight: 3 },
    { re: /\blogo\b/i, weight: 2 },
    { re: /\bconcept\b/i, weight: 1 },
  ],
  game_request: [
    { re: /request (a|this) game/i, weight: 3 },
    { re: /suggest (a|this) game/i, weight: 3 },
    { re: /game request/i, weight: 3 },
  ],
  vision: [
    { re: /\bvision\b/i, weight: 3 },
    { re: /\bmanifesto\b/i, weight: 3 },
    { re: /\bmission\b/i, weight: 2 },
    { re: /why (are you|is gaming horizon)/i, weight: 2 },
  ],
  security: [
    { re: /\bsecurity\b/i, weight: 3 },
    { re: /\bpassword\b/i, weight: 3 },
    { re: /two[- ]factor/i, weight: 3 },
    { re: /\botp\b/i, weight: 3 },
    { re: /\bencrypt(ed|ion)?\b/i, weight: 2 },
  ],
  notifications: [
    { re: /\bnotifications?\b/i, weight: 3 },
    { re: /\balerts?\b/i, weight: 2 },
    { re: /\breminders?\b/i, weight: 2 },
  ],
  farewell: [
    { re: /^(bye+|goodbye|good bye|cya|see\s?ya|farewell)\b/i, weight: 3 },
    { re: /\bsee you (later|soon|around)?\b/i, weight: 3 },
    { re: /talk (to you )?(again )?later/i, weight: 3 },
    { re: /catch (you|ya) later/i, weight: 3 },
    { re: /\bgotta go\b/i, weight: 3 },
    { re: /have a good (day|night|one|evening)/i, weight: 2 },
    { re: /\btake care\b/i, weight: 2 },
    { re: /\bi('m| am) (leaving|off|out|heading out)\b/i, weight: 2 },
    { re: /\bsigning off\b/i, weight: 2 },
  ],
  thanks: [
    { re: /^(thanks|thank you|thx|ty|cheers)\b/i, weight: 3 },
    { re: /\bappreciate (it|that|you|this)\b/i, weight: 3 },
    { re: /\bthanks a (lot|ton|bunch)\b/i, weight: 3 },
    { re: /\bthat('s| is) helpful\b/i, weight: 2 },
  ],
  capabilities: [
    { re: /what can you (do|help)/i, weight: 3 },
    { re: /how (can|do) you help/i, weight: 3 },
    { re: /^help\b/i, weight: 2 },
    { re: /what do you know/i, weight: 2 },
    { re: /what (else )?can (i|we) ask/i, weight: 2 },
  ],
  identity: [
    { re: /who are you\b/i, weight: 3 },
    { re: /what are you\b/i, weight: 2 },
    { re: /are you (a )?(real )?(human|person|bot|robot|ai)\b/i, weight: 3 },
    { re: /are you (a )?chatbot\b/i, weight: 3 },
  ],
  small_talk: [
    { re: /how are you\b/i, weight: 3 },
    { re: /how('s| is) it going\b/i, weight: 3 },
    { re: /what'?s up\b/i, weight: 2 },
    { re: /how('s| is| are) (things|life)\b/i, weight: 2 },
  ],
}

// Tie-break priority: lower number wins when two topics score equally.
// Specific, narrow-intent topics rank above broad/generic ones like "games" or "what_is",
// so a message that (for example) matches both "games" and "racing" resolves to racing.
const PRIORITY: Record<Topic, number> = {
  greeting: 0,
  farewell: 0,
  thanks: 0,
  small_talk: 0,
  recommend_game: 1,
  competitive: 1,
  chill: 1,
  puzzle: 1,
  racing: 1,
  horror: 1,
  multiplayer: 1,
  ai_companion: 1,
  waitlist: 1,
  achievements: 1,
  dashboard: 1,
  community: 1,
  friends: 1,
  feedback: 1,
  privacy: 1,
  free: 1,
  browser: 1,
  accounts: 1,
  pricing_plans: 1,
  music: 1,
  customization: 1,
  blog: 1,
  press: 1,
  contact_support: 1,
  accessibility: 1,
  status: 1,
  legal: 1,
  cookies: 1,
  design_suggestions: 1,
  game_request: 1,
  vision: 1,
  security: 1,
  notifications: 1,
  capabilities: 1,
  identity: 1,
  roadmap: 2,
  dev_progress: 2,
  beta: 2,
  launch_date: 3,
  platform: 4,
  games: 5,
  what_is: 6,
  fallback: 99,
}

// ── Typo tolerance + synonym normalization ─────────────────────────────────────
// None of this calls out to any model — it's a small local text-normalization layer so
// misspellings ("lauch", "wich") and casual phrasing ("whats", "how much $") still land on
// the right topic instead of falling through to the fallback response.

// Single-word informal contractions / spelling variants → canonical word, expanded before
// scoring so the regex patterns above (which look for the canonical word) still fire.
const SYNONYMS: Record<string, string> = {
  whats: 'what is', wat: 'what', waht: 'what', wats: 'what is', hows: 'how is', whens: 'when is',
  dont: 'do not', wont: 'will not', cant: 'can not', gonna: 'going to', wanna: 'want to',
  u: 'you', ur: 'your', pls: 'please', plz: 'please', thx: 'thanks',
  expensive: 'cost price', bucks: 'money', quid: 'money', cash: 'money', pricing: 'price cost',
  vibe: 'chill relax', chilled: 'chill', relaxed: 'relax', laidback: 'chill casual',
  scary: 'scary horror', spook: 'horror scary', spooky: 'horror', creepy: 'horror scary',
  grind: 'competitive ranked', sweaty: 'competitive ranked', hardcore: 'competitive',
  peeps: 'friends', squad: 'friends team', buddies: 'friends', mates: 'friends',
  cheap: 'free cost', gratis: 'free',
  lauch: 'launch', laucnh: 'launch', realease: 'release launch', relase: 'release launch',
  bilt: 'built', pratice: 'practice', pluform: 'platform', platfrom: 'platform',
  acount: 'account', acc: 'account', signin: 'sign in', signup: 'sign up',
  compettive: 'competitive', competative: 'competitive', racin: 'racing', puzzel: 'puzzle',
  puzzl: 'puzzle', multyplayer: 'multiplayer', privicy: 'privacy', privecy: 'privacy',
  waitlst: 'waitlist', roadmp: 'roadmap', achivement: 'achievement', achievment: 'achievement',
  comunity: 'community', comunities: 'community',
  recomend: 'recommend', recomended: 'recommend', reccomend: 'recommend', sugest: 'suggest', suggeston: 'suggestion',
  gam: 'game', gaes: 'games', gmaes: 'games', gme: 'game',
  frends: 'friends', freinds: 'friends', frineds: 'friends',
  musik: 'music', musci: 'music', shedule: 'schedule',
  featurs: 'features', fetures: 'features', beeta: 'beta', betaa: 'beta',
  pric: 'price', pirce: 'price', pircing: 'pricing',
}

// Single-word canonical keywords used for fuzzy (edit-distance) matching, mapped to the
// topic they belong to. Kept separate from TOPIC_PATTERNS (which handles exact phrasing)
// so a genuine misspelling of a keyword — not caught by any regex — can still contribute
// score to the right topic.
const FUZZY_KEYWORDS: Array<{ word: string; topic: Topic; weight: number }> = [
  { word: 'game', topic: 'games', weight: 2 }, { word: 'games', topic: 'games', weight: 2 },
  { word: 'library', topic: 'games', weight: 2 },
  { word: 'recommend', topic: 'recommend_game', weight: 3 }, { word: 'suggest', topic: 'recommend_game', weight: 3 },
  { word: 'competitive', topic: 'competitive', weight: 3 }, { word: 'ranked', topic: 'competitive', weight: 3 },
  { word: 'tournament', topic: 'competitive', weight: 3 }, { word: 'leaderboard', topic: 'competitive', weight: 2 },
  { word: 'chill', topic: 'chill', weight: 3 }, { word: 'relax', topic: 'chill', weight: 3 }, { word: 'casual', topic: 'chill', weight: 3 },
  { word: 'puzzle', topic: 'puzzle', weight: 3 }, { word: 'sudoku', topic: 'puzzle', weight: 3 }, { word: 'tetris', topic: 'puzzle', weight: 3 },
  { word: 'racing', topic: 'racing', weight: 3 }, { word: 'polytrack', topic: 'racing', weight: 3 }, { word: 'kart', topic: 'racing', weight: 2 },
  { word: 'horror', topic: 'horror', weight: 3 }, { word: 'scary', topic: 'horror', weight: 3 }, { word: 'spooky', topic: 'horror', weight: 3 },
  { word: 'multiplayer', topic: 'multiplayer', weight: 3 }, { word: 'coop', topic: 'multiplayer', weight: 3 },
  { word: 'companion', topic: 'ai_companion', weight: 3 },
  { word: 'beta', topic: 'beta', weight: 3 },
  { word: 'launch', topic: 'launch_date', weight: 2 }, { word: 'release', topic: 'launch_date', weight: 2 },
  { word: 'roadmap', topic: 'roadmap', weight: 3 }, { word: 'milestone', topic: 'roadmap', weight: 3 }, { word: 'timeline', topic: 'roadmap', weight: 3 },
  { word: 'account', topic: 'accounts', weight: 3 }, { word: 'login', topic: 'accounts', weight: 3 }, { word: 'register', topic: 'accounts', weight: 3 },
  { word: 'platform', topic: 'platform', weight: 3 }, { word: 'ecosystem', topic: 'platform', weight: 3 },
  { word: 'privacy', topic: 'privacy', weight: 3 }, { word: 'data', topic: 'privacy', weight: 2 },
  { word: 'free', topic: 'free', weight: 3 }, { word: 'price', topic: 'free', weight: 2 }, { word: 'cost', topic: 'free', weight: 2 }, { word: 'subscription', topic: 'free', weight: 3 },
  { word: 'browser', topic: 'browser', weight: 3 }, { word: 'chrome', topic: 'browser', weight: 3 }, { word: 'firefox', topic: 'browser', weight: 3 }, { word: 'mobile', topic: 'browser', weight: 2 },
  { word: 'progress', topic: 'dev_progress', weight: 3 }, { word: 'development', topic: 'dev_progress', weight: 2 },
  { word: 'feedback', topic: 'feedback', weight: 3 }, { word: 'bug', topic: 'feedback', weight: 2 }, { word: 'portal', topic: 'feedback', weight: 2 },
  { word: 'achievement', topic: 'achievements', weight: 3 }, { word: 'badge', topic: 'achievements', weight: 2 }, { word: 'trophy', topic: 'achievements', weight: 2 },
  { word: 'dashboard', topic: 'dashboard', weight: 3 }, { word: 'profile', topic: 'dashboard', weight: 2 }, { word: 'streak', topic: 'dashboard', weight: 2 },
  { word: 'waitlist', topic: 'waitlist', weight: 3 },
  { word: 'friends', topic: 'friends', weight: 2 }, { word: 'social', topic: 'friends', weight: 3 }, { word: 'presence', topic: 'friends', weight: 3 },
  { word: 'community', topic: 'community', weight: 3 }, { word: 'communities', topic: 'community', weight: 3 }, { word: 'discord', topic: 'community', weight: 2 },
  { word: 'explain', topic: 'what_is', weight: 2 }, { word: 'overview', topic: 'what_is', weight: 2 },
  { word: 'plans', topic: 'pricing_plans', weight: 2 }, { word: 'membership', topic: 'pricing_plans', weight: 2 }, { word: 'ultimate', topic: 'pricing_plans', weight: 3 },
  { word: 'music', topic: 'music', weight: 3 }, { word: 'song', topic: 'music', weight: 3 }, { word: 'playlist', topic: 'music', weight: 3 }, { word: 'spotify', topic: 'music', weight: 2 },
  { word: 'customize', topic: 'customization', weight: 3 }, { word: 'cursor', topic: 'customization', weight: 3 }, { word: 'theme', topic: 'customization', weight: 2 },
  { word: 'blog', topic: 'blog', weight: 3 }, { word: 'article', topic: 'blog', weight: 2 },
  { word: 'press', topic: 'press', weight: 3 }, { word: 'media', topic: 'press', weight: 2 },
  { word: 'contact', topic: 'contact_support', weight: 3 }, { word: 'support', topic: 'contact_support', weight: 1 }, { word: 'careers', topic: 'contact_support', weight: 2 },
  { word: 'accessibility', topic: 'accessibility', weight: 3 }, { word: 'accessible', topic: 'accessibility', weight: 3 },
  { word: 'status', topic: 'status', weight: 2 }, { word: 'outage', topic: 'status', weight: 3 }, { word: 'downtime', topic: 'status', weight: 3 },
  { word: 'terms', topic: 'legal', weight: 2 }, { word: 'legal', topic: 'legal', weight: 3 },
  { word: 'cookies', topic: 'cookies', weight: 3 }, { word: 'consent', topic: 'cookies', weight: 2 },
  { word: 'mockup', topic: 'design_suggestions', weight: 3 }, { word: 'logo', topic: 'design_suggestions', weight: 2 },
  { word: 'vision', topic: 'vision', weight: 3 }, { word: 'manifesto', topic: 'vision', weight: 3 },
  { word: 'security', topic: 'security', weight: 3 }, { word: 'password', topic: 'security', weight: 3 },
  { word: 'notifications', topic: 'notifications', weight: 3 }, { word: 'alerts', topic: 'notifications', weight: 2 },
  { word: 'goodbye', topic: 'farewell', weight: 3 }, { word: 'bye', topic: 'farewell', weight: 3 },
  { word: 'thanks', topic: 'thanks', weight: 3 }, { word: 'thank', topic: 'thanks', weight: 3 },
  { word: 'help', topic: 'capabilities', weight: 2 },
  // Greeting typos ("helo", "hllo", "howdyy"...) — kept to longer/distinctive canonical
  // words only ("hey"/"yo" excluded: real words like "her"/"you" sit one edit away and
  // would false-positive). Gated below to short standalone messages only, so a longer
  // sentence that happens to contain e.g. "hell" is never misread as a greeting.
  { word: 'hello', topic: 'greeting', weight: 3 }, { word: 'howdy', topic: 'greeting', weight: 3 },
  { word: 'hiya', topic: 'greeting', weight: 3 },
]

// Fuzzy matches for these topics only count on short, standalone-looking messages (a
// greeting/farewell/thanks is almost always typed alone) — otherwise a longer sentence that
// happens to contain a word one edit away from "hello" (e.g. "hell") would be misread as one.
const SHORT_MESSAGE_ONLY_FUZZY_TOPICS = new Set<Topic>(['greeting', 'farewell', 'thanks'])

// Small stopword set — skipped during fuzzy matching so common short words never spuriously
// "fuzzy match" an unrelated keyword.
const STOPWORDS = new Set([
  'the','a','an','is','are','it','to','of','in','on','for','and','or','do','how','what',
  'when','why','who','me','my','you','your','be','can','will','with','about','this','that',
  'there','here','was','were','not','no','yes','ok','okay','please','tell','i',
])

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  const m = a.length, n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp: number[] = new Array(n + 1)
  for (let j = 0; j <= n; j++) dp[j] = j
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j]
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1])
      prev = tmp
    }
  }
  return dp[n]
}

function normalizeText(text: string): string {
  const lower = text.toLowerCase().replace(/[^\w\s?'-]/g, ' ')
  const words = lower.split(/\s+/).filter(Boolean)
  const expanded: string[] = []
  for (const w of words) {
    expanded.push(w)
    if (SYNONYMS[w]) expanded.push(SYNONYMS[w])
  }
  return expanded.join(' ')
}

// Small suffix-stripping stemmer — not linguistically complete, just enough to collapse
// common word-form variants ("customizing" → "customiz", "achievements" → "achievement")
// down to a shared root so they match a keyword without needing a synonym-table entry for
// every inflection of every word.
function stem(word: string): string {
  if (word.length > 6 && word.endsWith('ies')) return word.slice(0, -3) + 'y'
  if (word.length > 6 && word.endsWith('ing')) return word.slice(0, -3)
  if (word.length > 6 && word.endsWith('tion')) return word.slice(0, -4)
  if (word.length > 5 && word.endsWith('ed')) return word.slice(0, -2)
  if (word.length > 5 && word.endsWith('es')) return word.slice(0, -2)
  if (word.length > 4 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

interface TopicScore { topic: Topic; score: number }

// Scores every topic (regex patterns + fuzzy typo-tolerant keyword matching) and returns
// them sorted highest-first. The caller decides whether the top result is confident enough
// to stand alone, or whether the top two are close enough to blend into one combined answer.
function scoreTopics(rawText: string): TopicScore[] {
  const normalized = normalizeText(rawText)
  const tokens = normalized.split(/\s+/).filter((w) => w.length >= 3 && !STOPWORDS.has(w))

  const scores: Partial<Record<Topic, number>> = {}
  const bump = (topic: Topic, amount: number) => { scores[topic] = (scores[topic] ?? 0) + amount }

  for (const topic of Object.keys(TOPIC_PATTERNS) as Topic[]) {
    const patterns = TOPIC_PATTERNS[topic] ?? []
    for (const { re, weight } of patterns) {
      if (re.test(rawText) || re.test(normalized)) bump(topic, weight)
    }
  }

  // Stem + fuzzy pass: catches word-form variants ("customizing", "achievements",
  // "recommending") and misspellings that weren't caught by any regex/synonym above.
  // Deliberately conservative — real words coincidentally close in edit distance (e.g.
  // "gaming" vs "racing") must NOT match, so the typo path requires the same first letter
  // (typos almost never change it) plus a tight distance bound.
  for (const token of tokens) {
    const tokenStem = stem(token)
    let matched = false
    for (const { word, topic, weight } of FUZZY_KEYWORDS) {
      if (token === word) continue // already covered by the regex pass above
      if (SHORT_MESSAGE_ONLY_FUZZY_TOPICS.has(topic) && tokens.length > 2) continue
      // Same stem (e.g. "customizing"/"customize" both stem to "customiz"): a grammatical
      // variant, not a typo, so it earns a higher-confidence bump than the edit-distance path.
      if (tokenStem.length >= 4 && tokenStem === stem(word)) {
        bump(topic, weight * 0.85)
        matched = true
        break
      }
    }
    if (matched) continue
    for (const { word, topic, weight } of FUZZY_KEYWORDS) {
      if (token === word) continue
      if (token[0] !== word[0]) continue
      if (SHORT_MESSAGE_ONLY_FUZZY_TOPICS.has(topic) && tokens.length > 2) continue
      const maxDist = word.length <= 5 ? 1 : word.length <= 9 ? 2 : 3
      if (Math.abs(token.length - word.length) > maxDist) continue
      if (levenshtein(token, word) <= maxDist) {
        bump(topic, weight * 0.7)
        break
      }
    }
  }

  return (Object.keys(scores) as Topic[])
    .map((topic) => ({ topic, score: scores[topic] ?? 0 }))
    .sort((a, b) => b.score - a.score || PRIORITY[a.topic] - PRIORITY[b.topic])
}

function detectTopic(text: string): Topic {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ')
  const exact = EXACT_MATCHES[normalized]
  if (exact) return exact

  const ranked = scoreTopics(text)
  return ranked.length > 0 && ranked[0].score > 0 ? ranked[0].topic : 'fallback'
}

// ── Response bank ─────────────────────────────────────────────────────────────

const RESPONSES: Record<Topic, { texts: string[]; chips?: string[] }> = {
  greeting: {
    texts: [
      "Hey there! I'm the Gaming Horizon AI Companion — your guide to everything on the platform. What are you curious about?",
      "Hello! Great to have you here. I can tell you about our games, the AI system, the beta timeline, or anything else about Gaming Horizon. Where would you like to start?",
      "Hi! I'm your Gaming Horizon companion. Ask me anything — games, features, the roadmap, or just what we're building here.",
    ],
    chips: ['What is Gaming Horizon?', 'When does beta start?', 'Recommend me a game', 'What features are coming?'],
  },
  what_is: {
    texts: [
      "Gaming Horizon is an upcoming premium browser gaming ecosystem — one place to discover games, play them instantly without any downloads, get AI-powered recommendations, build a profile, earn cross-game achievements, and join communities. Everything runs in your browser.",
      "Think of Gaming Horizon as the home base for browser gaming. It combines a curated game library, an AI companion that understands how you want to play, social features, profiles, and a discovery engine — all without needing an app or install.",
    ],
    chips: ['When does it launch?', 'What games are included?', 'Tell me about the AI', 'Is it free?'],
  },
  games: {
    texts: [
      "The current planned library includes titles like PolyTrack, Shell Shockers, Krunker, Slow Roads, Tetris, Chess, Sudoku, Smash Karts, Rocket Bot Royale, Narrow One, Ev.io, 2048, Moto X3M, and Fireboy & Watergirl — across genres like FPS, racing, puzzle, strategy, and co-op. More will be added before and after launch.",
      "We're curating a diverse browser game library — fast-paced shooters like Krunker and Shell Shockers, calm experiences like Slow Roads, classics like Chess and Tetris, and hidden gems. Every title is instant-play: click and you're in.",
    ],
    chips: ['Recommend me a game', 'Show me racing games', 'Any co-op games?', 'What runs on low-end devices?'],
  },
  recommend_game: {
    texts: [
      "Great question! To give you the best pick, tell me your mood: Do you want something competitive, chill, puzzle-based, a quick session, or multiplayer? Or I can surprise you with a hidden gem.",
      "I'd love to recommend something. Are you looking to relax, compete, solve puzzles, race, or play with friends? Your mood shapes the best match.",
    ],
    chips: ['Competitive games', 'Chill games', 'Puzzle games', 'Multiplayer games', 'Quick 5-minute game'],
  },
  competitive: {
    texts: [
      "For competitive play, Krunker is the standout — a fast arena FPS with ranked ladders and a genuine skill ceiling. Shell Shockers is another great pick for twitchy, competitive shooting with quick matchmaking. Both are live in modern browsers now.",
      "Krunker tops the competitive list — it has ranked play, active tournaments, and a dedicated scene. If you prefer something more strategic, Chess is deep, fast in blitz format, and widely available. Rocket Bot Royale scratches the battle-royale itch.",
    ],
    chips: ['What about co-op?', 'Any racing games?', 'Tell me about leaderboards', 'When does ranked launch?'],
  },
  chill: {
    texts: [
      "For a chill session, Slow Roads is exceptional — endless meditative driving with no fail states, just vibes. 2048 is perfect for 10-minute windows: satisfying, low-pressure tile merging. Both run in any browser with no setup.",
      "Slow Roads and 2048 are the top chill picks. Slow Roads is genuinely calming — just drive through procedurally generated landscapes. 2048 is the kind of puzzle you can pick up and put down whenever. Chess is also surprisingly relaxing at a slow pace.",
    ],
    chips: ['What about puzzle games?', 'Any short session games?', 'Show me hidden gems'],
  },
  puzzle: {
    texts: [
      "Puzzle fans are well-served: Sudoku scales from beginner to expert and is endlessly replayable. Tetris offers pure puzzle flow state with competitive online modes. 2048 is addictive and quick. Fireboy & Watergirl brings co-op puzzle solving into the mix.",
      "The puzzle lineup: Sudoku (logic-based, adaptive difficulty), Tetris (flow state classic), 2048 (short and satisfying), and Fireboy & Watergirl (two-player elemental co-op puzzles). All run natively in the browser.",
    ],
    chips: ['Any solo puzzle games?', 'Two-player puzzles?', 'What about brain games?'],
  },
  racing: {
    texts: [
      "The racing lineup is strong: PolyTrack is a precision low-poly time-trial game with ghost racing — incredible for mastery. Moto X3M is a stunt bike course game that rewards skill. Smash Karts goes in a more chaotic kart-combat direction.",
      "PolyTrack is the crown jewel for racing fans — tight time trials, ghost comparison, and a high skill ceiling. Moto X3M adds trick-based stunt courses. If you want social chaos, Smash Karts is the pick.",
    ],
    chips: ['What about FPS games?', 'Any multiplayer racing?', 'Tell me about PolyTrack'],
  },
  horror: {
    texts: [
      "For atmospheric and tense gameplay, Krunker's community horror maps deliver surprisingly eerie rounds. Ev.io has a dark sci-fi aesthetic that leans atmospheric. While Gaming Horizon doesn't have dedicated horror titles at launch, these come closest to that feel.",
      "The closest to horror right now: Ev.io for its dark, tense sci-fi atmosphere, and Krunker with horror-themed community maps. Proper atmospheric horror titles are on the wishlist for the library beyond beta.",
    ],
    chips: ['Tell me more about Ev.io', 'What about scary puzzle games?', 'What genres are coming after beta?'],
  },
  multiplayer: {
    texts: [
      "Multiplayer is a first-class experience on Gaming Horizon. Top picks: Smash Karts (chaotic kart combat), Rocket Bot Royale (tank battle royale), Shell Shockers (team FPS), Krunker (competitive arena), Narrow One (team archery), and Chess (classic head-to-head). Friends presence and invites are planned for the beta.",
      "For playing with others: Smash Karts and Rocket Bot Royale are instant-social, Shell Shockers and Krunker for competitive group play, Fireboy & Watergirl for local co-op puzzles, and Narrow One for team tactics. The Friends system goes live with the Public Beta.",
    ],
    chips: ['Any co-op games?', 'When do friends features launch?', 'Tell me about communities'],
  },
  ai_companion: {
    texts: [
      "The AI Companion is a discovery engine, not a generic chatbot. It reasons about your mood, the time you have, and your device — then surfaces games with a clear explanation of why each one fits. It adapts as it learns your preferences over sessions.",
      "Unlike a search bar or genre filter, the AI Companion understands intent. Tell it you want 'something chill for 10 minutes on a slow laptop' and it returns relevant picks with reasoning. Privacy is core — it works with minimal data and nothing is sold.",
      "The companion is context-aware: mood-based, time-aware, device-aware, and social-signal-aware (what your friends are playing). Every recommendation includes a 'why' so you're never left guessing.",
    ],
    chips: ['Tell me about privacy', 'How does it learn my taste?', 'Can it recommend right now?', 'When is it live?'],
  },
  beta: {
    texts: [
      "The Public Beta launches on 1 January 2027 at 12:01 AM IST. It will include the core game library, AI Companion, profiles, friends, achievements, and leaderboards. Joining the waitlist is the best way to get early access.",
      "Beta is set for 1 January 2027. The Feedback Portal opens shortly after on 15 January 2027, stays open through November 2027, then closes as we move toward feature freeze. The full official launch is 1 March 2028.",
    ],
    chips: ['How do I join the waitlist?', 'What will beta include?', 'When is the full launch?', 'When does the Feedback Portal open?'],
  },
  launch_date: {
    texts: [
      "Key dates: Public Beta — 1 January 2027. Feedback Portal opens — 15 January 2027. Feature Freeze — December 2027. Official Launch — 1 March 2028. Join the waitlist to stay ahead of each milestone.",
      "The beta opens 1 January 2027, the Feedback Portal runs January–November 2027, and the full platform launches 1 March 2028. Every milestone is publicly tracked on the Roadmap page.",
    ],
    chips: ['How do I join the waitlist?', 'What comes after beta?', 'Show me the roadmap'],
  },
  roadmap: {
    texts: [
      "The roadmap runs: Project Foundation (Sept 2026) → Architecture & Design System → Frontend + Backend build → Internal QA → Public Beta (1 Jan 2027) → Community Testing (Jan–Nov 2027) → Feature Freeze (Dec 2027) → Release Candidate → Official Launch (1 Mar 2028).",
      "Current active phases are Architecture and Design System. Frontend development starts November 2026, backend in December. Public Beta is the first public milestone. The full roadmap with every milestone is visible on the Roadmap page.",
    ],
    chips: ['What is currently in progress?', 'When does beta open?', 'What launches at official launch?'],
  },
  accounts: {
    texts: [
      "Accounts are optional for browsing but unlock profiles, progression, the friends system, personalised AI recommendations, and achievement tracking. Authentication becomes functional closer to the Public Beta on 1 January 2027.",
      "You won't need an account just to explore, but it's worth creating one for beta access. Accounts tie together your profile, achievement history, game library, and AI preference learning across sessions.",
    ],
    chips: ['How do I join the waitlist?', 'What does the profile show?', 'When does auth go live?'],
  },
  platform: {
    texts: [
      "Gaming Horizon's platform features include: instant-play game library, AI Companion, player profiles, cross-game achievements, friends + presence, leaderboards, communities, events, collections, game reviews, a developer platform (post-launch), and creator tools. All browser-native, no installs.",
      "The ecosystem has 14 planned modules: games, AI, profiles, achievements, communities, friends, reviews, leaderboards, collections, events, recommendations, developer platform, creator tools, and tournaments. Beta ships the core layer; richer social and creator features arrive in subsequent phases.",
    ],
    chips: ['Tell me about the AI', 'When do communities launch?', 'What is in beta?', 'Is there a developer platform?'],
  },
  privacy: {
    texts: [
      "Privacy is a core principle at Gaming Horizon. Recommendations are designed to work with minimal data, you control what is shared, nothing is sold to third parties, and clear privacy policies will be published before launch. The AI companion is specifically built to avoid surveillance patterns.",
      "Gaming Horizon treats privacy as a design constraint, not an afterthought. The AI Companion will function with minimal user data, you'll have granular control over what's stored, and detailed policies will be public before the beta opens.",
    ],
    chips: ['Tell me more about the AI', 'What data does it collect?', 'When are policies published?'],
  },
  free: {
    texts: [
      "The core Gaming Horizon experience is designed to be free — discover games, play them, use the AI Companion, build a profile, earn achievements, and join communities without paying. Details on any optional premium features will be shared closer to launch.",
      "Free to use is the baseline. Browser gaming is already freely available on the web; Gaming Horizon's goal is to organise, enhance and enrich that experience without gating the fundamentals behind a paywall.",
    ],
    chips: ['What is included for free?', 'Will there be a premium tier?', 'When does it launch?'],
  },
  browser: {
    texts: [
      "Gaming Horizon supports all modern browsers: Chrome, Edge, Firefox, Safari, Brave, and Opera on desktop and mobile. No download, no install — click a game and you're in within seconds. Each game also lists its own browser compatibility.",
      "The entire platform is browser-native by design. That includes the game library, your profile, the AI Companion, achievements, and social features. If your browser loads this page, it will load Gaming Horizon.",
    ],
    chips: ['What about mobile?', 'Which games run on low-end devices?', 'Tell me about the platform'],
  },
  dev_progress: {
    texts: [
      "Current development snapshot: Frontend (72%), Backend (48%), Infrastructure (55%), Authentication (40%), AI (35%), Database (60%), Game Library (30%). The Design System and core sections are largely complete; backend services and the game ingestion pipeline are active.",
      "The team is deep in the architecture and design-system phases right now. Frontend leads the progress at ~72%, database schema is solidifying at 60%, and the AI recommendation prototype is producing first results at 35%. The Development page has the full live breakdown.",
    ],
    chips: ['When does beta open?', 'What is built so far?', 'Show me the roadmap'],
  },
  feedback: {
    texts: [
      "The Feedback Portal opens on 15 January 2027 — shortly after the Public Beta launches — and stays open until 30 November 2027. It will support structured feature requests, bug reports, and community voting. The Ask a Question feature on the FAQ page captures pre-launch questions in the meantime.",
      "Structured feedback starts with the Feedback Portal on 15 Jan 2027. Before that, you can use the 'Ask a Question' feature on the FAQ page and your question will be reviewed when the portal opens.",
    ],
    chips: ['When does beta open?', 'How do I ask a question now?', 'How do I join the waitlist?'],
  },
  achievements: {
    texts: [
      "Achievements on Gaming Horizon are cross-game — earn them in Chess, Krunker, Tetris, and they all appear on your unified profile. Rarity tiers range from common to legendary. The system is planned for launch alongside the Public Beta.",
      "The achievement system tracks progression across every game in the library. Each game has its own set, displayed on your profile with rarity indicators. Friends can see your showcase, and rare achievements become profile badges.",
    ],
    chips: ['Tell me about profiles', 'What games have achievements?', 'When does the beta launch?'],
  },
  dashboard: {
    texts: [
      "Your personal dashboard will show your profile card, play streak, friends currently online, recent achievements, favorite games, AI-curated picks, roadmap progress context, and your waitlist position. Think of it as your gaming home base.",
      "The dashboard is your signed-in home: profile tier and level, streak, online friends, recent achievement unlocks, AI recommendations tailored to your history, and a snapshot of your progress across the platform.",
    ],
    chips: ['Tell me about achievements', 'What does the AI recommend?', 'How do I join the waitlist?'],
  },
  waitlist: {
    texts: [
      "Joining the waitlist is free and takes under a minute — just your name and email. Waitlist members may receive early beta access, founder recognition on their profile, and regular development updates before the public launch.",
      "The waitlist is your ticket to early beta access on 1 January 2027. It's also how you'll get founder status on your profile — a badge showing you were there from the start. Hit the 'Join the Waitlist' button to sign up.",
    ],
    chips: ['When does beta open?', 'What does founder status include?', 'Tell me about profiles'],
  },
  friends: {
    texts: [
      "The Friends system launches with the Public Beta. You'll see which friends are online, what games they're playing, invite them to sessions, and get AI recommendations that factor in shared preferences. Real-time presence is a first-class feature.",
      "Friends on Gaming Horizon shows live presence — who's online and what they're in. The AI Companion also uses social signals, so if three friends are into Shell Shockers, it factors that into your recommendations.",
    ],
    chips: ['Tell me about multiplayer games', 'What about communities?', 'When does beta launch?'],
  },
  community: {
    texts: [
      "Communities are hubs built around specific games or playstyles — with discussion, events, and shared game lists. They're planned for the Community Testing phase (January–November 2027) following the beta launch.",
      "Each game will have its own community space for discussion, highlights, and events. Broader themed communities (competitive play, chill gaming, puzzle lovers) are also planned. This all rolls out during Community Testing in 2027.",
    ],
    chips: ['When does beta launch?', 'Tell me about events', 'What other social features are there?'],
  },
  pricing_plans: {
    texts: [
      "Planned membership tiers (subject to change before launch): Horizon Essential ($4.99/mo) for casual players, Horizon Plus ($8.99/mo, most recommended) with enhanced AI discovery and expanded cloud saves, Horizon Pro ($14.99/mo) with deep progression analytics and family profiles, Horizon Ultimate ($24.99/mo) with maximum personalization and priority support, and Horizon Creator ($39.99/mo) for developers with publishing and analytics tools.",
      "There are five planned tiers on top of the free core experience: Essential, Plus, Pro, Ultimate, and Creator — each adding more AI discovery controls, cloud capacity, family or social tools, or (for Creator) publishing and monetization features. All pricing is planned and may change before commercial launch.",
    ],
    chips: ['What is included for free?', 'Tell me about the AI', 'When does it launch?'],
  },
  music: {
    texts: [
      "The Music Room lets you queue tracks with a simple /play command — drop a YouTube link, a Spotify link, or just a song name. Every track actually plays through YouTube under the hood (Spotify links are only used to look up the title, since Spotify's own embed caps free playback at 30 seconds).",
      "Music Room is a shared listening space: type /play <link or song name> in the chat to queue and start playback. It resolves titles from both YouTube and Spotify links, but everything plays back in full through the in-app YouTube player so there's no 30-second preview limit.",
    ],
    chips: ['Tell me about the platform', 'Tell me about the customization studio', 'What is Gaming Horizon?'],
  },
  customization: {
    texts: [
      "The Customization Studio lets you tune your Horizon Dot, Neon Ring, Minimal Arrow, Pixel Pointer, and other cursor styles (twelve in total), plus theme mode, accent color palettes or a custom color, background atmosphere, glow intensity, and UI density.",
      "You can personalize your experience deeply: pick from curated accent palettes or set a custom color, choose one of twelve lightweight cursor styles, adjust glow and density, and set the overall theme and background atmosphere — all from the Customization Studio.",
    ],
    chips: ['Tell me about profiles', 'Tell me about the platform', 'What is included for free?'],
  },
  blog: {
    texts: [
      "The blog is a community space where members can publish their own posts about Gaming Horizon — using a rich-text composer with formatting, images, and embeds. Published posts appear in the public blog feed for everyone to read.",
      "You can write and publish your own blog posts through the composer at /blog/new, covering anything from game discoveries to Gaming Horizon updates. All posts show up on the main Blog page once published.",
    ],
    chips: ['Can I submit a design?', 'Tell me about communities', 'What is Gaming Horizon?'],
  },
  press: {
    texts: [
      "The Press page covers Gaming Horizon for media and journalists. For interviews, press kits, or media inquiries, the Contact page has a dedicated 'Press & Media' topic that routes directly to the right team.",
      "Journalists and media can reach out through the Contact form using the 'Press & Media' topic. The Press page itself has the latest coverage and press-relevant information about the project.",
    ],
    chips: ['How do I contact you?', 'Tell me about the vision', 'What is Gaming Horizon?'],
  },
  contact_support: {
    texts: [
      "You can reach the team through the Contact page — pick a topic (General, Press & Media, Partnerships, Developer Platform, or Careers), leave your message, and expect a response, though replies may take longer during pre-launch.",
      "Contact is organized by topic: General questions, Press & Media, Partnerships, Developer Platform, or Careers. Just fill in the form on the Contact page and the right team will follow up.",
    ],
    chips: ['How do I ask a question now?', 'Is there a status page?', 'Tell me about the vision'],
  },
  accessibility: {
    texts: [
      "Accessibility is treated as a core requirement, not an afterthought — the goal is a platform that works well with keyboard navigation, screen readers, and sensible color contrast across the whole experience, including games where feasible.",
      "Gaming Horizon is being built with accessibility in mind from the start: clear focus states, keyboard-navigable interfaces, and screen-reader-friendly markup. The dedicated Accessibility page has the full commitment and current status.",
    ],
    chips: ['Tell me about privacy', 'What is Gaming Horizon?', 'How do I contact you?'],
  },
  status: {
    texts: [
      "Nothing is live to the public yet — the System Status page tracks each service (frontend, backend, AI, database, auth, and more) as it moves through development, so you can see exactly what's built and what's still in progress.",
      "The Status page shows Gaming Horizon 'building in the open' — a live breakdown of every service's development state ahead of the Public Beta. Nothing is production-live yet, but progress is tracked transparently.",
    ],
    chips: ['What is currently in progress?', 'What is built so far?', 'When does beta open?'],
  },
  legal: {
    texts: [
      "The Terms of Service outline the rules for using Gaming Horizon once it's live — account responsibilities, acceptable use, and platform policies. They'll be finalized and published before the Public Beta opens.",
      "Full Terms of Service will be published on the Terms page ahead of launch, alongside the Privacy Policy and Cookie Policy. All three are being drafted with the same privacy-first, no-dark-patterns principle as the rest of the platform.",
    ],
    chips: ['Tell me about privacy', 'What is the cookie policy?', 'When does it launch?'],
  },
  cookies: {
    texts: [
      "Gaming Horizon uses a Consent Manager so you control which cookies are active — essential cookies keep the site working, while optional ones (analytics, preferences) require your opt-in. The Cookies page has the full breakdown.",
      "Cookie use is opt-in for anything beyond what's strictly necessary to run the site. The Consent Manager lets you toggle categories individually, and the full Cookie Policy is on the Cookies page.",
    ],
    chips: ['Tell me about privacy', 'Where are the terms of service?', 'What data does it collect?'],
  },
  design_suggestions: {
    texts: [
      "The Design Suggestions gallery is where the community shares logo concepts, website mockups, and UI ideas for Gaming Horizon — upload your own, and others can browse the gallery for inspiration.",
      "If you've made a logo, landing page concept, or UI mockup for Gaming Horizon, you can upload it on the Design Suggestions page for the community to see and react to.",
    ],
    chips: ['Can I write a blog post?', 'Tell me about communities', 'What is Gaming Horizon?'],
  },
  game_request: {
    texts: [
      "The Game Request Portal is how you nominate a browser game for the library — submit it and the team reviews it for licensing, quality, and technical compatibility before deciding whether it's added.",
      "Know a great browser game that isn't on the list? Submit it through the Game Request Portal; every request goes through a licensing, quality, and compatibility review before it's considered for the library.",
    ],
    chips: ['What games are available?', 'Recommend me a game', 'Tell me about the roadmap'],
  },
  vision: {
    texts: [
      "The vision is simple: browser gaming is the most accessible way to play, but the experience around it has stayed broken — scattered portals, no persistent progress, weak discovery. Gaming Horizon exists to fix that with one unified home for games, AI discovery, community, and progression.",
      "Gaming Horizon's manifesto rests on six pillars: reimagined discovery, one unified home, community at the core, intelligence everywhere, respect by default (privacy-first, no dark patterns), and progression that persists across every game.",
    ],
    chips: ['What is Gaming Horizon?', 'Tell me about the AI', 'Show me the roadmap'],
  },
  security: {
    texts: [
      "Account security includes password strength requirements with live feedback, OTP verification by email for sign-up, password changes, and email changes, and secure session handling throughout. Two-factor style OTP checks apply to sensitive account changes.",
      "Signing up and changing sensitive account details (email, password) goes through OTP verification, and passwords are checked against strength requirements as you type. It's designed to keep your account safe without adding unnecessary friction.",
    ],
    chips: ['When does auth go live?', 'Tell me about privacy', 'What does the profile show?'],
  },
  notifications: {
    texts: [
      "The Notification Center surfaces platform updates, milestone alerts, and even festival greetings tailored to the calendar. You control what you see, and everything is manageable from the notifications panel.",
      "Notifications cover things like roadmap milestones, beta updates, and seasonal festival messages. They're all opt-in and manageable — nothing is forced into your inbox.",
    ],
    chips: ['Tell me about the platform', 'Tell me about privacy', 'What does the profile show?'],
  },
  farewell: {
    texts: [
      "Take care! Feel free to come back anytime you've got more questions about Gaming Horizon.",
      "See you later! I'll be here whenever you want to pick this back up.",
      "Bye for now! Good luck out there, and don't hesitate to swing by again.",
      "Catch you later! If you join the waitlist before you go, you'll be first in line when beta opens.",
    ],
    chips: ['How do I join the waitlist?', 'When does beta start?', 'What is Gaming Horizon?'],
  },
  thanks: {
    texts: [
      "You're welcome! Let me know if there's anything else you'd like to know about Gaming Horizon.",
      "Happy to help! Feel free to ask about anything else — games, the AI, beta, pricing, you name it.",
      "Anytime! I'm here whenever you have more questions.",
    ],
    chips: ['What games are available?', 'Tell me about the AI', 'When does beta start?'],
  },
  capabilities: {
    texts: [
      "I can help with almost anything about Gaming Horizon: the game library and recommendations by mood or genre, the AI Companion, beta and launch dates, the roadmap, pricing plans, accounts and security, the Music Room, Customization Studio, privacy and cookies, and how to reach the team or submit a game/design suggestion.",
      "Ask me about games (by genre or mood), the AI Companion, beta and launch timing, pricing tiers, accounts, privacy, the Music Room, customization options, or how to join the waitlist, submit feedback, or contact the team — that's my whole wheelhouse.",
    ],
    chips: ['What is Gaming Horizon?', 'Recommend me a game', 'What are the pricing plans?', 'When does beta start?'],
  },
  identity: {
    texts: [
      "I'm the Gaming Horizon AI Companion — a discovery-focused guide built into the platform to help you find games, understand features, and stay on top of the roadmap. Ask me anything about Gaming Horizon.",
      "I'm your AI Companion for Gaming Horizon — here to answer questions about games, the platform, beta, pricing, and everything else being built here.",
    ],
    chips: ['Tell me about the AI', 'What can you do?', 'What is Gaming Horizon?'],
  },
  small_talk: {
    texts: [
      "I'm doing great, thanks for asking! Ready to help you explore Gaming Horizon whenever you are.",
      "All good here! What can I help you find out about Gaming Horizon today?",
    ],
    chips: ['What is Gaming Horizon?', 'Recommend me a game', 'When does beta start?'],
  },
  fallback: {
    texts: [
      "I'm not sure I caught that — could you rephrase? I can help with games, the AI Companion, the beta timeline, platform features, pricing plans, accounts, privacy, or anything else about Gaming Horizon.",
      "Hmm, I didn't quite get that. Try asking about specific games, the roadmap, when beta launches, pricing plans, the music room, customization, or anything else you're curious about.",
      "I'm still learning the edges of my vocabulary! Ask me about games, the AI, the beta, pricing, the platform, the roadmap, privacy, accounts, or the community — I'm most helpful there.",
    ],
    chips: ['What is Gaming Horizon?', 'When does beta start?', 'What games are available?', 'Tell me about the AI'],
  },
}

// ── Public API ─────────────────────────────────────────────────────────────────

// Remembers the last text index shown per topic, purely so the same session doesn't say the
// exact same sentence twice in a row for a topic it revisits.
const lastTextIndex: Partial<Record<Topic, number>> = {}

function pickVaried(topic: Topic): string {
  const texts = RESPONSES[topic].texts
  if (texts.length === 1) return texts[0]
  let idx = Math.floor(Math.random() * texts.length)
  if (texts.length > 1) {
    let guard = 0
    while (idx === lastTextIndex[topic] && guard < 5) {
      idx = Math.floor(Math.random() * texts.length)
      guard++
    }
  }
  lastTextIndex[topic] = idx
  return texts[idx]
}

function firstSentence(text: string): string {
  const match = text.match(/^.*?[.!?](\s|$)/)
  return (match ? match[0] : text).trim()
}

// Proper nouns that must never be de-capitalized, even when a sentence they start is being
// spliced in as a lowercase continuation after a colon or em dash.
const PROPER_NOUN_STARTS = new Set([
  'krunker', 'chess', 'shell', 'smash', 'rocket', 'narrow', 'moto', 'fireboy',
  'slow', 'polytrack', 'ev.io', 'evio', 'sudoku', 'tetris', '2048', 'gaming', 'ai',
])

// Lowercases a sentence's first word ONLY when that word isn't a proper noun — fixes the
// "krunker tops the competitive list" bug that plain `.replace(/^[A-Z]/, ...)` causes whenever
// the sentence being spliced in happens to start with a game name or brand term.
function lowerFirstWord(text: string): string {
  const match = text.match(/^[A-Za-z0-9.&']+/)
  if (match && PROPER_NOUN_STARTS.has(match[0].toLowerCase())) return text
  return text.replace(/^[A-Z]/, (c) => c.toLowerCase())
}

function mergeChips(a?: string[], b?: string[]): string[] | undefined {
  const merged = [...(a ?? []), ...(b ?? [])]
  const unique = Array.from(new Set(merged))
  return unique.length > 0 ? unique.slice(0, 4) : undefined
}

const FOLLOWUP_RE = /^(tell me more|more info|more details?|go on|continue|and\??|what else|elaborate|explain more|anything else|more please)\??$/i

// ── Named-game recognition ──────────────────────────────────────────────────────
// Every title in the planned library gets its own short, specific blurb, so naming it
// directly ("tell me about Krunker", "is Chess any good?") gets an answer about that exact
// game instead of only ever falling back to a generic genre-wide (or worse, fallback) reply.
// This is on top of TOPIC_PATTERNS/FUZZY_KEYWORDS above — those decide the genre bucket a
// message scores into; this decides whether to name-drop a specific title within that bucket.
const GAME_INFO: Record<string, { topic: Topic; re: RegExp; blurb: string }> = {
  krunker: { topic: 'competitive', re: /\bkrunker\b/i, blurb: 'Krunker is a fast, low-poly arena FPS with ranked ladders and a genuinely competitive scene.' },
  shellShockers: { topic: 'competitive', re: /\bshell shockers?\b/i, blurb: 'Shell Shockers is a quick-match egg-vs-egg FPS — twitchy, a little silly, and easy to drop into.' },
  chess: { topic: 'puzzle', re: /\bchess\b/i, blurb: 'Chess is the classic head-to-head strategy game — deep enough to grind, fast enough in blitz for a quick session.' },
  smashKarts: { topic: 'racing', re: /\bsmash karts?\b/i, blurb: 'Smash Karts is chaotic kart-combat multiplayer — weapons and power-ups layered on top of the racing.' },
  rocketBot: { topic: 'multiplayer', re: /\brocket bot(\s?royale)?\b/i, blurb: 'Rocket Bot Royale is a tank battle royale — last bot rolling wins.' },
  narrowOne: { topic: 'multiplayer', re: /\bnarrow one\b/i, blurb: 'Narrow One is a team archery shooter that rewards aim and positioning over raw speed.' },
  motoX3M: { topic: 'racing', re: /\bmoto x3m\b/i, blurb: 'Moto X3M is a stunt-bike course game — momentum, tricks, and tight timing on every jump.' },
  fireboy: { topic: 'puzzle', re: /\bfireboy(\s?(and|&)\s?watergirl)?\b/i, blurb: 'Fireboy & Watergirl is two-player elemental co-op puzzling — great for sharing one keyboard.' },
  slowRoads: { topic: 'chill', re: /\bslow roads\b/i, blurb: 'Slow Roads is endless, meditative procedural driving — no fail state, just vibes.' },
  polytrack: { topic: 'racing', re: /\bpolytrack\b/i, blurb: 'PolyTrack is precision low-poly time-trial racing with ghost comparison and a high skill ceiling.' },
  evio: { topic: 'horror', re: /\bev\.?io\b/i, blurb: 'Ev.io has a dark, tense sci-fi shooter atmosphere — the closest thing to horror in the library right now.' },
  sudoku: { topic: 'puzzle', re: /\bsudoku\b/i, blurb: 'Sudoku scales from beginner to expert and is endlessly replayable.' },
  tetris: { topic: 'puzzle', re: /\btetris\b/i, blurb: 'Tetris is pure puzzle flow state, with competitive online modes.' },
  twentyFortyEight: { topic: 'puzzle', re: /\b2048\b/, blurb: '2048 is short, satisfying tile-merging — perfect for a 10-minute window.' },
}

function detectNamedGame(text: string): { topic: Topic; blurb: string } | null {
  for (const info of Object.values(GAME_INFO)) {
    if (info.re.test(text)) return info
  }
  return null
}

// Topics that represent a stated play-style/mood — remembered across the session (see
// AiChatContext.moodHint) so a later plain "recommend me something" can skip straight to a
// pick instead of re-asking what mood you're in.
export const MOOD_TOPICS: Topic[] = ['competitive', 'chill', 'puzzle', 'racing', 'horror', 'multiplayer']
const MOOD_LABELS: Partial<Record<Topic, string>> = {
  competitive: 'competitive',
  chill: 'chill',
  puzzle: 'puzzle-focused',
  racing: 'racing-focused',
  horror: 'something spooky',
  multiplayer: 'multiplayer',
}

export interface AiChatContext {
  /** Topic of the assistant's previous reply, so short follow-ups ("tell me more") stay on-topic. */
  lastTopic?: Topic
  /** Last play-style/mood the person expressed interest in this session (one of MOOD_TOPICS) —
   *  lets a later plain "recommend something" skip the mood question and go straight to a pick. */
  moodHint?: Topic
  /** How many replies in a row have been the generic fallback — after a few misses in a row the
   *  reply changes tone and points to a real person instead of guessing again. */
  fallbackStreak?: number
}

export interface AiChatReply {
  text: string
  chips?: string[]
  /** The topic this reply answered — pass back in via AiChatContext.lastTopic on the next turn. */
  topic: Topic
  /** Pass back in via AiChatContext.fallbackStreak on the next turn. */
  fallbackStreak: number
}

type ComputedReply = { text: string; chips?: string[]; topic: Topic }

// A topic only gets answered as if the bot were sure about it once its score clears this
// bar. Below it (but still > 0), something matched — just not strongly enough to trust — so
// the reply says so instead of confidently answering the wrong thing. This is the main fix
// for "random-feeling" answers: previously a single weak fuzzy hit (as low as ~0.7) was
// enough to commit to a full, confident-sounding reply about a topic the message barely
// touched on.
const CONFIDENT_THRESHOLD = 2

// Soft, honest reply for a message that weakly matched a topic but didn't clear
// CONFIDENT_THRESHOLD — leads with the best guess, but frames it as a guess and offers a
// way out, instead of asserting an answer to a question that might not have been asked.
function lowConfidenceReply(guessTopic: Topic): ComputedReply {
  const bank = RESPONSES[guessTopic]
  const guess = lowerFirstWord(firstSentence(pickVaried(guessTopic)))
  const text = `I'm not fully sure I caught your question, but if this is about it: ${guess} If that's not what you meant, try rephrasing, or pick one of these:`
  return { text, chips: mergeChips(bank.chips, RESPONSES.fallback.chips), topic: guessTopic }
}

// After a few fallback replies in a row, stop repeating "try rephrasing" and point to a real
// person instead — the local matcher has clearly run out of ideas for this particular message.
function repeatedFallbackReply(): ComputedReply {
  const text = "Still not landing on the right topic — sorry about that! I'm best with games, the AI Companion, beta/launch timing, pricing, accounts, privacy, and platform features. For anything outside that, the team can help directly."
  return { text, chips: mergeChips(RESPONSES.fallback.chips, RESPONSES.contact_support.chips), topic: 'fallback' }
}

// Answers a generic "recommend me something" using the mood the person already told us about
// earlier this session, instead of asking the mood question again. Returns null when there's
// no remembered mood, so the caller falls through to the normal reply.
function moodAwareRecommend(context?: AiChatContext): ComputedReply | null {
  if (!context?.moodHint) return null
  const bank = RESPONSES[context.moodHint]
  const label = MOOD_LABELS[context.moodHint] ?? context.moodHint
  const text = `Since you mentioned wanting something ${label} earlier — ${lowerFirstWord(firstSentence(pickVaried(context.moodHint)))} Want a different mood instead?`
  return { text, chips: mergeChips(bank.chips, RESPONSES.recommend_game.chips), topic: context.moodHint }
}

function computeReply(trimmed: string, context?: AiChatContext): ComputedReply {
  // Pure follow-up ("tell me more", "go on") with no new topic of its own: stay on the
  // previous topic and surface a different angle on it rather than re-detecting from scratch.
  if (context?.lastTopic && context.lastTopic !== 'fallback' && FOLLOWUP_RE.test(trimmed)) {
    const bank = RESPONSES[context.lastTopic]
    return { text: pickVaried(context.lastTopic), chips: bank.chips, topic: context.lastTopic }
  }

  const exactTopic = EXACT_MATCHES[trimmed.toLowerCase().replace(/\s+/g, ' ')]
  if (exactTopic) {
    if (exactTopic === 'recommend_game') {
      const moodReply = moodAwareRecommend(context)
      if (moodReply) return moodReply
    }
    const bank = RESPONSES[exactTopic]
    return { text: pickVaried(exactTopic), chips: bank.chips, topic: exactTopic }
  }

  const ranked = scoreTopics(trimmed)
  const top = ranked[0]

  if (top?.topic === 'recommend_game') {
    const moodReply = moodAwareRecommend(context)
    if (moodReply) return moodReply
  }

  if (!top || top.score <= 0) {
    const bank = RESPONSES.fallback
    return { text: pickVaried('fallback'), chips: bank.chips, topic: 'fallback' }
  }

  if (top.score < CONFIDENT_THRESHOLD) {
    return lowConfidenceReply(top.topic)
  }

  const second = ranked[1]
  const isRealTopic = (t: Topic) =>
    t !== 'fallback' && t !== 'greeting' && t !== 'what_is' &&
    t !== 'farewell' && t !== 'thanks' && t !== 'small_talk' && t !== 'identity' && t !== 'capabilities'

  // Multi-intent: if a clearly different second topic scored close to the top one, and is
  // itself confident enough to stand on its own, the person likely asked a compound question
  // ("is it free and when's beta?") — answer both instead of picking just one. Requiring the
  // second topic to also clear CONFIDENT_THRESHOLD stops a strong match from getting a weak,
  // barely-related aside tacked onto it.
  if (
    second &&
    second.score >= CONFIDENT_THRESHOLD &&
    second.score >= top.score * 0.6 &&
    isRealTopic(top.topic) &&
    isRealTopic(second.topic)
  ) {
    const bankA = RESPONSES[top.topic]
    const bankB = RESPONSES[second.topic]
    const text = `${firstSentence(pickVaried(top.topic))} Also — ${lowerFirstWord(firstSentence(pickVaried(second.topic)))}`
    return { text, chips: mergeChips(bankA.chips, bankB.chips), topic: top.topic }
  }

  const bank = RESPONSES[top.topic]
  return { text: pickVaried(top.topic), chips: bank.chips, topic: top.topic }
}

export function getAiResponse(userText: string, context?: AiChatContext): AiChatReply {
  const trimmed = userText.trim()
  let reply = computeReply(trimmed, context)

  // Splice a specific game blurb onto the front when the message names an exact title — but
  // only when it doesn't clash with a more specific, differently-themed answer (a question
  // about beta dates that happens to mention a game name stays about beta dates).
  const named = detectNamedGame(trimmed)
  if (named && (reply.topic === 'fallback' || reply.topic === 'games' || reply.topic === 'what_is' || reply.topic === named.topic)) {
    const bank = RESPONSES[named.topic]
    reply = {
      text: reply.topic === named.topic
        ? `${named.blurb} ${reply.text}`
        : `${named.blurb} ${firstSentence(pickVaried(named.topic))}`,
      chips: bank.chips,
      topic: named.topic,
    }
  }

  const fallbackStreak = reply.topic === 'fallback' ? (context?.fallbackStreak ?? 0) + 1 : 0
  if (fallbackStreak >= 3) {
    return { ...repeatedFallbackReply(), fallbackStreak }
  }

  return { ...reply, fallbackStreak }
}

export const SUGGESTED_STARTERS: string[] = [
  'What is Gaming Horizon?',
  'When does the beta start?',
  'Recommend me a game to play',
  'Tell me about the AI Companion',
  'What games will be available?',
  "Is it free?",
  'Show me the roadmap',
  'How do I join the waitlist?',
]
