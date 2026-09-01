// Backend-ready service layer.
// Every function is async and returns a typed Result so a real backend
// (Supabase, REST, etc.) can be dropped in later without touching callers.
// For now data is persisted to localStorage as a stand-in datastore.

export interface Result<T = void> {
  ok: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string>
}

/* ----------------------------- Data models ----------------------------- */
export interface LegalAcceptanceRecord {
  termsVersion: string
  privacyVersion: string
  acceptedAt: string
  consentSource: string
  identifier: string
}


export interface WaitlistEntry {
  id: string
  name: string
  email: string
  country: string
  genres: string[]
  browser: string
  platform: string
  discord?: string
  newsletter: boolean
  legalAcceptance?: LegalAcceptanceRecord
  createdAt: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  topic: string
  message: string
  legalAcceptance?: LegalAcceptanceRecord
  createdAt: string
}

export interface UserQuestion {
  id: string
  name: string
  email: string
  category: string
  question: string
  legalAcceptance?: LegalAcceptanceRecord
  createdAt: string
}

/* ------------------------------ Utilities ------------------------------ */

const KEYS = {
  waitlist: 'gh:waitlist',
  contact: 'gh:contact',
  questions: 'gh:questions',
  support: 'gh:support-tickets',
} as const

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[]
  } catch {
    return []
  }
}

function write<T>(key: string, rows: T[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(rows))
  } catch {
    /* ignore quota */
  }
}

// Simulate network latency so loading states are real.
function delay(ms = 700) {
  return new Promise((r) => setTimeout(r, ms))
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ------------------------------ Waitlist ------------------------------- */

export async function submitWaitlist(
  input: Omit<WaitlistEntry, 'id' | 'createdAt'>,
): Promise<Result<WaitlistEntry>> {
  const fieldErrors: Record<string, string> = {}
  if (!input.name?.trim()) fieldErrors.name = 'Please enter your name.'
  if (!EMAIL_RE.test(input.email || ''))
    fieldErrors.email = 'Enter a valid email address.'
  if (!input.country?.trim()) fieldErrors.country = 'Select your country.'
  if (!input.browser) fieldErrors.browser = 'Choose your preferred browser.'
  if (Object.keys(fieldErrors).length)
    return { ok: false, fieldErrors, error: 'Please fix the highlighted fields.' }

  await delay()

  const rows = read<WaitlistEntry>(KEYS.waitlist)
  if (rows.some((r) => r.email.toLowerCase() === input.email.toLowerCase()))
    return {
      ok: false,
      fieldErrors: { email: 'This email is already on the waitlist.' },
      error: 'You are already on the list.',
    }

  const entry: WaitlistEntry = {
    ...input,
    id: uid(),
    createdAt: new Date().toISOString(),
  }
  write(KEYS.waitlist, [entry, ...rows])
  return { ok: true, data: entry }
}

export function getWaitlistCount(): number {
  return read<WaitlistEntry>(KEYS.waitlist).length
}

/* ------------------------------- Contact ------------------------------- */

export async function submitContact(
  input: Omit<ContactMessage, 'id' | 'createdAt'>,
): Promise<Result<ContactMessage>> {
  const fieldErrors: Record<string, string> = {}
  if (!input.name?.trim()) fieldErrors.name = 'Please enter your name.'
  if (!EMAIL_RE.test(input.email || ''))
    fieldErrors.email = 'Enter a valid email address.'
  if (!input.message?.trim() || input.message.trim().length < 10)
    fieldErrors.message = 'Tell us a little more (10+ characters).'
  if (Object.keys(fieldErrors).length)
    return { ok: false, fieldErrors, error: 'Please fix the highlighted fields.' }

  await delay()
  const rows = read<ContactMessage>(KEYS.contact)
  const msg: ContactMessage = {
    ...input,
    id: uid(),
    createdAt: new Date().toISOString(),
  }
  write(KEYS.contact, [msg, ...rows])
  return { ok: true, data: msg }
}

/* --------------------------- User questions ---------------------------- */

export async function submitQuestion(
  input: Omit<UserQuestion, 'id' | 'createdAt'>,
): Promise<Result<UserQuestion>> {
  const fieldErrors: Record<string, string> = {}
  if (!input.name?.trim()) fieldErrors.name = 'Please enter your name.'
  if (!EMAIL_RE.test(input.email || ''))
    fieldErrors.email = 'Enter a valid email address.'
  if (!input.category?.trim()) fieldErrors.category = 'Pick a category.'
  if (!input.question?.trim() || input.question.trim().length < 10)
    fieldErrors.question = 'Ask a bit more (10+ characters).'
  if (Object.keys(fieldErrors).length)
    return { ok: false, fieldErrors, error: 'Please fix the highlighted fields.' }

  await delay()
  const rows = read<UserQuestion>(KEYS.questions)
  const q: UserQuestion = {
    ...input,
    id: uid(),
    createdAt: new Date().toISOString(),
  }
  write(KEYS.questions, [q, ...rows])
  return { ok: true, data: q }
}

export function getQuestionCount(): number {
  return read<UserQuestion>(KEYS.questions).length
}

/* ---------------------------- Support tickets --------------------------- */

export type TicketPriority = 'Low' | 'Normal' | 'High' | 'Urgent'
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved'

export interface TicketEvent {
  at: string
  label: string
  body?: string
}

export interface SupportTicket {
  id: string
  ref: string
  name: string
  email: string
  category: string
  priority: TicketPriority
  subject: string
  message: string
  status: TicketStatus
  legalAcceptance?: LegalAcceptanceRecord
  timeline: TicketEvent[]
  createdAt: string
  updatedAt: string
}

function ticketRef() {
  return `GH-${Math.floor(10000 + Math.random() * 89999)}`
}

export async function submitSupportTicket(
  input: Omit<SupportTicket, 'id' | 'ref' | 'status' | 'timeline' | 'createdAt' | 'updatedAt'>,
): Promise<Result<SupportTicket>> {
  const fieldErrors: Record<string, string> = {}
  if (!input.name?.trim()) fieldErrors.name = 'Please enter your name.'
  if (!EMAIL_RE.test(input.email || ''))
    fieldErrors.email = 'Enter a valid email address.'
  if (!input.subject?.trim()) fieldErrors.subject = 'Give your request a short subject.'
  if (!input.category?.trim()) fieldErrors.category = 'Pick a category.'
  if (!input.message?.trim() || input.message.trim().length < 15)
    fieldErrors.message = 'Add a bit more detail (15+ characters) so support can help.'
  if (Object.keys(fieldErrors).length)
    return { ok: false, fieldErrors, error: 'Please fix the highlighted fields.' }

  await delay()
  const now = new Date().toISOString()
  const rows = read<SupportTicket>(KEYS.support)
  const ticket: SupportTicket = {
    ...input,
    id: uid(),
    ref: ticketRef(),
    status: 'Open',
    timeline: [{ at: now, label: 'Ticket created', body: 'Your request was received and queued for the support team.' }],
    createdAt: now,
    updatedAt: now,
  }
  write(KEYS.support, [ticket, ...rows])
  return { ok: true, data: ticket }
}

export function getSupportTickets(email: string): SupportTicket[] {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return []
  return read<SupportTicket>(KEYS.support)
    .filter((t) => t.email.toLowerCase() === normalized)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function findSupportTicket(ref: string, email: string): SupportTicket | undefined {
  const normalizedRef = ref.trim().toUpperCase()
  const normalizedEmail = email.trim().toLowerCase()
  return read<SupportTicket>(KEYS.support).find(
    (t) => t.ref.toUpperCase() === normalizedRef && t.email.toLowerCase() === normalizedEmail,
  )
}

// Developer Portal apps (OAuth clients + API keys) used to live here as
// localStorage-backed mocks. They're now real, Supabase-backed — see
// lib/developer-apps.ts and supabase/migrations/0005_developer_apps_oauth.sql.

