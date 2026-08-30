'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { isAvatarAnimation, type AvatarAnimation } from '@/components/ui/avatar-frame'

export interface TaskbarPreferences {
  visibleLinks: string[]
  showBeta: boolean
  showSearch: boolean
  showCustomize: boolean
  showWaitlist: boolean
}

export const DEFAULT_TASKBAR_PREFERENCES: TaskbarPreferences = {
  visibleLinks: ['/', '/vision', '/platform', '/ai', '/games', '/music', '/roadmap', '/beta', '/blog', '/faq'],
  // The Beta Preview badge is shown in the taskbar by default so visitors
  // can see the closed-access status and countdown at a glance; people can
  // still turn it off from their taskbar preferences.
  showBeta: true,
  showSearch: true,
  showCustomize: true,
  showWaitlist: true,
}

export interface PlayerProfileUpdate {
  display_name: string
  gamer_tag: string
  bio: string
  favorite_platform: string
  favorite_genre: string
  play_style: string
  avatar_data_url?: string
  avatar_animation?: AvatarAnimation
  taskbar_preferences?: TaskbarPreferences
}

export interface ExperienceUpdate {
  experience_profile: unknown
  onboarding_completed: boolean
}

export interface NotificationPreferences {
  productUpdates: boolean
  securityAlerts: boolean
  gameRequestReplies: boolean
  betaInvites: boolean
  newsletter: boolean
  festivalWishes: boolean
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  productUpdates: true,
  securityAlerts: true,
  gameRequestReplies: true,
  betaInvites: true,
  newsletter: false,
  festivalWishes: true,
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  displayName: string
  initials: string
  avatarUrl: string
  avatarAnimation: AvatarAnimation
  taskbarPreferences: TaskbarPreferences
  notificationPreferences: NotificationPreferences
  hasPassword: boolean
  refreshUser: () => Promise<void>
  signOut: () => Promise<{ ok: boolean; error?: string }>
  saveProfile: (profile: PlayerProfileUpdate) => Promise<{ ok: boolean; error?: string }>
  saveExperience: (experience: ExperienceUpdate) => Promise<{ ok: boolean; error?: string }>
  saveNotificationPreferences: (preferences: NotificationPreferences) => Promise<{ ok: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getDisplayName(user: User | null) {
  const metadata = user?.user_metadata ?? {}
  const candidates = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    metadata.preferred_username,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
  }

  if (user?.email) return user.email.split('@')[0]
  return 'Player'
}

function getInitials(label: string) {
  const words = label
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (!words.length) return 'GH'
  return words.map((word) => word[0]?.toUpperCase() || '').join('').slice(0, 2)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser()
    if (!error) setUser(data.user ?? null)
  }, [supabase])

  useEffect(() => {
    let active = true

    // Read the browser session first so the navigation can reflect a signed-in
    // user immediately after hydration. Protected routes still verify the user
    // on the server; this provider is for UI state and form convenience.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // Then verify/refresh the user record in the background so metadata edits
    // made on another tab or device are picked up when possible.
    supabase.auth.getUser().then(({ data, error }) => {
      if (!active || error) return
      setUser(data.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) return { ok: false, error: error.message }
    setUser(null)
    return { ok: true }
  }, [supabase])

  const saveProfile = useCallback(
    async (profile: PlayerProfileUpdate) => {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...(user?.user_metadata ?? {}),
          ...profile,
        },
      })

      if (error) return { ok: false, error: error.message }
      if (data.user) setUser(data.user)
      return { ok: true }
    },
    [supabase, user],
  )

  const saveExperience = useCallback(
    async (experience: ExperienceUpdate) => {
      const { data, error } = await supabase.auth.updateUser({
        data: { ...(user?.user_metadata ?? {}), ...experience },
      })
      if (error) return { ok: false, error: error.message }
      if (data.user) setUser(data.user)
      return { ok: true }
    },
    [supabase, user],
  )

  const saveNotificationPreferences = useCallback(
    async (preferences: NotificationPreferences) => {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...(user?.user_metadata ?? {}),
          notification_preferences: preferences,
        },
      })
      if (error) return { ok: false, error: error.message }
      if (data.user) setUser(data.user)
      return { ok: true }
    },
    [supabase, user],
  )

  const displayName = useMemo(() => getDisplayName(user), [user])
  const avatarUrl = useMemo(() => {
    const value = user?.user_metadata?.avatar_data_url
    return typeof value === 'string' ? value : ''
  }, [user])

  const avatarAnimation = useMemo<AvatarAnimation>(() => {
    const value = user?.user_metadata?.avatar_animation
    return isAvatarAnimation(value) ? value : 'none'
  }, [user])

  const taskbarPreferences = useMemo<TaskbarPreferences>(() => {
    const raw = user?.user_metadata?.taskbar_preferences
    if (!raw || typeof raw !== 'object') return DEFAULT_TASKBAR_PREFERENCES
    const r = raw as Partial<TaskbarPreferences>
    return {
      visibleLinks: Array.isArray(r.visibleLinks) ? r.visibleLinks.filter((v): v is string => typeof v === 'string') : DEFAULT_TASKBAR_PREFERENCES.visibleLinks,
      showBeta: r.showBeta !== false,
      showSearch: r.showSearch !== false,
      showCustomize: r.showCustomize !== false,
      showWaitlist: r.showWaitlist !== false,
    }
  }, [user])

  const initials = useMemo(() => getInitials(displayName), [displayName])

  const notificationPreferences = useMemo<NotificationPreferences>(() => {
    const raw = user?.user_metadata?.notification_preferences
    if (!raw || typeof raw !== 'object') return DEFAULT_NOTIFICATION_PREFERENCES
    const r = raw as Partial<NotificationPreferences>
    return {
      productUpdates: r.productUpdates !== false,
      securityAlerts: r.securityAlerts !== false,
      gameRequestReplies: r.gameRequestReplies !== false,
      betaInvites: r.betaInvites !== false,
      newsletter: r.newsletter === true,
      festivalWishes: r.festivalWishes !== false,
    }
  }, [user])

  // has_password is our own flag (set at signup, at password reset, and
  // self-healed on password sign-in) since Supabase doesn't otherwise expose
  // whether an account has a password vs. is OTP-only.
  const hasPassword = useMemo(() => user?.user_metadata?.has_password === true, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      displayName,
      initials,
      avatarUrl,
      avatarAnimation,
      taskbarPreferences,
      notificationPreferences,
      hasPassword,
      refreshUser,
      signOut,
      saveProfile,
      saveExperience,
      saveNotificationPreferences,
    }),
    [avatarAnimation, avatarUrl, displayName, hasPassword, initials, loading, notificationPreferences, refreshUser, saveExperience, saveNotificationPreferences, saveProfile, signOut, taskbarPreferences, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
