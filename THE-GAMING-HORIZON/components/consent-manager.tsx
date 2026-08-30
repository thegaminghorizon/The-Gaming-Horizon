'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Cookie, ShieldCheck, X } from 'lucide-react'
import { useUI } from '@/components/providers/ui-provider'
import {
  GATEWAY_CONSENT_EVENT,
  GATEWAY_CONSENT_READY_EVENT,
  readGatewayConsent,
} from '@/lib/gateway-consent'

export const COOKIE_POLICY_VERSION = '2026-07-12'
export const TERMS_VERSION = '2026-07-12'
export const PRIVACY_VERSION = '2026-07-12'
const STORAGE_KEY = 'gh:cookie-consent'

export type CookieConsentChoice = 'accepted' | 'rejected'

type StoredConsent = {
  choice: CookieConsentChoice
  essential: true
  analytics: boolean
  policyVersion: string
  timestamp: string
}

export function readCookieConsent(): StoredConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as StoredConsent | null
    return parsed?.policyVersion === COOKIE_POLICY_VERSION ? parsed : null
  } catch {
    return null
  }
}

function save(choice: CookieConsentChoice) {
  const value: StoredConsent = {
    choice,
    essential: true,
    analytics: choice === 'accepted',
    policyVersion: COOKIE_POLICY_VERSION,
    timestamp: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('gh:cookie-consent-changed', { detail: value }))
  return value
}

export function ConsentManager() {
  const [mounted, setMounted] = useState(false)
  const [choice, setChoice] = useState<StoredConsent | null>(null)
  const [manageOpen, setManageOpen] = useState(false)
  const bannerRef = useRef<HTMLElement>(null)
  const { setBottomOverlayOffset, setCookieConsentVisible } = useUI()

  useEffect(() => {
    setMounted(true)
    const siteConsent = readCookieConsent()
    const gatewayConsent = readGatewayConsent()
    setChoice(siteConsent ?? (gatewayConsent ? {
      choice: 'rejected',
      essential: true,
      analytics: false,
      policyVersion: COOKIE_POLICY_VERSION,
      timestamp: gatewayConsent.updatedAt,
    } : null))

    const open = () => setManageOpen(true)
    const syncGatewayConsent = () => {
      if (readCookieConsent()) return
      const latest = readGatewayConsent()
      if (!latest) return
      setChoice({
        choice: 'rejected',
        essential: true,
        analytics: false,
        policyVersion: COOKIE_POLICY_VERSION,
        timestamp: latest.updatedAt,
      })
    }
    window.addEventListener('gh:open-privacy-preferences', open)
    window.addEventListener(GATEWAY_CONSENT_EVENT, syncGatewayConsent)
    window.addEventListener(GATEWAY_CONSENT_READY_EVENT, syncGatewayConsent)
    return () => {
      window.removeEventListener('gh:open-privacy-preferences', open)
      window.removeEventListener(GATEWAY_CONSENT_EVENT, syncGatewayConsent)
      window.removeEventListener(GATEWAY_CONSENT_READY_EVENT, syncGatewayConsent)
    }
  }, [])


  const bannerVisible = mounted && !choice && !manageOpen

  useEffect(() => {
    setCookieConsentVisible(bannerVisible)
    if (!bannerVisible) setBottomOverlayOffset(0)
    return () => {
      setCookieConsentVisible(false)
      setBottomOverlayOffset(0)
    }
  }, [bannerVisible, setBottomOverlayOffset, setCookieConsentVisible])

  useLayoutEffect(() => {
    if (!bannerVisible || !bannerRef.current) return
    const node = bannerRef.current
    const publish = () => setBottomOverlayOffset(Math.ceil(node.getBoundingClientRect().height) + 16)
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(node)
    window.addEventListener('resize', publish)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', publish)
    }
  }, [bannerVisible, setBottomOverlayOffset])

  const choose = (next: CookieConsentChoice) => {
    setChoice(save(next))
    setManageOpen(false)
  }

  if (!mounted) return null

  return (
    <>
      <AnimatePresence>
        {bannerVisible && (
          <motion.section
            ref={bannerRef}
            className="fixed inset-x-3 bottom-3 z-[900] mx-auto max-w-4xl rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur-lg sm:p-5"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="region"
            aria-label="Cookie and privacy preferences"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex max-w-2xl items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                  <Cookie className="size-4" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">Your privacy choices</h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Essential storage keeps the site working. Optional analytics help us understand visits and will stay off unless you allow them.
                  </p>
                </div>
              </div>
              <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-3">
                <button onClick={() => choose('accepted')} className="min-h-11 rounded-xl border border-[rgb(var(--accent-1)/0.45)] bg-[rgb(var(--accent-1)/0.12)] px-4 text-xs font-semibold hover:bg-[rgb(var(--accent-1)/0.18)]">Accept optional</button>
                <button onClick={() => choose('rejected')} className="min-h-11 rounded-xl border border-border px-4 text-xs font-semibold hover:bg-muted">Reject optional</button>
                <button onClick={() => setManageOpen(true)} className="min-h-11 rounded-xl border border-border px-4 text-xs font-semibold hover:bg-muted">Manage preferences</button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {manageOpen && (
          <div className="fixed inset-0 z-[950] grid place-items-center p-4">
            <motion.button aria-label="Close privacy preferences" className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setManageOpen(false)} />
            <motion.div className="glass-strong relative z-10 w-full max-w-lg rounded-3xl p-6" initial={{ opacity: 0, y: 16, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .97 }} role="dialog" aria-modal="true" aria-labelledby="privacy-pref-title">
              <button onClick={() => setManageOpen(false)} className="absolute right-4 top-4 grid size-10 place-items-center rounded-xl hover:bg-muted" aria-label="Close"><X className="size-4" /></button>
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]"><ShieldCheck className="size-5" /></span>
                <div><h2 id="privacy-pref-title" className="font-heading text-lg font-semibold">Privacy preferences</h2><p className="text-xs text-muted-foreground">Policy version {COOKIE_POLICY_VERSION}</p></div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-border p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Essential</p><p className="mt-1 text-xs text-muted-foreground">Required for preferences, navigation, security and form functionality.</p></div><span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600">Always on</span></div></div>
                <div className="rounded-2xl border border-border p-4"><div><p className="text-sm font-semibold">Optional analytics</p><p className="mt-1 text-xs text-muted-foreground">Anonymous usage measurement. No optional script should load before permission.</p></div></div>
              </div>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <button onClick={() => choose('accepted')} className="min-h-11 rounded-xl bg-[rgb(var(--accent-1))] px-4 text-sm font-semibold text-white">Accept optional</button>
                <button onClick={() => choose('rejected')} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted">Reject optional</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export function openPrivacyPreferences() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('gh:open-privacy-preferences'))
}
