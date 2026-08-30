import { createClient } from '@/lib/supabase/server'
import { noStoreJson } from '@/lib/oauth-http'

// GET/POST /api/oauth/userinfo — returns whatever scopes the presented
// access token was granted. Called by the third-party app's own backend
// with `Authorization: Bearer <access_token>`, same as any OAuth/OIDC
// userinfo endpoint.
async function handle(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  const token = match?.[1]?.trim()

  if (!token) {
    return noStoreJson(
      { error: 'invalid_token', error_description: 'Provide an access token as "Authorization: Bearer <token>".' },
      401,
      { 'WWW-Authenticate': 'Bearer error="invalid_token"' },
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('gh_oauth_userinfo', { p_access_token: token })

  if (error) {
    return noStoreJson({ error: 'server_error' }, 500)
  }

  const result = data as { error?: string } | null
  if (result?.error) {
    return noStoreJson(result, 401, { 'WWW-Authenticate': 'Bearer error="invalid_token"' })
  }

  return noStoreJson(result, 200)
}

export const GET = handle
export const POST = handle
