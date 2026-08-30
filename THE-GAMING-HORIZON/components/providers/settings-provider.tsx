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

export type CursorStyle =
  | 'default'
  | 'horizonDot'
  | 'neonRing'
  | 'minimalArrow'
  | 'pixelPointer'
  | 'orbital'
  | 'cometTrail'
  | 'spark'
  | 'gamepad'
  | 'crosshair'
  | 'softGlow'
  | 'retroArcade'

export type ThemeMode = 'light' | 'dark' | 'system'
export type AccentGroup = 'recommended' | 'cool' | 'warm' | 'neutral'
export type AccentKey =
  | 'aurora'
  | 'lavenderMist'
  | 'cosmicViolet'
  | 'deepAmethyst'
  | 'royalIndigo'
  | 'midnightBlue'
  | 'sapphire'
  | 'glacierBlue'
  | 'arcticCyan'
  | 'aquaPulse'
  | 'tealCurrent'
  | 'quantumTeal'
  | 'emeraldCore'
  | 'mintSignal'
  | 'limeEnergy'
  | 'solarYellow'
  | 'amberGold'
  | 'amberGlow'
  | 'tangerine'
  | 'sunsetCoral'
  | 'scarlet'
  | 'crimson'
  | 'ruby'
  | 'roseQuartz'
  | 'magentaPulse'
  | 'horizonPink'
  | 'graphite'
  | 'slate'
  | 'softSilver'
  | 'pearl'
  | 'iceSilver'
  | 'monochrome'
  | 'electricViolet'
  | 'skylineBlue'
  | 'jadeSignal'
  | 'blazeOrange'
  | 'cherryBlossom'
  | 'goldenHour'
  | 'charcoalBlue'
  | 'ultramarine'
  | 'duskLavender'
  | 'peacockTeal'
  | 'steelBlue'
  | 'neonGreen'
  | 'cobaltStorm'
  | 'volcanicRed'
  | 'marigold'
  | 'blushRose'
  | 'champagne'
  | 'onyx'
  | 'cyberLime'
  | 'custom'

export type Density = 'compact' | 'cozy' | 'comfortable'
export type BackgroundMode = 'calm' | 'nebula' | 'aurora' | 'ocean' | 'sunset' | 'forest' | 'cosmic' | 'frost' | 'warmStudio' | 'neutral'
export type BackgroundStyle =
  | 'defaultHorizon'
  | 'cleanCanvas'
  | 'softGrid'
  | 'fadedGrid'
  | 'dotMatrix'
  | 'auroraWash'
  | 'nebulaMist'
  | 'radialGlow'
  | 'horizonLines'
  | 'subtleNoise'
  | 'frostedLight'
  | 'deepSpace'
  | 'sunsetHaze'
  | 'oceanGlow'
  | 'emeraldAtmosphere'
  | 'monochromeStudio'
  | 'minimal'
export type PerformancePreset = 'battery' | 'balanced' | 'high'
export type MotionMode = 'full' | 'reduced' | 'off'
export type LayoutView = 'desktop' | 'tablet' | 'phone'

export const LAYOUT_VIEWS: { key: LayoutView; label: string; desc: string }[] = [
  { key: 'desktop', label: 'Desktop', desc: 'Default full widescreen horizontal view' },
  { key: 'tablet', label: 'Tablet', desc: 'Centered container simulating a tablet viewport' },
  { key: 'phone', label: 'Phone', desc: 'Centered mobile frame aspect ratio' },
]

export const BACKGROUND_STYLES: {
  key: BackgroundStyle
  label: string
  desc: string
}[] = [
  { key: 'defaultHorizon', label: 'Default Horizon', desc: 'Signature grid and soft edge lighting' },
  { key: 'cleanCanvas', label: 'Clean Canvas', desc: 'Minimal pattern with quiet depth' },
  { key: 'softGrid', label: 'Soft Grid', desc: 'Fine technical lines with balanced contrast' },
  { key: 'fadedGrid', label: 'Faded Grid', desc: 'A lighter grid that dissolves at the edges' },
  { key: 'dotMatrix', label: 'Dot Matrix', desc: 'Sparse precision dots instead of lines' },
  { key: 'auroraWash', label: 'Aurora Wash', desc: 'Layered accent wash with no hard pattern' },
  { key: 'nebulaMist', label: 'Nebula Mist', desc: 'Diffuse depth with restrained texture' },
  { key: 'radialGlow', label: 'Radial Glow', desc: 'Focused light behind primary content' },
  { key: 'horizonLines', label: 'Horizon Lines', desc: 'Subtle horizontal depth cues' },
  { key: 'subtleNoise', label: 'Subtle Noise', desc: 'A fine premium texture with no visible grid' },
  { key: 'frostedLight', label: 'Frosted Light', desc: 'Soft luminous glass atmosphere' },
  { key: 'deepSpace', label: 'Deep Space', desc: 'Controlled dimensional depth for dark mode' },
  { key: 'sunsetHaze', label: 'Sunset Haze', desc: 'Warm edge lighting with a clean center' },
  { key: 'oceanGlow', label: 'Ocean Glow', desc: 'Cool blue-cyan depth around the viewport' },
  { key: 'emeraldAtmosphere', label: 'Emerald Atmosphere', desc: 'Muted green-teal ambient field' },
  { key: 'monochromeStudio', label: 'Monochrome Studio', desc: 'Neutral editorial depth and texture' },
  { key: 'minimal', label: 'Minimal', desc: 'Almost no decoration beyond the core surface' },
]

export const BACKGROUND_MODES: {
  key: BackgroundMode
  label: string
  desc: string
}[] = [
  { key: 'calm', label: 'Calm', desc: 'Quiet, balanced, and close to the default experience' },
  { key: 'nebula', label: 'Nebula', desc: 'Soft purple-blue dimensional color' },
  { key: 'aurora', label: 'Aurora', desc: 'Cool flowing light with restrained movement' },
  { key: 'ocean', label: 'Ocean', desc: 'Blue-cyan clarity with calm depth' },
  { key: 'sunset', label: 'Sunset', desc: 'Warm coral and amber edge lighting' },
  { key: 'forest', label: 'Forest', desc: 'Muted emerald and teal atmosphere' },
  { key: 'cosmic', label: 'Cosmic', desc: 'Sparse light points and deeper dimension' },
  { key: 'frost', label: 'Frost', desc: 'Cool silver-blue atmosphere with crisp contrast' },
  { key: 'warmStudio', label: 'Warm Studio', desc: 'Soft warm light for an editorial feel' },
  { key: 'neutral', label: 'Neutral', desc: 'Minimal color influence and maximum clarity' },
]

export const PERF_MULTIPLIER: Record<PerformancePreset, number> = {
  battery: 0.35,
  balanced: 0.75,
  high: 1,
}

export type AccentDefinition = {
  label: string
  description: string
  group: AccentGroup
  a1: string
  a2: string
  a3: string
}

export const ACCENTS: Record<AccentKey, AccentDefinition> = {
  aurora: { label: 'Horizon Purple', description: 'Signature purple, blue, and cyan', group: 'cool', a1: '109 40 217', a2: '79 70 229', a3: '8 145 178' },
  lavenderMist: { label: 'Lavender Mist', description: 'Soft lavender with crisp indigo depth', group: 'cool', a1: '109 40 217', a2: '139 92 246', a3: '99 102 241' },
  cosmicViolet: { label: 'Cosmic Violet', description: 'Confident violet balanced with blue', group: 'cool', a1: '107 33 168', a2: '126 34 206', a3: '37 99 235' },
  deepAmethyst: { label: 'Deep Amethyst', description: 'Deep purple with restrained cyan highlights', group: 'cool', a1: '88 28 135', a2: '109 40 217', a3: '14 116 144' },
  royalIndigo: { label: 'Royal Indigo', description: 'Focused indigo with a polished blue edge', group: 'cool', a1: '67 56 202', a2: '79 70 229', a3: '37 99 235' },
  midnightBlue: { label: 'Midnight Blue', description: 'Deep blue with quiet cyan clarity', group: 'cool', a1: '30 64 175', a2: '37 99 235', a3: '8 145 178' },
  sapphire: { label: 'Sapphire Blue', description: 'Premium sapphire blue with indigo support', group: 'cool', a1: '29 78 216', a2: '37 99 235', a3: '79 70 229' },
  glacierBlue: { label: 'Glacier Blue', description: 'Airy blue with a cool cyan finish', group: 'cool', a1: '3 105 161', a2: '14 165 233', a3: '6 182 212' },
  arcticCyan: { label: 'Arctic Cyan', description: 'Clean cyan with controlled blue contrast', group: 'cool', a1: '14 116 144', a2: '6 182 212', a3: '59 130 246' },
  aquaPulse: { label: 'Aqua Pulse', description: 'Balanced aqua with teal depth', group: 'cool', a1: '14 116 144', a2: '6 182 212', a3: '13 148 136' },
  tealCurrent: { label: 'Teal Current', description: 'Rich teal with a clean cyan highlight', group: 'cool', a1: '15 118 110', a2: '13 148 136', a3: '6 182 212' },
  quantumTeal: { label: 'Quantum Teal', description: 'Deep teal with a precise cyan signal', group: 'cool', a1: '13 104 101', a2: '13 148 136', a3: '34 211 238' },
  emeraldCore: { label: 'Emerald Core', description: 'Premium emerald with restrained teal', group: 'cool', a1: '4 120 87', a2: '16 185 129', a3: '13 148 136' },
  mintSignal: { label: 'Mint Signal', description: 'Fresh green with a polished teal finish', group: 'cool', a1: '4 120 87', a2: '16 185 129', a3: '20 184 166' },
  limeEnergy: { label: 'Lime Energy', description: 'Controlled lime with accessible contrast', group: 'warm', a1: '77 124 15', a2: '101 163 13', a3: '22 163 74' },
  solarYellow: { label: 'Solar Gold', description: 'Warm signal yellow with amber depth', group: 'warm', a1: '161 98 7', a2: '202 138 4', a3: '217 119 6' },
  amberGold: { label: 'Amber', description: 'Premium amber with a measured gold finish', group: 'warm', a1: '180 83 9', a2: '217 119 6', a3: '234 88 12' },
  amberGlow: { label: 'Amber Glow', description: 'Warm amber with a restrained luminous edge', group: 'warm', a1: '146 64 14', a2: '217 119 6', a3: '251 191 36' },
  tangerine: { label: 'Sunset Orange', description: 'Warm orange with controlled energy', group: 'warm', a1: '194 65 12', a2: '234 88 12', a3: '217 119 6' },
  sunsetCoral: { label: 'Coral', description: 'Coral warmth with a restrained rose edge', group: 'warm', a1: '194 65 12', a2: '244 63 94', a3: '225 29 72' },
  scarlet: { label: 'Scarlet', description: 'Confident red with balanced warmth', group: 'warm', a1: '185 28 28', a2: '220 38 38', a3: '225 29 72' },
  crimson: { label: 'Crimson', description: 'Deep crimson with elegant rose highlights', group: 'warm', a1: '159 18 57', a2: '190 18 60', a3: '225 29 72' },
  ruby: { label: 'Ruby', description: 'Rich ruby red with refined magenta depth', group: 'warm', a1: '159 18 57', a2: '190 24 93', a3: '219 39 119' },
  roseQuartz: { label: 'Rose Quartz', description: 'Soft rose with violet balance', group: 'warm', a1: '190 24 93', a2: '219 39 119', a3: '168 85 247' },
  magentaPulse: { label: 'Magenta Pulse', description: 'Measured magenta with a violet finish', group: 'warm', a1: '162 28 175', a2: '192 38 211', a3: '126 34 206' },
  horizonPink: { label: 'Horizon Pink', description: 'Elegant pink with blue-violet depth', group: 'warm', a1: '190 24 93', a2: '219 39 119', a3: '99 102 241' },
  graphite: { label: 'Graphite', description: 'Premium neutral contrast', group: 'neutral', a1: '51 65 85', a2: '71 85 105', a3: '100 116 139' },
  slate: { label: 'Slate', description: 'Cool slate with subtle blue undertones', group: 'neutral', a1: '51 65 85', a2: '71 85 105', a3: '59 130 246' },
  softSilver: { label: 'Soft Silver', description: 'Light silver with quiet blue depth', group: 'neutral', a1: '71 85 105', a2: '100 116 139', a3: '148 163 184' },
  pearl: { label: 'Pearl', description: 'Clean pearl neutral with a cool highlight', group: 'neutral', a1: '82 82 91', a2: '113 113 122', a3: '161 161 170' },
  iceSilver: { label: 'Ice Silver', description: 'Cool silver with a restrained cyan edge', group: 'neutral', a1: '71 85 105', a2: '100 116 139', a3: '8 145 178' },
  monochrome: { label: 'Monochrome', description: 'Minimal black, slate, and silver balance', group: 'neutral', a1: '39 39 42', a2: '63 63 70', a3: '113 113 122' },
  electricViolet: { label: 'Electric Violet', description: 'High-energy violet with a bold blue edge', group: 'cool', a1: '91 33 182', a2: '124 58 237', a3: '59 130 246' },
  skylineBlue: { label: 'Skyline Blue', description: 'Crisp sky blue with a cool cyan lift', group: 'cool', a1: '2 132 199', a2: '14 165 233', a3: '34 211 238' },
  jadeSignal: { label: 'Jade Signal', description: 'Balanced jade green with a cyan finish', group: 'cool', a1: '6 95 70', a2: '5 150 105', a3: '8 145 178' },
  blazeOrange: { label: 'Blaze Orange', description: 'Bold blaze orange with a warm red edge', group: 'warm', a1: '154 52 18', a2: '234 88 12', a3: '220 38 38' },
  cherryBlossom: { label: 'Cherry Blossom', description: 'Soft cherry pink with a violet finish', group: 'warm', a1: '190 18 60', a2: '236 72 153', a3: '167 139 250' },
  goldenHour: { label: 'Golden Hour', description: 'Warm gold with a soft coral edge', group: 'warm', a1: '180 83 9', a2: '245 158 11', a3: '244 63 94' },
  charcoalBlue: { label: 'Charcoal Blue', description: 'Deep neutral charcoal with a blue whisper', group: 'neutral', a1: '30 41 59', a2: '51 65 85', a3: '71 85 105' },
  ultramarine: { label: 'Ultramarine', description: 'Deep indigo blue with a bright periwinkle lift', group: 'cool', a1: '30 27 75', a2: '67 56 202', a3: '99 102 241' },
  duskLavender: { label: 'Dusk Lavender', description: 'Rich violet with a soft lavender highlight', group: 'cool', a1: '76 29 149', a2: '147 51 234', a3: '196 181 253' },
  peacockTeal: { label: 'Peacock Teal', description: 'Deep teal with a bright aqua edge', group: 'cool', a1: '19 78 74', a2: '15 118 110', a3: '45 212 191' },
  steelBlue: { label: 'Steel Blue', description: 'Cool slate-blue with a crisp sky highlight', group: 'cool', a1: '15 23 42', a2: '30 58 138', a3: '96 165 250' },
  neonGreen: { label: 'Neon Green', description: 'High-energy green with a fresh mint lift', group: 'cool', a1: '20 83 45', a2: '34 197 94', a3: '134 239 172' },
  cobaltStorm: { label: 'Cobalt Storm', description: 'Stormy blue-indigo with a cool cyan edge', group: 'cool', a1: '12 30 60', a2: '29 78 216', a3: '56 189 248' },
  volcanicRed: { label: 'Volcanic Red', description: 'Intense deep red with a warm ember highlight', group: 'warm', a1: '127 29 29', a2: '153 27 27', a3: '248 113 113' },
  marigold: { label: 'Marigold', description: 'Bright golden yellow with an amber base', group: 'warm', a1: '120 53 15', a2: '234 179 8', a3: '253 224 71' },
  blushRose: { label: 'Blush Rose', description: 'Soft warm rose with a delicate pink lift', group: 'warm', a1: '136 19 55', a2: '251 113 133', a3: '253 164 175' },
  cyberLime: { label: 'Cyber Lime', description: 'Punchy lime-green with a bold energetic edge', group: 'warm', a1: '54 83 20', a2: '132 204 22', a3: '190 242 100' },
  champagne: { label: 'Champagne', description: 'Warm neutral beige with a soft stone finish', group: 'neutral', a1: '87 83 78', a2: '168 162 158', a3: '214 211 209' },
  onyx: { label: 'Onyx', description: 'Deep near-black neutral with a cool graphite edge', group: 'neutral', a1: '9 9 11', a2: '24 24 27', a3: '82 82 91' },
  custom: { label: 'Custom Color', description: 'Your own hand-picked accent color', group: 'neutral', a1: '124 58 237', a2: '124 58 237', a3: '124 58 237' },
}

export const ACCENT_GROUPS: Array<{ key: AccentGroup; label: string; accents: AccentKey[] }> = [
  { key: 'recommended', label: 'Recommended', accents: ['aurora', 'royalIndigo', 'sapphire', 'arcticCyan', 'quantumTeal', 'horizonPink', 'amberGlow'] },
  { key: 'cool', label: 'Cool', accents: (Object.keys(ACCENTS) as AccentKey[]).filter((key) => key !== 'custom' && ACCENTS[key].group === 'cool') },
  { key: 'warm', label: 'Warm', accents: (Object.keys(ACCENTS) as AccentKey[]).filter((key) => key !== 'custom' && ACCENTS[key].group === 'warm') },
  { key: 'neutral', label: 'Neutral', accents: (Object.keys(ACCENTS) as AccentKey[]).filter((key) => key !== 'custom' && ACCENTS[key].group === 'neutral') },
]

const clampUnit = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/

export function isValidHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_PATTERN.test(value)
}

export function hexToRgbTriplet(hex: string): string {
  const clean = isValidHexColor(hex) ? hex : '#7c3aed'
  const r = parseInt(clean.slice(1, 3), 16)
  const g = parseInt(clean.slice(3, 5), 16)
  const b = parseInt(clean.slice(5, 7), 16)
  return `${r} ${g} ${b}`
}

function rgbTripletToHex(triplet: string): string {
  const [r, g, b] = triplet.split(/\s+/).map((n) => Math.round(clampUnit(Number(n), 0, 255)))
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      default:
        h = (rn - gn) / d + 4
        break
    }
    h *= 60
  }
  return { h, s, l }
}

function hslToRgbTriplet(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360
  const sat = clampUnit(s)
  const light = clampUnit(l)
  const c = (1 - Math.abs(2 * light - 1)) * sat
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = light - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (hue < 60) [r, g, b] = [c, x, 0]
  else if (hue < 120) [r, g, b] = [x, c, 0]
  else if (hue < 180) [r, g, b] = [0, c, x]
  else if (hue < 240) [r, g, b] = [0, x, c]
  else if (hue < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toChannel = (v: number) => Math.round(clampUnit((v + m)) * 255)
  return `${toChannel(r)} ${toChannel(g)} ${toChannel(b)}`
}

/** Derives a readable three-tone gradient (dark / base / light) from a single
 *  user-picked hex color, so custom accents flow through every place the
 *  built-in presets already do (buttons, glow, background, grid, atmosphere). */
export function buildCustomAccentTones(hex: string): { a1: string; a2: string; a3: string } {
  const safeHex = isValidHexColor(hex) ? hex : DEFAULT_CUSTOM_ACCENT_HEX
  const base = hexToRgbTriplet(safeHex)
  const [r, g, b] = base.split(' ').map(Number)
  const { h, s, l } = rgbToHsl(r, g, b)
  const a1 = hslToRgbTriplet(h, clampUnit(s * 1.05), clampUnit(l - 0.12, 0.12, 0.86))
  const a2 = base
  const a3 = hslToRgbTriplet(h + 16, clampUnit(s * 0.94), clampUnit(l + 0.16, 0.14, 0.9))
  return { a1, a2, a3 }
}

export function accentHexFromTriplet(triplet: string): string {
  return rgbTripletToHex(triplet)
}

/** Resolves the active accent's label/description/tones, handling the
 *  built-in presets as well as the user's custom picked color. Use this
 *  instead of indexing ACCENTS directly wherever the active accent is read. */
export function getAccentTones(settings: Pick<Settings, 'accent' | 'customAccentHex'>): AccentDefinition {
  if (settings.accent === 'custom') {
    const tones = buildCustomAccentTones(settings.customAccentHex)
    return { label: 'Custom Color', description: 'Your own hand-picked accent color', group: 'neutral', ...tones }
  }
  return ACCENTS[settings.accent]
}

function readableAccentForeground(...tones: string[]) {
  const luminance = (tone: string) => {
    const [r, g, b] = tone.split(/\s+/).map(Number).map((value) => value / 255)
    const linear = (value: number) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
  }
  // Buttons and badges only ever paint their background with the first
  // tone (--accent-1 / a1), so contrast must be judged against that tone
  // alone. Using the brightest of several tones here used to pick dark
  // text for accents whose background tone (a1) is dark but whose second
  // tone (a2) is bright — e.g. Neon Green — leaving text unreadable
  // against the actual (dark) button color.
  return luminance(tones[0]) > 0.33 ? 'rgb(8 18 32)' : 'rgb(255 255 255)'
}

export const DEFAULT_CUSTOM_ACCENT_HEX = '#7c3aed'

export interface Settings {
  theme: ThemeMode
  accent: AccentKey
  customAccentHex: string
  cursor: CursorStyle
  backgroundMode: BackgroundMode
  backgroundStyle: BackgroundStyle
  performance: PerformancePreset
  particleDensity: number
  animationIntensity: number
  backgroundIntensity: number
  glassOpacity: number
  density: Density
  reducedMotion: boolean
  loadingAnimations: 'full' | 'short' | 'off'
  motionMode: MotionMode
  ambientMotion: boolean
  heroObjects: boolean
  particlesEnabled: boolean
  floatingCards: boolean
  pageTransitions: boolean
  gridVisibility: number
  glowIntensity: number
  layoutView: LayoutView
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  accent: 'aurora',
  customAccentHex: DEFAULT_CUSTOM_ACCENT_HEX,
  cursor: 'default',
  backgroundMode: 'calm',
  backgroundStyle: 'defaultHorizon',
  performance: 'balanced',
  particleDensity: 0.32,
  animationIntensity: 0.72,
  backgroundIntensity: 0.52,
  glassOpacity: 0.58,
  density: 'cozy',
  reducedMotion: false,
  loadingAnimations: 'short',
  motionMode: 'full',
  ambientMotion: true,
  heroObjects: true,
  particlesEnabled: true,
  floatingCards: true,
  pageTransitions: true,
  gridVisibility: 0.34,
  glowIntensity: 0.55,
  layoutView: 'desktop',
}

const STORAGE_KEY = 'gh-settings-v13'
const LEGACY_KEYS = ['gh-settings-v12', 'gh-settings-v11', 'gh-settings-v10', 'gh-settings-v9', 'gh-settings-v8', 'gh-settings-v7', 'gh-settings-v6', 'gh-settings-v5', 'gh-settings-v4', 'gh-settings-v3']

const LEGACY_ACCENT_MAP: Record<string, AccentKey> = {
  violetPulse: 'cosmicViolet', ultraviolet: 'deepAmethyst', royalViolet: 'cosmicViolet', indigo: 'royalIndigo',
  midnightIndigo: 'midnightBlue', cobalt: 'sapphire', cyber: 'glacierBlue', skyBlue: 'glacierBlue', oceanBlue: 'sapphire',
  arctic: 'arcticCyan', ice: 'iceSilver', cyanWave: 'aquaPulse', teal: 'tealCurrent', lagoon: 'tealCurrent', emerald: 'emeraldCore',
  forest: 'emeraldCore', limeSignal: 'limeEnergy', gold: 'solarYellow', sunset: 'tangerine', copperOrange: 'tangerine', coral: 'sunsetCoral',
  redSignal: 'scarlet', rose: 'roseQuartz', sakura: 'horizonPink', pinkBloom: 'magentaPulse',
}
const LEGACY_CURSOR_MAP: Record<string, CursorStyle> = {
  glow: 'horizonDot', ring: 'neonRing', dot: 'horizonDot', pulse: 'orbital', trail: 'cometTrail', crystal: 'pixelPointer',
}
const LEGACY_BACKGROUND_MAP: Record<string, BackgroundMode> = {
  static: 'calm', mesh: 'neutral', grid: 'frost', starfield: 'cosmic',
}
const LEGACY_BACKGROUND_STYLE_MAP: Record<string, BackgroundStyle> = {
  grid: 'softGrid', soft: 'fadedGrid', clean: 'cleanCanvas', dots: 'dotMatrix', lines: 'horizonLines', noise: 'subtleNoise', glow: 'radialGlow',
}

const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback
  return Math.min(max, Math.max(min, n))
}

const oneOf = <T extends string>(value: unknown, values: readonly T[], fallback: T): T =>
  typeof value === 'string' && values.includes(value as T) ? (value as T) : fallback

function sanitizeSettings(value: unknown): Settings {
  const input = value && typeof value === 'object' ? (value as Partial<Settings> & Record<string, unknown>) : {}
  const motionMode = oneOf(input.motionMode, ['full', 'reduced', 'off'] as const, input.reducedMotion ? 'reduced' : DEFAULT_SETTINGS.motionMode)
  const reducedMotion = motionMode !== 'full'
  const rawAccent = typeof input.accent === 'string' ? (LEGACY_ACCENT_MAP[input.accent] ?? input.accent) : input.accent
  const rawCursor = typeof input.cursor === 'string' ? (LEGACY_CURSOR_MAP[input.cursor] ?? input.cursor) : input.cursor
  const rawBackground = typeof input.backgroundMode === 'string' ? (LEGACY_BACKGROUND_MAP[input.backgroundMode] ?? input.backgroundMode) : input.backgroundMode
  const rawBackgroundStyle = typeof input.backgroundStyle === 'string' ? (LEGACY_BACKGROUND_STYLE_MAP[input.backgroundStyle] ?? input.backgroundStyle) : input.backgroundStyle

  return {
    theme: oneOf(input.theme, ['light', 'dark', 'system'] as const, DEFAULT_SETTINGS.theme),
    accent: oneOf(rawAccent, Object.keys(ACCENTS) as AccentKey[], DEFAULT_SETTINGS.accent),
    customAccentHex: isValidHexColor(input.customAccentHex) ? input.customAccentHex : DEFAULT_SETTINGS.customAccentHex,
    cursor: oneOf(rawCursor, ['default', 'horizonDot', 'neonRing', 'minimalArrow', 'pixelPointer', 'orbital', 'cometTrail', 'spark', 'gamepad', 'crosshair', 'softGlow', 'retroArcade'] as const, DEFAULT_SETTINGS.cursor),
    backgroundMode: oneOf(rawBackground, BACKGROUND_MODES.map((mode) => mode.key), DEFAULT_SETTINGS.backgroundMode),
    backgroundStyle: oneOf(rawBackgroundStyle, BACKGROUND_STYLES.map((style) => style.key), DEFAULT_SETTINGS.backgroundStyle),
    performance: oneOf(input.performance, ['battery', 'balanced', 'high'] as const, DEFAULT_SETTINGS.performance),
    particleDensity: clamp(input.particleDensity, 0, 0.62, DEFAULT_SETTINGS.particleDensity),
    animationIntensity: clamp(input.animationIntensity, 0.25, 1, DEFAULT_SETTINGS.animationIntensity),
    backgroundIntensity: clamp(input.backgroundIntensity, 0.18, 0.76, DEFAULT_SETTINGS.backgroundIntensity),
    glassOpacity: clamp(input.glassOpacity, 0.48, 0.8, DEFAULT_SETTINGS.glassOpacity),
    density: oneOf(input.density, ['compact', 'cozy', 'comfortable'] as const, DEFAULT_SETTINGS.density),
    reducedMotion,
    loadingAnimations: oneOf(input.loadingAnimations, ['full', 'short', 'off'] as const, DEFAULT_SETTINGS.loadingAnimations),
    motionMode,
    ambientMotion: typeof input.ambientMotion === 'boolean' ? input.ambientMotion : DEFAULT_SETTINGS.ambientMotion,
    heroObjects: typeof input.heroObjects === 'boolean' ? input.heroObjects : DEFAULT_SETTINGS.heroObjects,
    particlesEnabled: typeof input.particlesEnabled === 'boolean' ? input.particlesEnabled : DEFAULT_SETTINGS.particlesEnabled,
    floatingCards: typeof input.floatingCards === 'boolean' ? input.floatingCards : DEFAULT_SETTINGS.floatingCards,
    pageTransitions: typeof input.pageTransitions === 'boolean' ? input.pageTransitions : DEFAULT_SETTINGS.pageTransitions,
    gridVisibility: clamp(input.gridVisibility, 0, 0.5, DEFAULT_SETTINGS.gridVisibility),
    glowIntensity: clamp(input.glowIntensity, 0.15, 0.7, DEFAULT_SETTINGS.glowIntensity),
    layoutView: oneOf(input.layoutView, ['desktop', 'tablet', 'phone'] as const, DEFAULT_SETTINGS.layoutView),
  }
}

const APPEARANCE_SETTING_KEYS: Array<keyof Settings> = [
  'theme',
  'accent',
  'customAccentHex',
  'backgroundMode',
  'backgroundStyle',
  'backgroundIntensity',
  'gridVisibility',
  'glowIntensity',
]

const CURSOR_INTERFACE_SETTING_KEYS: Array<keyof Settings> = [
  'cursor',
  'glassOpacity',
  'density',
]

const MOTION_SETTING_KEYS: Array<keyof Settings> = [
  'performance',
  'particleDensity',
  'animationIntensity',
  'reducedMotion',
  'loadingAnimations',
  'motionMode',
  'ambientMotion',
  'heroObjects',
  'particlesEnabled',
  'floatingCards',
  'pageTransitions',
]

function readStoredSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      for (const key of LEGACY_KEYS) {
        raw = localStorage.getItem(key)
        if (raw) break
      }
    }
    return raw ? sanitizeSettings(JSON.parse(raw)) : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

interface Ctx {
  settings: Settings
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  reset: () => void
  ready: boolean
  isDefault: boolean
  resolvedTheme: 'light' | 'dark'
}

const SettingsContext = createContext<Ctx | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [ready, setReady] = useState(false)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => setSystemTheme(media.matches ? 'dark' : 'light')
    sync()
    media.addEventListener?.('change', sync)
    return () => media.removeEventListener?.('change', sync)
  }, [])

  useEffect(() => {
    setSettings(readStoredSettings())
    setReady(true)
  }, [])

  const resolvedTheme = settings.theme === 'system' ? systemTheme : settings.theme

  // Applying settings touches ~20 DOM style/attribute writes plus a
  // synchronous localStorage write. Controls that fire rapid bursts of
  // updates (e.g. dragging the native custom-color picker) used to run this
  // whole block on every single event, which is what caused the visible lag.
  // The DOM writes are now coalesced to once per animation frame, and the
  // localStorage write is debounced, so a fast drag stays smooth while the
  // final value still always gets applied and persisted.
  const applyRafRef = useRef<number | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!ready) return
    const safe = sanitizeSettings(settings)
    if (JSON.stringify(safe) !== JSON.stringify(settings)) {
      setSettings(safe)
      return
    }

    if (applyRafRef.current !== null) cancelAnimationFrame(applyRafRef.current)
    applyRafRef.current = requestAnimationFrame(() => {
      applyRafRef.current = null

      const root = document.documentElement
      const accent = getAccentTones(safe)
      root.style.setProperty('--accent-1', accent.a1)
      root.style.setProperty('--accent-2', accent.a2)
      root.style.setProperty('--accent-3', accent.a3)
      const accentForeground = readableAccentForeground(accent.a1, accent.a2)
      root.style.setProperty('--accent-button-fg', accentForeground)
      root.style.setProperty('--primary-foreground', accentForeground)
      root.style.setProperty('--particle-opacity', String(safe.particlesEnabled ? safe.particleDensity : 0))
      root.style.setProperty('--bg-intensity', String(safe.backgroundIntensity))
      root.style.setProperty('--glass-opacity', String(safe.glassOpacity))
      root.style.setProperty('--grid-opacity', String(safe.gridVisibility))
      root.style.setProperty('--grid-visibility', String(safe.gridVisibility))
      root.style.setProperty('--glow-intensity', String(safe.glowIntensity))
      root.style.setProperty('--background-pattern-strength', String(Math.min(0.82, 0.28 + safe.gridVisibility)))
      root.style.setProperty('--atmosphere-strength', String(Math.min(0.9, 0.34 + safe.backgroundIntensity * 0.72)))
      root.style.setProperty('--anim-scale', String(safe.motionMode === 'off' ? 0.001 : safe.motionMode === 'reduced' ? 0.28 : safe.animationIntensity))
      const cursorAllowed = safe.motionMode === 'full' && safe.performance !== 'battery'
      root.setAttribute('data-cursor', cursorAllowed ? safe.cursor : 'default')
      root.setAttribute('data-density', safe.density)
      root.setAttribute('data-reduced', String(safe.motionMode !== 'full'))
      root.setAttribute('data-motion', safe.motionMode)
      root.setAttribute('data-bg-mode', safe.backgroundMode)
      root.setAttribute('data-bg-style', safe.backgroundStyle)
      root.setAttribute('data-atmosphere', safe.backgroundMode)
      root.setAttribute('data-background', safe.backgroundStyle)
      root.setAttribute('data-grid', safe.gridVisibility > 0 ? 'on' : 'off')
      root.setAttribute('data-theme', resolvedTheme)
      root.setAttribute('data-customization-ready', 'true')
      root.setAttribute('data-perf', safe.performance)
      root.setAttribute('data-ambient-motion', String(safe.ambientMotion))
      root.setAttribute('data-hero-objects', String(safe.heroObjects))
      root.setAttribute('data-floating-cards', String(safe.floatingCards))
      root.setAttribute('data-page-transitions', String(safe.pageTransitions))
      root.setAttribute('data-theme-preference', safe.theme)
      root.setAttribute('data-layout-view', safe.layoutView)
      root.classList.toggle('dark', resolvedTheme === 'dark')
      root.classList.toggle('light', resolvedTheme === 'light')
      root.style.colorScheme = resolvedTheme

      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((themeMeta) => {
        themeMeta.content = resolvedTheme === 'dark' ? '#0d1020' : '#f3f5fb'
      })
    })

    if (saveTimeoutRef.current !== null) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
        LEGACY_KEYS.forEach((key) => localStorage.removeItem(key))
      } catch {
        // Main-site preferences remain available in memory when persistence is unavailable.
      }
    }, 150)
  }, [settings, ready, resolvedTheme])

  useEffect(() => {
    return () => {
      if (applyRafRef.current !== null) cancelAnimationFrame(applyRafRef.current)
      if (saveTimeoutRef.current !== null) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => sanitizeSettings({ ...current, [key]: value }))
  }, [])

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])
  const isDefault = useMemo(() => JSON.stringify(settings) === JSON.stringify(DEFAULT_SETTINGS), [settings])

  const value = useMemo(
    () => ({ settings, update, reset, ready, isDefault, resolvedTheme }),
    [settings, update, reset, ready, isDefault, resolvedTheme],
  )

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
