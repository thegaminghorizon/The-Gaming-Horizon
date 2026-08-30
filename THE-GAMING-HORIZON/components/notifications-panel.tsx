'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  CheckCircle2,
  Loader2,
  Rocket,
  ShieldCheck,
  Save,
  Gamepad2,
  Mail,
  MessageCircleQuestion,
  Sparkles,
  Info,
  PartyPopper,
  Download,
  ArrowUpRight,
  X,
} from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { PdfTemplatePicker } from '@/components/pdf-template-picker'
import { cn } from '@/lib/utils'
import {
  useAuth,
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from '@/components/providers/auth-provider'
import { useNotifications } from '@/components/providers/notifications-provider'
import { useUI } from '@/components/providers/ui-provider'
import { downloadWhatsNewPdf, type PdfTemplateId } from '@/lib/whats-new'
import { getSocialPlatformByHref } from '@/lib/data'
import type { AppNotification, NotificationIcon } from '@/lib/notifications'

const TOGGLES: Array<{
  key: keyof NotificationPreferences
  label: string
  description: string
  icon: (props: { className?: string }) => ReactNode
}> = [
  {
    key: 'securityAlerts',
    label: 'Security alerts',
    description: 'Sign-in, password, and email changes on your account.',
    icon: ShieldCheck,
  },
  {
    key: 'gameRequestReplies',
    label: 'Game request replies',
    description: 'Updates when a game you requested or voted on changes status.',
    icon: Gamepad2,
  },
  {
    key: 'betaInvites',
    label: 'Beta invites',
    description: 'Early access invitations as new beta waves open up.',
    icon: Rocket,
  },
  {
    key: 'productUpdates',
    label: 'Product updates',
    description: 'Roadmap milestones and new feature announcements.',
    icon: Bell,
  },
  {
    key: 'newsletter',
    label: 'Newsletter',
    description: 'Occasional email digest of blog posts and community highlights.',
    icon: Mail,
  },
  {
    key: 'festivalWishes',
    label: 'Festival wishes',
    description: 'A quick note from us on Diwali, Independence Day, Christmas, New Year, and other major occasions.',
    icon: PartyPopper,
  },
]

const NOTICE_ICONS: Record<NotificationIcon, (props: { className?: string }) => ReactNode> = {
  success: Sparkles,
  security: ShieldCheck,
  waitlist: Rocket,
  question: MessageCircleQuestion,
  info: Info,
  celebration: PartyPopper,
  update: Sparkles,
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function NotificationDetailModal({
  notice,
  onClose,
}: {
  notice: AppNotification | null
  onClose: () => void
}) {
  const Icon = notice ? NOTICE_ICONS[notice.icon] : null
  const { openSocialConfirm } = useUI()
  const socialPlatform = notice ? getSocialPlatformByHref(notice.actionUrl) : undefined

  // Portaled straight to <body> rather than rendered in place. This panel is
  // reached from deep inside page content (Account → Notifications), which
  // sits inside app/template.tsx's route-transition wrapper — that wrapper
  // animates a `transform` on its own div, and any transformed ancestor
  // becomes the containing block for `position: fixed` descendants. Left
  // in place, this modal's "fixed inset-0" would size and stack itself
  // relative to that wrapper instead of the real viewport, letting the
  // site's fixed nav bar (z-[100], genuinely viewport-fixed) paint over
  // the top of it. Escaping to `document.body` sidesteps that entirely, the
  // same fix already used by AskQuestionModal.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {notice && Icon && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Sized to its content rather than the viewport — a short notice
              stays a compact card, a long one grows up to a cap and then
              scrolls internally. Every notification, past and future,
              renders through this one modal. Widens out in landscape
              orientation so the dialog reads more like a document than a
              cramped portrait sheet. */}
          <motion.div
            className="glass-strong relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl landscape:max-h-[80vh] landscape:max-w-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            role="dialog"
            aria-modal="true"
            aria-label={notice.title}
          >
            {/* Subject — fixed in place; only the body below scrolls. */}
            <div className="relative shrink-0 border-b border-border/70 px-6 pb-5 pt-7 sm:px-8 sm:pt-8">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:right-6"
              >
                <X className="size-5" />
              </button>
              <div className="flex items-start gap-3.5 pr-8">
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-2xl glow-accent"
                  style={{
                    background:
                      'linear-gradient(135deg, rgb(var(--accent-1) / 0.22), rgb(var(--accent-3) / 0.22))',
                  }}
                >
                  <Icon className="size-5 text-[rgb(var(--accent-1))]" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                    <span>Gaming Horizon</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="normal-case tracking-normal">{timeAgo(notice.createdAt)}</span>
                  </div>
                  <h2 className="font-heading mt-1 text-xl font-semibold leading-snug">{notice.title}</h2>
                </div>
              </div>
            </div>

            {/* Content — the only part that scrolls. */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8">
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
                {notice.body}
              </p>
              {notice.actionUrl && (
                socialPlatform ? (
                  <button
                    type="button"
                    onClick={() => openSocialConfirm(socialPlatform)}
                    className="gh-interactive mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[rgb(var(--accent-1))] px-3.5 py-2 text-sm font-semibold text-[var(--accent-button-fg)] outline-none"
                  >
                    {notice.actionLabel || 'Open link'}
                    <ArrowUpRight className="size-4" />
                  </button>
                ) : (
                  <a
                    href={notice.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gh-interactive mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[rgb(var(--accent-1))] px-3.5 py-2 text-sm font-semibold text-[var(--accent-button-fg)] outline-none"
                  >
                    {notice.actionLabel || 'Open link'}
                    <ArrowUpRight className="size-4" />
                  </a>
                )
              )}
            </div>

            <div className="flex shrink-0 justify-end border-t border-border/70 px-6 py-5 sm:px-8">
              <GhButton type="button" magnetic={false} onClick={onClose}>
                Close
              </GhButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function NotificationsPanel() {
  const { notificationPreferences, saveNotificationPreferences } = useAuth()
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications()
  const { reopenWhatsNew, openSocialConfirm } = useUI()
  const [prefs, setPrefs] = useState<NotificationPreferences>(notificationPreferences)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openNotice, setOpenNotice] = useState<AppNotification | null>(null)
  const [pdfPickerNoticeId, setPdfPickerNoticeId] = useState<string | null>(null)
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null)

  async function handleConfirmDownload(id: string, template: PdfTemplateId) {
    if (generatingPdfId) return
    setGeneratingPdfId(id)
    try {
      await downloadWhatsNewPdf(template)
      setPdfPickerNoticeId(null)
    } finally {
      setGeneratingPdfId(null)
    }
  }

  function openNotification(notice: AppNotification) {
    setOpenNotice(notice)
    if (!notice.read) markRead(notice.id)
  }

  function toggle(key: keyof NotificationPreferences) {
    setPrefs((current) => ({ ...current, [key]: !current[key] }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const result = await saveNotificationPreferences(prefs)
    setSaving(false)
    if (!result.ok) {
      setError(result.error || 'Unable to save your notification preferences right now.')
      return
    }
    setSaved(true)
    window.setTimeout(() => setSaved(false), 3500)
  }

  const isDefault = JSON.stringify(prefs) === JSON.stringify(DEFAULT_NOTIFICATION_PREFERENCES)

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-border bg-muted/10 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[rgb(var(--accent-1))] text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </span>
            <div>
              <h2 className="font-heading text-xl font-semibold">Recent notifications</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Account activity and updates land here.
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="shrink-0 text-xs font-medium text-[rgb(var(--accent-1))] hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="mt-5 grid gap-3">
          {notifications.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/45 px-4 py-3.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
              <div>
                <p className="text-sm font-medium">This is your notification centre</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Security alerts, waitlist confirmations, and question submissions will show up here as they happen.
                </p>
              </div>
            </div>
          ) : (
            notifications.map((notice) => {
              const Icon = NOTICE_ICONS[notice.icon]
              const isUpdate = notice.icon === 'update'
              const socialPlatform = getSocialPlatformByHref(notice.actionUrl)
              return (
                <div
                  key={notice.id}
                  className={cn(
                    'w-full rounded-xl border text-left transition-colors',
                    isUpdate
                      ? 'border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.06)]'
                      : 'border-border/70 bg-background/45 hover:border-[rgb(var(--accent-1)/0.4)] hover:bg-background/70',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openNotification(notice)}
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid shrink-0 place-items-center rounded-lg',
                        isUpdate ? 'size-8 bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]' : 'size-4',
                      )}
                    >
                      <Icon className={isUpdate ? 'size-4' : 'size-4 text-[rgb(var(--accent-1))]'} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn('text-sm font-medium', isUpdate && 'font-semibold')}>{notice.title}</p>
                        {!notice.read && (
                          <span className="size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent-1))]" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {notice.body}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                        {timeAgo(notice.createdAt)}
                      </p>
                    </div>
                  </button>
                  {isUpdate && (
                    <div className="flex flex-wrap gap-2 border-t border-[rgb(var(--accent-1)/0.15)] px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (!notice.read) markRead(notice.id)
                          reopenWhatsNew()
                        }}
                        className="gh-interactive flex items-center gap-1.5 rounded-lg bg-[rgb(var(--accent-1))] px-3 py-1.5 text-xs font-semibold text-[var(--accent-button-fg)] outline-none"
                      >
                        <Sparkles className="size-3.5" />
                        View full update
                      </button>
                      <button
                        type="button"
                        onClick={() => setPdfPickerNoticeId(notice.id)}
                        className="gh-interactive flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground outline-none hover:bg-muted"
                      >
                        <Download className="size-3.5" />
                        Download PDF
                      </button>
                    </div>
                  )}
                  {!isUpdate && notice.actionUrl && (
                    <div className="border-t border-border/60 px-4 py-2.5">
                      {socialPlatform ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!notice.read) markRead(notice.id)
                            openSocialConfirm(socialPlatform)
                          }}
                          className="gh-interactive inline-flex items-center gap-1.5 rounded-lg bg-[rgb(var(--accent-1))] px-3 py-1.5 text-xs font-semibold text-[var(--accent-button-fg)] outline-none"
                        >
                          {notice.actionLabel || 'Open link'}
                          <ArrowUpRight className="size-3.5" />
                        </button>
                      ) : (
                        <a
                          href={notice.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            if (!notice.read) markRead(notice.id)
                          }}
                          className="gh-interactive inline-flex items-center gap-1.5 rounded-lg bg-[rgb(var(--accent-1))] px-3 py-1.5 text-xs font-semibold text-[var(--accent-button-fg)] outline-none"
                        >
                          {notice.actionLabel || 'Open link'}
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-muted/10 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-semibold">Notification preferences</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Choose what Gaming Horizon can email you about. Security alerts help keep your account safe.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          {TOGGLES.map(({ key, label, description, icon: Icon }) => (
            <label
              key={key}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background/40 px-4 py-3.5 text-sm"
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
              </span>
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={() => toggle(key)}
                className="mt-0.5 size-4 shrink-0 accent-[rgb(var(--accent-1))]"
              />
            </label>
          ))}
        </div>

        {isDefault && (
          <p className="mt-3 text-[11px] text-muted-foreground">These are the default preferences for a new account.</p>
        )}

        {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
        {saved && (
          <p role="status" className="mt-4 flex items-center gap-2 text-sm text-emerald-500">
            <CheckCircle2 className="size-4" />
            Notification preferences saved.
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <GhButton type="button" magnetic={false} disabled={saving} onClick={() => void handleSave()}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? 'Saving…' : 'Save preferences'}
          </GhButton>
        </div>
      </section>

      <NotificationDetailModal notice={openNotice} onClose={() => setOpenNotice(null)} />
      <PdfTemplatePicker
        open={pdfPickerNoticeId !== null}
        generating={generatingPdfId !== null}
        onClose={() => setPdfPickerNoticeId(null)}
        onConfirm={(template) => {
          if (pdfPickerNoticeId) void handleConfirmDownload(pdfPickerNoticeId, template)
        }}
      />
    </div>
  )
}
