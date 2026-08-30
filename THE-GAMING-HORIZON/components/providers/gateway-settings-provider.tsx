'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  gatewayConsentAllowsAppearance,
  gatewayConsentAllowsCursorInterface,
  gatewayConsentAllowsMotion,
  readGatewayConsent,
  subscribeToGatewayConsent,
  type GatewayConsentState,
} from '@/lib/gateway-consent'

export type GatewayThemeMode = 'light' | 'dark' | 'system'
export type GatewayMotionMode = 'full' | 'reduced' | 'off'
export type GatewayPerformancePreset = 'quality' | 'balanced' | 'battery'
export type GatewayCursorStyle =
  | 'default'
  | 'horizonDot'
  | 'neonRing'
  | 'minimalArrow'
  | 'pixelPointer'
  | 'orbital'
  | 'cometTrail'
  | 'softGlow'
export type GatewayAccentGroup = 'recommended' | 'cool' | 'warm' | 'neutral'
export type GatewayAccentKey =
  | 'horizonPurple'
  | 'lavenderMist'
  | 'cosmicViolet'
  | 'deepAmethyst'
  | 'royalIndigo'
  | 'midnightBlue'
  | 'sapphire'
  | 'glacierBlue'
  | 'arcticCyan'
  | 'aqua'
  | 'quantumTeal'
  | 'emerald'
  | 'mint'
  | 'lime'
  | 'amber'
  | 'amberGlow'
  | 'gold'
  | 'orange'
  | 'sunsetOrange'
  | 'coral'
  | 'crimson'
  | 'ruby'
  | 'rose'
  | 'horizonPink'
  | 'magenta'
  | 'graphite'
  | 'slate'
  | 'silver'
  | 'pearl'
  | 'monochrome'
export type GatewayBackgroundStyle =
  | 'cleanHorizon'
  | 'softGrid'
  | 'fadedGrid'
  | 'dotField'
  | 'orbitLines'
  | 'radialCore'
  | 'nebulaSurface'
  | 'frostedGlass'
  | 'deepSpace'
  | 'minimal'
export type GatewayAtmosphere =
  | 'calm'
  | 'cosmic'
  | 'aurora'
  | 'ocean'
  | 'sunset'
  | 'forest'
  | 'frost'
  | 'warmStudio'
  | 'neutral'
export type GatewayUniverseStyle =
  | 'glassOrbit'
  | 'connectedNodes'
  | 'holographicRings'
  | 'minimalUniverse'
  | 'dimensionalCore'

export interface GatewayAccentDefinition {
  label: string
  description: string
  group: GatewayAccentGroup
  a1: string
  a2: string
  a3: string
}

export const GATEWAY_ACCENTS: Record<GatewayAccentKey, GatewayAccentDefinition> = {
  horizonPurple: { label: 'Horizon Purple', description: 'The signature purple, blue, and cyan balance.', group: 'cool', a1: '109 40 217', a2: '79 70 229', a3: '8 145 178' },
  lavenderMist: { label: 'Lavender Mist', description: 'Soft lavender with polished indigo depth.', group: 'cool', a1: '109 40 217', a2: '139 92 246', a3: '99 102 241' },
  cosmicViolet: { label: 'Cosmic Violet', description: 'A deep violet with a precise blue edge.', group: 'cool', a1: '107 33 168', a2: '126 34 206', a3: '37 99 235' },
  deepAmethyst: { label: 'Deep Amethyst', description: 'Deep purple with a restrained cyan signal.', group: 'cool', a1: '88 28 135', a2: '109 40 217', a3: '14 116 144' },
  royalIndigo: { label: 'Royal Indigo', description: 'Focused indigo with polished sapphire depth.', group: 'cool', a1: '67 56 202', a2: '79 70 229', a3: '37 99 235' },
  midnightBlue: { label: 'Midnight Blue', description: 'Deep browser-night blue with a restrained cyan edge.', group: 'cool', a1: '30 58 138', a2: '30 64 175', a3: '14 165 233' },
  sapphire: { label: 'Sapphire Blue', description: 'Confident blue with restrained indigo support.', group: 'cool', a1: '29 78 216', a2: '37 99 235', a3: '79 70 229' },
  glacierBlue: { label: 'Glacier Blue', description: 'Airy blue with a clean cyan finish.', group: 'cool', a1: '3 105 161', a2: '14 165 233', a3: '6 182 212' },
  arcticCyan: { label: 'Arctic Cyan', description: 'Crisp cyan with controlled blue contrast.', group: 'cool', a1: '14 116 144', a2: '6 182 212', a3: '59 130 246' },
  aqua: { label: 'Aqua Pulse', description: 'Balanced aqua with a quiet teal foundation.', group: 'cool', a1: '14 116 144', a2: '6 182 212', a3: '13 148 136' },
  quantumTeal: { label: 'Quantum Teal', description: 'Deep teal with a precise cyan signal.', group: 'cool', a1: '13 104 101', a2: '13 148 136', a3: '34 211 238' },
  emerald: { label: 'Emerald Core', description: 'Premium emerald with restrained teal light.', group: 'cool', a1: '4 120 87', a2: '16 185 129', a3: '13 148 136' },
  mint: { label: 'Mint Signal', description: 'Fresh green with a refined aqua highlight.', group: 'cool', a1: '4 120 87', a2: '16 185 129', a3: '20 184 166' },
  lime: { label: 'Lime Energy', description: 'Controlled signal green with safe contrast.', group: 'warm', a1: '77 124 15', a2: '101 163 13', a3: '22 163 74' },
  amber: { label: 'Amber', description: 'Warm amber with measured orange energy.', group: 'warm', a1: '180 83 9', a2: '217 119 6', a3: '234 88 12' },
  amberGlow: { label: 'Amber Glow', description: 'Warm amber with a restrained luminous edge.', group: 'warm', a1: '146 64 14', a2: '217 119 6', a3: '251 191 36' },
  gold: { label: 'Solar Gold', description: 'A premium gold with grounded amber depth.', group: 'warm', a1: '161 98 7', a2: '202 138 4', a3: '217 119 6' },
  orange: { label: 'Sunset Orange', description: 'Clear orange with a restrained golden edge.', group: 'warm', a1: '194 65 12', a2: '234 88 12', a3: '217 119 6' },
  sunsetOrange: { label: 'Ember Orange', description: 'A deeper orange with measured gold highlights.', group: 'warm', a1: '154 52 18', a2: '234 88 12', a3: '245 158 11' },
  coral: { label: 'Coral', description: 'Warm coral with an elegant rose finish.', group: 'warm', a1: '194 65 12', a2: '244 63 94', a3: '225 29 72' },
  crimson: { label: 'Crimson', description: 'Deep crimson with refined rose highlights.', group: 'warm', a1: '159 18 57', a2: '190 18 60', a3: '225 29 72' },
  ruby: { label: 'Ruby', description: 'Rich ruby with refined magenta depth.', group: 'warm', a1: '159 18 57', a2: '190 24 93', a3: '219 39 119' },
  rose: { label: 'Rose Quartz', description: 'Soft rose balanced with a violet accent.', group: 'warm', a1: '190 24 93', a2: '219 39 119', a3: '168 85 247' },
  horizonPink: { label: 'Horizon Pink', description: 'Elegant pink with blue-violet depth.', group: 'warm', a1: '190 24 93', a2: '219 39 119', a3: '99 102 241' },
  magenta: { label: 'Magenta Pulse', description: 'Measured magenta with a controlled violet finish.', group: 'warm', a1: '162 28 175', a2: '192 38 211', a3: '126 34 206' },
  graphite: { label: 'Graphite', description: 'A composed neutral with premium contrast.', group: 'neutral', a1: '51 65 85', a2: '71 85 105', a3: '100 116 139' },
  slate: { label: 'Slate', description: 'Cool slate with a restrained sapphire undertone.', group: 'neutral', a1: '51 65 85', a2: '71 85 105', a3: '59 130 246' },
  silver: { label: 'Soft Silver', description: 'Cool silver with a quiet blue undertone.', group: 'neutral', a1: '71 85 105', a2: '100 116 139', a3: '148 163 184' },
  pearl: { label: 'Pearl', description: 'A clean light neutral with subtle dimensionality.', group: 'neutral', a1: '82 82 91', a2: '113 113 122', a3: '161 161 170' },
  monochrome: { label: 'Monochrome', description: 'A restrained black, slate, and silver brand treatment.', group: 'neutral', a1: '39 39 42', a2: '82 82 91', a3: '161 161 170' },
}

export const GATEWAY_ACCENT_GROUPS: Array<{ key: GatewayAccentGroup; label: string; accents: GatewayAccentKey[] }> = [
  { key: 'recommended', label: 'Recommended', accents: ['horizonPurple', 'royalIndigo', 'sapphire', 'arcticCyan', 'quantumTeal', 'horizonPink', 'amberGlow'] },
  { key: 'cool', label: 'Cool', accents: (Object.keys(GATEWAY_ACCENTS) as GatewayAccentKey[]).filter((key) => GATEWAY_ACCENTS[key].group === 'cool') },
  { key: 'warm', label: 'Warm', accents: (Object.keys(GATEWAY_ACCENTS) as GatewayAccentKey[]).filter((key) => GATEWAY_ACCENTS[key].group === 'warm') },
  { key: 'neutral', label: 'Neutral', accents: (Object.keys(GATEWAY_ACCENTS) as GatewayAccentKey[]).filter((key) => GATEWAY_ACCENTS[key].group === 'neutral') },
]


function readableGatewayAccentForeground(...tones: string[]) {
  const luminance = (tone: string) => {
    const [r, g, b] = tone.split(/\s+/).map(Number).map((value) => value / 255)
    const linear = (value: number) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
  }
  // Judge contrast against the background tone that's actually painted
  // behind the text (a1), not whichever passed-in tone happens to be
  // brightest — otherwise a dark accent with a brighter second tone (e.g.
  // Neon Green) ends up with unreadable dark-on-dark text.
  return luminance(tones[0]) > 0.33 ? 'rgb(8 18 32)' : 'rgb(255 255 255)'
}

export const GATEWAY_BACKGROUND_STYLES: Array<{ key: GatewayBackgroundStyle; label: string; description: string }> = [
  { key: 'cleanHorizon', label: 'Clean Horizon', description: 'A quiet foundation with no visible pattern.' },
  { key: 'softGrid', label: 'Soft Grid', description: 'Low-contrast lines that support spatial depth.' },
  { key: 'fadedGrid', label: 'Faded Grid', description: 'A grid that dissolves strongly toward the edges.' },
  { key: 'dotField', label: 'Dot Field', description: 'Restrained points suggesting a connected system.' },
  { key: 'orbitLines', label: 'Orbit Lines', description: 'Subtle circular guides around the universe visual.' },
  { key: 'radialCore', label: 'Radial Core', description: 'Focused ambient light behind the ecosystem core.' },
  { key: 'nebulaSurface', label: 'Nebula Surface', description: 'Soft dimensional color with restrained texture.' },
  { key: 'frostedGlass', label: 'Frosted Glass', description: 'Luminous glass depth without heavy blur.' },
  { key: 'deepSpace', label: 'Deep Space', description: 'A richer surface tuned for the Gateway dark mode.' },
  { key: 'minimal', label: 'Minimal', description: 'Removes nearly all decorative background treatment.' },
]

export const GATEWAY_ATMOSPHERES: Array<{ key: GatewayAtmosphere; label: string; description: string }> = [
  { key: 'calm', label: 'Calm', description: 'Balanced signature lighting.' },
  { key: 'cosmic', label: 'Cosmic', description: 'Deeper purple-blue dimensional light.' },
  { key: 'aurora', label: 'Aurora', description: 'Cool cyan and violet flow.' },
  { key: 'ocean', label: 'Ocean', description: 'Blue-cyan clarity with calm depth.' },
  { key: 'sunset', label: 'Sunset', description: 'Warm coral and amber edge lighting.' },
  { key: 'forest', label: 'Forest', description: 'Muted emerald and teal atmosphere.' },
  { key: 'frost', label: 'Frost', description: 'Cool silver-blue illumination.' },
  { key: 'warmStudio', label: 'Warm Studio', description: 'Soft editorial warmth around the content.' },
  { key: 'neutral', label: 'Neutral', description: 'Minimal color influence and maximum clarity.' },
]

export const GATEWAY_UNIVERSE_STYLES: Array<{ key: GatewayUniverseStyle; label: string; description: string }> = [
  { key: 'glassOrbit', label: 'Glass Orbit', description: 'The signature dimensional glass composition.' },
  { key: 'connectedNodes', label: 'Connected Nodes', description: 'Stronger module relationships and connector emphasis.' },
  { key: 'holographicRings', label: 'Holographic Rings', description: 'More visible layered rings with restrained light.' },
  { key: 'minimalUniverse', label: 'Minimal Universe', description: 'A quieter composition with fewer decorative layers.' },
  { key: 'dimensionalCore', label: 'Dimensional Core', description: 'Greater focus on the central Gaming Horizon core.' },
]


export const GATEWAY_CURSORS: Array<{ key: GatewayCursorStyle; label: string; description: string }> = [
  { key: 'default', label: 'Default', description: 'Use the normal system cursor.' },
  { key: 'horizonDot', label: 'Horizon Dot', description: 'A precise accent dot with a quiet outer halo.' },
  { key: 'neonRing', label: 'Neon Ring', description: 'A clean luminous ring for Gateway controls.' },
  { key: 'minimalArrow', label: 'Minimal Arrow', description: 'A compact directional pointer with accent detail.' },
  { key: 'pixelPointer', label: 'Pixel Pointer', description: 'A restrained browser-gaming pixel pointer.' },
  { key: 'orbital', label: 'Orbital Cursor', description: 'A central point with a small orbiting signal.' },
  { key: 'cometTrail', label: 'Comet Trail', description: 'A lightweight pointer with a short fading trail.' },
  { key: 'softGlow', label: 'Soft Glow', description: 'A subtle illuminated point with no hard edge.' },
]

export interface GatewaySettings {
  theme: GatewayThemeMode
  accent: GatewayAccentKey
  backgroundStyle: GatewayBackgroundStyle
  atmosphere: GatewayAtmosphere
  motionMode: GatewayMotionMode
  performance: GatewayPerformancePreset
  universeStyle: GatewayUniverseStyle
  cursor: GatewayCursorStyle
  gridVisibility: number
  backgroundIntensity: number
  glowIntensity: number
  universeRotation: boolean
  connectorPulses: boolean
  ambientParticles: boolean
  pointerParallax: boolean
  entranceAnimation: boolean
}

export const DEFAULT_GATEWAY_SETTINGS: GatewaySettings = {
  theme: 'light',
  accent: 'horizonPurple',
  backgroundStyle: 'cleanHorizon',
  atmosphere: 'calm',
  motionMode: 'full',
  performance: 'balanced',
  universeStyle: 'glassOrbit',
  cursor: 'default',
  gridVisibility: 0.18,
  backgroundIntensity: 0.52,
  glowIntensity: 0.5,
  universeRotation: true,
  connectorPulses: true,
  ambientParticles: true,
  pointerParallax: true,
  entranceAnimation: true,
}

export const GATEWAY_SETTING_STORAGE_KEYS = {
  theme: 'gh_gateway_theme',
  accent: 'gh_gateway_accent',
  backgroundStyle: 'gh_gateway_background',
  atmosphere: 'gh_gateway_atmosphere',
  motionMode: 'gh_gateway_motion',
  performance: 'gh_gateway_performance',
  universeStyle: 'gh_gateway_universe_style',
  cursor: 'gh_gateway_cursor',
  gridVisibility: 'gh_gateway_grid_visibility',
  backgroundIntensity: 'gh_gateway_background_intensity',
  glowIntensity: 'gh_gateway_glow_intensity',
  universeRotation: 'gh_gateway_universe_rotation',
  connectorPulses: 'gh_gateway_connector_pulses',
  ambientParticles: 'gh_gateway_ambient_particles',
  pointerParallax: 'gh_gateway_pointer_parallax',
  entranceAnimation: 'gh_gateway_entrance_animation',
  version: 'gh_gateway_settings_version',
} as const

const GATEWAY_SETTINGS_VERSION = '3'

const APPEARANCE_KEYS: Array<keyof GatewaySettings> = [
  'theme',
  'accent',
  'backgroundStyle',
  'atmosphere',
  'universeStyle',
  'gridVisibility',
  'backgroundIntensity',
  'glowIntensity',
]
const CURSOR_KEYS: Array<keyof GatewaySettings> = ['cursor']
const MOTION_KEYS: Array<keyof GatewaySettings> = [
  'motionMode',
  'performance',
  'universeRotation',
  'connectorPulses',
  'ambientParticles',
  'pointerParallax',
  'entranceAnimation',
]

const LEGACY_ACCENTS: Record<string, GatewayAccentKey> = {
  aurora: 'horizonPurple', lavenderMist: 'lavenderMist', cosmicViolet: 'cosmicViolet', deepAmethyst: 'deepAmethyst',
  royalIndigo: 'royalIndigo', midnightBlue: 'midnightBlue', sapphire: 'sapphire', glacierBlue: 'glacierBlue',
  arcticCyan: 'arcticCyan', aquaPulse: 'aqua', tealCurrent: 'aqua', emeraldCore: 'emerald', mintSignal: 'mint',
  limeEnergy: 'lime', solarYellow: 'gold', amberGold: 'amber', tangerine: 'orange', sunsetCoral: 'coral',
  scarlet: 'crimson', crimson: 'crimson', ruby: 'crimson', roseQuartz: 'rose', magentaPulse: 'magenta',
  horizonPink: 'rose', graphite: 'graphite', slate: 'graphite', softSilver: 'silver', pearl: 'pearl',
  iceSilver: 'silver', monochrome: 'monochrome',
}
const LEGACY_BACKGROUNDS: Record<string, GatewayBackgroundStyle> = {
  defaultHorizon: 'cleanHorizon', cleanCanvas: 'cleanHorizon', softGrid: 'softGrid', fadedGrid: 'fadedGrid',
  dotMatrix: 'dotField', auroraWash: 'nebulaSurface', nebulaMist: 'nebulaSurface', radialGlow: 'radialCore',
  horizonLines: 'orbitLines', subtleNoise: 'nebulaSurface', frostedLight: 'frostedGlass', deepSpace: 'deepSpace',
  sunsetHaze: 'nebulaSurface', oceanGlow: 'nebulaSurface', emeraldAtmosphere: 'nebulaSurface',
  monochromeStudio: 'minimal', minimal: 'minimal',
}

const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback
}
const oneOf = <T extends string>(value: unknown, choices: readonly T[], fallback: T): T =>
  typeof value === 'string' && choices.includes(value as T) ? (value as T) : fallback
const readValue = (key: string) => {
  try { return localStorage.getItem(key) } catch { return null }
}
const readBoolean = (key: string, fallback: boolean) => {
  const value = readValue(key)
  return value === 'true' ? true : value === 'false' ? false : fallback
}

function sanitizeGatewaySettings(value: unknown): GatewaySettings {
  const input = value && typeof value === 'object' ? value as Partial<GatewaySettings> & Record<string, unknown> : {}
  const rawAccent = typeof input.accent === 'string' ? (LEGACY_ACCENTS[input.accent] ?? input.accent) : input.accent
  const rawBackground = typeof input.backgroundStyle === 'string' ? (LEGACY_BACKGROUNDS[input.backgroundStyle] ?? input.backgroundStyle) : input.backgroundStyle
  const rawAtmosphere = (input.atmosphere ?? (input as Record<string, unknown>).backgroundMode)
  const storedPerformance = (input as Record<string, unknown>).performance
  const rawPerformance = storedPerformance === 'high' ? 'quality' : input.performance
  return {
    theme: oneOf(input.theme, ['light', 'dark', 'system'] as const, DEFAULT_GATEWAY_SETTINGS.theme),
    accent: oneOf(rawAccent, Object.keys(GATEWAY_ACCENTS) as GatewayAccentKey[], DEFAULT_GATEWAY_SETTINGS.accent),
    backgroundStyle: oneOf(rawBackground, GATEWAY_BACKGROUND_STYLES.map((item) => item.key), DEFAULT_GATEWAY_SETTINGS.backgroundStyle),
    atmosphere: oneOf(rawAtmosphere, GATEWAY_ATMOSPHERES.map((item) => item.key), DEFAULT_GATEWAY_SETTINGS.atmosphere),
    motionMode: oneOf(input.motionMode, ['full', 'reduced', 'off'] as const, DEFAULT_GATEWAY_SETTINGS.motionMode),
    performance: oneOf(rawPerformance, ['quality', 'balanced', 'battery'] as const, DEFAULT_GATEWAY_SETTINGS.performance),
    universeStyle: oneOf(input.universeStyle, GATEWAY_UNIVERSE_STYLES.map((item) => item.key), DEFAULT_GATEWAY_SETTINGS.universeStyle),
    cursor: oneOf(input.cursor, GATEWAY_CURSORS.map((item) => item.key), DEFAULT_GATEWAY_SETTINGS.cursor),
    gridVisibility: clamp(input.gridVisibility, 0, 0.42, DEFAULT_GATEWAY_SETTINGS.gridVisibility),
    backgroundIntensity: clamp(input.backgroundIntensity, 0.2, 0.72, DEFAULT_GATEWAY_SETTINGS.backgroundIntensity),
    glowIntensity: clamp(input.glowIntensity, 0.16, 0.66, DEFAULT_GATEWAY_SETTINGS.glowIntensity),
    universeRotation: typeof input.universeRotation === 'boolean' ? input.universeRotation : typeof (input as Record<string, unknown>).heroObjects === 'boolean' ? Boolean((input as Record<string, unknown>).heroObjects) : DEFAULT_GATEWAY_SETTINGS.universeRotation,
    connectorPulses: typeof input.connectorPulses === 'boolean' ? input.connectorPulses : typeof (input as Record<string, unknown>).ambientMotion === 'boolean' ? Boolean((input as Record<string, unknown>).ambientMotion) : DEFAULT_GATEWAY_SETTINGS.connectorPulses,
    ambientParticles: typeof input.ambientParticles === 'boolean' ? input.ambientParticles : typeof (input as Record<string, unknown>).particlesEnabled === 'boolean' ? Boolean((input as Record<string, unknown>).particlesEnabled) : DEFAULT_GATEWAY_SETTINGS.ambientParticles,
    pointerParallax: typeof input.pointerParallax === 'boolean' ? input.pointerParallax : DEFAULT_GATEWAY_SETTINGS.pointerParallax,
    entranceAnimation: typeof input.entranceAnimation === 'boolean' ? input.entranceAnimation : DEFAULT_GATEWAY_SETTINGS.entranceAnimation,
  }
}

function readGatewaySettings(consent: GatewayConsentState | null): GatewaySettings {
  if (typeof window === 'undefined') return DEFAULT_GATEWAY_SETTINGS
  const next: Record<string, unknown> = { ...DEFAULT_GATEWAY_SETTINGS }
  if (gatewayConsentAllowsAppearance(consent)) {
    next.theme = readValue(GATEWAY_SETTING_STORAGE_KEYS.theme) ?? next.theme
    next.accent = readValue(GATEWAY_SETTING_STORAGE_KEYS.accent) ?? next.accent
    next.backgroundStyle = readValue(GATEWAY_SETTING_STORAGE_KEYS.backgroundStyle) ?? next.backgroundStyle
    next.atmosphere = readValue(GATEWAY_SETTING_STORAGE_KEYS.atmosphere) ?? next.atmosphere
    next.universeStyle = readValue(GATEWAY_SETTING_STORAGE_KEYS.universeStyle) ?? next.universeStyle
    next.gridVisibility = readValue(GATEWAY_SETTING_STORAGE_KEYS.gridVisibility) ?? next.gridVisibility
    next.backgroundIntensity = readValue(GATEWAY_SETTING_STORAGE_KEYS.backgroundIntensity) ?? next.backgroundIntensity
    next.glowIntensity = readValue(GATEWAY_SETTING_STORAGE_KEYS.glowIntensity) ?? next.glowIntensity
  }
  if (gatewayConsentAllowsCursorInterface(consent)) {
    next.cursor = readValue(GATEWAY_SETTING_STORAGE_KEYS.cursor) ?? next.cursor
  }
  if (gatewayConsentAllowsMotion(consent)) {
    next.motionMode = readValue(GATEWAY_SETTING_STORAGE_KEYS.motionMode) ?? next.motionMode
    next.performance = readValue(GATEWAY_SETTING_STORAGE_KEYS.performance) ?? next.performance
    next.universeRotation = readBoolean(GATEWAY_SETTING_STORAGE_KEYS.universeRotation, DEFAULT_GATEWAY_SETTINGS.universeRotation)
    next.connectorPulses = readBoolean(GATEWAY_SETTING_STORAGE_KEYS.connectorPulses, DEFAULT_GATEWAY_SETTINGS.connectorPulses)
    next.ambientParticles = readBoolean(GATEWAY_SETTING_STORAGE_KEYS.ambientParticles, DEFAULT_GATEWAY_SETTINGS.ambientParticles)
    next.pointerParallax = readBoolean(GATEWAY_SETTING_STORAGE_KEYS.pointerParallax, DEFAULT_GATEWAY_SETTINGS.pointerParallax)
    next.entranceAnimation = readBoolean(GATEWAY_SETTING_STORAGE_KEYS.entranceAnimation, DEFAULT_GATEWAY_SETTINGS.entranceAnimation)
  }
  // Migrate the previous isolated Gateway keys without touching main-site settings.
  if (!readValue(GATEWAY_SETTING_STORAGE_KEYS.atmosphere)) next.atmosphere = readValue('gh_gateway_atmosphere') ?? next.atmosphere
  if (!readValue(GATEWAY_SETTING_STORAGE_KEYS.universeRotation)) next.heroObjects = readValue('gh_gateway_hero_objects') === 'false' ? false : undefined
  if (!readValue(GATEWAY_SETTING_STORAGE_KEYS.ambientParticles)) next.particlesEnabled = readValue('gh_gateway_particles') === 'false' ? false : undefined
  if (!readValue(GATEWAY_SETTING_STORAGE_KEYS.connectorPulses)) next.ambientMotion = readValue('gh_gateway_ambient_motion') === 'false' ? false : undefined
  return sanitizeGatewaySettings(next)
}

function storageKeyFor(key: keyof GatewaySettings) {
  return GATEWAY_SETTING_STORAGE_KEYS[key as keyof typeof GATEWAY_SETTING_STORAGE_KEYS]
}
function removeStoredGatewayCategory(category: 'appearance' | 'motion' | 'cursor') {
  if (typeof window === 'undefined') return
  const keys = category === 'appearance' ? APPEARANCE_KEYS : category === 'motion' ? MOTION_KEYS : CURSOR_KEYS
  keys.forEach((key) => {
    const storageKey = storageKeyFor(key)
    if (storageKey) localStorage.removeItem(storageKey)
  })
}
function persistGatewaySettings(settings: GatewaySettings, consent: GatewayConsentState | null) {
  if (typeof window === 'undefined') return
  try {
    if (gatewayConsentAllowsAppearance(consent)) {
      APPEARANCE_KEYS.forEach((key) => localStorage.setItem(storageKeyFor(key), String(settings[key])))
    } else removeStoredGatewayCategory('appearance')
    if (gatewayConsentAllowsMotion(consent)) {
      MOTION_KEYS.forEach((key) => localStorage.setItem(storageKeyFor(key), String(settings[key])))
    } else removeStoredGatewayCategory('motion')
    if (gatewayConsentAllowsCursorInterface(consent)) {
      localStorage.setItem(GATEWAY_SETTING_STORAGE_KEYS.cursor, settings.cursor)
    } else removeStoredGatewayCategory('cursor')
    if (gatewayConsentAllowsAppearance(consent) || gatewayConsentAllowsMotion(consent) || gatewayConsentAllowsCursorInterface(consent)) localStorage.setItem(GATEWAY_SETTING_STORAGE_KEYS.version, GATEWAY_SETTINGS_VERSION)
    else localStorage.removeItem(GATEWAY_SETTING_STORAGE_KEYS.version)
  } catch {
    // Preferences remain usable in memory when storage is unavailable.
  }
}

function atmosphereImage(mode: GatewayAtmosphere) {
  const images: Record<GatewayAtmosphere, string> = {
    calm: 'radial-gradient(70% 58% at 68% 34%, rgb(var(--accent-1) / 0.105), transparent 72%), radial-gradient(50% 48% at 16% 16%, rgb(var(--accent-3) / 0.055), transparent 72%)',
    cosmic: 'radial-gradient(72% 66% at 64% 34%, rgb(var(--accent-1) / 0.17), transparent 74%), radial-gradient(48% 45% at 16% 82%, rgb(var(--accent-2) / 0.09), transparent 72%)',
    aurora: 'linear-gradient(135deg, rgb(var(--accent-2) / 0.12), transparent 38%, rgb(var(--accent-3) / 0.13)), radial-gradient(54% 45% at 22% 18%, rgb(var(--accent-1) / 0.07), transparent 74%)',
    ocean: 'radial-gradient(70% 60% at 82% 22%, rgb(6 182 212 / 0.14), transparent 72%), radial-gradient(60% 58% at 12% 82%, rgb(37 99 235 / 0.1), transparent 72%)',
    sunset: 'radial-gradient(68% 58% at 82% 20%, rgb(244 63 94 / 0.11), transparent 72%), radial-gradient(62% 56% at 12% 82%, rgb(217 119 6 / 0.095), transparent 72%)',
    forest: 'radial-gradient(68% 58% at 82% 20%, rgb(16 185 129 / 0.11), transparent 72%), radial-gradient(58% 52% at 12% 82%, rgb(13 148 136 / 0.095), transparent 72%)',
    frost: 'radial-gradient(75% 62% at 66% 18%, rgb(148 163 184 / 0.15), transparent 72%), radial-gradient(55% 50% at 15% 78%, rgb(14 165 233 / 0.105), transparent 72%)',
    warmStudio: 'radial-gradient(72% 64% at 18% 18%, rgb(251 191 36 / 0.12), transparent 72%), radial-gradient(55% 55% at 84% 75%, rgb(244 63 94 / 0.07), transparent 72%)',
    neutral: 'radial-gradient(72% 58% at 62% 18%, rgb(100 116 139 / 0.11), transparent 72%)',
  }
  return images[mode]
}

interface GatewaySettingsContextValue {
  settings: GatewaySettings
  update: <K extends keyof GatewaySettings>(key: K, value: GatewaySettings[K]) => void
  reset: () => void
  resetCategory: (category: 'appearanceMode' | 'accent' | 'background' | 'atmosphere' | 'cursor' | 'motion' | 'performance' | 'universe') => void
  ready: boolean
  resolvedTheme: 'light' | 'dark'
  consent: GatewayConsentState | null
  scopeStyle: CSSProperties
}
const GatewaySettingsContext = createContext<GatewaySettingsContextValue | null>(null)

export function GatewaySettingsProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<GatewayConsentState | null>(() => typeof window === 'undefined' ? null : readGatewayConsent())
  const [settings, setSettings] = useState<GatewaySettings>(() => typeof window === 'undefined' ? DEFAULT_GATEWAY_SETTINGS : readGatewaySettings(readGatewayConsent()))
  const [ready, setReady] = useState(() => typeof window !== 'undefined')
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => setSystemTheme(media.matches ? 'dark' : 'light')
    sync()
    media.addEventListener?.('change', sync)
    return () => media.removeEventListener?.('change', sync)
  }, [])

  useEffect(() => {
    const initialConsent = readGatewayConsent()
    setConsent(initialConsent)
    setSettings(readGatewaySettings(initialConsent))
    setReady(true)
    return subscribeToGatewayConsent((nextConsent) => {
      setConsent(nextConsent)
      setSettings((current) => {
        const next: Record<string, unknown> = { ...current }
        if (!gatewayConsentAllowsAppearance(nextConsent)) APPEARANCE_KEYS.forEach((key) => { next[key] = DEFAULT_GATEWAY_SETTINGS[key] })
        if (!gatewayConsentAllowsMotion(nextConsent)) MOTION_KEYS.forEach((key) => { next[key] = DEFAULT_GATEWAY_SETTINGS[key] })
        return sanitizeGatewaySettings(next)
      })
    })
  }, [])

  const resolvedTheme = settings.theme === 'system' ? systemTheme : settings.theme
  useEffect(() => { if (ready) persistGatewaySettings(settings, consent) }, [settings, consent, ready])

  const update = <K extends keyof GatewaySettings>(key: K, value: GatewaySettings[K]) => setSettings((current) => sanitizeGatewaySettings({ ...current, [key]: value }))
  const reset = () => setSettings(DEFAULT_GATEWAY_SETTINGS)
  const resetCategory: GatewaySettingsContextValue['resetCategory'] = (category) => {
    const keys: Record<typeof category, Array<keyof GatewaySettings>> = {
      appearanceMode: ['theme'], accent: ['accent'], background: ['backgroundStyle', 'gridVisibility'], atmosphere: ['atmosphere', 'backgroundIntensity', 'glowIntensity'], cursor: ['cursor'],
      motion: ['motionMode', 'universeRotation', 'connectorPulses', 'ambientParticles', 'pointerParallax', 'entranceAnimation'], performance: ['performance'], universe: ['universeStyle'],
    }
    setSettings((current) => {
      const next: Record<string, unknown> = { ...current }
      keys[category].forEach((key) => { next[key] = DEFAULT_GATEWAY_SETTINGS[key] })
      return sanitizeGatewaySettings(next)
    })
  }

  const scopeStyle = useMemo<CSSProperties>(() => {
    const accent = GATEWAY_ACCENTS[settings.accent]
    const dark = resolvedTheme === 'dark'
    return {
      '--accent-1': accent.a1,
      '--accent-2': accent.a2,
      '--accent-3': accent.a3,
      '--accent-button-fg': readableGatewayAccentForeground(accent.a1, accent.a2),
      '--gh-gateway-primary-foreground': readableGatewayAccentForeground(accent.a1, accent.a2),
      '--background': dark ? 'oklch(0.145 0.026 265)' : 'oklch(0.965 0.012 265)',
      '--foreground': dark ? 'oklch(0.94 0.012 265)' : 'oklch(0.2 0.04 265)',
      '--card': dark ? 'oklch(0.19 0.027 265)' : 'oklch(0.995 0.004 265)',
      '--card-foreground': dark ? 'oklch(0.94 0.012 265)' : 'oklch(0.2 0.04 265)',
      '--popover': dark ? 'oklch(0.18 0.025 265)' : 'oklch(0.995 0.004 265)',
      '--popover-foreground': dark ? 'oklch(0.94 0.012 265)' : 'oklch(0.2 0.04 265)',
      '--muted': dark ? 'oklch(0.23 0.025 265)' : 'oklch(0.92 0.015 265)',
      '--muted-foreground': dark ? 'oklch(0.72 0.022 265)' : 'oklch(0.44 0.04 265)',
      '--border': dark ? 'oklch(0.86 0.02 265 / 17%)' : 'oklch(0.2 0.04 265 / 16%)',
      '--input': dark ? 'oklch(0.86 0.02 265 / 20%)' : 'oklch(0.2 0.04 265 / 18%)',
      '--ring': `rgb(${accent.a1})`,
      '--particle-opacity': settings.ambientParticles ? (settings.performance === 'battery' ? 0 : settings.performance === 'balanced' ? 0.24 : 0.36) : 0,
      '--glass-opacity': settings.performance === 'battery' ? 0.82 : 0.62,
      '--grid-opacity': settings.gridVisibility,
      '--grid-visibility': settings.gridVisibility,
      '--background-pattern-strength': settings.gridVisibility,
      '--bg-intensity': settings.backgroundIntensity,
      '--atmosphere-strength': settings.backgroundStyle === 'minimal' ? 0.12 : Math.min(0.86, 0.28 + settings.backgroundIntensity * 0.72),
      '--glow-intensity': settings.glowIntensity,
      '--gh-atmosphere-image': atmosphereImage(settings.atmosphere),
      '--anim-scale': settings.motionMode === 'off' ? 0.001 : settings.motionMode === 'reduced' ? 0.28 : 0.72,
      colorScheme: resolvedTheme,
    } as CSSProperties
  }, [resolvedTheme, settings])

  return <GatewaySettingsContext.Provider value={{ settings, update, reset, resetCategory, ready, resolvedTheme, consent, scopeStyle }}>{children}</GatewaySettingsContext.Provider>
}

export function useGatewaySettings() {
  const context = useContext(GatewaySettingsContext)
  if (!context) throw new Error('useGatewaySettings must be used within GatewaySettingsProvider')
  return context
}
