'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { getTodaysFestival } from '@/lib/festivals'
import { INDIA_TIME_ZONE } from '@/lib/milestones'

const DISMISS_KEY_PREFIX = 'gh:festival-image-closed:'

/** Milliseconds from `now` until 23:59:59.999 IST on the same IST day. */
function msUntilEndOfDayIST(now: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: INDIA_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  const hoursLeft = 23 - get('hour')
  const minutesLeft = 59 - get('minute')
  const secondsLeft = 59 - get('second')
  return ((hoursLeft * 60 + minutesLeft) * 60 + secondsLeft) * 1000 + 999
}

/**
 * Full-screen "Happy Independence Day"-style image popup that greets every
 * visitor when the Gateway/site opens on a festival day that has an
 * `image` set in lib/festivals.ts. Closeable, and auto-expires at 11:59pm
 * IST the same day — it never shows again after that, even without a
 * localStorage dismiss, because it's re-checked against today's date on
 * every mount.
 */
export function FestivalImagePopup() {
  const [visible, setVisible] = useState(false)
  const [festival, setFestival] = useState<{ id: string; title: string; image: string } | null>(null)

  useEffect(() => {
    const today = getTodaysFestival()
    if (!today || !today.image) return

    const dismissKey = `${DISMISS_KEY_PREFIX}${today.id}-${today.year}`
    try {
      if (window.localStorage.getItem(dismissKey)) return
    } catch {
      // If storage isn't available, fall through and just show it.
    }

    setFestival({ id: `${today.id}-${today.year}`, title: today.title, image: today.image })
    setVisible(true)

    // Force-hide at midnight IST even if the tab stays open past 11:59pm.
    const timeout = window.setTimeout(() => setVisible(false), msUntilEndOfDayIST(new Date()))
    return () => window.clearTimeout(timeout)
  }, [])

  const close = () => {
    setVisible(false)
    if (!festival) return
    try {
      window.localStorage.setItem(`${DISMISS_KEY_PREFIX}${festival.id}`, '1')
    } catch {
      // Best-effort — worst case it shows again once this session.
    }
  }

  return (
    <AnimatePresence>
      {visible && festival && (
        <div className="fixed inset-0 z-[2147483005] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6">
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            role="dialog"
            aria-modal="true"
            aria-label={festival.title}
          >
            <button
              onClick={close}
              className="absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            <Image
              src={festival.image}
              alt={festival.title}
              width={1672}
              height={941}
              priority
              className="h-auto w-full"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
