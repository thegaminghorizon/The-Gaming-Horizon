'use client'

import { useMemo, useState } from 'react'
import { Download, Check, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GhButton, Reveal, SectionHeading } from '@/components/ui/primitives'
import { GH_MARK_PATH, GH_MARK_VIEWBOX, GH_MARK_DEFAULT_STOPS } from '@/components/ui/logo'

// Preset color palettes for the downloadable mark. Each is just 3 hex
// stops — swapping the palette only ever changes a <linearGradient>'s
// <stop> colors, nothing else re-renders or re-computes, so selecting one
// is instant with no perceptible lag.
const PALETTES: { id: string; name: string; stops: readonly [string, string, string] }[] = [
  { id: 'horizon', name: 'Horizon', stops: GH_MARK_DEFAULT_STOPS },
  { id: 'inferno', name: 'Inferno', stops: ['#7A0000', '#FF4D00', '#FFC400'] },
  { id: 'toxic', name: 'Toxic', stops: ['#063D1E', '#22C55E', '#C6FF3D'] },
  { id: 'neon', name: 'Neon', stops: ['#5B00C9', '#C724E0', '#FF6AD5'] },
  { id: 'gold', name: 'Gold Rush', stops: ['#5C3A00', '#D4AF37', '#FFEBAE'] },
  { id: 'frost', name: 'Frost', stops: ['#0B3D91', '#38BDF8', '#E4F7FF'] },
  { id: 'mono', name: 'Monochrome', stops: ['#0A0A0A', '#6B7280', '#F5F5F5'] },
]

const BACKDROPS: { id: 'transparent' | 'dark' | 'light'; name: string; fill?: string }[] = [
  { id: 'transparent', name: 'Transparent' },
  { id: 'dark', name: 'Dark card', fill: '#0b0710' },
  { id: 'light', name: 'Light card', fill: '#f3f5fb' },
]

function buildSvgMarkup(stops: readonly [string, string, string]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${GH_MARK_VIEWBOX}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="100" y2="70">` +
    `<stop offset="0" stop-color="${stops[0]}"/>` +
    `<stop offset="0.5" stop-color="${stops[1]}"/>` +
    `<stop offset="1" stop-color="${stops[2]}"/>` +
    `</linearGradient></defs>` +
    `<path fill="url(#g)" d="${GH_MARK_PATH}"/></svg>`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function LogoDownload() {
  const [paletteId, setPaletteId] = useState('horizon')
  const [customStops, setCustomStops] = useState<[string, string]>(['#3D07B5', '#01E3CF'])
  const [backdrop, setBackdrop] = useState<(typeof BACKDROPS)[number]['id']>('transparent')
  const [justCopied, setJustCopied] = useState<'svg' | 'png' | null>(null)

  // The active gradient — either the chosen preset, or a 2-color custom
  // gradient (with a midpoint blended in code so it still reads as the
  // same 3-stop style as every preset). Recomputing this on every color
  // pick is a few arithmetic ops on 3 short strings — effectively free,
  // which is what keeps the live preview lag-free no matter how fast
  // someone clicks through palettes or drags the custom color pickers.
  const stops = useMemo<[string, string, string]>(() => {
    if (paletteId !== 'custom') {
      return [...PALETTES.find((p) => p.id === paletteId)!.stops] as [string, string, string]
    }
    const [from, to] = customStops
    const mid = blendHex(from, to, 0.5)
    return [from, mid, to]
  }, [paletteId, customStops])

  const svgMarkup = useMemo(() => buildSvgMarkup(stops), [stops])

  function handleDownloadSvg() {
    downloadBlob(new Blob([svgMarkup], { type: 'image/svg+xml' }), `gaming-horizon-logo-${paletteId}.svg`)
    setJustCopied('svg')
    window.setTimeout(() => setJustCopied(null), 1600)
  }

  function handleDownloadPng() {
    const size = 1024
    const height = Math.round(size * 89.1 / 100)
    const svg64 = typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(svgMarkup))) : ''
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const bg = BACKDROPS.find((b) => b.id === backdrop)
      if (bg?.fill) {
        ctx.fillStyle = bg.fill
        ctx.fillRect(0, 0, size, height)
      }
      ctx.drawImage(img, 0, 0, size, height)
      canvas.toBlob((blob) => {
        if (!blob) return
        downloadBlob(blob, `gaming-horizon-logo-${paletteId}.png`)
        setJustCopied('png')
        window.setTimeout(() => setJustCopied(null), 1600)
      }, 'image/png')
    }
    img.src = `data:image/svg+xml;base64,${svg64}`
  }

  const activeBackdrop = BACKDROPS.find((b) => b.id === backdrop)

  return (
    <section id="logo-download" className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="Brand assets"
          title="Download the Gaming Horizon logo"
          subtitle="Pick a color palette, watch the mark update instantly, then grab it as SVG or PNG — no account, no waiting."
        />

        <Reveal delay={0.1} className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* Live preview */}
          <div className="glass relative flex flex-col items-center justify-center gap-6 rounded-3xl border border-[rgb(var(--accent-1)/0.2)] p-10">
            <div
              className="gh-logo-checker relative flex size-56 items-center justify-center rounded-2xl"
              style={activeBackdrop?.fill ? { background: activeBackdrop.fill } : undefined}
            >
              <svg viewBox={GH_MARK_VIEWBOX} className="size-36" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="gh-download-grad" x1="0" y1="0" x2="100" y2="70">
                    <stop offset="0" stopColor={stops[0]} />
                    <stop offset="0.5" stopColor={stops[1]} />
                    <stop offset="1" stopColor={stops[2]} />
                  </linearGradient>
                </defs>
                <path d={GH_MARK_PATH} fill="url(#gh-download-grad)" />
              </svg>
            </div>

            {/* Backdrop toggle */}
            <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 p-1">
              {BACKDROPS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBackdrop(b.id)}
                  aria-pressed={backdrop === b.id}
                  className={cn(
                    'gh-interactive rounded-full px-3 py-1.5 text-xs font-medium outline-none',
                    backdrop === b.id ? 'bg-[rgb(var(--accent-1))] text-[var(--accent-button-fg)]' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {b.name}
                </button>
              ))}
            </div>

            <div className="flex w-full flex-col gap-2.5 sm:flex-row">
              <GhButton onClick={handleDownloadSvg} className="flex-1">
                {justCopied === 'svg' ? <Check className="size-4" /> : <Download className="size-4" />}
                {justCopied === 'svg' ? 'Downloaded' : 'Download SVG'}
              </GhButton>
              <GhButton onClick={handleDownloadPng} variant="glass" className="flex-1">
                {justCopied === 'png' ? <Check className="size-4" /> : <Download className="size-4" />}
                {justCopied === 'png' ? 'Downloaded' : 'Download PNG'}
              </GhButton>
            </div>
            <p className="text-xs text-muted-foreground">SVG is instant and scales to any size · PNG exports at 1024px</p>
          </div>

          {/* Palette picker */}
          <div className="glass rounded-3xl border border-[rgb(var(--accent-1)/0.2)] p-8">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Palette className="size-4 text-[rgb(var(--accent-1))]" /> Choose a color palette
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaletteId(p.id)}
                  aria-pressed={paletteId === p.id}
                  className={cn(
                    'gh-interactive group flex flex-col items-center gap-2 rounded-2xl border p-3 outline-none transition-colors',
                    paletteId === p.id ? 'border-[rgb(var(--accent-1)/0.6)] bg-[rgb(var(--accent-1)/0.08)]' : 'border-border/70 hover:border-[rgb(var(--accent-1)/0.35)]',
                  )}
                >
                  <span
                    className="h-9 w-full rounded-lg"
                    style={{ background: `linear-gradient(90deg, ${p.stops[0]}, ${p.stops[1]}, ${p.stops[2]})` }}
                  />
                  <span className="text-xs font-medium text-foreground">{p.name}</span>
                </button>
              ))}

              {/* Custom palette — two native color inputs. onChange just
                  writes to state; there's no debounce and nothing else to
                  compute, so dragging the OS color picker updates the
                  preview on every single frame with no lag. */}
              <button
                type="button"
                onClick={() => setPaletteId('custom')}
                aria-pressed={paletteId === 'custom'}
                className={cn(
                  'gh-interactive flex flex-col items-center gap-2 rounded-2xl border p-3 outline-none transition-colors',
                  paletteId === 'custom' ? 'border-[rgb(var(--accent-1)/0.6)] bg-[rgb(var(--accent-1)/0.08)]' : 'border-border/70 hover:border-[rgb(var(--accent-1)/0.35)]',
                )}
              >
                <span
                  className="h-9 w-full rounded-lg"
                  style={{ background: `linear-gradient(90deg, ${customStops[0]}, ${customStops[1]})` }}
                />
                <span className="text-xs font-medium text-foreground">Custom</span>
              </button>
            </div>

            {paletteId === 'custom' && (
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-border/70 bg-background/50 p-4">
                <label className="flex flex-1 items-center gap-2.5 text-xs text-muted-foreground">
                  <input
                    type="color"
                    value={customStops[0]}
                    onChange={(e) => setCustomStops(([, to]) => [e.target.value, to])}
                    aria-label="Custom gradient start color"
                    className="size-9 cursor-pointer rounded-lg border border-border/70 bg-transparent p-0.5"
                  />
                  Start
                </label>
                <label className="flex flex-1 items-center gap-2.5 text-xs text-muted-foreground">
                  <input
                    type="color"
                    value={customStops[1]}
                    onChange={(e) => setCustomStops(([from]) => [from, e.target.value])}
                    aria-label="Custom gradient end color"
                    className="size-9 cursor-pointer rounded-lg border border-border/70 bg-transparent p-0.5"
                  />
                  End
                </label>
              </div>
            )}

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Free to use for fan content, community projects, and anything about Gaming Horizon. The mark and wordmark shouldn't be altered beyond recoloring, and shouldn't be used to imply an official partnership.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function blendHex(a: string, b: string, t: number) {
  const pa = hexToRgb(a)
  const pb = hexToRgb(b)
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t)
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t)
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t)
  return rgbToHex(r, g, bl)
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const num = parseInt(clean, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}
