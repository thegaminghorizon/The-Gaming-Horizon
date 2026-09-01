import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Verifies the 6-digit code sent by the "Confirm signup" email template
 * after a password sign-up. This is distinct from verifyEmailOtp (which
 * uses type: 'email' for sign-in) — signup confirmation uses type: 'signup'.
 */
export async function verifySignupOtp(
  supabase: SupabaseClient,
  email: string,
  token: string,
) {
  return supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  })
}

/**
 * Re-sends the "Confirm signup" email if the user didn't get the first one.
 */
export async function resendSignupOtp(
  supabase: SupabaseClient,
  email: string,
) {
  return supabase.auth.resend({
    type: 'signup',
    email,
  })
}
