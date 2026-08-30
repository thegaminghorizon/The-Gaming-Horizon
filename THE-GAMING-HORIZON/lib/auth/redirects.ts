export function authRedirect(path: string) {
  if (typeof window === 'undefined') return undefined
  return `${window.location.origin}${path}`
}

export const AUTH_REDIRECTS = {
  emailOtp: '/auth/confirm-otp',
  resetLink: '/auth/reset-link',
  resetOtp: '/auth/reset-otp',
  oauth: '/auth/callback?next=/welcome',
  updatePassword: '/update-password',
} as const
