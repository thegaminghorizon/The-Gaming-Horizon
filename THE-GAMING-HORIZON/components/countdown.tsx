'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSettings } from '@/components/providers/settings-provider'

function diff(target: string, now = Date.now()) {
  const t = new Date(target).getTime() - now
  const clamp = Math.max(0, t)
  return {
    days: Math.floor(clamp / 86400000),
    hours: Math.floor((clamp / 3600000) % 24),
    minutes: Math.floor((clamp / 60000) % 60),
    seconds: Math.floor((clamp / 1000) % 60),
    done: t <= 0,
    remainingMs: clamp,
  }
}

type Variant = 'default' | 'beta' | 'launch'

const accentFor: Record<Variant, string> = {
  default: 'rgb(var(--accent-1))',
  beta: 'rgb(var(--accent-3))',
  launch: 'rgb(var(--accent-2))',
}

/* Animated digit display with smooth flip transition */
function AnimatedDigit({
  value,
  accent,
  reduceMotion,
}: {
  value: string
  accent: string
  reduceMotion: boolean
}) {
  return (
    <motion.div
      key={value}
      initial={reduceMotion ? { opacity: 1, y: 0 } : { y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={reduceMotion ? { opacity: 0, y: 0 } : { y: -16, opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="font-heading font-bold tabular-nums"
      style={{ color: accent, fontSize: '36px', lineHeight: 1 }}
      suppressHydrationWarning
    >
      {value}
    </motion.div>
  )
}

export function Countdown({
  target,
  className,
  size = 'md',
  variant = 'default',
  now,
}: {
  target: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: Variant
  /** Optional shared clock value so multiple countdowns update on the same tick. */
  now?: number | null
}) {
  const systemReducedMotion = useReducedMotion()
  const { settings } = useSettings()
  const reduceMotion = systemReducedMotion || settings.motionMode !== 'full'
  const [time, setTime] = useState<ReturnType<typeof diff> | null>(null)

  useEffect(() => {
    if (now != null) return

    setTime(diff(target))
    const id = window.setInterval(() => setTime(diff(target)), 1000)
    return () => window.clearInterval(id)
  }, [now, target])

  const displayTime = now != null ? diff(target, now) : time

  const units = [
    { label: 'Days', value: displayTime?.days },
    { label: 'Hours', value: displayTime?.hours },
    { label: 'Minutes', value: displayTime?.minutes },
    { label: 'Seconds', value: displayTime?.seconds },
  ]

  const accent = accentFor[variant]
  const isSmall = size === 'sm'
  const targetMs = new Date(target).getTime()
  const anticipationStart = new Date('2026-01-01T00:00:00+05:30').getTime()
  const currentMs = displayTime ? targetMs - displayTime.remainingMs : anticipationStart
  const anticipation = Math.max(0, Math.min(1, (currentMs - anticipationStart) / Math.max(1, targetMs - anticipationStart)))
  const glowAlpha = 0.08 + anticipation * 0.16

  if (isSmall) {
    return (
      <div role="timer" aria-live="off" aria-label="Time remaining" className={cn('grid w-full select-none grid-cols-4 gap-1.5 sm:gap-2', className)}>
        {units.map((u) => (
          <div
            key={u.label}
            className="glass flex min-h-[74px] min-w-0 flex-col items-center justify-center rounded-xl px-1.5 py-2.5 transition-[box-shadow,border-color] duration-500 sm:min-h-[82px] sm:px-2.5"
            style={{
              borderColor: `color-mix(in oklab, ${accent} 30%, transparent)`,
              boxShadow: `0 12px 34px -24px color-mix(in oklab, ${accent} ${Math.round(glowAlpha * 100)}%, transparent)`,
            }}
          >
            <span
              className="font-heading text-xl font-semibold tabular-nums sm:text-2xl"
              style={{ color: accent }}
              suppressHydrationWarning
            >
              {u.value === undefined ? '--' : String(u.value).padStart(2, '0')}
            </span>
            <span className="mt-1 truncate text-[8px] uppercase tracking-[0.12em] text-muted-foreground sm:text-[9px]">
              {u.label}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Premium large version with glassmorphism and animations
  return (
    <div role="timer" aria-live="off" aria-label="Time remaining" className={cn('select-none', className)}>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {units.map((u) => (
          <div key={u.label} className="min-w-0">
            {/* Countdown card with glassmorphism */}
            <motion.div
              className="group relative min-h-[118px] overflow-hidden rounded-2xl backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-200 hover:shadow-xl sm:min-h-[132px]"
              whileHover={reduceMotion ? undefined : { y: -4 }}
              style={{
                background: 'linear-gradient(135deg, rgb(var(--background)/0.8) 0%, rgb(var(--background)/0.4) 100%)',
                border: `1px solid ${accent}40`,
                paddingLeft: 'clamp(10px, 2vw, 20px)',
                paddingRight: 'clamp(10px, 2vw, 20px)',
                paddingTop: 'clamp(18px, 2.2vw, 24px)',
                paddingBottom: 'clamp(18px, 2.2vw, 24px)',
                width: '100%',
              }}
            >
              {/* Inner highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent" />

              {/* Animated glow on hover */}
              <div
                className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: `${accent}20` }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <motion.div
                  className="relative h-10 w-full"
                  key={`${u.label}-${u.value}`}
                >
                  <AnimatedDigit
                    value={u.value === undefined ? '--' : String(u.value).padStart(2, '0')}
                    accent={accent}
                    reduceMotion={reduceMotion}
                  />
                </motion.div>
                <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {u.label}
                </span>
              </div>
            </motion.div>

          </div>
        ))}
      </div>

      {/* Animated progress line beneath */}
      <div className="mt-8 h-px overflow-hidden rounded-full bg-gradient-to-r from-transparent via-[rgb(var(--muted-foreground)/0.3)] to-transparent">
        <motion.div
          className="h-full bg-gradient-to-r"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
          }}
          animate={reduceMotion ? undefined : { x: ['0%', '100%'] }}
          transition={reduceMotion ? { duration: 0 } : { duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

/* Compact single-line countdown for banners and tight spaces. */
export function InlineCountdown({
  target,
  className,
  accent = 'rgb(var(--accent-2))',
}: {
  target: string
  className?: string
  accent?: string
}) {
  const [time, setTime] = useState<ReturnType<typeof diff> | null>(null)

  useEffect(() => {
    setTime(diff(target))
    const id = setInterval(() => setTime(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const parts = [
    { l: 'd', v: time?.days },
    { l: 'h', v: time?.hours },
    { l: 'm', v: time?.minutes },
    { l: 's', v: time?.seconds },
  ]

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 tabular-nums', className)}
      suppressHydrationWarning
    >
      {parts.map((p) => (
        <span key={p.l} className="inline-flex items-baseline gap-0.5">
          <span className="font-heading text-sm font-semibold" style={{ color: accent }}>
            {p.v === undefined ? '--' : String(p.v).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-muted-foreground">{p.l}</span>
        </span>
      ))}
    </span>
  )
}
