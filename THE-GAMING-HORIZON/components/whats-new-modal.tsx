'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Music4,
  Palette,
  MessageSquareHeart,
  Command,
  Download,
  Brain,
  Globe,
  Wallet,
  X,
  Sparkles,
  UserCircle,
} from 'lucide-react'
import { LogoMark } from '@/components/ui/logo'
import { PdfTemplatePicker } from '@/components/pdf-template-picker'
import { useSettings } from '@/components/providers/settings-provider'
import { WHATS_NEW_FEATURES, downloadWhatsNewPdf, type PdfTemplateId } from '@/lib/whats-new'

// Icons shown next to each catalogue entry, matched by title to the shared
// list in lib/whats-new.ts (which also backs the Notification Centre entry).
const FEATURE_ICONS: Record<string, typeof Music4> = {
  'Personalized Experience Onboarding': UserCircle,
  'Music Room': Music4,
  'Customization Studio': Palette,
  'AI Companion': Brain,
  'Design Suggestions': MessageSquareHeart,
  'Command Palette': Command,
  'Brand Kit & Logo Download': Download,
  'Multi-language interface': Globe,
  'Currency display': Wallet,
}

const FEATURES = WHATS_NEW_FEATURES.map((feature) => ({
  ...feature,
  icon: FEATURE_ICONS[feature.title] ?? Sparkles,
}))

/**
 * A "what's new" panel, opened only on request from the footer's "What's
 * New" link — it no longer opens itself automatically on someone's first
 * visit. Stays mounted across every route so that footer link works from
 * anywhere.
 */
export function WhatsNewModal({
  reopenRequest,
}: {
  reopenRequest: { id: number }
}) {
  const { settings } = useSettings()
  const reduced = settings.motionMode !== 'full'
  const [open, setOpen] = useState(false)
  const [pdfPickerOpen, setPdfPickerOpen] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Opens only when the footer's "What's New" link calls reopenWhatsNew(),
  // which bumps reopenRequest.id — there's no first-visit auto-show anymore.
  const isFirstReopenRender = useRef(true)
  useEffect(() => {
    if (isFirstReopenRender.current) {
      isFirstReopenRender.current = false
      return
    }
    triggerRef.current = document.activeElement as HTMLElement
    setOpen(true)
  }, [reopenRequest.id])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      const t = window.setTimeout(() => closeRef.current?.focus(), 0)
      return () => window.clearTimeout(t)
    }
    document.body.style.overflow = ''
    return undefined
  }, [open])

  function handleClose() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  async function handleConfirmDownload(template: PdfTemplateId) {
    if (generatingPdf) return
    setGeneratingPdf(true)
    try {
      await downloadWhatsNewPdf(template)
      setPdfPickerOpen(false)
    } finally {
      setGeneratingPdf(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[240] flex items-end justify-center p-0 sm:items-center sm:p-6 landscape:items-center landscape:p-3">
          <motion.button
            aria-label="Close what's new"
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="What's new in Gaming Horizon"
            className="glass-panel-large relative z-10 flex max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] bg-background/97 sm:max-h-[88vh] sm:rounded-[2rem] landscape:max-h-[92dvh] landscape:max-w-3xl landscape:rounded-[1.5rem]"
            initial={{ opacity: 0, y: reduced ? 0 : 40, scale: reduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.98 }}
            transition={{ duration: reduced ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border px-6 py-5 pr-16 sm:flex-nowrap sm:px-8 sm:pr-20 landscape:flex-nowrap landscape:py-3.5 landscape:pr-16">
              <div className="flex min-w-0 items-center gap-3">
                <LogoMark className="size-8 shrink-0 sm:size-9" />
                <h2 className="font-heading text-lg font-bold leading-tight text-foreground sm:text-2xl landscape:text-lg">
                  Welcome to Gaming Horizon
                </h2>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[rgb(var(--accent-1))] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent-button-fg)] shadow-[0_8px_22px_-10px_rgb(var(--accent-1)/0.85)] sm:text-xs">
                <Sparkles className="size-3.5" />
                What&apos;s new
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="gh-interactive absolute right-6 top-1/2 grid size-10 shrink-0 -translate-y-1/2 place-items-center rounded-xl text-muted-foreground outline-none hover:bg-muted hover:text-foreground sm:right-8"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 landscape:py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Here&apos;s a look at what&apos;s already live — take a moment to explore before you dive in.
              </p>
              <ul className="mt-6 space-y-5 landscape:mt-4 landscape:grid landscape:grid-cols-2 landscape:gap-x-8 landscape:gap-y-4 landscape:space-y-0">
                {FEATURES.map((f) => (
                  <li key={f.title} className="flex gap-4">
                    <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))] landscape:size-9">
                      <f.icon className="size-5 landscape:size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading text-[15px] font-semibold text-foreground">{f.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground landscape:text-[13px]">{f.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="border-t border-border px-6 py-4 sm:px-8 landscape:py-3">
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={handleClose}
                  className="gh-interactive flex h-12 flex-1 items-center justify-center rounded-xl bg-[rgb(var(--accent-1))] text-sm font-semibold text-[var(--accent-button-fg)] outline-none"
                >
                  Got it, let&apos;s go
                </button>
                <button
                  type="button"
                  onClick={() => setPdfPickerOpen(true)}
                  className="gh-interactive flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-border px-5 text-sm font-semibold text-foreground outline-none hover:bg-muted"
                >
                  <Download className="size-4" />
                  Download PDF
                </button>
              </div>
              <p className="mt-2.5 text-center text-xs text-muted-foreground">
                You can always find this again from the footer.
              </p>
            </footer>
          </motion.section>
        </div>
      )}
      <PdfTemplatePicker
        open={pdfPickerOpen}
        generating={generatingPdf}
        onClose={() => setPdfPickerOpen(false)}
        onConfirm={handleConfirmDownload}
      />
    </AnimatePresence>
  )
}
