import type { SupabaseClient } from '@supabase/supabase-js'
import { AUTH_REDIRECTS, authRedirect } from '@/lib/auth/redirects'

export async function sendPasswordResetOtp(
  supabase: SupabaseClient,
  email: string,
) {
  // Supabase uses the Reset Password email template for this recovery token.
  // The template renders {{ .Token }} so the user receives a 6-digit code
  // instead of a clickable reset link.
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: authRedirect(AUTH_REDIRECTS.resetOtp),
  })
}

export async function verifyPasswordResetOtp(
  supabase: SupabaseClient,
  email: string,
  token: string,
) {
  return supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery',
  })
}
