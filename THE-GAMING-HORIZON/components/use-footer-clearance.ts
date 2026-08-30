'use client'

import { useEffect, useState } from 'react'

/**
 * Exposes a smooth footer clearance for controls that must remain visible while
 * the footer approaches. Measurements are requestAnimationFrame-throttled.
 */
export function useFooterClearance(extraGap = 18, maxViewportRatio = 0.48) {
  const [clearance, setClearance] = useState(0)

  useEffect(() => {
    const footer = document.querySelector<HTMLElement>('#site-footer')
    if (!footer) return
    const target = footer

    let nearFooter = false
    let raf = 0

    const measure = () => {
      raf = 0
      if (!nearFooter) {
        setClearance(0)
        return
      }
      const rect = target.getBoundingClientRect()
      const next = Math.min(
        Math.max(0, window.innerHeight - rect.top + extraGap),
        window.innerHeight * maxViewportRatio,
      )
      setClearance((current) => (Math.abs(current - next) < 1 ? current : next))
    }

    const schedule = () => {
      if (raf) return
      raf = window.requestAnimationFrame(measure)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        nearFooter = entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight + 180
        if (!nearFooter) setClearance(0)
        schedule()
      },
      { rootMargin: '0px 0px 180px 0px', threshold: [0, 0.01] },
    )

    observer.observe(target)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [extraGap, maxViewportRatio])

  return clearance
}

/**
 * Lets a floating utility fade before it obscures footer content.
 */
export function useFooterPresence(rootMargin = '0px 0px -8% 0px') {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const footer = document.querySelector<HTMLElement>('#site-footer')
    if (!footer) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin, threshold: [0, 0.01, 0.12] },
    )
    observer.observe(footer)
    return () => observer.disconnect()
  }, [rootMargin])

  return visible
}
