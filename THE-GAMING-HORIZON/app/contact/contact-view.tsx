'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2, Mail } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { GhButton } from '@/components/ui/primitives'
import { submitContact } from '@/lib/services'
import { LegalConsent, PreReleaseNotice, buildLegalAcceptance } from '@/components/legal-consent'
import { useAuth } from '@/components/providers/auth-provider'

const TOPICS = ['General', 'Press & Media', 'Partnerships', 'Developer Platform', 'Careers']

const inputCls =
  'w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-[rgb(var(--accent-1)/0.6)]'

export function ContactView() {
  const { user, displayName } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('General')
  const [loading, setLoading] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) return
    setName((current) => current || displayName)
    setEmail((current) => current || user.email || '')
  }, [displayName, user])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    const fd = new FormData(e.currentTarget)
    const res = await submitContact({
      name: String(fd.get('name') || name),
      email: String(fd.get('email') || email),
      topic,
      message: String(fd.get('message') || ''),
      legalAcceptance: buildLegalAcceptance('feedback-contact', String(fd.get('email') || '')),
    })
    setLoading(false)
    if (res.ok) setDone(true)
    else setErrors(res.fieldErrors || {})
  }

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Let&apos;s <span className="text-gradient">talk</span>
          </>
        }
        subtitle="Questions, press, partnerships or just curious? Send a message and the team will get back to you. Responses may take longer during pre-launch."
      />

      <div className="mx-auto max-w-2xl px-4 pb-8">
        <div data-selectable-content="true" className="glass rounded-3xl p-6 sm:p-10">
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-10 text-center"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-[rgb(var(--accent-1)/0.15)] text-[rgb(var(--accent-1))]">
                <Check className="size-8" />
              </div>
              <h2 className="font-heading text-2xl font-semibold">Message received</h2>
              <p className="max-w-sm text-pretty leading-relaxed text-muted-foreground">
                Thanks for reaching out. We&apos;ve logged your message and will reply to
                the email you provided.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <PreReleaseNotice />
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium" htmlFor="name">
                    Name
                  </label>
                  <input id="name" name="name" className={inputCls} placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <input id="email" name="email" type="email" className={inputCls} placeholder="you@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
                  )}
                </div>
              </div>
              {user?.email && (
                <p className="-mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  Your signed-in details were filled in automatically. You can edit them before sending.
                </p>
              )}

              <div>
                <span className="mb-2 block text-sm font-medium">Topic</span>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                        topic === t
                          ? 'border-[rgb(var(--accent-1)/0.6)] bg-[rgb(var(--accent-1)/0.14)] text-foreground'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className={`${inputCls} resize-none`}
                  placeholder="How can we help?"
                />
                {errors.message && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.message}</p>
                )}
              </div>

              <LegalConsent checked={legalAccepted} onChange={setLegalAccepted} source="feedback-contact" id="contact-legal" />
              <GhButton type="submit" disabled={!legalAccepted} size="lg" className="w-full" magnetic={false}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    <Mail className="size-4" /> Send message
                  </>
                )}
              </GhButton>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
