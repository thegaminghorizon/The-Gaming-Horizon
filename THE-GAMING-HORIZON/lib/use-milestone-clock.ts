'use client'

import { useEffect, useState } from 'react'

/**
 * A low-frequency absolute clock for scheduled milestone state. ISO timestamps
 * include the Asia/Kolkata offset, so visitor timezone changes do not alter the
 * intended instant. Visibility/focus events immediately resynchronize after a
 * suspended browser tab.
 */
export function useMilestoneClock(intervalMs = 1_000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const sync = () => setNow(Date.now())
    const timer = window.setInterval(sync, intervalMs)
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('focus', sync)
    }
  }, [intervalMs])

  return now
}
