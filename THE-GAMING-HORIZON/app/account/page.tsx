import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { SignOutButton } from '@/components/sign-out-button'
import { AccountTabs } from '@/components/account-tabs'
import { isAvatarAnimation } from '@/components/ui/avatar-frame'

export const dynamic = 'force-dynamic'

function metadataString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    redirect('/signin')
  }

  const supabase = await createClient()

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    redirect('/signin')
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/signin')
  }

  const metadata = user.user_metadata ?? {}
  const email = user.email || ''
  const socialName =
    metadataString(metadata.full_name) ||
    metadataString(metadata.name) ||
    metadataString(metadata.preferred_username)
  const fallbackName = socialName || (email ? email.split('@')[0] : 'Player')
  // Only accounts that signed up with a password (or later set one via the
  // reset flow) get the "Change password" option — see has_password metadata.
  const hasPassword = metadata.has_password === true
  // The provider the account actually authenticated with (e.g. 'discord',
  // 'google', 'github', or 'email'), so the "no password yet" message can
  // name the real sign-in method instead of always assuming email OTP.
  const authProvider = metadataString(user.app_metadata?.provider) || 'email'

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-32 sm:px-6">
      <div className="glass rounded-3xl p-6 sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--accent-1))]">
            Player account
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Your Gaming Horizon account
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Manage the player identity shown around Gaming Horizon. Your signed-in email is also used to prefill waitlist, feedback, FAQ question and game-request forms, while remaining editable in each form.
          </p>
        </div>

        <AccountTabs
          email={email}
          initialDisplayName={metadataString(metadata.display_name) || fallbackName}
          initialGamerTag={metadataString(metadata.gamer_tag)}
          initialBio={metadataString(metadata.bio)}
          initialFavoritePlatform={metadataString(metadata.favorite_platform)}
          initialFavoriteGenre={metadataString(metadata.favorite_genre)}
          initialPlayStyle={metadataString(metadata.play_style)}
          initialAvatarDataUrl={metadataString(metadata.avatar_data_url)}
          initialAvatarAnimation={isAvatarAnimation(metadata.avatar_animation) ? metadata.avatar_animation : 'none'}
          initialTaskbarPreferences={metadata.taskbar_preferences && typeof metadata.taskbar_preferences === 'object' ? metadata.taskbar_preferences as any : undefined}
          hasPassword={hasPassword}
          authProvider={authProvider}
        />

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-border/70 pt-2">
          <SignOutButton />
          <Link
            href="/"
            className="mb-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  )
}
