'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ShieldCheck,
  Settings2,
  Sparkles,
  KeyRound,
  Smartphone,
} from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { Logo } from '@/components/ui/logo'
import { Google, Discord, GitBranch } from '@/components/ui/brand-icons'
import { EMAIL_RE } from '@/lib/services'
import { LegalConsent, PreReleaseNotice } from '@/components/legal-consent'
import { HumanCheck } from '@/components/human-check'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { sendEmailOtp, verifyEmailOtp } from '@/lib/auth/email-otp'
import { verifySignupOtp, resendSignupOtp } from '@/lib/auth/signup-otp'
import { PasswordSuggester } from '@/components/password-suggester'
import { PasswordInput } from '@/components/ui/password-input'
import { PasswordRequirements, passwordMeetsRequirements } from '@/components/ui/password-requirements'
import {
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
} from '@/lib/auth/password-reset'

type View = 'form' | 'forgot'
type Status = 'idle' | 'loading' | 'done'
type EmailMethod = 'password' | 'otp'
type OAuthProvider = 'google' | 'discord' | 'github'

function SocialButton({
  icon: Icon,
  iconClassName,
  label,
  onClick,
  disabled = false,
}: {
  icon: (props: { className?: string }) => ReactNode
  iconClassName?: string
  label: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-11 items-center justify-center gap-2.5 rounded-xl border border-border-strong bg-background/55 px-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-[rgb(var(--accent-1)/0.5)] hover:bg-[rgb(var(--accent-1)/0.05)] disabled:pointer-events-none disabled:opacity-50"
    >
      <Icon className={['size-4 shrink-0', iconClassName].filter(Boolean).join(' ')} />
      {label}
    </button>
  )
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2.5 text-xs leading-5 text-red-300">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

function Field({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  id: string
  label: string
  type: string
  placeholder: string
  value?: string
  onChange?: (v: string) => void
  autoComplete?: string
}) {
  return (
    <div className="text-left">
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-foreground/80">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-border-strong bg-muted/40 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-[rgb(var(--accent-1)/0.6)] focus:bg-muted/60"
      />
    </div>
  )
}

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const isSignup = mode === 'signup'
  const router = useRouter()
  const supabaseConfigured = isSupabaseConfigured()
  const [supabase] = useState(() => (supabaseConfigured ? createClient() : null))
  const [view, setView] = useState<View>('form')
  const [status, setStatus] = useState<Status>('idle')
  const [signupOtp, setSignupOtp] = useState('')
  const [signupOtpBusy, setSignupOtpBusy] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [humanChecked, setHumanChecked] = useState(false)
  // Sign-up defaults to Email OTP (see below), so most accounts never get a
  // password set. Sign-in used to default to the Password tab regardless —
  // meaning a returning OTP-only user would land on a field they have no
  // value for, get "Invalid login credentials", and appear locked out of an
  // account that's actually fine. Defaulting both modes to the same method
  // keeps them in sync; the Password tab is still one click away.
  const [emailMethod, setEmailMethod] = useState<EmailMethod>('otp')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [resetOtp, setResetOtp] = useState('')
  const [resetOtpSent, setResetOtpSent] = useState(false)

  // /auth/callback, /auth/confirm, and /auth/reset-link all redirect back
  // here with ?error=<code> when something fails server-side (an expired or
  // already-used link, a lost PKCE verifier cookie, Supabase not configured,
  // etc.) — but until now nothing ever read that param, so the user just
  // landed back on a blank sign-in form with no explanation and a stray
  // "?error=..." sitting in the address bar. Surface it as a real message.
  const searchParams = useSearchParams()
  useEffect(() => {
    const code = searchParams.get('error')
    if (!code) return
    const messages: Record<string, string> = {
      config: 'Supabase is not configured yet. Add your project URL and publishable key to .env.local.',
      oauth: "That sign-in link didn't go through — it may have expired, already been used, or your browser blocked a cookie it needed mid-redirect. Please try again.",
      confirmation: 'That confirmation link is invalid or has expired. Request a new one and try again.',
      reset: 'That password reset link is invalid or has expired. Request a new one and try again.',
    }
    setError(messages[code] ?? 'Something went wrong completing sign-in. Please try again.')
    router.replace(isSignup ? '/signup' : '/signin')
  }, [searchParams, router, isSignup])

  function requireSupabase() {
    if (!supabase) {
      setError('Supabase is not configured yet. Add your project URL and publishable key to .env.local.')
      return null
    }
    return supabase
  }

  function requireHumanCheck() {
    if (!humanChecked) {
      setError('Please verify above that you are not a robot before continuing.')
      return false
    }
    return true
  }

  // The signup notification itself fires from /welcome (see
  // components/welcome-experience.tsx), not here — that's the one place
  // every signup path (email/password, email OTP, and OAuth) actually lands
  // on, since an OAuth redirect never returns to run this form's JS again.
  const goAfterAuth = () => {
    router.replace('/welcome')
    router.refresh()
  }

  const goHome = () => {
    // Sign-in can be reached from a page that needs the person back afterward
    // (most notably /oauth/authorize — see app/oauth/authorize — so a signed-out
    // visitor approving a third-party app isn't dropped on the homepage instead
    // of back at the consent screen). Only ever follow a same-site relative path
    // here: anything else (a full URL, a protocol-relative "//host/…") could be
    // used to bounce a signed-in session off-site, so those are ignored in favor
    // of the normal "/" home redirect.
    const next = searchParams.get('next')
    const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
    router.replace(safeNext)
    router.refresh()
  }

  const validateEmail = () => {
    if (!EMAIL_RE.test(email)) {
      setError('Enter a valid email address.')
      return false
    }
    if (isSignup && !name.trim()) {
      setError('Enter a display name.')
      return false
    }
    if (isSignup && !legalAccepted) {
      setError('Please accept the Terms of Service and acknowledge the Privacy Policy.')
      return false
    }
    return true
  }

  const handleEmailAuth = async () => {
    setError(null)
    if (!requireHumanCheck() || !validateEmail()) return
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    const client = requireSupabase()
    if (!client) return

    setStatus('loading')
    try {
      if (isSignup) {
        const { data, error: signupError } = await client.auth.signUp({
          email,
          password,
          options: {
            // has_password marks this account as password-based, so the account
            // page knows to offer "Change password" (OTP-only accounts don't get it).
            data: { display_name: name.trim(), onboarding_completed: false, has_password: true },
          },
        })
        if (signupError) {
          setError(signupError.message)
          setStatus('idle')
          return
        }
        if (!data.session) {
          setStatus('done')
          return
        }
        goAfterAuth()
        return
      }

      const { data: signinData, error: signinError } = await client.auth.signInWithPassword({ email, password })
      if (signinError) {
        setError(signinError.message)
        setStatus('idle')
        return
      }
      // Self-heal accounts created before has_password existed: a successful
      // password sign-in is proof the account has one, so backfill the flag.
      if (signinData.user && signinData.user.user_metadata?.has_password !== true) {
        void client.auth.updateUser({
          data: { ...signinData.user.user_metadata, has_password: true },
        })
      }
      goHome()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authentication failed. Please try again.')
      setStatus('idle')
    }
  }

  const handleOAuth = async (provider: OAuthProvider) => {
    setError(null)
    if (!requireHumanCheck()) return
    if (isSignup && !legalAccepted) {
      setError('Please accept the Terms of Service and acknowledge the Privacy Policy.')
      return
    }
    const client = requireSupabase()
    if (!client) return

    setStatus('loading')
    try {
      const { error: oauthError } = await client.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/welcome` },
      })
      if (oauthError) {
        setError(oauthError.message)
        setStatus('idle')
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to start social sign in.')
      setStatus('idle')
    }
  }

  const handleSendOtp = async () => {
    setError(null)
    if (!requireHumanCheck()) return
    if (!validateEmail()) return
    const client = requireSupabase()
    if (!client) return

    setStatus('loading')
    try {
      const { error: otpError } = await sendEmailOtp(
        client,
        email,
        isSignup,
        isSignup ? { display_name: name.trim(), onboarding_completed: false } : undefined,
      )
      if (otpError) {
        const message = otpError.message || ''
        if (isSignup && /signups? not allowed|signup.*disabled/i.test(message)) {
          setError('Email OTP sign-up is disabled in your Supabase project. In Supabase Dashboard, open Authentication → Providers and make sure Email authentication and new user sign-ups are enabled.')
        } else if (/rate limit|too many requests|60 seconds/i.test(message)) {
          setError('Please wait a moment before requesting another code. Supabase rate-limits OTP requests.')
        } else {
          setError(message || 'Unable to send the OTP.')
        }
        setStatus('idle')
        return
      }
      setStatus('idle')
      setOtp('')
      setOtpSent(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to send the OTP.')
      setStatus('idle')
    }
  }

  const handleVerifyOtp = async () => {
    setError(null)
    if (!/^\d{6,10}$/.test(otp)) {
      setError('Enter the verification code sent to your email.')
      return
    }
    const client = requireSupabase()
    if (!client) return

    setStatus('loading')
    try {
      const { error: verifyError } = await verifyEmailOtp(client, email, otp)
      if (verifyError) {
        setError(verifyError.message)
        setStatus('idle')
        return
      }
      if (isSignup) goAfterAuth()
      else goHome()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The verification code could not be accepted.')
      setStatus('idle')
    }
  }

  const handleVerifySignupOtp = async () => {
    setError(null)
    if (!/^\d{6,10}$/.test(signupOtp)) {
      setError('Enter the verification code sent to your email.')
      return
    }
    const client = requireSupabase()
    if (!client) return

    setSignupOtpBusy(true)
    try {
      const { error: verifyError } = await verifySignupOtp(client, email, signupOtp)
      if (verifyError) {
        setError(verifyError.message)
        setSignupOtpBusy(false)
        return
      }
      goAfterAuth()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The verification code could not be accepted.')
      setSignupOtpBusy(false)
    }
  }

  const handleResendSignupOtp = async () => {
    setError(null)
    const client = requireSupabase()
    if (!client) return

    setSignupOtpBusy(true)
    try {
      const { error: resendError } = await resendSignupOtp(client, email)
      if (resendError) setError(resendError.message)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to resend the code.')
    } finally {
      setSignupOtpBusy(false)
    }
  }

  const handlePasswordReset = async () => {
    setError(null)
    if (!requireHumanCheck()) return
    if (!EMAIL_RE.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    const client = requireSupabase()
    if (!client) return

    if (resetOtpSent) {
      if (!/^\d{6,10}$/.test(resetOtp)) {
        setError('Enter the verification code from your email.')
        return
      }

      setStatus('loading')
      try {
        const { error: verifyError } = await verifyPasswordResetOtp(client, email, resetOtp)
        if (verifyError) {
          setError(verifyError.message)
          setStatus('idle')
          return
        }
        router.replace('/update-password')
        router.refresh()
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'The reset code could not be accepted.')
        setStatus('idle')
      }
      return
    }

    setStatus('loading')
    try {
      const { error: resetError } = await sendPasswordResetOtp(client, email)

      if (resetError) {
        setError(resetError.message)
        setStatus('idle')
        return
      }

      setResetOtpSent(true)
      setStatus('idle')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to send the reset code.')
      setStatus('idle')
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void handleEmailAuth()
  }

  const doneCopy = {
    title: 'Enter your verification code',
    body: 'We sent a 6-digit code to your email to confirm your Gaming Horizon account. Enter it below to continue.',
  } as const

  return (
    <main className="relative flex min-h-[calc(100vh-var(--nav-h,0px))] items-center justify-center overflow-hidden px-4 py-24 sm:px-6 lg:py-28">
      {/* The auth screen owns its entrance animation. The site footer is intentionally
          not part of this route so its scroll-reveal animation cannot start the login experience. */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <motion.div
          className="absolute left-[8%] top-[14%] size-64 rounded-full bg-[rgb(var(--accent-1)/0.10)] blur-3xl"
          animate={{ x: [0, 28, 0], y: [0, -18, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[8%] right-[7%] size-72 rounded-full bg-[rgb(var(--accent-2)/0.08)] blur-3xl"
          animate={{ x: [0, -22, 0], y: [0, 16, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.62, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-6xl"
      >
        <div className="grid overflow-hidden rounded-[2rem] border border-border/70 bg-background/60 shadow-[0_35px_100px_-45px_rgb(var(--accent-1)/0.5)] backdrop-blur-xl lg:grid-cols-[0.88fr_1.12fr]">
          <section className="relative hidden min-h-[620px] overflow-hidden bg-[radial-gradient(circle_at_30%_25%,rgb(var(--accent-1)/0.18),transparent_48%),radial-gradient(circle_at_80%_80%,rgb(var(--accent-2)/0.10),transparent_46%)] p-10 lg:flex lg:flex-col lg:justify-between xl:p-12">
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-r from-transparent to-background/80" />
            <div className="relative z-10">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" /> Back to home
              </Link>
              <Logo className="mt-10 h-10 w-auto" />
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(var(--accent-1))]">
                {isSignup ? 'Player identity' : 'Player access'}
              </p>
              <h2 className="mt-3 max-w-md font-heading text-4xl font-semibold leading-tight xl:text-5xl">
                {isSignup ? 'Build the profile behind your next gaming session.' : 'Your Gaming Horizon starts here.'}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
                {isSignup
                  ? 'Create your identity, choose your preferences, and shape a home browser gaming experience that feels like yours.'
                  : 'Sign in once and carry your identity, preferences, profile, and progress through the Gaming Horizon experience.'}
              </p>
            </div>

            <div className="relative z-10 grid gap-3">
              {[
                ['One identity', 'A persistent player profile across the experience.'],
                ['Flexible access', 'Password, email OTP, and social providers.'],
                ['Your controls', 'Customize your profile and taskbar whenever you want.'],
              ].map(([title, body]) => (
                <div key={title} className="flex gap-3 rounded-2xl border border-border/70 bg-background/45 p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.10)] text-[rgb(var(--accent-1))]">
                    <Sparkles className="size-4" />
                  </span>
                  <div><p className="text-sm font-semibold">{title}</p><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{body}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="min-w-0 p-6 sm:p-9 lg:p-10 xl:p-12">
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" /> Home
              </Link>
              <Logo className="h-8 w-auto" />
            </div>

            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--accent-1))]">
                {view === 'forgot' ? 'Account recovery' : isSignup ? 'Create account' : 'Welcome back'}
              </p>
              <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                {view === 'forgot' ? 'Reset your password' : isSignup ? 'Create your Gaming Horizon account' : 'Sign in to Gaming Horizon'}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {view === 'forgot'
                  ? "Enter your email and we'll send a one-time verification code."
                  : isSignup
                    ? 'Create your player identity and then shape your Gaming Horizon experience.'
                    : 'Choose how you want to access your player identity.'}
              </p>
            </div>

            {!supabaseConfigured && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-relaxed text-foreground/80">
                <Settings2 className="mt-0.5 size-4 shrink-0 text-amber-300" />
                <span>Authentication code is ready, but Supabase still needs your project URL and publishable key in <code className="font-semibold">.env.local</code>.</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {status === 'done' ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  className="flex min-h-[380px] flex-col items-center justify-center gap-4 text-center"
                >
                  <span className="flex size-16 items-center justify-center rounded-2xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                    <KeyRound className="size-7" />
                  </span>
                  <p className="font-heading text-xl font-semibold">{doneCopy.title}</p>
                  <p className="max-w-md text-sm leading-6 text-muted-foreground">{doneCopy.body}</p>

                  <div className="grid w-full max-w-xs gap-3">
                    <input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={10}
                      value={signupOtp}
                      onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      disabled={signupOtpBusy}
                      className="w-full rounded-xl border border-border-strong bg-muted/40 px-4 py-3 text-center text-lg tracking-[0.35em] outline-none focus:border-[rgb(var(--accent-1)/0.6)] disabled:opacity-50"
                    />
                    <GhButton
                      type="button"
                      disabled={signupOtpBusy}
                      className="w-full"
                      magnetic={false}
                      onClick={() => void handleVerifySignupOtp()}
                    >
                      {signupOtpBusy ? <Loader2 className="size-4 animate-spin" /> : <><Check className="size-4" />Verify & continue</>}
                    </GhButton>
                    <button
                      type="button"
                      disabled={signupOtpBusy}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                      onClick={() => void handleResendSignupOtp()}
                    >
                      Didn't receive it? Send a new code
                    </button>
                    {error && <ErrorAlert message={error} />}
                  </div>

                  <button
                    onClick={() => { setStatus('idle'); setView('form'); setError(null); setSignupOtp(''); setSignupOtpBusy(false) }}
                    className="mt-2 text-sm font-medium text-[rgb(var(--accent-1))] hover:underline"
                  >
                    Back to sign in
                  </button>
                </motion.div>
              ) : view === 'forgot' ? (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  className="grid max-w-lg gap-4"
                >
                  <p className="rounded-xl border border-[rgb(var(--accent-1)/0.22)] bg-[rgb(var(--accent-1)/0.05)] px-3 py-2.5 text-xs leading-5 text-muted-foreground">
                    <span className="font-semibold text-foreground">Email OTP:</span> you'll receive a one-time verification code, not a reset link.
                  </p>
                  <Field
                    id="reset-email"
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(value) => {
                      setEmail(value)
                      setResetOtpSent(false)
                      setResetOtp('')
                    }}
                    autoComplete="email"
                  />
                  <HumanCheck checked={humanChecked} onChange={setHumanChecked} id="forgot-human-check" />
                  {resetOtpSent && (
                    <div className="grid gap-3">
                      <p className="rounded-xl border border-[rgb(var(--accent-1)/0.25)] bg-[rgb(var(--accent-1)/0.06)] px-3 py-2.5 text-xs leading-5 text-muted-foreground">
                        Enter the recovery code sent to <span className="font-semibold text-foreground">{email}</span>.
                      </p>
                      <input
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={10}
                        value={resetOtp}
                        onChange={(event) => setResetOtp(event.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full rounded-xl border border-border-strong bg-muted/40 px-4 py-3 text-center text-lg tracking-[0.35em] outline-none focus:border-[rgb(var(--accent-1)/0.6)]"
                      />
                    </div>
                  )}
                  {error && <ErrorAlert message={error} />}
                  <GhButton className="w-full" magnetic={false} disabled={status === 'loading'} onClick={() => void handlePasswordReset()}>
                    {status === 'loading'
                      ? <Loader2 className="size-4 animate-spin" />
                      : resetOtpSent
                        ? <><Check className="size-4" />Verify code & continue</>
                        : <><ShieldCheck className="size-4" />Send reset code</>}
                  </GhButton>
                  {resetOtpSent && (
                    <button type="button" onClick={() => void handlePasswordReset()} className="text-xs text-muted-foreground hover:text-foreground">
                      Didn't receive it? Send a new code
                    </button>
                  )}
                  <button onClick={() => { setView('form'); setError(null); setResetOtpSent(false); setResetOtp('') }} className="text-sm text-muted-foreground hover:text-foreground">
                    Back to sign in
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                >
                  {isSignup && (
                    <div className="mb-5 space-y-3">
                      <PreReleaseNotice />
                      <LegalConsent checked={legalAccepted} onChange={setLegalAccepted} source="account-creation" id="signup-legal" />
                    </div>
                  )}

                  <div className="grid gap-3">
                    <div className="grid grid-cols-3 gap-2">
                      <SocialButton icon={Google} label="Google" disabled={status === 'loading'} onClick={() => void handleOAuth('google')} />
                      <SocialButton icon={Discord} label="Discord" disabled={status === 'loading'} onClick={() => void handleOAuth('discord')} />
                      <SocialButton icon={GitBranch} iconClassName="text-foreground" label="GitHub" disabled={status === 'loading'} onClick={() => void handleOAuth('github')} />
                    </div>

                    <div className="my-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                      <span className="h-px flex-1 bg-border-strong" /> or continue with email <span className="h-px flex-1 bg-border-strong" />
                    </div>

                    <div className="grid grid-cols-2 gap-1 rounded-xl border border-border-strong bg-muted/30 p-1">
                      {([
                        ['password', 'Password', KeyRound],
                        ['otp', 'Email OTP', ShieldCheck],
                      ] as const).map(([value, label, Icon]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => { setEmailMethod(value); setOtpSent(false); setError(null); setOtp('') }}
                          className={value === emailMethod
                            ? 'rounded-lg border border-[rgb(var(--accent-1)/0.5)] bg-[rgb(var(--accent-1)/0.16)] px-2 py-2.5 text-xs font-semibold text-foreground shadow-[0_1px_0_rgb(255_255_255_/_0.06)_inset,0_4px_14px_-6px_rgb(var(--accent-1)/0.5)] transition-all'
                            : 'rounded-lg border border-transparent px-2 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-background/40 hover:text-foreground'}
                        >
                          <span className="inline-flex items-center justify-center gap-1.5"><Icon className="size-3.5" />{label}</span>
                        </button>
                      ))}
                    </div>

                    <form onSubmit={onSubmit} className="grid gap-3">
                      {isSignup && <Field id="name" label="Display name" type="text" placeholder="PlayerOne" value={name} onChange={setName} autoComplete="nickname" />}
                      <Field id="email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} autoComplete="email" />

                      {emailMethod === 'password' ? (
                        <>
                          <div>
                            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-foreground/80">Password</label>
                            <PasswordInput id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isSignup ? 'new-password' : 'current-password'} className="w-full rounded-xl border border-border-strong bg-muted/40 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-[rgb(var(--accent-1)/0.6)] focus:bg-muted/60" />
                            {!isSignup && (
                              <div className="mt-2 text-right">
                                <button type="button" onClick={() => { setView('forgot'); setError(null) }} className="text-xs text-[rgb(var(--accent-1))] hover:underline">Forgot password?</button>
                              </div>
                            )}
                            {isSignup && <PasswordSuggester onSelect={setPassword} />}
                            {isSignup && <PasswordRequirements password={password} />}
                          </div>

                          <HumanCheck checked={humanChecked} onChange={(checked) => { setHumanChecked(checked); setError(null) }} id={isSignup ? 'signup-human-check' : 'signin-human-check'} />

                          <GhButton type="submit" disabled={status === 'loading' || (isSignup && !passwordMeetsRequirements(password))} className="mt-2 w-full" magnetic={false}>
                            {status === 'loading' ? <Loader2 className="size-4 animate-spin" /> : <><ArrowRight className="size-4" />{isSignup ? 'Create account' : 'Sign in'}</>}
                          </GhButton>
                        </>
                      ) : !otpSent ? (
                        <div className="grid gap-3">
                          <p className="rounded-xl border border-[rgb(var(--accent-1)/0.22)] bg-[rgb(var(--accent-1)/0.05)] px-3 py-2.5 text-xs leading-5 text-muted-foreground">
                            <span className="font-semibold text-foreground">Email OTP:</span> you will receive a one-time verification code, not a sign-in link.
                          </p>

                          <HumanCheck checked={humanChecked} onChange={(checked) => { setHumanChecked(checked); setError(null) }} id={isSignup ? 'signup-human-check' : 'signin-human-check'} />

                          <GhButton type="button" disabled={status === 'loading'} className="w-full" magnetic={false} onClick={() => void handleSendOtp()}>
                            {status === 'loading' ? <Loader2 className="size-4 animate-spin" /> : <><Smartphone className="size-4" />Send email OTP</>}
                          </GhButton>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          <p className="rounded-xl border border-[rgb(var(--accent-1)/0.25)] bg-[rgb(var(--accent-1)/0.06)] px-3 py-2.5 text-xs text-muted-foreground">
                            Enter the verification code sent to <span className="font-semibold text-foreground">{email}</span>.
                          </p>
                          <input inputMode="numeric" autoComplete="one-time-code" maxLength={10} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="123456" className="w-full rounded-xl border border-border-strong bg-muted/40 px-4 py-3 text-center text-lg tracking-[0.35em] outline-none focus:border-[rgb(var(--accent-1)/0.6)]" />

                          <HumanCheck checked={humanChecked} onChange={(checked) => { setHumanChecked(checked); setError(null) }} id={isSignup ? 'signup-human-check' : 'signin-human-check'} />

                          <GhButton type="button" disabled={status === 'loading'} className="w-full" magnetic={false} onClick={() => void handleVerifyOtp()}>
                            {status === 'loading' ? <Loader2 className="size-4 animate-spin" /> : <><Check className="size-4" />Verify code & continue</>}
                          </GhButton>
                          <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => void handleSendOtp()}>Didn't receive it? Send a new code</button>
                        </div>
                      )}

                      {error && <ErrorAlert message={error} />}
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {view === 'form' && status !== 'done' && (
              <p className="mt-7 text-center text-sm text-muted-foreground">
                {isSignup ? 'Already have an account?' : 'New to Gaming Horizon?'}{' '}
                <Link href={isSignup ? '/signin' : '/signup'} className="font-medium text-[rgb(var(--accent-1))] underline-offset-4 hover:underline">
                  {isSignup ? 'Sign in' : 'Create account'}
                </Link>
              </p>
            )}

            <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-border/60 pt-5 text-center text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5 text-[rgb(var(--accent-1))]" />
              Secure, encrypted sign-in
            </div>
          </section>
        </div>
      </motion.div>
    </main>
  )
}
