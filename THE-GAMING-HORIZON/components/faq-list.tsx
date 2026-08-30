'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Star, MessageCircleQuestion } from 'lucide-react'
import { FAQS, FAQ_CATEGORIES } from '@/lib/data'
import { AskQuestionModal } from '@/components/ask-question-modal'

export function FaqList({
  withSearch = false,
  withCategories = false,
  withPopular = false,
  withAsk = false,
  limit,
}: {
  withSearch?: boolean
  withCategories?: boolean
  withPopular?: boolean
  withAsk?: boolean
  limit?: number
}) {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [open, setOpen] = useState<string | null>(null)
  const [askOpen, setAskOpen] = useState(false)

  const filtered = useMemo(() => {
    let list = FAQS
    if (cat !== 'All') list = list.filter((f) => f.category === cat)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
      )
    }
    return limit ? list.slice(0, limit) : list
  }, [query, cat, limit])

  const popular = FAQS.filter((f) => f.popular)

  return (
    <div data-selectable-content="true" className="mx-auto max-w-3xl">
      {withAsk && (
        <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Don&apos;t see your question? Ask it directly.
          </p>
          <button
            onClick={() => setAskOpen(true)}
            className="group inline-flex items-center gap-2 rounded-full border border-[rgb(var(--accent-1)/0.4)] bg-[rgb(var(--accent-1)/0.1)] px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:bg-[rgb(var(--accent-1)/0.18)]"
          >
            <MessageCircleQuestion className="size-4 text-[rgb(var(--accent-1))]" />
            Ask a Question
          </button>
        </div>
      )}

      {withSearch && (
        <div className="glass mb-4 flex items-center gap-3 rounded-2xl px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}

      {withCategories && (
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {FAQ_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                cat === c
                  ? 'border-[rgb(var(--accent-1)/0.6)] bg-[rgb(var(--accent-1)/0.18)] text-foreground'
                  : 'border-border text-muted-foreground hover:border-[rgb(var(--accent-1)/0.4)] hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {withPopular && !query && cat === 'All' && (
        <div className="mb-6">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Star className="size-3.5 text-[rgb(var(--accent-1))]" />
            Popular questions
          </p>
          <div className="flex flex-wrap gap-2">
            {popular.map((f) => (
              <button
                key={f.q}
                onClick={() => {
                  setOpen(f.q)
                  document.getElementById(`faq-${f.q}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
                className="glass rounded-xl px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {f.q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((f) => {
          const isOpen = open === f.q
          return (
            <div key={f.q} id={`faq-${f.q}`} className="glass overflow-hidden rounded-2xl">
              <button
                onClick={() => setOpen(isOpen ? null : f.q)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-medium">{f.q}</span>
                <ChevronDown
                  className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="glass rounded-2xl px-5 py-10 text-center text-sm text-muted-foreground">
            <p>No questions match your search.</p>
            {withAsk && (
              <button
                onClick={() => setAskOpen(true)}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[rgb(var(--accent-1))] hover:underline"
              >
                <MessageCircleQuestion className="size-4" />
                Ask this question instead
              </button>
            )}
          </div>
        )}
      </div>

      {withAsk && (
        <AskQuestionModal open={askOpen} onClose={() => setAskOpen(false)} />
      )}
    </div>
  )
}
