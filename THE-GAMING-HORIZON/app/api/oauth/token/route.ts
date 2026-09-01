import { createClient } from '@/lib/supabase/server'
import { parseOAuthRequestBody, noStoreJson } from '@/lib/oauth-http'

// POST /api/oauth/token — RFC 6749 §3.2 token endpoint. Supports the
// authorization_code and refresh_token grants. All the actual verification
// (client secret, code/refresh-token hash lookup, PKCE, expiry) happens in
// the gh_oauth_token database function — this route just adapts HTTP <-> RPC
// and maps its {"error": "..."} shape onto the right status code.
export async function POST(request: Request) {
  const body = await parseOAuthRequestBody(request)
  const grantType = body.grant_type

  if (!grantType) {
    return noStoreJson({ error: 'invalid_request', error_description: 'grant_type is required.' }, 400)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('gh_oauth_token', {
    p_grant_type: grantType,
    p_client_id: body.client_id || null,
    p_client_secret: body.client_secret || null,
    p_code: body.code || null,
    p_redirect_uri: body.redirect_uri || null,
    p_code_verifier: body.code_verifier || null,
    p_refresh_token: body.refresh_token || null,
  })

  if (error) {
    return noStoreJson({ error: 'server_error', error_description: 'The token request could not be processed.' }, 500)
  }

  const result = data as { error?: string; error_description?: string } | null
  if (result?.error) {
    const status = result.error === 'invalid_client' ? 401 : 400
    return noStoreJson(result, status)
  }

  return noStoreJson(result, 200)
}
