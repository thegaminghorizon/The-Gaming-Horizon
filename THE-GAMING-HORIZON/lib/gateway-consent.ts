export const GATEWAY_CONSENT_STORAGE_KEY = 'gh:gateway-consent-v2'
export const LEGACY_GATEWAY_CONSENT_STORAGE_KEY = 'gh:gateway-consent-v1'
export const GATEWAY_CONSENT_EVENT = 'gh:gateway-consent-changed'
export const GATEWAY_CONSENT_READY_EVENT = 'gh:gateway-consent-ready'
export const GATEWAY_CONSENT_VERSION = '2026-07-27-v2'

export interface GatewayConsentState {
  essential: true
  appearancePreferences: boolean
  motionPerformancePreferences: boolean
  cursorInterfacePreferences: boolean
  sessionConvenience: boolean
  policyVersion: string
  updatedAt: string
}

export type GatewayConsentDraft = Pick<
  GatewayConsentState,
  | 'appearancePreferences'
  | 'motionPerformancePreferences'
  | 'cursorInterfacePreferences'
  | 'sessionConvenience'
>

const GATEWAY_APPEARANCE_STORAGE_KEYS = [
  'gh_gateway_theme',
  'gh_gateway_accent',
  'gh_gateway_background',
  'gh_gateway_atmosphere',
  'gh_gateway_universe_style',
  'gh_gateway_grid_visibility',
  'gh_gateway_background_intensity',
  'gh_gateway_glow_intensity',
] as const

const GATEWAY_MOTION_STORAGE_KEYS = [
  'gh_gateway_motion',
  'gh_gateway_performance',
  'gh_gateway_universe_rotation',
  'gh_gateway_connector_pulses',
  'gh_gateway_ambient_particles',
  'gh_gateway_pointer_parallax',
  'gh_gateway_entrance_animation',
  // Previous isolated Gateway keys are removed during consent withdrawal.
  'gh_gateway_ambient_motion',
  'gh_gateway_hero_objects',
  'gh_gateway_particles',
] as const

const GATEWAY_CURSOR_INTERFACE_STORAGE_KEYS = [
  'gh_gateway_cursor',
  'gh_gateway_density',
  'gh_gateway_glass_opacity',
] as const

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function sanitizeGatewayConsent(value: unknown): GatewayConsentState | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Partial<GatewayConsentState>
  if (
    input.essential !== true ||
    !isBoolean(input.appearancePreferences) ||
    !isBoolean(input.motionPerformancePreferences) ||
    !isBoolean(input.sessionConvenience)
  ) {
    return null
  }

  return {
    essential: true,
    appearancePreferences: input.appearancePreferences,
    motionPerformancePreferences: input.motionPerformancePreferences,
    // v1 stored cursor/interface values under Appearance. Preserve that intent.
    cursorInterfacePreferences: isBoolean(input.cursorInterfacePreferences)
      ? input.cursorInterfacePreferences
      : input.appearancePreferences,
    sessionConvenience: input.sessionConvenience,
    policyVersion: GATEWAY_CONSENT_VERSION,
    updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : new Date().toISOString(),
  }
}

export function readGatewayConsent(): GatewayConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const current = localStorage.getItem(GATEWAY_CONSENT_STORAGE_KEY)
    const legacy = current ? null : localStorage.getItem(LEGACY_GATEWAY_CONSENT_STORAGE_KEY)
    const raw = current ?? legacy
    if (!raw) return null
    const parsed = sanitizeGatewayConsent(JSON.parse(raw))
    if (!parsed) {
      localStorage.removeItem(GATEWAY_CONSENT_STORAGE_KEY)
      localStorage.removeItem(LEGACY_GATEWAY_CONSENT_STORAGE_KEY)
      return null
    }
    if (!current) {
      localStorage.setItem(GATEWAY_CONSENT_STORAGE_KEY, JSON.stringify(parsed))
      localStorage.removeItem(LEGACY_GATEWAY_CONSENT_STORAGE_KEY)
    }
    return parsed
  } catch {
    return null
  }
}

function scrubStoredGatewaySettings(consent: GatewayConsentState) {
  if (typeof window === 'undefined') return

  if (!consent.appearancePreferences) {
    GATEWAY_APPEARANCE_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  }
  if (!consent.motionPerformancePreferences) {
    GATEWAY_MOTION_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  }
  if (!consent.cursorInterfacePreferences) {
    GATEWAY_CURSOR_INTERFACE_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  }

  if (
    !consent.appearancePreferences &&
    !consent.motionPerformancePreferences &&
    !consent.cursorInterfacePreferences
  ) {
    localStorage.removeItem('gh_gateway_settings_version')
  }

  if (!consent.sessionConvenience) {
    sessionStorage.removeItem('gh-entry-gateway-entered')
    sessionStorage.removeItem('gh_gateway_dismissed_session')
    document.cookie = 'gh_gateway_dismissed_session=; Path=/; Max-Age=0; SameSite=Lax'
  }
}

export function writeGatewayConsent(draft: GatewayConsentDraft): GatewayConsentState {
  const value: GatewayConsentState = {
    essential: true,
    appearancePreferences: Boolean(draft.appearancePreferences),
    motionPerformancePreferences: Boolean(draft.motionPerformancePreferences),
    cursorInterfacePreferences: Boolean(draft.cursorInterfacePreferences),
    sessionConvenience: Boolean(draft.sessionConvenience),
    policyVersion: GATEWAY_CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(GATEWAY_CONSENT_STORAGE_KEY, JSON.stringify(value))
    localStorage.removeItem(LEGACY_GATEWAY_CONSENT_STORAGE_KEY)
    scrubStoredGatewaySettings(value)
    window.dispatchEvent(new CustomEvent<GatewayConsentState>(GATEWAY_CONSENT_EVENT, { detail: value }))
  }
  return value
}

export function publishGatewayConsentToSite(consent: GatewayConsentState | null) {
  if (typeof window === 'undefined' || !consent) return
  window.dispatchEvent(new CustomEvent<GatewayConsentState>(GATEWAY_CONSENT_READY_EVENT, { detail: consent }))
}

export function subscribeToGatewayConsent(listener: (consent: GatewayConsentState | null) => void) {
  if (typeof window === 'undefined') return () => undefined
  const handle = (event: Event) => {
    const detail = (event as CustomEvent<GatewayConsentState>).detail
    listener(sanitizeGatewayConsent(detail))
  }
  window.addEventListener(GATEWAY_CONSENT_EVENT, handle)
  return () => window.removeEventListener(GATEWAY_CONSENT_EVENT, handle)
}

export function gatewayConsentAllowsAppearance(consent: GatewayConsentState | null) {
  return Boolean(consent?.appearancePreferences)
}

export function gatewayConsentAllowsMotion(consent: GatewayConsentState | null) {
  return Boolean(consent?.motionPerformancePreferences)
}

export function gatewayConsentAllowsCursorInterface(consent: GatewayConsentState | null) {
  return Boolean(consent?.cursorInterfacePreferences)
}
