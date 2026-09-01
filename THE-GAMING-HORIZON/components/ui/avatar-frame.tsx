import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type AvatarAnimation = 'none' | 'pulse' | 'ring' | 'sparkle' | 'bounce'

export const AVATAR_ANIMATIONS: { value: AvatarAnimation; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'pulse', label: 'Pulse glow' },
  { value: 'ring', label: 'Spin ring' },
  { value: 'sparkle', label: 'Sparkle' },
  { value: 'bounce', label: 'Bounce' },
]

export function isAvatarAnimation(value: unknown): value is AvatarAnimation {
  return typeof value === 'string' && AVATAR_ANIMATIONS.some((a) => a.value === value)
}

interface AvatarFrameProps {
  animation?: AvatarAnimation
  rounded?: string
  className?: string
  children: ReactNode
}

// Wraps an existing avatar element (image or initials bubble) with an
// optional decorative animated frame. Deliberately does not touch the
// avatar's own markup/overflow so the frame never clips the image inside —
// the ring/sparkle layers sit in this wrapper's own box, outside the child.
export function AvatarFrame({ animation = 'none', rounded = 'rounded-2xl', className, children }: AvatarFrameProps) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0',
        rounded,
        animation === 'ring' && 'gh-avatar-ring',
        animation === 'pulse' && 'gh-avatar-pulse',
        animation === 'bounce' && 'gh-avatar-bounce',
        className,
      )}
    >
      {children}
      {animation === 'sparkle' && (
        <>
          <span
            className="gh-avatar-sparkle-dot pointer-events-none absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[rgb(var(--accent-3))]"
            style={{ animationDelay: '0s' }}
            aria-hidden
          />
          <span
            className="gh-avatar-sparkle-dot pointer-events-none absolute -bottom-0.5 -left-0.5 size-1.5 rounded-full bg-[rgb(var(--accent-1))]"
            style={{ animationDelay: '.6s' }}
            aria-hidden
          />
          <span
            className="gh-avatar-sparkle-dot pointer-events-none absolute -right-1 bottom-0 size-1 rounded-full bg-[rgb(var(--accent-2))]"
            style={{ animationDelay: '1.1s' }}
            aria-hidden
          />
        </>
      )}
    </span>
  )
}
