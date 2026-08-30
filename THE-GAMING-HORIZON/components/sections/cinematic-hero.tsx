'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import {
  ArrowRight,
  Bot,
  CircleUserRound,
  Gamepad2,
  Orbit,
  Play,
  Radio,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { useSettings } from '@/components/providers/settings-provider'
import { useUI } from '@/components/providers/ui-provider'
import { useMilestoneClock } from '@/lib/use-milestone-clock'
import { BETA_DATE, LAUNCH_DATE } from '@/lib/data'
import { cn } from '@/lib/utils'
import styles from './cinematic-hero.module.css'

const EASE = [0.22, 1, 0.36, 1] as const

type ModuleKey = 'instant' | 'discovery' | 'progress' | 'community'

type HeroModule = {
  id: ModuleKey
  title: string
  description: string
  visualLabel: string
  icon: LucideIcon
  tone: string
  overview: string
  benefit: string
  ecosystem: string
  availability: string
  actionLabel: string
  destination: string
}

const MODULES: HeroModule[] = [
  {
    id: 'instant',
    title: 'Instant Play',
    description: 'Open a game directly in the browser.',
    visualLabel: 'Browser portal ready',
    icon: Play,
    tone: '34 211 238',
    overview: 'Gaming Horizon is designed to open supported games directly in the browser, without a separate download, installer, or launcher.',
    benefit: 'Fast access and device-aware performance reduce setup friction, while planned saved-session support can help players resume compatible experiences later.',
    ecosystem: 'Instant Play connects game discovery, player identity, saved progress, achievements, and social context at the moment a session begins.',
    availability: 'Planned for the Public Beta foundation, beginning with supported browser-first experiences.',
    actionLabel: 'Explore Browser-First Play',
    destination: '/platform#module-games',
  },
  {
    id: 'discovery',
    title: 'AI Discovery',
    description: 'Recommendations shaped by time, mood, and device.',
    visualLabel: 'Discovery signal active',
    icon: Bot,
    tone: '168 85 247',
    overview: 'Planned contextual recommendations will consider available time, mood, device capability, previous activity, play preferences, and relevant social context.',
    benefit: 'The goal is to help each player find a suitable experience quickly without presenting an endless, undifferentiated catalogue.',
    ecosystem: 'Discovery signals are planned to connect browser games with identity, collections, friends, progress, and the wider Gaming Horizon experience.',
    availability: 'Planned for Beta testing. A production AI recommendation system is not currently available to the public.',
    actionLabel: 'Explore AI Discovery',
    destination: '/ai#ai-companion',
  },
  {
    id: 'progress',
    title: 'Persistent Progress',
    description: 'Achievements and identity continue across sessions.',
    visualLabel: 'Progress synchronized',
    icon: Trophy,
    tone: '245 158 11',
    overview: 'One player identity is planned to carry profiles, achievements, badges, collections, saved progression, and challenges across supported experiences.',
    benefit: 'Players can build meaningful continuity instead of starting from zero whenever they move between compatible browser games.',
    ecosystem: 'Persistent Progress links play sessions with identity, achievements, collections, recommendations, and community recognition.',
    availability: 'Core identity and progress foundations are planned for Beta, with richer cross-game systems arriving in stages.',
    actionLabel: 'Explore Progress and Identity',
    destination: '/platform#module-profiles',
  },
  {
    id: 'community',
    title: 'Connected Community',
    description: 'Friends, conversations, and events stay close to play.',
    visualLabel: 'Community link online',
    icon: Users,
    tone: '16 185 129',
    overview: 'Friends, shared sessions, communities, discussions, events, presence, and invitations are planned to remain close to the games being played.',
    benefit: 'Players can discover people and shared activity without leaving the browser-first experience or separating conversation from play.',
    ecosystem: 'Community connections are planned to link games, identity, achievements, events, recommendations, and invitations in one coherent layer.',
    availability: 'Friends and invitation foundations are planned for Beta; broader community features will expand through later testing phases.',
    actionLabel: 'Explore Connected Community',
    destination: '/platform#module-communities',
  },
]

const ATMOSPHERES: Record<string, string> = {
  calm: 'radial-gradient(65% 62% at 74% 35%, rgb(var(--accent-1) / .17), transparent 70%), radial-gradient(45% 50% at 15% 74%, rgb(var(--accent-3) / .08), transparent 72%)',
  nebula: 'radial-gradient(66% 68% at 76% 32%, rgb(var(--accent-1) / .24), transparent 68%), radial-gradient(52% 55% at 24% 76%, rgb(var(--accent-2) / .14), transparent 72%)',
  aurora: 'linear-gradient(128deg, rgb(var(--accent-3) / .10), transparent 34%, rgb(var(--accent-1) / .20) 72%, transparent)',
  ocean: 'radial-gradient(64% 65% at 80% 34%, rgb(6 182 212 / .18), transparent 68%), radial-gradient(50% 56% at 18% 76%, rgb(37 99 235 / .12), transparent 72%)',
  sunset: 'radial-gradient(62% 62% at 80% 34%, rgb(244 63 94 / .15), transparent 69%), radial-gradient(48% 54% at 18% 78%, rgb(245 158 11 / .13), transparent 72%)',
  forest: 'radial-gradient(64% 64% at 80% 34%, rgb(16 185 129 / .15), transparent 68%), radial-gradient(48% 54% at 18% 78%, rgb(13 148 136 / .10), transparent 72%)',
  cosmic: 'radial-gradient(58% 60% at 78% 32%, rgb(var(--accent-1) / .23), transparent 68%), radial-gradient(42% 46% at 19% 76%, rgb(var(--accent-3) / .10), transparent 72%)',
  frost: 'radial-gradient(66% 64% at 78% 32%, rgb(148 163 184 / .17), transparent 68%), radial-gradient(48% 52% at 18% 78%, rgb(14 165 233 / .10), transparent 72%)',
  warmStudio: 'radial-gradient(66% 62% at 78% 32%, rgb(251 191 36 / .14), transparent 70%), radial-gradient(46% 52% at 18% 78%, rgb(244 63 94 / .08), transparent 72%)',
  neutral: 'radial-gradient(64% 60% at 76% 34%, rgb(100 116 139 / .13), transparent 70%)',
}

type HeroCssProperties = CSSProperties & {
  '--hero-atmosphere'?: string
  '--hero-grid-opacity'?: number
  '--module-tone'?: string
  '--hero-px'?: string
  '--hero-py'?: string
  '--particle-left'?: string
  '--particle-top'?: string
  '--particle-duration'?: string
  '--particle-delay'?: string
}

function useDocumentVisibility() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const sync = () => setVisible(!document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  return visible
}

function splitTime(target: string, now: number) {
  const remaining = new Date(target).getTime() - now
  const safe = Math.max(0, remaining)
  return {
    done: remaining <= 0,
    days: Math.floor(safe / 86_400_000),
    hours: Math.floor((safe / 3_600_000) % 24),
    minutes: Math.floor((safe / 60_000) % 60),
    seconds: Math.floor((safe / 1_000) % 60),
  }
}

function HeroMilestone({
  title,
  dateLabel,
  target,
  now,
  primary = false,
}: {
  title: string
  dateLabel: string
  target: string
  now: number
  primary?: boolean
}) {
  const time = splitTime(target, now)
  const units = [
    ['Days', time.days],
    ['Hours', time.hours],
    ['Minutes', time.minutes],
    ['Seconds', time.seconds],
  ] as const

  return (
    <article className={cn(styles.milestone, primary && styles.milestonePrimary)}>
      <div className={styles.milestoneHeading}>
        <span className={styles.milestoneStatusDot} aria-hidden />
        <div>
          <p className={styles.milestoneTitle}>{title}</p>
          <p className={styles.milestoneDate}>{dateLabel}</p>
        </div>
      </div>

      {time.done ? (
        <p className={styles.milestoneReached} role="status">
          {primary ? 'Public Beta reached' : 'Official launch reached'}
        </p>
      ) : (
        <div
          className={styles.milestoneClock}
          role="timer"
          aria-label={`${title} countdown: ${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds`}
        >
          {units.map(([label, value]) => (
            <span className={styles.timeCell} key={label}>
              <strong suppressHydrationWarning>{String(value).padStart(2, '0')}</strong>
              <small>{label.slice(0, 1)}</small>
            </span>
          ))}
        </div>
      )}
    </article>
  )
}


function HeroModuleDialog({
  module,
  onClose,
  opener,
  reducedMotion,
}: {
  module: HeroModule
  onClose: () => void
  opener: HTMLElement | null
  reducedMotion: boolean
}) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    const siteLayer = document.querySelector<HTMLElement>('[data-gh-site-layer]')
    const previousOverflow = document.body.style.overflow
    const previousAriaHidden = siteLayer?.getAttribute('aria-hidden')
    const hadInert = siteLayer?.hasAttribute('inert') ?? false
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')?.focus()
      siteLayer?.setAttribute('aria-hidden', 'true')
      siteLayer?.setAttribute('inert', '')
    }, 0)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'))
      if (!focusable.length) return
      const first = focusable.at(0) as HTMLElement | undefined
      const last = focusable.at(-1) as HTMLElement | undefined
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      if (siteLayer) {
        if (previousAriaHidden == null) siteLayer.removeAttribute('aria-hidden')
        else siteLayer.setAttribute('aria-hidden', previousAriaHidden)
        if (!hadInert) siteLayer.removeAttribute('inert')
      }
      window.setTimeout(() => opener?.focus(), 0)
    }
  }, [opener])

  const goToDetail = () => {
    const destination = module.destination
    onClose()
    window.setTimeout(() => router.push(destination), reducedMotion ? 0 : 40)
  }

  const Icon = module.icon
  return createPortal(
    <div className={styles.moduleDialogLayer} role="presentation">
      <button type="button" className={styles.moduleDialogBackdrop} aria-label="Close module details" onClick={onClose} />
      <motion.div
        ref={dialogRef}
        id="hero-module-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hero-module-dialog-title"
        aria-describedby="hero-module-dialog-overview"
        className={styles.moduleDialog}
        initial={reducedMotion ? false : { opacity: 0, x: 22, scale: 0.985 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 18, scale: 0.985 }}
        transition={{ duration: reducedMotion ? 0 : 0.22, ease: EASE }}
      >
        <header className={styles.moduleDialogHeader}>
          <span className={styles.moduleDialogIcon} style={{ '--module-tone': module.tone } as HeroCssProperties}><Icon aria-hidden /></span>
          <div>
            <p>Gaming Horizon module</p>
            <h2 id="hero-module-dialog-title">{module.title}</h2>
          </div>
          <button type="button" onClick={onClose} className={styles.moduleDialogClose} aria-label={`Close ${module.title} details`}><X aria-hidden /></button>
        </header>
        <div className={styles.moduleDialogBody}>
          <p id="hero-module-dialog-overview" className={styles.moduleDialogLead}>{module.overview}</p>
          <section><h3>Player benefit</h3><p>{module.benefit}</p></section>
          <section><h3>Connected ecosystem</h3><p>{module.ecosystem}</p></section>
          <section className={styles.moduleAvailability}><h3>Planned availability</h3><p>{module.availability}</p></section>
        </div>
        <footer className={styles.moduleDialogFooter}>
          <button type="button" onClick={onClose} className={styles.moduleDialogSecondary}>Return to Hero</button>
          <button type="button" onClick={goToDetail} className={styles.moduleDialogPrimary}>{module.actionLabel}<ArrowRight aria-hidden /></button>
        </footer>
      </motion.div>
    </div>,
    document.body,
  )
}

function BrowserPortal({ selected, fullMotion, floatCards, visible }: { selected: HeroModule; fullMotion: boolean; floatCards: boolean; visible: boolean }) {
  const rawId = useId()
  const gradientId = `horizon-guardian-${rawId.replace(/[:]/g, '')}`
  const shouldLoop = fullMotion && visible
  const shouldFloatCards = shouldLoop && floatCards

  const float = (distance: number, duration: number, delay = 0) =>
    shouldFloatCards
      ? {
          y: [0, -distance, 0],
          rotate: [0, distance > 7 ? 0.8 : -0.5, 0],
          transition: { duration, delay, repeat: Infinity, ease: 'easeInOut' as const },
        }
      : { y: 0, rotate: 0 }

  return (
    <div
      className={styles.visualStage}
      style={{ '--module-tone': selected.tone } as HeroCssProperties}
      data-module={selected.id}
      data-paused={visible ? 'false' : 'true'}
      aria-hidden="true"
    >
      <div className={styles.artworkCanvas}>
        <motion.div
          className={styles.portalAura}
          animate={shouldLoop ? { scale: [1, 1.025, 1], opacity: [0.72, 0.92, 0.72] } : { scale: 1, opacity: 0.82 }}
          transition={shouldLoop ? { duration: 8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.01 }}
        />

        <div className={styles.portalFrame}>
          <div className={styles.browserChrome}>
            <span /><span /><span />
            <div className={styles.browserAddress}>
              <Orbit className={styles.addressIcon} />
              <span>gaminghorizon.com / connected-universe</span>
            </div>
          </div>
          <div className={styles.portalViewport}>
            <span className={styles.portalRingOuter} />
            <span className={styles.portalRingMiddle} />
            <span className={styles.portalRingInner} />
            <span className={styles.portalHorizonLine} />
            <span className={styles.portalSweep} />
            <div className={styles.universeCore}>
              <Orbit />
              <span>Browser-first universe</span>
            </div>
          </div>
        </div>

        <svg className={styles.connectionMap} viewBox="0 0 720 720" fill="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="rgb(var(--accent-1))" />
              <stop offset="0.52" stopColor="rgb(var(--accent-2))" />
              <stop offset="1" stopColor="rgb(var(--accent-3))" />
            </linearGradient>
          </defs>
          <path d="M144 210C232 162 278 178 342 254" className={cn(styles.connectionLine, styles.connectionLineProfile)} />
          <path d="M578 184C494 154 449 186 400 260" className={cn(styles.connectionLine, styles.connectionLineDiscovery)} />
          <path d="M590 522C502 556 458 519 405 458" className={cn(styles.connectionLine, styles.connectionLineProgress)} />
          <path d="M130 512C219 558 272 519 323 458" className={cn(styles.connectionLine, styles.connectionLineCommunity)} />
          <circle cx="144" cy="210" r="5" fill={`url(#${gradientId})`} />
          <circle cx="578" cy="184" r="5" fill={`url(#${gradientId})`} />
          <circle cx="590" cy="522" r="5" fill={`url(#${gradientId})`} />
          <circle cx="130" cy="512" r="5" fill={`url(#${gradientId})`} />
        </svg>

        <motion.div
          className={styles.guardian}
          animate={shouldLoop ? { y: [0, -5, 0], scale: [1, 1.006, 1] } : { y: 0, scale: 1 }}
          transition={shouldLoop ? { duration: 7.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.01 }}
        >
          <svg viewBox="0 0 520 620" fill="none">
            <defs>
              <linearGradient id={`${gradientId}-shell`} x1="72" y1="92" x2="438" y2="552" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--hero-shell-highlight)" />
                <stop offset="0.48" stopColor="var(--hero-shell-mid)" />
                <stop offset="1" stopColor="var(--hero-shell-shadow)" />
              </linearGradient>
              <linearGradient id={`${gradientId}-visor`} x1="166" y1="184" x2="354" y2="274" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgb(var(--accent-3) / .92)" />
                <stop offset="0.48" stopColor="rgb(var(--accent-2) / .82)" />
                <stop offset="1" stopColor="rgb(var(--accent-1) / .96)" />
              </linearGradient>
            </defs>
            <path d="M86 578C100 476 146 408 206 378H314C374 408 420 476 434 578H86Z" fill={`url(#${gradientId}-shell)`} stroke="var(--hero-shell-stroke)" strokeWidth="3" />
            <path d="M150 457C183 434 217 423 260 423C303 423 337 434 370 457L346 579H174L150 457Z" fill="var(--hero-core-panel)" stroke="rgb(var(--accent-2) / .32)" strokeWidth="2" />
            <path d="M188 392L213 343H307L332 392C317 418 294 434 260 434C226 434 203 418 188 392Z" fill="var(--hero-neck)" stroke="var(--hero-shell-stroke)" strokeWidth="3" />
            <path d="M155 166C155 93 201 54 260 54C319 54 365 93 365 166V279C365 343 319 377 260 377C201 377 155 343 155 279V166Z" fill={`url(#${gradientId}-shell)`} stroke="var(--hero-shell-stroke)" strokeWidth="3" />
            <path d="M174 180C201 143 231 128 260 128C289 128 319 143 346 180L329 261C307 278 284 286 260 286C236 286 213 278 191 261L174 180Z" fill={`url(#${gradientId}-visor)`} opacity=".94" />
            <path d="M196 211C235 189 285 189 324 211" stroke="rgba(255,255,255,.76)" strokeWidth="4" strokeLinecap="round" />
            <path d="M214 307C244 319 276 319 306 307" stroke="rgb(var(--accent-3) / .56)" strokeWidth="3" strokeLinecap="round" />
            <path d="M260 88V128M155 201L124 223V276L155 291M365 201L396 223V276L365 291" stroke="rgb(var(--accent-1) / .55)" strokeWidth="4" strokeLinecap="round" />
            <path d="M205 149H315" stroke="rgb(var(--accent-3) / .4)" strokeWidth="2" strokeDasharray="10 9" />
            <circle cx="260" cy="224" r="82" stroke="rgb(var(--accent-3) / .18)" strokeWidth="2" />
            <path d="M227 465H293L307 518L260 548L213 518L227 465Z" fill="rgb(var(--accent-1) / .14)" stroke="rgb(var(--accent-3) / .55)" strokeWidth="2" />
            <path d="M238 488L260 475L282 488V514L260 527L238 514V488Z" fill="rgb(var(--accent-2) / .45)" stroke="rgb(var(--accent-3) / .82)" strokeWidth="2" />
            <path d="M247 496L257 506L276 486" stroke="rgba(255,255,255,.84)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M108 519L176 493M412 519L344 493" stroke="rgb(var(--accent-1) / .28)" strokeWidth="3" />
            <circle cx="165" cy="486" r="13" fill="rgb(var(--accent-1) / .12)" stroke="rgb(var(--accent-3) / .55)" strokeWidth="2" />
            <circle cx="355" cy="486" r="13" fill="rgb(var(--accent-2) / .12)" stroke="rgb(var(--accent-1) / .55)" strokeWidth="2" />
            <path d="M152 486H178M342 486H368M178 486L214 505M342 486L306 505" stroke="rgb(var(--accent-2) / .36)" strokeWidth="2" />
            <path d="M196 450H324M203 563H317" stroke="rgb(var(--accent-3) / .24)" strokeWidth="2" strokeDasharray="18 8" />
          </svg>
          <span className={styles.guardianEdgeLight} />
        </motion.div>

        <div className={styles.contextPanel}>
          <span className={styles.contextPulse} />
          <div>
            <small>Connected universe</small>
            <strong>{selected.visualLabel}</strong>
          </div>
          <Zap />
        </div>

        <div className={styles.gameFragmentOne}><Gamepad2 /><span>Instant browser world</span></div>
        <div className={styles.gameFragmentTwo}><Sparkles /><span>Identity synced</span></div>

        {[
          ['12%', '19%', '5.5s', '0s'],
          ['21%', '37%', '5.85s', '-0.42s'],
          ['30%', '55%', '6.2s', '-0.84s'],
          ['39%', '73%', '6.55s', '-1.26s'],
          ['48%', '19%', '6.9s', '-1.68s'],
          ['57%', '37%', '7.25s', '-2.1s'],
          ['66%', '55%', '7.6s', '-2.52s'],
          ['75%', '73%', '7.95s', '-2.94s'],
        ].map(([left, top, duration, delay], index) => (
          <span
            key={index}
            className={styles.particle}
            style={{
              '--particle-left': left,
              '--particle-top': top,
              '--particle-duration': duration,
              '--particle-delay': delay,
            } as HeroCssProperties}
          />
        ))}
      </div>

      <div className={styles.fragmentRail}>
        <motion.div className={cn(styles.fragment, styles.fragmentProfile)} animate={float(7, 7.5)} data-concept="identity">
          <span className={styles.fragmentIcon}><CircleUserRound /></span>
          <span><b>Player Identity</b><small>One profile across browser worlds</small></span>
        </motion.div>

        <motion.div className={cn(styles.fragment, styles.fragmentAi)} animate={float(10, 8.5, 0.8)} data-concept="discovery">
          <span className={styles.fragmentIcon}><Radio /></span>
          <span><b>AI Discovery</b><small>Context-aware game signals</small></span>
        </motion.div>

        <motion.div className={cn(styles.fragment, styles.fragmentAchievement)} animate={float(8, 8, 0.35)} data-concept="progress">
          <span className={styles.fragmentIcon}><Trophy /></span>
          <span><b>Achievement</b><small>Progress retained across sessions</small></span>
        </motion.div>

        <motion.div className={cn(styles.fragment, styles.fragmentCommunity)} animate={float(9, 9, 1.1)} data-concept="community">
          <span className={styles.fragmentIcon}><Users /></span>
          <span><b>Community</b><small>Friends, events, and conversations</small></span>
        </motion.div>
      </div>
    </div>
  )
}

export function CinematicHero() {
  const { openWaitlist } = useUI()
  const { settings, resolvedTheme } = useSettings()
  const systemReducedMotion = useReducedMotion()
  const now = useMilestoneClock(1_000)
  const visible = useDocumentVisibility()
  const visualRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState<ModuleKey>('instant')
  const [openModuleId, setOpenModuleId] = useState<ModuleKey | null>(null)
  const moduleOpenerRef = useRef<HTMLElement | null>(null)
  const [finePointer, setFinePointer] = useState(false)

  const selected = MODULES.find((module) => module.id === selectedId) ?? MODULES[0]
  const openModule = openModuleId ? MODULES.find((module) => module.id === openModuleId) ?? null : null
  const motionOff = settings.motionMode === 'off'
  const reducedMotion = Boolean(systemReducedMotion) || settings.motionMode === 'reduced'
  const batterySaver = settings.performance === 'battery'
  const fullMotion = !motionOff && !reducedMotion && !batterySaver && settings.ambientMotion
  const showHeroObjects = settings.heroObjects
  const showParticles = showHeroObjects && settings.particlesEnabled && !batterySaver

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px) and (pointer: fine)')
    const sync = () => setFinePointer(query.matches)
    sync()
    query.addEventListener?.('change', sync)
    return () => query.removeEventListener?.('change', sync)
  }, [])

  const resetParallax = () => {
    const target = visualRef.current
    if (!target) return
    target.style.setProperty('--hero-px', '0px')
    target.style.setProperty('--hero-py', '0px')
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!fullMotion || !finePointer || !visible) return
    const target = visualRef.current
    if (!target) return
    const bounds = target.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8
    target.style.setProperty('--hero-px', `${x.toFixed(2)}px`)
    target.style.setProperty('--hero-py', `${y.toFixed(2)}px`)
  }

  const reveal = (delay: number, distance = 16) => ({
    initial: motionOff ? false : { opacity: 0, y: reducedMotion ? 0 : distance },
    animate: { opacity: 1, y: 0 },
    transition: motionOff
      ? { duration: 0 }
      : { duration: reducedMotion || batterySaver ? 0.18 : 0.48, delay: reducedMotion || batterySaver ? 0 : delay, ease: EASE },
  })

  const atmosphereStyle: HeroCssProperties = {
    '--hero-atmosphere': ATMOSPHERES[settings.backgroundMode] ?? ATMOSPHERES.calm,
    '--hero-grid-opacity': settings.gridVisibility,
  }

  const scrollToVision = () =>
    document.getElementById('vision')?.scrollIntoView({
      behavior: motionOff || reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })

  return (
    <section
      id="home"
      data-interface-copy="true"
      className={styles.hero}
      data-theme={resolvedTheme}
      data-motion={motionOff ? 'off' : reducedMotion ? 'reduced' : 'full'}
      data-performance={settings.performance}
      data-background={settings.backgroundStyle}
      data-atmosphere={settings.backgroundMode}
      data-particles={showParticles ? 'on' : 'off'}
      style={atmosphereStyle}
    >
      {/* The hero used to paint its own atmosphere/backgroundStyle/gridLayer
          stack on top of the shared site background, which made the top of
          the homepage look flatter and less saturated than every other
          section and page (those only ever show the global
          AnimatedBackground). Removed so the hero now shows exactly the same
          background the rest of the site uses, with nothing layered over it. */}

      <div className={styles.heroInner}>
        <div className={styles.mainGrid}>
          <div className={styles.copyColumn}>
            <motion.p {...reveal(0.17, 10)} className={styles.eyebrow}>
              <span className={styles.eyebrowSignal} aria-hidden />
              A connected universe for browser gaming
            </motion.p>

            <motion.h1 {...reveal(0.25, 18)} className={styles.headline}>
              <span>The Home of</span>
              <span className={styles.gradientWords}>Browser Gaming.</span>
            </motion.h1>

            <motion.p {...reveal(0.34, 15)} className={styles.description} data-selectable="true">
              Play instantly, discover intelligently, keep your progress, and stay connected across one premium browser-first ecosystem.
            </motion.p>

            <motion.div {...reveal(0.43, 12)} className={styles.actions}>
              <GhButton
                size="lg"
                magnetic={false}
                onClick={openWaitlist}
                className={styles.primaryAction}
              >
                Join the Waitlist
                <ArrowRight className={styles.actionArrow} />
              </GhButton>
              <GhButton
                size="lg"
                variant="glass"
                magnetic={false}
                onClick={scrollToVision}
                className={styles.secondaryAction}
              >
                Explore the Vision
              </GhButton>
            </motion.div>

            <motion.div {...reveal(0.55, 12)} className={styles.milestones} aria-label="Gaming Horizon milestones">
              <HeroMilestone
                title="Public Beta"
                dateLabel="Jan 1, 2027 · 12:01 AM IST"
                target={BETA_DATE}
                now={now}
                primary
              />
              <HeroMilestone
                title="Official Launch"
                dateLabel="Mar 1, 2028 · 12:01 AM IST"
                target={LAUNCH_DATE}
                now={now}
              />
            </motion.div>
          </div>

          <motion.div
            ref={visualRef}
            className={styles.visualColumn}
            initial={motionOff ? false : { opacity: 0, x: reducedMotion ? 0 : 22, scale: reducedMotion ? 1 : 0.975 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: motionOff ? 0 : reducedMotion || batterySaver ? 0.2 : 0.66, delay: motionOff || reducedMotion || batterySaver ? 0 : 0.08, ease: EASE }}
            onPointerMove={onPointerMove}
            onPointerLeave={resetParallax}
            style={{ '--hero-px': '0px', '--hero-py': '0px' } as HeroCssProperties}
          >
            {showHeroObjects ? (
              <BrowserPortal selected={selected} fullMotion={fullMotion} floatCards={settings.floatingCards} visible={visible} />
            ) : (
              <div className={styles.visualFallback} aria-hidden="true">
                <Orbit />
                <span>Gaming Horizon connected universe</span>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div {...reveal(0.72, 14)} className={styles.moduleDock} aria-label="Gaming Horizon platform modules">
          {MODULES.map((module) => {
            const Icon = module.icon
            const active = selected.id === module.id
            return (
              <button
                key={module.id}
                type="button"
                className={cn(styles.moduleCard, active && styles.moduleCardSelected)}
                aria-pressed={active}
                aria-expanded={openModuleId === module.id}
                aria-controls="hero-module-dialog"
                aria-haspopup="dialog"
                aria-label={`Open ${module.title} details. ${module.description}`}
                onClick={(event) => {
                  setSelectedId(module.id)
                  moduleOpenerRef.current = event.currentTarget
                  setOpenModuleId(module.id)
                }}
              >
                <span className={styles.moduleThumbnail} style={{ '--module-tone': module.tone } as HeroCssProperties} aria-hidden="true">
                  <span className={styles.thumbnailOrb} />
                  <Icon />
                </span>
                <span className={styles.moduleCopy}>
                  <strong>{module.title}</strong>
                  <small>{module.description}</small>
                </span>
                <ArrowRight className={styles.moduleArrow} aria-hidden="true" />
              </button>
            )
          })}
        </motion.div>
      </div>

      {openModule && <HeroModuleDialog module={openModule} onClose={() => setOpenModuleId(null)} opener={moduleOpenerRef.current} reducedMotion={motionOff || reducedMotion} />}

      <div aria-hidden="true" className={styles.sectionTransition} />
    </section>
  )
}
