'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Activity,
  BadgeDollarSign,
  BookOpen,
  Bot,
  Check,
  CircleUserRound,
  Code2,
  Contact,
  FileText,
  Gamepad2,
  Gauge,
  Globe2,
  Monitor,
  Moon,
  MousePointer2,
  Newspaper,
  Palette,
  Rocket,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Trophy,
  UserPlus,
  Users,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import { useUI } from '@/components/providers/ui-provider'
import {
  ACCENTS,
  BACKGROUND_MODES,
  BACKGROUND_STYLES,
  useSettings,
  type AccentKey,
  type CursorStyle,
  type MotionMode,
  type PerformancePreset,
  type ThemeMode,
} from '@/components/providers/settings-provider'
import { readCookieConsent } from '@/components/consent-manager'
import { BLOG_ARTICLES } from '@/lib/blog'
import { GAMES, NAV_LINKS } from '@/lib/data'
import { cn, toAnchorSlug } from '@/lib/utils'

const SEARCH_EVENT = 'gh:open-command-palette'
const RECENT_KEY = 'gh:command-palette-recent-v1'
const MAX_RECENT = 6

type CommandGroup = 'Recent' | 'Pages' | 'Games' | 'Blog' | 'Actions' | 'Appearance' | 'Gateway'

type Command = {
  id: string
  label: string
  hint: string
  group: Exclude<CommandGroup, 'Recent'>
  icon: LucideIcon
  action: () => void
  keywords?: string
  status?: string
  active?: boolean
  featured?: boolean
}

const GROUP_ORDER: CommandGroup[] = ['Recent', 'Pages', 'Games', 'Blog', 'Actions', 'Appearance', 'Gateway']

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string; icon: LucideIcon; hint: string }> = [
  { value: 'light', label: 'Switch to Light Mode', icon: Sun, hint: 'Use the polished light Gaming Horizon appearance' },
  { value: 'dark', label: 'Switch to Dark Mode', icon: Moon, hint: 'Use the premium dark Gaming Horizon appearance' },
  { value: 'system', label: 'Use System Appearance', icon: Monitor, hint: 'Follow the appearance preference of this device' },
]

const MOTION_OPTIONS: Array<{ value: MotionMode; label: string; hint: string }> = [
  { value: 'full', label: 'Use Full Motion', hint: 'Enable the complete motion experience' },
  { value: 'reduced', label: 'Use Reduced Motion', hint: 'Keep only restrained interface movement' },
  { value: 'off', label: 'Turn Motion Off', hint: 'Disable decorative website movement' },
]

const PERFORMANCE_OPTIONS: Array<{ value: PerformancePreset; label: string; hint: string }> = [
  { value: 'high', label: 'Use High Performance', hint: 'Use the richest supported visual effects' },
  { value: 'balanced', label: 'Use Balanced Performance', hint: 'Balance visual quality and efficiency' },
  { value: 'battery', label: 'Use Battery Saver', hint: 'Reduce decorative effects and processing' },
]

const CURSOR_OPTIONS: Array<{ value: CursorStyle; label: string }> = [
  { value: 'default', label: 'Default Cursor' },
  { value: 'horizonDot', label: 'Horizon Dot Cursor' },
  { value: 'neonRing', label: 'Neon Ring Cursor' },
  { value: 'minimalArrow', label: 'Minimal Arrow Cursor' },
  { value: 'pixelPointer', label: 'Pixel Pointer Cursor' },
  { value: 'orbital', label: 'Orbital Cursor' },
  { value: 'cometTrail', label: 'Comet Trail Cursor' },
  { value: 'spark', label: 'Spark Cursor' },
  { value: 'gamepad', label: 'Gamepad Cursor' },
  { value: 'crosshair', label: 'Crosshair Cursor' },
  { value: 'softGlow', label: 'Soft Glow Cursor' },
  { value: 'retroArcade', label: 'Retro Arcade Cursor' },
]

function normalize(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
}

function subsequenceScore(needle: string, haystack: string) {
  let cursor = 0
  let score = 0
  let streak = 0
  for (const char of haystack) {
    if (char === needle[cursor]) {
      cursor += 1
      streak += 1
      score += 2 + streak
      if (cursor === needle.length) return score
    } else {
      streak = 0
    }
  }
  return -1
}

function fuzzyScore(command: Command, query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return command.featured ? 10 : 0
  const label = normalize(command.label)
  const haystack = normalize(`${command.label} ${command.hint} ${command.keywords ?? ''} ${command.group}`)
  let total = 0
  for (const term of terms) {
    if (label === term) total += 180
    else if (label.startsWith(term)) total += 125
    else if (label.includes(term)) total += 90
    else if (haystack.includes(term)) total += 55
    else {
      const fuzzy = subsequenceScore(term, haystack)
      if (fuzzy < 0) return -1
      total += Math.min(35, fuzzy)
    }
  }
  return total
}

function readPersistedRecent(allowed: boolean) {
  if (!allowed || typeof window === 'undefined') return [] as string[]
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string').slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

export function CommandPalette() {
  const router = useRouter()
  const { openWaitlist, openStudio, reopenGateway } = useUI()
  const { settings, update, resolvedTheme } = useSettings()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [recentIds, setRecentIds] = useState<string[]>([])
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    const syncConsent = () => {
      const allowed = readCookieConsent()?.analytics === true
      setAnalyticsAllowed(allowed)
      if (allowed) setRecentIds((current) => current.length ? current : readPersistedRecent(true))
      else {
        setRecentIds([])
        try { localStorage.removeItem(RECENT_KEY) } catch { /* memory-only fallback */ }
      }
    }
    syncConsent()
    window.addEventListener('gh:cookie-consent-changed', syncConsent)
    return () => window.removeEventListener('gh:cookie-consent-changed', syncConsent)
  }, [])

  useEffect(() => {
    const captureOpener = () => {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      setOpen(true)
    }
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (open) setOpen(false)
        else captureOpener()
      }
      if (event.key === 'Escape' && open) {
        event.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener(SEARCH_EVENT, captureOpener)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(SEARCH_EVENT, captureOpener)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) requestAnimationFrame(() => openerRef.current?.focus())
      wasOpenRef.current = false
      return
    }
    wasOpenRef.current = true
    setQuery('')
    setActive(0)
    requestAnimationFrame(() => inputRef.current?.focus())
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])

  const closeAnd = (action: () => void) => {
    setOpen(false)
    window.setTimeout(action, 40)
  }

  const commands = useMemo<Command[]>(() => {
    const currentAppearance = settings.theme === 'system'
      ? `Current: System → ${resolvedTheme === 'dark' ? 'Dark' : 'Light'}`
      : `Current: ${settings.theme === 'dark' ? 'Dark' : 'Light'}`

    const pageCommands: Command[] = [
      ...NAV_LINKS.map((link) => ({
        id: `page-${link.href === '/' ? 'home' : link.href.slice(1)}`,
        label: link.label === 'Home' ? 'Open Home' : `Open ${link.label}`,
        hint: link.label === 'Beta' ? 'Detailed Public Beta program page' : link.label === 'Blog' ? 'Gaming Horizon articles and project stories' : 'Website page',
        group: 'Pages' as const,
        icon: link.label === 'Blog' ? Newspaper : link.label === 'Beta' ? Rocket : FileText,
        action: () => router.push(link.href),
        keywords: `${link.label} page website navigation ${link.label === 'Home' ? 'top homepage' : ''}`,
        featured: ['Home', 'Platform', 'Games', 'Beta', 'Blog'].includes(link.label),
      })),
      { id: 'page-plans', label: 'Open Plans and Pricing', hint: 'Compare planned memberships and pricing', group: 'Pages', icon: BadgeDollarSign, action: () => router.push('/plans'), keywords: 'plans pricing membership subscription cost', featured: true },
      { id: 'page-development', label: 'Open Development Updates', hint: 'Current build progress and roadmap updates', group: 'Pages', icon: Activity, action: () => router.push('/roadmap#development'), keywords: 'development updates progress changelog build status' },
      { id: 'page-status', label: 'Open Platform Status', hint: 'Planned service and project status', group: 'Pages', icon: Activity, action: () => router.push('/status'), keywords: 'platform status uptime services development' },
      { id: 'page-privacy', label: 'Open Privacy', hint: 'Privacy policy and data practices', group: 'Pages', icon: ShieldCheck, action: () => router.push('/privacy'), keywords: 'privacy cookies data legal' },
      { id: 'page-accessibility', label: 'Open Accessibility', hint: 'Accessibility statement and controls', group: 'Pages', icon: ShieldCheck, action: () => router.push('/accessibility'), keywords: 'accessibility wcag keyboard screen reader motion' },
      { id: 'page-cookies', label: 'Open Cookie Preferences', hint: 'Review website privacy choices', group: 'Pages', icon: ShieldCheck, action: () => router.push('/cookies'), keywords: 'cookies consent privacy essential analytics' },
      { id: 'page-contact', label: 'Contact Gaming Horizon', hint: 'Send feedback or a project enquiry', group: 'Pages', icon: Contact, action: () => router.push('/contact'), keywords: 'contact feedback support email question action' },
      { id: 'page-community', label: 'Open Communities', hint: 'Community module details', group: 'Pages', icon: Users, action: () => router.push('/platform#module-communities'), keywords: 'community friends discussions events invitations social' },
      { id: 'page-profiles', label: 'Open Profiles', hint: 'Persistent player identity details', group: 'Pages', icon: CircleUserRound, action: () => router.push('/platform#module-profiles'), keywords: 'profiles player identity saved progress collections' },
      { id: 'page-achievements', label: 'Open Achievements', hint: 'Achievements, badges, and progression details', group: 'Pages', icon: Trophy, action: () => router.push('/platform#module-achievements'), keywords: 'achievements badges progression challenges collections' },
      { id: 'page-events', label: 'Open Events', hint: 'Platform events and shared activities', group: 'Pages', icon: Users, action: () => router.push('/platform#module-events'), keywords: 'events community activities sessions' },
      { id: 'page-developer', label: 'Open Developer Platform', hint: 'Publishing and creator platform details', group: 'Pages', icon: Code2, action: () => router.push('/platform#module-developer'), keywords: 'developer platform publish creators api sdk' },
      { id: 'page-ai-companion', label: 'Open AI Companion Details', hint: 'Context-aware discovery and recommendations', group: 'Pages', icon: Bot, action: () => router.push('/ai#ai-companion'), keywords: 'ai artificial intelligence discovery recommendation mood device time' },
      { id: 'page-beta-preview', label: 'Open Website Beta Preview', hint: 'Closed landing-site preview with synchronized milestones', group: 'Pages', icon: Rocket, action: () => router.push('/beta-preview'), keywords: 'beta preview closed opens january 2027 countdown website preview', featured: true },
    ]

    const gameCommands: Command[] = GAMES.map((game) => ({
      id: `game-${toAnchorSlug(game.name)}`,
      label: game.name,
      hint: `${game.genre} · ${game.status}`,
      group: 'Games',
      icon: Gamepad2,
      action: () => router.push(`/games#game-${toAnchorSlug(game.name)}`),
      keywords: `${game.name} ${game.genre} ${game.tagline} ${game.status} ${game.multiplayer ? 'multiplayer' : 'single player'} browser planned game library`,
    }))

    const blogCommands: Command[] = [
      { id: 'blog-index', label: 'Open Gaming Horizon Blog', hint: 'Browse all project articles and updates', group: 'Blog', icon: Newspaper, action: () => router.push('/blog'), keywords: 'blog articles stories updates development news', featured: true },
      ...BLOG_ARTICLES.map((article) => ({
        id: `blog-${article.slug}`,
        label: article.title,
        hint: `${article.category} · ${article.read}`,
        group: 'Blog' as const,
        icon: BookOpen,
        action: () => router.push(`/blog/${article.slug}`),
        keywords: `${article.title} ${article.excerpt} ${article.category} blog post article development update`,
      })),
    ]

    const actionCommands: Command[] = [
      { id: 'action-customize', label: 'Customize Website', hint: 'Open all website appearance and performance controls', group: 'Actions', icon: Palette, action: openStudio, keywords: 'settings studio appearance customize theme accent cursor background atmosphere motion performance', featured: true },
      { id: 'action-waitlist', label: 'Join Waitlist', hint: 'Get Beta and launch announcements', group: 'Actions', icon: UserPlus, action: openWaitlist, keywords: 'signup register beta email updates join', featured: true },
      { id: 'action-contact', label: 'Contact the Project', hint: 'Open the contact and feedback page', group: 'Actions', icon: Contact, action: () => router.push('/contact'), keywords: 'contact feedback support question email' },
    ]

    const appearanceCommands: Command[] = [
      ...THEME_OPTIONS.map((option) => ({
        id: `appearance-theme-${option.value}`,
        label: option.label,
        hint: option.hint,
        status: currentAppearance,
        active: settings.theme === option.value,
        group: 'Appearance' as const,
        icon: option.icon,
        action: () => update('theme', option.value),
        keywords: 'light dark system theme appearance display color scheme current',
        featured: true,
      })),
      ...BACKGROUND_STYLES.map((option) => ({
        id: `appearance-background-${option.key}`,
        label: `Use ${option.label} Background`,
        hint: option.desc,
        status: settings.backgroundStyle === option.key ? 'Current' : undefined,
        active: settings.backgroundStyle === option.key,
        group: 'Appearance' as const,
        icon: Waves,
        action: () => update('backgroundStyle', option.key),
        keywords: `${option.label} background style grid dots lines canvas texture glow`,
      })),
      ...BACKGROUND_MODES.map((option) => ({
        id: `appearance-atmosphere-${option.key}`,
        label: `Use ${option.label} Atmosphere`,
        hint: option.desc,
        status: settings.backgroundMode === option.key ? 'Current' : undefined,
        active: settings.backgroundMode === option.key,
        group: 'Appearance' as const,
        icon: Globe2,
        action: () => update('backgroundMode', option.key),
        keywords: `${option.label} atmosphere ambient background mood`,
      })),
      ...MOTION_OPTIONS.map((option) => ({
        id: `appearance-motion-${option.value}`,
        label: option.label,
        hint: option.hint,
        status: settings.motionMode === option.value ? 'Current' : undefined,
        active: settings.motionMode === option.value,
        group: 'Appearance' as const,
        icon: Activity,
        action: () => update('motionMode', option.value),
        keywords: 'motion animation reduced off accessibility movement',
      })),
      ...PERFORMANCE_OPTIONS.map((option) => ({
        id: `appearance-performance-${option.value}`,
        label: option.label,
        hint: option.hint,
        status: settings.performance === option.value ? 'Current' : undefined,
        active: settings.performance === option.value,
        group: 'Appearance' as const,
        icon: Gauge,
        action: () => update('performance', option.value),
        keywords: 'performance battery saver balanced high effects speed efficiency',
      })),
      ...(Object.entries(ACCENTS) as Array<[AccentKey, (typeof ACCENTS)[AccentKey]]>).map(([key, accent]) => ({
        id: `appearance-accent-${key}`,
        label: `Use ${accent.label} Accent`,
        hint: accent.description,
        status: settings.accent === key ? 'Current' : undefined,
        active: settings.accent === key,
        group: 'Appearance' as const,
        icon: Palette,
        action: () => update('accent', key),
        keywords: `${accent.label} accent color colour palette brand highlight ${accent.group}`,
      })),
      ...CURSOR_OPTIONS.map((option) => ({
        id: `appearance-cursor-${option.value}`,
        label: `Use ${option.label}`,
        hint: 'Change the main website cursor style',
        status: settings.cursor === option.value ? 'Current' : undefined,
        active: settings.cursor === option.value,
        group: 'Appearance' as const,
        icon: MousePointer2,
        action: () => update('cursor', option.value),
        keywords: `${option.label} cursor pointer mouse interface`,
      })),
    ]

    const gatewayCommands: Command[] = [
      { id: 'gateway-reopen', label: 'Reopen Entry Gateway', hint: 'Open the independent Gaming Horizon Entry Gateway', group: 'Gateway', icon: Sparkles, action: reopenGateway, keywords: 'gateway entry reopen universe welcome open', featured: true },
    ]

    return [...pageCommands, ...gameCommands, ...blogCommands, ...actionCommands, ...appearanceCommands, ...gatewayCommands]
  }, [openStudio, openWaitlist, reopenGateway, resolvedTheme, router, settings, update])

  const visible = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      const recent = recentIds.map((id) => commands.find((command) => command.id === id)).filter((command): command is Command => Boolean(command))
      const recentSet = new Set(recent.map((command) => command.id))
      const featured = commands.filter((command) => command.featured && !recentSet.has(command.id))
      return [
        ...recent.map((command) => ({ ...command, displayGroup: 'Recent' as CommandGroup, score: 1000 })),
        ...featured.map((command) => ({ ...command, displayGroup: command.group as CommandGroup, score: 10 })),
      ]
    }
    return commands
      .map((command) => ({ ...command, displayGroup: command.group as CommandGroup, score: fuzzyScore(command, trimmed) }))
      .filter((command) => command.score >= 0)
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
  }, [commands, query, recentIds])

  const grouped = useMemo(() => GROUP_ORDER
    .map((group) => ({ group, commands: visible.filter((command) => command.displayGroup === group) }))
    .filter((entry) => entry.commands.length), [visible])

  useEffect(() => setActive(0), [query, settings.theme])

  const orderedVisible = useMemo(() => grouped.flatMap((entry) => entry.commands), [grouped])

  useEffect(() => {
    if (active >= orderedVisible.length) setActive(Math.max(0, orderedVisible.length - 1))
  }, [active, orderedVisible.length])

  const remember = (id: string) => {
    setRecentIds((current) => {
      const next = [id, ...current.filter((item) => item !== id)].slice(0, MAX_RECENT)
      if (analyticsAllowed) {
        try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)) } catch { /* remain in memory */ }
      }
      return next
    })
  }

  const execute = (command: Command) => {
    remember(command.id)
    closeAnd(command.action)
  }

  const moveActive = (direction: 1 | -1) => {
    if (!orderedVisible.length) return
    setActive((current) => (current + direction + orderedVisible.length) % orderedVisible.length)
  }

  const onDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      return
    }
    if (event.key !== 'Tab') return
    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('input,button,[href],[tabindex]:not([tabindex="-1"])') ?? []).filter((element) => !element.hasAttribute('disabled'))
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

  const activeCommand = orderedVisible[active]
  let flatIndex = -1

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[500] flex items-start justify-center bg-black/35 px-3 pt-[max(calc(var(--banner-h,0px)+var(--nav-h,64px)+1rem),8vh)] backdrop-blur-[3px] sm:px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event: ReactMouseEvent<HTMLDivElement>) => { if (event.currentTarget === event.target) setOpen(false) }}>
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search and command palette"
            className="glass-panel flex max-h-[calc(100dvh-var(--banner-h,0px)-var(--nav-h,64px)-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border/75 shadow-2xl"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 430, damping: 35 }}
            onKeyDown={onDialogKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-border/70 px-4 sm:px-5">
              <Search className="size-5 shrink-0 text-[rgb(var(--accent-1))]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
                onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>) => {
                  if (event.key === 'ArrowDown') { event.preventDefault(); moveActive(1) }
                  if (event.key === 'ArrowUp') { event.preventDefault(); moveActive(-1) }
                  if (event.key === 'Enter' && activeCommand) { event.preventDefault(); execute(activeCommand) }
                }}
                placeholder="Search pages, games, blog, settings, and actions…"
                className="h-16 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                aria-label="Search Gaming Horizon"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-results"
                aria-activedescendant={activeCommand ? `command-option-${activeCommand.id}` : undefined}
                aria-autocomplete="list"
              />
              <kbd className="hidden rounded-lg border border-border bg-muted/65 px-2 py-1 text-[10px] font-semibold text-muted-foreground sm:block">ESC</kbd>
            </div>

            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {orderedVisible.length} {orderedVisible.length === 1 ? 'result' : 'results'}. {activeCommand ? `Active option: ${activeCommand.label}.` : ''}
            </div>

            <div id="command-results" role="listbox" aria-label="Search results" className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
              {grouped.length ? grouped.map(({ group, commands: groupCommands }) => (
                <section key={group} aria-labelledby={`command-group-${group.toLowerCase()}`} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
                    <h2 id={`command-group-${group.toLowerCase()}`} className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{group}</h2>
                    <span className="text-[10px] text-muted-foreground">{groupCommands.length}</span>
                  </div>
                  <div className="grid gap-1">
                    {groupCommands.map((command) => {
                      flatIndex += 1
                      const index = flatIndex
                      const Icon = command.icon
                      const selected = active === index
                      return (
                        <button
                          key={`${command.displayGroup}-${command.id}`}
                          id={`command-option-${command.id}`}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onMouseEnter={() => setActive(index)}
                          onClick={() => execute(command)}
                          className={cn('group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.72)]', selected ? 'bg-[rgb(var(--accent-1)/0.12)] text-foreground' : 'text-muted-foreground hover:bg-muted/55 hover:text-foreground')}
                        >
                          {selected && <motion.span layoutId="command-active" className="pointer-events-none absolute inset-0 rounded-2xl border border-[rgb(var(--accent-1)/0.28)]" transition={{ type: 'spring', stiffness: 430, damping: 34 }} />}
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-background/55"><Icon className="size-[18px] text-[rgb(var(--accent-1))]" /></span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2 text-sm font-bold">
                              {command.label}
                              {command.status && <span className="rounded-full border border-[rgb(var(--accent-1)/0.22)] bg-[rgb(var(--accent-1)/0.08)] px-2 py-0.5 text-[9px] font-bold tracking-[0.04em] text-[rgb(var(--accent-1))]">{command.status}</span>}
                              {command.active && <Check className="size-3.5 text-[rgb(var(--accent-1))]" aria-label="Current setting" />}
                            </span>
                            <span className="block text-xs leading-5 text-muted-foreground">{command.hint}</span>
                          </span>
                          <Sparkles className={cn('size-4 shrink-0 transition-opacity', selected ? 'opacity-65' : 'opacity-0')} aria-hidden="true" />
                        </button>
                      )
                    })}
                  </div>
                </section>
              )) : <div className="px-4 py-12 text-center"><p className="text-sm font-semibold text-foreground">No matching result</p><p className="mt-1 text-xs text-muted-foreground">Try a page, game, theme, Beta, Blog, pricing, AI, community, privacy, or Gateway.</p></div>}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 px-4 py-2.5 text-[10px] text-muted-foreground sm:px-5">
              <span>↑↓ Navigate · Enter Select · Esc Close</span>
              <span className="inline-flex items-center gap-1"><Settings2 className="size-3" /> Ctrl/⌘ K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
