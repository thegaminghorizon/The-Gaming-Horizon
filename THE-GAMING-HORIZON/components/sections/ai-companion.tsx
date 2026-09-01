'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Clock, Gauge, Globe, Trophy, Users } from 'lucide-react'
import { SectionHeading, DetailButton, Reveal } from '@/components/ui/primitives'
import { AI_MOODS, AI_RECS, type AiRec } from '@/lib/data'

export function AiCompanion() {
  const [mood, setMood] = useState('competitive')
  const [typing, setTyping] = useState(false)
  const [recs, setRecs] = useState<AiRec[]>(AI_RECS['competitive'])
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const pick = (key: string) => {
    setMood(key)
    setTyping(true)
    setRecs([])
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setRecs(AI_RECS[key] ?? [])
      setTyping(false)
    }, 1100)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <section
      id="ai"
      className="relative scroll-mt-28 px-4 py-20 cq-py-28"
    >
      {/* Ambient intro glow so the section reads as a distinct environment */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-70"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 0%, rgb(var(--accent-1)/0.16), transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          center
          eyebrow="AI Companion"
          title="An AI that actually understands how you want to play"
          subtitle="Pick a mood or goal. The companion reasons about your intent, time and device — then recommends games with a clear why."
        />

        <Reveal className="mt-14">
          <div className="glass overflow-hidden rounded-3xl">
            {/* prompt bar */}
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <span className="grid size-8 place-items-center rounded-lg bg-[rgb(var(--accent-1)/0.16)] text-[rgb(var(--accent-1))]">
                <Sparkles className="size-4" />
              </span>
              <p className="text-sm text-muted-foreground">
                What are you in the mood for?
              </p>
            </div>

            {/* moods */}
            <div className="flex flex-wrap gap-2 px-5 py-4">
              {AI_MOODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => pick(m.key)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    mood === m.key
                      ? 'border-[rgb(var(--accent-1)/0.6)] bg-[rgb(var(--accent-1)/0.18)] text-foreground'
                      : 'border-border text-muted-foreground hover:border-[rgb(var(--accent-1)/0.4)] hover:text-foreground'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* output */}
            <div className="border-t border-border bg-muted/20 p-5 md:p-6">
              <AnimatePresence mode="wait">
                {typing ? (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 py-8 text-sm text-muted-foreground"
                  >
                    <Sparkles className="size-4 text-[rgb(var(--accent-1))]" />
                    Companion is thinking
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="size-1.5 rounded-full bg-[rgb(var(--accent-1))]"
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key={mood}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="grid gap-4 md:grid-cols-2"
                  >
                    {recs.map((r, i) => (
                      <motion.div
                        key={r.game}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                        className="glass glow-hover rounded-2xl p-5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-heading text-lg font-semibold">{r.game}</h4>
                          <span className="flex items-center gap-1.5 rounded-full bg-[rgb(var(--accent-1)/0.16)] px-2.5 py-1 text-[10px] font-medium text-[rgb(var(--accent-1))]">
                            <span className="relative flex size-1.5">
                              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[rgb(var(--accent-1))] opacity-75" />
                              <span className="relative inline-flex size-1.5 rounded-full bg-[rgb(var(--accent-1))]" />
                            </span>
                            {90 - i * 7}% match
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.reason}</p>
                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{r.playtime}</span>
                          <span className="flex items-center gap-1.5"><Gauge className="size-3.5" />{r.difficulty}</span>
                          <span className="flex items-center gap-1.5"><Globe className="size-3.5" />{r.browser}</span>
                          <span className="flex items-center gap-1.5"><Trophy className="size-3.5" />{r.achievements} achievements</span>
                          <span className="flex items-center gap-1.5"><Users className="size-3.5" />{r.friends} friends play</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex justify-center">
          <DetailButton href="/ai" />
        </Reveal>
      </div>
    </section>
  )
}
