'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CalendarCheck2,
  Check,
  ChevronDown,
  Circle,
  Loader2,
  PauseCircle,
  Rocket,
  XCircle,
} from 'lucide-react'
import { ROADMAP } from '@/lib/data'
import { resolveMilestones, type RoadmapState } from '@/lib/milestones'
import { useMilestoneClock } from '@/lib/use-milestone-clock'

const FILTERS: (RoadmapState | 'All')[] = [
  'All',
  'Completed',
  'Scheduled Reached',
  'In Progress',
  'Upcoming',
  'Major Launch',
  'Delayed',
  'Paused',
  'Cancelled',
]

const stateMeta: Record<RoadmapState, { icon: typeof Check; color: string; label: string }> = {
  Completed: { icon: Check, color: '52 211 153', label: 'Completed' },
  'Scheduled Reached': { icon: CalendarCheck2, color: '217 119 6', label: 'Scheduled milestone reached' },
  'In Progress': { icon: Loader2, color: 'var(--accent-1)', label: 'In Progress' },
  Upcoming: { icon: Circle, color: '148 163 184', label: 'Upcoming' },
  'Major Launch': { icon: Rocket, color: 'var(--accent-3)', label: 'Scheduled launch' },
  Delayed: { icon: AlertTriangle, color: '234 88 12', label: 'Delayed' },
  Paused: { icon: PauseCircle, color: '100 116 139', label: 'Paused' },
  Cancelled: { icon: XCircle, color: '185 28 28', label: 'Cancelled' },
}

export function RoadmapTimeline({ expandable = true }: { expandable?: boolean }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const [open, setOpen] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const now = useMilestoneClock()
  const resolved = useMemo(() => resolveMilestones(ROADMAP, now), [now])
  const items = resolved.filter((milestone) => filter === 'All' || milestone.state === filter)

  useEffect(() => {
    let ticking = false
    const apply = () => {
      ticking = false
      const element = containerRef.current
      const line = lineRef.current
      if (!element || !line) return
      const rect = element.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight))
      line.style.height = `${progress * 100}%`
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(apply)
    }
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const currentIndex = resolved.findIndex((milestone) => milestone.state === 'In Progress')

  return (
    <div ref={containerRef} className="w-full">
      <div className="mb-12 flex flex-wrap justify-center gap-3">
        {FILTERS.map((value) => {
          const count = value === 'All'
            ? resolved.length
            : resolved.filter((milestone) => milestone.state === value).length
          if (value !== 'All' && count === 0 && !['Upcoming', 'In Progress', 'Completed', 'Major Launch'].includes(value)) {
            return null
          }
          return (
            <motion.button
              key={value}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`relative overflow-hidden rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 ${
                filter === value
                  ? 'border-[rgb(var(--accent-1))] bg-gradient-to-r from-[rgb(var(--accent-1)/0.15)] to-[rgb(var(--accent-2)/0.15)] text-foreground shadow-lg shadow-[rgb(var(--accent-1)/0.2)]'
                  : 'border-border text-muted-foreground hover:border-[rgb(var(--accent-1)/0.5)] hover:text-foreground'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {value}
                {value !== 'All' && <span className="ml-1 text-[10px] font-semibold opacity-60">{count}</span>}
              </span>
              {filter === value && (
                <motion.div
                  layoutId="activeChip"
                  className="absolute inset-0 -z-10 bg-gradient-to-r from-[rgb(var(--accent-1)/0.08)] via-transparent to-[rgb(var(--accent-2)/0.08)]"
                  transition={{ type: 'spring', bounce: 0.2 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="relative mx-auto max-w-2xl">
        <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-transparent via-[rgb(var(--accent-1)/0.3)] to-transparent">
          <div
            ref={lineRef}
            className="absolute left-0 top-0 w-full bg-gradient-to-b from-[rgb(var(--accent-1)/0.8)] via-[rgb(var(--accent-2)/0.6)] to-transparent transition-[height] duration-300 ease-out"
            style={{ height: 0 }}
          />
        </div>

        <div className="flex flex-col gap-8 sm:gap-10">
          {items.map((milestone, index) => {
            const originalIndex = resolved.findIndex((item) => item.id === milestone.id)
            const meta = stateMeta[milestone.state]
            const Icon = meta.icon
            const color = `rgb(${meta.color})`
            const isOpen = open === milestone.id
            const major = milestone.kind === 'launch'
            const isCurrent = originalIndex === currentIndex
            const completed = milestone.state === 'Completed'
            const reached = milestone.state === 'Scheduled Reached'

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <span className="sr-only" role="status">{milestone.accessibleStatus}</span>
                <motion.div
                  className="absolute left-1/2 top-6 z-20 -translate-x-1/2"
                  animate={isCurrent ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={isCurrent ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
                >
                  <div className="relative">
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 -m-3 rounded-full border border-[rgb(var(--accent-1))]"
                        animate={{ opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                    <motion.div
                      className="grid size-6 place-items-center rounded-full ring-4 ring-background"
                      style={{
                        background: isCurrent || completed || reached
                          ? color
                          : `color-mix(in oklab, ${color} 40%, transparent)`,
                      }}
                      whileHover={{ scale: 1.15 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      <Icon className={`size-3.5 text-black ${milestone.state === 'In Progress' ? 'animate-spin' : ''}`} />
                    </motion.div>
                  </div>
                </motion.div>

                <div className={`sm:flex sm:items-stretch ${index % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}>
                  <div className={`sm:w-1/2 sm:px-6 ${index % 2 === 0 ? 'sm:text-right' : ''}`} />
                  <motion.div
                    className={`relative ml-12 sm:ml-0 sm:w-1/2 ${index % 2 === 0 ? 'sm:pr-0' : 'sm:pl-6'}`}
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div
                      className={`group relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300 ${
                        major
                          ? 'border-[rgb(var(--accent-3)/0.4)] shadow-[0_0_40px_-8px_rgb(var(--accent-3)/0.4)]'
                          : isCurrent
                            ? 'border-[rgb(var(--accent-1)/0.5)] shadow-[0_0_30px_-8px_rgb(var(--accent-1)/0.3)]'
                            : completed
                              ? 'border-[rgb(52_211_153/0.3)] shadow-[0_0_20px_-8px_rgb(52_211_153/0.2)]'
                              : reached
                                ? 'border-amber-500/30 shadow-[0_0_20px_-8px_rgb(217_119_6/0.2)]'
                                : 'border-border shadow-sm'
                      }`}
                      style={{ background: 'linear-gradient(135deg, rgb(var(--background)/0.7) 0%, rgb(var(--background)/0.3) 100%)' }}
                    >
                      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.08] via-transparent to-transparent" />
                      <button
                        onClick={() => expandable && setOpen(isOpen ? null : milestone.id)}
                        aria-expanded={expandable ? isOpen : undefined}
                        className="relative z-10 w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{meta.label}</span>
                            <h3 className="mt-1 font-heading text-lg font-bold text-foreground">{milestone.title}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">{milestone.when}</p>
                          </div>
                          {expandable && (
                            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                            </motion.div>
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="relative z-10 mt-4 border-t border-[rgb(var(--accent-1)/0.1)] pt-4">
                              <p className="text-sm leading-relaxed text-muted-foreground">{milestone.description}</p>
                              <div className="mt-4 grid gap-3 text-xs">
                                <div>
                                  <span className="font-semibold text-foreground">Status:</span>
                                  <p className="text-muted-foreground">{milestone.statusLabel}</p>
                                </div>
                                <div>
                                  <span className="font-semibold text-foreground">Schedule:</span>
                                  <p className="text-muted-foreground">Asia/Kolkata (IST) · absolute scheduled timestamp</p>
                                </div>
                                {reached && (
                                  <p className="rounded-xl border border-amber-500/20 bg-amber-500/8 p-3 text-amber-800 dark:text-amber-200">
                                    The scheduled date has been reached. Engineering completion remains unverified until a manual project update confirms it.
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
