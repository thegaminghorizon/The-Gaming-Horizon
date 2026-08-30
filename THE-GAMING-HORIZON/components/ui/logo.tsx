'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// The Gaming Horizon mark, vectorized from the brand artwork: three
// separate angular facets (the left arrowhead, the upper diagonal stripe,
// and the lower flag/arrow shape with its notch) traced as clean polygons
// so it stays crisp at any size and — critically for the logo-download
// tool — recolors instantly through nothing but its gradient's <stop>
// colors, with no raster processing involved.
export const GH_MARK_VIEWBOX = '0 0 100 89.1'
export const GH_MARK_PATH =
  'M 97.04,19.59 L 54.71,36.6 L 65.06,42.51 L 35.86,54.53 L 33.64,79.48 L 42.33,88.72 L 46.58,62.66 L 59.7,56.93 L 48.98,85.95 L 87.25,42.51 Z ' +
  'M 21.44,2.03 L 0.55,32.9 L 15.9,58.04 L 29.21,74.49 L 29.39,39.37 L 36.41,34.2 L 25.88,28.1 Z ' +
  'M 99.63,0.55 L 39.37,26.99 L 38.82,34.75 L 43.07,36.97 L 89.28,14.6 L 94.09,11.46 Z'

// The mark's original brand colors, sampled directly from the source
// artwork (left tip, mid stripe, right tip). Used as the "Horizon" preset
// in the logo-download tool and as the default gradient everywhere else
// that isn't tied to the site's live accent theme.
export const GH_MARK_DEFAULT_STOPS = ['#3D07B5', '#01A8FA', '#01E3CF'] as const

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={GH_MARK_VIEWBOX}
      className={cn('size-8', className)}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gh-grad" x1="0" y1="0" x2="100" y2="70">
          <stop offset="0" stopColor="rgb(var(--accent-1))" />
          <stop offset="0.5" stopColor="rgb(var(--accent-2))" />
          <stop offset="1" stopColor="rgb(var(--accent-3))" />
        </linearGradient>
      </defs>
      <path d={GH_MARK_PATH} fill="url(#gh-grad)" />
    </svg>
  )
}

export function Logo({
  className,
  reveal = false,
}: {
  className?: string
  reveal?: boolean
}) {
  if (!reveal) {
    return (
      <span className={cn('flex items-center gap-2.5', className)}>
        <LogoMark />
        <span className="font-heading text-[15px] font-semibold tracking-tight">
          Gaming Horizon
        </span>
      </span>
    )
  }

  // One-time clean reveal on page load: the mark springs in with a slight
  // rotate/scale, then the wordmark wipes in from behind it.
  return (
    <motion.span
      className={cn('flex items-center gap-2.5', className)}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
      }}
    >
      <motion.span
        className="inline-flex"
        variants={{
          hidden: { opacity: 0, scale: 0.5, rotate: -90 },
          show: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: { type: 'spring', stiffness: 220, damping: 14 },
          },
        }}
      >
        <LogoMark />
      </motion.span>
      <span className="overflow-hidden">
        <motion.span
          className="inline-block font-heading text-[15px] font-semibold tracking-tight"
          variants={{
            hidden: { opacity: 0, x: -10 },
            show: {
              opacity: 1,
              x: 0,
              transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          Gaming Horizon
        </motion.span>
      </span>
    </motion.span>
  )
}
