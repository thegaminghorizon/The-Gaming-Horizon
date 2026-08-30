'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { SocialPlatformInfo } from '@/lib/data'

export interface ComingSoonState {
  label: string
  /** Clean display name for the platform (e.g. "GitHub") when it differs from the action label (e.g. "View GitHub"). */
  platform?: string
  /** True when this "coming soon" was triggered from a social platform icon, so the modal can point people at the socials that are already live instead of just the waitlist. */
  isSocial?: boolean
}

interface UICtx {
  waitlistOpen: boolean
  openWaitlist: () => void
  closeWaitlist: () => void
  studioOpen: boolean
  experienceOpen: boolean
  openExperience: () => void
  closeExperience: () => void
  openStudio: () => void
  closeStudio: () => void
  comingSoon: ComingSoonState | null
  openComingSoon: (label: string, options?: { platform?: string; isSocial?: boolean }) => void
  closeComingSoon: () => void
  bannerOffset: number
  setBannerOffset: (n: number) => void
  bottomOverlayOffset: number
  setBottomOverlayOffset: (n: number) => void
  cookieConsentVisible: boolean
  setCookieConsentVisible: (visible: boolean) => void
  rightFloatingObstacles: HTMLElement[]
  registerRightFloatingObstacle: (id: string, element: HTMLElement | null) => void
  leftFloatingObstacles: HTMLElement[]
  registerLeftFloatingObstacle: (id: string, element: HTMLElement | null) => void
  gatewayOpenRequest: { id: number }
  reopenGateway: () => void
  gatewayActive: boolean
  setGatewayActive: (active: boolean) => void
  mainSiteActivationId: number
  activateMainSite: () => void
  whatsNewOpenRequest: { id: number }
  reopenWhatsNew: () => void
  supportOpen: boolean
  supportPresetAmount: number | null
  openSupport: (presetAmount?: number) => void
  closeSupport: () => void
  socialConfirm: SocialPlatformInfo | null
  openSocialConfirm: (platform: SocialPlatformInfo) => void
  closeSocialConfirm: () => void
}

const Ctx = createContext<UICtx | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [waitlistOpen, setWaitlist] = useState(false)
  const [studioOpen, setStudio] = useState(false)
  const [experienceOpen, setExperience] = useState(false)
  const [comingSoon, setComingSoon] = useState<ComingSoonState | null>(null)
  const [bannerOffset, setBannerOffset] = useState(0)
  const [bottomOverlayOffset, setBottomOverlayOffset] = useState(0)
  const [cookieConsentVisible, setCookieConsentVisible] = useState(false)
  const [rightObstacleMap, setRightObstacleMap] = useState<Map<string, HTMLElement>>(() => new Map())
  const [leftObstacleMap, setLeftObstacleMap] = useState<Map<string, HTMLElement>>(() => new Map())
  const [gatewayOpenRequest, setGatewayOpenRequest] = useState<{ id: number }>({ id: 0 })
  // Start isolated until the Gateway controller has resolved the initial route.
  const [gatewayActive, setGatewayActive] = useState(true)
  const [mainSiteActivationId, setMainSiteActivationId] = useState(0)
  const [whatsNewOpenRequest, setWhatsNewOpenRequest] = useState<{ id: number }>({ id: 0 })
  const [supportOpen, setSupportOpen] = useState(false)
  const [supportPresetAmount, setSupportPresetAmount] = useState<number | null>(null)
  const [socialConfirm, setSocialConfirm] = useState<SocialPlatformInfo | null>(null)

  const registerRightFloatingObstacle = useCallback((id: string, element: HTMLElement | null) => {
    setRightObstacleMap((current) => {
      const next = new Map(current)
      if (element) {
        if (current.get(id) === element) return current
        next.set(id, element)
      } else {
        if (!current.has(id)) return current
        next.delete(id)
      }
      return next
    })
  }, [])

  const registerLeftFloatingObstacle = useCallback((id: string, element: HTMLElement | null) => {
    setLeftObstacleMap((current) => {
      const next = new Map(current)
      if (element) {
        if (current.get(id) === element) return current
        next.set(id, element)
      } else {
        if (!current.has(id)) return current
        next.delete(id)
      }
      return next
    })
  }, [])

  const rightFloatingObstacles = useMemo(() => Array.from(rightObstacleMap.values()), [rightObstacleMap])
  const leftFloatingObstacles = useMemo(() => Array.from(leftObstacleMap.values()), [leftObstacleMap])
  const reopenGateway = useCallback(() => {
    setGatewayOpenRequest((current) => ({ id: current.id + 1 }))
  }, [])
  const activateMainSite = useCallback(() => {
    setMainSiteActivationId((current) => current + 1)
  }, [])
  const reopenWhatsNew = useCallback(() => {
    setWhatsNewOpenRequest((current) => ({ id: current.id + 1 }))
  }, [])
  const openSupport = useCallback((presetAmount?: number) => {
    setSupportPresetAmount(presetAmount ?? null)
    setSupportOpen(true)
  }, [])
  const closeSupport = useCallback(() => setSupportOpen(false), [])
  const openSocialConfirm = useCallback((platform: SocialPlatformInfo) => setSocialConfirm(platform), [])
  const closeSocialConfirm = useCallback(() => setSocialConfirm(null), [])

  return (
    <Ctx.Provider
      value={{
        waitlistOpen,
        openWaitlist: () => setWaitlist(true),
        closeWaitlist: () => setWaitlist(false),
        studioOpen,
        experienceOpen,
        openExperience: () => setExperience(true),
        closeExperience: () => setExperience(false),
        openStudio: () => setStudio(true),
        closeStudio: () => setStudio(false),
        comingSoon,
        openComingSoon: (label, options) => setComingSoon({ label, ...options }),
        closeComingSoon: () => setComingSoon(null),
        bannerOffset,
        setBannerOffset,
        bottomOverlayOffset,
        setBottomOverlayOffset,
        cookieConsentVisible,
        setCookieConsentVisible,
        rightFloatingObstacles,
        registerRightFloatingObstacle,
        leftFloatingObstacles,
        registerLeftFloatingObstacle,
        gatewayOpenRequest,
        reopenGateway,
        gatewayActive,
        setGatewayActive,
        mainSiteActivationId,
        activateMainSite,
        whatsNewOpenRequest,
        reopenWhatsNew,
        supportOpen,
        supportPresetAmount,
        openSupport,
        closeSupport,
        socialConfirm,
        openSocialConfirm,
        closeSocialConfirm,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useUI() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
