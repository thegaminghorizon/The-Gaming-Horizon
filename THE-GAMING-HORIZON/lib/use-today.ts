'use client'

import { useEffect, useState } from 'react'

/**
 * Returns the visitor's current date, formatted, updating automatically.
 * Returns null on first render to avoid hydration mismatch, then fills in on the client.
 */
export function useToday(): string | null {
  const [today, setToday] = useState<string | null>(null)

  useEffect(() => {
    const format = () =>
      new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    setToday(format())
    // Refresh at the next midnight so long-lived sessions roll over the date.
    const now = new Date()
    const msToMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
      now.getTime()
    const t = setTimeout(() => setToday(format()), msToMidnight + 1000)
    return () => clearTimeout(t)
  }, [])

  return today
}
