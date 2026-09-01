import type { SupabaseClient } from '@supabase/supabase-js'
import { AUTH_REDIRECTS, authRedirect } from '@/lib/auth/redirects'

export async function sendEmailOtp(
  supabase: SupabaseClient,
  email: string,
  shouldCreateUser: boolean,
  metadata?: Record<string, unknown>,
) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser,
      emailRedirectTo: authRedirect(AUTH_REDIRECTS.emailOtp),
      data: metadata,
    },
  })
}

export async function verifyEmailOtp(
  supabase: SupabaseClient,
  email: string,
  token: string,
) {
  return supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })
}
