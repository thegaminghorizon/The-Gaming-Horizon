'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Blocks, Loader2, ShieldOff } from 'lucide-react'
import { listConnectedApps, revokeConnectedApp, OAUTH_SCOPE_LABELS, type ConnectedApp, type OAuthScope } from '@/lib/developer-apps'

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.round(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.round(months / 12)}y ago`
}

function ConnectedAppRow({ app, onRevoked }: { app: ConnectedApp; onRevoked: (appId: string) => void }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  async function revoke() {
    setBusy(true)
    const res = await revokeConnectedApp(app.appId)
    setBusy(false)
    if (res.ok) onRevoked(app.appId)
  }

  return (
    <div className="rounded-xl border border-border/70 bg-background/40 p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-border/70 bg-background/60">
            {app.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={app.logo} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-muted-foreground/60">{app.name.slice(0, 1).toUpperCase()}</span>
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{app.name}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/70">
              Connected {relativeTime(app.connectedAt)}
              {app.lastUsedAt ? ` · last used ${relativeTime(app.lastUsedAt)}` : ''}
            </p>
            {app.scopes.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {app.scopes.map((s) => (
                  <span key={s} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {OAUTH_SCOPE_LABELS[s as OAuthScope]?.label || s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setConfirming((v) => !v)}
          className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
          aria-label={`Disconnect ${app.name}`}
        >
          <ShieldOff className="size-4" />
        </button>
      </div>
      <AnimatePresence>
        {confirming && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-2.5 text-xs">
              <span className="text-muted-foreground">Disconnect {app.name}? It will need your approval again next time.</span>
              <button type="button" onClick={revoke} disabled={busy} className="shrink-0 font-semibold text-red-400 hover:underline disabled:opacity-50">
                {busy ? 'Disconnecting…' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ConnectedAppsPanel() {
  const [apps, setApps] = useState<ConnectedApp[] | null>(null)

  useEffect(() => {
    let active = true
    listConnectedApps().then((rows) => {
      if (active) setApps(rows)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="rounded-2xl border border-border/70 bg-background/40 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Blocks className="size-4 text-[rgb(var(--accent-1))]" />
        <h2 className="text-sm font-semibold">Connected apps</h2>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Third-party apps you&apos;ve approved through Sign in with Gaming Horizon. Disconnecting one revokes its access
        immediately — it can't read your data again until you approve it fresh.
      </p>

      {apps === null ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Loading…
        </p>
      ) : apps.length === 0 ? (
        <p className="text-xs text-muted-foreground">No apps connected yet.</p>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {apps.map((app) => (
              <motion.div
                key={app.appId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
              >
                <ConnectedAppRow app={app} onRevoked={(id) => setApps((current) => current?.filter((a) => a.appId !== id) ?? null)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
