import { LAUNCH_DATE } from '@/lib/data'

/**
 * Transparent development progress model.
 *
 * - `verified` values in `lib/data.ts` remain the source of truth.
 * - the schedule layer advances in small daily steps so returning visitors can
 *   see movement between releases.
 * - manual overrides always win, which lets the team reflect work completed
 *   ahead of schedule.
 * - every value reaches exactly 100% on the official launch date.
 */
export const PROGRESS_BASELINE_DATE = '2026-07-08T00:00:00+05:30'
export const ROADMAP_START_DATE = '2026-09-01T00:00:00+05:30'

export function scheduledProgress(
  verified: number,
  manualOverride?: number,
  now = new Date(),
  launch = new Date(LAUNCH_DATE),
) {
  const start = new Date(PROGRESS_BASELINE_DATE).getTime()
  const end = launch.getTime()
  const current = Math.min(Math.max(now.getTime(), start), end)
  const floor = Math.max(verified, manualOverride ?? verified)

  if (current >= end) return 100

  const totalDays = Math.max(1, Math.floor((end - start) / 86_400_000))
  const elapsedDays = Math.max(0, Math.floor((current - start) / 86_400_000))
  const ratio = elapsedDays / totalDays
  const eased = 1 - Math.pow(1 - ratio, 1.12)
  const scheduled = Math.floor(floor + (100 - floor) * eased)

  return Math.min(99, Math.max(floor, scheduled))
}

// Backwards-compatible name used by existing components.
export const projectedProgress = scheduledProgress

export function roadmapCompletion(now = new Date(), launch = new Date(LAUNCH_DATE)) {
  const start = new Date(ROADMAP_START_DATE).getTime()
  const end = launch.getTime()
  const current = Math.min(Math.max(now.getTime(), start), end)
  if (current >= end) return 100
  return Math.max(0, Math.min(99, Math.floor(((current - start) / Math.max(1, end - start)) * 100)))
}
