'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  animate,
} from 'framer-motion'
import {
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
} from 'react'
import { ArrowRight, CheckCircle2, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { focusHashTarget } from '@/lib/hash-navigation'

/* ---------------- Magnetic wrapper ---------------- */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const onMove = (e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos({
      x: (e.clientX - (r.left + r.width / 2)) * strength,
      y: (e.clientY - (r.top + r.height / 2)) * strength,
    })
  }

  return (
    <motion.div
      ref={ref}
      className={cn('inline-block', className)}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.4 }}
    >
      {children}
    </motion.div>
  )
}

/* ---------------- Button ---------------- */
const base =
  'group relative inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1))] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none'

const sizes = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-[15px]',
  sm: 'h-9 px-4 text-[13px]',
}

const variants = {
  primary:
    '[color:var(--accent-button-fg,white)] border border-white/15 shadow-[0_8px_30px_-8px_rgb(var(--accent-1)/0.7)] hover:border-white/25 hover:shadow-[0_10px_40px_-6px_rgb(var(--accent-1)/0.9)] hover:-translate-y-0.5',
  glass:
    'glass text-foreground hover:border-[rgb(var(--accent-1)/0.5)] hover:-translate-y-0.5',
  ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
  outline:
    'border border-[rgb(var(--accent-1)/0.4)] text-foreground hover:bg-[rgb(var(--accent-1)/0.1)] hover:-translate-y-0.5',
}

interface BtnProps {
  children: ReactNode
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  href?: string
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  magnetic?: boolean
  disabled?: boolean
}

export function GhButton({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className,
  type = 'button',
  magnetic = true,
  disabled = false,
}: BtnProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  const addRipple = (e: MouseEvent) => {
    const el = e.currentTarget as HTMLElement
    const r = el.getBoundingClientRect()
    const id = Date.now() + Math.random()
    setRipples((p) => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }])
    window.setTimeout(() => setRipples((p) => p.filter((x) => x.id !== id)), 620)
  }

  const inner = (
    <motion.span
      className={cn(base, sizes[size], variants[variant], className)}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onPointerDown={disabled ? undefined : addRipple}
      aria-disabled={disabled}
    >
      {/* clipped effects layer (keeps the focus ring from being cut off) */}
      <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
        {variant === 'primary' && <span className="gh-btn-gradient absolute inset-0 rounded-[inherit]" />}
        <span className="gh-btn-shimmer" aria-hidden />
        {ripples.map((r) => (
          <span key={r.id} className="gh-ripple" style={{ left: r.x, top: r.y }} aria-hidden />
        ))}
      </span>
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.span>
  )

  const el = href ? (
    <Link href={href} onClick={onClick}>
      {inner}
    </Link>
  ) : (
    <button type={type} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  )

  return magnetic && !disabled ? <Magnetic strength={0.25}>{el}</Magnetic> : el
}

/* ---------------- Premium detail panel ---------------- */
type DetailPanelContent = {
  eyebrow: string
  title: string
  overview: string[]
  highlights: string[]
}

const DETAIL_PANEL_CONTENT: Record<string, DetailPanelContent> = {
  '/ai|Know in Detail': {
    eyebrow: 'AI Companion',
    title: 'A smarter way to discover what to play',
    overview: [
      'The Gaming Horizon AI Companion is a conversational discovery layer built into the platform. Instead of forcing players to browse endless grids, it helps them describe their mood, preferred genre, available time, difficulty level, or the type of experience they want, then turns that context into useful game suggestions.',
      'It exists because browser game discovery is often repetitive and impersonal. The companion is designed to explain why a recommendation fits, answer questions about the platform, compare genres, and guide players toward experiences they may otherwise miss.',
      'For players, this means less time searching and more time playing. Recommendations can adapt during the session, avoid repeating the same titles, and make the platform feel more personal without replacing the player’s own choices.',
    ],
    highlights: ['Natural game recommendations', 'Context-aware platform guidance', 'Session-based conversation memory'],
  },
  '/beta|Explore the Full Beta Program': {
    eyebrow: 'Public Beta',
    title: 'Help shape Gaming Horizon before launch',
    overview: [
      'The Public Beta is a structured testing period where players can experience the core Gaming Horizon ecosystem before the official release. It focuses on real-world use across different browsers, devices, network conditions, and play styles.',
      'The program exists to identify bugs, confusing interactions, performance issues, and missing features while there is still time to improve them. Feedback is organized into clear categories so useful reports can directly influence development priorities.',
      'Participants get an early look at the platform and a meaningful way to influence its direction. The goal is not to present a finished product too early, but to build a stronger final experience through transparent collaboration with the community.',
    ],
    highlights: ['Early platform access', 'Structured feedback channels', 'Visible development progress'],
  },
  '/platform|Explore the full ecosystem': {
    eyebrow: 'Platform Ecosystem',
    title: 'One connected browser gaming experience',
    overview: [
      'Gaming Horizon brings instant-play games, discovery, progression, community, and intelligent assistance into one connected browser-first ecosystem. Each system is designed to work together rather than feeling like a collection of unrelated pages.',
      'The platform exists to give browser gaming the structure and polish normally associated with major gaming services, while preserving the speed and accessibility of playing directly in a web browser.',
      'Players benefit from a consistent identity across games, easier discovery, meaningful progress, and a community layer that grows around what they actually play. The result is a platform that feels cohesive from the first visit to every returning session.',
    ],
    highlights: ['Instant browser play', 'Unified player progression', 'Connected community systems'],
  },
  '/platform|Explore the platform': {
    eyebrow: 'Player Experience',
    title: 'A home for every part of your browser gaming journey',
    overview: [
      'The Gaming Horizon player experience brings recently played games, favorites, achievements, recommendations, notifications, and personal settings into one clear interface. It is designed to feel like a modern gaming home rather than a traditional dashboard.',
      'It exists so players can continue where they left off, understand their progress, and discover their next game without navigating through disconnected tools. Every module is intended to support the core action of finding and playing games.',
      'The benefit is continuity. Your activity, preferences, and progression stay organized across the platform, making each visit feel familiar while still surfacing something new to explore.',
    ],
    highlights: ['Continue playing instantly', 'Personalized discovery', 'Progress in one place'],
  },
  '/roadmap#development|Open Development Hub': {
    eyebrow: 'Development Hub',
    title: 'A transparent view of what is being built',
    overview: [
      'The Development Hub is the central place for progress updates, milestone tracking, changelog entries, known issues, and platform status. It turns development activity into a clear story visitors can follow over time.',
      'It exists to avoid vague promises and fabricated progress. Updates are tied to actual work, stored dates, and meaningful changes so the community can understand what has improved and what is still in progress.',
      'For visitors, this creates trust and context. Instead of only seeing a finished announcement page, they can follow the journey, understand priorities, and see how feedback influences the platform.',
    ],
    highlights: ['Real development updates', 'Changelog and status visibility', 'Milestone-based progress'],
  },
  '/faq|Read the full FAQ': {
    eyebrow: 'Frequently Asked Questions',
    title: 'Clear answers about Gaming Horizon',
    overview: [
      'The Gaming Horizon FAQ explains what the platform is, what it is not, how browser games will work, what the beta includes, and how player data and feedback will be handled.',
      'It exists to answer important questions without forcing visitors to search through long pages or announcements. The information is organized around the topics people are most likely to ask before joining the journey.',
      'This gives visitors a fast, reliable way to understand the project and make informed decisions about joining the waitlist, participating in beta testing, or following development.',
    ],
    highlights: ['Platform and beta answers', 'Privacy and account guidance', 'Browser compatibility information'],
  },
  '/games|Explore full library': {
    eyebrow: 'Games Library',
    title: 'Discover browser games without the clutter',
    overview: [
      'The Games Library is the core discovery space for real browser games that can be played instantly where licensing and embedding allow. Titles are organized through categories, collections, search, filters, and curated recommendations.',
      'It exists to make browser game discovery feel trustworthy and intentional. Instead of fake titles or random stock images, the library is planned around recognizable games, accurate information, and clear compatibility details.',
      'Players benefit from faster discovery, useful organization, favorites, recent activity, and a consistent way to understand each game before starting it.',
    ],
    highlights: ['Real game catalog', 'Search and curated collections', 'Favorites and recent activity'],
  },
  '/platform|Explore all modules': {
    eyebrow: 'Core Modules',
    title: 'Every system has a clear purpose',
    overview: [
      'Gaming Horizon is made from connected modules including Games, AI Companion, Community, Achievements, Leaderboards, Events, and player profiles. Each module supports a specific part of the browser gaming experience.',
      'The modular approach exists so the platform can grow without becoming confusing. Features can evolve independently while still sharing the same design language, account system, progression model, and navigation patterns.',
      'For players, this means every area feels familiar and useful. Moving from discovering a game to checking an achievement or joining a discussion should feel like one continuous experience.',
    ],
    highlights: ['Consistent connected modules', 'Scalable platform architecture', 'One shared player identity'],
  },
  '/roadmap|View detailed roadmap': {
    eyebrow: 'Roadmap',
    title: 'A milestone-driven path to launch',
    overview: [
      'The Gaming Horizon roadmap organizes the project into clear phases covering brand foundations, the announcement website, core platform systems, beta preparation, feedback, and production launch readiness.',
      'It exists to prevent the project from becoming an unstructured collection of ideas. Each phase has a defined purpose, expected outcome, and quality checkpoint before the next stage begins.',
      'Visitors can understand where the project stands and what comes next, while the development process remains focused on quality rather than rushing unfinished features into production.',
    ],
    highlights: ['Clear project phases', 'Quality gates between milestones', 'Transparent launch preparation'],
  },
  '/vision|Know in Detail': {
    eyebrow: 'Vision',
    title: 'The future of browser gaming, connected',
    overview: [
      'Gaming Horizon is envisioned as a premium browser gaming ecosystem where players can instantly discover, play, progress, and connect without downloads or installations. Games remain at the center of the experience, supported by intelligent discovery and community systems.',
      'The vision exists because browser gaming is accessible but often fragmented. Gaming Horizon aims to combine instant access with the polish, identity, and continuity players expect from larger gaming platforms.',
      'The result is intended to be welcoming for casual players, useful on lower-spec devices, and deep enough to support long-term progression, communities, events, and future creator tools.',
    ],
    highlights: ['Browser-first accessibility', 'Premium gaming identity', 'Long-term connected ecosystem'],
  },
  '/platform|Explore the ecosystem in detail': {
    eyebrow: 'Interactive Universe',
    title: 'How the Gaming Horizon universe connects',
    overview: [
      'The Interactive Universe visualizes Gaming Horizon as a connected system rather than a list of independent features. Games sit alongside AI, Community, Leaderboards, Achievements, and Events, with each node contributing to the player journey.',
      'It exists to make the platform architecture understandable at a glance. Visitors can explore how discovering a game may lead to progression, discussion, competition, or a special event without leaving the wider ecosystem.',
      'For players, these connections create continuity. Actions in one area can have meaning elsewhere, helping the platform feel alive and rewarding across many different kinds of play.',
    ],
    highlights: ['Connected feature relationships', 'Interactive platform preview', 'One continuous player journey'],
  },
}

const DETAIL_DESTINATIONS: Record<string, { label: string; href: string }> = {
  '/ai|Know in Detail': { label: 'Explore AI Companion', href: '/ai#ai-companion' },
  '/beta|Explore the Full Beta Program': { label: 'Explore the Public Beta', href: '/beta#beta-program' },
  '/platform|Explore the full ecosystem': { label: 'Explore the Connected Ecosystem', href: '/platform#connected-ecosystem' },
  '/platform|Explore the platform': { label: 'Explore the Player Experience', href: '/platform#player-experience' },
  '/roadmap#development|Open Development Hub': { label: 'Visit the Developer Platform', href: '/roadmap#development' },
  '/faq|Read the full FAQ': { label: 'Read the Full FAQ', href: '/faq#faq' },
  '/games|Explore full library': { label: 'Explore the Games Library', href: '/games#games-library' },
  '/platform|Explore all modules': { label: 'Explore Every Platform Module', href: '/platform#platform-modules' },
  '/roadmap|View detailed roadmap': { label: 'View the Roadmap', href: '/roadmap#timeline' },
  '/vision|Know in Detail': { label: 'Explore the Vision', href: '/vision#vision-overview' },
  '/platform|Explore the ecosystem in detail': { label: 'Explore the Interactive Universe', href: '/#universe' },
}

function getDetailPanelContent(href: string, label: string): DetailPanelContent {
  return DETAIL_PANEL_CONTENT[`${href}|${label}`] ?? {
    eyebrow: 'Gaming Horizon',
    title: label,
    overview: [
      'This feature is part of the connected Gaming Horizon browser gaming ecosystem. It is being designed to feel purposeful, polished, and consistent with the rest of the platform rather than functioning as an isolated page.',
      'Its purpose is to help players move through the experience with less friction, clearer information, and stronger continuity between discovery, play, progression, and community.',
      'As development continues, this area will be connected to real platform data and refined through testing and community feedback.',
    ],
    highlights: ['Purpose-built experience', 'Connected platform design', 'Ready for future backend integration'],
  }
}

export function DetailButton({
  href,
  label = 'Know in Detail',
}: {
  href: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const navigatingRef = useRef(false)
  const content = getDetailPanelContent(href, label)
  const destination = DETAIL_DESTINATIONS[`${href}|${label}`] ?? { label: `Explore ${content.eyebrow}`, href }

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => closeButtonRef.current?.focus(), 40)
    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = previousOverflow
      if (!navigatingRef.current) triggerRef.current?.focus()
    }
  }, [open])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      return
    }
    if (event.key !== 'Tab') return

    const dialog = event.currentTarget.querySelector<HTMLElement>('[role="dialog"]')
    if (!dialog) return
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true')
    if (!focusable.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const navigateToDestination = () => {
    navigatingRef.current = true
    setOpen(false)
    const [destinationPath, destinationHash = ''] = destination.href.split('#')
    const samePage = (destinationPath || '/') === pathname
    const hash = destinationHash ? `#${destinationHash}` : ''
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.setTimeout(() => {
      if (samePage && hash) {
        window.history.pushState(null, '', hash)
        focusHashTarget(hash, reduced ? 'auto' : 'smooth')
      } else {
        router.push(destination.href)
      }
    }, 140)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { navigatingRef.current = false; setOpen(true) }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgb(var(--accent-1)/0.35)] bg-[rgb(var(--accent-1)/0.08)] px-4 py-2 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:bg-[rgb(var(--accent-1)/0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.75)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {label}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </button>

      {mounted && open && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false)
          }}
          onKeyDown={handleKeyDown}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`detail-title-${href.replace(/[^a-z0-9]/gi, '-')}`}
            initial={{ opacity: 0, y: 28, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-white/15 bg-background/96 shadow-2xl backdrop-blur-2xl sm:max-w-3xl sm:rounded-[28px]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background/92 px-5 py-4 backdrop-blur-xl sm:px-7">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]">{content.eyebrow}</p>
                  <p className="text-sm text-muted-foreground">Feature detail</p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close detail panel"
                className="grid size-11 place-items-center rounded-full border border-border/70 bg-background/70 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.75)]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-8 px-5 py-7 sm:px-8 sm:py-9">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[rgb(var(--accent-1))]">Overview</p>
                <h2 id={`detail-title-${href.replace(/[^a-z0-9]/gi, '-')}`} className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                  {content.title}
                </h2>
              </div>

              <div className="space-y-5 text-[15px] leading-7 text-muted-foreground sm:text-base sm:leading-8">
                {content.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>

              <div className="rounded-3xl border border-[rgb(var(--accent-1)/0.2)] bg-[rgb(var(--accent-1)/0.06)] p-5 sm:p-6">
                <p className="mb-4 font-semibold text-foreground">What this brings to players</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {content.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-start gap-2.5 rounded-2xl border border-border/60 bg-background/55 p-3.5 text-sm font-medium">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-border/65 pt-6 sm:flex-row sm:items-center sm:justify-end">
                <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-2xl border border-border/70 bg-background/70 px-5 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:bg-muted/55 hover:text-foreground focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.65)]">
                  Close
                </button>
                <button type="button" onClick={navigateToDestination} className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[rgb(var(--accent-1)/0.32)] bg-[rgb(var(--accent-1)/0.1)] px-5 text-sm font-semibold text-foreground outline-none transition-[transform,background-color,border-color] hover:-translate-y-0.5 hover:border-[rgb(var(--accent-1)/0.52)] hover:bg-[rgb(var(--accent-1)/0.16)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.7)]">
                  {destination.label}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </motion.section>
        </div>,
        document.body,
      )}
    </>
  )
}

/* ---------------- Pill / eyebrow ---------------- */
export function Pill({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.08)] px-3 py-1 text-xs font-medium tracking-wide text-foreground/90',
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ---------------- Reveal on scroll ---------------- */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ---------------- Section heading ---------------- */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  center?: boolean
}) {
  return (
    <div data-interface-copy="true" className={cn('max-w-3xl', center && 'mx-auto text-center')}>
      {eyebrow && (
        <Reveal>
          <Pill className="mb-5">{eyebrow}</Pill>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="font-heading text-section-title text-balance gh-heading-shine">{title}</h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  )
}

/* ---------------- Staggered text reveal (word-by-word) ---------------- */
export function TextReveal({
  text,
  className,
  delay = 0,
  as: Tag = 'span',
}: {
  text: string
  className?: string
  delay?: number
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p'
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const words = text.split(' ')
  const MotionTag = motion[Tag]
  return (
    <MotionTag
      ref={ref}
      className={cn('inline-block', className)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.055, delayChildren: delay } },
      }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: '110%', opacity: 0, filter: 'blur(6px)' },
              show: {
                y: '0%',
                opacity: 1,
                filter: 'blur(0px)',
                transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            {w}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  )
}

/* ---------------- Clip-path reveal ---------------- */
export function ClipReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-70px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
      animate={
        inView
          ? { clipPath: 'inset(0 0% 0 0)', opacity: 1 }
          : { clipPath: 'inset(0 100% 0 0)', opacity: 0 }
      }
      transition={{ duration: 0.7, delay, ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ---------------- Spring-based card entrance + magnetic tilt ---------------- */
export function SpringCard({
  children,
  className,
  delay = 0,
  tilt = true,
}: {
  children: ReactNode
  className?: string
  delay?: number
  tilt?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const rx = useSpring(0, { stiffness: 200, damping: 18 })
  const ry = useSpring(0, { stiffness: 200, damping: 18 })

  const onMove = (e: MouseEvent) => {
    if (!tilt) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * 8)
    rx.set(-py * 8)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 220, damping: 22, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ---------------- Animated counter ---------------- */
export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  className,
}: {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [inView, value])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}
