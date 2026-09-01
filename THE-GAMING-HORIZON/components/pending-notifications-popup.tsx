'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Bell, X } from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'

/**
 * A one-shot "you have unread notifications" popup, shown when someone
 * opens the site (or signs in) and already has unread items sitting in
 * their Notification Centre. Distinct from the toast stack in
 * NotificationsProvider, which fires for things that just happened —
 * this is for things that happened *before* this visit and are still
 * waiting to be seen.
 */
export function PendingNotificationsPopup({
  open,
  unreadCount,
  onClose,
}: {
  open: boolean
  unreadCount: number
  onClose: () => void
}) {
  const router = useRouter()

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="glass-strong relative z-10 w-full max-w-sm rounded-3xl p-7 text-center"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            role="dialog"
            aria-modal="true"
            aria-label="Unread notifications"
          >
            <button
              onClick={onClose}
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
              <Bell className="size-8 text-[rgb(var(--accent-1))]" />
            </div>
            <h2 className="font-heading mt-5 text-xl font-semibold">
              You have unread notifications
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {unreadCount === 1
                ? "There's 1 update waiting in your Notification Centre."
                : `There are ${unreadCount} updates waiting in your Notification Centre.`}
            </p>
            <div className="mt-6 flex gap-2">
              <GhButton variant="glass" className="flex-1" magnetic={false} onClick={onClose}>
                Dismiss
              </GhButton>
              <GhButton
                className="flex-1"
                magnetic={false}
                onClick={() => {
                  onClose()
                  router.push('/account?tab=notifications')
                }}
              >
                View notifications
              </GhButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
