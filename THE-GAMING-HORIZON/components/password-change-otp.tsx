'use client'

import { useState } from 'react'
import { KeyRound, Loader2, ShieldCheck } from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { PasswordInput } from '@/components/ui/password-input'
import { PasswordSuggester } from '@/components/password-suggester'
import { createClient } from '@/lib/supabase/client'
import { sendPasswordResetOtp, verifyPasswordResetOtp } from '@/lib/auth/password-reset'
import { useNotifications } from '@/components/providers/notifications-provider'

export function PasswordChangeOtp({ email }: { email: string }) {
  const { notify } = useNotifications()
  const [step, setStep] = useState<'idle' | 'verify'>('idle')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function sendOtp() {
    setLoading(true); setError(null); setMessage(null)
    try {
      const supabase = createClient()
      // Use the password-reset (recovery) OTP here, not signInWithOtp. Sending a
      // sign-in OTP would email the "sign in" template and verify with
      // type: 'email', which is the wrong flow for changing a password.
      const { error } = await sendPasswordResetOtp(supabase, email)
      if (error) { setError(error.message); return }
      setStep('verify')
      setMessage(`A password reset code was sent to ${email}.`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to send the verification code.') }
    finally { setLoading(false) }
  }

  async function verifyAndChange() {
    setLoading(true); setError(null); setMessage(null)
    if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit code from your email.'); setLoading(false); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); setLoading(false); return }
    if (password !== confirm) { setError('Passwords do not match.'); setLoading(false); return }
    try {
      const supabase = createClient()
      const { error: verifyError } = await verifyPasswordResetOtp(supabase, email, otp)
      if (verifyError) { setError(verifyError.message); return }
      const { data: current } = await supabase.auth.getUser()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: { ...(current.user?.user_metadata ?? {}), has_password: true },
      })
      if (updateError) { setError(updateError.message); return }
      setStep('idle'); setOtp(''); setPassword(''); setConfirm('')
      setMessage('Password changed successfully. Your reset code was verified first.')
      notify({
        title: 'Password changed',
        body: `Your password for ${email} was updated after verifying the reset code sent to your inbox. If you didn't make this change, reset your password again right away and contact support so we can help secure your account.`,
        icon: 'security',
        toast: false,
      })
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to change your password.') }
    finally { setLoading(false) }
  }

  return (
    <section className="rounded-2xl border border-border bg-muted/10 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]"><KeyRound className="size-5" /></span>
        <div>
          <h2 className="font-heading text-xl font-semibold">Change password</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">We’ll send a one-time reset code to your account email first. Only after the code is verified can the password be changed.</p>
        </div>
      </div>
      {step === 'idle' ? (
        <GhButton type="button" className="mt-5" magnetic={false} disabled={loading || !email} onClick={() => void sendOtp()}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
          {loading ? 'Sending code…' : 'Send reset code'}
        </GhButton>
      ) : (
        <div className="mt-5 grid gap-4">
          <label className="grid gap-1.5 text-xs font-medium">6-digit verification code<input inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-[rgb(var(--accent-1)/0.6)]" placeholder="123456" /></label>
          <label className="grid gap-1.5 text-xs font-medium">New password<PasswordInput autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-[rgb(var(--accent-1)/0.6)]" /><PasswordSuggester onSelect={(value) => { setPassword(value); setConfirm(value) }} /></label>
          <label className="grid gap-1.5 text-xs font-medium">Confirm new password<PasswordInput autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-[rgb(var(--accent-1)/0.6)]" /></label>
          <div className="flex flex-wrap gap-2"><GhButton type="button" magnetic={false} disabled={loading} onClick={() => void verifyAndChange()}>{loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}{loading ? 'Verifying…' : 'Verify code & change password'}</GhButton><button type="button" className="rounded-xl border border-border px-4 py-2 text-sm" disabled={loading} onClick={() => void sendOtp()}>Send new code</button></div>
        </div>
      )}
      {message && <p className="mt-3 text-xs text-emerald-500">{message}</p>}
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </section>
  )
}
