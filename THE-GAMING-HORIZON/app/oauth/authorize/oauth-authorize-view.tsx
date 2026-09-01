'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft, CheckSquare, Loader2, Lock, ShieldCheck, Square } from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { useAuth } from '@/components/providers/auth-provider'
import {
  OAUTH_SCOPES,
  OAUTH_SCOPE_LABELS,
  authorizeOAuthApp,
  getOAuthAppPublicInfo,
  isValidRedirectUri,
  type OAuthAppPublicInfo,
  type OAuthScope,
} from '@/lib/developer-apps'

type Status = 'loading' | 'invalid' | 'signin' | 'consent' | 'submitting' | 'denying' | 'error'

function buildRedirect(base: string, params: Record<string, string | undefined>): string {
  const url = new URL(base)
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value)
  }
  return url.toString()
}

export function OAuthAuthorizeView() {
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  const clientId = searchParams.get('client_id') || ''
  const redirectUri = searchParams.get('redirect_uri') || ''
  const responseType = searchParams.get('response_type') || 'code'
  const state = searchParams.get('state') || ''
  const codeChallenge = searchParams.get('code_challenge') || undefined
  const codeChallengeMethod = searchParams.get('code_challenge_method') || undefined
  const requestedScopes = useMemo(() => {
    const raw = (searchParams.get('scope') || '').split(/\s+/).filter(Boolean)
    return raw.filter((s): s is OAuthScope => (OAUTH_SCOPES as readonly string[]).includes(s))
  }, [searchParams])

  const [status, setStatus] = useState<Status>('loading')
  const [app, setApp] = useState<OAuthAppPublicInfo | null>(null)
  const [invalidReason, setInvalidReason] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true

    if (!clientId || !redirectUri) {
      setInvalidReason('This link is missing required information (client_id or redirect_uri).')
      setStatus('invalid')
      return
    }
    if (responseType !== 'code') {
      setInvalidReason(`Unsupported response_type "${responseType}" — only "code" is supported.`)
      setStatus('invalid')
      return
    }
    if (!isValidRedirectUri(redirectUri)) {
      setInvalidReason('The redirect_uri for this app is not a valid https:// address.')
      setStatus('invalid')
      return
    }

    getOAuthAppPublicInfo(clientId).then((info) => {
      if (!active) return
      if (!info) {
        setInvalidReason('This app could not be found. The developer may have deleted it.')
        setStatus('invalid')
        return
      }
      setApp(info)
      setStatus(authLoading ? 'loading' : user ? 'consent' : 'signin')
    })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, redirectUri, responseType])

  useEffect(() => {
    if (!app) return
    if (authLoading) {
      setStatus('loading')
    } else if (status !== 'invalid' && status !== 'submitting' && status !== 'denying' && status !== 'error') {
      setStatus(user ? 'consent' : 'signin')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, app])

  async function allow() {
    setStatus('submitting')
    const res = await authorizeOAuthApp({ clientId, redirectUri, scopes: requestedScopes, codeChallenge, codeChallengeMethod })
    if (res.ok && res.data) {
      window.location.href = buildRedirect(redirectUri, { code: res.data.code, state })
      return
    }
    setErrorMessage(res.error || 'This app could not be authorized.')
    setStatus('error')
  }

  function deny() {
    setStatus('denying')
    window.location.href = buildRedirect(redirectUri, { error: 'access_denied', state })
  }

  const signinNext = `/oauth/authorize?${searchParams.toString()}`

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="glass w-full max-w-md rounded-2xl p-6 sm:p-7"
      >
        {(status === 'loading') && (
          <div className="flex flex-col items-center gap-3 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Loading…
          </div>
        )}

        {status === 'invalid' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-red-500/10">
              <AlertTriangle className="size-6 text-red-400" />
            </span>
            <p className="text-sm font-semibold text-foreground">This link isn&apos;t valid</p>
            <p className="text-sm text-muted-foreground">{invalidReason}</p>
          </div>
        )}

        {status === 'signin' && app && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <AppBadge app={app} />
            <p className="text-sm text-muted-foreground">
              Sign in to your Gaming Horizon account to continue to <span className="font-medium text-foreground">{app.name}</span>.
            </p>
            <div className="flex w-full flex-col gap-2 pt-2">
              <GhButton href={`/signin?next=${encodeURIComponent(signinNext)}`} size="sm" magnetic={false} className="w-full justify-center">
                Sign in
              </GhButton>
              <GhButton href={`/signup?next=${encodeURIComponent(signinNext)}`} variant="glass" size="sm" magnetic={false} className="w-full justify-center">
                Create an account
              </GhButton>
            </div>
          </div>
        )}

        {(status === 'consent' || status === 'submitting' || status === 'denying' || status === 'error') && app && (
          <div>
            <div className="flex flex-col items-center gap-3 text-center">
              <AppBadge app={app} />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{app.name}</span> wants to connect to your Gaming Horizon
                account.
              </p>
            </div>

            <div className="mt-5 space-y-2 rounded-xl border border-border/70 bg-background/40 p-3.5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">This will allow {app.name} to:</p>
              {requestedScopes.length === 0 ? (
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckSquare className="mt-0.5 size-3.5 shrink-0 text-[rgb(var(--accent-1))]" /> Identify your Gaming Horizon account (no profile data).
                </p>
              ) : (
                requestedScopes.map((scope) => (
                  <p key={scope} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckSquare className="mt-0.5 size-3.5 shrink-0 text-[rgb(var(--accent-1))]" />
                    <span>
                      <span className="font-medium text-foreground">{OAUTH_SCOPE_LABELS[scope].label}</span> — {OAUTH_SCOPE_LABELS[scope].desc}
                    </span>
                  </p>
                ))
              )}
              {(searchParams.get('scope') || '').split(/\s+/).filter(Boolean).some((s) => !(OAUTH_SCOPES as readonly string[]).includes(s)) && (
                <p className="flex items-start gap-2 text-xs text-amber-400">
                  <Square className="mt-0.5 size-3.5 shrink-0" /> Some requested permissions aren&apos;t recognized and were ignored.
                </p>
              )}
            </div>

            {app.homepageUrl && (
              <p className="mt-3 truncate text-center text-[11px] text-muted-foreground/70">{app.homepageUrl}</p>
            )}

            {status === 'error' && (
              <p className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
                <AlertTriangle className="size-3.5 shrink-0" /> {errorMessage}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <GhButton
                onClick={allow}
                size="sm"
                magnetic={false}
                className="flex-1 justify-center"
                disabled={status === 'submitting' || status === 'denying'}
              >
                {status === 'submitting' ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                {status === 'submitting' ? 'Connecting…' : 'Allow'}
              </GhButton>
              <GhButton
                onClick={deny}
                variant="glass"
                size="sm"
                magnetic={false}
                className="flex-1 justify-center"
                disabled={status === 'submitting' || status === 'denying'}
              >
                {status === 'denying' ? <Loader2 className="size-4 animate-spin" /> : null}
                {status === 'denying' ? 'Returning…' : 'Deny'}
              </GhButton>
            </div>

            <p className="mt-4 flex items-start gap-1.5 text-[10px] leading-relaxed text-muted-foreground/70">
              <Lock className="mt-0.5 size-3 shrink-0" />
              {app.name}&apos;s developer — not Gaming Horizon — is responsible for how this app uses your data. You can
              revoke access anytime from your account settings.
            </p>
          </div>
        )}

        <a href="/" className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70 transition-colors hover:text-foreground">
          <ArrowLeft className="size-3" /> Back to Gaming Horizon
        </a>
      </motion.div>
    </div>
  )
}

function AppBadge({ app }: { app: OAuthAppPublicInfo }) {
  return (
    <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border/70 bg-background/40">
      {app.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={app.logo} alt="" className="size-full object-cover" />
      ) : (
        <span className="text-xl font-bold text-muted-foreground/60">{app.name.slice(0, 1).toUpperCase()}</span>
      )}
    </span>
  )
}
