'use client'

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { DEV_PROGRESS, type DevItem } from '@/lib/data'
import { useToday } from '@/lib/use-today'
import { projectedProgress } from '@/lib/progress'

const statusStyle: Record<DevItem['status'], string> = {
  Shipped: 'bg-[rgb(52_211_153/0.16)] text-[rgb(110_231_183)]',
  'In Progress': 'bg-[rgb(var(--accent-1)/0.16)] text-[rgb(var(--accent-1))]',
  Planned: 'bg-[rgb(251_191_36/0.16)] text-[rgb(253_224_71)]',
}

function Bar({ item, index, today }: { item: DevItem; index: number; today: string | null }) {
  const progress = projectedProgress(item.progress)
  // Actively-developed systems reflect the visitor's current date automatically.
  const updatedLabel =
    item.status === 'In Progress' ? (today ? `today · ${today}` : 'today') : item.updated
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
      className="glass glow-hover rounded-2xl p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading text-sm font-semibold">{item.name}</h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyle[item.status]}`}>
          {item.status}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span className="font-mono tabular-nums text-foreground">{progress}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted/60">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, rgb(var(--accent-1)), rgb(var(--accent-3)))' }}
          initial={{ width: 0 }}
          whileInView={{ width: `${progress}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{item.note}</p>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
        <Clock className="size-3" />
        Updated {updatedLabel}
      </div>
    </motion.div>
  )
}

export function DevDashboard({ limit }: { limit?: number }) {
  const items = limit ? DEV_PROGRESS.slice(0, limit) : DEV_PROGRESS
  const projectedItems = DEV_PROGRESS.map((item) => projectedProgress(item.progress))
  const overall = Math.round(projectedItems.reduce((a, b) => a + b, 0) / projectedItems.length)
  const today = useToday()

  return (
    <div>
      <div className="glass mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Projected Schedule Progress
          </p>
          <p className="font-heading text-3xl font-semibold text-gradient">{overall}%</p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
            <Clock className="size-3" />
            Projection updated: {today ? `Today, ${today}` : 'Today'} · verified baselines remain manual
          </p>
        </div>
        <div className="h-2 flex-1 basis-48 overflow-hidden rounded-full bg-muted/60">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, rgb(var(--accent-1)), rgb(var(--accent-2)), rgb(var(--accent-3)))' }}
            initial={{ width: 0 }}
            whileInView={{ width: `${overall}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Bar key={item.name} item={item} index={i} today={today} />
        ))}
      </div>
    </div>
  )
}
