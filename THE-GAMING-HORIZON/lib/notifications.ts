// Lightweight per-user notification store. Mirrors the pattern already used
// by lib/services.ts (localStorage-backed, since this project has no custom
// notifications backend). Notifications are namespaced by user id so signed
// out / different accounts on the same browser don't see each other's items.

export type NotificationIcon = 'success' | 'security' | 'waitlist' | 'question' | 'info' | 'celebration' | 'update'

export interface AppNotification {
  id: string
  title: string
  body: string
  icon: NotificationIcon
  createdAt: string
  read: boolean
  // Optional call-to-action rendered as a real, clickable link wherever the
  // notification shows up (toast, centre row detail, PendingNotifications
  // popup) — for notices that point somewhere (join our Discord, follow us
  // on X) rather than just informing. Kept separate from `body` so the
  // link is an actual <a> element instead of a URL sitting in plain text.
  actionUrl?: string
  actionLabel?: string
}

const PREFIX = 'gh:notifications:'
const MAX_ITEMS = 50

// Dispatched on the window whenever a user's notification list changes, so
// every mounted provider/panel can stay in sync without polling.
export const NOTIFICATIONS_EVENT = 'gh:notifications-changed'

function storageKey(userKey: string) {
  return `${PREFIX}${userKey}`
}

export function readNotifications(userKey: string): AppNotification[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(storageKey(userKey))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as AppNotification[]) : []
  } catch {
    return []
  }
}

function writeNotifications(userKey: string, list: AppNotification[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey(userKey), JSON.stringify(list.slice(0, MAX_ITEMS)))
  } catch {
    // Storage is best-effort (private browsing, quota, etc.) — the toast
    // still fires even if persistence fails.
  }
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_EVENT, { detail: { userKey } }))
}

export function addNotification(
  userKey: string,
  input: { title: string; body: string; icon?: NotificationIcon; actionUrl?: string; actionLabel?: string },
): AppNotification {
  const notification: AppNotification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    body: input.body,
    icon: input.icon ?? 'info',
    createdAt: new Date().toISOString(),
    read: false,
    actionUrl: input.actionUrl,
    actionLabel: input.actionLabel,
  }
  writeNotifications(userKey, [notification, ...readNotifications(userKey)])
  return notification
}

export function markAllRead(userKey: string) {
  writeNotifications(
    userKey,
    readNotifications(userKey).map((notification) => ({ ...notification, read: true })),
  )
}

export function markRead(userKey: string, id: string) {
  writeNotifications(
    userKey,
    readNotifications(userKey).map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    ),
  )
}

/**
 * Removes every stored notification with an exact title match — used to
 * clear out a stale "What's New" entry right before filing the current
 * version's, so a person's centre never ends up holding two versions of
 * the same announcement at once.
 */
export function removeNotificationsByTitle(userKey: string, title: string) {
  const remaining = readNotifications(userKey).filter((notification) => notification.title !== title)
  writeNotifications(userKey, remaining)
}

export function clearNotifications(userKey: string) {
  writeNotifications(userKey, [])
}

// Auth state (and therefore the "who am I" user id) resolves asynchronously
// after sign in/up, so a notification fired right away (e.g. the welcome
// notice) can briefly land under the 'guest' bucket before the real user id
// is known — and then never show up in that user's notification centre.
// Once we do know the real user key, fold any pending guest notifications
// into their account instead of losing them.
export function migrateGuestNotifications(userKey: string) {
  if (userKey === 'guest') return
  const guestItems = readNotifications('guest')
  if (guestItems.length === 0) return

  const existing = readNotifications(userKey)
  const existingIds = new Set(existing.map((notification) => notification.id))
  const merged = [...guestItems.filter((notification) => !existingIds.has(notification.id)), ...existing].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  writeNotifications(userKey, merged)
  writeNotifications('guest', [])
}

const WELCOME_NOTIFIED_PREFIX = 'gh:notifications:welcomed:'

// Guards the "Welcome to Gaming Horizon!" signup notification so it fires
// exactly once per account. Every signup path — email/password, email OTP,
// and OAuth (Google, Discord, GitHub) — lands on /welcome for a genuinely
// new account, so that's the single place it's fired from (see
// components/welcome-experience.tsx) instead of the signup form itself,
// which never re-runs after an OAuth redirect.
export function hasSentWelcomeNotification(userKey: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(`${WELCOME_NOTIFIED_PREFIX}${userKey}`) === '1'
  } catch {
    return false
  }
}

export function markWelcomeNotificationSent(userKey: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${WELCOME_NOTIFIED_PREFIX}${userKey}`, '1')
  } catch {
    // Best-effort — worst case the notification fires again on a later visit.
  }
}

// Guards the "What's New" catalogue notification the same way the welcome
// notification is guarded above — every user (including guests) should get
// it filed into their notification centre exactly once. The version comes
// from lib/whats-new.ts; bump it there whenever the feature catalogue
// changes enough to deserve landing in everyone's centre again.
const WHATS_NEW_NOTIFIED_PREFIX = 'gh:notifications:whats-new-sent:'

export function hasSentWhatsNewNotification(userKey: string, version: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(`${WHATS_NEW_NOTIFIED_PREFIX}${userKey}`) === version
  } catch {
    return false
  }
}

export function markWhatsNewNotificationSent(userKey: string, version: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${WHATS_NEW_NOTIFIED_PREFIX}${userKey}`, version)
  } catch {
    // Best-effort — worst case it's filed again on a later visit.
  }
}

// Guards the "Join our Discord" announcement the same way the welcome and
// What's New notifications are guarded above — every user (including
// guests) should get it filed into their notification centre exactly once.
//
// Versioned the same way WHATS_NEW_VERSION is: bump DISCORD_NOTIFICATION_VERSION
// in lib/data.ts whenever the invite link (or the announcement itself) changes,
// so everyone who already has the old entry gets it swapped for a fresh one
// instead of being stuck with a stale/dead invite link forever.
const DISCORD_NOTIFIED_PREFIX = 'gh:notifications:discord-sent:'

export function hasSentDiscordNotification(userKey: string, version: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(`${DISCORD_NOTIFIED_PREFIX}${userKey}`) === version
  } catch {
    return false
  }
}

export function markDiscordNotificationSent(userKey: string, version: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${DISCORD_NOTIFIED_PREFIX}${userKey}`, version)
  } catch {
    // Best-effort — worst case it's filed again on a later visit.
  }
}

// Guards the "Follow us on X" announcement the same way the Discord one
// above is guarded — every user (including guests) gets it filed into
// their notification centre exactly once. Versioned the same way: bump
// X_NOTIFICATION_VERSION in lib/data.ts whenever the profile link (or the
// announcement itself) changes, so everyone who already has the old entry
// gets it swapped for a fresh one instead of being stuck with a stale link.
const X_NOTIFIED_PREFIX = 'gh:notifications:x-sent:'

export function hasSentXNotification(userKey: string, version: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(`${X_NOTIFIED_PREFIX}${userKey}`) === version
  } catch {
    return false
  }
}

export function markXNotificationSent(userKey: string, version: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${X_NOTIFIED_PREFIX}${userKey}`, version)
  } catch {
    // Best-effort — worst case it's filed again on a later visit.
  }
}

// Guards the "Our Instagram is live" announcement the same way the Discord
// and X ones above are guarded — every user (including guests) gets it
// filed into their notification centre exactly once. Versioned the same
// way: bump INSTAGRAM_NOTIFICATION_VERSION in lib/data.ts whenever the
// profile link (or the announcement itself) changes, so everyone with the
// old entry gets it swapped for a fresh one instead of a stale link.
const INSTAGRAM_NOTIFIED_PREFIX = 'gh:notifications:instagram-sent:'

export function hasSentInstagramNotification(userKey: string, version: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(`${INSTAGRAM_NOTIFIED_PREFIX}${userKey}`) === version
  } catch {
    return false
  }
}

export function markInstagramNotificationSent(userKey: string, version: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${INSTAGRAM_NOTIFIED_PREFIX}${userKey}`, version)
  } catch {
    // Best-effort — worst case it's filed again on a later visit.
  }
}
