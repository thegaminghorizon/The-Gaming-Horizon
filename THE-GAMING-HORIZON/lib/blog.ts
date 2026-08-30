import { Bot, Gamepad2, Orbit, Radio, type LucideIcon } from 'lucide-react'

export interface BlogSection {
  heading: string
  paragraphs: string[]
  points?: string[]
}

export interface BlogArticle {
  slug: string
  title: string
  excerpt: string
  category: string
  read: string
  icon: LucideIcon
  intro: string
  sections: BlogSection[]
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'why-browser-gaming-matters',
    title: 'Why Browser Gaming Matters',
    excerpt: 'A look at instant access, open web technology and why browser games deserve a more ambitious home.',
    category: 'Perspective',
    read: '6 min read',
    icon: Gamepad2,
    intro: 'Browser games remove one of gaming’s biggest barriers: the distance between discovering something interesting and actually playing it. A link can become a playable experience in seconds, without an installer, a large download, or a complicated setup flow.',
    sections: [
      {
        heading: 'Instant access changes discovery',
        paragraphs: [
          'Traditional game discovery often ends at a store page. Browser gaming can continue directly into play. That shorter path makes experimentation easier, especially for players who are unsure what they want or only have a short amount of time.',
          'This does not mean every browser game must be small or disposable. Modern web technology can support polished visuals, persistent progress, multiplayer systems, and sophisticated input. The opportunity is to present those experiences with the care normally associated with dedicated gaming platforms.',
        ],
      },
      {
        heading: 'The browser is already everywhere',
        paragraphs: [
          'A browser works across laptops, desktops, tablets, Chromebooks, and many mobile devices. That reach makes browser games useful for people who cannot install software, have limited storage, or move between devices.',
          'A well-designed platform can preserve continuity through profiles, favorites, recent activity, and cloud-synced progress while still keeping the first interaction immediate.',
        ],
        points: ['No installation before play', 'Easy sharing through links', 'Broad device availability', 'A natural path from discovery to gameplay'],
      },
      {
        heading: 'What the category still needs',
        paragraphs: [
          'Browser gaming deserves better organization, trustworthy information, stronger accessibility, and interfaces that make games—not advertisements or generic marketing—the main focus.',
          'THE Gaming Horizon is being designed around that belief: instant play should feel premium, discovery should feel intentional, and a player’s activity should connect across the wider ecosystem.',
        ],
      },
    ],
  },
  {
    slug: 'behind-gaming-horizon',
    title: 'Behind Gaming Horizon',
    excerpt: 'The principles, design decisions and long-term vision guiding the creation of a connected browser gaming ecosystem.',
    category: 'Project Story',
    read: '8 min read',
    icon: Orbit,
    intro: 'THE Gaming Horizon began with a simple question: what would browser gaming feel like if the platform around it received the same design attention as the games themselves?',
    sections: [
      {
        heading: 'A platform, not a launcher',
        paragraphs: [
          'Gaming Horizon is not intended to download or stream desktop games. Its foundation is instant-play HTML5 and browser-native experiences. The platform layer helps players discover, organize, revisit, and discuss those games.',
          'That distinction shapes every product decision. The homepage should lead with playable experiences. Profiles should reflect meaningful activity. Community and AI features should help people find and understand games rather than distract from them.',
        ],
      },
      {
        heading: 'Designing a connected ecosystem',
        paragraphs: [
          'Games, achievements, communities, events, leaderboards, and the AI Companion are planned as connected modules. A player might discover a game through a recommendation, unlock an achievement, compare progress, and join a relevant discussion without feeling as though they have moved between unrelated products.',
        ],
        points: ['Games remain the center', 'Every module has a clear player benefit', 'Motion supports understanding', 'Real data replaces fabricated activity'],
      },
      {
        heading: 'Quality before page count',
        paragraphs: [
          'The project is being rebuilt around purposeful, production-ready experiences. Placeholder pages, invented statistics, and repetitive layouts may make a site look larger, but they do not make it more useful.',
          'The standard is simple: a feature should not be presented publicly until its content, interaction, responsive behavior, accessibility, and backend path have been considered together.',
        ],
      },
    ],
  },
  {
    slug: 'building-the-ai-companion',
    title: 'Building the AI Companion',
    excerpt: 'How we are thinking about natural recommendations, useful context and an assistant that never feels scripted.',
    category: 'AI & Discovery',
    read: '7 min read',
    icon: Bot,
    intro: 'The AI Companion is planned as a discovery and guidance layer for the platform—not a decorative chatbot. Its value depends on whether it can understand what a player is looking for and turn that context into genuinely useful next steps.',
    sections: [
      {
        heading: 'Recommendations need context',
        paragraphs: [
          'A useful recommendation is rarely based on genre alone. Session length, preferred controls, device, mood, difficulty, solo or multiplayer preference, and recently played games can all change the answer.',
          'The Companion should ask lightweight follow-up questions when needed, explain why a game fits, and avoid repeating the same suggestions without a reason.',
        ],
      },
      {
        heading: 'More than finding a game',
        paragraphs: [
          'The assistant should also answer platform questions, explain genres and controls, help users locate settings, summarize beta information, and guide visitors through unfamiliar parts of the ecosystem.',
        ],
        points: ['Natural game discovery', 'Clear platform guidance', 'Session-aware conversation', 'Transparent limits when information is unavailable'],
      },
      {
        heading: 'Trust is part of the interface',
        paragraphs: [
          'The Companion should never invent a game, feature, release date, or player history. When backend data is not connected, the interface must say so clearly rather than simulate knowledge it does not have.',
          'Conversation quality also depends on variety. Suggested prompts, response structure, and recommendations should adapt to the current conversation instead of falling back to one repeated script.',
        ],
      },
    ],
  },
  {
    slug: 'progress-update-1',
    title: 'Progress Update #1',
    excerpt: 'A focused development update covering the light-first design system, performance work and the next public milestones.',
    category: 'Development',
    read: '5 min read',
    icon: Radio,
    intro: 'This update records the current direction of the Coming Soon experience: a light-first interface, broader personalization, tighter navigation, and a clearer separation between public storytelling and the future gaming platform.',
    sections: [
      {
        heading: 'Light-first, still customizable',
        paragraphs: [
          'The default experience now begins in light mode while preserving dark mode and accent customization. The goal is not to remove the futuristic identity, but to prove that the brand can retain depth, glow, and atmosphere without depending on a permanently dark canvas.',
          'Accent presets, motion controls, cursor choices, and visual intensity settings remain part of the customization system and continue to persist locally.',
        ],
      },
      {
        heading: 'Performance and structure',
        paragraphs: [
          'The loading experience has been shortened, non-essential interface elements are deferred, and the visual system is being reviewed for layout shifts and expensive animation patterns.',
          'The Coming Soon website is also gaining purposeful destinations such as the Blog and Game Request Portal rather than placeholder pages created only to increase the site map.',
        ],
      },
      {
        heading: 'What comes next',
        paragraphs: [
          'The next focus is completing content, refining responsive behavior, connecting opt-in forms to a real backend, and testing the site as a cohesive public introduction to THE Gaming Horizon.',
        ],
        points: ['Complete mobile and tablet QA', 'Connect email and game request submissions', 'Publish only verified project updates', 'Finalize the broader timeline later'],
      },
    ],
  },
  {
    slug: 'progress-update-2',
    title: 'Progress Update #2',
    excerpt: 'A new entry experience, deeper authentication options, a full music room and steady visual stabilization across the site.',
    category: 'Development',
    read: '5 min read',
    icon: Radio,
    intro: 'This update covers the work since Progress Update #1: a more complete arrival experience, real authentication flows, an expanded AI Companion and music room, and a broader pass to keep the visual system consistent as new surfaces were added.',
    sections: [
      {
        heading: 'A proper entry experience',
        paragraphs: [
          'New visitors now move through a dedicated entry gateway before reaching the site, with its own background, cursor and accessibility handling kept independent from the main experience. An optional "Create Your Gaming Horizon Experience" flow lets players set genres, play style, device and AI preferences ahead of time, saved locally and structured for a later account sync.',
          'Sign-in and sign-up were rebuilt around real flows rather than placeholders: password, email link, email OTP, phone OTP, and social sign-in, along with password reset and profile contact changes.',
        ],
      },
      {
        heading: 'Music room and AI Companion',
        paragraphs: [
          'The floating music player grew into a full music room with queue, theming and playback controls, alongside continued refinement of the AI Companion chat experience and its homepage section.',
          'The Customization Studio, command palette and notifications system were also extended so these newer surfaces feel native to the rest of the platform rather than bolted on.',
        ],
      },
      {
        heading: 'Stabilization and what comes next',
        paragraphs: [
          'With several major features landing at once, a large part of this cycle went into a stabilization pass: reconciling accent colors, glass surfaces, hero and dashboard behavior, and interactive states across the new and existing sections so nothing feels visually inconsistent.',
          'Next up is continuing that polish pass on interactive components, finishing responsive and accessibility QA on the newest flows, and connecting the remaining forms to real backend endpoints.',
        ],
        points: ['Polish interactive/button states across the new surfaces', 'Finish QA on auth, onboarding and the music room', 'Connect remaining forms to real endpoints', 'Keep publishing only verified project updates'],
      },
    ],
  },
]

export function getBlogArticle(slug: string) {
  return BLOG_ARTICLES.find((article) => article.slug === slug)
}
