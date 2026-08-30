'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2, ArrowRight, Database, Sparkles, BarChart3, EyeOff, Download, Trash2, BrainCircuit, SlidersHorizontal } from 'lucide-react'

const statuses = [
  { label: 'Only essential browser storage by default', icon: Database, enabled: true },
  { label: 'Personalization stays optional and controllable', icon: SlidersHorizontal, enabled: true },
  { label: 'No sale of personal information', icon: EyeOff, enabled: true },
  { label: 'Export and deletion controls are part of the roadmap', icon: Download, enabled: true },
  { label: 'AI suggestions will explain the signals they use', icon: BrainCircuit, enabled: true },
  { label: 'Analytics remain off on this announcement site', icon: BarChart3, enabled: true },
]

export function PrivacyCookies() {
  return (
    <section id="privacy-cookies" className="relative scroll-mt-28 px-4 py-20 cq-py-24-sm">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }} className="glass-panel relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[rgb(var(--accent-1)/0.20)] px-5 py-7 shadow-[0_30px_90px_-50px_rgb(var(--accent-1)/0.45)] sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent-1)/0.10)] via-transparent to-[rgb(var(--accent-3)/0.07)]" />
        <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-[rgb(var(--accent-1)/0.12)] blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--accent-1)/0.25)] bg-[rgb(var(--accent-1)/0.09)] px-3 py-1.5 text-xs font-bold text-[rgb(var(--accent-1))]">
              <ShieldCheck className="size-4" /> Privacy Status
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">Privacy is part of the product, not a permission screen</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">Gaming Horizon is being built around a minimal-data, browser-first architecture. This announcement site only stores the preferences required to remember your chosen experience and notices you have dismissed; it does not need advertising profiles, cross-site tracking, or a hidden behavioural history. Future accounts will make personalization optional, explain what recommendation signals are being used, and provide clear controls to access, export, correct, or delete your data. Useful discovery should come from choices you understand—not surveillance you cannot see.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/privacy" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.10)] px-4 text-sm font-bold transition-all hover:-translate-y-0.5 hover:bg-[rgb(var(--accent-1)/0.16)] hover:shadow-[0_10px_28px_-12px_rgb(var(--accent-1)/0.55)]">Read Privacy Policy <ArrowRight className="size-4" /></Link>
              <Link href="/terms" className="inline-flex min-h-11 items-center rounded-xl border border-border bg-background/45 px-4 text-sm font-semibold transition-colors hover:bg-muted">View Terms</Link>
            </div>
          </div>

          <div className="grid gap-3">
            {statuses.map((status, index) => {
              const Icon = status.icon
              return (
                <motion.div key={status.label} initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * .06 }} className="glass flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.10)] text-[rgb(var(--accent-1))]"><Icon className="size-4.5" /></span>
                  <span className="min-w-0 flex-1 text-sm font-bold">{status.label}</span>
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-500" aria-label="Confirmed" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
