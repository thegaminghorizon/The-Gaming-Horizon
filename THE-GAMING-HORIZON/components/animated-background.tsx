'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import {
  useSettings,
  PERF_MULTIPLIER,
  type BackgroundMode,
} from '@/components/providers/settings-provider'

type Variant = 'default' | 'vision' | 'platform' | 'ai' | 'games' | 'dev' | 'roadmap'

type RenderMode = 'static' | 'nebula' | 'aurora' | 'mesh' | 'starfield'

const ATMOSPHERE_RENDER_MODE: Record<BackgroundMode, RenderMode> = {
  calm: 'static',
  nebula: 'nebula',
  aurora: 'aurora',
  ocean: 'mesh',
  sunset: 'mesh',
  forest: 'mesh',
  cosmic: 'starfield',
  frost: 'static',
  warmStudio: 'static',
  neutral: 'static',
}

export const ATMOSPHERE_OVERLAY: Record<BackgroundMode, string> = {
  calm: 'radial-gradient(70% 55% at 50% 0%, rgb(var(--accent-1) / 0.09), transparent 72%)',
  nebula: 'radial-gradient(65% 60% at 20% 25%, rgb(var(--accent-1) / 0.16), transparent 74%), radial-gradient(55% 55% at 82% 70%, rgb(var(--accent-2) / 0.12), transparent 72%)',
  aurora: 'linear-gradient(135deg, rgb(var(--accent-2) / 0.09), transparent 38%, rgb(var(--accent-3) / 0.10))',
  ocean: 'radial-gradient(70% 60% at 86% 20%, rgb(6 182 212 / 0.10), transparent 72%), radial-gradient(60% 60% at 10% 80%, rgb(37 99 235 / 0.075), transparent 72%)',
  sunset: 'radial-gradient(70% 60% at 82% 22%, rgb(244 63 94 / 0.08), transparent 72%), radial-gradient(65% 55% at 14% 78%, rgb(217 119 6 / 0.075), transparent 72%)',
  forest: 'radial-gradient(70% 60% at 82% 20%, rgb(16 185 129 / 0.075), transparent 72%), radial-gradient(60% 55% at 12% 78%, rgb(13 148 136 / 0.07), transparent 72%)',
  cosmic: 'radial-gradient(75% 65% at 50% 10%, rgb(var(--accent-1) / 0.10), transparent 75%)',
  frost: 'radial-gradient(75% 60% at 50% 0%, rgb(148 163 184 / 0.10), transparent 72%), radial-gradient(55% 50% at 85% 70%, rgb(14 165 233 / 0.09), transparent 72%)',
  warmStudio: 'radial-gradient(75% 65% at 18% 18%, rgb(251 191 36 / 0.09), transparent 72%), radial-gradient(55% 55% at 84% 75%, rgb(244 63 94 / 0.045), transparent 72%)',
  neutral: 'radial-gradient(72% 58% at 50% 0%, rgb(100 116 139 / 0.09), transparent 72%)',
}

// Map the current route to a background composition so each page keeps one
// visual language but feels distinct (per the design brief).
function routeToVariant(pathname: string): Variant {
  if (pathname.startsWith('/vision')) return 'vision'
  if (pathname.startsWith('/platform')) return 'platform'
  if (pathname.startsWith('/ai')) return 'ai'
  if (pathname.startsWith('/games')) return 'games'
  if (pathname.startsWith('/development')) return 'dev'
  if (pathname.startsWith('/roadmap')) return 'roadmap'
  return 'default'
}

const ORBS: Record<Variant, { top: string; left: string; a: number; size: number; depth: number }[]> = {
  default: [
    { top: '-10%', left: '10%', a: 1, size: 520, depth: 1 },
    { top: '30%', left: '75%', a: 2, size: 460, depth: 1.8 },
    { top: '75%', left: '20%', a: 3, size: 500, depth: 0.6 },
  ],
  vision: [
    { top: '5%', left: '65%', a: 1, size: 540, depth: 1.4 },
    { top: '60%', left: '10%', a: 3, size: 480, depth: 0.7 },
  ],
  platform: [
    { top: '10%', left: '20%', a: 2, size: 500, depth: 1 },
    { top: '55%', left: '70%', a: 1, size: 520, depth: 1.6 },
  ],
  ai: [
    { top: '-5%', left: '45%', a: 1, size: 600, depth: 1.2 },
    { top: '60%', left: '80%', a: 3, size: 440, depth: 0.7 },
  ],
  games: [
    { top: '15%', left: '85%', a: 3, size: 480, depth: 1.5 },
    { top: '70%', left: '15%', a: 2, size: 520, depth: 0.8 },
  ],
  dev: [
    { top: '0%', left: '30%', a: 2, size: 500, depth: 1 },
    { top: '65%', left: '65%', a: 1, size: 460, depth: 1.7 },
  ],
  roadmap: [
    { top: '10%', left: '50%', a: 1, size: 560, depth: 1.3 },
    { top: '70%', left: '25%', a: 3, size: 480, depth: 0.7 },
  ],
}

/* A parallax layer that translates by an amount proportional to its depth. */
function ParallaxLayer({
  px,
  py,
  depth,
  className,
  children,
}: {
  px: MotionValue<number>
  py: MotionValue<number>
  depth: number
  className?: string
  children: React.ReactNode
}) {
  const x = useTransform(px, (v) => v * depth)
  const y = useTransform(py, (v) => v * depth)
  return (
    <motion.div className={className} style={{ x, y }}>
      {children}
    </motion.div>
  )
}

export function AnimatedBackground({ variant }: { variant?: Variant }) {
  const { settings, resolvedTheme } = useSettings()
  const pathname = usePathname()
  const resolvedVariant: Variant = variant ?? routeToVariant(pathname)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  const atmosphere = settings.backgroundMode
  const mode: RenderMode = settings.motionMode === 'off' || !settings.ambientMotion ? 'static' : ATMOSPHERE_RENDER_MODE[atmosphere]
  const density = settings.particleDensity
  const intensity = settings.backgroundIntensity
  const reduced = settings.motionMode !== 'full'
  const theme = resolvedTheme
  const perf = PERF_MULTIPLIER[settings.performance]

  // Cursor-reactive parallax (spring-smoothed pointer offset in px).
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const px = useSpring(rawX, { stiffness: 40, damping: 20, mass: 0.6 })
  const py = useSpring(rawY, { stiffness: 40, damping: 20, mass: 0.6 })

  const decorativeBackground = !['cleanCanvas', 'minimal'].includes(settings.backgroundStyle)
  const usesCanvas = decorativeBackground && settings.particlesEnabled && (mode === 'starfield' || mode === 'nebula')

  useEffect(() => {
    // Do not attach a global pointer loop when the background is static,
    // reduced motion is enabled, or the device uses a coarse pointer.
    if (reduced || mode === 'static' || settings.performance === 'battery' || window.matchMedia('(pointer: coarse)').matches) {
      rawX.set(0)
      rawY.set(0)
      if (glowRef.current) glowRef.current.style.background = 'none'
      return
    }

    // Cache the accent color once (and refresh on theme/accent changes via the
    // effect deps) instead of calling getComputedStyle on every mouse move,
    // which forces an expensive style recalc each time.
    const accent1 = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent-1')
      .trim()

    let ticking = false
    let lastX = 0
    let lastY = 0
    const paint = () => {
      ticking = false
      rawX.set((lastX / window.innerWidth - 0.5) * 40)
      rawY.set((lastY / window.innerHeight - 0.5) * 40)
      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(600px circle at ${lastX}px ${lastY}px, rgb(${accent1} / ${0.07 * intensity}), transparent 60%)`
      }
    }
    const onMove = (e: MouseEvent) => {
      lastX = e.clientX
      lastY = e.clientY
      if (ticking) return
      ticking = true
      requestAnimationFrame(paint)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [rawX, rawY, intensity, theme, reduced, mode, settings.performance])

  useEffect(() => {
    if (!usesCanvas) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    let raf = 0
    const mouse = { x: w / 2, y: h / 2 }

    const tokens = () => {
      const s = getComputedStyle(document.documentElement)
      return {
        accents: [1, 2, 3].map((n) => s.getPropertyValue(`--accent-${n}`).trim()),
        star: s.getPropertyValue('--star').trim() || '255 255 255',
      }
    }
    let t = tokens()
    let cols = t.accents
    let starColor = t.star

    const scale = Math.min(1.4, density) * perf
    const isStarfield = mode === 'starfield'
    // Densities trimmed ~20% so decorative particles never compete with content.
    const starCount = Math.round((reduced ? 24 : isStarfield ? 128 : 72) * scale)
    const particleCount = Math.round((reduced ? 0 : isStarfield ? 14 : 22) * scale)

    // Starfield gives each star a depth for parallax; nebula keeps them flat.
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (isStarfield ? Math.random() * 1.8 + 0.7 : Math.random() * 1.3 + 0.2),
      tw: Math.random() * Math.PI * 2,
      s: Math.random() * 0.02 + 0.005,
      depth: Math.random() * 1.5 + 0.3,
      glow: isStarfield && Math.random() > 0.82,
    }))

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 2 + 0.6,
      c: Math.floor(Math.random() * 3),
    }))

    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMove)

    let frame = 0
    let lastPaint = 0
    let pageVisible = !document.hidden
    const targetFps = settings.performance === 'high' ? 60 : settings.performance === 'balanced' ? 36 : 24
    const minFrameMs = 1000 / targetFps
    const onVisibility = () => {
      pageVisible = !document.hidden
      if (pageVisible && !raf) raf = requestAnimationFrame(draw)
    }
    document.addEventListener('visibilitychange', onVisibility)

    const draw = (now = performance.now()) => {
      if (!pageVisible) {
        raf = 0
        return
      }
      if (now - lastPaint < minFrameMs) {
        raf = requestAnimationFrame(draw)
        return
      }
      lastPaint = now
      frame++
      if (frame % 120 === 0) {
        t = tokens()
        cols = t.accents
        starColor = t.star
      }
      ctx.clearRect(0, 0, w, h)

      // Parallax offset of the whole star layer toward the cursor.
      const ox = isStarfield ? (mouse.x / w - 0.5) * 30 : 0
      const oy = isStarfield ? (mouse.y / h - 0.5) * 30 : 0

      for (const st of stars) {
        st.tw += st.s
        const a = (Math.sin(st.tw) * 0.5 + 0.5) * (isStarfield ? 0.95 : 0.85)
        const sx2 = st.x + ox * st.depth
        const sy2 = st.y + oy * st.depth
        if (st.glow) {
          const g = ctx.createRadialGradient(sx2, sy2, 0, sx2, sy2, st.r * 6)
          g.addColorStop(0, `rgb(${starColor} / ${a * 0.8})`)
          g.addColorStop(1, `rgb(${starColor} / 0)`)
          ctx.beginPath()
          ctx.arc(sx2, sy2, st.r * 6, 0, Math.PI * 2)
          ctx.fillStyle = g
          ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(sx2, sy2, st.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${starColor} / ${a})`
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1

        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        // Compare squared distance to avoid a sqrt on every particle/frame.
        const distSq = dx * dx + dy * dy
        if (distSq < 130 * 130 && distSq > 0.001) {
          const dist = Math.sqrt(distSq)
          p.x += (dx / dist) * 0.6
          p.y += (dy / dist) * 0.6
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${cols[p.c]} / 0.7)`
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const ldx = p.x - q.x
          const ldy = p.y - q.y
          const lSq = ldx * ldx + ldy * ldy
          // Cheap squared-distance gate; only the rare in-range pairs pay for
          // the sqrt needed to fade the connecting line.
          if (lSq < 120 * 120) {
            const d = Math.sqrt(lSq)
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgb(${cols[0]} / ${(1 - d / 120) * 0.18})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }

    if (reduced) {
      draw()
      cancelAnimationFrame(raf)
    } else {
      draw()
    }

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(raf)
    }
  }, [usesCanvas, mode, density, reduced, theme, perf, settings.performance])

  const orbs = ORBS[resolvedVariant]
  const showOrbs = decorativeBackground && (mode === 'nebula' || mode === 'aurora' || mode === 'static' || mode === 'starfield')
  const animateOrbs = mode === 'nebula' && !reduced
  const selectedGridOpacity = settings.gridVisibility * (settings.backgroundStyle === 'fadedGrid' ? 0.42 : settings.backgroundStyle === 'softGrid' ? 0.62 : 0.72)

  return (
    <div
      className="gh-global-background pointer-events-none fixed inset-0 z-0 overflow-hidden"
      data-background={settings.backgroundStyle}
      data-atmosphere={atmosphere}
      aria-hidden
    >
      {/* Base premium gradient plus the selected safe atmosphere. Five
          overlapping radial washes (not just two corner-anchored ones) so
          there's no viewport band — especially straight across the
          vertical middle — where the background falls back to a flat,
          undifferentiated `--background` fill. That flatness is what made
          ambient decorations like the section dividers look like stray
          lines floating on blank space instead of sitting in a scene. */}
      <div
        className="gh-background-base absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px 800px at 50% -10%, rgb(var(--accent-2) / 0.08), transparent 60%), ' +
            'radial-gradient(1000px 900px at 100% 100%, rgb(var(--accent-1) / 0.06), transparent 55%), ' +
            'radial-gradient(1300px 1000px at 8% 55%, rgb(var(--accent-3) / 0.05), transparent 65%), ' +
            'radial-gradient(1300px 1000px at 92% 42%, rgb(var(--accent-1) / 0.045), transparent 65%), ' +
            'linear-gradient(180deg, rgb(var(--accent-2) / 0.025), rgb(var(--accent-1) / 0.03) 45%, rgb(var(--accent-3) / 0.025)), ' +
            'var(--background)',
        }}
      />
      <div className="gh-atmosphere-layer absolute inset-0" style={{ background: ATMOSPHERE_OVERLAY[atmosphere], opacity: `var(--atmosphere-strength, ${Math.min(1, 0.45 + intensity * 0.55)})` }} />
      <div className="gh-background-style absolute inset-0" data-style={settings.backgroundStyle} />

      {/* Aurora orbs (parallax depth toward cursor) */}
      {showOrbs &&
        orbs.map((o, i) => (
          <ParallaxLayer key={i} px={px} py={py} depth={o.depth} className="absolute inset-0">
            <div
              className={`absolute rounded-full blur-3xl ${animateOrbs ? 'animate-aurora' : ''}`}
              style={{
                top: o.top,
                left: o.left,
                width: o.size,
                height: o.size,
                background: `radial-gradient(circle, rgb(var(--accent-${o.a}) / ${0.22 * intensity}), transparent 70%)`,
                animationDelay: `${i * -6}s`,
              }}
            />
          </ParallaxLayer>
        ))}

      {/* MODE: Aurora — flowing vertical light curtains */}
      {mode === 'aurora' && (
        <div className="absolute inset-x-0 top-0 h-[100vh] overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`absolute top-[-25%] h-[150%] w-[42%] mix-blend-screen ${reduced ? '' : 'animate-aurora-curtain'}`}
              style={{
                left: `${-4 + i * 26}%`,
                background: `linear-gradient(160deg, transparent, rgb(var(--accent-${(i % 3) + 1}) / ${0.55 * intensity}), transparent)`,
                filter: 'blur(45px)',
                animationDelay: `${i * -3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* MODE: Mesh gradient — breathing multi-point color mesh */}
      {mode === 'mesh' && (
        <div
          className={`absolute inset-0 ${reduced ? '' : 'animate-mesh-breathe'}`}
          style={{
            backgroundImage: `
              radial-gradient(60% 60% at 18% 20%, rgb(var(--accent-1) / ${0.55 * intensity}), transparent 100%),
              radial-gradient(60% 60% at 85% 15%, rgb(var(--accent-2) / ${0.5 * intensity}), transparent 100%),
              radial-gradient(65% 65% at 20% 85%, rgb(var(--accent-3) / ${0.48 * intensity}), transparent 100%),
              radial-gradient(65% 65% at 82% 80%, rgb(var(--accent-1) / ${0.45 * intensity}), transparent 100%),
              radial-gradient(50% 50% at 50% 50%, rgb(var(--accent-2) / ${0.25 * intensity}), transparent 100%)`,
            filter: 'blur(10px)',
          }}
        />
      )}

      {/* Drifting depth blobs — present in nebula & starfield for atmosphere */}
      {(mode === 'nebula' || mode === 'starfield') && (
        <>
          <ParallaxLayer px={px} py={py} depth={1.5} className="absolute inset-0">
            <div
              className={`absolute -left-[10%] top-[10%] size-[42rem] rounded-full blur-[120px] ${reduced ? '' : 'animate-blob-drift'}`}
              style={{
                background: `radial-gradient(circle, rgb(var(--accent-1) / ${0.14 * intensity}), transparent 70%)`,
              }}
            />
          </ParallaxLayer>
          <ParallaxLayer px={px} py={py} depth={0.8} className="absolute inset-0">
            <div
              className={`absolute -right-[12%] bottom-[5%] size-[38rem] rounded-full blur-[120px] ${reduced ? '' : 'animate-blob-drift-slow'}`}
              style={{
                background: `radial-gradient(circle, rgb(var(--accent-3) / ${0.12 * intensity}), transparent 70%)`,
              }}
            />
          </ParallaxLayer>
        </>
      )}

      {/* Soft moving light rays */}
      {!reduced && (mode === 'nebula' || mode === 'aurora' || mode === 'starfield') && (
        <div className="absolute inset-x-0 top-0 h-[70vh] overflow-hidden">
          <div
            className="absolute -top-1/2 left-1/4 h-[160%] w-40 animate-ray"
            style={{
              background: `linear-gradient(to bottom, rgb(var(--accent-2) / ${0.1 * intensity}), transparent 75%)`,
              transform: 'rotate(18deg)',
              filter: 'blur(24px)',
            }}
          />
          <div
            className="absolute -top-1/2 right-1/3 h-[160%] w-32 animate-ray-slow"
            style={{
              background: `linear-gradient(to bottom, rgb(var(--accent-1) / ${0.08 * intensity}), transparent 75%)`,
              transform: 'rotate(-14deg)',
              filter: 'blur(28px)',
            }}
          />
        </div>
      )}

      {/* The default/faded grid remains a background detail; other styles render through gh-background-style. */}
      {settings.gridVisibility > 0 && ['defaultHorizon', 'softGrid', 'fadedGrid'].includes(settings.backgroundStyle) && (
        <div className="gh-selected-grid absolute inset-0 grid-lines mask-fade-b" data-style={settings.backgroundStyle} style={{ opacity: selectedGridOpacity }} />
      )}

      {/* Canvas: stars, particles, constellations (nebula + starfield) */}
      {usesCanvas && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />}

      {/* Mouse-follow lighting */}
      <div ref={glowRef} className="absolute inset-0" />

      {/* Fog / vignette (theme-aware) */}
      <div
        className="gh-background-vignette absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 0%, transparent 55%, rgb(var(--fog) / var(--fog-alpha)))',
        }}
      />

      {/* Noise texture — keeps the background from ever looking flat (~3%) */}
      {decorativeBackground && settings.backgroundStyle !== 'minimal' && <div
        className="absolute inset-0 opacity-[0.028] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '160px 160px',
        }}
      />}
    </div>
  )
}
