import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  let next = searchParams.get('next') ?? '/welcome'
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/welcome'
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/signin?error=config`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: userData } = await supabase.auth.getUser()
      const callbackUser = userData.user
      if (callbackUser) {
        if (callbackUser.user_metadata?.onboarding_completed === true) {
          // Returning users always land on the main home screen.
          next = '/'
        } else if (callbackUser.user_metadata?.onboarding_completed === false) {
          // New/incomplete users finish their Gaming Horizon experience first.
          next = '/welcome'
        } else {
          const createdAt = Date.parse(callbackUser.created_at)
          const isFreshAccount = Number.isFinite(createdAt) && Date.now() - createdAt < 10 * 60 * 1000
          if (isFreshAccount) {
            await supabase.auth.updateUser({ data: { ...(callbackUser.user_metadata ?? {}), onboarding_completed: false } })
            next = '/welcome'
          } else {
            // Older accounts that pre-date onboarding are treated as completed.
            next = '/'
          }
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=oauth`)
}
