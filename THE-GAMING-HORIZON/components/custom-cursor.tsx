'use client'

import { useEffect, useRef, useState } from 'react'
import { useSettings } from '@/components/providers/settings-provider'

const NATIVE_CURSORS = new Set([
  'text',
  'vertical-text',
  'grab',
  'grabbing',
  'col-resize',
  'row-resize',
  'n-resize',
  'e-resize',
  's-resize',
  'w-resize',
  'ne-resize',
  'nw-resize',
  'se-resize',
  'sw-resize',
  'ew-resize',
  'ns-resize',
  'nesw-resize',
  'nwse-resize',
])

export function CustomCursor() {
  const { settings, ready } = useSettings()
  const primaryRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  const [pressed, setPressed] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [finePointer, setFinePointer] = useState(false)
  const trail = useRef<{ x: number; y: number; id: number }[]>([])
  const [, redrawTrail] = useState(0)
  const idRef = useRef(0)

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setFinePointer(media.matches)
    sync()
    media.addEventListener?.('change', sync)
    return () => media.removeEventListener?.('change', sync)
  }, [])

  const style = settings.cursor
  const active = ready && finePointer && style !== 'default' && settings.motionMode === 'full' && settings.performance !== 'battery'

  useEffect(() => {
    if (!active) return
    let raf = 0
    const pos = { x: -100, y: -100 }
    const follower = { x: -100, y: -100 }
    let hoverState = false

    let lastTarget: HTMLElement | null = null

    const onMove = (event: MouseEvent) => {
      pos.x = event.clientX
      pos.y = event.clientY
      lastTarget = event.target as HTMLElement
      if (style === 'cometTrail') {
        trail.current.push({ x: event.clientX, y: event.clientY, id: idRef.current++ })
        if (trail.current.length > 8) trail.current.shift()
      }
    }
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)

    const loop = () => {
      follower.x += (pos.x - follower.x) * 0.2
      follower.y += (pos.y - follower.y) * 0.2
      if (primaryRef.current) primaryRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      if (followerRef.current) followerRef.current.style.transform = `translate3d(${follower.x}px, ${follower.y}px, 0)`

      // getComputedStyle forces a synchronous style recalc, so it only runs
      // once per animation frame (on whatever element the pointer was last
      // over) instead of on every mousemove event.
      if (lastTarget) {
        const target = lastTarget
        const forcedNative = !!target.closest('input,textarea,select,option,[contenteditable="true"],[data-native-cursor="true"],[draggable="true"]')
        const computedCursor = window.getComputedStyle(target).cursor
        const native = forcedNative || NATIVE_CURSORS.has(computedCursor) || computedCursor.includes('resize')
        document.documentElement.setAttribute('data-cursor-native', String(native))
        const next = !!target.closest('a,button,[role="button"],[role="tab"],[role="radio"],[role="switch"],[data-hover]')
        if (next !== hoverState) {
          hoverState = next
          setHovering(next)
        }
      }

      if (style === 'cometTrail') redrawTrail((value) => (value + 1) % 100000)
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    raf = requestAnimationFrame(loop)
    return () => {
      document.documentElement.removeAttribute('data-cursor-native')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(raf)
      trail.current = []
    }
  }, [active, style])

  if (!active) return null

  const scale = (pressed ? 0.78 : 1) * (hovering ? 1.32 : 1)

  return (
    <div className="cursor-layer pointer-events-none fixed inset-0 z-[2147483646] isolate" aria-hidden>
      {style === 'cometTrail' && trail.current.map((point, index) => (
        <span
          key={point.id}
          className="fixed size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: point.x,
            top: point.y,
            opacity: ((index + 1) / trail.current.length) * 0.5,
            background: `rgb(var(--accent-${(index % 3) + 1}))`,
          }}
        />
      ))}

      <div ref={primaryRef} className="fixed left-0 top-0">
        {style === 'horizonDot' && <span className="block size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--accent-1))] shadow-[0_0_12px_rgb(var(--accent-1)/0.65)]" style={{ scale }} />}
        {style === 'minimalArrow' && <span className="block h-5 w-4 -translate-x-1 -translate-y-1 -rotate-[18deg] rounded-sm border-l-2 border-t-2 border-[rgb(var(--accent-1))] drop-shadow-sm" style={{ scale }} />}
        {style === 'pixelPointer' && <span className="block size-5 -translate-x-0.5 -translate-y-0.5 bg-[rgb(var(--accent-1))] drop-shadow-sm [clip-path:polygon(0_0,0_100%,32%_72%,54%_100%,72%_88%,51%_61%,100%_58%)]" style={{ scale }} />}
        {style === 'spark' && <span className="block size-5 -translate-x-1/2 -translate-y-1/2 bg-[rgb(var(--accent-1))] shadow-[0_0_10px_rgb(var(--accent-1)/0.5)] [clip-path:polygon(50%_0,61%_38%,100%_50%,61%_62%,50%_100%,39%_62%,0_50%,39%_38%)]" style={{ scale }} />}
        {style === 'gamepad' && (
          <span className="relative block h-4 w-6 -translate-x-1/2 -translate-y-1/2 rounded-[7px] border-2 border-[rgb(var(--accent-1))] bg-background shadow-[0_0_9px_rgb(var(--accent-1)/0.35)]" style={{ scale }}>
            <span className="absolute left-1 top-1/2 h-1 w-2 -translate-y-1/2 bg-[rgb(var(--accent-1))] before:absolute before:left-1/2 before:top-[-2px] before:h-2 before:w-1 before:-translate-x-1/2 before:bg-[rgb(var(--accent-1))]" />
            <span className="absolute right-1 top-1 size-1 rounded-full bg-[rgb(var(--accent-2))]" />
          </span>
        )}
        {style === 'crosshair' && (
          <span className="relative block size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgb(var(--accent-1)/0.8)]" style={{ scale }}>
            <span className="absolute left-1/2 top-[-4px] h-[30px] w-px -translate-x-1/2 bg-[rgb(var(--accent-1)/0.65)]" />
            <span className="absolute left-[-4px] top-1/2 h-px w-[30px] -translate-y-1/2 bg-[rgb(var(--accent-1)/0.65)]" />
          </span>
        )}
        {style === 'retroArcade' && <span className="block size-5 -translate-x-0.5 -translate-y-0.5 bg-[rgb(var(--accent-1))] [clip-path:polygon(0_0,60%_0,60%_20%,80%_20%,80%_40%,100%_40%,100%_60%,80%_60%,80%_80%,60%_80%,60%_100%,40%_100%,40%_70%,20%_70%,20%_50%,0_50%)]" style={{ scale }} />}
        {(style === 'neonRing' || style === 'orbital' || style === 'cometTrail' || style === 'softGlow') && <span className="block size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--accent-1))]" />}
      </div>

      <div ref={followerRef} className="fixed left-0 top-0">
        {style === 'neonRing' && <span className="block size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgb(var(--accent-1)/0.8)] shadow-[0_0_12px_rgb(var(--accent-1)/0.35)] transition-transform duration-150" style={{ scale }} />}
        {style === 'orbital' && (
          <span className="relative block size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgb(var(--accent-1)/0.55)] transition-transform duration-150" style={{ scale }}>
            <span className="absolute -right-1 top-1/2 size-2 -translate-y-1/2 rounded-full bg-[rgb(var(--accent-3))] shadow-[0_0_8px_rgb(var(--accent-3)/0.55)]" />
          </span>
        )}
        {style === 'softGlow' && <span className="block size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--accent-1)/0.28),transparent_68%)] transition-transform duration-150" style={{ scale }} />}
      </div>
    </div>
  )
}
