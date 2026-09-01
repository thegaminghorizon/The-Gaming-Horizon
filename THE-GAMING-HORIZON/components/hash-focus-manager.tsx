'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { focusHashTarget } from '@/lib/hash-navigation'

export function HashFocusManager() {
  const pathname = usePathname()

  useEffect(() => {
    const run = () => {
      if (!window.location.hash) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      let attempts = 0
      const tryFocus = () => {
        attempts += 1
        if (!focusHashTarget(window.location.hash, reduced ? 'auto' : 'smooth') && attempts < 12) {
          window.setTimeout(tryFocus, 80)
        }
      }
      window.setTimeout(tryFocus, 30)
    }

    run()
    window.addEventListener('hashchange', run)
    window.addEventListener('popstate', run)
    return () => {
      window.removeEventListener('hashchange', run)
      window.removeEventListener('popstate', run)
    }
  }, [pathname])

  return null
}
