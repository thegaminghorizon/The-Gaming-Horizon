'use client'

import { motion } from 'framer-motion'
import {
  Download,
  HardDriveDownload,
  RefreshCw,
  Database,
  AppWindow,
  Play,
  MousePointerClick,
  Infinity as InfinityIcon,
} from 'lucide-react'
import { SectionHeading, Reveal } from '@/components/ui/primitives'

const TRADITIONAL = [
  { icon: Download, label: 'Download' },
  { icon: HardDriveDownload, label: 'Install' },
  { icon: RefreshCw, label: 'Update' },
  { icon: Database, label: 'Storage' },
  { icon: AppWindow, label: 'Launcher' },
  { icon: Play, label: 'Play' },
]

const HORIZON = [
  { icon: MousePointerClick, label: 'Click' },
  { icon: Play, label: 'Play' },
  { icon: InfinityIcon, label: 'Continue Anywhere' },
]

export function WhyBrowser() {
  return (
    <section className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="Why Browser Gaming"
          title="From six steps to one click"
          subtitle="The browser is already the most accessible gaming device in the world. Gaming Horizon gives it the identity, progression, discovery, and community layer it has been missing."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Traditional */}
          <Reveal>
            <div className="glass h-full rounded-3xl p-7">
              <div className="mb-6 flex items-center gap-2">
                <span className="size-2 rounded-full bg-[rgb(248_113_113)]" />
                <h3 className="font-heading text-lg font-semibold text-muted-foreground">
                  Traditional Gaming
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {TRADITIONAL.map((s, i) => {
                  const Icon = s.icon
                  return (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <span className="grid size-10 place-items-center rounded-xl bg-muted/60 text-muted-foreground">
                        <Icon className="size-4.5" style={{ width: 18, height: 18 }} />
                      </span>
                      <span className="text-sm text-muted-foreground">{s.label}</span>
                      <span className="ml-auto font-mono text-xs text-muted-foreground/50">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
              <p className="mt-6 text-xs text-muted-foreground/70">
                The experience begins with setup: downloads, storage decisions, updates, and another launcher to manage.
              </p>
            </div>
          </Reveal>

          {/* Horizon */}
          <Reveal delay={0.1}>
            <div className="glass relative h-full overflow-hidden rounded-3xl p-7">
              <div
                className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full opacity-40 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgb(var(--accent-1)/0.5), transparent 70%)' }}
              />
              <div className="mb-6 flex items-center gap-2">
                <span className="size-2 rounded-full bg-[rgb(52_211_153)] shadow-[0_0_10px_rgb(52_211_153)]" />
                <h3 className="font-heading text-lg font-semibold text-gradient">
                  Gaming Horizon
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {HORIZON.map((s, i) => {
                  const Icon = s.icon
                  return (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.12 }}
                      className="flex items-center gap-3 rounded-xl border border-[rgb(var(--accent-1)/0.2)] bg-[rgb(var(--accent-1)/0.06)] p-3"
                    >
                      <span className="grid size-10 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.18)] text-[rgb(var(--accent-1))]">
                        <Icon className="size-4.5" style={{ width: 18, height: 18 }} />
                      </span>
                      <span className="text-sm font-medium">{s.label}</span>
                    </motion.div>
                  )
                })}
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                From curiosity to gameplay in one click—then continue with the same identity, progress, and community wherever the browser is available.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
