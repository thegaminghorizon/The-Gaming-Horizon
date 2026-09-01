'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Clock,
  Code2,
  CreditCard,
  Gamepad2,
  Headphones,
  Loader2,
  Mail,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Ticket,
  UserCog,
  Wifi,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { GhButton, Pill, Reveal } from '@/components/ui/primitives'
import { LegalConsent, PreReleaseNotice, buildLegalAcceptance } from '@/components/legal-consent'
import { useAuth } from '@/components/providers/auth-provider'
import { useNotifications } from '@/components/providers/notifications-provider'
import { FAQS } from '@/lib/data'
import {
  findSupportTicket,
  getSupportTickets,
  submitSupportTicket,
  type SupportTicket,
  type TicketPriority,
  type TicketStatus,
} from '@/lib/services'

const CATEGORIES = [
  { label: 'Account & Sign-in', icon: UserCog, desc: 'Login trouble, profile, email or password changes.' },
  { label: 'Billing & Plans', icon: CreditCard, desc: 'Pricing, plan changes and payment questions.' },
  { label: 'Beta Access', icon: Gamepad2, desc: 'Waitlist status, invites and beta feedback.' },
  { label: 'Technical Issue', icon: Wifi, desc: 'Bugs, performance or something not working.' },
  { label: 'Developer Platform', icon: Code2, desc: 'API keys, webhooks, docs and integrations.' },
  { label: 'Something Else', icon: MessageCircle, desc: 'Anything that does not fit the above.' },
]

const PRIORITIES: TicketPriority[] = ['Low', 'Normal', 'High', 'Urgent']

const priorityStyle: Record<TicketPriority, string> = {
  Low: 'bg-muted text-muted-foreground',
  Normal: 'bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]',
  High: 'bg-[rgb(251_191_36/0.16)] text-[rgb(253_224_71)]',
  Urgent: 'bg-[rgb(248_113_113/0.16)] text-[rgb(252_165_165)]',
}

const statusStyle: Record<TicketStatus, string> = {
  Open: 'bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]',
  'In Progress': 'bg-[rgb(251_191_36/0.16)] text-[rgb(253_224_71)]',
  Resolved: 'bg-[rgb(52_211_153/0.16)] text-[rgb(110_231_183)]',
}

const inputCls =
  'w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-[rgb(var(--accent-1)/0.6)]'

function TicketCard({ ticket }: { ticket: SupportTicket }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Ticket className="size-4 text-[rgb(var(--accent-1))]" />
          <span className="font-mono text-sm font-semibold">{ticket.ref}</span>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyle[ticket.status]}`}>
          {ticket.status}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium text-foreground">{ticket.subject}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{ticket.message}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className={`rounded-full px-2 py-0.5 font-medium ${priorityStyle[ticket.priority]}`}>{ticket.priority}</span>
        <span>{ticket.category}</span>
      </div>
      <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
        {ticket.timeline.map((event, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <Clock className="mt-0.5 size-3 shrink-0" />
            <span>
              <span className="font-medium text-foreground/90">{event.label}</span>
              {event.body ? ` — ${event.body}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TicketLookup() {
  const [ref, setRef] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<SupportTicket | null | undefined>(undefined)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setResult(findSupportTicket(ref, email) ?? null)
  }

  return (
    <div className="glass rounded-2xl p-5">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Search className="size-4 text-[rgb(var(--accent-1))]" /> Track a ticket
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        Enter your ticket reference and the email you submitted it with.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-2.5">
        <input
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="GH-12345"
          className={inputCls}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          type="email"
          className={inputCls}
        />
        <GhButton type="submit" variant="glass" size="sm" magnetic={false} className="w-full">
          Look up ticket
        </GhButton>
      </form>
      <AnimatePresence mode="wait">
        {result !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            {result ? (
              <TicketCard ticket={result} />
            ) : (
              <p className="rounded-xl border border-border bg-muted/20 px-3.5 py-3 text-xs text-muted-foreground">
                No ticket matched that reference and email combination.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SupportView() {
  const { user, displayName } = useAuth()
  const { notify } = useNotifications()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0].label)
  const [priority, setPriority] = useState<TicketPriority>('Normal')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([])

  useEffect(() => {
    if (!user) return
    setName((current) => current || displayName)
    setEmail((current) => current || user.email || '')
  }, [displayName, user])

  useEffect(() => {
    if (user?.email) setMyTickets(getSupportTickets(user.email))
  }, [user, ticket])

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return FAQS.filter((f) => f.popular).slice(0, 6)
    return FAQS.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)).slice(0, 8)
  }, [query])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    const fd = new FormData(e.currentTarget)
    const res = await submitSupportTicket({
      name: String(fd.get('name') || name),
      email: String(fd.get('email') || email),
      category,
      priority,
      subject: String(fd.get('subject') || ''),
      message: String(fd.get('message') || ''),
      legalAcceptance: buildLegalAcceptance('support-ticket', String(fd.get('email') || '')),
    })
    setLoading(false)
    if (res.ok && res.data) {
      setTicket(res.data)
      notify({
        title: `Ticket ${res.data.ref} created`,
        body: `Your ${priority.toLowerCase()}-priority ${category.toLowerCase()} request has been logged and the support team will follow up at the email you provided. Keep hold of your reference number, ${res.data.ref}, if you need to check on it or reply with more details.`,
        icon: 'success',
        toast: false,
      })
    } else {
      setErrors(res.fieldErrors || {})
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Support"
        title={
          <>
            How can we <span className="text-gradient">help</span>?
          </>
        }
        subtitle="Search help articles, browse a topic, or open a ticket and the team will follow up by email. Responses may take longer during pre-launch."
      >
        <Pill>
          <Headphones className="size-3.5 text-[rgb(var(--accent-1))]" />
          Avg. first response under 24h
        </Pill>
        <Link
          href="/status"
          className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.08)] px-3 py-1 text-xs font-medium text-foreground/90 transition-colors hover:border-[rgb(var(--accent-1)/0.6)]"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[rgb(var(--accent-3))] opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-[rgb(var(--accent-3))]" />
          </span>
          System status
        </Link>
      </PageHeader>

      <div className="mx-auto max-w-3xl px-4">
        <Reveal>
          <div className="glass relative flex items-center gap-3 rounded-2xl px-4 py-3.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help articles — e.g. “reset password”, “beta invite”, “API key”"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            />
          </div>
        </Reveal>

        {filteredFaqs.length > 0 && (
          <Reveal delay={0.05}>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {filteredFaqs.map((f) => (
                <Link
                  key={f.q}
                  href={`/faq?q=${encodeURIComponent(f.q)}`}
                  className="group rounded-xl border border-border/70 bg-background/40 px-4 py-3 text-sm transition-colors hover:border-[rgb(var(--accent-1)/0.5)]"
                >
                  <p className="font-medium text-foreground">{f.q}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{f.a}</p>
                </Link>
              ))}
            </div>
          </Reveal>
        )}
      </div>

      <div className="mx-auto mt-14 max-w-5xl px-4">
        <Reveal>
          <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Browse by topic
          </p>
        </Reveal>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.04}>
              <button
                type="button"
                onClick={() => {
                  setCategory(c.label)
                  document.getElementById('open-ticket')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={`group flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                  category === c.label
                    ? 'border-[rgb(var(--accent-1)/0.55)] bg-[rgb(var(--accent-1)/0.08)]'
                    : 'border-border/70 bg-background/40 hover:border-[rgb(var(--accent-1)/0.4)]'
                }`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                  <c.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{c.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{c.desc}</span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <div id="open-ticket" className="mx-auto mt-16 max-w-5xl scroll-mt-28 px-4 pb-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div data-selectable-content="true" className="glass rounded-3xl p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {ticket ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-6 text-center"
                >
                  <div className="flex size-16 items-center justify-center rounded-full bg-[rgb(var(--accent-1)/0.15)] text-[rgb(var(--accent-1))]">
                    <Check className="size-8" />
                  </div>
                  <h2 className="font-heading text-2xl font-semibold">Ticket created</h2>
                  <p className="max-w-sm text-pretty leading-relaxed text-muted-foreground">
                    Reference <span className="font-mono font-semibold text-foreground">{ticket.ref}</span> — a confirmation is on its way to {ticket.email}. Keep the reference to track status.
                  </p>
                  <TicketCard ticket={ticket} />
                  <GhButton
                    variant="glass"
                    size="sm"
                    magnetic={false}
                    onClick={() => {
                      setTicket(null)
                    }}
                  >
                    Open another ticket
                  </GhButton>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={onSubmit}
                  className="space-y-5"
                >
                  <PreReleaseNotice />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium" htmlFor="name">
                        Name
                      </label>
                      <input id="name" name="name" className={inputCls} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                      {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium" htmlFor="email">
                        Email
                      </label>
                      <input id="email" name="email" type="email" className={inputCls} placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                      {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <span className="mb-2 block text-sm font-medium">Category</span>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.label}
                          type="button"
                          onClick={() => setCategory(c.label)}
                          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                            category === c.label
                              ? 'border-[rgb(var(--accent-1)/0.6)] bg-[rgb(var(--accent-1)/0.14)] text-foreground'
                              : 'border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="mb-2 block text-sm font-medium">Priority</span>
                    <div className="flex flex-wrap gap-2">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                            priority === p
                              ? 'border-[rgb(var(--accent-1)/0.6)] bg-[rgb(var(--accent-1)/0.14)] text-foreground'
                              : 'border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium" htmlFor="subject">
                      Subject
                    </label>
                    <input id="subject" name="subject" className={inputCls} placeholder="Short summary of your request" />
                    {errors.subject && <p className="mt-1.5 text-xs text-red-400">{errors.subject}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium" htmlFor="message">
                      Details
                    </label>
                    <textarea id="message" name="message" rows={5} className={`${inputCls} resize-none`} placeholder="What's happening? Include steps to reproduce if it's a bug." />
                    {errors.message && <p className="mt-1.5 text-xs text-red-400">{errors.message}</p>}
                  </div>

                  <LegalConsent checked={legalAccepted} onChange={setLegalAccepted} source="support-ticket" id="support-legal" />
                  <GhButton type="submit" disabled={!legalAccepted} size="lg" className="w-full" magnetic={false}>
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="size-4" /> Open ticket
                      </>
                    )}
                  </GhButton>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <TicketLookup />

            {myTickets.length > 0 && (
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Ticket className="size-4 text-[rgb(var(--accent-1))]" /> Your tickets
                </p>
                <div className="space-y-3">
                  {myTickets.slice(0, 3).map((t) => (
                    <TicketCard key={t.id} ticket={t} />
                  ))}
                </div>
              </div>
            )}

            <div className="glass rounded-2xl p-5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="size-4 text-[rgb(var(--accent-1))]" /> More ways to reach us
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/contact" className="group flex items-center justify-between gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <span className="flex items-center gap-2">
                      <Mail className="size-4 text-[rgb(var(--accent-1))]" /> General contact form
                    </span>
                    <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
                <li>
                  <Link href="/developers" className="group flex items-center justify-between gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <span className="flex items-center gap-2">
                      <Code2 className="size-4 text-[rgb(var(--accent-1))]" /> Developer Portal & API docs
                    </span>
                    <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="group flex items-center justify-between gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <span className="flex items-center gap-2">
                      <MessageCircle className="size-4 text-[rgb(var(--accent-1))]" /> Full FAQ
                    </span>
                    <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
