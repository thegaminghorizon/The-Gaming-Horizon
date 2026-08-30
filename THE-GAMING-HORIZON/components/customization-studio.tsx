'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  Battery,
  Check,
  ChevronRight,
  Gauge,
  Grid3X3,
  Layers3,
  MousePointer2,
  Palette,
  RotateCcw,
  Settings2,
  Sparkles,
  SunMoon,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react'
import {
  ACCENTS,
  ACCENT_GROUPS,
  BACKGROUND_MODES,
  BACKGROUND_STYLES,
  buildCustomAccentTones,
  DEFAULT_SETTINGS,
  getAccentTones,
  isValidHexColor,
  useSettings,
  type CursorStyle,
  type Density,
  type MotionMode,
  type PerformancePreset,
  type ThemeMode,
} from '@/components/providers/settings-provider'
import { useUI } from '@/components/providers/ui-provider'
import { cn } from '@/lib/utils'

type Category = 'appearance' | 'motion' | 'performance'
type AppearanceSection = 'mode' | 'accent' | 'background' | 'atmosphere' | 'grid' | 'glow' | 'density' | 'cursor'

const categories: Array<{
  id: Category
  title: string
  description: string
  icon: typeof Palette
}> = [
  { id: 'appearance', title: 'Appearance', description: 'Theme, accents, cursor, atmosphere, and density', icon: Palette },
  { id: 'motion', title: 'Motion', description: 'Animation level and ambient movement', icon: Sparkles },
  { id: 'performance', title: 'Performance', description: 'Quality, balance, and battery presets', icon: Gauge },
]

const appearanceSections: Array<{
  id: AppearanceSection
  title: string
  description: string
  icon: typeof Palette
}> = [
  { id: 'mode', title: 'Appearance Mode', description: 'Light, Dark, or follow your system', icon: SunMoon },
  { id: 'accent', title: 'Accent Color', description: 'Curated palettes, or pick your own custom color', icon: Palette },
  { id: 'background', title: 'Background Style', description: 'Choose the base pattern and surface treatment', icon: Grid3X3 },
  { id: 'atmosphere', title: 'Atmosphere', description: 'Choose the ambient color and mood', icon: WandSparkles },
  { id: 'grid', title: 'Background Grid', description: 'Control the subtle technical grid', icon: Grid3X3 },
  { id: 'glow', title: 'Glow', description: 'Adjust restrained accent lighting', icon: Sparkles },
  { id: 'density', title: 'Interface Density', description: 'Compact, default, or roomier controls', icon: Layers3 },
  { id: 'cursor', title: 'Cursor', description: 'Twelve lightweight desktop cursor styles', icon: MousePointer2 },
]

const CURSORS: Array<{ value: CursorStyle; label: string; description: string }> = [
  { value: 'default', label: 'Default', description: 'Your normal system cursor' },
  { value: 'horizonDot', label: 'Horizon Dot', description: 'A precise accent dot' },
  { value: 'neonRing', label: 'Neon Ring', description: 'A restrained responsive ring' },
  { value: 'minimalArrow', label: 'Minimal Arrow', description: 'A lightweight directional pointer' },
  { value: 'pixelPointer', label: 'Pixel Pointer', description: 'A crisp game-inspired pointer' },
  { value: 'orbital', label: 'Orbital Cursor', description: 'A dot with a quiet orbit' },
  { value: 'cometTrail', label: 'Comet Trail', description: 'A short optimized trail' },
  { value: 'spark', label: 'Spark Cursor', description: 'A compact four-point signal' },
  { value: 'gamepad', label: 'Gamepad Pointer', description: 'A small browser-gaming controller' },
  { value: 'crosshair', label: 'Precision Crosshair', description: 'A clean accuracy-focused reticle' },
  { value: 'softGlow', label: 'Soft Glow', description: 'A quiet halo following the pointer' },
  { value: 'retroArcade', label: 'Retro Arcade', description: 'A restrained pixel-art cursor' },
]

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-1 rounded-xl border border-border/60 bg-muted/45 p-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'min-h-10 rounded-lg border border-transparent px-2 text-[11px] font-semibold outline-none transition-[transform,background-color,color,border-color,box-shadow] duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.62)]',
              active
                ? 'border-[rgb(var(--accent-1)/0.22)] bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:border-border/70 hover:bg-background/60 hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border/65 bg-background/55 p-3 text-left outline-none transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-px hover:border-[rgb(var(--accent-1)/0.32)] hover:bg-background/78 hover:shadow-sm active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.62)]"
    >
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-foreground">{label}</span>
        <span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">{description}</span>
      </span>
      <span className={cn('relative h-6 w-11 shrink-0 rounded-full border transition-colors', checked ? 'border-[rgb(var(--accent-1)/0.55)] bg-[rgb(var(--accent-1))]' : 'border-border bg-muted')}>
        <span className={cn('absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform duration-200', checked ? 'translate-x-6' : 'translate-x-1')} />
      </span>
    </button>
  )
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  const percentage = ((value - min) / (max - min)) * 100
  return (
    <label className="block rounded-2xl border border-border/65 bg-background/55 p-3 transition-colors hover:border-[rgb(var(--accent-1)/0.28)]">
      <span className="flex items-center justify-between gap-3 text-xs font-semibold text-foreground">
        {label}
        <span className="text-[10px] tabular-nums text-muted-foreground">{Math.round(value * 100)}%</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.5)] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-[rgb(var(--accent-1))] [&::-webkit-slider-thumb]:shadow-sm"
        style={{ background: `linear-gradient(90deg, rgb(var(--accent-1)) ${percentage}%, var(--border) ${percentage}%)` }}
      />
    </label>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]">{children}</p>
}

function CursorPreview({ value }: { value: CursorStyle }) {
  return (
    <span className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-border/70 bg-background/70" aria-hidden>
      {value === 'default' && <MousePointer2 className="size-4 text-foreground" />}
      {value === 'horizonDot' && <span className="size-2.5 rounded-full bg-[rgb(var(--accent-1))] shadow-[0_0_10px_rgb(var(--accent-1)/0.5)]" />}
      {value === 'neonRing' && <span className="size-5 rounded-full border-2 border-[rgb(var(--accent-1))] shadow-[0_0_8px_rgb(var(--accent-1)/0.45)]" />}
      {value === 'minimalArrow' && <span className="block h-5 w-4 -rotate-[18deg] rounded-sm border-l-2 border-t-2 border-[rgb(var(--accent-1))]" />}
      {value === 'pixelPointer' && <span className="block size-4 bg-[rgb(var(--accent-1))] [clip-path:polygon(0_0,0_100%,32%_72%,54%_100%,72%_88%,51%_61%,100%_58%)]" />}
      {value === 'orbital' && <span className="relative size-6 rounded-full border border-[rgb(var(--accent-1)/0.6)]"><span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--accent-1))]" /><span className="absolute -right-0.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-[rgb(var(--accent-3))]" /></span>}
      {value === 'cometTrail' && <span className="flex items-center gap-0.5"><span className="size-1 rounded-full bg-[rgb(var(--accent-1)/0.25)]" /><span className="size-1.5 rounded-full bg-[rgb(var(--accent-2)/0.55)]" /><span className="size-2 rounded-full bg-[rgb(var(--accent-1))]" /></span>}
      {value === 'spark' && <span className="size-5 bg-[rgb(var(--accent-1))] [clip-path:polygon(50%_0,61%_38%,100%_50%,61%_62%,50%_100%,39%_62%,0_50%,39%_38%)]" />}
      {value === 'gamepad' && <span className="relative h-4 w-7 rounded-[7px] border-2 border-[rgb(var(--accent-1))]"><span className="absolute left-1 top-1/2 h-1 w-2 -translate-y-1/2 bg-[rgb(var(--accent-1))] before:absolute before:left-1/2 before:top-[-2px] before:h-2 before:w-1 before:-translate-x-1/2 before:bg-[rgb(var(--accent-1))]" /><span className="absolute right-1 top-1 size-1 rounded-full bg-[rgb(var(--accent-2))]" /></span>}
      {value === 'crosshair' && <span className="relative size-6 rounded-full border border-[rgb(var(--accent-1)/0.75)]"><span className="absolute left-1/2 top-[-3px] h-7 w-px -translate-x-1/2 bg-[rgb(var(--accent-1)/0.65)]" /><span className="absolute left-[-3px] top-1/2 h-px w-7 -translate-y-1/2 bg-[rgb(var(--accent-1)/0.65)]" /></span>}
      {value === 'softGlow' && <span className="size-7 rounded-full bg-[radial-gradient(circle,rgb(var(--accent-1)/0.55),rgb(var(--accent-1)/0.12)_45%,transparent_72%)]" />}
      {value === 'retroArcade' && <span className="size-5 bg-[rgb(var(--accent-1))] [clip-path:polygon(0_0,60%_0,60%_20%,80%_20%,80%_40%,100%_40%,100%_60%,80%_60%,80%_80%,60%_80%,60%_100%,40%_100%,40%_70%,20%_70%,20%_50%,0_50%)]" />}
    </span>
  )
}

// Isolated from CustomizationStudio on purpose: this used to live as local
// state inside that ~700-line component, so every drag tick of the native
// color picker re-rendered the entire studio (all the accent swatches,
// background options, etc.) — that re-render churn was the actual source of
// the lag, not the color math itself. Keeping the picker's own draft state
// here means dragging only re-renders this small subtree. On top of that,
// dragging/typing no longer touches global settings at all — it only
// updates a local draft, and the color is committed (site-wide CSS vars +
// storage write) once, when "Apply" is pressed.
function CustomAccentPicker() {
  const { settings, update } = useSettings()
  const [draftHex, setDraftHex] = useState(settings.customAccentHex)

  useEffect(() => {
    setDraftHex(settings.customAccentHex)
  }, [settings.customAccentHex])

  const customPreview = useMemo(() => buildCustomAccentTones(draftHex), [draftHex])
  const draftValid = isValidHexColor(draftHex)
  const isDirty = draftValid && (draftHex.toLowerCase() !== settings.customAccentHex.toLowerCase() || settings.accent !== 'custom')

  const applyDraft = () => {
    if (!draftValid) return
    update('customAccentHex', draftHex)
    if (settings.accent !== 'custom') update('accent', 'custom')
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Custom</p>
      <div
        className={cn(
          'rounded-2xl border p-2.5 transition-colors',
          settings.accent === 'custom' ? 'border-[rgb(var(--accent-1)/0.5)] bg-[rgb(var(--accent-1)/0.09)] shadow-sm' : 'border-border/65 bg-background/38',
        )}
      >
        <button
          type="button"
          role="radio"
          aria-checked={settings.accent === 'custom'}
          aria-label="Use your custom picked color"
          onClick={() => update('accent', 'custom')}
          className="gh-interactive flex w-full items-center gap-2.5 rounded-xl text-left outline-none"
        >
          <span
            className="size-9 shrink-0 rounded-xl border border-white/55 shadow-sm dark:border-white/15"
            style={{ background: `linear-gradient(135deg,rgb(${customPreview.a1}),rgb(${customPreview.a2}),rgb(${customPreview.a3}))` }}
          />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold leading-[1.35] text-foreground">Custom Color</span>
            <span className="mt-0.5 block text-[9px] leading-4 text-muted-foreground">Pick any color of your own</span>
          </span>
          {settings.accent === 'custom' && <Check className="size-3.5 shrink-0 text-[rgb(var(--accent-1))]" />}
        </button>

        <label className="gh-interactive relative mt-2.5 flex h-11 w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl border border-border/60 px-3">
          <span
            aria-hidden
            className="absolute inset-0"
            style={{ background: `linear-gradient(90deg, rgb(${customPreview.a1}), rgb(${customPreview.a2}), rgb(${customPreview.a3}))` }}
          />
          <input
            type="color"
            aria-label="Open the custom accent color selector"
            value={draftValid ? draftHex : '#7c3aed'}
            onChange={(event) => setDraftHex(event.target.value)}
            className="absolute inset-0 size-full cursor-pointer border-none bg-transparent p-0 opacity-0"
          />
          <span className="pointer-events-none relative z-10 rounded-full border border-white/50 bg-background/85 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-foreground shadow-sm dark:border-white/10">
            Tap to pick a color
          </span>
          <span className="pointer-events-none relative z-10 rounded-full border border-white/50 bg-background/85 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-foreground shadow-sm dark:border-white/10">
            {draftHex.toUpperCase()}
          </span>
        </label>

        <div className="mt-2 flex items-center gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-border/60 bg-background/55 px-3 py-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Hex</span>
            <input
              type="text"
              inputMode="text"
              spellCheck={false}
              maxLength={7}
              value={draftHex}
              onChange={(event) => {
                const raw = event.target.value.trim()
                const value = raw && !raw.startsWith('#') ? `#${raw}` : raw
                setDraftHex(value)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') applyDraft()
              }}
              onBlur={() => {
                if (!isValidHexColor(draftHex)) setDraftHex(settings.customAccentHex)
              }}
              className="min-w-0 flex-1 bg-transparent text-[11px] font-semibold uppercase tracking-wide text-foreground outline-none"
              placeholder="#7C3AED"
            />
          </label>
          <button
            type="button"
            onClick={applyDraft}
            disabled={!isDirty}
            aria-label="Apply custom color"
            className="gh-interactive flex h-full shrink-0 items-center gap-1 rounded-xl bg-[rgb(var(--accent-1))] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--accent-button-fg)] outline-none disabled:cursor-not-allowed disabled:bg-[rgb(var(--accent-1)/0.3)] disabled:text-[color-mix(in_srgb,var(--accent-button-fg)_65%,transparent)]"
          >
            <Check className="size-3.5" />
            Apply
          </button>
        </div>
        <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
          {isDirty ? 'Pick a color and press Apply — it also drives the background, grid, and glow accents.' : 'Your custom color also drives the background, grid, and glow accents.'}
        </p>
      </div>
    </div>
  )
}

export function CustomizationStudio() {
  const { settings, update, reset, isDefault } = useSettings()
  const { studioOpen, closeStudio } = useUI()
  const systemReducedMotion = useReducedMotion()
  const reduceMotion = systemReducedMotion || settings.motionMode !== 'full'
  const [category, setCategory] = useState<Category | null>(null)
  const [appearanceSection, setAppearanceSection] = useState<AppearanceSection | null>(null)
  const panelRef = useRef<HTMLElement>(null)
  const hasOpenedRef = useRef(false)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!studioOpen) {
      setCategory(null)
      setAppearanceSection(null)
      return
    }
    hasOpenedRef.current = true
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeStudio()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>('button')?.focus(), 30)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [studioOpen, closeStudio])

  useEffect(() => {
    if (studioOpen || !hasOpenedRef.current) return
    hasOpenedRef.current = false
    window.setTimeout(() => {
      const target = returnFocusRef.current
      if (target?.isConnected) target.focus()
      else {
        const fallback = Array.from(document.querySelectorAll<HTMLElement>('[data-customize-trigger]')).find((element) => element.isConnected && element.getClientRects().length > 0)
        fallback?.focus()
      }
      returnFocusRef.current = null
    }, 0)
  }, [studioOpen])

  const setMotionMode = (value: MotionMode) => {
    update('motionMode', value)
    update('reducedMotion', value !== 'full')
  }

  const performanceOptions: Array<{ value: PerformancePreset; label: string; icon: typeof Battery }> = [
    { value: 'high', label: 'Quality', icon: Zap },
    { value: 'balanced', label: 'Balanced', icon: Gauge },
    { value: 'battery', label: 'Battery Saver', icon: Battery },
  ]

  const applyPerformance = (preset: PerformancePreset) => {
    update('performance', preset)
    if (preset === 'high') {
      update('particleDensity', 0.48)
      update('backgroundIntensity', 0.64)
      update('animationIntensity', 0.85)
      update('ambientMotion', true)
      update('heroObjects', true)
      update('particlesEnabled', true)
      update('floatingCards', true)
      update('pageTransitions', true)
    } else if (preset === 'balanced') {
      update('particleDensity', 0.32)
      update('backgroundIntensity', 0.52)
      update('animationIntensity', 0.72)
      update('ambientMotion', true)
      update('heroObjects', true)
      update('particlesEnabled', true)
      update('floatingCards', true)
      update('pageTransitions', true)
    } else {
      update('particleDensity', 0.08)
      update('backgroundIntensity', 0.28)
      update('animationIntensity', 0.42)
      update('ambientMotion', false)
      update('heroObjects', false)
      update('particlesEnabled', false)
      update('floatingCards', false)
      update('pageTransitions', false)
      update('cursor', 'default')
    }
  }

  const resetAppearanceSection = () => {
    if (appearanceSection === 'mode') update('theme', DEFAULT_SETTINGS.theme)
    if (appearanceSection === 'accent') {
      update('accent', DEFAULT_SETTINGS.accent)
      update('customAccentHex', DEFAULT_SETTINGS.customAccentHex)
    }
    if (appearanceSection === 'background') update('backgroundStyle', DEFAULT_SETTINGS.backgroundStyle)
    if (appearanceSection === 'atmosphere') {
      update('backgroundMode', DEFAULT_SETTINGS.backgroundMode)
      update('backgroundIntensity', DEFAULT_SETTINGS.backgroundIntensity)
    }
    if (appearanceSection === 'grid') update('gridVisibility', DEFAULT_SETTINGS.gridVisibility)
    if (appearanceSection === 'glow') update('glowIntensity', DEFAULT_SETTINGS.glowIntensity)
    if (appearanceSection === 'density') update('density', DEFAULT_SETTINGS.density)
    if (appearanceSection === 'cursor') update('cursor', DEFAULT_SETTINGS.cursor)
  }

  const back = () => {
    if (category === 'appearance' && appearanceSection) {
      setAppearanceSection(null)
      return
    }
    setCategory(null)
    setAppearanceSection(null)
  }

  const activeAccent = getAccentTones(settings)

  const title = appearanceSection
    ? appearanceSections.find((item) => item.id === appearanceSection)?.title
    : category
      ? categories.find((item) => item.id === category)?.title
      : 'Customize'

  return (
    <>
      <AnimatePresence>
        {studioOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close customization panel"
              className="fixed inset-0 z-[230] cursor-default bg-slate-950/[0.045] dark:bg-black/[0.14]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeStudio}
            />
            <motion.aside
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Customize Gaming Horizon"
              className="gh-customize-panel fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-3 z-[240] flex max-h-[min(86dvh,760px)] w-[calc(100vw-1.5rem)] max-w-[460px] flex-col overflow-hidden rounded-[28px] sm:right-5 sm:w-[460px]"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border/65 px-4">
                <div className="flex min-w-0 items-center gap-3">
                  {category ? (
                    <button type="button" onClick={back} aria-label="Back" className="gh-interactive grid size-9 shrink-0 place-items-center rounded-xl border border-border/65 bg-background/70 outline-none">
                      <ArrowLeft className="size-4" />
                    </button>
                  ) : (
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                      <Settings2 className="size-4" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate font-heading text-sm font-bold">{title}</h2>
                    <p className="truncate text-[10px] text-muted-foreground">Live preview · safe settings only</p>
                  </div>
                </div>
                <button type="button" onClick={closeStudio} aria-label="Close customization panel" className="gh-interactive grid size-9 place-items-center rounded-xl text-muted-foreground outline-none">
                  <X className="size-4" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                <AnimatePresence mode="wait" initial={false}>
                  {!category ? (
                    <motion.div key="categories" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: reduceMotion ? 0 : 0.18 }} className="space-y-2">
                      <div className="mb-4 rounded-2xl border border-[rgb(var(--accent-1)/0.16)] bg-[rgb(var(--accent-1)/0.055)] p-3">
                        <p className="text-xs font-semibold text-foreground">Polished by default</p>
                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">Every choice is constrained to preserve contrast, performance, and layout stability.</p>
                      </div>
                      {categories.map((item) => {
                        const Icon = item.icon
                        return (
                          <button key={item.id} type="button" onClick={() => setCategory(item.id)} className="gh-interactive group flex w-full items-center gap-3 rounded-2xl border border-border/65 bg-background/55 p-3 text-left outline-none">
                            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]"><Icon className="size-5" /></span>
                            <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-foreground">{item.title}</span><span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">{item.description}</span></span>
                            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                          </button>
                        )
                      })}
                    </motion.div>
                  ) : category === 'appearance' && !appearanceSection ? (
                    <motion.div key="appearance-menu" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}>
                      <p className="mb-4 text-sm font-semibold text-foreground">What would you like to customize?</p>
                      <div className="space-y-2">
                        {appearanceSections.map((item) => {
                          const Icon = item.icon
                          return (
                            <button key={item.id} type="button" onClick={() => setAppearanceSection(item.id)} className="gh-interactive group flex w-full items-center gap-3 rounded-2xl border border-border/65 bg-background/55 p-3 text-left outline-none">
                              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.09)] text-[rgb(var(--accent-1))]"><Icon className="size-4" /></span>
                              <span className="min-w-0 flex-1"><span className="block text-xs font-bold">{item.title}</span><span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">{item.description}</span></span>
                              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key={`${category}-${appearanceSection ?? 'main'}`} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}>
                      {category === 'appearance' && appearanceSection === 'mode' && (
                        <>
                          <SectionTitle>Appearance mode</SectionTitle>
                          <Segmented<ThemeMode> label="Appearance mode" value={settings.theme} onChange={(value) => update('theme', value)} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }]} />
                          <p className="mt-3 text-[10px] leading-5 text-muted-foreground">System follows your operating-system preference and updates automatically.</p>
                        </>
                      )}

                      {category === 'appearance' && appearanceSection === 'accent' && (
                        <>
                          <SectionTitle>Accent color</SectionTitle>
                          <div className="mb-4 overflow-hidden rounded-2xl border border-[rgb(var(--accent-1)/0.24)] bg-background/52 p-3" aria-label={`Live preview of ${activeAccent.label}`}>
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Live preview</p>
                                <p className="mt-1 bg-gradient-to-r from-[rgb(var(--accent-1))] via-[rgb(var(--accent-2))] to-[rgb(var(--accent-3))] bg-clip-text text-sm font-black text-transparent">Browser Gaming</p>
                              </div>
                              <span className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border/65 bg-background/70 p-2">
                                {[activeAccent.a1, activeAccent.a2, activeAccent.a3].map((tone, index) => <span key={`${tone}-${index}`} className="size-3 rounded-full border border-white/50 shadow-sm dark:border-white/15" style={{ background: `rgb(${tone})` }} />)}
                              </span>
                            </div>
                          </div>
                          <div role="radiogroup" aria-label="Accent color" className="space-y-4">
                            {ACCENT_GROUPS.map((group) => (
                              <div key={group.key}>
                                <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{group.label}</p>
                                <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                                  {group.accents.map((key) => {
                                    const accent = ACCENTS[key]
                                    const active = settings.accent === key
                                    return (
                                      <button
                                        key={key}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        aria-label={`${accent.label}: ${accent.description}`}
                                        title={accent.description}
                                        onClick={() => update('accent', key)}
                                        className={cn('gh-interactive min-h-[72px] rounded-2xl border p-2.5 text-left outline-none', active ? 'border-[rgb(var(--accent-1)/0.5)] bg-[rgb(var(--accent-1)/0.09)] shadow-sm' : 'border-border/65 bg-background/38')}
                                      >
                                        <span className="flex items-center gap-2.5">
                                          <span className="size-9 shrink-0 rounded-xl border border-white/55 shadow-sm dark:border-white/15" style={{ background: `linear-gradient(135deg,rgb(${accent.a1}),rgb(${accent.a2}),rgb(${accent.a3}))` }} />
                                          <span className="min-w-0 flex-1 text-[10px] font-semibold leading-[1.35] text-foreground [overflow-wrap:anywhere]">{accent.label}</span>
                                          {active && <Check className="size-3.5 shrink-0 text-[rgb(var(--accent-1))]" />}
                                        </span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>

                          <CustomAccentPicker />
                        </>
                      )}

                      {category === 'appearance' && appearanceSection === 'cursor' && (
                        <>
                          <SectionTitle>Cursor</SectionTitle>
                          <div role="radiogroup" aria-label="Cursor style" className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                            {CURSORS.map((cursor) => {
                              const active = settings.cursor === cursor.value
                              const disabled = settings.performance === 'battery' && cursor.value !== 'default'
                              return (
                                <button
                                  key={cursor.value}
                                  type="button"
                                  role="radio"
                                  aria-checked={active}
                                  disabled={disabled}
                                  onClick={() => update('cursor', cursor.value)}
                                  className={cn('gh-interactive flex min-h-[82px] items-center gap-2.5 rounded-2xl border p-2.5 text-left outline-none disabled:cursor-not-allowed disabled:opacity-45', active ? 'border-[rgb(var(--accent-1)/0.5)] bg-[rgb(var(--accent-1)/0.09)]' : 'border-border/65 bg-background/38')}
                                >
                                  <CursorPreview value={cursor.value} />
                                  <span className="min-w-0 flex-1"><span className="block text-[10px] font-semibold leading-4">{cursor.label}</span><span className="mt-0.5 block text-[8px] leading-3 text-muted-foreground">{disabled ? 'Default in Battery Saver' : cursor.description}</span></span>
                                  {active && <Check className="size-3.5 shrink-0 text-[rgb(var(--accent-1))]" />}
                                </button>
                              )
                            })}
                          </div>
                          <p className="mt-3 text-[10px] leading-5 text-muted-foreground">Decorative cursors are disabled automatically on touch devices, in Battery Saver, and when motion is reduced.</p>
                        </>
                      )}

                      {category === 'appearance' && appearanceSection === 'background' && (
                        <>
                          <SectionTitle>Background style</SectionTitle>
                          <div role="radiogroup" aria-label="Background style" className="grid grid-cols-1 gap-2 min-[390px]:grid-cols-2">
                            {BACKGROUND_STYLES.map((style) => {
                              const active = settings.backgroundStyle === style.key
                              return (
                                <button key={style.key} type="button" role="radio" aria-checked={active} onClick={() => update('backgroundStyle', style.key)} className={cn('gh-interactive relative min-h-[96px] rounded-2xl border p-3 text-left outline-none', active ? 'border-[rgb(var(--accent-1)/0.46)] bg-[rgb(var(--accent-1)/0.08)]' : 'border-border/65 bg-background/38')}>
                                  {active && <Check aria-hidden className="absolute right-2.5 top-2.5 z-10 size-3.5 rounded-full bg-background/80 text-[rgb(var(--accent-1))]" />}
                                  <span aria-hidden data-bg-preview={style.key} className="gh-background-preview mb-2 block h-8 rounded-xl border border-border/55" />
                                  <span className="block text-[11px] font-semibold text-foreground">{style.label}</span>
                                  <span className="mt-1 block text-[9px] leading-4 text-muted-foreground">{style.desc}</span>
                                </button>
                              )
                            })}
                          </div>
                          <button type="button" onClick={resetAppearanceSection} className="gh-interactive mt-3 inline-flex min-h-9 items-center gap-2 rounded-xl border border-border/65 px-3 text-[10px] font-semibold text-muted-foreground outline-none"><RotateCcw className="size-3.5" /> Reset This Category</button>
                        </>
                      )}

                      {category === 'appearance' && appearanceSection === 'atmosphere' && (
                        <>
                          <SectionTitle>Atmosphere</SectionTitle>
                          <div role="radiogroup" aria-label="Atmosphere" className="grid grid-cols-1 gap-2 min-[390px]:grid-cols-2">
                            {BACKGROUND_MODES.map((mode) => (
                              <button key={mode.key} type="button" role="radio" aria-checked={settings.backgroundMode === mode.key} onClick={() => update('backgroundMode', mode.key)} className={cn('gh-interactive relative rounded-2xl border p-3 text-left outline-none', settings.backgroundMode === mode.key ? 'border-[rgb(var(--accent-1)/0.42)] bg-[rgb(var(--accent-1)/0.08)]' : 'border-border/65 bg-background/38')}>
                                {settings.backgroundMode === mode.key && <Check aria-hidden className="absolute right-2.5 top-2.5 z-10 size-3.5 rounded-full bg-background/80 text-[rgb(var(--accent-1))]" />}
                                <span aria-hidden data-atmosphere-preview={mode.key} className="gh-atmosphere-preview mb-2 block h-8 rounded-xl border border-border/55" />
                                <span className="block text-[11px] font-semibold text-foreground">{mode.label}</span>
                                <span className="mt-1 block text-[9px] leading-4 text-muted-foreground">{mode.desc}</span>
                              </button>
                            ))}
                          </div>
                          <div className="mt-3"><RangeControl label="Atmosphere strength" value={settings.backgroundIntensity} min={0.18} max={0.76} step={0.05} onChange={(value) => update('backgroundIntensity', value)} /></div>
                          <button type="button" onClick={resetAppearanceSection} className="gh-interactive mt-3 inline-flex min-h-9 items-center gap-2 rounded-xl border border-border/65 px-3 text-[10px] font-semibold text-muted-foreground outline-none"><RotateCcw className="size-3.5" /> Reset This Category</button>
                        </>
                      )}

                      {category === 'appearance' && appearanceSection === 'grid' && (
                        <><SectionTitle>Background grid</SectionTitle><RangeControl label="Grid visibility" value={settings.gridVisibility} min={0} max={0.5} step={0.05} onChange={(value) => update('gridVisibility', value)} /><p className="mt-3 text-[10px] leading-5 text-muted-foreground">Safe limits prevent the grid from becoming dark or visually dominant.</p></>
                      )}

                      {category === 'appearance' && appearanceSection === 'glow' && (
                        <><SectionTitle>Glow</SectionTitle><RangeControl label="Glow intensity" value={settings.glowIntensity} min={0.15} max={0.7} step={0.05} onChange={(value) => update('glowIntensity', value)} /></>
                      )}

                      {category === 'appearance' && appearanceSection === 'density' && (
                        <><SectionTitle>Interface density</SectionTitle><Segmented<Density> label="Interface density" value={settings.density} onChange={(value) => update('density', value)} options={[{ value: 'compact', label: 'Compact' }, { value: 'cozy', label: 'Default' }, { value: 'comfortable', label: 'Roomy' }]} /></>
                      )}

                      {category === 'motion' && (
                        <>
                          <SectionTitle>Motion level</SectionTitle>
                          <Segmented<MotionMode> label="Motion level" value={settings.motionMode} onChange={setMotionMode} options={[{ value: 'full', label: 'Full' }, { value: 'reduced', label: 'Reduced' }, { value: 'off', label: 'Off' }]} />
                          <div className="mt-3 space-y-2">
                            <Toggle checked={settings.ambientMotion} onChange={(value) => update('ambientMotion', value)} label="Ambient motion" description="Slow background light movement" />
                            <Toggle checked={settings.heroObjects} onChange={(value) => update('heroObjects', value)} label="Hero objects" description="Gentle motion in the launch visual" />
                            <Toggle checked={settings.particlesEnabled} onChange={(value) => update('particlesEnabled', value)} label="Light points" description="Sparse decorative particles" />
                            <Toggle checked={settings.floatingCards} onChange={(value) => update('floatingCards', value)} label="Floating cards" description="Subtle supporting-card movement" />
                            <Toggle checked={settings.pageTransitions} onChange={(value) => update('pageTransitions', value)} label="Page transitions" description="Short fade between routes" />
                          </div>
                        </>
                      )}

                      {category === 'performance' && (
                        <>
                          <SectionTitle>Preset</SectionTitle>
                          <div className="grid gap-2">
                            {performanceOptions.map((option) => {
                              const Icon = option.icon
                              const active = settings.performance === option.value
                              return (
                                <button key={option.value} type="button" onClick={() => applyPerformance(option.value)} className={cn('gh-interactive flex items-center gap-3 rounded-2xl border p-3 text-left outline-none', active ? 'border-[rgb(var(--accent-1)/0.42)] bg-[rgb(var(--accent-1)/0.08)]' : 'border-border/65 bg-background/38')}>
                                  <span className="grid size-10 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]"><Icon className="size-4" /></span>
                                  <span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{option.label}</span><span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">{option.value === 'high' ? 'Richer decorative effects on capable devices.' : option.value === 'balanced' ? 'Recommended balance of polish and efficiency.' : 'Fewer decorative effects and a native cursor.'}</span></span>
                                  {active && <Check className="size-4 text-[rgb(var(--accent-1))]" />}
                                </button>
                              )
                            })}
                          </div>
                          <div className="mt-3 space-y-2">
                            <RangeControl label="Background movement" value={settings.backgroundIntensity} min={0.18} max={0.76} step={0.05} onChange={(value) => update('backgroundIntensity', value)} />
                            <RangeControl label="Animation density" value={settings.animationIntensity} min={0.25} max={1} step={0.05} onChange={(value) => update('animationIntensity', value)} />
                            <RangeControl label="Decorative particles" value={settings.particleDensity} min={0} max={0.62} step={0.05} onChange={(value) => update('particleDensity', value)} />
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <footer className="flex items-center justify-between gap-3 border-t border-border/65 px-4 py-3">
                <button type="button" onClick={reset} disabled={isDefault} className="gh-interactive inline-flex min-h-9 items-center gap-2 rounded-xl border border-border/65 px-3 text-[11px] font-semibold text-muted-foreground outline-none disabled:cursor-default disabled:opacity-45">
                  <RotateCcw className="size-3.5" /> Reset All
                </button>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className={cn('size-1.5 rounded-full', isDefault ? 'bg-emerald-500' : 'bg-[rgb(var(--accent-3))]')} />{isDefault ? 'Default experience' : 'Custom settings active'}</span>
              </footer>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
