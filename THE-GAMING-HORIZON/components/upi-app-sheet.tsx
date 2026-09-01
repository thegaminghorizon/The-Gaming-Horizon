'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { UPI_APPS, type UpiAppId } from '@/lib/support-us'

/**
 * Inline "choose a UPI app" panel shown under the Horizon Pay "Open UPI
 * app" button. Deliberately uses plain colour chips + the app's name
 * rather than each app's logo — no third-party marks are reproduced here,
 * just a labelled button per app. See lib/support-us.ts's tryOpenUpiApp
 * for what actually happens on tap.
 */
export function UpiAppSheet({ open, onChoose }: { open: boolean; onChoose: (appId: UpiAppId) => void }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {UPI_APPS.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => onChoose(app.id)}
                className="gh-interactive flex flex-col items-center gap-1.5 rounded-xl border border-border/70 px-2 py-3 text-center outline-none hover:border-[rgb(var(--accent-1)/0.5)] hover:-translate-y-0.5"
              >
                <span
                  className="grid size-9 place-items-center rounded-full text-white"
                  style={{ backgroundColor: app.colorHex }}
                >
                  <ArrowUpRight className="size-4" />
                </span>
                <span className="text-[11px] font-medium leading-tight text-foreground">{app.name}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/80">
            Opens that app directly if it&apos;s installed on this phone. If nothing happens, use the QR code above
            from another device instead.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
