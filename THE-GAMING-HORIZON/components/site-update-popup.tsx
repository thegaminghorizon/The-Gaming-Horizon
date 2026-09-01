'use client'

import { useEffect, useRef, useState, type ComponentType } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Activity,
  ChevronDown,
  CreditCard,
  HeartHandshake,
  LayoutDashboard,
  Link2,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { LogoMark } from '@/components/ui/logo'
import { useSettings } from '@/components/providers/settings-provider'
import { useUI } from '@/components/providers/ui-provider'

// Bump this whenever the highlighted line-up below changes enough that it's
// worth re-announcing to people who already dismissed an earlier version —
// each version gets its own storage key, so a bump makes the popup show
// once more without touching anyone else's other dismissed state.
const UPDATE_POPUP_VERSION = 'aug-2026-01'
const STORAGE_KEY = `gh:update-popup-seen:${UPDATE_POPUP_VERSION}`

interface UpdateHighlight {
  title: string
  dateLabel: string
  body: string
  icon: ComponentType<{ className?: string }>
}

const HIGHLIGHTS: UpdateHighlight[] = [
  {
    title: 'Festival Wishes & Library',
    dateLabel: 'Aug 15 → 28',
    icon: PartyPopper,
    body: "A full-screen festival popup greets you on the day, a matching wish lands in your notifications, and once the day ends it graduates into a permanent archive in the footer.",
  },
  {
    title: 'Redesigned Homepage Hero',
    dateLabel: 'Aug 19',
    icon: LayoutDashboard,
    body: 'The homepage now opens with an interactive four-pillar showcase, with live countdowns to Public Beta and Official Launch built right in.',
  },
  {
    title: 'Live Development Status',
    dateLabel: 'Aug 19',
    icon: Activity,
    body: "A new footer strip shows exactly where the platform stands right now, updated automatically — no more hunting through the roadmap for a number.",
  },
  {
    title: 'Avatar Studio: Frames & Custom Designer',
    dateLabel: 'Aug 23 → 29',
    icon: Wand2,
    body: 'Upload a photo, snap one with your camera, or design an avatar from scratch — then pair it with one of the new animated avatar frames.',
  },
  {
    title: 'Dedicated Support Us Page',
    dateLabel: 'Aug 29',
    icon: HeartHandshake,
    body: 'Supporting Gaming Horizon now has its own full page: a live tier explorer, a transparent breakdown of where funds go, and a Founding Supporters goal.',
  },
  {
    title: 'Connected Apps',
    dateLabel: 'Aug 30',
    icon: Link2,
    body: "See every third-party app connected to your account through the new OAuth sign-in, exactly what each one can access, and revoke it anytime.",
  },
  {
    title: 'Social Link Safety Check',
    dateLabel: 'Aug 30',
    icon: ShieldCheck,
    body: "A quick popup describing what's on the other side before you're taken off-site to Discord, X, or Instagram.",
  },
  {
    title: 'Horizon Pay Checkout & Payment History',
    dateLabel: 'Aug 31',
    icon: CreditCard,
    body: 'A streamlined UPI checkout with a live-verified status screen, plus a full history of every contribution and receipt you\u2019ve made.',
  },
]

/**
 * A one-time "here's what just shipped" splash. Shows automatically the
 * first time someone lands on the site after this update, once past the
 * entry Gateway so it never competes with that animation. Choosing
 * "Continue to Website" is the only thing that permanently dismisses it
 * (via localStorage) — it will not show again on later visits or reloads
 * after that. Bump UPDATE_POPUP_VERSION above to re-announce a future
 * update to everyone, including people who already continued past this one.
 */
export function SiteUpdatePopup() {
  const { settings } = useSettings()
  const { gatewayActive, reopenWhatsNew } = useUI()
  const reduced = settings.motionMode !== 'full'
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const triggeredRef = useRef(false)

  useEffect(() => {
    if (gatewayActive || triggeredRef.current) return
    triggeredRef.current = true

    try {
      if (window.localStorage.getItem(STORAGE_KEY)) return
    } catch {
      // If storage isn't available, fall through and just show it once
      // this session — worst case it can show again next visit.
    }

    // A short beat after the Gateway clears so the main site gets a moment
    // to settle in before this takes over.
    const t = window.setTimeout(() => setOpen(true), 600)
    return () => window.clearTimeout(t)
  }, [gatewayActive])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
    return undefined
  }, [open])

  // Shared by both footer actions — either way, the person has seen this
  // announcement, so it's marked dismissed for good either way.
  function markSeen() {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Best-effort — worst case it shows again next visit.
    }
  }

  function handleContinue() {
    setOpen(false)
    markSeen()
  }

  // Opens the full, ongoing "What's New" catalogue (all features, plus a
  // PDF download) via the same footer link uses elsewhere on the site —
  // this splash just gives quick access to it up front too.
  function handleSeeWhatsNew() {
    setOpen(false)
    markSeen()
    reopenWhatsNew()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[2147483004] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Gaming Horizon has been updated"
            className="glass-panel relative z-10 flex max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] bg-background/95 shadow-2xl sm:max-h-[90vh] sm:rounded-[2rem]"
            initial={{ opacity: 0, y: reduced ? 0 : 40, scale: reduced ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.97 }}
            transition={{ duration: reduced ? 0.12 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="border-b border-border px-6 py-6 sm:px-8">
              <div className="flex items-center gap-3">
                <LogoMark className="size-9 shrink-0" />
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(var(--accent-1))] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent-button-fg)]">
                    <Sparkles className="size-3" />
                    Site updated
                  </span>
                  <h2 className="mt-2 font-heading text-xl font-bold leading-tight text-foreground sm:text-2xl">
                    Gaming Horizon just shipped a big update
                  </h2>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Here&apos;s everything that landed between Aug 15 and Aug 31 — tap a highlight below for details, then continue whenever you&apos;re ready.
              </p>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8">
              <ul className="space-y-3">
                {HIGHLIGHTS.map((h) => {
                  const isOpen = expanded === h.title
                  return (
                    <li key={h.title}>
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : h.title)}
                        aria-expanded={isOpen}
                        className="glass gh-interactive flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left outline-none"
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]">
                          <h.icon className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-heading text-[15px] font-semibold text-foreground">
                              {h.title}
                            </span>
                            <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              {h.dateLabel}
                            </span>
                          </span>
                        </span>
                        <ChevronDown
                          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: reduced ? 0.1 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 pb-1 pt-2.5 text-sm leading-relaxed text-muted-foreground">
                              {h.body}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  )
                })}
              </ul>
            </div>

            <footer className="border-t border-border px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="gh-interactive flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[rgb(var(--accent-1))] text-sm font-semibold text-[var(--accent-button-fg)] shadow-[0_14px_36px_-12px_rgb(var(--accent-1)/0.65)] outline-none sm:text-base"
                >
                  Continue to Website
                  <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSeeWhatsNew}
                  className="glass gh-interactive flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-foreground outline-none"
                >
                  <Sparkles className="size-4" />
                  See What&apos;s New
                </button>
              </div>
              <p className="mt-2.5 text-center text-xs text-muted-foreground">
                You won&apos;t see this popup again after either option above.
              </p>
            </footer>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  )
}
