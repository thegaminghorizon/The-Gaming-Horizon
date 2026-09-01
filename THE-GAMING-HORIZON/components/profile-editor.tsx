'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, KeyRound, Loader2, Save, UserRound } from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { useAuth, DEFAULT_TASKBAR_PREFERENCES, type TaskbarPreferences } from '@/components/providers/auth-provider'
import { NAV_LINKS } from '@/lib/data'
import { PasswordChangeOtp } from '@/components/password-change-otp'
import { EmailChangeOtp } from '@/components/email-change-otp'
import { AvatarPicker, type AvatarPickerHandle } from '@/components/avatar-picker'
import type { AvatarAnimation } from '@/components/ui/avatar-frame'

const PLATFORMS = ['Browser / Web','PC','PlayStation','Xbox','Nintendo','Mobile','Cloud gaming','Other']
const GENRES = ['Action','Adventure','Battle Royale','Casual','Co-op','FPS','Puzzle','Racing','RPG','Simulation','Sports','Strategy','Other']
const PLAY_STYLES = ['Casual','Competitive','Co-op','Explorer','Creator / Builder']
const inputClass = 'w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-[rgb(var(--accent-1)/0.65)] focus:ring-2 focus:ring-[rgb(var(--accent-1)/0.12)]'

export interface ProfileEditorProps {
  email: string
  initialDisplayName: string
  initialGamerTag: string
  initialBio: string
  initialFavoritePlatform: string
  initialFavoriteGenre: string
  initialPlayStyle: string
  initialAvatarDataUrl: string
  initialAvatarAnimation?: AvatarAnimation
  initialTaskbarPreferences?: TaskbarPreferences
  hasPassword: boolean
  /** The provider the account actually authenticated with — 'discord', 'google', 'github', or 'email'. */
  authProvider?: string
}

const PROVIDER_LABELS: Record<string, string> = {
  discord: 'Discord',
  google: 'Google',
  github: 'GitHub',
  email: 'email OTP',
}

function providerLabel(provider?: string) {
  if (!provider) return 'email OTP'
  return PROVIDER_LABELS[provider] ?? provider.charAt(0).toUpperCase() + provider.slice(1)
}

function initialsFrom(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  if (!parts.length) return 'GH'
  return parts.map((part) => part[0]?.toUpperCase() || '').join('').slice(0, 2)
}

export function ProfileEditor(props: ProfileEditorProps) {
  const { email, initialDisplayName, initialGamerTag, initialBio, initialFavoritePlatform, initialFavoriteGenre, initialPlayStyle, initialAvatarDataUrl, initialAvatarAnimation, initialTaskbarPreferences, hasPassword, authProvider } = props
  const { saveProfile } = useAuth()
  const avatarPickerRef = useRef<AvatarPickerHandle>(null)
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [gamerTag, setGamerTag] = useState(initialGamerTag)
  const [bio, setBio] = useState(initialBio)
  const [favoritePlatform, setFavoritePlatform] = useState(initialFavoritePlatform)
  const [favoriteGenre, setFavoriteGenre] = useState(initialFavoriteGenre)
  const [playStyle, setPlayStyle] = useState(initialPlayStyle)
  const [avatar, setAvatar] = useState(initialAvatarDataUrl)
  const [avatarAnimation, setAvatarAnimation] = useState<AvatarAnimation>(initialAvatarAnimation ?? 'none')
  const [taskbar, setTaskbar] = useState<TaskbarPreferences>({ ...DEFAULT_TASKBAR_PREFERENCES, ...initialTaskbarPreferences })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [savingTaskbar, setSavingTaskbar] = useState(false)
  const [taskbarSaved, setTaskbarSaved] = useState(false)
  const previewLabel = displayName.trim() || gamerTag.trim() || email.split('@')[0] || 'Player'
  const previewInitials = useMemo(() => initialsFrom(previewLabel), [previewLabel])

  function toggleLink(href: string) {
    setTaskbar(current => ({ ...current, visibleLinks: current.visibleLinks.includes(href) ? current.visibleLinks.filter(x => x !== href) : [...current.visibleLinks, href] }))
  }

  async function handleSaveTaskbar() {
    if (savingTaskbar) return
    setError(null)
    setTaskbarSaved(false)
    setSavingTaskbar(true)
    const result = await saveProfile({
      display_name: displayName.trim() || email.split('@')[0] || 'Player',
      gamer_tag: gamerTag.trim().replace(/^@+/, ''),
      bio: bio.trim(),
      favorite_platform: favoritePlatform,
      favorite_genre: favoriteGenre,
      play_style: playStyle,
      avatar_data_url: avatar,
      avatar_animation: avatarAnimation,
      taskbar_preferences: taskbar,
    })
    setSavingTaskbar(false)
    if (!result.ok) {
      setError(result.error || 'Unable to save your taskbar settings right now.')
      return
    }
    setTaskbarSaved(true)
    window.setTimeout(() => setTaskbarSaved(false), 3500)
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving) return
    const cleanDisplayName = displayName.trim(), cleanGamerTag = gamerTag.trim().replace(/^@+/, ''), cleanBio = bio.trim()
    if (!cleanDisplayName) { setError('Display name cannot be empty.'); return }
    if (cleanDisplayName.length > 40) { setError('Display name must be 40 characters or fewer.'); return }
    if (cleanGamerTag.length > 24) { setError('Gamer tag must be 24 characters or fewer.'); return }
    if (cleanBio.length > 160) { setError('Bio must be 160 characters or fewer.'); return }
    setSaving(true); setSaved(false); setError(null)
    const result = await saveProfile({ display_name: cleanDisplayName, gamer_tag: cleanGamerTag, bio: cleanBio, favorite_platform: favoritePlatform, favorite_genre: favoriteGenre, play_style: playStyle, avatar_data_url: avatar, avatar_animation: avatarAnimation, taskbar_preferences: taskbar })
    setSaving(false)
    if (!result.ok) { setError(result.error || 'Unable to save your profile right now.'); return }
    setSaved(true); window.setTimeout(() => setSaved(false), 3500)
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="rounded-2xl border border-[rgb(var(--accent-1)/0.22)] bg-[rgb(var(--accent-1)/0.055)] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--accent-1))]">Profile preview</p>
          <div className="mt-5 flex items-center gap-4">
            <AvatarPicker
              ref={avatarPickerRef}
              avatar={avatar}
              initials={previewInitials}
              onApply={setAvatar}
              animation={avatarAnimation}
              onApplyAnimation={setAvatarAnimation}
            />
            <div className="min-w-0"><p className="truncate text-lg font-semibold">{previewLabel}</p><p className="mt-1 truncate text-sm text-muted-foreground">{gamerTag.trim() ? `@${gamerTag.trim().replace(/^@+/, '')}` : email}</p><button type="button" className="mt-2 text-xs font-semibold text-[rgb(var(--accent-1))]" onClick={() => avatarPickerRef.current?.open()}>Change profile picture</button></div>
          </div>
          <p className="mt-5 min-h-12 text-sm leading-relaxed text-muted-foreground">{bio.trim() || 'Add a short bio so your future Gaming Horizon profile feels like yours.'}</p>
          <div className="mt-5 grid gap-2 text-xs text-muted-foreground">{[['Platform', favoritePlatform],['Genre', favoriteGenre],['Play style', playStyle]].map(([label,value]) => <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/45 px-3 py-2.5"><span>{label}</span><span className="max-w-[55%] truncate font-semibold text-foreground">{value || 'Not set'}</span></div>)}</div>
        </aside>

        <div className="rounded-2xl border border-border bg-muted/15 p-5 sm:p-6">
          <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]"><UserRound className="size-5" /></span><div><h2 className="font-heading text-xl font-semibold">Customize your player profile</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Personalize the identity shown across Gaming Horizon.</p></div></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Display name<input value={displayName} onChange={e => setDisplayName(e.target.value)} className={inputClass} maxLength={40} autoComplete="nickname" /></label><label className="grid gap-2 text-sm font-medium">Gamer tag<div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span><input value={gamerTag} onChange={e => setGamerTag(e.target.value.replace(/^@+/,''))} className={`${inputClass} pl-8`} maxLength={24} /></div></label></div>
          <label className="mt-5 grid gap-2 text-sm font-medium">Bio<textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} maxLength={160} className={`${inputClass} resize-none`} /><span className="text-right text-[11px] font-normal text-muted-foreground">{bio.length}/160</span></label>
          <div className="mt-5 grid gap-5 sm:grid-cols-3"><label className="grid gap-2 text-sm font-medium">Favorite platform<select value={favoritePlatform} onChange={e => setFavoritePlatform(e.target.value)} className={inputClass}><option value="">Not set</option>{PLATFORMS.map(x => <option key={x}>{x}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Favorite genre<select value={favoriteGenre} onChange={e => setFavoriteGenre(e.target.value)} className={inputClass}><option value="">Not set</option>{GENRES.map(x => <option key={x}>{x}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Play style<select value={playStyle} onChange={e => setPlayStyle(e.target.value)} className={inputClass}><option value="">Not set</option>{PLAY_STYLES.map(x => <option key={x}>{x}</option>)}</select></label></div>
          <div className="mt-6 rounded-xl border border-border/70 bg-background/45 px-4 py-3"><p className="text-xs text-muted-foreground">Account email: <span className="font-semibold text-foreground">{email}</span>. Signed-in forms use this as their starting value, but the user can edit it.</p></div>
          {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}{saved && <p role="status" className="mt-4 flex items-center gap-2 text-sm text-emerald-500"><CheckCircle2 className="size-4" />Profile saved.</p>}
          <div className="mt-6 flex justify-end"><GhButton type="submit" magnetic={false} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{saving ? 'Saving profile…' : 'Save profile'}</GhButton></div>
        </div>
      </form>

      <section className="rounded-2xl border border-border bg-muted/10 p-5 sm:p-6">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--accent-1))]">Your taskbar</p><h2 className="mt-2 font-heading text-xl font-semibold">Choose what appears in your navigation</h2><p className="mt-1 text-sm text-muted-foreground">Hide links and utilities you don’t use. Your choices are saved to your Gaming Horizon account.</p></div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{NAV_LINKS.map(link => <label key={link.href} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/40 px-3 py-3 text-sm"><input type="checkbox" checked={taskbar.visibleLinks.includes(link.href)} onChange={() => toggleLink(link.href)} className="size-4 accent-[rgb(var(--accent-1))]" /><span>{link.label}</span></label>)}</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{([['showBeta','Beta Preview'],['showSearch','Search'],['showCustomize','Customize'],['showWaitlist','Join Waitlist']] as const).map(([key,label]) => <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/40 px-3 py-3 text-sm"><input type="checkbox" checked={taskbar[key]} onChange={e => setTaskbar(t => ({ ...t, [key]: e.target.checked }))} className="size-4 accent-[rgb(var(--accent-1))]" /><span>{label}</span></label>)}</div>
        <div className="mt-5 flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {taskbarSaved ? (
              <p role="status" className="flex items-center gap-2 text-sm text-emerald-500"><CheckCircle2 className="size-4" />Taskbar preferences saved.</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">Your changes are a draft until you press Save taskbar.</p>
            )}
          </div>
          <GhButton type="button" magnetic={false} disabled={savingTaskbar} onClick={() => void handleSaveTaskbar()}>
            {savingTaskbar ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {savingTaskbar ? 'Saving taskbar…' : 'Save taskbar'}
          </GhButton>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Tip: keep at least Home and your account access visible so you never lose your way.</p>
      </section>

      <EmailChangeOtp initialEmail={email} />
      {hasPassword ? (
        <PasswordChangeOtp email={email} />
      ) : (
        <section className="rounded-2xl border border-border bg-muted/10 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]"><KeyRound className="size-5" /></span>
            <div>
              <h2 className="font-heading text-xl font-semibold">Password</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                You signed in with {providerLabel(authProvider)}, so this account doesn't have a password yet. You can set one from the sign-in screen's <Link href="/signin" className="font-medium text-[rgb(var(--accent-1))] hover:underline">Forgot password</Link> flow.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
