'use client'

import { useState } from 'react'
import { Loader2, Mail, ShieldCheck } from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { createClient } from '@/lib/supabase/client'
import { EMAIL_RE } from '@/lib/services'

export function EmailChangeOtp({ initialEmail }: { initialEmail: string }) {
  const [currentEmail, setCurrentEmail] = useState(initialEmail)
  const [step, setStep] = useState<'idle' | 'verify'>('idle')
  const [newEmail, setNewEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function sendOtp() {
    setError(null)
    setMessage(null)
    const value = newEmail.trim()
    if (!EMAIL_RE.test(value)) {
      setError('Enter a valid email address.')
      return
    }
    if (value.toLowerCase() === currentEmail.toLowerCase()) {
      setError('That is already your current email address.')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      // updateUser({ email }) sends a verification code to the new address.
      // The account email only changes once that code is verified below.
      const { error: updateError } = await supabase.auth.updateUser({ email: value })
      if (updateError) {
        setError(updateError.message)
        return
      }
      setStep('verify')
      setMessage(`A verification code was sent to ${value}.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to send the verification code.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyAndChange() {
    setError(null)
    setMessage(null)
    if (!/^\d{4,10}$/.test(otp)) {
      setError('Enter the verification code sent to your new email.')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: newEmail.trim(),
        token: otp,
        type: 'email_change',
      })
      if (verifyError) {
        setError(verifyError.message)
        return
      }
      setCurrentEmail(newEmail.trim())
      setStep('idle')
      setOtp('')
      setNewEmail('')
      setMessage('Email address updated and verified.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to verify that code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-muted/10 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]"><Mail className="size-5" /></span>
        <div>
          <h2 className="font-heading text-xl font-semibold">Email address</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Current: <span className="font-semibold text-foreground">{currentEmail}</span>. We'll send a one-time code to any new address before it's saved.
          </p>
        </div>
      </div>

      {step === 'idle' ? (
        <div className="mt-5 grid gap-3 sm:max-w-sm">
          <label className="grid gap-1.5 text-xs font-medium">
            New email address
            <input
              type="email"
              autoComplete="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-[rgb(var(--accent-1)/0.6)]"
            />
          </label>
          <GhButton type="button" magnetic={false} disabled={loading || !newEmail} onClick={() => void sendOtp()}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            {loading ? 'Sending code…' : 'Send verification code'}
          </GhButton>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:max-w-sm">
          <label className="grid gap-1.5 text-xs font-medium">
            Verification code
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={10}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-[rgb(var(--accent-1)/0.6)]"
              placeholder="123456"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <GhButton type="button" magnetic={false} disabled={loading} onClick={() => void verifyAndChange()}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              {loading ? 'Verifying…' : 'Verify & save email'}
            </GhButton>
            <button type="button" className="rounded-xl border border-border px-4 py-2 text-sm" disabled={loading} onClick={() => void sendOtp()}>Send new code</button>
            <button
              type="button"
              className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              disabled={loading}
              onClick={() => { setStep('idle'); setOtp(''); setError(null); setMessage(null) }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && <p className="mt-3 text-xs text-emerald-500">{message}</p>}
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </section>
  )
}
