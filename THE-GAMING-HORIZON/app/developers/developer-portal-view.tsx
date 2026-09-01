'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  CheckSquare,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  Gauge,
  GitCommitHorizontal,
  Image as ImageIcon,
  Key,
  KeyRound,
  Layers,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Square,
  Terminal,
  Trash2,
  Webhook,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { GhButton, Pill, Reveal } from '@/components/ui/primitives'
import { useAuth } from '@/components/providers/auth-provider'
import { useNotifications } from '@/components/providers/notifications-provider'
import { compressImage } from '@/lib/images'
import {
  OAUTH_SCOPES,
  OAUTH_SCOPE_LABELS,
  createDeveloperApp,
  deleteDeveloperApp,
  isValidOptionalUrl,
  isValidRedirectUri,
  listAppEvents,
  listDeveloperApps,
  regenerateApiKey,
  regenerateClientSecret,
  requestLiveKeyAccess,
  updateDeveloperApp,
  type AppEvent,
  type AppInput,
  type DeveloperApp,
  type OAuthScope,
} from '@/lib/developer-apps'
import { cn } from '@/lib/utils'

/* ------------------------------- Reference data ------------------------------- */

const TABS = [
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'quickstart', label: 'Quickstart', icon: Rocket },
  { id: 'oauth', label: 'OAuth', icon: KeyRound },
  { id: 'reference', label: 'API Reference', icon: BookOpen },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'keys', label: 'Keys & Apps', icon: Key },
  { id: 'changelog', label: 'Changelog', icon: GitCommitHorizontal },
] as const

type TabId = (typeof TABS)[number]['id']

const FEATURES = [
  { icon: Layers, title: 'REST API', desc: 'Predictable, resource-based endpoints for games, profiles, progress and leaderboards.' },
  { icon: Webhook, title: 'Webhooks', desc: 'Get notified in real time when players finish onboarding, unlock achievements or complete runs.' },
  { icon: ShieldCheck, title: 'Scoped sandbox keys', desc: 'Build and test safely against sandbox data before requesting production access.' },
  { icon: Gauge, title: 'Generous rate limits', desc: 'Sensible defaults for indie teams, with headroom to request an increase later.' },
]

interface Endpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  desc: string
}

const ENDPOINT_GROUPS: { title: string; endpoints: Endpoint[] }[] = [
  {
    title: 'Games',
    endpoints: [
      { method: 'GET', path: '/v1/games', desc: 'List catalog games, with filters for genre, platform and beta availability.' },
      { method: 'GET', path: '/v1/games/{id}', desc: 'Fetch a single game record, including compatibility metadata.' },
    ],
  },
  {
    title: 'Player profiles',
    endpoints: [
      { method: 'GET', path: '/v1/players/{id}', desc: 'Read a public player profile — display name, tag and stats summary.' },
      { method: 'PATCH', path: '/v1/players/{id}/progress', desc: 'Push progress updates for a player within your app scope.' },
    ],
  },
  {
    title: 'Leaderboards & achievements',
    endpoints: [
      { method: 'GET', path: '/v1/leaderboards/{gameId}', desc: 'Read ranked entries for a game leaderboard.' },
      { method: 'POST', path: '/v1/leaderboards/{gameId}/entries', desc: 'Submit a new score entry on behalf of an authenticated player.' },
      { method: 'POST', path: '/v1/achievements/unlock', desc: 'Unlock an achievement for a player and trigger the relevant webhook.' },
    ],
  },
  {
    title: 'Apps',
    endpoints: [
      { method: 'GET', path: '/v1/apps/{id}/usage', desc: 'Read current-period request volume and rate-limit headroom for an app.' },
      { method: 'DELETE', path: '/v1/apps/{id}/keys/{keyId}', desc: 'Revoke a specific API key immediately.' },
    ],
  },
]

const methodStyle: Record<Endpoint['method'], string> = {
  GET: 'bg-[rgb(52_211_153/0.16)] text-[rgb(110_231_183)]',
  POST: 'bg-[rgb(var(--accent-1)/0.16)] text-[rgb(var(--accent-1))]',
  PATCH: 'bg-[rgb(251_191_36/0.16)] text-[rgb(253_224_71)]',
  DELETE: 'bg-[rgb(248_113_113/0.16)] text-[rgb(252_165_165)]',
}

const WEBHOOK_EVENTS = [
  { event: 'player.onboarding_completed', desc: 'Fires once a player finishes first-run onboarding inside your app.' },
  { event: 'player.progress_updated', desc: 'Fires when progress you pushed via the API is confirmed and stored.' },
  { event: 'achievement.unlocked', desc: 'Fires the moment an achievement unlock is confirmed for a player.' },
  { event: 'leaderboard.entry_created', desc: 'Fires when a new leaderboard entry is accepted and ranked.' },
  { event: 'app.key_regenerated', desc: 'Fires when a key on your app is regenerated, for audit logging.' },
]

const RATE_LIMITS = [
  { tier: 'Sandbox', limit: '60 requests / min', burst: '120 burst', note: 'Default for every new app.' },
  { tier: 'Production (pending)', limit: '600 requests / min', burst: '1,200 burst', note: 'Unlocked after a production access request during Beta.' },
]

const CHANGELOG = [
  { date: 'Coming with Public Beta', title: 'Production API access opens', desc: 'Live keys move from waitlist to self-serve, with per-app usage dashboards.' },
  { date: 'Coming with Public Beta', title: 'Achievements & leaderboards endpoints', desc: 'Write endpoints for scores and achievement unlocks go live alongside the beta.' },
  { date: 'Now', title: 'Developer Portal opens in sandbox mode', desc: 'Create apps, generate sandbox keys and read the full API reference ahead of launch.' },
]

const QUICKSTART_CURL = `curl https://api.gaminghorizon.dev/v1/games \\
  -H "Authorization: Bearer gh_test_xxxxxxxxxxxxxxxxxxxx"`

const QUICKSTART_JS = `const res = await fetch("https://api.gaminghorizon.dev/v1/games", {
  headers: {
    Authorization: \`Bearer \${process.env.GH_API_KEY}\`,
  },
})

const { data: games } = await res.json()`

const WEBHOOK_PAYLOAD = `{
  "event": "achievement.unlocked",
  "app_id": "app_8f2c1d",
  "player_id": "plyr_9a31e0",
  "data": {
    "achievement_id": "first_win",
    "game_id": "neon-drift"
  },
  "created_at": "2026-08-17T10:15:00Z"
}`

const OAUTH_AUTHORIZE_EXAMPLE = `/oauth/authorize
  ?client_id=gh_client_xxxxxxxxxxxxxxxx
  &redirect_uri=https://yourapp.com/callback
  &response_type=code
  &scope=profile:read email:read
  &state=<random_value>`

const OAUTH_TOKEN_EXAMPLE = `curl -X POST https://gaminghorizon.dev/api/oauth/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "code=<code_from_redirect>" \\
  -d "redirect_uri=https://yourapp.com/callback" \\
  -d "client_id=gh_client_xxxxxxxxxxxxxxxx" \\
  -d "client_secret=gh_secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`

const OAUTH_TOKEN_RESPONSE_EXAMPLE = `{
  "access_token": "gh_at_…",
  "refresh_token": "gh_rt_…",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "profile:read email:read"
}`

const OAUTH_USERINFO_EXAMPLE = `curl https://gaminghorizon.dev/api/oauth/userinfo \\
  -H "Authorization: Bearer gh_at_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`

const OAUTH_REFRESH_EXAMPLE = `curl -X POST https://gaminghorizon.dev/api/oauth/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=refresh_token" \\
  -d "refresh_token=<refresh_token>" \\
  -d "client_id=gh_client_xxxxxxxxxxxxxxxx" \\
  -d "client_secret=gh_secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`

/* ------------------------------- Small pieces ------------------------------- */

// Short relative timestamp ("3h ago", "2d ago") for key/app metadata —
// friendlier than a raw ISO date and doesn't need a formatting library.
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const minutes = Math.round((Date.now() - then) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.round(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.round(months / 12)}y ago`
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/70 bg-[#0b0c10]">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">{lang || 'shell'}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-white/85">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Sparkles; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {active && (
        <motion.span
          layoutId="dev-portal-tab"
          className="absolute inset-0 rounded-xl bg-[rgb(var(--accent-1)/0.12)] ring-1 ring-[rgb(var(--accent-1)/0.4)]"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
      <Icon className="relative size-4" />
      <span className="relative">{label}</span>
    </button>
  )
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: typeof Sparkles; children: ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-[rgb(var(--accent-1))]" /> {title}
      </p>
      {children}
    </div>
  )
}

/* ------------------------------- Tabs ------------------------------- */

function OverviewTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="What you can build" icon={Sparkles}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The Gaming Horizon API lets you read the game catalog, sync player progress, submit leaderboard
          scores and unlock achievements from your own app or bot. It is in sandbox mode during pre-launch —
          every request runs against sandbox data so you can build with confidence before Public Beta.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/40 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                <f.icon className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{f.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{f.desc}</span>
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 sm:grid-cols-2">
        <SectionCard title="Rate limits" icon={Gauge}>
          <div className="space-y-3">
            {RATE_LIMITS.map((r) => (
              <div key={r.tier} className="rounded-xl border border-border/70 bg-background/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{r.tier}</span>
                  <span className="font-mono text-xs text-[rgb(var(--accent-1))]">{r.limit}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.burst} · {r.note}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Support for builders" icon={ShieldCheck}>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
              Full API reference and webhook catalog on this page.
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
              Sandbox keys generated instantly, no approval needed.
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
              Stuck on something? Open a ticket from the Support Center.
            </li>
          </ul>
          <Link href="/support" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[rgb(var(--accent-1))] hover:underline">
            Get developer support <ArrowRight className="size-3.5" />
          </Link>
        </SectionCard>
      </div>
    </div>
  )
}

function QuickstartTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="1. Create an app and grab a sandbox key" icon={Key}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Head to the <span className="font-medium text-foreground">Keys &amp; Apps</span> tab, sign in and create
          an app. A sandbox key (<code className="rounded bg-muted px-1.5 py-0.5 text-xs">gh_test_…</code>) is generated
          automatically.
        </p>
      </SectionCard>
      <SectionCard title="2. Call the API" icon={Terminal}>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">Authenticate with a bearer token on every request.</p>
        <CodeBlock code={QUICKSTART_CURL} lang="cURL" />
      </SectionCard>
      <SectionCard title="3. Use it from your app" icon={Code2}>
        <CodeBlock code={QUICKSTART_JS} lang="JavaScript" />
      </SectionCard>
      <SectionCard title="4. Listen for events" icon={Webhook}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Add a webhook URL on your app to receive real-time events like achievement unlocks — see the
          <span className="font-medium text-foreground"> Webhooks</span> tab for the full payload shape.
        </p>
      </SectionCard>
    </div>
  )
}

function ApiReferenceTab() {
  return (
    <div className="space-y-6">
      {ENDPOINT_GROUPS.map((group) => (
        <SectionCard key={group.title} title={group.title} icon={BookOpen}>
          <div className="divide-y divide-border/60">
            {group.endpoints.map((ep) => (
              <div key={ep.path} className="flex flex-wrap items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className={cn('shrink-0 rounded-md px-2 py-1 font-mono text-[11px] font-semibold', methodStyle[ep.method])}>
                  {ep.method}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="break-all font-mono text-sm text-foreground">{ep.path}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{ep.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ))}
      <p className="text-center text-xs text-muted-foreground">
        Full request/response schemas and errors publish alongside Public Beta. This reference reflects the sandbox surface today.
      </p>
    </div>
  )
}

function WebhooksTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="Event catalog" icon={Radio}>
        <div className="divide-y divide-border/60">
          {WEBHOOK_EVENTS.map((w) => (
            <div key={w.event} className="py-3 first:pt-0 last:pb-0">
              <p className="font-mono text-sm text-[rgb(var(--accent-1))]">{w.event}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{w.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Sample payload" icon={Webhook}>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          Every webhook POSTs a JSON body like this to the URL configured on your app.
        </p>
        <CodeBlock code={WEBHOOK_PAYLOAD} lang="JSON" />
      </SectionCard>
    </div>
  )
}

function OAuthTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="How it works" icon={KeyRound}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Gaming Horizon supports standard OAuth 2.0 authorization-code flow (with optional PKCE),
          so players can approve your app once and you get a token instead of ever handling their
          password. Create an app in <span className="font-medium text-foreground">Keys &amp; Apps</span> to
          get a client ID and secret, register your redirect URI, and pick the scopes you need.
        </p>
        <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2"><span className="font-mono text-xs text-[rgb(var(--accent-1))]">1.</span> Send the player to your authorize URL. They sign in (if needed) and approve your app.</li>
          <li className="flex gap-2"><span className="font-mono text-xs text-[rgb(var(--accent-1))]">2.</span> They&apos;re redirected back to your redirect URI with a one-time <code className="rounded bg-muted px-1 py-0.5 text-xs">code</code>.</li>
          <li className="flex gap-2"><span className="font-mono text-xs text-[rgb(var(--accent-1))]">3.</span> Your backend exchanges that code (plus your client secret) for an access + refresh token.</li>
          <li className="flex gap-2"><span className="font-mono text-xs text-[rgb(var(--accent-1))]">4.</span> Call the userinfo endpoint with the access token to read whatever scopes were granted.</li>
        </ol>
      </SectionCard>

      <SectionCard title="1. Send the player to authorize" icon={ExternalLink}>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">response_type</code> is always{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">code</code>. <code className="rounded bg-muted px-1.5 py-0.5 text-xs">scope</code> is
          space-separated. <code className="rounded bg-muted px-1.5 py-0.5 text-xs">state</code> is echoed back
          verbatim on redirect — always verify it matches what you sent, to prevent CSRF. For
          public clients (mobile/SPA), add <code className="rounded bg-muted px-1.5 py-0.5 text-xs">code_challenge</code> and{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">code_challenge_method=S256</code> (PKCE).
        </p>
        <CodeBlock code={OAUTH_AUTHORIZE_EXAMPLE} lang="URL" />
      </SectionCard>

      <SectionCard title="2. Exchange the code for a token" icon={Key}>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          POST from your backend only — this is the one request that includes your client secret.
          If you used PKCE, include the original <code className="rounded bg-muted px-1.5 py-0.5 text-xs">code_verifier</code> instead
          of relying on the secret alone.
        </p>
        <CodeBlock code={OAUTH_TOKEN_EXAMPLE} lang="cURL" />
        <p className="mb-2 mt-4 text-sm leading-relaxed text-muted-foreground">Response:</p>
        <CodeBlock code={OAUTH_TOKEN_RESPONSE_EXAMPLE} lang="JSON" />
      </SectionCard>

      <SectionCard title="3. Read the player's data" icon={ShieldCheck}>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          Returns only the fields covered by scopes the player actually granted, plus{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">sub</code> (their player ID) always.
        </p>
        <CodeBlock code={OAUTH_USERINFO_EXAMPLE} lang="cURL" />
      </SectionCard>

      <SectionCard title="4. Refresh when the access token expires" icon={RefreshCw}>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          Access tokens last 1 hour. Refresh tokens last 180 days and rotate on every use — store
          the new one each time, the old one stops working immediately.
        </p>
        <CodeBlock code={OAUTH_REFRESH_EXAMPLE} lang="cURL" />
      </SectionCard>

      <SectionCard title="Scopes" icon={CheckSquare}>
        <div className="divide-y divide-border/60">
          {OAUTH_SCOPES.map((scope) => (
            <div key={scope} className="flex flex-wrap items-start gap-3 py-3 first:pt-0 last:pb-0">
              <code className="shrink-0 rounded-md bg-[rgb(var(--accent-1)/0.12)] px-2 py-1 font-mono text-[11px] font-semibold text-[rgb(var(--accent-1))]">
                {scope}
              </code>
              <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">{OAUTH_SCOPE_LABELS[scope].desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Errors" icon={Lock}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The token endpoint returns standard OAuth error codes —{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">invalid_client</code>,{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">invalid_grant</code>,{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">invalid_request</code>, and{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">unsupported_grant_type</code> — each with an{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">error_description</code> explaining what went wrong.
          The userinfo endpoint returns <code className="rounded bg-muted px-1.5 py-0.5 text-xs">invalid_token</code> for
          an expired, revoked, or unrecognized access token.
        </p>
      </SectionCard>
    </div>
  )
}


function ChangelogTab() {
  return (
    <SectionCard title="Platform changelog" icon={GitCommitHorizontal}>
      <div className="space-y-5">
        {CHANGELOG.map((c, i) => (
          <div key={c.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex size-2.5 shrink-0 rounded-full bg-[rgb(var(--accent-1))]" />
              {i < CHANGELOG.length - 1 && <span className="mt-1 w-px flex-1 bg-border/70" />}
            </div>
            <div className="pb-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.date}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{c.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

/* ------------------------------- Keys & Apps ------------------------------- */

function EventLabel(event: string): string {
  const labels: Record<string, string> = {
    app_created: 'App created',
    secret_regenerated: 'Client secret regenerated',
    api_key_regenerated: 'API key regenerated',
    authorized: 'A player approved this app',
    token_issued: 'Access token issued',
    token_refreshed: 'Access token refreshed',
    token_revoked: 'Access revoked',
    userinfo_accessed: 'Profile data was read',
  }
  return labels[event] || event
}

function EventsFeed({ appId }: { appId: string }) {
  const [events, setEvents] = useState<AppEvent[] | null>(null)

  useEffect(() => {
    let active = true
    listAppEvents(appId).then((rows) => {
      if (active) setEvents(rows)
    })
    return () => {
      active = false
    }
  }, [appId])

  if (events === null) {
    return (
      <p className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" /> Loading activity…
      </p>
    )
  }
  if (events.length === 0) {
    return <p className="py-1 text-xs text-muted-foreground">No activity yet — this fills in once your app is used.</p>
  }
  return (
    <div className="space-y-2.5">
      {events.slice(0, 8).map((e, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          <Activity className="mt-0.5 size-3 shrink-0 text-[rgb(var(--accent-1))]" />
          <span className="text-muted-foreground">
            {EventLabel(e.event)}
            <span className="ml-1.5 text-muted-foreground/60">· {relativeTime(e.createdAt)}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

// Non-secret copyable value (Client ID) — always visible, never masked, never regenerated.
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="rounded-xl border border-border/70 bg-background/40 p-3">
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-[11px] font-semibold uppercase text-muted-foreground">{label}</span>
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{value}</code>
        <button type="button" onClick={copy} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground" aria-label={`Copy ${label}`}>
          {copied ? <Check className="size-3.5 text-[rgb(var(--accent-1))]" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </div>
  )
}

// Masked secret (client secret, sandbox/live API key) — shown in full only once,
// right after creation or regeneration, then permanently masked to its last 4 chars.
function SecretRow({
  label,
  last4,
  initialValue,
  onRegenerate,
  confirmMessage,
}: {
  label: string
  last4: string
  initialValue?: string
  onRegenerate: () => Promise<{ ok: boolean; value?: string; error?: string }>
  confirmMessage: string
}) {
  const [revealed, setRevealed] = useState<string | null>(initialValue ?? null)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const { notify } = useNotifications()

  const masked = `${'•'.repeat(28)}${last4}`
  const displayValue = revealed ?? masked

  async function copy() {
    try {
      await navigator.clipboard.writeText(displayValue)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  async function regenerate() {
    setBusy(true)
    const res = await onRegenerate()
    setBusy(false)
    setConfirming(false)
    if (res.ok && res.value) {
      setRevealed(res.value)
    } else if (!res.ok) {
      notify({ title: `Could not regenerate ${label.toLowerCase()}`, body: res.error || 'Please try again.', icon: 'error', toast: false })
    }
  }

  return (
    <div className="rounded-xl border border-border/70 bg-background/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="shrink-0 text-[11px] font-semibold uppercase text-muted-foreground">{label}</span>
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{displayValue}</code>
        <button type="button" onClick={copy} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground" aria-label={`Copy ${label}`}>
          {copied ? <Check className="size-3.5 text-[rgb(var(--accent-1))]" /> : <Copy className="size-3.5" />}
        </button>
        <button type="button" onClick={() => setConfirming((v) => !v)} disabled={busy} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50" aria-label={`Regenerate ${label}`}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
        </button>
      </div>
      {revealed && (
        <p className="mt-1.5 flex items-center gap-1 pl-0.5 text-[10px] font-medium text-amber-400">
          <Lock className="size-2.5" /> Shown once — copy it now, it won&apos;t be shown again.
        </p>
      )}
      <AnimatePresence>
        {confirming && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs">
              <span className="text-muted-foreground">{confirmMessage}</span>
              <button type="button" onClick={regenerate} className="shrink-0 font-semibold text-amber-400 hover:underline">
                Confirm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ScopesPicker({ value, onChange }: { value: OAuthScope[]; onChange: (scopes: OAuthScope[]) => void }) {
  function toggle(scope: OAuthScope) {
    onChange(value.includes(scope) ? value.filter((s) => s !== scope) : [...value, scope])
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {OAUTH_SCOPES.map((scope) => {
        const active = value.includes(scope)
        return (
          <button
            key={scope}
            type="button"
            onClick={() => toggle(scope)}
            aria-pressed={active}
            className={cn(
              'flex items-start gap-2.5 rounded-xl border p-3 text-left text-xs transition-colors',
              active ? 'border-[rgb(var(--accent-1)/0.5)] bg-[rgb(var(--accent-1)/0.08)]' : 'border-border/70 bg-background/40 hover:border-border',
            )}
          >
            {active ? (
              <CheckSquare className="mt-0.5 size-4 shrink-0 text-[rgb(var(--accent-1))]" />
            ) : (
              <Square className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            )}
            <span>
              <span className="block font-semibold text-foreground">{OAUTH_SCOPE_LABELS[scope].label}</span>
              <span className="mt-0.5 block text-muted-foreground">{OAUTH_SCOPE_LABELS[scope].desc}</span>
              <span className="mt-1 block font-mono text-[10px] text-muted-foreground/70">{scope}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function RedirectUrisField({ value, onChange, error }: { value: string[]; onChange: (uris: string[]) => void; error?: string }) {
  function update(i: number, next: string) {
    const copy = [...value]
    copy[i] = next
    onChange(copy)
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }
  const inputCls =
    'w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-[rgb(var(--accent-1)/0.6)]'

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium">Redirect URIs</label>
      <div className="space-y-2">
        {value.map((uri, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={uri}
              onChange={(e) => update(i, e.target.value)}
              placeholder="https://yourapp.com/callback"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="shrink-0 rounded-xl border border-border/70 p-2.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
              aria-label="Remove redirect URI"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...value, ''])}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--accent-1))] hover:underline"
      >
        <Plus className="size-3.5" /> Add redirect URI
      </button>
      <p className="mt-1 text-[11px] text-muted-foreground/70">Must be https:// (http://localhost is fine for local testing).</p>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

function LogoUploader({ value, onChange }: { value: string; onChange: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError('')
    setBusy(true)
    try {
      onChange(await compressImage(file, 512, 0.85))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That image could not be used.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium">App logo</label>
      <div className="flex items-center gap-3">
        <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border/70 bg-background/40">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-5 text-muted-foreground/60" />
          )}
        </span>
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/60 disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <ImageIcon className="size-3.5" />} {value ? 'Change' : 'Upload'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                Remove
              </button>
            )}
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
    </div>
  )
}

// Shared by create + edit — a single rich form covering branding, redirect
// URIs, webhook, and OAuth scopes.
function AppForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: Partial<AppInput>
  onSubmit: (input: AppInput) => Promise<{ ok: boolean; error?: string }>
  onCancel: () => void
  submitLabel: string
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [logo, setLogo] = useState(initial?.logo ?? '')
  const [homepageUrl, setHomepageUrl] = useState(initial?.homepageUrl ?? '')
  const [privacyUrl, setPrivacyUrl] = useState(initial?.privacyUrl ?? '')
  const [tosUrl, setTosUrl] = useState(initial?.tosUrl ?? '')
  const [redirectUris, setRedirectUris] = useState<string[]>(initial?.redirectUris?.length ? initial.redirectUris : [''])
  const [webhookUrl, setWebhookUrl] = useState(initial?.webhookUrl ?? '')
  const [scopes, setScopes] = useState<OAuthScope[]>(initial?.scopes ?? [])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const inputCls =
    'w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-[rgb(var(--accent-1)/0.6)]'

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 3) nextErrors.name = 'Name your app (3+ characters).'
    const cleanedRedirects = redirectUris.map((u) => u.trim()).filter(Boolean)
    for (const uri of cleanedRedirects) {
      if (!isValidRedirectUri(uri)) {
        nextErrors.redirectUris = `"${uri}" must start with https:// (http://localhost is OK for testing).`
        break
      }
    }
    if (!isValidOptionalUrl(homepageUrl)) nextErrors.homepageUrl = 'Enter a full URL, starting with https://.'
    if (!isValidOptionalUrl(privacyUrl)) nextErrors.privacyUrl = 'Enter a full URL, starting with https://.'
    if (!isValidOptionalUrl(tosUrl)) nextErrors.tosUrl = 'Enter a full URL, starting with https://.'
    if (!isValidOptionalUrl(webhookUrl)) nextErrors.webhookUrl = 'Enter a full URL, starting with https://.'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setLoading(true)
    const res = await onSubmit({
      name: name.trim(),
      description: description.trim(),
      logo: logo || undefined,
      homepageUrl: homepageUrl.trim() || undefined,
      privacyUrl: privacyUrl.trim() || undefined,
      tosUrl: tosUrl.trim() || undefined,
      redirectUris: cleanedRedirects,
      webhookUrl: webhookUrl.trim() || undefined,
      scopes,
    })
    setLoading(false)
    if (!res.ok) setErrors({ form: res.error || 'Something went wrong. Please try again.' })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <LogoUploader value={logo} onChange={setLogo} />
      <div>
        <label className="mb-1.5 block text-xs font-medium" htmlFor="app-name">App name</label>
        <input id="app-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="My Companion Bot" />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium" htmlFor="app-desc">Description</label>
        <input id="app-desc" value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} placeholder="What does this app do?" />
      </div>
      <div className="grid gap-3.5 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium">Homepage URL</label>
          <input value={homepageUrl} onChange={(e) => setHomepageUrl(e.target.value)} className={inputCls} placeholder="https://yourapp.com" />
          {errors.homepageUrl && <p className="mt-1 text-xs text-red-400">{errors.homepageUrl}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium">Privacy policy URL</label>
          <input value={privacyUrl} onChange={(e) => setPrivacyUrl(e.target.value)} className={inputCls} placeholder="https://yourapp.com/privacy" />
          {errors.privacyUrl && <p className="mt-1 text-xs text-red-400">{errors.privacyUrl}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium">Terms of Service URL</label>
          <input value={tosUrl} onChange={(e) => setTosUrl(e.target.value)} className={inputCls} placeholder="https://yourapp.com/terms" />
          {errors.tosUrl && <p className="mt-1 text-xs text-red-400">{errors.tosUrl}</p>}
        </div>
      </div>
      <RedirectUrisField value={redirectUris} onChange={setRedirectUris} error={errors.redirectUris} />
      <div>
        <label className="mb-1.5 block text-xs font-medium">Webhook URL</label>
        <input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className={inputCls} placeholder="https://yourapp.com/webhooks/gh" />
        {errors.webhookUrl && <p className="mt-1 text-xs text-red-400">{errors.webhookUrl}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium">OAuth scopes</label>
        <ScopesPicker value={scopes} onChange={setScopes} />
      </div>
      {errors.form && <p className="text-xs text-red-400">{errors.form}</p>}
      <div className="flex gap-2 pt-1">
        <GhButton type="submit" size="sm" magnetic={false} className="flex-1" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} {submitLabel}
        </GhButton>
        <GhButton type="button" variant="glass" size="sm" magnetic={false} onClick={onCancel}>
          <X className="size-4" /> Cancel
        </GhButton>
      </div>
    </form>
  )
}

function AppCard({
  app,
  reveal,
  onChange,
}: {
  app: DeveloperApp
  reveal?: { clientSecret: string; sandboxApiKey: string }
  onChange: (app: DeveloperApp | null) => void
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [requestingLive, setRequestingLive] = useState(false)
  const { notify } = useNotifications()

  async function addLiveKey() {
    setRequestingLive(true)
    const res = await requestLiveKeyAccess(app.id)
    setRequestingLive(false)
    if (res.ok && res.data) onChange({ ...app, liveKeyRequestedAt: res.data.liveKeyRequestedAt })
  }

  async function remove() {
    setDeleting(true)
    const res = await deleteDeveloperApp(app.id)
    setDeleting(false)
    if (res.ok) onChange(null)
    else notify({ title: 'Could not delete app', body: res.error || 'Please try again.', icon: 'error', toast: false })
  }

  function testFlow() {
    if (!app.redirectUris.length || typeof window === 'undefined') return
    const url = new URL('/oauth/authorize', window.location.origin)
    url.searchParams.set('client_id', app.clientId)
    url.searchParams.set('redirect_uri', app.redirectUris[0])
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', app.scopes.join(' '))
    url.searchParams.set('state', 'preview')
    window.open(url.toString(), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border/70 bg-background/40">
            {app.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={app.logo} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-muted-foreground/60">{app.name.slice(0, 1).toUpperCase()}</span>
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{app.name}</p>
            {app.description && <p className="mt-0.5 text-xs text-muted-foreground">{app.description}</p>}
            <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground/70">
              <Clock className="size-2.5" /> Created {relativeTime(app.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            aria-pressed={editing}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              editing ? 'bg-[rgb(var(--accent-1)/0.14)] text-[rgb(var(--accent-1))]' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
            aria-label={editing ? 'Close edit form' : 'Edit app'}
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete((v) => !v)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
            aria-label="Delete app"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-4 border-t border-border/60 pt-4">
              <AppForm
                initial={app}
                submitLabel="Save changes"
                onCancel={() => setEditing(false)}
                onSubmit={async (input) => {
                  const res = await updateDeveloperApp(app.id, input)
                  if (res.ok && res.data) {
                    onChange(res.data)
                    setEditing(false)
                  }
                  return res
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmingDelete && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs">
              <span className="text-muted-foreground">Delete “{app.name}” and revoke every key and token? This cannot be undone.</span>
              <button type="button" onClick={remove} disabled={deleting} className="shrink-0 font-semibold text-red-400 hover:underline disabled:opacity-50">
                {deleting ? 'Deleting…' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!editing && (
        <>
          <div className="mt-4 space-y-2">
            <CopyRow label="Client ID" value={app.clientId} />
            <SecretRow
              label="Client secret"
              last4={app.clientSecretLast4}
              initialValue={reveal?.clientSecret}
              confirmMessage="Regenerate the client secret? Anything using the old one stops working immediately."
              onRegenerate={async () => {
                const res = await regenerateClientSecret(app.id)
                return res.ok && res.data ? { ok: true, value: res.data.clientSecret } : { ok: false, error: res.error }
              }}
            />
            <SecretRow
              label="Sandbox API key"
              last4={app.sandboxApiKeyLast4}
              initialValue={reveal?.sandboxApiKey}
              confirmMessage="Regenerate the sandbox key? Anything using the old one stops working immediately."
              onRegenerate={async () => {
                const res = await regenerateApiKey(app.id, 'sandbox')
                return res.ok && res.data ? { ok: true, value: res.data.apiKey } : { ok: false, error: res.error }
              }}
            />
            {!app.liveApiKeyLast4 &&
              (app.liveKeyRequestedAt ? (
                <div className="flex items-start gap-2 rounded-xl border border-border/70 bg-background/40 px-3 py-2.5 text-xs text-muted-foreground">
                  <Clock className="mt-0.5 size-3.5 shrink-0 text-[rgb(var(--accent-1))]" />
                  <span>
                    Live key requested {relativeTime(app.liveKeyRequestedAt)} — waitlisted until Public Beta. We’ll email you when production access opens.
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={addLiveKey}
                  disabled={requestingLive}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/70 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[rgb(var(--accent-1)/0.5)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {requestingLive ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                  {requestingLive ? 'Requesting…' : 'Request a live key (waitlisted until Beta)'}
                </button>
              ))}
          </div>

          {(app.scopes.length > 0 || app.redirectUris.length > 0 || app.webhookUrl) && (
            <div className="mt-4 space-y-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              {app.scopes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {app.scopes.map((s) => (
                    <span key={s} className="rounded-md bg-[rgb(var(--accent-1)/0.1)] px-2 py-0.5 font-mono text-[10px] text-[rgb(var(--accent-1))]">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {app.redirectUris.map((uri) => (
                <p key={uri} className="truncate">
                  Redirect: <span className="font-mono text-foreground/80">{uri}</span>
                </p>
              ))}
              {app.webhookUrl && (
                <p className="truncate">
                  Webhook: <span className="font-mono text-foreground/80">{app.webhookUrl}</span>
                </p>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
            <button
              type="button"
              onClick={testFlow}
              disabled={!app.redirectUris.length}
              title={app.redirectUris.length ? "Open the consent screen with this app's own settings" : 'Add a redirect URI first'}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ExternalLink className="size-3.5" /> Test OAuth flow
            </button>
            <button
              type="button"
              onClick={() => setShowActivity((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/60"
            >
              <Activity className="size-3.5" /> {showActivity ? 'Hide activity' : 'Recent activity'}
            </button>
          </div>

          <AnimatePresence>
            {showActivity && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-3 border-t border-border/60 pt-3">
                  <EventsFeed appId={app.id} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

function CreateAppCard({ onCreated }: { onCreated: (app: DeveloperApp, reveal: { clientSecret: string; sandboxApiKey: string }) => void }) {
  const [open, setOpen] = useState(false)
  const { notify } = useNotifications()

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgb(var(--accent-1)/0.4)] bg-[rgb(var(--accent-1)/0.05)] py-4 text-sm font-medium text-[rgb(var(--accent-1))] transition-colors hover:bg-[rgb(var(--accent-1)/0.1)]"
      >
        <Plus className="size-5" /> New app
      </button>
    )
  }

  return (
    <div className="glass rounded-2xl p-5">
      <p className="mb-4 text-sm font-semibold">New app</p>
      <AppForm
        submitLabel="Create app"
        onCancel={() => setOpen(false)}
        onSubmit={async (input) => {
          const res = await createDeveloperApp(input)
          if (res.ok && res.data) {
            onCreated(res.data.app, { clientSecret: res.data.clientSecret, sandboxApiKey: res.data.sandboxApiKey })
            setOpen(false)
            notify({
              title: 'App created',
              body: `${res.data.app.name} is ready. Copy the client secret and sandbox key now — they won't be shown again.`,
              icon: 'success',
              toast: false,
            })
          }
          return res
        }}
      />
    </div>
  )
}

function KeysTab() {
  const { user, displayName, loading } = useAuth()
  const [apps, setApps] = useState<DeveloperApp[] | null>(null)
  const [reveals, setReveals] = useState<Record<string, { clientSecret: string; sandboxApiKey: string }>>({})

  useEffect(() => {
    if (!user) {
      setApps(null)
      return
    }
    let active = true
    listDeveloperApps().then((rows) => {
      if (active) setApps(rows)
    })
    return () => {
      active = false
    }
  }, [user])

  function handleChange(updated: DeveloperApp | null, id?: string) {
    setApps((current) => {
      if (!current) return current
      if (!updated) return current.filter((a) => a.id !== id)
      const exists = current.some((a) => a.id === updated.id)
      return exists ? current.map((a) => (a.id === updated.id ? updated : a)) : current
    })
  }

  function handleCreated(app: DeveloperApp, reveal: { clientSecret: string; sandboxApiKey: string }) {
    setApps((current) => [app, ...(current ?? [])])
    setReveals((current) => ({ ...current, [app.id]: reveal }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading…
      </div>
    )
  }

  if (!user) {
    return (
      <SectionCard title="Sign in to manage apps" icon={Lock}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Apps, OAuth credentials and API keys are tied to your Gaming Horizon account so you can revoke access if a
          secret ever leaks. Sign in (or create a free account) to create your first app in seconds.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <GhButton href="/signin" size="sm" magnetic={false}>Sign in</GhButton>
          <GhButton href="/signup" variant="glass" size="sm" magnetic={false}>Create account</GhButton>
        </div>
      </SectionCard>
    )
  }

  if (apps === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading your apps…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionCard title={`Signed in as ${displayName || user.email}`} icon={ShieldCheck}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Apps you create here are scoped to <span className="font-medium text-foreground">your account</span>. Every
          secret below is stored on our end only as a hash — client secrets, API keys and OAuth tokens are shown to
          you in full exactly once, right after they&apos;re generated.
        </p>
      </SectionCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence initial={false}>
          {apps.map((app, i) => (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ duration: 0.32, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <AppCard app={app} reveal={reveals[app.id]} onChange={(updated) => handleChange(updated, app.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
        <CreateAppCard onCreated={handleCreated} />
      </div>
    </div>
  )
}


/* ------------------------------- Main view ------------------------------- */

export function DeveloperPortalView() {
  const [tab, setTab] = useState<TabId>('overview')

  return (
    <>
      <PageHeader
        eyebrow="Developer Platform"
        title={
          <>
            Build on <span className="text-gradient">Gaming Horizon</span>
          </>
        }
        subtitle="Sandbox API access, webhooks and documentation for teams building companion apps, bots and integrations ahead of Public Beta."
      >
        <Pill>
          <Terminal className="size-3.5 text-[rgb(var(--accent-1))]" />
          Sandbox is open now
        </Pill>
      </PageHeader>

      <div className="mx-auto max-w-5xl px-4 pb-16">
        <Reveal>
          <div className="glass sticky top-[calc(var(--banner-h,0px)+var(--nav-h,64px)+0.75rem)] z-20 mb-8 flex gap-1 overflow-x-auto rounded-2xl p-1.5">
            {TABS.map((t) => (
              <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} icon={t.icon} label={t.label} />
            ))}
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'overview' && <OverviewTab />}
            {tab === 'quickstart' && <QuickstartTab />}
            {tab === 'oauth' && <OAuthTab />}
            {tab === 'reference' && <ApiReferenceTab />}
            {tab === 'webhooks' && <WebhooksTab />}
            {tab === 'keys' && <KeysTab />}
            {tab === 'changelog' && <ChangelogTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
