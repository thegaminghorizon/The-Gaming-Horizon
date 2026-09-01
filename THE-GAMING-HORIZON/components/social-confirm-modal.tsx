'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import { useUI } from '@/components/providers/ui-provider'
import { GhButton } from '@/components/ui/primitives'
import { Discord, GitBranch, Instagram, Twitter } from '@/components/ui/brand-icons'

const PLATFORM_ICONS: Record<string, typeof Discord> = {
  discord: Discord,
  x: Twitter,
  instagram: Instagram,
  github: GitBranch,
}

/**
 * Shown whenever someone clicks a link to one of Gaming Horizon's real
 * social platforms (see SOCIAL_PLATFORMS / getSocialPlatformByHref in
 * lib/data.ts) — the footer icons, a notification action, or anywhere else
 * one of those links appears. Explains what's on the platform and lets
 * them cancel or continue, instead of navigating straight out.
 */
export function SocialConfirmModal() {
  const { socialConfirm, closeSocialConfirm } = useUI()
  const Icon = socialConfirm ? PLATFORM_ICONS[socialConfirm.key] ?? ArrowUpRight : ArrowUpRight

  return (
    <AnimatePresence>
      {socialConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSocialConfirm}
          />
          <motion.div
            className="glass-strong relative z-10 w-full max-w-sm rounded-3xl p-7 text-center"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Gaming Horizon on ${socialConfirm.label}`}
          >
            <button
              onClick={closeSocialConfirm}
              className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-lg hover:bg-muted"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            <div
              className="mx-auto flex size-16 items-center justify-center rounded-2xl glow-accent"
              style={{
                background: 'linear-gradient(135deg, rgb(var(--accent-1) / 0.25), rgb(var(--accent-3) / 0.25))',
              }}
            >
              <Icon className="size-8 text-[rgb(var(--accent-1))]" />
            </div>
            <h2 className="font-heading mt-5 text-xl font-semibold">Gaming Horizon on {socialConfirm.label}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{socialConfirm.description}</p>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70">
              <ArrowUpRight className="size-3.5" /> Opens {socialConfirm.label} in a new tab
            </p>
            <div className="mt-6 flex gap-2">
              <GhButton variant="glass" className="flex-1" magnetic={false} onClick={closeSocialConfirm}>
                Cancel
              </GhButton>
              <GhButton
                className="flex-1"
                magnetic={false}
                onClick={() => {
                  window.open(socialConfirm.href, '_blank', 'noopener,noreferrer')
                  closeSocialConfirm()
                }}
              >
                {socialConfirm.joinLabel}
              </GhButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
