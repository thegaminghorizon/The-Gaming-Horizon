'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Sparkles, PartyPopper } from 'lucide-react'
import { LogoMark } from '@/components/ui/logo'
import { useSettings } from '@/components/providers/settings-provider'
import { useUI } from '@/components/providers/ui-provider'

const SESSION_KEY = 'gh:welcome-message-v2'
const LEGACY_SESSION_KEY = 'gh-welcomed'

// The countdown starts only after the Gateway has fully exited and the
// homepage has painted. Gateway time never consumes this duration.
const VISIBLE_MS = 10_000

type WelcomeStatus = 'pending' | 'active' | 'paused' | 'completed' | 'dismissed'
interface WelcomeSessionState {
  status: WelcomeStatus
  remainingMs: number
  expiresAt?: number
}

const DEFAULT_SESSION: WelcomeSessionState = {
  status: 'pending',
  remainingMs: VISIBLE_MS,
}

function readWelcomeSession(): WelcomeSessionState {
  if (typeof window === 'undefined') return DEFAULT_SESSION
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<WelcomeSessionState>
      const allowed: WelcomeStatus[] = ['pending', 'active', 'paused', 'completed', 'dismissed']
      const status = allowed.includes(parsed.status as WelcomeStatus)
        ? parsed.status as WelcomeStatus
        : 'pending'
      const remainingMs = Number.isFinite(parsed.remainingMs)
        ? Math.max(0, Math.min(VISIBLE_MS, Number(parsed.remainingMs)))
        : VISIBLE_MS
      const expiresAt = Number.isFinite(parsed.expiresAt) ? Number(parsed.expiresAt) : undefined
      return { status, remainingMs, expiresAt }
    }

    // Existing sessions that already received the previous welcome should not
    // unexpectedly replay it after this migration.
    if (sessionStorage.getItem(LEGACY_SESSION_KEY)) {
      return { status: 'completed', remainingMs: 0 }
    }
  } catch {
    // Session storage is optional; the in-memory experience still works.
  }
  return DEFAULT_SESSION
}

function writeWelcomeSession(value: WelcomeSessionState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(value))
    sessionStorage.removeItem(LEGACY_SESSION_KEY)
  } catch {
    // Session persistence is a convenience, not a requirement.
  }
}

export function WelcomeMember({ activationId }: { activationId: number }) {
  const { settings, ready } = useSettings()
  const { openWaitlist, bottomOverlayOffset, registerLeftFloatingObstacle } = useUI()
  const [show, setShow] = useState(false)
  const [name, setName] = useState<string | null>(null)
  const [remainingMs, setRemainingMs] = useState(VISIBLE_MS)
  const toastRef = useRef<HTMLDivElement>(null)
  const expiresAtRef = useRef<number | null>(null)
  const completedRef = useRef(false)
  const reduced = settings.reducedMotion

  useEffect(() => {
    if (!ready || typeof window === 'undefined') return

    let member: string | null = null
    try {
      const rows = JSON.parse(localStorage.getItem('gh:waitlist') || '[]')
      if (Array.isArray(rows) && rows.length && rows[0]?.name) {
        member = String(rows[0].name).trim().split(/\s+/)[0]
      }
    } catch {
      // Personalization is optional.
    }
    setName(member)

    const stored = readWelcomeSession()
    if (stored.status === 'completed' || stored.status === 'dismissed') return

    let nextRemaining = stored.remainingMs || VISIBLE_MS
    if (stored.status === 'active' && stored.expiresAt) {
      nextRemaining = Math.max(0, stored.expiresAt - Date.now())
    }
    if (nextRemaining <= 0) {
      writeWelcomeSession({ status: 'completed', remainingMs: 0 })
      return
    }

    completedRef.current = false
    setRemainingMs(nextRemaining)
    // The parent mounts this component only after a main-site activation event.
    // One paint frame keeps the toast visually downstream of the homepage.
    const frame = window.requestAnimationFrame(() => setShow(true))
    return () => window.cancelAnimationFrame(frame)
  }, [activationId, ready])

  useEffect(() => {
    if (!show) return
    const duration = Math.max(1, remainingMs)
    const expiresAt = Date.now() + duration
    expiresAtRef.current = expiresAt
    writeWelcomeSession({ status: 'active', remainingMs: duration, expiresAt })

    const timer = window.setTimeout(() => {
      completedRef.current = true
      expiresAtRef.current = null
      writeWelcomeSession({ status: 'completed', remainingMs: 0 })
      setShow(false)
    }, duration)

    const pauseForPageExit = () => {
      if (completedRef.current) return
      const remaining = expiresAtRef.current
        ? Math.max(0, expiresAtRef.current - Date.now())
        : duration
      writeWelcomeSession(
        remaining > 0
          ? { status: 'paused', remainingMs: remaining }
          : { status: 'completed', remainingMs: 0 },
      )
    }
    window.addEventListener('pagehide', pauseForPageExit)
    window.addEventListener('beforeunload', pauseForPageExit)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pagehide', pauseForPageExit)
      window.removeEventListener('beforeunload', pauseForPageExit)
      if (completedRef.current) return
      const remaining = expiresAtRef.current
        ? Math.max(0, expiresAtRef.current - Date.now())
        : duration
      expiresAtRef.current = null
      writeWelcomeSession(
        remaining > 0
          ? { status: 'paused', remainingMs: remaining }
          : { status: 'completed', remainingMs: 0 },
      )
    }
  }, [remainingMs, show])

  useLayoutEffect(() => {
    if (!show) {
      registerLeftFloatingObstacle('welcome-member', null)
      return
    }
    registerLeftFloatingObstacle('welcome-member', toastRef.current)
    return () => registerLeftFloatingObstacle('welcome-member', null)
  }, [registerLeftFloatingObstacle, show])

  const dismiss = (status: 'dismissed' | 'completed' = 'dismissed') => {
    completedRef.current = true
    expiresAtRef.current = null
    writeWelcomeSession({ status, remainingMs: 0 })
    setShow(false)
  }

  const isMember = Boolean(name)
  const title = isMember ? `Welcome back, ${name}` : 'Welcome to Gaming Horizon'
  const subtitle = isMember
    ? "You're on the founding waitlist. We'll keep you posted on every step to the Public Beta."
    : 'Step inside the pre-launch preview of the browser gaming ecosystem arriving in 2027.'

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={toastRef}
          data-left-floating-obstacle="welcome-member"
          role="status"
          aria-live="polite"
          className="fixed left-5 z-[180] w-[calc(100vw-2.5rem)] max-w-[340px]"
          style={{ bottom: `calc(1.25rem + ${bottomOverlayOffset}px)` }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="relative overflow-hidden rounded-2xl border border-[rgb(var(--accent-1)/0.4)] p-4 shadow-2xl backdrop-blur-xl"
            style={{ background: 'color-mix(in oklab, var(--popover) 96%, transparent)' }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full blur-2xl"
              style={{ background: 'rgb(var(--accent-1)/0.35)' }}
            />

            <button
              onClick={() => dismiss('dismissed')}
              aria-label="Dismiss welcome message"
              className="absolute right-2.5 top-2.5 z-20 grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="relative flex items-start gap-3">
              <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.12)]">
                {!reduced && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-xl"
                    style={{ boxShadow: '0 0 0 1px rgb(var(--accent-1)/0.5)' }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <LogoMark className="size-7" />
              </span>

              <div className="min-w-0 pr-5">
                <div className="flex items-center gap-1.5">
                  {isMember ? (
                    <PartyPopper className="size-3.5 text-[rgb(var(--accent-1))]" />
                  ) : (
                    <Sparkles className="size-3.5 text-[rgb(var(--accent-1))]" />
                  )}
                  <span className="text-label text-[rgb(var(--accent-1))]">
                    {isMember ? 'Founding Member' : 'Pre-Launch Preview'}
                  </span>
                </div>
                <h3 className="mt-1 font-heading text-base font-semibold leading-tight text-balance">
                  {title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground text-pretty">
                  {subtitle}
                </p>

                {!isMember && (
                  <button
                    onClick={() => {
                      dismiss('dismissed')
                      openWaitlist()
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--accent-1))] px-3.5 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    Join the waitlist
                  </button>
                )}
              </div>
            </div>

            {!reduced && (
              <motion.span
                key={remainingMs}
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left"
                style={{
                  background: 'linear-gradient(90deg, rgb(var(--accent-1)), rgb(var(--accent-3)))',
                }}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: remainingMs / 1000, ease: 'linear' }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
