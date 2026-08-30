import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  let next = searchParams.get('next') ?? '/welcome'
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/welcome'
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/signin?error=config`)
  }

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })

    if (!error) {
      const { data: userData } = await supabase.auth.getUser()
      const confirmedUser = userData.user
      if (type === 'recovery') {
        next = '/update-password'
      } else if (type === 'email_change') {
        next = '/account'
      } else if (confirmedUser?.user_metadata?.onboarding_completed === true) {
        next = '/'
      } else {
        next = '/welcome'
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=confirmation`)
}
