'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Rocket, Calendar, ChevronDown, ChevronUp, X } from 'lucide-react'
import { InlineCountdown } from '@/components/countdown'
import { useUI } from '@/components/providers/ui-provider'
import { LAUNCH_DATE } from '@/lib/data'

type BannerState = 'open' | 'min' | 'closed'
const KEY = 'gh:banner'

export function AnnouncementBanner() {
  const { setBannerOffset } = useUI()
  // Restore the persisted state synchronously on the first client render so the
  // navbar offset is correct immediately and never jumps after mount.
  const [state, setState] = useState<BannerState>(() => {
    if (typeof window === 'undefined') return 'open'
    try {
      return (localStorage.getItem(KEY) as BannerState | null) ?? 'open'
    } catch {
      return 'open'
    }
  })
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  const update = (s: BannerState) => {
    setState(s)
    try {
      localStorage.setItem(KEY, s)
    } catch {
      /* ignore */
    }
  }

  // Publish the banner's real rendered height to a shared CSS variable and the
  // UI context. A ResizeObserver keeps it in sync through open/min/closed
  // swaps and content reflows, so the navbar offset is always accurate.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const publish = () => {
      const h = Math.round(el.getBoundingClientRect().height)
      document.documentElement.style.setProperty('--banner-h', `${h}px`)
      setBannerOffset(h)
    }
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    window.addEventListener('resize', publish)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', publish)
    }
  }, [mounted, setBannerOffset])

  if (!mounted) return null

  return (
    <div ref={ref} className="fixed inset-x-0 top-0 z-[120]">
      <AnimatePresence mode="wait" initial={false}>
        {state === 'open' && (
          <motion.div
            key="open"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="px-3 pt-1.5 sm:px-4"
          >
            <div className="gh-banner-ring mx-auto max-w-6xl rounded-xl">
              <div className="glass-strong flex flex-col items-center gap-2 rounded-[11px] px-3 py-2 lg:flex-row lg:justify-between">
                {/* status + message */}
                <div className="flex flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-1 lg:justify-start">
                  <span className="inline-flex items-center gap-2 text-xs font-medium">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-2 animate-dot-pulse rounded-full bg-[rgb(var(--accent-3))]" />
                      <span className="relative inline-flex size-2 rounded-full bg-[rgb(var(--accent-3))]" />
                    </span>
                    In active development
                  </span>
                  <span className="hidden h-4 w-px bg-border sm:block" />
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Rocket className="size-3.5 text-[rgb(var(--accent-3))]" />
                    Public Beta{' '}
                    <span className="font-medium text-foreground">Jan 1, 2027</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5 text-[rgb(var(--accent-2))]" />
                    Official Launch{' '}
                    <span className="font-medium text-foreground">Mar 1, 2028</span>
                  </span>
                </div>

                {/* live launch countdown */}
                <div className="flex items-center gap-2 rounded-full border border-[rgb(var(--accent-2)/0.3)] bg-[rgb(var(--accent-2)/0.08)] px-3 py-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Launch in
                  </span>
                  <InlineCountdown target={LAUNCH_DATE} />
                </div>

                {/* actions */}
                <div className="flex items-center gap-1">
                  <Link
                    href="/roadmap"
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  >
                    View Roadmap
                  </Link>
                  <Link
                    href="/roadmap#development"
                    className="rounded-lg border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.1)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[rgb(var(--accent-1)/0.18)]"
                  >
                    Development Updates
                  </Link>
                  <button
                    onClick={() => update('min')}
                    aria-label="Minimize announcement"
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  >
                    <ChevronUp className="size-4" />
                  </button>
                  <button
                    onClick={() => update('closed')}
                    aria-label="Dismiss announcement"
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'min' && (
          <motion.div
            key="min"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center pt-1"
          >
            <button
              onClick={() => update('open')}
              className="glass-strong flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Rocket className="size-3.5 text-[rgb(var(--accent-3))]" />
              Launch in
              <InlineCountdown target={LAUNCH_DATE} />
              <ChevronDown className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
