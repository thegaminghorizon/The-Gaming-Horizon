'use client'

import { motion } from 'framer-motion'
import { useSettings } from '@/components/providers/settings-provider'
import { cn } from '@/lib/utils'

type Variant = 'line' | 'beam' | 'particles' | 'orbit' | 'fade'

/**
 * Premium ambient separator that connects one section to the next.
 * Decorative only (aria-hidden). Falls back to a static soft line under reduced motion.
 */
export function SectionDivider({
  variant = 'line',
  className,
}: {
  variant?: Variant
  className?: string
}) {
  const { settings } = useSettings()
  const still = settings.reducedMotion

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none relative mx-auto flex w-full max-w-6xl items-center justify-center px-4',
        variant === 'fade' ? 'h-16' : 'h-24 cq-h-32',
        className,
      )}
    >
      {still ? (
        <StaticLine />
      ) : (
        <>
          {variant === 'line' && <GlowLine />}
          {variant === 'beam' && <Beam />}
          {variant === 'particles' && <Particles />}
          {variant === 'orbit' && <Orbit />}
          {variant === 'fade' && <StaticLine />}
        </>
      )}
    </div>
  )
}

// Shared ambient backdrop behind every variant — a soft horizontal glow band
// that reads as a distinct "premium section break" even before the variant's
// own motif (line/beam/particles/orbit) draws on top of it.
function DividerBackdrop() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 top-1/2 h-full max-h-24 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(var(--accent-1)/0.08),transparent_75%)]"
    />
  )
}

function StaticLine() {
  return (
    <div className="h-[3px] w-full max-w-3xl rounded-full bg-gradient-to-r from-transparent via-[rgb(var(--accent-1)/0.6)] to-transparent shadow-[0_0_22px_-5px_rgb(var(--accent-1)/0.48)]" />
  )
}

function GlowLine() {
  return (
    <>
      <DividerBackdrop />
      <div className="relative h-[3px] w-full max-w-5xl rounded-full">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgb(var(--accent-1)/0.7)] to-transparent" />
        <motion.span
          className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--accent-1))]"
          style={{ boxShadow: '0 0 26px 6px rgb(var(--accent-1)/0.75)' }}
          animate={{ scale: [1, 1.6, 1], opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </>
  )
}

function Beam() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute size-36 rounded-full bg-[rgb(var(--accent-1)/0.14)] blur-2xl" />
      <motion.div
        className="h-full w-[3px]"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgb(var(--accent-1)/0.75), transparent)',
        }}
        animate={{ opacity: [0.25, 0.9, 0.25], scaleY: [0.8, 1, 0.8] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute h-[3px] w-full max-w-md rounded-full bg-gradient-to-r from-transparent via-[rgb(var(--accent-2)/0.62)] to-transparent" />
    </div>
  )
}

function Particles() {
  const dots = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  return (
    <div className="relative flex w-full max-w-3xl items-center justify-center gap-3">
      <DividerBackdrop />
      <div className="absolute inset-x-0 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[rgb(var(--accent-1)/0.46)] to-transparent" />
      {dots.map((i) => {
        const dist = Math.abs(i - 4)
        return (
          <motion.span
            key={i}
            className="rounded-full bg-[rgb(var(--accent-1))]"
            style={{
              width: 7 - dist * 0.45,
              height: 7 - dist * 0.45,
              opacity: 0.8 - dist * 0.12,
            }}
            animate={{ y: [0, -8, 0], opacity: [0.3, 0.9 - dist * 0.1, 0.3] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: i * 0.12,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </div>
  )
}

function Orbit() {
  return (
    <div className="relative flex w-full max-w-4xl items-center justify-center">
      <DividerBackdrop />
      <div className="absolute h-[3px] w-full max-w-4xl rounded-full bg-gradient-to-r from-transparent via-[rgb(var(--accent-2)/0.5)] to-transparent" />
      <motion.div
        className="relative size-16 rounded-full border-[1.5px] border-[rgb(var(--accent-1)/0.34)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      >
        <span
          className="absolute -top-[3.5px] left-1/2 size-2 -translate-x-1/2 rounded-full bg-[rgb(var(--accent-1))]"
          style={{ boxShadow: '0 0 14px 3.5px rgb(var(--accent-1)/0.82)' }}
        />
        <span className="absolute inset-[7px] rounded-full border border-[rgb(var(--accent-3)/0.28)]" />
      </motion.div>
    </div>
  )
}
