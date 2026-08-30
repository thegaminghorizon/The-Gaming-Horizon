// Site-wide page zoom. Persisted to localStorage so a choice made on the
// Gateway carries through onto the main site and future visits.

export const ZOOM_STORAGE_KEY = 'gh:page-zoom'
export const RECOMMENDED_ZOOM = 80
export const ZOOM_MIN = 60
export const ZOOM_MAX = 125
export const ZOOM_PRESETS = [100, 90, 80, 75] as const

export function clampZoom(value: number): number {
  const num = Number(value)
  if (!Number.isFinite(num)) return 100
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(num)))
}

export function readStoredZoom(): number | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(ZOOM_STORAGE_KEY)
    if (!raw) return null
    const value = Number(raw)
    return Number.isFinite(value) ? clampZoom(value) : null
  } catch {
    return null
  }
}

// Applies zoom to the whole document (not just the Gateway) so the setting
// sticks after the user enters the main site.
export function applyPageZoom(value: number): number {
  const clamped = clampZoom(value)
  if (typeof document !== 'undefined') {
    // `zoom` is supported by all current major browsers (Chrome, Edge,
    // Safari, and Firefox) and, unlike a transform, keeps native scrollbars
    // and layout metrics consistent with the scaled view.
    document.documentElement.style.zoom = clamped === 100 ? '' : `${clamped}%`
    // Chromium does not apply an ancestor's `zoom` to a `position: fixed`
    // descendant's own layout (only to its paint), so any fixed, full-viewport
    // element (the Gateway itself, modals, the command palette, etc.) ends up
    // laid out against the real, un-zoomed viewport while still being painted
    // at the smaller scale — it visually shrinks into the top-left corner
    // instead of filling the screen. We expose the same value as a CSS
    // variable so `.fixed` elements can re-declare `zoom` explicitly on
    // themselves (see globals.css) instead of relying on inheritance, which
    // fixes the corner-collapse.
    document.documentElement.style.setProperty('--gh-page-zoom', String(clamped / 100))
  }
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(ZOOM_STORAGE_KEY, String(clamped))
    } catch {
      // Persistence is a convenience only.
    }
  }
  return clamped
}
