'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, MessageCircleQuestion, CheckCircle2, Info, Loader2 } from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { submitQuestion } from '@/lib/services'
import { LegalConsent, PreReleaseNotice, buildLegalAcceptance } from '@/components/legal-consent'
import { FAQ_CATEGORIES } from '@/lib/data'
import { useAuth } from '@/components/providers/auth-provider'
import { useNotifications } from '@/components/providers/notifications-provider'

const CATEGORIES = FAQ_CATEGORIES.filter((c) => c !== 'All')

export function AskQuestionModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { user, displayName } = useAuth()
  const { notify } = useNotifications()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [question, setQuestion] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)

  useEffect(() => setMounted(true), [])
  const firstField = useRef<HTMLInputElement>(null)

  // Reset the form whenever the modal is freshly opened.
  useEffect(() => {
    if (open) {
      setDone(false)
      setErrors({})
      setLoading(false)
      setName((current) => current || (user ? displayName : ''))
      setEmail((current) => current || user?.email || '')
      setTimeout(() => firstField.current?.focus(), 80)
    }
  }, [displayName, open, user])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Keep the page and fixed navigation behind the modal. Rendering through a
  // portal avoids transformed FAQ containers creating an unexpected stacking context.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setErrors({})
    const res = await submitQuestion({ name, email, category, question, legalAcceptance: buildLegalAcceptance('faq-question', email) })
    setLoading(false)
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {})
      return
    }
    notify({
      title: 'Question submitted',
      body: `Your question in the "${category}" category was sent to the team along with your contact email so they can follow up directly. Most questions get a reply within 1–2 business days — keep an eye on your inbox.`,
      icon: 'question',
      toast: false,
    })
    setDone(true)
    setName('')
    setEmail('')
    setCategory(CATEGORIES[0])
    setQuestion('')
  }

  const field =
    'w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-[rgb(var(--accent-1)/0.6)]'

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
          <motion.button
            type="button"
            aria-label="Close ask question dialog"
            className="fixed inset-0 cursor-default bg-black/55 backdrop-blur-xl supports-[backdrop-filter]:bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="glass-strong relative z-10 my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            role="dialog"
            aria-modal="true"
            aria-label="Ask a question"
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-lg hover:bg-muted"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                    className="mx-auto flex size-16 items-center justify-center rounded-2xl glow-accent"
                    style={{
                      background:
                        'linear-gradient(135deg, rgb(var(--accent-1) / 0.25), rgb(var(--accent-3) / 0.25))',
                    }}
                  >
                    <CheckCircle2 className="size-8 text-[rgb(var(--accent-1))]" />
                  </motion.div>
                  <h2 className="font-heading mt-5 text-xl font-semibold">
                    Question received
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Thanks for reaching out. Your question is saved and will be
                    considered for the FAQ and roadmap.
                  </p>
                  <div className="mt-5 flex items-start gap-2 rounded-xl border border-[rgb(var(--accent-1)/0.25)] bg-[rgb(var(--accent-1)/0.08)] px-4 py-3 text-left text-xs text-muted-foreground">
                    <Info className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
                    Question submissions will be reviewed when the Feedback
                    Portal opens on 15 January 2027.
                  </div>
                  <div className="mt-6 flex gap-2">
                    <GhButton
                      variant="glass"
                      className="flex-1"
                      magnetic={false}
                      onClick={() => setDone(false)}
                    >
                      Ask another
                    </GhButton>
                    <GhButton className="flex-1" magnetic={false} onClick={onClose}>
                      Done
                    </GhButton>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="p-7"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.16)] text-[rgb(var(--accent-1))]">
                      <MessageCircleQuestion className="size-5" />
                    </span>
                    <div>
                      <h2 className="font-heading text-lg font-semibold">
                        Ask a question
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Can&apos;t find your answer? Send it our way.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Name
                        </label>
                        <input
                          ref={firstField}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className={field}
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@email.com"
                          className={field}
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                        )}
                      </div>
                    </div>
                    {user?.email && (
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Filled from your signed-in account. You can edit these details before submitting.
                      </p>
                    )}

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={field}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Your question
                      </label>
                      <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={4}
                        placeholder="What would you like to know about Gaming Horizon?"
                        className={`${field} resize-none`}
                      />
                      {errors.question && (
                        <p className="mt-1 text-xs text-red-400">{errors.question}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                    <Info className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
                    Question submissions will be reviewed when the Feedback
                    Portal opens on 15 January 2027.
                  </div>

                  <div className="mt-4"><PreReleaseNotice /></div>
                  <div className="mt-4"><LegalConsent checked={legalAccepted} onChange={setLegalAccepted} source="faq-question" id="faq-legal" /></div>

                  <div className="mt-5">
                    <GhButton
                      type="submit"
                      disabled={!legalAccepted}
                      className="w-full"
                      magnetic={false}
                      onClick={() => {}}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        'Submit question'
                      )}
                    </GhButton>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
