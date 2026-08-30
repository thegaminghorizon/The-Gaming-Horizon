'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  BrainCircuit,
  Check,
  CircleGauge,
  CircleDot,
  Compass,
  Cookie,
  Gamepad2,
  ImagePlus,
  KeyRound,
  LockKeyhole,
  Monitor,
  MousePointer2,
  Music,
  Orbit,
  Palette,
  PenSquare,
  Moon,
  Pause,
  Play,
  Search,
  Send,
  ShieldCheck,
  Gauge,
  Layers3,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Trophy,
  UserRound,
  Users,
  X,
  ZoomIn,
} from 'lucide-react'
import { Countdown, InlineCountdown } from '@/components/countdown'
import { Logo } from '@/components/ui/logo'
import { GatewayCustomCursor } from '@/components/gateway-custom-cursor'
import {
  DEFAULT_GATEWAY_SETTINGS,
  GATEWAY_ACCENTS,
  GATEWAY_ACCENT_GROUPS,
  GATEWAY_ATMOSPHERES,
  GATEWAY_BACKGROUND_STYLES,
  GATEWAY_CURSORS,
  GATEWAY_UNIVERSE_STYLES,
  useGatewaySettings,
  type GatewayMotionMode,
  type GatewayPerformancePreset,
  type GatewayThemeMode,
  type GatewayUniverseStyle,
} from '@/components/providers/gateway-settings-provider'
import {
  publishGatewayConsentToSite,
  readGatewayConsent,
  writeGatewayConsent,
  type GatewayConsentDraft,
  type GatewayConsentState,
} from '@/lib/gateway-consent'

const SESSION_SKIP_KEY = 'gh_gateway_skip_session'
const BETA_DATE = '2027-01-01T00:01:00+05:30'
const LAUNCH_DATE = '2028-03-01T00:01:00+05:30'

function hasGatewaySessionSkip() {
  try {
    const value = sessionStorage.getItem(SESSION_SKIP_KEY)
    if (value === '1') return true
    if (value !== null) sessionStorage.removeItem(SESSION_SKIP_KEY)
  } catch {
    // Storage-unavailable home visits remain Gateway-first.
  }
  return false
}

function writeGatewaySessionSkip() {
  try {
    sessionStorage.setItem(SESSION_SKIP_KEY, '1')
  } catch {
    // No persistent fallback is used for this session-only preference.
  }
}

function clearGatewaySessionSkip() {
  try {
    sessionStorage.removeItem(SESSION_SKIP_KEY)
  } catch {
    // No persistent fallback is used for this session-only preference.
  }
}


type GatewayView = 'gateway' | 'beta'
type GatewayState = 'checking' | 'open' | 'closed'

const ECOSYSTEM_NODES = [
  { label: 'Games', description: 'Instant browser experiences.', icon: Gamepad2, angle: 0, duration: 48, direction: 1, delay: 0 },
  { label: 'AI Companion', description: 'Discovery shaped around your context.', icon: BrainCircuit, angle: 45, duration: 56, direction: -1, delay: 0.05 },
  { label: 'Discovery', description: 'Find experiences worth returning to.', icon: Compass, angle: 90, duration: 52, direction: 1, delay: 0.1 },
  { label: 'Progress', description: 'Every session remains meaningful.', icon: Trophy, angle: 135, duration: 62, direction: -1, delay: 0.15 },
  { label: 'Identity', description: 'One profile across the complete ecosystem.', icon: UserRound, angle: 180, duration: 54, direction: 1, delay: 0.2 },
  { label: 'Community', description: 'People and play connected.', icon: Users, angle: 225, duration: 60, direction: -1, delay: 0.25 },
  { label: 'Achievements', description: 'Milestones that follow every return.', icon: Sparkles, angle: 270, duration: 50, direction: 1, delay: 0.3 },
  { label: 'Events', description: 'Shared moments, challenges, and future tournaments.', icon: CircleGauge, angle: 315, duration: 58, direction: -1, delay: 0.35 },
] as const

const TOUR_STEPS = [
  {
    label: 'Welcome to Gaming Horizon',
    description: 'A guided walkthrough of every feature on the site and exactly how to use each one — right here in the Entry Gateway, before you even enter.',
    icon: Sparkles,
    howTo: ['Use Next / Back below, or click any dot, to move through the tour at your own pace.'],
  },
  {
    label: 'Create Your Account & Sign In',
    description: 'One player identity unlocks the AI Companion, Music Room, Blog, Design Suggestions, and every saved preference across the site.',
    icon: KeyRound,
    howTo: [
      'Open Sign Up (new player) or Sign In (returning player) from the navigation or account menu.',
      'Fastest option: continue with Google, Discord, or GitHub — one click, no password to remember.',
      'Prefer email? Choose Password or Email OTP. OTP emails you a one-time code instead of using a password at all.',
      'Signing up: add a display name, agree to the Terms and the pre-release notice, complete the human check, then submit.',
      'A verification code is emailed to confirm new accounts — enter it on the next screen to finish and sign in.',
      'Forgot your password? Use "Forgot password?" on the sign-in form to reset it with an emailed code — no reset link involved.',
    ],
  },
  {
    label: 'Player Profile & Account Settings',
    description: 'Your account page holds your identity and preferences: display name, avatar, platforms you play on, favorite genres, and play style.',
    icon: UserRound,
    howTo: [
      'Open the account menu → Account to edit your profile and avatar.',
      'Change your password or email any time — each change is confirmed with a one-time code sent to you first.',
      'Pick which navigation links, the Beta banner, search, and the Customize button show up in your taskbar.',
    ],
  },
  {
    label: 'AI Companion',
    description: 'A conversational recommendation engine that reasons about your mood, time budget, and device — not just keywords you type.',
    icon: BrainCircuit,
    howTo: [
      'Sign in, then open AI from the navigation.',
      'Describe what you want in plain language, e.g. "I have 10 minutes and want something relaxing."',
      'Every suggestion comes with a plain-language reason, so you always know why a game was picked.',
    ],
  },
  {
    label: 'Games Library',
    description: 'Browse the titles being prepared for Public Beta, filtered by how close each one is to launch.',
    icon: Gamepad2,
    howTo: [
      'Open Games and use the filter tabs — All, Browser Ready, Planned for Beta, Under Review.',
      'Join the waitlist from the library to get notified the moment titles go live.',
    ],
  },
  {
    label: 'Music Room',
    description: 'A shared listening room controlled entirely through chat-style slash commands, playing tracks in a queue everyone can hear.',
    icon: Music,
    howTo: [
      'Sign in, then open Music — it\u2019s locked to signed-in players.',
      'Type /play <song name or link> to queue a track from almost any music platform.',
      'Control playback with /pause, /resume, /skip, /previous, /loop, or /volume.',
    ],
  },
  {
    label: 'Community Blog',
    description: 'Read official articles and dev logs from the team, or publish your own post for every player to see.',
    icon: PenSquare,
    howTo: [
      'Sign in, then go to Blog → Create and post.',
      'Write with the rich-text editor — bold, italic, headings, links, and images — and add a cover image and category.',
      'Publish immediately or schedule it for later; scheduled posts stay private to you until they go live.',
      'You\u2019ll confirm the post follows the content guidelines and agree to the Terms before it publishes.',
    ],
  },
  {
    label: 'Design Suggestions Gallery',
    description: 'A public gallery where players share logo concepts, UI mockups, and other design ideas for Gaming Horizon.',
    icon: ImagePlus,
    howTo: [
      'Sign in, then open Suggestions.',
      'Upload an image, add a title, description, category, and an optional reference link, then submit.',
      'Every submission is visible to the whole community right away.',
    ],
  },
  {
    label: 'Game Requests',
    description: 'Tell the team which game you\u2019d like to see added to the library.',
    icon: Send,
    howTo: [
      'Open Game Request from the navigation.',
      'Name the game, optionally add a link and a note, agree to the terms, then send.',
    ],
  },
  {
    label: 'Plans & Pricing Preview',
    description: 'A preview of the subscription tiers being planned for launch, compared side by side — nothing is billed yet.',
    icon: BadgeDollarSign,
    howTo: ['Open Plans from the navigation to compare tiers ahead of Public Beta.'],
  },
  {
    label: 'Quick Search',
    description: 'Jump to any page, game, blog post, or action on the site without leaving the keyboard.',
    icon: Search,
    howTo: [
      'Press Ctrl+K (Cmd+K on Mac) anywhere on the site, or tap the search icon in the navigation.',
      'Start typing to filter pages, games, articles, and settings instantly.',
    ],
  },
  {
    label: 'Gateway Preferences',
    description: 'Personalize this Entry Gateway itself — theme, accent color, background, atmosphere, cursor, motion, and performance. These choices are isolated from the main site.',
    icon: SlidersHorizontal,
    howTo: ['Open Gateway Preferences from the Gateway screen at any time to adjust or reset any of these.'],
  },
  {
    label: 'Accessibility & Privacy',
    description: 'Dedicated controls for reduced motion and interface preferences, plus a clear breakdown of exactly what the Gateway stores and why.',
    icon: Accessibility,
    howTo: ['Open Accessibility Options or Cookie Preferences from this screen or the site footer to review or change what\u2019s stored.'],
  },
] as const

const GATEWAY_PARTICLES = [
  { left: '9%', top: '20%', delay: '-1s', size: 3 },
  { left: '88%', top: '16%', delay: '-5s', size: 4 },
  { left: '14%', top: '76%', delay: '-3s', size: 3 },
  { left: '91%', top: '70%', delay: '-7s', size: 2 },
  { left: '54%', top: '5%', delay: '-4s', size: 3 },
]

function EcosystemVisual({
  reduced,
  simplified,
  performance,
  particlesEnabled,
  paused,
  universeRotation,
  connectorPulses,
  pointerParallax,
  entranceAnimation,
  universeStyle,
}: {
  reduced: boolean
  simplified: boolean
  performance: GatewayPerformancePreset
  particlesEnabled: boolean
  paused: boolean
  universeRotation: boolean
  connectorPulses: boolean
  pointerParallax: boolean
  entranceAnimation: boolean
  universeStyle: GatewayUniverseStyle
}) {
  const [activeNode, setActiveNode] = useState<number | null>(null)
  const [pageVisible, setPageVisible] = useState(true)
  const [coarsePointer, setCoarsePointer] = useState(false)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 55, damping: 24, mass: 0.7 })
  const y = useSpring(rawY, { stiffness: 55, damping: 24, mass: 0.7 })
  const motionActive = !reduced && !paused && performance !== 'battery' && pageVisible
  const orbitActive = motionActive && universeRotation
  const fullMotion = motionActive && !simplified && pointerParallax

  useEffect(() => {
    const pointer = window.matchMedia('(pointer: coarse)')
    const syncPointer = () => setCoarsePointer(pointer.matches)
    const syncVisibility = () => setPageVisible(!document.hidden)
    syncPointer()
    syncVisibility()
    pointer.addEventListener?.('change', syncPointer)
    document.addEventListener('visibilitychange', syncVisibility)
    return () => {
      pointer.removeEventListener?.('change', syncPointer)
      document.removeEventListener('visibilitychange', syncVisibility)
    }
  }, [])

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!fullMotion || coarsePointer) return
    const rect = event.currentTarget.getBoundingClientRect()
    rawX.set(((event.clientX - rect.left) / rect.width - 0.5) * 6)
    rawY.set(((event.clientY - rect.top) / rect.height - 0.5) * 6)
  }

  const resetParallax = () => {
    rawX.set(0)
    rawY.set(0)
  }

  const selected = activeNode === null ? null : ECOSYSTEM_NODES[activeNode]
  const SelectedIcon = selected?.icon ?? Sparkles

  return (
    <div className="mx-auto w-full min-w-0 max-w-[620px] select-none" aria-label="Interactive connected Gaming Horizon ecosystem">
      <div className="gh-gateway-visual-shell relative aspect-square w-full overflow-hidden rounded-[32px] sm:rounded-[36px]">
        <motion.div
          className="gh-gateway-universe absolute inset-0 overflow-hidden rounded-[inherit]"
          style={{ x, y }}
          onPointerMove={onPointerMove}
          onPointerLeave={resetParallax}
          data-running={String(orbitActive)}
          data-universe-style={universeStyle}
          data-coarse={String(coarsePointer)}
        >
        <div aria-hidden className="gh-gateway-ambient absolute inset-[2%] rounded-full" />
        <motion.div aria-hidden className="gh-gateway-ring gh-gateway-ring-outer absolute inset-[8%] rounded-full border border-[rgb(var(--accent-1)/0.2)]" initial={reduced || !entranceAnimation ? false : { opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0.16 : 0.6, delay: reduced ? 0 : 0.16 }} />
        <motion.div aria-hidden className="gh-gateway-ring gh-gateway-ring-mid absolute inset-[17%] rounded-full border border-dashed border-[rgb(var(--accent-2)/0.23)]" initial={reduced || !entranceAnimation ? false : { opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0.16 : 0.66, delay: reduced ? 0 : 0.22 }} />
        <motion.div aria-hidden className="gh-gateway-ring gh-gateway-ring-inner absolute inset-[26%] rounded-full border border-[rgb(var(--accent-3)/0.15)]" initial={reduced || !entranceAnimation ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0.16 : 0.7, delay: reduced ? 0 : 0.27 }} />
        <motion.div aria-hidden className="absolute inset-[30%] rounded-full bg-[radial-gradient(circle,rgb(var(--accent-1)/0.24),rgb(var(--accent-2)/0.1)_46%,transparent_74%)]" initial={reduced || !entranceAnimation ? false : { opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0.16 : 0.72, delay: reduced ? 0 : 0.3 }} />

        {!reduced && particlesEnabled && performance !== 'battery' && GATEWAY_PARTICLES.slice(0, coarsePointer ? 2 : GATEWAY_PARTICLES.length).map((particle, index) => (
          <span key={index} aria-hidden className="gh-gateway-particle absolute rounded-full bg-[rgb(var(--accent-3))]" style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size, animationDelay: particle.delay }} />
        ))}

        <motion.div
          className="gh-gateway-core absolute left-1/2 top-1/2 z-30 grid size-32 place-items-center rounded-[32px] border border-[rgb(var(--accent-1)/0.34)] bg-background/84 shadow-[0_34px_96px_-38px_rgb(var(--accent-1)/0.82)] backdrop-blur-xl sm:size-36"
          style={{ x: '-50%', y: '-50%' }}
          initial={reduced || !entranceAnimation ? false : { opacity: 0, scale: 0.82 }}
          animate={motionActive ? { opacity: 1, scale: simplified ? [1, 1.01, 1] : [1, 1.022, 1] } : { opacity: 1, scale: 1 }}
          transition={motionActive ? { opacity: { duration: 0.5, delay: 0.2 }, scale: { duration: simplified ? 8 : 5.4, repeat: Infinity, ease: 'easeInOut' } } : { duration: reduced ? 0.16 : 0.42 }}
        >
          <Logo className="flex-col gap-1.5 text-center [&_svg]:size-11 [&>span:last-child]:text-xs" />
          <span aria-hidden className="gh-gateway-core-light absolute inset-2 rounded-[26px]" />
        </motion.div>

        {ECOSYSTEM_NODES.map((node, index) => {
          const Icon = node.icon
          const speed = node.duration * (coarsePointer ? 1.5 : performance === 'balanced' ? 1.16 : performance === 'quality' ? 0.92 : 1.6)
          const start = -node.angle
          const end = -(node.angle + node.direction * 360)
          const style = {
            inset: 'var(--gh-orbit-inset)',
            transform: `rotate(${node.angle}deg)`,
            '--orbit-duration': `${speed}s`,
            '--counter-start': `${start}deg`,
            '--counter-end': `${end}deg`,
          } as CSSProperties
          const orbitEnabled = orbitActive && (!simplified || index % 2 === 0) && (!coarsePointer || index % 2 === 0)
          const paused = activeNode === index || !orbitEnabled

          return (
            <motion.div
              key={node.label}
              className="gh-orbit-track pointer-events-none absolute z-10"
              style={style}
              data-paused={String(paused)}
              initial={reduced || !entranceAnimation ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0.16 : 0.4, delay: reduced ? 0 : 0.27 + node.delay }}
            >
              <div className={`gh-orbit-motion absolute inset-0 ${node.direction < 0 ? 'is-reverse' : ''}`}>
                <span aria-hidden className={`gh-gateway-connector absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 -translate-y-full origin-bottom ${activeNode === index ? 'is-active' : ''}`}>
                  {!reduced && connectorPulses && <i className="gh-gateway-energy absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[rgb(var(--accent-3))]" />}
                </span>
                <div className={`gh-orbit-node-frame pointer-events-auto absolute left-1/2 top-0 ${node.direction < 0 ? 'is-reverse' : ''}`} style={{ transform: `translate(-50%, -50%) rotate(${-node.angle}deg)` }}>
                  <button
                    type="button"
                    className="gh-orbit-node-card gh-gateway-node group flex flex-col items-center gap-1.5 rounded-2xl outline-none"
                    onMouseEnter={() => setActiveNode(index)}
                    onMouseLeave={() => setActiveNode(null)}
                    onFocus={() => setActiveNode(index)}
                    onBlur={() => setActiveNode(null)}
                    onClick={() => setActiveNode((current) => current === index ? null : index)}
                    aria-label={`${node.label}. ${node.description}`}
                    aria-describedby="gateway-node-description"
                    aria-pressed={activeNode === index}
                  >
                    <span className="grid size-12 place-items-center rounded-2xl border border-[rgb(var(--accent-1)/0.26)] bg-background/86 text-[rgb(var(--accent-1))] shadow-[0_20px_48px_-28px_rgb(var(--accent-1)/0.82)] backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-200 group-hover:scale-[1.08] group-hover:border-[rgb(var(--accent-1)/0.52)] group-hover:shadow-[0_24px_56px_-26px_rgb(var(--accent-1)/0.92)] group-focus-visible:scale-[1.08] sm:size-14">
                      <Icon className="size-5" />
                    </span>
                    <span className="hidden max-w-[104px] whitespace-nowrap rounded-xl border border-border/65 bg-background/92 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.06em] text-foreground shadow-sm backdrop-blur-md sm:block sm:text-[9px]">
                      {node.label}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
        </motion.div>
      </div>

      <div id="gateway-node-description" aria-live="polite" className="mx-auto mt-3 min-h-[76px] max-w-[430px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected?.label ?? 'default'}
            initial={reduced || !entranceAnimation ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
            className="grid min-h-[76px] grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border border-[rgb(var(--accent-1)/0.2)] bg-background/72 px-4 py-3 text-left shadow-[0_18px_48px_-34px_rgb(var(--accent-1)/0.72)] backdrop-blur-xl"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]">
              <SelectedIcon className="size-4" />
            </span>
            <span>
              <strong className="block text-xs text-foreground">{selected?.label ?? 'Gaming Horizon ecosystem'}</strong>
              <span className="mt-0.5 block text-[11px] leading-5 text-muted-foreground">{selected?.description ?? 'Games, intelligence, identity, progress, and community connected in one browser-first platform.'}</span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

type GatewayPanel = 'privacy' | 'accessibility' | 'cookies' | 'preferences' | 'tour' | null
type GatewayPreferenceCategory = 'menu' | 'appearanceMode' | 'accent' | 'background' | 'atmosphere' | 'cursor' | 'motion' | 'performance' | 'universe'
type ConsentScreen = 'summary' | 'customize'

const GATEWAY_PREFERENCE_CATEGORIES = [
  { key: 'appearanceMode', label: 'Appearance Mode', description: 'Light, Dark, or System', icon: Monitor },
  { key: 'accent', label: 'Accent Color', description: 'A curated Gateway-only color system', icon: Palette },
  { key: 'background', label: 'Background Style', description: 'Pattern, grid, and surface structure', icon: Layers3 },
  { key: 'atmosphere', label: 'Atmosphere', description: 'Ambient mood, lighting, and glow', icon: Sparkles },
  { key: 'cursor', label: 'Cursor', description: 'Gateway-only pointer styles', icon: MousePointer2 },
  { key: 'motion', label: 'Motion', description: 'Animation level and individual effects', icon: Orbit },
  { key: 'performance', label: 'Performance', description: 'Quality, Balanced, or Battery Saver', icon: Gauge },
  { key: 'universe', label: 'Universe Style', description: 'Visual treatment of the connected ecosystem', icon: CircleDot },
] as const

const ESSENTIAL_ONLY: GatewayConsentDraft = {
  appearancePreferences: false,
  motionPerformancePreferences: false,
  cursorInterfacePreferences: false,
  sessionConvenience: false,
}

const ACCEPT_ALL: GatewayConsentDraft = {
  appearancePreferences: true,
  motionPerformancePreferences: true,
  cursorInterfacePreferences: true,
  sessionConvenience: true,
}

function consentToDraft(consent: GatewayConsentState | null): GatewayConsentDraft {
  return consent
    ? {
        appearancePreferences: consent.appearancePreferences,
        motionPerformancePreferences: consent.motionPerformancePreferences,
        cursorInterfacePreferences: consent.cursorInterfacePreferences,
        sessionConvenience: consent.sessionConvenience,
      }
    : ESSENTIAL_ONLY
}

export interface EntryGatewayCallbacks {
  onEnter?: () => void
  onOpenBeta?: () => void
  onJoinWaitlist?: () => void
  onLearnBeta?: () => void
  onStateChange?: (open: boolean) => void
  onSiteReady?: () => void
  onConsentChange?: (consent: GatewayConsentState) => void
}

export function LoadingScreen({
  reopenRequest,
  onEnter,
  onOpenBeta,
  onJoinWaitlist,
  onLearnBeta,
  onStateChange,
  onSiteReady,
  onConsentChange,
}: EntryGatewayCallbacks & { reopenRequest?: { id: number } }) {
  const pathname = usePathname()
  const systemReducedMotion = useReducedMotion()
  const { settings, update, reset, resetCategory, ready: gatewaySettingsReady, resolvedTheme, scopeStyle } = useGatewaySettings()
  const staticMotion = Boolean(systemReducedMotion) || settings.motionMode === 'off'
  const simplifiedMotion = !systemReducedMotion && settings.motionMode === 'reduced'
  const reduced = Boolean(systemReducedMotion) || settings.motionMode !== 'full'
  const [state, setState] = useState<GatewayState>('checking')
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<GatewayView>('gateway')
  const [panel, setPanel] = useState<GatewayPanel>(null)
  const [preferenceCategory, setPreferenceCategory] = useState<GatewayPreferenceCategory>('menu')
  const [consentScreen, setConsentScreen] = useState<ConsentScreen>('summary')
  const [consentRequired, setConsentRequired] = useState(false)
  const [consent, setConsent] = useState<GatewayConsentState | null>(null)
  const [consentDraft, setConsentDraft] = useState<GatewayConsentDraft>(ESSENTIAL_ONLY)
  const [remember, setRemember] = useState(true)
  const [animationPaused, setAnimationPaused] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const gatewayRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelOpenerRef = useRef<HTMLElement | null>(null)
  const afterCloseRef = useRef<(() => void) | null>(null)
  const homepageClosedForCurrentViewRef = useRef(false)
  const initialGatewayDecisionRef = useRef(false)
  // In-memory only: once the visitor is inside the landing website, ordinary
  // website navigation (including Home) must not reopen the Entry Gateway.
  // A full reload creates a new page instance and evaluates the Gateway again.
  const websiteSessionActiveRef = useRef(false)
  const scrollLockRef = useRef<{
    scrollY: number
    htmlOverflow: string
    htmlOverscroll: string
    bodyOverflow: string
    bodyPosition: string
    bodyTop: string
    bodyLeft: string
    bodyRight: string
    bodyWidth: string
  } | null>(null)

  useEffect(() => {
    setMounted(true)
    const storedConsent = readGatewayConsent()
    setConsent(storedConsent)
    setConsentDraft(consentToDraft(storedConsent))
    setRemember(true)
  }, [])

  const setSiteIsolation = useCallback((isolated: boolean) => {
    const layer = document.querySelector<HTMLElement>('[data-gh-site-layer]')
    if (!layer) return
    if (isolated) {
      layer.setAttribute('aria-hidden', 'true')
      layer.setAttribute('inert', '')
    } else {
      layer.removeAttribute('aria-hidden')
      layer.removeAttribute('inert')
    }
  }, [])

  const lockDocument = useCallback(() => {
    if (scrollLockRef.current) return
    const html = document.documentElement
    const body = document.body
    const scrollY = window.scrollY
    scrollLockRef.current = {
      scrollY,
      htmlOverflow: html.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
    }
    html.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
  }, [])

  const unlockDocument = useCallback(() => {
    const previous = scrollLockRef.current
    if (!previous) return
    const html = document.documentElement
    const body = document.body
    html.style.overflow = previous.htmlOverflow
    html.style.overscrollBehavior = previous.htmlOverscroll
    body.style.overflow = previous.bodyOverflow
    body.style.position = previous.bodyPosition
    body.style.top = previous.bodyTop
    body.style.left = previous.bodyLeft
    body.style.right = previous.bodyRight
    body.style.width = previous.bodyWidth
    scrollLockRef.current = null
    window.scrollTo(0, previous.scrollY)
  }, [])

  useEffect(() => {
    if (!reopenRequest?.id || !mounted) return
    const storedConsent = readGatewayConsent()
    onStateChange?.(true)
    homepageClosedForCurrentViewRef.current = false
    document.documentElement.setAttribute('data-gateway-state', 'open')
    document.documentElement.removeAttribute('data-gateway-hydrated')
    document.documentElement.setAttribute('data-gh-gateway', 'show')
    setSiteIsolation(true)
    lockDocument()
    setView('gateway')
    setConsent(storedConsent)
    setConsentDraft(consentToDraft(storedConsent))
    setRemember(true)
    if (!storedConsent) {
      setConsentRequired(true)
      setConsentScreen('summary')
      setPanel('cookies')
    } else {
      setConsentRequired(false)
      setPanel(null)
    }
    setState('open')
    window.setTimeout(() => storedConsent ? primaryRef.current?.focus() : panelRef.current?.querySelector<HTMLElement>('button,[href],input')?.focus(), 40)
  }, [lockDocument, mounted, onStateChange, reopenRequest, setSiteIsolation])


  useEffect(() => {
    const syncVisibility = () => document.documentElement.setAttribute('data-gh-page-visible', String(!document.hidden))
    syncVisibility()
    document.addEventListener('visibilitychange', syncVisibility)
    return () => {
      document.removeEventListener('visibilitychange', syncVisibility)
      document.documentElement.removeAttribute('data-gh-page-visible')
    }
  }, [])

  useEffect(() => {
    let shouldOpen = false
    let storedConsent: GatewayConsentState | null = null
    const isInitialDecision = !initialGatewayDecisionRef.current
    // Direct deep routes belong to the landing website. Once any website route
    // is active, returning Home in this page instance stays inside the website.
    if (pathname !== '/') {
      homepageClosedForCurrentViewRef.current = false
      websiteSessionActiveRef.current = true
    }
    try {
      storedConsent = readGatewayConsent()
      const preHydrationState = document.documentElement.getAttribute('data-gateway-state')
      shouldOpen = pathname === '/' && !websiteSessionActiveRef.current && !homepageClosedForCurrentViewRef.current && !hasGatewaySessionSkip()
      // Honor one-page first-paint bypasses only for the initial route. A later
      // client-side return to / is a new homepage view, not a persistent skip.
      if (isInitialDecision && preHydrationState === 'dismissed') shouldOpen = false
    } catch {
      shouldOpen = pathname === '/' && !websiteSessionActiveRef.current && !homepageClosedForCurrentViewRef.current
    }
    initialGatewayDecisionRef.current = true

    if (shouldOpen) {
      onStateChange?.(true)
      document.documentElement.setAttribute('data-gateway-state', 'open')
      document.documentElement.removeAttribute('data-gateway-hydrated')
      document.documentElement.setAttribute('data-gh-gateway', 'show')
      setSiteIsolation(true)
      lockDocument()
      setView(window.location.hash === '#beta-preview' ? 'beta' : 'gateway')
      setState('open')
      setConsent(storedConsent)
      setConsentDraft(consentToDraft(storedConsent))
      setRemember(true)
      if (!storedConsent) {
        setConsentRequired(true)
        setConsentScreen('summary')
        setPanel('cookies')
      }
      window.setTimeout(() => {
        if (!storedConsent) panelRef.current?.querySelector<HTMLElement>('button,[href],input')?.focus()
        else primaryRef.current?.focus()
      }, 50)
    } else {
      onStateChange?.(false)
      document.documentElement.setAttribute('data-gateway-state', 'dismissed')
      document.documentElement.removeAttribute('data-gateway-hydrated')
      document.documentElement.removeAttribute('data-gh-gateway')
      setSiteIsolation(false)
      unlockDocument()
      setState('closed')
      // Signal only after the Gateway decision has completed and the public site
      // can be rendered. This is intentionally separate from application mount.
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => onSiteReady?.()))
    }

    return () => {
      setSiteIsolation(false)
      unlockDocument()
    }
  }, [lockDocument, onSiteReady, onStateChange, pathname, setSiteIsolation, unlockDocument])

  const closePanel = useCallback(() => {
    if (panel === 'cookies' && consentRequired) return
    setPanel(null)
    setPreferenceCategory('menu')
    setConsentScreen('summary')
    const opener = panelOpenerRef.current
    panelOpenerRef.current = null
    window.setTimeout(() => (opener ?? primaryRef.current)?.focus(), 30)
  }, [consentRequired, panel])

  const openPanel = useCallback((next: Exclude<GatewayPanel, null>, opener?: HTMLElement | null, screen: ConsentScreen = 'summary') => {
    panelOpenerRef.current = opener ?? document.activeElement as HTMLElement | null
    setConsentDraft(consentToDraft(consent))
    setConsentScreen(screen)
    if (next === 'preferences') setPreferenceCategory('menu')
    if (next === 'tour') setTourStep(0)
    setPanel(next)
  }, [consent])

  useEffect(() => {
    if (!panel) return
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('button:not([disabled]),input:not([disabled]),[href],[tabindex]:not([tabindex="-1"])')?.focus()
    }, 30)
    return () => window.clearTimeout(timer)
  }, [panel, consentScreen])

  useEffect(() => {
    if (state !== 'open') return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (panel) {
          if (panel === 'cookies' && consentRequired) return
          event.preventDefault()
          closePanel()
          return
        }
        if (view === 'beta') {
          event.preventDefault()
          if (window.location.hash === '#beta-preview') window.history.back()
          else setView('gateway')
          window.setTimeout(() => primaryRef.current?.focus(), 20)
          return
        }
      }

      if (!panel && view === 'gateway' && consent && event.key.toLowerCase() === 'e' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null
        if (!target?.closest('input, textarea, select, [contenteditable="true"]')) {
          event.preventDefault()
          enterSite()
          return
        }
      }

      if (event.key !== 'Tab') return
      const trap = panel ? panelRef.current : gatewayRef.current
      if (!trap) return
      const focusable = Array.from(trap.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])'))
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
    const onPopState = () => setView(window.location.hash === '#beta-preview' ? 'beta' : 'gateway')
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('popstate', onPopState)
    }
  }, [closePanel, consentRequired, panel, remember, state, view])

  const applyConsent = (draft: GatewayConsentDraft) => {
    const saved = writeGatewayConsent(draft)
    setConsent(saved)
    onConsentChange?.(saved)
    setConsentDraft(consentToDraft(saved))
    setConsentRequired(false)
    setPanel(null)
    setPreferenceCategory('menu')
    setConsentScreen('summary')
    window.setTimeout(() => primaryRef.current?.focus(), 30)
  }

  const closeGateway = (after?: () => void) => {
    websiteSessionActiveRef.current = true
    homepageClosedForCurrentViewRef.current = pathname === '/'
    // Closing the Gateway and skipping it for the browser session are separate
    // decisions. Only an explicitly enabled Skip control creates session state.
    if (remember) writeGatewaySessionSkip()
    publishGatewayConsentToSite(consent)
    afterCloseRef.current = after ?? null
    setState('closed')
  }

  const finishClose = () => {
    // AnimatePresence calls this only after the opaque Gateway has unmounted.
    // Reveal the website in one atomic state change; never expose both layers.
    document.documentElement.setAttribute('data-gateway-state', 'dismissed')
    document.documentElement.removeAttribute('data-gateway-hydrated')
    document.documentElement.removeAttribute('data-gh-gateway')
    setSiteIsolation(false)
    unlockDocument()
    onStateChange?.(false)
    if (window.location.hash === '#beta-preview') {
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`)
    }
    const action = afterCloseRef.current
    afterCloseRef.current = null
    action?.()
  }

  const openBetaView = () => {
    onOpenBeta?.()
    if (window.location.hash !== '#beta-preview') {
      window.history.pushState({ ...(window.history.state ?? {}), ghGatewayView: 'beta' }, '', '#beta-preview')
    }
    setView('beta')
  }

  const returnToGateway = () => {
    if (window.location.hash === '#beta-preview') window.history.back()
    else setView('gateway')
  }

  const enterSite = () => closeGateway(() => {
    onEnter?.()
    const main = document.querySelector<HTMLElement>('main')
    if (!main) return
    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1')
    main.focus({ preventScroll: true })
  })
  const joinWaitlist = () => closeGateway(onJoinWaitlist)
  const learnBeta = () => closeGateway(onLearnBeta)
  const selectedGrid = settings.gridVisibility > 0 && ['softGrid', 'fadedGrid'].includes(settings.backgroundStyle)

  useEffect(() => {
    if (!mounted || !gatewaySettingsReady || state !== 'open') return
    // Keep the server-rendered opaque shell until the real portal has committed.
    // The next frame hides only the shell; the main site remains isolated.
    const frame = window.requestAnimationFrame(() => {
      if (gatewayRef.current) document.documentElement.setAttribute('data-gateway-hydrated', 'true')
    })
    return () => window.cancelAnimationFrame(frame)
  }, [gatewaySettingsReady, mounted, state])

  if (!mounted || !gatewaySettingsReady) return null

  return createPortal(
    <AnimatePresence onExitComplete={finishClose}>
      {state !== 'closed' && (
        <motion.section
          ref={gatewayRef}
          className={`gh-entry-gateway ${resolvedTheme} fixed inset-0 z-[2147483000] h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-background text-foreground`}
          data-gateway-theme={resolvedTheme}
          data-theme={resolvedTheme}
          data-background={settings.backgroundStyle}
          data-gateway-background={settings.backgroundStyle}
          data-atmosphere={settings.atmosphere}
          data-gateway-atmosphere={settings.atmosphere}
          data-grid={settings.gridVisibility > 0 ? 'on' : 'off'}
          data-motion={settings.motionMode}
          data-ambient-motion={String(settings.universeRotation)}
          data-connector-pulses={String(settings.connectorPulses)}
          data-pointer-parallax={String(settings.pointerParallax)}
          data-entrance-animation={String(settings.entranceAnimation)}
          data-universe-style={settings.universeStyle}
          data-perf={settings.performance}
          style={scopeStyle}
          aria-label="Gaming Horizon entry gateway"
          aria-modal="true"
          role="dialog"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0 }}
        >
          <div aria-hidden className="absolute inset-0 bg-background" />
          <div aria-hidden className="gh-atmosphere-layer absolute inset-0" style={{ background: 'var(--gh-atmosphere-image)', opacity: 'var(--atmosphere-strength)' }} />
          <div aria-hidden className="gh-gateway-background-style absolute inset-0" data-style={settings.backgroundStyle} />
          {selectedGrid && <div aria-hidden className="gh-selected-grid grid-lines absolute inset-0" data-style={settings.backgroundStyle} style={{ opacity: settings.gridVisibility * (settings.backgroundStyle === 'fadedGrid' ? 0.48 : 0.68) }} />}
          <div aria-hidden className="gh-gateway-bg-drift pointer-events-none absolute -inset-[4%] bg-[radial-gradient(66%_72%_at_72%_48%,rgb(var(--accent-2)/0.13),transparent_72%),radial-gradient(58%_58%_at_12%_12%,rgb(var(--accent-1)/0.09),transparent_72%)]" />

          <div
            className={`gh-gateway-scroll absolute inset-0 z-10 overflow-x-hidden overflow-y-auto overscroll-contain ${panel ? 'pointer-events-none' : ''}`}
            aria-hidden={panel ? true : undefined}
            inert={panel ? true : undefined}
          >
            <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1480px] flex-col px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
              <motion.header className="flex items-center justify-between gap-4" initial={reduced || !settings.entranceAnimation ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0.16 : 0.34 }}>
                <Logo />
                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/58 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-xl">
                  <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgb(16_185_129/0.1)]" /> Platform in active development
                </span>
              </motion.header>

              <AnimatePresence mode="wait" initial={false}>
                {view === 'gateway' ? (
                  <motion.div key="gateway" className="grid min-w-0 flex-1 items-center gap-10 py-8 min-[880px]:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] min-[880px]:gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:gap-12" initial={reduced || !settings.entranceAnimation ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: reduced ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}>
                    <div className="min-w-0 max-w-2xl lg:pr-4">
                      <motion.p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[rgb(var(--accent-1))]" initial={reduced || !settings.entranceAnimation ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.32, delay: 0.04 }}>A connected browser-gaming universe</motion.p>
                      <motion.h1 className="mt-5 font-heading text-balance text-5xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl" initial={reduced || !settings.entranceAnimation ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.44, delay: 0.09 }}>
                        Choose your <span className="bg-gradient-to-r from-[rgb(var(--accent-1))] via-[rgb(var(--accent-2))] to-[rgb(var(--accent-3))] bg-clip-text text-transparent">Horizon.</span>
                      </motion.h1>
                      <motion.p className="mt-6 max-w-xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg" initial={reduced || !settings.entranceAnimation ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.38, delay: 0.14 }}>
                        Explore the public Gaming Horizon announcement site, or preview the locked portal being prepared for the future Public Beta.
                      </motion.p>

                      <motion.div className="mt-8 flex flex-col gap-3 sm:flex-row" initial={reduced || !settings.entranceAnimation ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.38, delay: 0.2 }}>
                        <button ref={primaryRef} type="button" onClick={enterSite} className="gh-interactive gh-gateway-primary group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-bold text-white shadow-[0_18px_48px_-24px_rgb(var(--accent-1)/0.8)] outline-none">
                          Enter Gaming Horizon <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 group-active:translate-x-0.5" />
                        </button>
                        <button type="button" onClick={openBetaView} className="gh-interactive gh-gateway-secondary grid min-h-14 grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border border-border/75 bg-background/68 px-4 text-left text-foreground shadow-sm outline-none backdrop-blur-xl">
                          <span className="gh-gateway-lock grid size-9 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.09)] text-[rgb(var(--accent-1))]"><LockKeyhole className="size-4" /></span>
                          <span className="min-w-0"><span className="block text-sm font-bold">Open Beta Platform</span><span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">Opens January 1, 2027</span></span>
                        </button>
                      </motion.div>

                      <motion.div className="mt-4 rounded-2xl border border-border/60 bg-background/48 px-4 py-3" initial={reduced || !settings.entranceAnimation ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0.16 : 0.32, delay: reduced ? 0 : 0.25 }}>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                          <span><strong className="text-foreground">Platform in active development</strong></span>
                          <span><strong className="text-foreground">Public Beta</strong> · Jan 1, 2027 · 12:01 AM IST</span>
                          <span><strong className="text-foreground">Official Launch</strong> · Mar 1, 2028 · 12:01 AM IST</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[10px] text-muted-foreground"><span className="inline-flex items-center gap-2">Beta opens in <InlineCountdown target={BETA_DATE} /></span><span className="inline-flex items-center gap-2">Launch in <InlineCountdown target={LAUNCH_DATE} accent="rgb(var(--accent-2))" /></span></div>
                      </motion.div>

                      <motion.div
                        className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[rgb(var(--accent-1)/0.28)] bg-[rgb(var(--accent-1)/0.06)] px-4 py-3 backdrop-blur-xl"
                        initial={reduced || !settings.entranceAnimation ? false : { opacity: 0, y: 7 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: reduced ? 0.16 : 0.32, delay: reduced ? 0 : 0.28 }}
                      >
                        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                          <ZoomIn className="size-3.5" />
                        </span>
                        <p className="text-xs leading-5 text-muted-foreground">
                          <strong className="font-semibold text-foreground">Tip:</strong> Gaming Horizon looks best zoomed out. Set your browser&apos;s zoom to 80% for a better viewing experience.
                        </p>
                      </motion.div>

                      <motion.div className="mt-4 flex flex-wrap items-center gap-2" initial={reduced || !settings.entranceAnimation ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0.16 : 0.32, delay: reduced ? 0 : 0.27 }}>
                        <button type="button" onClick={(event) => openPanel('tour', event.currentTarget)} className="gh-interactive gh-gateway-secondary inline-flex min-h-10 items-center gap-2 rounded-xl border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.08)] px-3 text-xs font-semibold text-[rgb(var(--accent-1))] outline-none"><Compass className="size-4" /> Feature Tour</button>
                        <button type="button" onClick={(event) => openPanel('preferences', event.currentTarget)} className="gh-interactive gh-gateway-secondary inline-flex min-h-10 items-center gap-2 rounded-xl border border-border/65 bg-background/55 px-3 text-xs font-semibold outline-none"><SlidersHorizontal className="size-4 text-[rgb(var(--accent-1))]" /> Gateway Preferences</button>
                        <button type="button" onClick={() => setAnimationPaused((value) => !value)} aria-pressed={animationPaused} className="gh-interactive gh-gateway-secondary inline-flex min-h-10 items-center gap-2 rounded-xl border border-border/65 bg-background/55 px-3 text-xs font-semibold outline-none">{animationPaused ? <Play className="size-4" /> : <Pause className="size-4" />}{animationPaused ? 'Resume animation' : 'Pause animation'}</button>
                        <button type="button" onClick={() => update('motionMode', settings.motionMode === 'off' ? 'full' : 'off')} className="gh-interactive gh-gateway-secondary inline-flex min-h-10 items-center gap-2 rounded-xl border border-border/65 bg-background/55 px-3 text-xs font-semibold outline-none">Motion: {settings.motionMode === 'off' ? 'Off' : settings.motionMode === 'reduced' ? 'Reduced' : 'Full'}</button>
                        <span className="text-[10px] text-muted-foreground">Keyboard: press E to enter</span>
                      </motion.div>

                      <motion.label className="mt-4 inline-flex cursor-pointer items-center gap-3 rounded-xl border border-border/55 bg-background/42 px-3 py-2 text-xs text-muted-foreground" initial={reduced || !settings.entranceAnimation ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0.16 : 0.32, delay: reduced ? 0 : 0.29 }}>
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={(event) => {
                            const enabled = event.target.checked
                            setRemember(enabled)
                            if (!enabled) clearGatewaySessionSkip()
                          }}
                          className="peer sr-only"
                        />
                        <span aria-hidden className="relative h-6 w-11 rounded-full border border-border/75 bg-muted/75 shadow-inner transition-colors duration-200 peer-checked:border-[rgb(var(--accent-1)/0.4)] peer-checked:bg-[rgb(var(--accent-1)/0.18)] peer-focus-visible:ring-2 peer-focus-visible:ring-[rgb(var(--accent-1)/0.65)] peer-focus-visible:ring-offset-2">
                          <span className={`absolute left-0.5 top-0.5 size-[18px] rounded-full bg-background shadow-sm transition-transform duration-200 ${remember ? 'translate-x-5' : 'translate-x-0'}`} />
                        </span>
                        <span>Skip this gateway for this session</span>
                      </motion.label>
                    </div>

                    <EcosystemVisual reduced={staticMotion} simplified={simplifiedMotion} performance={settings.performance} particlesEnabled={settings.ambientParticles} paused={animationPaused} universeRotation={settings.universeRotation} connectorPulses={settings.connectorPulses} pointerParallax={settings.pointerParallax} entranceAnimation={settings.entranceAnimation} universeStyle={settings.universeStyle} />
                  </motion.div>
                ) : (
                  <motion.div key="beta" className="mx-auto flex w-full max-w-5xl flex-1 items-center py-10" initial={reduced || !settings.entranceAnimation ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18 }} transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}>
                    <div className="w-full overflow-hidden rounded-[34px] border border-[rgb(var(--accent-1)/0.24)] bg-background/76 p-5 shadow-[0_34px_100px_-48px_rgb(var(--accent-1)/0.75)] backdrop-blur-2xl sm:p-8 lg:p-10">
                      <button type="button" onClick={returnToGateway} className="gh-interactive gh-gateway-secondary inline-flex min-h-10 items-center gap-2 rounded-xl border border-border/70 px-3 text-xs font-semibold text-muted-foreground outline-none"><ArrowLeft className="size-4" /> Return to Gateway</button>
                      <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                        <div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--accent-1)/0.22)] bg-[rgb(var(--accent-1)/0.08)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]"><LockKeyhole className="size-3.5" /> Public Beta</span>
                          <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight sm:text-5xl">Public Beta Access Is Currently Closed.</h2>
                          <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">The Beta Platform opens on January 1, 2027 at 12:01 AM IST. Until then, the portal remains locked while the core experience is developed, tested, and refined.</p>
                          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                            {['Early browser-game discovery and instant-play foundations', 'Persistent identity, progression, and community previews', 'No unfinished login, payment, or account-upgrade controls'].map((item) => <p key={item} className="flex items-center gap-2"><Check className="size-4 text-[rgb(var(--accent-1))]" /> {item}</p>)}
                          </div>
                        </div>
                        <div className="rounded-3xl border border-border/70 bg-background/62 p-4 sm:p-6">
                          <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Opens January 1, 2027 · 12:01 AM IST</p>
                          <Countdown target={BETA_DATE} variant="beta" size="sm" className="mt-5" />
                        </div>
                      </div>
                      <div className="mt-8 flex flex-col gap-3 border-t border-border/65 pt-6 sm:flex-row sm:justify-end">
                        <button type="button" onClick={joinWaitlist} className="gh-interactive gh-gateway-primary group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold text-white outline-none">Join the Waitlist <ArrowRight className="size-4" /></button>
                        <button type="button" onClick={learnBeta} className="gh-interactive gh-gateway-secondary inline-flex min-h-12 items-center justify-center rounded-2xl border border-border/70 bg-background/65 px-5 text-sm font-bold text-foreground outline-none">Learn About the Public Beta</button>
                        <button type="button" onClick={returnToGateway} className="gh-interactive gh-gateway-secondary inline-flex min-h-12 items-center justify-center rounded-2xl border border-border/70 px-5 text-sm font-bold text-muted-foreground outline-none">Return to Gateway</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.footer className="mt-auto flex flex-col gap-3 border-t border-border/55 py-4 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between" initial={reduced || !settings.entranceAnimation ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0.16 : 0.3, delay: reduced ? 0 : 0.3 }}>
                <span>Gaming Horizon · Building the premium home of browser gaming.</span>
                <nav aria-label="Gateway utility links" className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <button type="button" onClick={(event) => openPanel('tour', event.currentTarget)} className="gh-gateway-link font-semibold focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.65)]">Feature Tour</button>
                  <button type="button" onClick={(event) => openPanel('privacy', event.currentTarget)} className="gh-gateway-link font-semibold focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.65)]">Privacy</button>
                  <button type="button" onClick={(event) => openPanel('accessibility', event.currentTarget)} className="gh-gateway-link font-semibold focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.65)]">Accessibility</button>
                  <button type="button" onClick={(event) => openPanel('cookies', event.currentTarget, 'customize')} className="gh-gateway-link font-semibold focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.65)]">Cookie Preferences</button>
                  <button type="button" onClick={(event) => openPanel('preferences', event.currentTarget)} className="gh-gateway-link font-semibold focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.65)]">Preferences</button>
                  <button type="button" onClick={enterSite} className="gh-gateway-link font-semibold text-[rgb(var(--accent-1))] underline underline-offset-4 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.65)]">Continue to Website</button>
                </nav>
              </motion.footer>
            </div>
          </div>

          <AnimatePresence>
            {panel && (
              <div className="gh-gateway-panel-layer absolute inset-0 z-50 grid place-items-center overflow-y-auto bg-background/72" role="presentation">
                <motion.div
                  ref={panelRef}
                  data-selectable-content="true" className="relative my-auto w-full max-w-2xl overflow-hidden rounded-[30px] border border-[rgb(var(--accent-1)/0.22)] bg-background/96 shadow-[0_32px_100px_-36px_rgb(var(--accent-1)/0.45)] backdrop-blur-2xl"
                  initial={reduced || !settings.entranceAnimation ? false : { opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: reduced ? 0.12 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={`gateway-${panel}-title`}
                >
                  {panel !== 'preferences' && !(panel === 'cookies' && consentRequired) && (
                    <button
                      type="button"
                      onClick={closePanel}
                      className="gh-interactive gh-gateway-secondary absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-xl border border-border/65 bg-background/75 outline-none"
                      aria-label="Close panel"
                    ><X className="size-4" /></button>
                  )}

                  {panel === 'preferences' && (
                    <div className="gh-gateway-preferences-scroll max-h-[min(86dvh,780px)] overflow-y-auto">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="gh-gateway-preferences-icon grid size-11 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]"><SlidersHorizontal className="size-5" /></span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]">Independent Entry Gateway settings</p>
                            <h2 id="gateway-preferences-title" className="mt-1 font-heading text-2xl font-bold">Customize Gateway</h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">These preferences affect only this Entry Gateway. The public Gaming Horizon website keeps its own appearance settings.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={closePanel}
                          className="gh-interactive relative z-20 grid size-10 shrink-0 place-items-center rounded-full border border-border/70 bg-background/72 text-foreground shadow-[0_12px_32px_-18px_rgb(var(--accent-1)/0.8)] outline-none backdrop-blur-xl transition-[transform,background-color,border-color,box-shadow] duration-150 hover:border-[rgb(var(--accent-1)/0.48)] hover:bg-[rgb(var(--accent-1)/0.12)] hover:shadow-[0_16px_36px_-18px_rgb(var(--accent-1)/0.9)] active:scale-95 active:bg-[rgb(var(--accent-1)/0.18)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.72)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          aria-label="Close Gateway customization"
                        >
                          <X aria-hidden className="size-[18px] stroke-[2.25]" />
                        </button>
                      </div>

                      {preferenceCategory === 'menu' ? (
                        <div className="mt-7">
                          <p className="text-sm font-bold text-foreground">What would you like to customize?</p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {GATEWAY_PREFERENCE_CATEGORIES.map((category) => {
                              const Icon = category.icon
                              return (
                                <button key={category.key} type="button" onClick={() => setPreferenceCategory(category.key)} className="gh-interactive gh-gateway-secondary group grid min-h-[82px] grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-border/70 bg-background/58 px-4 py-3 text-left outline-none">
                                  <span className="grid size-10 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]"><Icon className="size-4" /></span>
                                  <span><span className="block text-sm font-bold text-foreground">{category.label}</span><span className="mt-1 block text-[11px] leading-4 text-muted-foreground">{category.description}</span></span>
                                  <ArrowRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-7">
                          <button type="button" onClick={() => setPreferenceCategory('menu')} className="gh-interactive gh-gateway-secondary inline-flex min-h-10 items-center gap-2 rounded-xl border border-border/70 px-3 text-xs font-bold outline-none"><ArrowLeft className="size-4" /> Back to categories</button>
                          <div className="mt-5">
                            <h3 className="font-heading text-xl font-bold">{GATEWAY_PREFERENCE_CATEGORIES.find((item) => item.key === preferenceCategory)?.label}</h3>

                            {preferenceCategory === 'appearanceMode' && (
                              <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Gateway appearance mode">
                                {([['light', Sun, 'Light'], ['dark', Moon, 'Dark'], ['system', Monitor, 'System']] as const).map(([mode, Icon, label]) => (
                                  <button key={mode} type="button" role="radio" aria-checked={settings.theme === mode} onClick={() => update('theme', mode as GatewayThemeMode)} className={`gh-interactive gh-gateway-secondary flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold outline-none ${settings.theme === mode ? 'border-[rgb(var(--accent-1)/0.55)] bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]' : 'border-border/65 bg-background/55'}`}><Icon className="size-4" />{label}</button>
                                ))}
                              </div>
                            )}

                            {preferenceCategory === 'accent' && (
                              <div className="mt-4 space-y-5">
                                <div className="rounded-2xl border border-[rgb(var(--accent-1)/0.24)] bg-background/55 p-3" aria-label={`Live preview of ${GATEWAY_ACCENTS[settings.accent].label}`}>
                                  <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Gateway live preview</p><p className="mt-1 bg-gradient-to-r from-[rgb(var(--accent-1))] via-[rgb(var(--accent-2))] to-[rgb(var(--accent-3))] bg-clip-text text-sm font-black text-transparent">Gaming Horizon</p></div><span className="size-10 rounded-xl border border-white/35 shadow-sm" style={{ background: `linear-gradient(135deg,rgb(${GATEWAY_ACCENTS[settings.accent].a1}),rgb(${GATEWAY_ACCENTS[settings.accent].a2}),rgb(${GATEWAY_ACCENTS[settings.accent].a3}))` }} /></div>
                                </div>
                                {GATEWAY_ACCENT_GROUPS.map((group) => (
                                  <fieldset key={group.key}>
                                    <legend className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{group.label}</legend>
                                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                      {group.accents.map((accentKey) => {
                                        const accent = GATEWAY_ACCENTS[accentKey]
                                        return <button key={accentKey} type="button" aria-pressed={settings.accent === accentKey} onClick={() => update('accent', accentKey)} className={`gh-interactive gh-gateway-secondary grid min-h-14 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border px-3 py-2 text-left outline-none ${settings.accent === accentKey ? 'border-[rgb(var(--accent-1)/0.55)] bg-[rgb(var(--accent-1)/0.1)]' : 'border-border/65 bg-background/55'}`}><span className="size-6 shrink-0 rounded-full border border-white/35 shadow-sm" style={{ background: `linear-gradient(135deg,rgb(${accent.a1}),rgb(${accent.a3}))` }} /><span><span className="block text-xs font-bold leading-4">{accent.label}</span><span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">{accent.description}</span></span>{settings.accent === accentKey && <Check className="size-4 text-[rgb(var(--accent-1))]" />}</button>
                                      })}
                                    </div>
                                  </fieldset>
                                ))}
                              </div>
                            )}

                            {preferenceCategory === 'background' && (
                              <div className="mt-4 space-y-3">
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {GATEWAY_BACKGROUND_STYLES.map((definition) => <button key={definition.key} type="button" aria-pressed={settings.backgroundStyle === definition.key} onClick={() => update('backgroundStyle', definition.key)} className={`gh-interactive gh-gateway-secondary min-h-[84px] rounded-xl border px-3 py-3 text-left outline-none ${settings.backgroundStyle === definition.key ? 'border-[rgb(var(--accent-1)/0.55)] bg-[rgb(var(--accent-1)/0.1)]' : 'border-border/65 bg-background/55'}`}><span aria-hidden data-gateway-bg-preview={definition.key} className="gh-gateway-background-preview mb-2 block h-7 rounded-lg border border-border/50" /><span className="block text-xs font-bold">{definition.label}</span><span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">{definition.description}</span></button>)}
                                </div>
                                <label className="block rounded-xl border border-border/60 bg-background/45 p-3 text-xs font-semibold"><span className="flex items-center justify-between gap-3"><span>Grid visibility</span><span className="tabular-nums text-muted-foreground">{Math.round(settings.gridVisibility * 238)}%</span></span><input type="range" min="0" max="0.42" step="0.03" value={settings.gridVisibility} onChange={(event) => update('gridVisibility', Number(event.target.value))} className="mt-2 w-full accent-[rgb(var(--accent-1))]" /><span className="mt-1 block text-[10px] font-normal text-muted-foreground">0 completely removes all Gateway grid and dot layers.</span></label>
                              </div>
                            )}

                            {preferenceCategory === 'atmosphere' && (
                              <div className="mt-4 space-y-3">
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {GATEWAY_ATMOSPHERES.map((definition) => <button key={definition.key} type="button" aria-pressed={settings.atmosphere === definition.key} onClick={() => update('atmosphere', definition.key)} className={`gh-interactive gh-gateway-secondary min-h-[70px] rounded-xl border px-3 py-3 text-left outline-none ${settings.atmosphere === definition.key ? 'border-[rgb(var(--accent-1)/0.55)] bg-[rgb(var(--accent-1)/0.1)]' : 'border-border/65 bg-background/55'}`}><span className="block text-xs font-bold">{definition.label}</span><span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">{definition.description}</span></button>)}
                                </div>
                                <label className="block rounded-xl border border-border/60 bg-background/45 p-3 text-xs font-semibold"><span className="flex justify-between"><span>Atmosphere intensity</span><span>{Math.round(settings.backgroundIntensity * 100)}%</span></span><input type="range" min="0.2" max="0.72" step="0.04" value={settings.backgroundIntensity} onChange={(event) => update('backgroundIntensity', Number(event.target.value))} className="mt-2 w-full accent-[rgb(var(--accent-1))]" /></label>
                                <label className="block rounded-xl border border-border/60 bg-background/45 p-3 text-xs font-semibold"><span className="flex justify-between"><span>Core glow</span><span>{Math.round(settings.glowIntensity * 100)}%</span></span><input type="range" min="0.16" max="0.66" step="0.05" value={settings.glowIntensity} onChange={(event) => update('glowIntensity', Number(event.target.value))} className="mt-2 w-full accent-[rgb(var(--accent-1))]" /></label>
                              </div>
                            )}

                            {preferenceCategory === 'cursor' && (
                              <div className="mt-4 space-y-3">
                                <div className="rounded-xl border border-[rgb(var(--accent-1)/0.24)] bg-background/48 p-3 text-[11px] leading-5 text-muted-foreground">
                                  <span className="font-bold text-foreground">Live Gateway preview:</span> {GATEWAY_CURSORS.find((item) => item.key === settings.cursor)?.label}.
                                  {(reduced || settings.performance === 'battery') && <span className="mt-1 block">Default is used while reduced-motion safety or Battery Saver is active.</span>}
                                  <span className="mt-1 block">Touch-only devices always use their native touch interaction.</span>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Gateway cursor style">
                                  {GATEWAY_CURSORS.map((definition) => (
                                    <button
                                      key={definition.key}
                                      type="button"
                                      role="radio"
                                      aria-checked={settings.cursor === definition.key}
                                      onClick={() => update('cursor', definition.key)}
                                      className={`gh-interactive gh-gateway-secondary grid min-h-[78px] grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border px-3 py-3 text-left outline-none ${settings.cursor === definition.key ? 'border-[rgb(var(--accent-1)/0.55)] bg-[rgb(var(--accent-1)/0.1)]' : 'border-border/65 bg-background/55'}`}
                                    >
                                      <span className="gh-gateway-cursor-preview" data-cursor-preview={definition.key} aria-hidden>
                                        <span className="gh-gateway-cursor-preview-core" />
                                      </span>
                                      <span className="min-w-0"><span className="block text-xs font-bold leading-4">{definition.label}</span><span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">{definition.description}</span></span>
                                      {settings.cursor === definition.key && <Check className="size-4 text-[rgb(var(--accent-1))]" />}
                                    </button>
                                  ))}
                                </div>
                                <p className="text-[10px] leading-4 text-muted-foreground">Cursor choices affect only the Entry Gateway and persist only when Cursor and Interface Preferences are allowed.</p>
                              </div>
                            )}

                            {preferenceCategory === 'motion' && (
                              <div className="mt-4 space-y-3">
                                <div className="grid grid-cols-3 gap-2">{(['full', 'reduced', 'off'] as GatewayMotionMode[]).map((mode) => <button key={mode} type="button" aria-pressed={settings.motionMode === mode} onClick={() => update('motionMode', mode)} className={`gh-interactive gh-gateway-secondary min-h-11 rounded-xl border px-2 text-xs font-bold capitalize outline-none ${settings.motionMode === mode ? 'border-[rgb(var(--accent-1)/0.55)] bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]' : 'border-border/65 bg-background/55'}`}>{mode}</button>)}</div>
                                {([
                                  ['universeRotation', 'Universe rotation', 'Slow movement of the connected module nodes.'],
                                  ['connectorPulses', 'Connector pulses', 'Restrained energy movement along module links.'],
                                  ['ambientParticles', 'Ambient particles', 'A small number of lightweight light points.'],
                                  ['pointerParallax', 'Pointer parallax', 'Subtle desktop depth following the pointer.'],
                                  ['entranceAnimation', 'Entrance animation', 'The short staged reveal when the Gateway opens.'],
                                ] as const).map(([key, label, description]) => <label key={key} className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border/65 bg-background/48 p-3"><span><span className="block text-xs font-bold">{label}</span><span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">{description}</span></span><input type="checkbox" checked={settings[key]} onChange={(event) => update(key, event.target.checked)} className="mt-1 size-5 accent-[rgb(var(--accent-1))]" /></label>)}
                              </div>
                            )}

                            {preferenceCategory === 'performance' && (
                              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                {([['quality', 'Quality', 'Full visual detail'], ['balanced', 'Balanced', 'Recommended default'], ['battery', 'Battery Saver', 'Reduced continuous effects']] as const).map(([preset, label, description]) => <button key={preset} type="button" aria-pressed={settings.performance === preset} onClick={() => update('performance', preset as GatewayPerformancePreset)} className={`gh-interactive gh-gateway-secondary min-h-[86px] rounded-xl border px-3 py-3 text-left outline-none ${settings.performance === preset ? 'border-[rgb(var(--accent-1)/0.55)] bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]' : 'border-border/65 bg-background/55'}`}><span className="block text-xs font-bold">{label}</span><span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{description}</span></button>)}
                              </div>
                            )}

                            {preferenceCategory === 'universe' && (
                              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                {GATEWAY_UNIVERSE_STYLES.map((definition) => <button key={definition.key} type="button" aria-pressed={settings.universeStyle === definition.key} onClick={() => update('universeStyle', definition.key)} className={`gh-interactive gh-gateway-secondary min-h-[82px] rounded-xl border px-3 py-3 text-left outline-none ${settings.universeStyle === definition.key ? 'border-[rgb(var(--accent-1)/0.55)] bg-[rgb(var(--accent-1)/0.12)]' : 'border-border/65 bg-background/55'}`}><span className="block text-xs font-bold">{definition.label}</span><span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{definition.description}</span></button>)}
                              </div>
                            )}
                          </div>

                          <div className="mt-6 flex flex-col gap-2 border-t border-border/65 pt-4 sm:flex-row sm:justify-between">
                            <button type="button" onClick={() => resetCategory(preferenceCategory as Exclude<GatewayPreferenceCategory, 'menu'>)} className="gh-interactive gh-gateway-secondary inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border/70 px-3 text-xs font-bold outline-none"><RotateCcw className="size-3.5" /> Reset This Category</button>
                            <button type="button" onClick={reset} className="gh-interactive gh-gateway-secondary min-h-10 rounded-xl border border-border/70 px-3 text-xs font-bold outline-none">Reset Gateway Customization</button>
                          </div>
                        </div>
                      )}

                      <div className="mt-6 rounded-2xl border border-border/65 bg-muted/25 p-4 text-xs leading-5 text-muted-foreground">
                        {consent?.appearancePreferences || consent?.motionPerformancePreferences || consent?.cursorInterfacePreferences ? 'Only permitted Gateway categories are saved under separate gh_gateway_* keys.' : 'These changes are temporary in-memory previews. Enable optional Gateway preference storage in Cookie Preferences to save them.'}
                      </div>
                      <div className="mt-5 flex justify-end border-t border-border/65 pt-5"><button type="button" onClick={closePanel} className="gh-interactive gh-gateway-primary min-h-11 rounded-xl px-5 text-sm font-bold text-white outline-none">Return to Gateway</button></div>
                    </div>
                  )}

                  {panel === 'privacy' && (
                    <div className="max-h-[min(80dvh,720px)] overflow-y-auto p-6 sm:p-8">
                      <div className="flex items-start gap-3 pr-12">
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]"><ShieldCheck className="size-5" /></span>
                        <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]">Gateway privacy</p><h2 id="gateway-privacy-title" className="mt-1 font-heading text-2xl font-bold">Privacy inside the Entry Gateway</h2></div>
                      </div>
                      <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground">
                        <section><h3 className="font-semibold text-foreground">What the Gateway stores</h3><p className="mt-1">The Gateway stores your consent decision so it can remember which optional preference categories you allowed. The explicit Skip this gateway for this session control is separate from cookie consent and uses sessionStorage only when you enable it.</p></section>
                        <section><h3 className="font-semibold text-foreground">Optional appearance preferences</h3><p className="mt-1">With permission, the Gateway may save its own isolated theme, accent, background, atmosphere, universe, glow, and grid choices under Gateway-only storage keys. Without permission, the Gateway uses safe in-memory defaults and does not persist those choices.</p></section>
                        <section><h3 className="font-semibold text-foreground">Cursor and interface preferences</h3><p className="mt-1">With permission, cursor style, interface density, and glass-surface choices may be remembered. Native text and form cursors remain available where they are needed.</p></section>
                        <section><h3 className="font-semibold text-foreground">Motion and performance</h3><p className="mt-1">With permission, motion level, performance mode, particles, transitions, and related display preferences may be remembered. Reduced-motion system settings are read by the browser to provide an accessible presentation and are not used to identify you.</p></section>
                        <section><h3 className="font-semibold text-foreground">What is not collected here</h3><p className="mt-1">The Entry Gateway does not request names, email addresses, account credentials, payment information, precise location, advertising identifiers, or cross-site browsing history. Its Beta preview and countdown do not create a user profile.</p></section>
                        <section><h3 className="font-semibold text-foreground">Technical operation</h3><p className="mt-1">The Gateway uses ordinary browser capabilities such as viewport size, pointer type, visibility state, system theme, and reduced-motion preference to render safely. These values are used locally for the current experience.</p></section>
                      </div>
                      <div className="mt-7 flex justify-end border-t border-border/65 pt-5"><button type="button" onClick={closePanel} className="gh-interactive gh-gateway-primary inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-white outline-none">Return to Gateway</button></div>
                    </div>
                  )}

                  {panel === 'accessibility' && (
                    <div className="max-h-[min(80dvh,720px)] overflow-y-auto p-6 sm:p-8">
                      <div className="flex items-start gap-3 pr-12">
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]"><Accessibility className="size-5" /></span>
                        <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]">Gateway accessibility</p><h2 id="gateway-accessibility-title" className="mt-1 font-heading text-2xl font-bold">An entry experience designed for different ways of browsing</h2></div>
                      </div>
                      <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground">
                        <section><h3 className="font-semibold text-foreground">Keyboard and focus</h3><p className="mt-1">All destination actions, orbit modules, consent choices, and internal panels are keyboard reachable. Focus remains inside the active panel, visible focus rings are provided, and focus returns to the control that opened a panel.</p></section>
                        <section><h3 className="font-semibold text-foreground">Motion preferences</h3><p className="mt-1">The Gateway respects your operating system’s reduced-motion preference and the Gateway’s independent Full, Reduced, and Off motion settings. Reduced modes stop orbiting, pointer parallax, repeated pulses, and decorative particles while preserving clear interactive states.</p></section>
                        <section><h3 className="font-semibold text-foreground">Appearance and readability</h3><p className="mt-1">Light, Dark, and System appearance modes, responsive layouts, scalable text, semantic headings, labelled controls, and screen-reader descriptions are supported. The Gateway adapts its visual density on smaller screens without hiding essential actions.</p></section>
                        <section><h3 className="font-semibold text-foreground">If you encounter difficulty</h3><p className="mt-1">Use the Continue to Website action below to bypass the visual gateway. The public website remains available through the primary Enter Gaming Horizon action after your privacy choice is complete.</p></section>
                      </div>
                      <div className="mt-7 flex flex-col gap-3 border-t border-border/65 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={enterSite} className="gh-interactive gh-gateway-secondary inline-flex min-h-11 items-center justify-center rounded-xl border border-border/70 px-5 text-sm font-bold outline-none">Continue to Website</button><button type="button" onClick={closePanel} className="gh-interactive gh-gateway-primary inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-white outline-none">Return to Gateway</button></div>
                    </div>
                  )}

                  {panel === 'cookies' && (
                    <div className="max-h-[min(84dvh,760px)] overflow-y-auto p-6 sm:p-8">
                      <div className="flex items-start gap-3 pr-12">
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]"><Cookie className="size-5" /></span>
                        <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]">Gateway storage choices</p><h2 id="gateway-cookies-title" className="mt-1 font-heading text-2xl font-bold">Cookie Preferences</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Essential storage supports this Gateway. Optional storage remembers the experience you choose; it is never pre-selected on your behalf.</p></div>
                      </div>

                      {consentScreen === 'summary' ? (
                        <div className="mt-7">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-border/70 bg-muted/25 p-4"><p className="text-sm font-bold">Essential storage</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Required for routing, the synchronized countdown, consent records, security-related operation, and the current Gateway session.</p></div>
                            <div className="rounded-2xl border border-border/70 bg-muted/25 p-4"><p className="text-sm font-bold">Optional preferences</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Appearance, motion, performance, cursor, and interface choices are stored only when you allow them. The explicit session-skip toggle is separate from cookie consent.</p></div>
                          </div>
                          <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <button type="button" onClick={() => applyConsent(ACCEPT_ALL)} className="gh-interactive gh-gateway-primary min-h-12 rounded-2xl px-4 text-sm font-bold text-white outline-none">Accept All</button>
                            <button type="button" onClick={() => applyConsent(ESSENTIAL_ONLY)} className="gh-interactive gh-gateway-secondary min-h-12 rounded-2xl border border-border/75 bg-background/70 px-4 text-sm font-bold outline-none">Essential Only</button>
                            <button type="button" onClick={() => setConsentScreen('customize')} className="gh-interactive gh-gateway-secondary min-h-12 rounded-2xl border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.08)] px-4 text-sm font-bold text-[rgb(var(--accent-1))] outline-none">Customize</button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-7 space-y-3">
                          <div className="rounded-2xl border border-border/70 p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold">Essential</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Consent record, routing, countdown operation, and essential current-session behavior.</p></div><span className="rounded-full bg-emerald-500/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-700 text-emerald-700">Required</span></div></div>
                          {[
                            { key: 'appearancePreferences' as const, title: 'Appearance Preferences', description: 'Theme, accent, background, atmosphere, grid, and glow.' },
                            { key: 'motionPerformancePreferences' as const, title: 'Motion and Performance Preferences', description: 'Motion level, particles, transitions, animation intensity, and performance mode.' },
                            { key: 'cursorInterfacePreferences' as const, title: 'Cursor and Interface Preferences', description: 'Cursor style, interface density, and glass-surface preference.' },
                            { key: 'sessionConvenience' as const, title: 'Session Convenience', description: 'Optional session-level interface conveniences. The explicit Gateway Skip toggle remains separate.' },
                          ].map((option) => (
                            <label key={option.key} className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-border/70 p-4 transition-colors hover:bg-muted/35">
                              <span><span className="block text-sm font-bold">{option.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.description}</span></span>
                              <input type="checkbox" checked={consentDraft[option.key]} onChange={(event) => setConsentDraft((current) => ({ ...current, [option.key]: event.target.checked }))} className="mt-1 size-5 accent-[rgb(var(--accent-1))]" />
                            </label>
                          ))}
                          <div className="mt-6 flex flex-col gap-3 border-t border-border/65 pt-5 sm:flex-row sm:justify-between">
                            <button type="button" onClick={() => setConsentScreen('summary')} className="gh-interactive gh-gateway-secondary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/70 px-4 text-sm font-bold outline-none"><ArrowLeft className="size-4" /> Back</button>
                            <div className="flex flex-col gap-3 sm:flex-row">
                              {!consentRequired && <button type="button" onClick={closePanel} className="gh-interactive gh-gateway-secondary min-h-11 rounded-xl border border-border/70 px-4 text-sm font-bold outline-none">Cancel</button>}
                              <button type="button" onClick={() => applyConsent(consentDraft)} className="gh-interactive gh-gateway-primary min-h-11 rounded-xl px-5 text-sm font-bold text-white outline-none">Save Preferences</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {panel === 'tour' && (() => {
                    const step = TOUR_STEPS[tourStep]
                    const StepIcon = step.icon
                    const isLast = tourStep === TOUR_STEPS.length - 1
                    return (
                      <div className="max-h-[min(84dvh,760px)] overflow-y-auto p-6 sm:p-8">
                        <div className="flex items-start gap-3 pr-12">
                          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]"><Compass className="size-5" /></span>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]">Feature Tour · Step {tourStep + 1} of {TOUR_STEPS.length}</p>
                            <h2 id="gateway-tour-title" className="mt-1 font-heading text-2xl font-bold">Everything on Gaming Horizon</h2>
                          </div>
                        </div>

                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={tourStep}
                            initial={reduced || !settings.entranceAnimation ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: reduced ? 0 : 0.16 }}
                            className="mt-6 rounded-2xl border border-border/70 bg-muted/25 p-6 text-center"
                          >
                            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.11)] text-[rgb(var(--accent-1))]">
                              <StepIcon className="size-6" />
                            </span>
                            <p className="mt-4 font-heading text-lg font-bold text-foreground">{step.label}</p>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.description}</p>
                            {step.howTo.length > 0 && (
                              <div className="mt-4 rounded-xl border border-[rgb(var(--accent-1)/0.22)] bg-[rgb(var(--accent-1)/0.05)] p-4 text-left">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[rgb(var(--accent-1))]">How to use it</p>
                                <ol className="mt-2 space-y-1.5">
                                  {step.howTo.map((line, i) => (
                                    <li key={i} className="flex gap-2 text-xs leading-5 text-muted-foreground">
                                      <span className="mt-0.5 shrink-0 font-bold text-[rgb(var(--accent-1))]">{i + 1}.</span>
                                      <span>{line}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>

                        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5" role="tablist" aria-label="Tour steps">
                          {TOUR_STEPS.map((tourItem, index) => (
                            <button
                              key={tourItem.label}
                              type="button"
                              role="tab"
                              onClick={() => setTourStep(index)}
                              aria-label={`Go to ${tourItem.label}`}
                              aria-selected={tourStep === index}
                              className={`h-1.5 rounded-full transition-all duration-200 ${tourStep === index ? 'w-6 bg-[rgb(var(--accent-1))]' : 'w-1.5 bg-border/80 hover:bg-[rgb(var(--accent-1)/0.4)]'}`}
                            />
                          ))}
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border/65 pt-5 sm:flex-row sm:items-center sm:justify-between">
                          <button type="button" onClick={() => setTourStep((current) => Math.max(0, current - 1))} disabled={tourStep === 0} className="gh-interactive gh-gateway-secondary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/70 px-4 text-sm font-bold outline-none disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="size-4" /> Back</button>
                          {isLast ? (
                            <button type="button" onClick={closePanel} className="gh-interactive gh-gateway-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white outline-none">Done <Check className="size-4" /></button>
                          ) : (
                            <button type="button" onClick={() => setTourStep((current) => Math.min(TOUR_STEPS.length - 1, current + 1))} className="gh-interactive gh-gateway-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white outline-none">Next <ArrowRight className="size-4" /></button>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          <GatewayCustomCursor cursor={settings.cursor} enabled={!reduced && settings.performance !== 'battery'} />
        </motion.section>
      )}
    </AnimatePresence>,
    document.body,
  )
}
