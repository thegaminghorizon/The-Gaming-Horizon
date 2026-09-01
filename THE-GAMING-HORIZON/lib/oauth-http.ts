// Shared by the app/api/oauth/* route handlers. OAuth 2.0 (RFC 6749) mandates
// application/x-www-form-urlencoded request bodies for the token and revoke
// endpoints, but plenty of real-world HTTP clients default to JSON — this
// accepts either so an integration doesn't fail on that detail alone.
export async function parseOAuthRequestBody(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      const body = await request.json()
      const out: Record<string, string> = {}
      if (body && typeof body === 'object') {
        for (const [key, value] of Object.entries(body)) {
          if (typeof value === 'string') out[key] = value
        }
      }
      return out
    } catch {
      return {}
    }
  }
  const text = await request.text()
  const params = new URLSearchParams(text)
  const out: Record<string, string> = {}
  for (const [key, value] of params.entries()) out[key] = value
  return out
}

export function noStoreJson(body: unknown, status: number, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      Pragma: 'no-cache',
      ...extraHeaders,
    },
  })
}
