'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ImageOff, Library as LibraryIcon, X } from 'lucide-react'
import { useSettings } from '@/components/providers/settings-provider'
import { getFestivalLibrary, getLibraryYears, type LibraryEntry } from '@/lib/festivals'

type YearFilter = 'all' | number

/** "August 28, 2026" — anchored at midday UTC so the date never drifts a day either way depending on the visitor's own timezone. */
function formatEntryDate(entry: LibraryEntry): string {
  const anchor = new Date(Date.UTC(entry.year, entry.month - 1, entry.day, 12, 0, 0))
  return anchor.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * The footer "Library" panel: an archive of every festival wish image that
 * has finished its one day as the full-screen Gateway popup
 * (components/festival-image-popup.tsx). An occasion moves from that popup
 * into this list automatically at 23:59:59.999 IST on its date — see
 * getFestivalLibrary in lib/festivals.ts — so this component never needs
 * per-festival wiring; it just re-reads that list whenever it's opened.
 */
export function FestivalLibraryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings } = useSettings()
  const reduced = settings.motionMode !== 'full'
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const [entries, setEntries] = useState<LibraryEntry[]>([])
  const [years, setYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<YearFilter>('all')

  useEffect(() => {
    if (!open) return
    // Recomputed against the current time on every open, so an image that
    // unlocked since the last visit shows up without needing a reload, and
    // the year selector grows on its own once a new year begins.
    setEntries(getFestivalLibrary())
    setYears(getLibraryYears())
    setSelectedYear('all')
    triggerRef.current = document.activeElement as HTMLElement
  }, [open])

  const visibleEntries = selectedYear === 'all' ? entries : entries.filter((entry) => entry.year === selectedYear)

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
    onClose()
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[240] flex items-end justify-center p-0 sm:items-center sm:p-6 landscape:items-center landscape:p-3">
          <motion.button
            aria-label="Close Festival Library"
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Festival Library"
            className="glass-panel-large relative z-10 flex max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] bg-background/97 sm:max-h-[88vh] sm:rounded-[2rem] landscape:max-h-[92dvh] landscape:max-w-3xl landscape:rounded-[1.5rem]"
            initial={{ opacity: 0, y: reduced ? 0 : 40, scale: reduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.98 }}
            transition={{ duration: reduced ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border px-6 py-5 pr-16 sm:flex-nowrap sm:px-8 sm:pr-20 landscape:flex-nowrap landscape:py-3.5 landscape:pr-16">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                  <LibraryIcon className="size-5" />
                </div>
                <h2 className="font-heading text-lg font-bold leading-tight text-foreground sm:text-2xl landscape:text-lg">
                  Festival Library
                </h2>
              </div>
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
                Every festival wish image that has had its day greeting visitors on the homepage, kept here once it steps aside for the next one.
              </p>

              {years.length > 0 && (
                <div
                  role="tablist"
                  aria-label="Filter Library by year"
                  className="mt-5 flex flex-wrap gap-2"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedYear === 'all'}
                    onClick={() => setSelectedYear('all')}
                    className={`gh-interactive rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide outline-none transition-colors ${
                      selectedYear === 'all'
                        ? 'border-[rgb(var(--accent-1)/0.5)] bg-[rgb(var(--accent-1)/0.14)] text-foreground'
                        : 'border-border/70 text-muted-foreground hover:border-border hover:text-foreground'
                    }`}
                  >
                    All years
                  </button>
                  {years.map((year) => (
                    <button
                      key={year}
                      type="button"
                      role="tab"
                      aria-selected={selectedYear === year}
                      onClick={() => setSelectedYear(year)}
                      className={`gh-interactive rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide outline-none transition-colors ${
                        selectedYear === year
                          ? 'border-[rgb(var(--accent-1)/0.5)] bg-[rgb(var(--accent-1)/0.14)] text-foreground'
                          : 'border-border/70 text-muted-foreground hover:border-border hover:text-foreground'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}

              {visibleEntries.length === 0 ? (
                <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 px-6 py-12 text-center">
                  <div className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                    <ImageOff className="size-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {entries.length === 0 ? 'Nothing archived yet' : `Nothing archived for ${selectedYear} yet`}
                  </p>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    {entries.length === 0
                      ? "When today's festival wish image finishes its day on the homepage, it'll land here automatically — no need to check back before then."
                      : 'Try another year, or check back once this year\u2019s festival images have unlocked.'}
                  </p>
                </div>
              ) : (
                <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                  {visibleEntries.map((entry) => (
                    <li
                      key={`${entry.id}-${entry.year}`}
                      className="overflow-hidden rounded-2xl border border-border/70 bg-background/60"
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                        <Image
                          src={entry.image}
                          alt={entry.title}
                          fill
                          className="object-cover"
                          sizes="(min-width: 640px) 360px, 100vw"
                        />
                      </div>
                      <div className="p-4">
                        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Calendar className="size-3.5" />
                          {formatEntryDate(entry)}
                        </p>
                        <p className="mt-1.5 font-heading text-[15px] font-semibold text-foreground">{entry.title}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{entry.message}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  )
}
