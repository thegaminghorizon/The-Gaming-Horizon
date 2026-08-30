'use client'

import { useEffect } from 'react'
import { getTodaysFestival } from '@/lib/festivals'

const SEEN_KEY_PREFIX = 'gh:festival-wished:'

function readSeen(userKey: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(`${SEEN_KEY_PREFIX}${userKey}`)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

function markSeen(userKey: string, entryId: string) {
  if (typeof window === 'undefined') return
  try {
    const seen = readSeen(userKey)
    if (seen.includes(entryId)) return
    // Keep this list small — a couple of years' worth of occasions is
    // plenty, no need to grow it forever.
    window.localStorage.setItem(`${SEEN_KEY_PREFIX}${userKey}`, JSON.stringify([entryId, ...seen].slice(0, 60)))
  } catch {
    // Best-effort, same as the rest of the notification store.
  }
}

interface WishInput {
  title: string
  body: string
  icon?: 'celebration'
  toast?: boolean
}

/**
 * Checks today's date against the Indian festival calendar and, for a
 * signed-up user, drops a one-time wish into their notification centre for
 * any major occasion (Diwali, Independence Day, Christmas, New Year, etc.).
 * Guests (no userKey) are skipped — this is specifically for signed-up
 * users, per their notification preferences.
 */
export function useFestivalWisher(userKey: string | null, enabled: boolean, notify: (input: WishInput) => void) {
  useEffect(() => {
    if (!userKey || !enabled) return

    const check = () => {
      const festival = getTodaysFestival()
      if (!festival) return
      const entryId = `${festival.id}-${festival.year}`
      if (readSeen(userKey).includes(entryId)) return
      notify({ title: festival.title, body: festival.message, icon: 'celebration', toast: true })
      markSeen(userKey, entryId)
    }

    check()
    // Long-lived tabs (or ones opened just before midnight) should still
    // catch the day rolling over without a full page reload.
    const interval = window.setInterval(check, 60 * 60 * 1000)
    return () => window.clearInterval(interval)
  }, [userKey, enabled, notify])
}
