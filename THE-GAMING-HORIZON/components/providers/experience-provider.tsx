'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/components/providers/auth-provider'

export type ExperienceProfile = {
  schemaVersion: 1
  completed: boolean
  savedAt?: string
  genres: string[]
  sessionLength: string
  playStyle: string
  difficulty: string
  controller: string
  priorities: string[]
  device: string
  browser: string
  aiPriorities: string[]
}

export const EMPTY_EXPERIENCE: ExperienceProfile = {
  schemaVersion: 1,
  completed: false,
  genres: [],
  sessionLength: '',
  playStyle: '',
  difficulty: '',
  controller: '',
  priorities: [],
  device: '',
  browser: '',
  aiPriorities: [],
}

function isEmptyDraft(profile: ExperienceProfile) {
  return JSON.stringify({ ...profile, savedAt: undefined }) === JSON.stringify({ ...EMPTY_EXPERIENCE, savedAt: undefined })
}

// Per-account draft of the "Create Your Gaming Horizon Experience" profile,
// namespaced by user id (mirrors lib/notifications.ts and lib/playlists.ts)
// so signed-out visitors and different accounts on the same browser never
// see each other's answers — previously this was a single un-namespaced key,
// so whoever last used the browser (including a different signed-in
// account) would see the previous person's picks pre-filled at /welcome.
const STORAGE_PREFIX = 'gh:experience-profile:v1:'
// Pre-namespacing storage key — migrated into the guest bucket once, below,
// so existing local drafts aren't silently lost by this change.
const LEGACY_STORAGE_KEY = 'gh-experience-profile-v1'
const EXPERIENCE_EVENT = 'gh:experience-changed'

function storageKey(userKey: string) {
  return `${STORAGE_PREFIX}${userKey}`
}

function readDraft(userKey: string): ExperienceProfile {
  if (typeof window === 'undefined') return EMPTY_EXPERIENCE
  try {
    const raw = window.localStorage.getItem(storageKey(userKey))
    return raw ? { ...EMPTY_EXPERIENCE, ...JSON.parse(raw) } : EMPTY_EXPERIENCE
  } catch {
    return EMPTY_EXPERIENCE
  }
}

function writeDraft(userKey: string, profile: ExperienceProfile) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey(userKey), JSON.stringify(profile))
  } catch {
    // Local persistence is a convenience, not a requirement.
  }
  window.dispatchEvent(new CustomEvent(EXPERIENCE_EVENT, { detail: { userKey } }))
}

function clearDraft(userKey: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(storageKey(userKey))
  } catch {
    // Local persistence is a convenience, not a requirement.
  }
  window.dispatchEvent(new CustomEvent(EXPERIENCE_EVENT, { detail: { userKey } }))
}

// One-time migration from the old un-namespaced key into the 'guest'
// bucket, so a draft started before this change still shows up for whoever
// is browsing signed-out (and, from there, still migrates into their
// account via migrateGuestDraft below).
function migrateLegacyDraft() {
  if (typeof window === 'undefined') return
  try {
    const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!legacyRaw) return
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    if (isEmptyDraft(readDraft('guest'))) {
      const legacy = { ...EMPTY_EXPERIENCE, ...JSON.parse(legacyRaw) }
      writeDraft('guest', legacy)
    }
  } catch {
    // Local persistence is a convenience, not a requirement.
  }
}

// Carries a signed-out visitor's homepage preview draft into their account
// the moment they sign in/up, so filling out "Create Your Experience" before
// creating an account isn't lost — that's what lets the homepage preview
// flow straight into the /welcome onboarding wizard. An account that
// already has its own saved draft always keeps it; the guest draft is only
// adopted when the account's own draft is still empty.
function migrateGuestDraft(userKey: string) {
  if (userKey === 'guest') return
  const guestDraft = readDraft('guest')
  if (isEmptyDraft(guestDraft)) return
  if (isEmptyDraft(readDraft(userKey))) writeDraft(userKey, guestDraft)
  clearDraft('guest')
}

type ExperienceContextValue = {
  saved: ExperienceProfile
  save: (profile: ExperienceProfile) => void
  reset: () => void
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null)

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  // Guests still get a working (if separate) local draft, so the homepage
  // "Create Your Experience" preview works before anyone signs in.
  const userKey = user?.id ?? 'guest'
  const [saved, setSaved] = useState<ExperienceProfile>(EMPTY_EXPERIENCE)

  useEffect(() => {
    migrateLegacyDraft()
    if (userKey !== 'guest') migrateGuestDraft(userKey)
    setSaved(readDraft(userKey))

    const onChange = (e: Event) => {
      const detailKey = (e as CustomEvent<{ userKey: string }>).detail?.userKey
      if (!detailKey || detailKey === userKey) setSaved(readDraft(userKey))
    }
    window.addEventListener(EXPERIENCE_EVENT, onChange)
    return () => window.removeEventListener(EXPERIENCE_EVENT, onChange)
  }, [userKey])

  const value = useMemo<ExperienceContextValue>(() => ({
    saved,
    save(profile) {
      const next = { ...profile, schemaVersion: 1 as const, savedAt: new Date().toISOString() }
      setSaved(next)
      writeDraft(userKey, next)
    },
    reset() {
      setSaved(EMPTY_EXPERIENCE)
      clearDraft(userKey)
    },
  }), [saved, userKey])

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>
}

export function useExperience() {
  const value = useContext(ExperienceContext)
  if (!value) throw new Error('useExperience must be used within ExperienceProvider')
  return value
}
