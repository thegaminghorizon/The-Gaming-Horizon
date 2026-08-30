'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, Clock } from 'lucide-react'
import { useUI } from '@/components/providers/ui-provider'
import { GhButton } from '@/components/ui/primitives'
import { Instagram, Discord, Twitter } from '@/components/ui/brand-icons'
import { DISCORD_INVITE_URL, X_PROFILE_URL, INSTAGRAM_PROFILE_URL } from '@/lib/data'

// The platforms that are already live — shown as quick "follow us instead"
// actions whenever a not-yet-live social icon (e.g. GitHub) is clicked, so
// people always have somewhere to go while that one is on the way. Add a
// new platform here the moment it goes live and it'll show up automatically.
const ACTIVE_SOCIALS = [
  { key: 'instagram', label: 'Instagram', followLabel: 'Follow on Instagram', icon: Instagram, href: INSTAGRAM_PROFILE_URL },
  { key: 'discord', label: 'Discord', followLabel: 'Join Discord', icon: Discord, href: DISCORD_INVITE_URL },
  { key: 'x', label: 'X', followLabel: 'Follow on X', icon: Twitter, href: X_PROFILE_URL },
]

function joinNames(names: string[]) {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export function ComingSoonModal() {
  const { comingSoon, closeComingSoon, openWaitlist } = useUI()
  const isSocial = comingSoon?.isSocial ?? false
  const displayName = comingSoon?.platform ?? comingSoon?.label ?? ''

  return (
    <AnimatePresence>
      {comingSoon && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeComingSoon}
          />
          <motion.div
            className="glass-strong relative z-10 w-full max-w-sm rounded-3xl p-7 text-center"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            role="dialog"
            aria-label={`${displayName} coming soon`}
          >
            <button
              onClick={closeComingSoon}
              className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-lg hover:bg-muted"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            <div
              className="mx-auto flex size-16 items-center justify-center rounded-2xl glow-accent"
              style={{
                background:
                  'linear-gradient(135deg, rgb(var(--accent-1) / 0.25), rgb(var(--accent-3) / 0.25))',
              }}
            >
              <Clock className="size-8 text-[rgb(var(--accent-1))]" />
            </div>
            <h2 className="font-heading mt-5 text-xl font-semibold">
              {displayName}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSocial ? (
                <>
                  Gaming Horizon on {displayName} is on the way as we build toward the Public Beta. In the
                  meantime, follow along on {joinNames(ACTIVE_SOCIALS.map((s) => s.label))} for updates,
                  behind-the-scenes looks, and community news.
                </>
              ) : (
                <>
                  This is on the way. {comingSoon.label} will go live as we approach the Public Beta. Join the
                  waitlist to be notified the moment it opens.
                </>
              )}
            </p>
            <div className="mt-6 flex gap-2">
              <GhButton
                variant="glass"
                className="flex-1"
                magnetic={false}
                onClick={closeComingSoon}
              >
                Close
              </GhButton>
              {!isSocial && (
                <GhButton
                  className="flex-1"
                  magnetic={false}
                  onClick={() => {
                    closeComingSoon()
                    openWaitlist()
                  }}
                >
                  Join Waitlist
                </GhButton>
              )}
            </div>
            {isSocial && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {ACTIVE_SOCIALS.map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeComingSoon}
                    className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-[rgb(var(--accent-1)/0.35)] bg-[rgb(var(--accent-1)/0.08)] px-3.5 text-[13px] font-medium text-foreground transition-all hover:-translate-y-0.5 hover:bg-[rgb(var(--accent-1)/0.16)]"
                  >
                    <social.icon className="size-4" />
                    {social.followLabel}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
