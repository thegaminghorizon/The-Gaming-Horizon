'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  BookOpen,
  Compass,
  Gamepad2,
  Home,
  Music4,
  Quote,
  Rocket,
} from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { LogoMark } from '@/components/ui/logo'

const EXPLORE_LINKS = [
  { label: 'Games', href: '/games', icon: Gamepad2 },
  { label: 'Music', href: '/music', icon: Music4 },
  { label: 'Roadmap', href: '/roadmap', icon: Compass },
  { label: 'Blog', href: '/blog', icon: BookOpen },
  { label: 'Beta', href: '/beta', icon: Rocket },
]

export default function NotFound() {
  const reduceMotion = useReducedMotion()

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-14 overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      {/* Ambient backdrop — same soft radial + drifting glow language as the footer */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(55% 50% at 16% 22%, rgb(var(--accent-1)/0.16), transparent 70%), radial-gradient(50% 45% at 88% 78%, rgb(var(--accent-3)/0.12), transparent 70%)',
          }}
        />
        <motion.div
          className="absolute -left-28 top-1/4 size-72 rounded-full bg-[rgb(var(--accent-1)/0.12)] blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, 30, 0], y: [0, -18, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-16 bottom-10 size-80 rounded-full bg-[rgb(var(--accent-3)/0.10)] blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, -24, 0], y: [0, 16, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* Copy + actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-heading gh-text-gradient text-[5.5rem] font-bold leading-none sm:text-[7rem]">
            404
          </p>
          <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Lost in the horizon
          </h1>
          <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
            This page hasn&apos;t been built yet — or drifted beyond the edge of the map.
            Let&apos;s get you back to solid ground.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <GhButton href="/" size="lg">
              <Home className="size-4" /> Back to home
            </GhButton>
            <GhButton href="/roadmap" variant="glass" size="lg">
              <Compass className="size-4" /> View Roadmap
            </GhButton>
          </div>

          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
              Explore what awaits you
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {EXPLORE_LINKS.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="gh-card-hover group flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-background/60 px-5 py-3.5 text-center backdrop-blur"
                  >
                    <span className="flex size-9 items-center justify-center rounded-full bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))] transition-colors group-hover:bg-[rgb(var(--accent-1)/0.2)]">
                      <link.icon className="size-4" />
                    </span>
                    <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Portal illustration — hidden on the smallest screens to keep things tidy */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto hidden w-full max-w-md sm:block"
        >
          <NotFoundPortal reduceMotion={Boolean(reduceMotion)} />
        </motion.div>
      </div>

      {/* Closing quote strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="glass mx-auto flex w-full max-w-6xl flex-col items-start gap-4 rounded-3xl border border-border/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
            <Quote className="size-4" />
          </span>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every great journey begins with exploration. Even when the path isn&apos;t where you
            expected.{' '}
            <span className="font-medium text-[rgb(var(--accent-1))]">
              The horizon is vast. Let&apos;s keep exploring.
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 self-end sm:self-auto">
          <LogoMark className="size-7" />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">Gaming Horizon</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
              Discover. Connect. Rise.
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  )
}

/**
 * The arch/portal artwork on the right. Built entirely from CSS-variable
 * colors (the live accent gradient + theme tokens for the clouds/shadow),
 * so it recolors instantly with the Customization Studio and adapts to
 * light/dark automatically — only the sky glimpsed "through" the doorway
 * stays a fixed night gradient, since that's the scene it's depicting
 * regardless of the site's own theme.
 */
function NotFoundPortal({ reduceMotion }: { reduceMotion: boolean }) {
  const stars = [
    { x: 46, y: 66, r: 2.4, delay: 0 },
    { x: 350, y: 96, r: 2, delay: 0.6 },
    { x: 372, y: 220, r: 2.6, delay: 1.2 },
    { x: 30, y: 260, r: 2, delay: 0.3 },
    { x: 60, y: 360, r: 2.2, delay: 0.9 },
    { x: 340, y: 330, r: 1.8, delay: 1.5 },
  ]

  return (
    <svg viewBox="0 0 400 460" className="w-full" aria-hidden="true">
      <defs>
        <linearGradient id="nf-arch-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgb(var(--accent-1))" />
          <stop offset="0.5" stopColor="rgb(var(--accent-2))" />
          <stop offset="1" stopColor="rgb(var(--accent-3))" />
        </linearGradient>
        <radialGradient id="nf-sky-grad" cx="58%" cy="28%" r="80%">
          <stop offset="0" stopColor="#2c3170" />
          <stop offset="0.55" stopColor="#171a3d" />
          <stop offset="1" stopColor="#0a0c22" />
        </radialGradient>
        <filter id="nf-soft-blur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <clipPath id="nf-arch-clip">
          <path d="M115,382 L115,215 A85,85 0 0 1 285,215 L285,382 Z" />
        </clipPath>
      </defs>

      {/* Ambient glow behind the arch */}
      <circle cx="200" cy="200" r="150" fill="url(#nf-arch-grad)" opacity="0.16" filter="url(#nf-soft-blur)" />

      {/* Ground shadow */}
      <ellipse cx="200" cy="424" rx="145" ry="14" fill="var(--foreground)" opacity="0.07" />

      {/* Cloud puffs flanking the base */}
      <g fill="var(--secondary)">
        <circle cx="68" cy="396" r="26" />
        <circle cx="100" cy="386" r="32" />
        <circle cx="136" cy="399" r="24" />
        <circle cx="332" cy="396" r="26" />
        <circle cx="300" cy="386" r="32" />
        <circle cx="264" cy="399" r="24" />
      </g>

      {/* Twinkling stars */}
      {stars.map((star, i) => (
        <motion.circle
          key={i}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill={i % 2 === 0 ? 'rgb(var(--accent-1))' : 'rgb(var(--accent-3))'}
          animate={reduceMotion ? { opacity: 0.5 } : { opacity: [0.25, 0.8, 0.25] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: star.delay }}
        />
      ))}

      {/* Outer glowing rim */}
      <path
        d="M105,388 L105,205 A95,95 0 0 1 295,205 L295,388"
        fill="none"
        stroke="url(#nf-arch-grad)"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.35"
        filter="url(#nf-soft-blur)"
      />

      {/* Night-sky viewport */}
      <path d="M115,382 L115,215 A85,85 0 0 1 285,215 L285,382 Z" fill="url(#nf-sky-grad)" />

      {/* Moon + city, clipped to the viewport */}
      <g clipPath="url(#nf-arch-clip)">
        <circle cx="228" cy="255" r="42" fill="rgb(var(--accent-3))" opacity="0.28" filter="url(#nf-soft-blur)" />
        <circle cx="228" cy="255" r="22" fill="rgb(var(--accent-3))" opacity="0.9" />
        <rect x="115" y="345" width="26" height="45" fill="#0a0c1f" />
        <rect x="145" y="330" width="22" height="60" fill="#0a0c1f" />
        <rect x="171" y="352" width="18" height="38" fill="#0a0c1f" />
        <rect x="193" y="320" width="24" height="70" fill="#0a0c1f" />
        <rect x="221" y="340" width="20" height="50" fill="#0a0c1f" />
        <rect x="245" y="358" width="16" height="32" fill="#0a0c1f" />
        <rect x="265" y="336" width="20" height="54" fill="#0a0c1f" />
        <rect x="199" y="330" width="3" height="6" fill="rgb(var(--accent-3))" opacity="0.7" />
        <rect x="230" y="352" width="3" height="6" fill="rgb(var(--accent-1))" opacity="0.6" />
        <rect x="151" y="348" width="3" height="6" fill="rgb(var(--accent-3))" opacity="0.6" />
      </g>

      {/* Crisp gradient border */}
      <path
        d="M110,384 L110,205 A90,90 0 0 1 290,205 L290,384"
        fill="none"
        stroke="url(#nf-arch-grad)"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  )
}
