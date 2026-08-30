'use client'

import { useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSettings } from '@/components/providers/settings-provider'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { settings } = useSettings()
  const reduced = settings.motionMode !== 'full' || !settings.pageTransitions

  // Reset scroll to the very top BEFORE the new page paints, so a route change
  // never flashes the previous scroll position or animates upward.
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    const html = document.documentElement
    const prev = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    const id = requestAnimationFrame(() => {
      html.style.scrollBehavior = prev
    })
    return () => cancelAnimationFrame(id)
  }, [pathname])

  if (reduced) {
    return <div key={pathname}>{children}</div>
  }

  return (
    <div key={pathname}>
      {/* Lightweight route transition: opacity and transform only. This keeps
          navigation cinematic without forcing expensive full-page blur paints. */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[200]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background:
            'radial-gradient(120% 90% at 50% 40%, rgb(var(--accent-1) / 0.11), transparent 58%), color-mix(in oklab, var(--background) 76%, transparent)',
        }}
      >
        <motion.div
          className="absolute left-1/2 top-0 h-0.5 w-full -translate-x-1/2"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{
            transformOrigin: 'left',
            background:
              'linear-gradient(90deg, transparent, rgb(var(--accent-1)), rgb(var(--accent-3)), transparent)',
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.994 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  )
}
