'use client'

import { motion } from 'framer-motion'
import {
  Trophy,
  Flame,
  Users,
  Sparkles,
  Star,
  Gamepad2,
  TrendingUp,
  CheckCircle2,
  Clock,
  Lock,
} from 'lucide-react'
import { Reveal, SectionHeading, DetailButton, AnimatedCounter } from '@/components/ui/primitives'

const USER = {
  name: 'Nova Rivera',
  handle: '@novaplays',
  tier: 'Founding Member',
  level: 24,
  levelProgress: 68,
  streak: 12,
  friendsOnline: 5,
  friendsTotal: 38,
  waitlistNumber: 1147,
}

const ACHIEVEMENTS = [
  { name: 'First Lap', game: 'PolyTrack', rarity: 'Common', icon: Trophy },
  { name: 'Sharpshooter', game: 'Shell Shockers', rarity: 'Rare', icon: Star },
  { name: 'Puzzle Streak', game: '2048', rarity: 'Epic', icon: Sparkles },
]

const FAVORITES = [
  { name: 'PolyTrack', genre: 'Racing', hue: '250 100% 70%', hours: 14 },
  { name: 'Krunker', genre: 'FPS', hue: '10 90% 60%', hours: 9 },
  { name: 'Tetris', genre: 'Puzzle', hue: '190 85% 55%', hours: 21 },
]

const RECS = [
  { game: 'Smash Karts', why: 'Because you love fast multiplayer', match: 94 },
  { game: 'Slow Roads', why: 'A calm break from ranked play', match: 88 },
]

const ACTIVITY = [
  { label: 'Reached Level 24', time: '2h ago', icon: TrendingUp },
  { label: 'Unlocked “Puzzle Streak”', time: 'Yesterday', icon: Trophy },
  { label: 'Added Krunker to favorites', time: '3d ago', icon: Star },
]

const rarityColor: Record<string, string> = {
  Common: '220 15% 65%',
  Rare: '200 90% 60%',
  Epic: '275 90% 68%',
}

function Card({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <Reveal delay={delay} className={className}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        className="glass gh-card-hover h-full rounded-2xl p-5"
      >
        {children}
      </motion.div>
    </Reveal>
  )
}

export function DashboardPreview() {
  return (
    <section id="dashboard" className="relative scroll-mt-28 px-4 py-20 cq-py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 0%, rgb(var(--accent-2)/0.14), transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="A glimpse of your account"
            title="Your dashboard, after launch"
            subtitle="This is a preview of the personal home you'll get once you sign in — progress, achievements, favorites and AI picks, all in one place."
          />
          <DetailButton href="/platform" label="Explore the platform" />
        </div>

        {/* Preview chrome */}
        <Reveal delay={0.1} className="mt-12">
          <div className="rounded-3xl border border-border/70 bg-muted/20 p-2 shadow-2xl backdrop-blur-sm">
            {/* window bar */}
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="size-2.5 rounded-full bg-[hsl(0_70%_60%)]" />
              <span className="size-2.5 rounded-full bg-[hsl(40_90%_58%)]" />
              <span className="size-2.5 rounded-full bg-[hsl(140_60%_50%)]" />
              <span className="ml-3 inline-flex items-center gap-1.5 rounded-md bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                <Lock className="size-3" />
                gaminghorizon.app/dashboard
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--accent-1)/0.14)] px-2.5 py-1 text-[10px] font-medium text-[rgb(var(--accent-1))]">
                <Sparkles className="size-3" />
                Preview
              </span>
            </div>

            {/* dashboard grid */}
            <div className="rounded-2xl bg-background/40 p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {/* Profile — spans */}
                <Card className="col-span-2" delay={0.02}>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div
                        className="grid size-14 place-items-center rounded-2xl font-heading text-xl font-bold text-white"
                        style={{
                          background:
                            'linear-gradient(135deg, rgb(var(--accent-1)), rgb(var(--accent-3)))',
                        }}
                      >
                        {USER.name.charAt(0)}
                      </div>
                      <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-background bg-[rgb(var(--accent-2))] text-[10px] font-bold text-white">
                        {USER.level}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-heading text-lg font-semibold">
                        {USER.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{USER.handle}</p>
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[rgb(var(--accent-1)/0.14)] px-2 py-0.5 text-[10px] font-medium text-[rgb(var(--accent-1))]">
                        <Star className="size-3" />
                        {USER.tier}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Level {USER.level}</span>
                      <span>Level {USER.level + 1}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background:
                            'linear-gradient(90deg, rgb(var(--accent-1)), rgb(var(--accent-3)))',
                        }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${USER.levelProgress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </Card>

                {/* Streak */}
                <Card delay={0.06}>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Flame className="size-4 text-[hsl(24_95%_58%)]" />
                    <span className="text-xs uppercase tracking-wider">Streak</span>
                  </div>
                  <p className="mt-3 font-heading text-3xl font-bold">
                    <AnimatedCounter value={USER.streak} />
                  </p>
                  <p className="text-sm text-muted-foreground">days in a row</p>
                </Card>

                {/* Friends online */}
                <Card delay={0.1}>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="size-4 text-[rgb(var(--accent-2))]" />
                    <span className="text-xs uppercase tracking-wider">Friends</span>
                  </div>
                  <p className="mt-3 font-heading text-3xl font-bold">
                    <AnimatedCounter value={USER.friendsOnline} />
                    <span className="text-base font-normal text-muted-foreground">
                      {' '}
                      / {USER.friendsTotal}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span className="size-2 rounded-full bg-[hsl(140_60%_50%)]" />
                    online now
                  </p>
                </Card>

                {/* Achievements */}
                <Card className="col-span-2" delay={0.14}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Trophy className="size-4 text-[hsl(45_90%_58%)]" />
                      <span className="text-xs uppercase tracking-wider">
                        Recent achievements
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">3 new</span>
                  </div>
                  <div className="mt-4 space-y-2.5">
                    {ACHIEVEMENTS.map((a) => {
                      const Icon = a.icon
                      return (
                        <div key={a.name} className="flex items-center gap-3">
                          <span
                            className="grid size-9 place-items-center rounded-xl"
                            style={{
                              background: `hsl(${rarityColor[a.rarity]} / 0.16)`,
                              color: `hsl(${rarityColor[a.rarity]})`,
                            }}
                          >
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{a.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {a.game}
                            </p>
                          </div>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              background: `hsl(${rarityColor[a.rarity]} / 0.14)`,
                              color: `hsl(${rarityColor[a.rarity]})`,
                            }}
                          >
                            {a.rarity}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {/* Favorites */}
                <Card className="col-span-2" delay={0.18}>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Gamepad2 className="size-4 text-[rgb(var(--accent-1))]" />
                    <span className="text-xs uppercase tracking-wider">
                      Favorite games
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2.5">
                    {FAVORITES.map((g) => (
                      <div
                        key={g.name}
                        className="group overflow-hidden rounded-xl border border-border/60"
                      >
                        <div
                          className="flex h-16 items-end p-2"
                          style={{
                            background: `linear-gradient(135deg, hsl(${g.hue} / 0.5), hsl(${g.hue} / 0.15))`,
                          }}
                        >
                          <Gamepad2 className="size-4 text-white/90" />
                        </div>
                        <div className="p-2">
                          <p className="truncate text-xs font-medium">{g.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {g.hours}h · {g.genre}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* AI recommendations */}
                <Card className="col-span-2" delay={0.22}>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="size-4 text-[rgb(var(--accent-3))]" />
                    <span className="text-xs uppercase tracking-wider">
                      AI picks for you
                    </span>
                  </div>
                  <div className="mt-4 space-y-2.5">
                    {RECS.map((r) => (
                      <div
                        key={r.game}
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-2.5"
                      >
                        <span className="grid size-9 place-items-center rounded-xl bg-[rgb(var(--accent-3)/0.16)] text-[rgb(var(--accent-3))]">
                          <Sparkles className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{r.game}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {r.why}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-[rgb(var(--accent-3))]">
                          {r.match}%
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Roadmap progress */}
                <Card className="col-span-2" delay={0.26}>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="size-4 text-[rgb(var(--accent-2))]" />
                    <span className="text-xs uppercase tracking-wider">
                      Journey to Public Beta
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Pre-Launch progress</span>
                      <span className="text-[rgb(var(--accent-2))]">42%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background:
                            'linear-gradient(90deg, rgb(var(--accent-1)), rgb(var(--accent-2)))',
                        }}
                        initial={{ width: 0 }}
                        whileInView={{ width: '42%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-[rgb(var(--accent-1)/0.1)] px-3 py-2">
                      <CheckCircle2 className="size-4 text-[rgb(var(--accent-1))]" />
                      <span className="text-xs text-foreground/90">
                        Waitlist confirmed — you&apos;re{' '}
                        <span className="font-semibold text-[rgb(var(--accent-1))]">
                          #{USER.waitlistNumber}
                        </span>{' '}
                        in line for beta access
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Activity feed */}
                <Card className="col-span-2 lg:col-span-4" delay={0.3}>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4" />
                    <span className="text-xs uppercase tracking-wider">
                      Recent activity
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                    {ACTIVITY.map((a) => {
                      const Icon = a.icon
                      return (
                        <div
                          key={a.label}
                          className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3"
                        >
                          <span className="grid size-8 place-items-center rounded-lg bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm">{a.label}</p>
                            <p className="text-xs text-muted-foreground">{a.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Reveal>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Illustrative preview with sample data. Your real dashboard unlocks with your
          account at the Public Beta.
        </p>
      </div>
    </section>
  )
}
