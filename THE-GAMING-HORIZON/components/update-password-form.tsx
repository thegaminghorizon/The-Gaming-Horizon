'use client'

import { type FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Loader2 } from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { PasswordInput } from '@/components/ui/password-input'
import { PasswordSuggester } from '@/components/password-suggester'
import { PasswordRequirements, passwordMeetsRequirements } from '@/components/ui/password-requirements'
import { createClient } from '@/lib/supabase/client'
import { useNotifications } from '@/components/providers/notifications-provider'

export function UpdatePasswordForm() {
  const router = useRouter()
  const { notify } = useNotifications()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!passwordMeetsRequirements(password)) {
      setError('Password does not meet all requirements yet.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data: current } = await supabase.auth.getUser()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        // Setting a password here (via the reset flow) means the account now
        // has one, whether it started as password-based or email-OTP-only.
        data: { ...(current.user?.user_metadata ?? {}), has_password: true },
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      notify({
        title: 'Password updated',
        body: 'Your password was changed successfully via the reset link, and you can now sign in with the new one. If you did not request this reset, contact support right away so we can help secure your account.',
        icon: 'security',
      })
      router.replace('/')
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to update password.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass w-full max-w-md rounded-3xl p-8 sm:p-10">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[rgb(var(--accent-1)/0.12)]">
        <KeyRound className="size-5 text-[rgb(var(--accent-1))]" />
      </div>
      <h1 className="mt-5 font-heading text-2xl font-semibold">Choose a new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter a new password for your Gaming Horizon account.
      </p>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-1.5 text-xs font-medium text-foreground/80">
          New password
          <PasswordInput
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[rgb(var(--accent-1)/0.6)] focus:bg-muted/60"
          />
          <PasswordSuggester onSelect={(value) => { setPassword(value); setConfirmPassword(value) }} />
          <PasswordRequirements password={password} />
        </label>

        <label className="grid gap-1.5 text-xs font-medium text-foreground/80">
          Confirm new password
          <PasswordInput
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[rgb(var(--accent-1)/0.6)] focus:bg-muted/60"
          />
        </label>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <GhButton type="submit" magnetic={false} disabled={loading || !passwordMeetsRequirements(password)} className="w-full">
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? 'Updating password...' : 'Update password'}
        </GhButton>
      </div>
    </form>
  )
}
