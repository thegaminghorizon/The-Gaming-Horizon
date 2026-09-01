'use client'

import { useEffect, useRef } from 'react'
import type { GatewayCursorStyle } from '@/components/providers/gateway-settings-provider'

interface GatewayCustomCursorProps {
  cursor: GatewayCursorStyle
  enabled: boolean
}

const NATIVE_CURSOR_SELECTOR = [
  'input',
  'textarea',
  'select',
  'option',
  '[contenteditable="true"]',
  '[data-native-cursor="true"]',
  '[draggable="true"]',
  '[role="slider"]',
].join(',')

const INTERACTIVE_SELECTOR = 'a,button,[role="button"],[role="tab"],label'
const SCROLL_SURFACE_SELECTOR = '.gh-gateway-scroll,.gh-gateway-preferences-scroll,[data-gateway-scroll-surface="true"]'

export function GatewayCustomCursor({ cursor, enabled }: GatewayCustomCursorProps) {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    const root = layer?.closest<HTMLElement>('.gh-entry-gateway')
    if (!layer || !root) return

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const forcedColors = window.matchMedia('(forced-colors: active)')
    let active = false

    const updateAvailability = () => {
      active = enabled && cursor !== 'default' && finePointer.matches && !forcedColors.matches
      root.dataset.gatewayCursorActive = String(active)
      root.dataset.gatewayCursor = active ? cursor : 'default'
      layer.dataset.visible = 'false'
    }

    const setPosition = (event: PointerEvent) => {
      if (!active || event.pointerType === 'touch') {
        layer.dataset.visible = 'false'
        return
      }

      const target = event.target instanceof Element ? event.target : null
      const insideGateway = Boolean(target && root.contains(target))
      if (!insideGateway) {
        layer.dataset.visible = 'false'
        return
      }

      const nativeTarget = Boolean(target?.closest(NATIVE_CURSOR_SELECTOR))
      const nativeScrollSurface = Boolean(target?.matches(SCROLL_SURFACE_SELECTOR))
      layer.dataset.visible = String(!nativeTarget && !nativeScrollSurface)
      layer.dataset.interactive = String(Boolean(target?.closest(INTERACTIVE_SELECTOR)))
      layer.style.setProperty('--gateway-cursor-x', `${event.clientX}px`)
      layer.style.setProperty('--gateway-cursor-y', `${event.clientY}px`)
    }

    const press = () => { if (active) layer.dataset.pressed = 'true' }
    const release = () => { layer.dataset.pressed = 'false' }
    const hide = () => { layer.dataset.visible = 'false' }

    updateAvailability()
    root.addEventListener('pointermove', setPosition, { passive: true })
    root.addEventListener('pointerdown', press, { passive: true })
    root.addEventListener('pointerup', release, { passive: true })
    root.addEventListener('pointercancel', release, { passive: true })
    root.addEventListener('pointerleave', hide, { passive: true })
    window.addEventListener('blur', hide)
    finePointer.addEventListener?.('change', updateAvailability)
    forcedColors.addEventListener?.('change', updateAvailability)

    return () => {
      root.removeEventListener('pointermove', setPosition)
      root.removeEventListener('pointerdown', press)
      root.removeEventListener('pointerup', release)
      root.removeEventListener('pointercancel', release)
      root.removeEventListener('pointerleave', hide)
      window.removeEventListener('blur', hide)
      finePointer.removeEventListener?.('change', updateAvailability)
      forcedColors.removeEventListener?.('change', updateAvailability)
      delete root.dataset.gatewayCursorActive
      delete root.dataset.gatewayCursor
    }
  }, [cursor, enabled])

  return (
    <div
      ref={layerRef}
      className="gh-gateway-cursor-layer"
      data-cursor={cursor}
      data-visible="false"
      data-interactive="false"
      data-pressed="false"
      aria-hidden="true"
    >
      <span className="gh-gateway-cursor-trail gh-gateway-cursor-trail-3" />
      <span className="gh-gateway-cursor-trail gh-gateway-cursor-trail-2" />
      <span className="gh-gateway-cursor-trail gh-gateway-cursor-trail-1" />
      <span className="gh-gateway-cursor-visual">
        <span className="gh-gateway-cursor-dot" />
        <span className="gh-gateway-cursor-ring" />
        <span className="gh-gateway-cursor-orbit" />
        <span className="gh-gateway-cursor-arrow" />
        <span className="gh-gateway-cursor-pixel" />
      </span>
    </div>
  )
}
