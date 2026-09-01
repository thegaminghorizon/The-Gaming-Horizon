'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bell, Blocks, Heart, ShieldCheck, UserRound } from 'lucide-react'
import { ProfileEditor, type ProfileEditorProps } from '@/components/profile-editor'
import { NotificationsPanel } from '@/components/notifications-panel'
import { AccountSupportPanel } from '@/components/account-support-panel'
import { SupportAdminPanel } from '@/components/support-admin-panel'
import { ConnectedAppsPanel } from '@/components/connected-apps-panel'
import { useAuth } from '@/components/providers/auth-provider'
import { amIAdmin } from '@/lib/support-contributions'

type Tab = 'edit' | 'notifications' | 'apps' | 'support' | 'support-admin'

const TABS: Array<{ value: Tab; label: string; icon: (props: { className?: string }) => ReactNode }> = [
  { value: 'edit', label: 'Edit account', icon: UserRound },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'apps', label: 'Connected Apps', icon: Blocks },
  { value: 'support', label: 'Support Us', icon: Heart },
]

export function AccountTabs(props: ProfileEditorProps) {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  // Checked against the database (public.admins via the am_i_admin() RPC),
  // not trusted from anything client-side — this only controls whether the
  // tab is *shown*. Supabase's row-level security is what actually stops a
  // non-admin from reading or verifying other people's contributions even
  // if they force this tab open.
  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }
    let cancelled = false
    amIAdmin().then((result) => {
      if (!cancelled) setIsAdmin(result)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  const tabs = isAdmin
    ? [...TABS, { value: 'support-admin' as Tab, label: 'Verify Supporters', icon: ShieldCheck }]
    : TABS

  const [tab, setTab] = useState<Tab>(() => {
    const requested = searchParams.get('tab')
    return requested === 'notifications' || requested === 'apps' || requested === 'support' ? requested : 'edit'
  })

  // Lets the "You have unread notifications" popup (and anywhere else) link
  // straight into the Notifications tab via /account?tab=notifications,
  // instead of always landing on Edit account. Same idea for
  // /account?tab=support from the footer/homepage Support Us CTAs, and
  // /account?tab=apps from an OAuth consent screen's "manage this later" link.
  useEffect(() => {
    const requested = searchParams.get('tab')
    if (requested === 'notifications' || requested === 'apps' || requested === 'support') setTab(requested)
  }, [searchParams])

  return (
    <div className="mt-8">
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted/30 p-1 sm:inline-grid sm:w-auto sm:auto-cols-max sm:grid-flow-col">
        {tabs.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={value === tab
              ? 'flex items-center justify-center gap-1.5 rounded-lg bg-background px-4 py-2.5 text-sm font-semibold shadow-sm'
              : 'flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground'}
            aria-current={value === tab}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'edit' && <ProfileEditor {...props} />}
      {tab === 'notifications' && <NotificationsPanel />}
      {tab === 'apps' && <ConnectedAppsPanel />}
      {tab === 'support' && <AccountSupportPanel />}
      {tab === 'support-admin' && isAdmin && <SupportAdminPanel />}
    </div>
  )
}
