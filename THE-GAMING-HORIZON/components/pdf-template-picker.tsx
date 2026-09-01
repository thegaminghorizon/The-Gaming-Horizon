'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Download, X } from 'lucide-react'
import { PDF_TEMPLATES, type PdfTemplateId } from '@/lib/whats-new'

/**
 * Small confirmation modal shown before a "What's New" PDF download starts,
 * letting people pick which of the a few visual styles (see PDF_TEMPLATES
 * in lib/whats-new.ts) they'd rather have — the branded default isn't
 * everyone's idea of a good printout. Shared between WhatsNewModal and
 * NotificationsPanel so both "Download PDF" buttons behave the same way.
 */
export function PdfTemplatePicker({
  open,
  generating,
  onClose,
  onConfirm,
}: {
  open: boolean
  generating: boolean
  onClose: () => void
  onConfirm: (template: PdfTemplateId) => void
}) {
  const [selected, setSelected] = useState<PdfTemplateId>('brand')

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[280] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            aria-label="Close template picker"
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Choose a PDF style"
            className="glass-panel-large relative z-10 flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[1.75rem] bg-background/97 sm:max-h-[85vh] sm:rounded-[1.75rem]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <h3 className="font-heading text-base font-semibold text-foreground">Choose a PDF style</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="gh-interactive grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-2.5">
                {PDF_TEMPLATES.map((tpl) => {
                  const isSelected = selected === tpl.id
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelected(tpl.id)}
                      aria-pressed={isSelected}
                      className={`gh-interactive flex items-start gap-3 rounded-xl border px-4 py-3 text-left outline-none transition-colors ${
                        isSelected
                          ? 'border-[rgb(var(--accent-1))] bg-[rgb(var(--accent-1)/0.08)]'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                          isSelected ? 'border-[rgb(var(--accent-1))] bg-[rgb(var(--accent-1))]' : 'border-border'
                        }`}
                      >
                        {isSelected && <Check className="size-3 text-[var(--accent-button-fg)]" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-foreground">{tpl.name}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {tpl.description}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={() => onConfirm(selected)}
                disabled={generating}
                className="gh-interactive flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[rgb(var(--accent-1))] text-sm font-semibold text-[var(--accent-button-fg)] outline-none disabled:opacity-60"
              >
                <Download className="size-4" />
                {generating ? 'Preparing…' : 'Download PDF'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
