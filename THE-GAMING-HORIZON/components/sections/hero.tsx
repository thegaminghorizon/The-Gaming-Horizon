'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bot,
  ChevronDown,
  Clock3,
  Compass,
  Gamepad2,
  Grid2X2,
  Layers3,
  MessageCircle,
  Play,
  Radio,
  Search,
  Sparkles,
  Target,
  Trophy,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { Countdown } from '@/components/countdown'
import { BETA_DATE, LAUNCH_DATE } from '@/lib/data'
import { useMilestoneClock } from '@/lib/use-milestone-clock'
import { useUI } from '@/components/providers/ui-provider'
import { useSettings } from '@/components/providers/settings-provider'
import { cn } from '@/lib/utils'
import { CinematicHero } from '@/components/sections/cinematic-hero'

const EASE = [0.22, 1, 0.36, 1] as const
const PANEL_TRANSITION = { duration: 0.22, ease: EASE }

type DashboardTab = 'home' | 'discover' | 'progress' | 'community'

const TABS: Array<{ id: DashboardTab; label: string; icon: typeof Gamepad2 }> = [
  { id: 'home', label: 'Home', icon: Grid2X2 },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'progress', label: 'Progress', icon: Trophy },
  { id: 'community', label: 'Community', icon: Users },
]

const games = [
  {
    title: 'PolyTrack',
    genre: 'Precision racing',
    fit: 'Quick session',
    gradient: 'from-cyan-400 via-blue-500 to-violet-600',
  },
  {
    title: 'Smash Karts',
    genre: 'Multiplayer action',
    fit: 'Play with friends',
    gradient: 'from-fuchsia-500 via-violet-500 to-indigo-600',
  },
  {
    title: 'Slow Roads',
    genre: 'Relaxed driving',
    fit: 'Low-pressure play',
    gradient: 'from-emerald-400 via-cyan-500 to-blue-600',
  },
]


function GameTile({ game }: { game: (typeof games)[number] }) {
  const systemReducedMotion = useReducedMotion()
  const { settings } = useSettings()
  const reduceMotion = systemReducedMotion || settings.motionMode !== 'full'

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group/game min-w-0 select-none rounded-[18px] border border-border/65 bg-background/78 p-2.5 shadow-[0_12px_30px_-26px_rgba(15,23,42,.42)]"
    >
      <div className={`relative h-24 overflow-hidden rounded-[14px] bg-gradient-to-br ${game.gradient} sm:h-28`}>
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_10%,rgba(255,255,255,.24),transparent_72%)] opacity-65" />
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-white/92 text-zinc-900 shadow-lg transition-transform duration-200 group-hover/game:scale-105">
            <Play className="size-3.5 fill-current" />
          </span>
          <span className="rounded-lg border border-white/25 bg-black/28 px-2 py-1 text-[8px] font-bold text-white backdrop-blur-md">
            {game.fit}
          </span>
        </div>
      </div>
      <p className="mt-2.5 truncate text-[11px] font-bold text-foreground">{game.title}</p>
      <p className="mt-0.5 truncate text-[9px] text-muted-foreground">{game.genre}</p>
    </motion.article>
  )
}

function PreviewCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-[22px] border border-border/70 bg-card/74 p-4 text-left shadow-[0_16px_40px_-32px_rgba(15,23,42,.42)] sm:p-5',
        className,
      )}
    >
      {children}
    </div>
  )
}

function HomePanel() {
  return (
    <div className="grid h-full gap-3 lg:grid-cols-[1.48fr_.82fr]">
      <div className="grid min-w-0 gap-3 lg:grid-rows-[1.13fr_.87fr]">
        <article className="relative min-h-[246px] select-none overflow-hidden rounded-[24px] border border-[rgb(var(--accent-1)/0.18)] bg-[linear-gradient(135deg,rgb(var(--accent-1)),rgb(var(--accent-2)),rgb(var(--accent-3)))] p-5 text-left text-white shadow-[0_22px_60px_-32px_rgb(var(--accent-2)/.85)] sm:p-6">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,255,255,.28),transparent_32%),linear-gradient(135deg,transparent,rgba(255,255,255,.08))]" />
          <div aria-hidden className="absolute -right-16 -top-20 size-64 rounded-full border border-white/18" />
          <div aria-hidden className="absolute -right-4 top-1/2 size-36 rounded-full border border-white/12" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] backdrop-blur-md">
                <Sparkles className="size-3" />
                Home overview
              </div>
              <h2 className="mt-5 max-w-xl font-heading text-3xl font-black leading-[1.02] tracking-[-0.045em] sm:text-4xl lg:text-[2.75rem]">
                Continue without starting over.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/78">
                Saved sessions, discovery, identity, and community live together in one browser-first home.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-zinc-950 shadow-lg">
                <Play className="size-3.5 fill-current" />
                Resume preview
              </span>
              <span className="rounded-xl border border-white/20 bg-white/10 px-3.5 py-3 text-[10px] font-semibold backdrop-blur-md">
                No launcher required
              </span>
            </div>
          </div>
        </article>

        <PreviewCard>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.10)] text-[rgb(var(--accent-1))]">
                <Bot className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold">Recommended for this session</p>
                <p className="text-[9px] text-muted-foreground">Context-aware discovery, never an endless grid</p>
              </div>
            </div>
            <Compass className="size-4 text-[rgb(var(--accent-1))]" />
          </div>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {games.map((game) => (
              <GameTile key={game.title} game={game} />
            ))}
          </div>
        </PreviewCard>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-3">
        <PreviewCard>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[linear-gradient(135deg,rgb(var(--accent-1)),rgb(var(--accent-2)))] text-[10px] font-black text-white">
                GH
              </span>
              <div>
                <p className="text-xs font-bold">Persistent identity</p>
                <p className="text-[9px] text-muted-foreground">One profile across the ecosystem</p>
              </div>
            </div>
            <Activity className="size-4 text-[rgb(var(--accent-1))]" />
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,rgb(var(--accent-1)),rgb(var(--accent-2)))]" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {['Identity', 'Badges', 'History'].map((label) => (
              <div key={label} className="rounded-xl border border-border/55 bg-muted/38 p-2.5">
                <BadgeCheck className="mx-auto size-3.5 text-[rgb(var(--accent-1))]" />
                <p className="mt-1 text-[8px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </PreviewCard>

        <PreviewCard>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold">Daily challenge preview</p>
            <Zap className="size-4 text-amber-500" />
          </div>
          <div className="rounded-[16px] border border-amber-500/16 bg-amber-500/6 p-3.5">
            <p className="text-[10px] font-bold">Build a three-session streak</p>
            <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
              A simple example of progression designed to reward returning play.
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/80">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
            </div>
          </div>
        </PreviewCard>

        <PreviewCard className="sm:col-span-2 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold">Ecosystem status</p>
            <Layers3 className="size-4 text-[rgb(var(--accent-2))]" />
          </div>
          <div className="space-y-2.5">
            {[
              { icon: Search, color: 'bg-[rgb(var(--accent-1)/0.10)] text-[rgb(var(--accent-1))]', text: 'Discovery keeps the next experience close' },
              { icon: Trophy, color: 'bg-amber-500/10 text-amber-600', text: 'Progress remains attached to your identity' },
              { icon: Users, color: 'bg-[rgb(var(--accent-2)/0.10)] text-[rgb(var(--accent-2))]', text: 'Community features connect around each game' },
            ].map(({ icon: Icon, color, text }) => (
              <div key={text} className="flex items-center gap-2.5 rounded-xl border border-border/55 bg-background/65 p-2.5">
                <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${color}`}>
                  <Icon className="size-3.5" />
                </span>
                <p className="text-[9px] font-medium leading-4 text-foreground/82">{text}</p>
              </div>
            ))}
          </div>
        </PreviewCard>
      </div>
    </div>
  )
}

function DiscoverPanel() {
  return (
    <div className="flex h-full flex-col gap-3">
      <PreviewCard className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgb(var(--accent-1)/0.10),transparent_70%)]" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.17em] text-[rgb(var(--accent-1))]">
              <Bot className="size-3.5" /> Session-aware discovery
            </div>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
              Find experiences worth returning to.
            </h2>
            <p className="mt-2 max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
              Recommendations can consider available time, device capability, preferred pace, and the kind of session you want—without invasive cross-site tracking.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {['Quick session', 'Multiplayer', 'Relaxed', 'Low-spec friendly'].map((item) => (
              <span key={item} className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-[9px] font-semibold text-muted-foreground">
                {item}
              </span>
            ))}
          </div>
        </div>
      </PreviewCard>

      <div className="grid flex-1 gap-3 md:grid-cols-3">
        {games.map((game, index) => (
          <PreviewCard key={game.title} className="flex h-full flex-col p-3 sm:p-4">
            <div className={`relative min-h-32 flex-1 overflow-hidden rounded-[17px] bg-gradient-to-br ${game.gradient}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(255,255,255,.32),transparent_32%)]" />
              <span className="absolute left-3 top-3 rounded-lg border border-white/25 bg-black/22 px-2 py-1 text-[8px] font-bold text-white backdrop-blur-md">
                {index === 0 ? 'Best fit now' : game.fit}
              </span>
              <span className="absolute bottom-3 left-3 grid size-10 place-items-center rounded-full bg-white/92 text-zinc-950 shadow-lg">
                <Play className="size-4 fill-current" />
              </span>
            </div>
            <div className="pt-3">
              <p className="text-sm font-bold">{game.title}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{game.genre}</p>
              <p className="mt-3 text-[10px] leading-4 text-foreground/75">
                {index === 0
                  ? 'A focused choice for a short session with instant browser access.'
                  : index === 1
                    ? 'A social option designed for fast shared sessions.'
                    : 'A calm experience that adapts well to the time you have.'}
              </p>
            </div>
          </PreviewCard>
        ))}
      </div>
    </div>
  )
}

function ProgressPanel() {
  return (
    <div className="grid h-full gap-3 lg:grid-cols-[.92fr_1.08fr]">
      <PreviewCard className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_top,rgb(var(--accent-1)/0.13),transparent_72%)]" />
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,rgb(var(--accent-1)),rgb(var(--accent-2)))] text-xs font-black text-white shadow-lg">
                GH
              </span>
              <div>
                <p className="text-sm font-bold">Preview player identity</p>
                <p className="text-[10px] text-muted-foreground">Illustrative interface state</p>
              </div>
            </div>
            <BadgeCheck className="size-5 text-[rgb(var(--accent-1))]" />
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between text-[10px] font-semibold">
              <span>Current milestone path</span>
              <span className="text-[rgb(var(--accent-1))]">In progress</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[68%] rounded-full bg-[linear-gradient(90deg,rgb(var(--accent-1)),rgb(var(--accent-2)),rgb(var(--accent-3)))]" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2.5">
            {[
              { icon: Trophy, label: 'Achievements', detail: 'Portable milestones' },
              { icon: Target, label: 'Challenges', detail: 'Purposeful return loops' },
              { icon: BadgeCheck, label: 'Badges', detail: 'Identity expression' },
              { icon: Clock3, label: 'History', detail: 'Sessions remembered' },
            ].map(({ icon: Icon, label, detail }) => (
              <div key={label} className="rounded-2xl border border-border/65 bg-background/65 p-3">
                <Icon className="size-4 text-[rgb(var(--accent-1))]" />
                <p className="mt-2 text-[10px] font-bold">{label}</p>
                <p className="mt-1 text-[9px] leading-4 text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </PreviewCard>

      <div className="grid gap-3 sm:grid-cols-2">
        <PreviewCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold">Achievement path</p>
              <p className="mt-1 text-[9px] text-muted-foreground">Meaningful moments across games</p>
            </div>
            <Trophy className="size-4 text-amber-500" />
          </div>
          <div className="mt-4 space-y-2.5">
            {['First browser session', 'Return to a saved game', 'Complete a community challenge'].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-border/55 bg-background/62 p-3">
                <span className={cn('grid size-8 place-items-center rounded-lg', index === 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground')}>
                  {index === 0 ? <BadgeCheck className="size-3.5" /> : <Target className="size-3.5" />}
                </span>
                <div>
                  <p className="text-[10px] font-semibold">{item}</p>
                  <p className="mt-0.5 text-[8px] text-muted-foreground">{index === 0 ? 'Example complete state' : 'Preview milestone'}</p>
                </div>
              </div>
            ))}
          </div>
        </PreviewCard>

        <PreviewCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold">Daily challenge system</p>
              <p className="mt-1 text-[9px] text-muted-foreground">Progress without pressure</p>
            </div>
            <Zap className="size-4 text-amber-500" />
          </div>
          <div className="mt-4 rounded-2xl border border-amber-500/16 bg-amber-500/6 p-4">
            <p className="text-[10px] font-bold">Explore two different genres</p>
            <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
              An example challenge that encourages discovery rather than repetitive grinding.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
              <span className="h-1.5 flex-1 rounded-full bg-background" />
            </div>
          </div>
        </PreviewCard>

        <PreviewCard className="sm:col-span-2">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Cross-game identity', 'A single place for your player history.'],
              ['Persistent progression', 'Return without losing the thread.'],
              ['Accessible goals', 'Clear milestones designed for different play styles.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-border/60 bg-background/58 p-3.5">
                <p className="text-[10px] font-bold">{title}</p>
                <p className="mt-1 text-[9px] leading-4 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </PreviewCard>
      </div>
    </div>
  )
}

function CommunityPanel() {
  return (
    <div className="grid h-full gap-3 lg:grid-cols-[1.08fr_.92fr]">
      <div className="grid gap-3 sm:grid-cols-2">
        <PreviewCard className="sm:col-span-2">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.17em] text-[rgb(var(--accent-1))]">
                <Users className="size-3.5" /> Community, close to every game
              </div>
              <h2 className="mt-2 font-heading text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
                Play together without leaving the experience.
              </h2>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                Presence, invites, shared sessions, and game-specific updates are designed as one connected layer—not separate social clutter.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-background/68 px-3 py-2 text-[9px] font-semibold text-muted-foreground">
              <Radio className="size-3.5 text-emerald-500" /> Opens with Public Beta
            </span>
          </div>
        </PreviewCard>

        <PreviewCard>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold">Friends presence</p>
            <Users className="size-4 text-emerald-500" />
          </div>
          <div className="mt-4 space-y-2.5">
            {['Available to join', 'In a shared session', 'Open to an invite'].map((state, index) => (
              <div key={state} className="flex items-center gap-3 rounded-xl border border-border/55 bg-background/62 p-3">
                <span className="relative grid size-9 place-items-center rounded-full bg-gradient-to-br from-violet-500/18 to-blue-500/18 text-[9px] font-bold text-[rgb(var(--accent-1))]">
                  {index + 1}
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold">Presence state preview</p>
                  <p className="mt-0.5 text-[8px] text-muted-foreground">{state}</p>
                </div>
              </div>
            ))}
          </div>
        </PreviewCard>

        <PreviewCard>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold">Shared sessions</p>
            <UserPlus className="size-4 text-[rgb(var(--accent-2))]" />
          </div>
          <div className="mt-4 rounded-2xl border border-[rgb(var(--accent-2)/0.14)] bg-[rgb(var(--accent-2)/0.05)] p-4">
            <p className="text-[10px] font-bold">Invite from the game you are viewing</p>
            <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
              Session controls stay contextual and remain locked until the Beta Platform opens.
            </p>
            <button disabled type="button" className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl border border-border/70 bg-background/70 px-3 text-[9px] font-semibold text-muted-foreground opacity-75">
              <UserPlus className="size-3.5" /> Preview only
            </button>
          </div>
        </PreviewCard>
      </div>

      <div className="grid gap-3 lg:grid-rows-2">
        <PreviewCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold">Game community updates</p>
              <p className="mt-1 text-[9px] text-muted-foreground">Useful context, not fabricated activity</p>
            </div>
            <MessageCircle className="size-4 text-[rgb(var(--accent-1))]" />
          </div>
          <div className="mt-4 space-y-2.5">
            {[
              ['Strategy spaces', 'Guides and discussions stay attached to each game.'],
              ['Community challenges', 'Shared goals can connect play and progression.'],
              ['Event notices', 'Important updates surface without overwhelming the home.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl border border-border/55 bg-background/62 p-3">
                <p className="text-[10px] font-semibold">{title}</p>
                <p className="mt-1 text-[8.5px] leading-4 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </PreviewCard>

        <PreviewCard>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold">Community principles</p>
            <BadgeCheck className="size-4 text-emerald-500" />
          </div>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ['Player control', 'Presence and personalization remain optional.'],
              ['Accessible by design', 'Keyboard, touch, and assistive technology are part of the core experience.'],
              ['Built in public', 'Status and development updates stay visible before launch.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl border border-border/55 bg-background/62 p-3">
                <p className="text-[10px] font-semibold">{title}</p>
                <p className="mt-1 text-[8.5px] leading-4 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </PreviewCard>
      </div>
    </div>
  )
}

const PANELS: Record<DashboardTab, React.ReactNode> = {
  home: <HomePanel />,
  discover: <DiscoverPanel />,
  progress: <ProgressPanel />,
  community: <CommunityPanel />,
}

function HorizonDashboard() {
  const systemReducedMotion = useReducedMotion()
  const { settings } = useSettings()
  const reduceMotion = systemReducedMotion || settings.motionMode !== 'full'
  const frame = useRef<number | null>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const tabsId = useId()
  const [activeTab, setActiveTab] = useState<DashboardTab>('home')

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType === 'touch') return
    const dashboard = dashboardRef.current
    if (!dashboard) return
    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const rect = dashboard.getBoundingClientRect()
      dashboard.style.setProperty('--hero-spot-x', `${event.clientX - rect.left}px`)
      dashboard.style.setProperty('--hero-spot-y', `${event.clientY - rect.top}px`)
    })
  }

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % TABS.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + TABS.length) % TABS.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = TABS.length - 1
    else return

    event.preventDefault()
    const nextTab = TABS[next]
    setActiveTab(nextTab.id)
    tabRefs.current[next]?.focus()
  }

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    },
    [],
  )

  const dashboardFrame = (
    <div
      ref={dashboardRef}
      onPointerMove={onPointerMove}
      data-decorative-surface="true" className="group/dashboard relative min-w-0 select-none overflow-hidden rounded-[34px] border border-black/[0.07] bg-white/94 p-2.5 shadow-[0_46px_130px_-68px_rgb(var(--accent-1)/.58)] ring-1 ring-white/90 dark:border-white/[0.09] dark:bg-zinc-950/92 dark:ring-white/5 sm:p-3"
      style={{ '--hero-spot-x': '50%', '--hero-spot-y': '42%' } as CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/dashboard:opacity-100"
        style={{ background: 'radial-gradient(560px circle at var(--hero-spot-x) var(--hero-spot-y), rgb(var(--accent-1) / 0.09), transparent 64%)' }}
      />

      <div className="relative overflow-hidden rounded-[25px] border border-border/70 bg-background/94">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border/65 px-4 py-3 sm:px-5 lg:flex-nowrap lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-[linear-gradient(135deg,rgb(var(--accent-1)),rgb(var(--accent-2)),rgb(var(--accent-3)))] text-white shadow-[0_12px_28px_-15px_rgb(var(--accent-2)/.9)]">
              <Gamepad2 className="size-5" />
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-bold tracking-[-0.02em]">Gaming Horizon</p>
              <p className="truncate text-[10px] text-muted-foreground">Interactive ecosystem preview</p>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Dashboard preview sections"
            className="order-3 flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-border/55 bg-muted/35 p-1 lg:order-none lg:w-auto"
          >
            {TABS.map((tab, index) => {
              const active = activeTab === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  ref={(node) => { tabRefs.current[index] = node }}
                  id={`${tabsId}-${tab.id}-tab`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`${tabsId}-${tab.id}-panel`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                  className={cn(
                    'relative inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[10px] font-semibold outline-none transition-[color,background-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.65)]',
                    active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/55 hover:text-foreground',
                  )}
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                  {active && (
                    <motion.span
                      layoutId="hero-dashboard-tab"
                      className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-[rgb(var(--accent-1))] to-[rgb(var(--accent-3))]"
                      transition={{ type: 'spring', stiffness: 430, damping: 34 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-lg border border-[rgb(var(--accent-1)/0.16)] bg-[rgb(var(--accent-1)/0.07)] px-2.5 py-1 text-[9px] font-semibold text-[rgb(var(--accent-1))] sm:inline-flex">
              <span className="size-1.5 rounded-full bg-[rgb(var(--accent-1))] shadow-[0_0_10px_rgb(var(--accent-1)/0.65)]" />
              Concept preview
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-[linear-gradient(135deg,rgb(var(--accent-1)),rgb(var(--accent-2)))] text-[10px] font-black text-white shadow-sm">GH</span>
          </div>
        </div>

        <div className="relative h-[760px] p-3 sm:h-[640px] sm:p-4 lg:h-[560px] lg:p-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              id={`${tabsId}-${activeTab}-panel`}
              role="tabpanel"
              aria-labelledby={`${tabsId}-${activeTab}-tab`}
              tabIndex={0}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 12, scale: 0.995 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -10, scale: 0.995 }}
              transition={reduceMotion ? { duration: 0.01 } : PANEL_TRANSITION}
              className="h-full overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--accent-1)/0.55)]"
            >
              {PANELS[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={reduceMotion ? { duration: 0.01 } : { duration: 0.68, ease: EASE }}
      className="relative mx-auto w-full"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-[12%] -top-24 h-64 rounded-[50%] bg-gradient-to-r from-[rgb(var(--accent-1)/0.14)] via-[rgb(var(--accent-2)/0.16)] to-[rgb(var(--accent-3)/0.09)] blur-3xl" />

      <div className="mx-auto min-w-0 max-w-[1240px]">
        {dashboardFrame}
      </div>
    </motion.div>
  )
}

function LaunchCountdownCard({
  label,
  date,
  target,
  variant,
  now,
  primary = false,
}: {
  label: string
  date: string
  target: string
  variant: 'beta' | 'launch'
  now: number | null
  primary?: boolean
}) {
  const systemReducedMotion = useReducedMotion()
  const { settings } = useSettings()
  const reduceMotion = systemReducedMotion || settings.motionMode !== 'full'
  const targetMs = new Date(target).getTime()
  const anticipationStart = new Date('2026-01-01T00:00:00+05:30').getTime()
  const currentMs = now ?? anticipationStart
  const anticipation = Math.max(0, Math.min(1, (currentMs - anticipationStart) / Math.max(1, targetMs - anticipationStart)))
  const glow = primary ? 0.24 + anticipation * 0.22 : 0.16 + anticipation * 0.18

  return (
    <motion.article
      initial={reduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-36px' }}
      transition={reduceMotion ? { duration: 0.01 } : { delay: primary ? 0.1 : 0.18, duration: 0.5, ease: EASE }}
      className={cn(
        'relative min-h-[166px] min-w-0 select-none overflow-hidden rounded-[26px] border bg-background/84 p-4 text-left ring-1 ring-white/65 backdrop-blur-xl sm:p-5 dark:ring-white/5',
        primary ? 'border-[rgb(var(--accent-1)/0.28)]' : 'border-border/78',
      )}
      style={{
        boxShadow: primary
          ? `0 30px 78px -48px rgb(var(--accent-1) / ${glow})`
          : `0 28px 72px -50px rgb(var(--accent-2) / ${glow})`,
      }}
    >
      <span
        aria-hidden
        className={
          primary
            ? 'absolute inset-0 bg-[linear-gradient(135deg,rgb(var(--accent-1)/0.10),transparent,rgb(var(--accent-2)/0.08))]'
            : 'absolute inset-0 bg-[linear-gradient(135deg,rgb(var(--accent-2)/0.07),transparent,rgb(var(--accent-1)/0.05))]'
        }
      />
      <div className="relative flex h-full flex-col">
        <div className="mb-3 flex min-h-11 items-start justify-between gap-3">
          <div>
            <p
              className={
                primary
                  ? 'text-[9px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]'
                  : 'text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground'
              }
            >
              {label}
            </p>
            <p className="mt-1 text-xs font-semibold text-foreground">{date}</p>
          </div>
          <span
            className={
              primary
                ? 'mt-1.5 size-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,.62)]'
                : 'mt-1.5 size-2 rounded-full bg-[rgb(var(--accent-2)/0.8)] shadow-[0_0_12px_rgb(var(--accent-2)/0.42)]'
            }
          />
        </div>
        <Countdown target={target} variant={variant} size="sm" now={now} />
      </div>
    </motion.article>
  )
}

const recommendationExamples = [
  { game: 'Slow Roads', reason: 'A calm 15-minute session that fits your current device.', icon: Sparkles },
  { game: 'PolyTrack', reason: 'Precision racing for a focused, quick challenge.', icon: Target },
  { game: 'Smash Karts', reason: 'A shared session that works well with friends online.', icon: Users },
  { game: 'Little Alchemy 2', reason: 'A thoughtful discovery game for a relaxed mood.', icon: Bot },
]

function RotatingRecommendationCard() {
  const reduceMotion = useReducedMotion()
  const { settings } = useSettings()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const active = recommendationExamples[index]
  const Icon = active.icon
  const rotationEnabled = !reduceMotion && settings.motionMode === 'full'

  useEffect(() => {
    if (!rotationEnabled || paused) return
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % recommendationExamples.length), 6000)
    return () => window.clearInterval(timer)
  }, [paused, rotationEnabled])

  return (
    <div
      data-decorative-surface="true" className="relative h-[116px] w-full max-w-[430px] select-none overflow-hidden rounded-[22px] border border-white/85 bg-background/84 p-4 shadow-[0_24px_64px_-42px_rgb(var(--accent-1)/.5)] ring-1 ring-black/[0.035] backdrop-blur-xl dark:border-white/10 dark:ring-white/5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
      }}
      tabIndex={0}
      aria-label={`AI Recommendation: ${active.game}. ${active.reason}`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent-1)/0.08)] via-transparent to-[rgb(var(--accent-3)/0.06)]" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active.game}
          initial={rotationEnabled ? { opacity: 0, y: 7 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={rotationEnabled ? { opacity: 0, y: -7 } : { opacity: 0 }}
          transition={{ duration: rotationEnabled ? 0.28 : 0.01, ease: EASE }}
          className="relative flex h-full items-start gap-3"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/75 bg-[rgb(var(--accent-1)/0.11)] text-[rgb(var(--accent-1))] shadow-sm dark:border-white/10">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]">AI Recommendation</p>
            <p className="mt-1 text-sm font-bold tracking-[-0.02em] text-foreground">{active.game}</p>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{active.reason}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const worldNodes = [
  { icon: Gamepad2, label: 'Games', className: 'left-[5%] top-[17%]', color: 'from-violet-500 to-indigo-600', delay: 0 },
  { icon: Bot, label: 'AI', className: 'right-[7%] top-[11%]', color: 'from-blue-500 to-cyan-500', delay: 0.5 },
  { icon: Trophy, label: 'Progress', className: 'right-[2%] bottom-[18%]', color: 'from-amber-400 to-orange-500', delay: 1 },
  { icon: Users, label: 'Community', className: 'left-[1%] bottom-[13%]', color: 'from-emerald-400 to-cyan-500', delay: 1.5 },
]

function ConnectedWorldVisual() {
  const systemReducedMotion = useReducedMotion()
  const { settings } = useSettings()
  const reduceMotion =
    systemReducedMotion ||
    settings.motionMode !== 'full' ||
    !settings.heroObjects ||
    !settings.ambientMotion ||
    settings.performance === 'battery'

  return (
    <div className="relative mx-auto aspect-[1.05/1] w-full max-w-[650px] select-none" role="img" aria-label="Connected Gaming Horizon ecosystem visual">
      <div aria-hidden className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgb(var(--accent-1)/0.16),rgb(var(--accent-2)/0.08)_42%,transparent_72%)]" style={{ opacity: 'var(--glow-intensity, .55)' }} />
      <div aria-hidden className="absolute inset-[22%] rounded-full border border-[rgb(var(--accent-1)/0.13)]" />
      <div aria-hidden className="absolute inset-[8%] rounded-full border border-[rgb(var(--accent-2)/0.09)]" />
      <svg aria-hidden className="absolute inset-[8%] size-[84%] overflow-visible" viewBox="0 0 500 500" fill="none">
        <path d="M250 85C360 85 420 160 420 250C420 355 350 415 250 415C145 415 80 350 80 250C80 150 150 85 250 85Z" stroke="rgb(var(--accent-1) / .16)" strokeWidth="1.2" strokeDasharray="6 10" />
        <path d="M118 165C185 210 316 210 383 159M118 335C190 290 320 290 386 338" stroke="rgb(var(--accent-2) / .12)" strokeWidth="1" />
        <path d="M250 105V395M105 250H395" stroke="rgb(var(--accent-3) / .10)" strokeWidth="1" />
      </svg>

      <motion.div
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.92, y: reduceMotion ? 0 : 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.75, delay: reduceMotion ? 0 : 0.28, ease: EASE }}
        data-decorative-surface="true" className="absolute left-1/2 top-1/2 grid size-[42%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[34%] border border-white/80 bg-background/76 shadow-[0_38px_100px_-48px_rgb(var(--accent-1)/.75)] ring-1 ring-black/[0.04] backdrop-blur-xl dark:border-white/10 dark:ring-white/5"
      >
        <div aria-hidden className="absolute inset-[8%] rounded-[30%] bg-gradient-to-br from-[rgb(var(--accent-1)/0.16)] via-[rgb(var(--accent-2)/0.09)] to-[rgb(var(--accent-3)/0.14)]" />
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -5, 0], scale: [1, 1.015, 1] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative grid size-[58%] place-items-center rounded-[30%] bg-gradient-to-br from-[rgb(var(--accent-1))] via-[rgb(var(--accent-2))] to-[rgb(var(--accent-3))] text-white shadow-[0_24px_55px_-24px_rgb(var(--accent-1)/0.8)]"
        >
          <Layers3 className="size-[38%]" />
        </motion.div>
        <div className="absolute inset-x-0 bottom-[8%] text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">One connected universe</p>
        </div>
      </motion.div>

      {worldNodes.map((node, index) => {
        const Icon = node.icon
        return (
          <motion.div
            key={node.label}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 14, scale: reduceMotion ? 1 : 0.94 }}
            animate={reduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: [0, index % 2 ? 5 : -5, 0], scale: 1 }}
            transition={reduceMotion ? { duration: 0.01 } : {
              opacity: { duration: 0.5, delay: 0.42 + index * 0.08 },
              scale: { duration: 0.5, delay: 0.42 + index * 0.08 },
              y: { duration: 7 + index * 0.6, repeat: Infinity, ease: 'easeInOut', delay: node.delay },
            }}
            data-decorative-surface="true" className={`absolute ${node.className} w-[112px] rounded-[20px] sm:w-[140px] sm:rounded-[22px] lg:w-[150px] border border-white/82 bg-background/84 p-3 shadow-[0_25px_70px_-42px_rgba(30,41,59,.5)] ring-1 ring-black/[0.035] backdrop-blur-xl dark:border-white/10 dark:ring-white/5`}
          >
            <span className={`grid size-10 place-items-center rounded-2xl bg-gradient-to-br ${node.color} text-white shadow-sm`}><Icon className="size-4.5" /></span>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{node.label}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-foreground">Connected by identity</p>
          </motion.div>
        )
      })}

      {[18, 34, 61, 78].map((left, index) => (
        <motion.span
          key={left}
          aria-hidden
          className="absolute size-1.5 rounded-full bg-[rgb(var(--accent-2)/0.55)]"
          style={{ left: `${left}%`, top: `${24 + (index % 2) * 48}%` }}
          animate={reduceMotion || !settings.particlesEnabled || !settings.ambientMotion ? undefined : { opacity: [0.18, 0.65, 0.18], y: [0, -7, 0] }}
          transition={{ duration: 5.5 + index, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

export function Hero() {
  return <CinematicHero />
}

export function HeroProductPreview() {
  const now = useMilestoneClock()
  return (
    <section id="product-preview" data-interface-copy="true" className="relative scroll-mt-28 overflow-hidden px-4 py-20 cq-px-6-sm cq-py-28">
      <div aria-hidden className="pointer-events-none absolute inset-x-[18%] top-28 h-80 rounded-[50%] bg-[radial-gradient(ellipse,rgb(var(--accent-1)/0.09),transparent_70%)]" style={{ opacity: 'var(--glow-intensity, .55)' }} />
      <div className="relative mx-auto max-w-[1540px]">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[rgb(var(--accent-1))]">Product Preview</p>
          <h2 tabIndex={-1} className="mt-4 font-heading text-[clamp(2.25rem,5vw,4.6rem)] font-black leading-[0.98] tracking-[-0.05em] text-foreground outline-none">One home. Every part of play.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">Explore how discovery, progression, identity, and community connect without leaving the browser.</p>
        </div>

        <HorizonDashboard />

        <div className="mx-auto mt-7 grid w-full max-w-[1220px] gap-4 md:grid-cols-2">
          <LaunchCountdownCard label="Public Beta" date="January 1, 2027 · 12:01 AM IST" target={BETA_DATE} variant="beta" now={now} primary />
          <LaunchCountdownCard label="Official Launch" date="March 1, 2028 · 12:01 AM IST" target={LAUNCH_DATE} variant="launch" now={now} />
        </div>
      </div>
    </section>
  )
}
