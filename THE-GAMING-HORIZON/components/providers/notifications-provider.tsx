'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, X, ArrowUpRight } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { PendingNotificationsPopup } from '@/components/pending-notifications-popup'
import {
  addNotification,
  hasSentDiscordNotification,
  hasSentInstagramNotification,
  hasSentWhatsNewNotification,
  hasSentXNotification,
  markAllRead as markAllReadInStore,
  markDiscordNotificationSent,
  markInstagramNotificationSent,
  markRead as markReadInStore,
  markWhatsNewNotificationSent,
  markXNotificationSent,
  migrateGuestNotifications,
  readNotifications,
  removeNotificationsByTitle,
  NOTIFICATIONS_EVENT,
  type AppNotification,
  type NotificationIcon,
} from '@/lib/notifications'
import { WHATS_NEW_VERSION, formatWhatsNewForNotification } from '@/lib/whats-new'
import {
  DISCORD_INVITE_URL,
  DISCORD_NOTIFICATION_VERSION,
  X_PROFILE_URL,
  X_NOTIFICATION_VERSION,
  INSTAGRAM_PROFILE_URL,
  INSTAGRAM_NOTIFICATION_VERSION,
} from '@/lib/data'
import { useFestivalWisher } from '@/lib/use-festival-wisher'

interface NotifyInput {
  title: string
  body: string
  icon?: NotificationIcon
  /** Set to false to record it in the notification centre without popping a toast. */
  toast?: boolean
  /** Optional CTA rendered as a real clickable link in both the toast and the notification centre. */
  actionUrl?: string
  actionLabel?: string
}

interface NotificationsContextValue {
  notifications: AppNotification[]
  unreadCount: number
  notify: (input: NotifyInput) => void
  markAllRead: () => void
  markRead: (id: string) => void
}

interface ToastItem {
  id: string
  title: string
  body: string
  actionUrl?: string
  actionLabel?: string
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

// Shared so the "remove the old one" and "file the new one" calls below can
// never drift apart into two different strings.
const WHATS_NEW_NOTIFICATION_TITLE = "What's new in Gaming Horizon"
const DISCORD_NOTIFICATION_TITLE = 'Join the Gaming Horizon Discord'
const X_NOTIFICATION_TITLE = 'Follow Gaming Horizon on X'
const INSTAGRAM_NOTIFICATION_TITLE = 'Our Instagram is live'

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, notificationPreferences } = useAuth()
  // Guests still get a working (if separate) notification feed, so the
  // "successfully done" toast works even before someone signs in.
  const userKey = user?.id ?? 'guest'

  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const refresh = useCallback(() => {
    setNotifications(readNotifications(userKey))
  }, [userKey])

  useEffect(() => {
    // A notification can be fired the instant someone signs up/in, before
    // the auth context has resolved their real user id — it briefly gets
    // filed under 'guest'. As soon as we land on a real userKey, sweep any
    // guest notifications into it so nothing (like the welcome notice) gets
    // silently dropped from the notification centre.
    if (userKey !== 'guest') migrateGuestNotifications(userKey)
    refresh()
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ userKey: string }>).detail
      if (!detail || detail.userKey === userKey) refresh()
    }
    window.addEventListener(NOTIFICATIONS_EVENT, onChange)
    return () => window.removeEventListener(NOTIFICATIONS_EVENT, onChange)
  }, [refresh, userKey])

  // Every user (signed in or guest) gets the full "What's New" feature
  // catalogue filed into their Notification Centre exactly once — not just
  // shown transiently as the first-visit modal. It's recorded silently
  // (toast: false) since it isn't tied to something the person just did.
  useEffect(() => {
    if (hasSentWhatsNewNotification(userKey, WHATS_NEW_VERSION)) return
    // Drop any older-version "What's new" entry first — a release big
    // enough to bump WHATS_NEW_VERSION replaces the old announcement in
    // the centre rather than piling a second copy on top of it.
    removeNotificationsByTitle(userKey, WHATS_NEW_NOTIFICATION_TITLE)
    addNotification(userKey, {
      title: WHATS_NEW_NOTIFICATION_TITLE,
      body: formatWhatsNewForNotification(),
      icon: 'update',
    })
    markWhatsNewNotificationSent(userKey, WHATS_NEW_VERSION)
    refresh()
  }, [refresh, userKey])

  // Every user (signed in or guest) gets a one-time notice about the
  // community Discord, filed silently into their Notification Centre
  // (toast: false) since it isn't tied to something the person just did.
  // Versioned like the What's New notice above: bumping
  // DISCORD_NOTIFICATION_VERSION (done whenever the invite link changes)
  // drops anyone's old entry — which would otherwise carry a dead link —
  // and refiles a fresh one with the current DISCORD_INVITE_URL.
  useEffect(() => {
    if (hasSentDiscordNotification(userKey, DISCORD_NOTIFICATION_VERSION)) return
    removeNotificationsByTitle(userKey, DISCORD_NOTIFICATION_TITLE)
    addNotification(userKey, {
      title: DISCORD_NOTIFICATION_TITLE,
      body: 'Our community server is live — hang out with other players, get news first, and talk directly with the team.',
      icon: 'celebration',
      actionUrl: DISCORD_INVITE_URL,
      actionLabel: 'Join Discord',
    })
    markDiscordNotificationSent(userKey, DISCORD_NOTIFICATION_VERSION)
    refresh()
  }, [refresh, userKey])

  // Same one-time treatment for the "we're on X now" announcement —
  // guarded and versioned the same way as the Discord notice above.
  useEffect(() => {
    if (hasSentXNotification(userKey, X_NOTIFICATION_VERSION)) return
    removeNotificationsByTitle(userKey, X_NOTIFICATION_TITLE)
    addNotification(userKey, {
      title: X_NOTIFICATION_TITLE,
      body: 'Our X account is live — follow along for announcements, behind-the-scenes updates, and first looks at what we\u2019re building.',
      icon: 'celebration',
      actionUrl: X_PROFILE_URL,
      actionLabel: 'Follow on X',
    })
    markXNotificationSent(userKey, X_NOTIFICATION_VERSION)
    refresh()
  }, [refresh, userKey])

  // Same one-time treatment for the "our Instagram is live" announcement —
  // guarded and versioned the same way as the Discord and X notices above.
  useEffect(() => {
    if (hasSentInstagramNotification(userKey, INSTAGRAM_NOTIFICATION_VERSION)) return
    removeNotificationsByTitle(userKey, INSTAGRAM_NOTIFICATION_TITLE)
    addNotification(userKey, {
      title: INSTAGRAM_NOTIFICATION_TITLE,
      body: 'Our Instagram account is live — follow along for visuals, sneak peeks, and behind-the-scenes moments from Gaming Horizon.',
      icon: 'celebration',
      actionUrl: INSTAGRAM_PROFILE_URL,
      actionLabel: 'Follow on Instagram',
    })
    markInstagramNotificationSent(userKey, INSTAGRAM_NOTIFICATION_VERSION)
    refresh()
  }, [refresh, userKey])

  const notify = useCallback(
    (input: NotifyInput) => {
      addNotification(userKey, input)
      if (input.toast === false) return
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      setToasts((current) => [
        ...current,
        { id, title: input.title, body: input.body, actionUrl: input.actionUrl, actionLabel: input.actionLabel },
      ])
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
      }, 6000)
    },
    [userKey],
  )

  // Only signed-up users (not guests) get auto-wished for major Indian
  // occasions (Diwali, Independence Day, Christmas, New Year, etc.), and
  // only if they haven't turned the preference off.
  useFestivalWisher(user?.id ?? null, notificationPreferences.festivalWishes, notify)

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const markAllRead = useCallback(() => {
    markAllReadInStore(userKey)
    refresh()
  }, [refresh, userKey])

  const markRead = useCallback(
    (id: string) => {
      markReadInStore(userKey, id)
      refresh()
    },
    [refresh, userKey],
  )

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  )

  // Surface a one-shot "you have unread notifications" popup when someone
  // opens the site with pending items already sitting in their
  // Notification Centre (as opposed to the toasts above, which fire for
  // things that happen during this visit). Gated per browser tab/session
  // per user so it doesn't reappear on every route change or re-render —
  // only once per fresh visit, and only ever tracked once we know whether
  // there's anything unread to report.
  const [pendingAlertOpen, setPendingAlertOpen] = useState(false)
  const pendingAlertCheckedFor = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Guests have no Notification Centre of their own to be alerted about —
    // only show the pending-unread popup once someone is actually signed in.
    if (!user) return
    if (pendingAlertCheckedFor.current === userKey) return
    const sessionKey = `gh:notifications:pending-popup-shown:${userKey}`
    let alreadyShownThisSession = false
    try {
      alreadyShownThisSession = window.sessionStorage.getItem(sessionKey) === '1'
    } catch {
      // Storage unavailable — fall back to showing at most once per mount.
    }
    if (alreadyShownThisSession) {
      pendingAlertCheckedFor.current = userKey
      return
    }
    if (unreadCount > 0) {
      setPendingAlertOpen(true)
      pendingAlertCheckedFor.current = userKey
      try {
        window.sessionStorage.setItem(sessionKey, '1')
      } catch {
        // Best-effort — worst case it can pop again next reload.
      }
    }
  }, [unreadCount, userKey])

  const dismissPendingAlert = useCallback(() => setPendingAlertOpen(false), [])

  const value = useMemo<NotificationsContextValue>(
    () => ({ notifications, unreadCount, notify, markAllRead, markRead }),
    [markAllRead, markRead, notifications, notify, unreadCount],
  )

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <PendingNotificationsPopup
        open={pendingAlertOpen}
        unreadCount={unreadCount}
        onClose={dismissPendingAlert}
      />
      <div
        className="pointer-events-none fixed right-4 top-[calc(1rem+env(safe-area-inset-top))] z-[300] flex w-[calc(100vw-2rem)] max-w-xl flex-col sm:right-6"
      >
        {/* Scrollable stack — several toasts queuing up (e.g. a few
            back-to-back saves) used to just keep growing straight down the
            screen with no ceiling, which could push the oldest ones off
            the bottom of the viewport entirely. Capping the height and
            letting this list scroll keeps every toast reachable instead. */}
        <div className="pointer-events-none flex max-h-[calc(100vh-2rem-env(safe-area-inset-top))] flex-col gap-3 overflow-y-auto overscroll-contain py-1 pr-1">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto flex w-full shrink-0 items-start gap-4 rounded-2xl border border-[rgb(var(--accent-1)/0.35)] p-5 shadow-2xl backdrop-blur-xl"
                style={{ background: 'color-mix(in oklab, var(--popover) 96%, transparent)' }}
              >
                <CheckCircle2 className="mt-0.5 size-7 shrink-0 text-[rgb(var(--accent-1))]" />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold leading-snug">{toast.title}</p>
                  <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{toast.body}</p>
                  {toast.actionUrl && (
                    <a
                      href={toast.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gh-interactive mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[rgb(var(--accent-1))] outline-none hover:underline"
                    >
                      {toast.actionLabel || 'Open link'}
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider')
  return context
}
