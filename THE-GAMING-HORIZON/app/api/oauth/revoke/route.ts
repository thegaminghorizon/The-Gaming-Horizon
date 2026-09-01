import { createClient } from '@/lib/supabase/server'
import { parseOAuthRequestBody, noStoreJson } from '@/lib/oauth-http'

// POST /api/oauth/revoke — RFC 7009 token revocation. Per §2.2.1, an invalid
// or already-revoked token is still a 200 (never leak whether a token was
// valid); only bad client credentials get a 400.
export async function POST(request: Request) {
  const body = await parseOAuthRequestBody(request)

  if (!body.token) {
    return noStoreJson({ error: 'invalid_request', error_description: 'token is required.' }, 400)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('gh_oauth_revoke', {
    p_client_id: body.client_id || null,
    p_client_secret: body.client_secret || null,
    p_token: body.token,
  })

  if (error) {
    return noStoreJson({ error: 'server_error' }, 500)
  }

  const result = data as { error?: string } | null
  if (result?.error === 'invalid_client' || result?.error === 'invalid_request') {
    return noStoreJson(result, 400)
  }

  return noStoreJson({}, 200)
}
