// Developer Portal apps — real OAuth 2.0 clients plus sandbox/live API keys,
// backed by Supabase (see supabase/migrations/0005_developer_apps_oauth.sql).
// Every write and every secret-bearing read goes through a `security
// definer` RPC on the database side; this file is a thin, typed wrapper
// around those RPCs so the UI never talks to raw table names.

import { createClient } from '@/lib/supabase/client'

export const OAUTH_SCOPES = ['profile:read', 'email:read', 'posts:read', 'designs:read'] as const
export type OAuthScope = (typeof OAUTH_SCOPES)[number]

export const OAUTH_SCOPE_LABELS: Record<OAuthScope, { label: string; desc: string }> = {
  'profile:read': { label: 'Profile', desc: 'Display name, gamer tag, avatar, bio and play preferences.' },
  'email:read': { label: 'Email address', desc: 'The email address on the account.' },
  'posts:read': { label: 'Blog posts', desc: 'Titles and excerpts of posts the player has published.' },
  'designs:read': { label: 'Design submissions', desc: 'Titles of design suggestions the player has submitted.' },
}

export interface DeveloperApp {
  id: string
  name: string
  description: string
  logo?: string
  homepageUrl?: string
  privacyUrl?: string
  tosUrl?: string
  redirectUris: string[]
  webhookUrl?: string
  scopes: OAuthScope[]
  clientId: string
  clientSecretLast4: string
  sandboxApiKeyLast4: string
  sandboxApiKeyCreatedAt: string
  liveApiKeyLast4?: string
  liveApiKeyCreatedAt?: string
  liveKeyRequestedAt?: string
  createdAt: string
  updatedAt: string
}

export interface AppEvent {
  event: string
  detail?: string
  createdAt: string
}

export interface ConnectedApp {
  appId: string
  name: string
  logo?: string
  homepageUrl?: string
  scopes: OAuthScope[]
  connectedAt: string
  lastUsedAt?: string
}

export interface OAuthAppPublicInfo {
  clientId: string
  name: string
  description: string
  logo?: string
  homepageUrl?: string
}

export interface Result<T = void> {
  ok: boolean
  data?: T
  error?: string
}

export interface AppInput {
  name: string
  description: string
  logo?: string
  homepageUrl?: string
  privacyUrl?: string
  tosUrl?: string
  redirectUris: string[]
  webhookUrl?: string
  scopes: OAuthScope[]
}

function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message || fallback
  }
  return fallback
}

export async function listDeveloperApps(): Promise<DeveloperApp[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('gh_list_my_apps')
  if (error || !data) return []
  return data as DeveloperApp[]
}

export async function createDeveloperApp(
  input: AppInput,
): Promise<Result<{ app: DeveloperApp; clientSecret: string; sandboxApiKey: string }>> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('gh_create_app', {
    p_name: input.name,
    p_description: input.description,
    p_logo: input.logo ?? null,
    p_homepage_url: input.homepageUrl ?? null,
    p_privacy_url: input.privacyUrl ?? null,
    p_tos_url: input.tosUrl ?? null,
    p_redirect_uris: input.redirectUris,
    p_webhook_url: input.webhookUrl ?? null,
    p_scopes: input.scopes,
  })
  if (error || !data) return { ok: false, error: errorMessage(error, 'This app could not be created.') }
  const result = data as { app: DeveloperApp; clientSecret: string; sandboxApiKey: string }
  return { ok: true, data: result }
}

export async function updateDeveloperApp(appId: string, input: AppInput): Promise<Result<DeveloperApp>> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('gh_update_app', {
    p_app_id: appId,
    p_name: input.name,
    p_description: input.description,
    p_logo: input.logo ?? null,
    p_homepage_url: input.homepageUrl ?? null,
    p_privacy_url: input.privacyUrl ?? null,
    p_tos_url: input.tosUrl ?? null,
    p_redirect_uris: input.redirectUris,
    p_webhook_url: input.webhookUrl ?? null,
    p_scopes: input.scopes,
  })
  if (error || !data) return { ok: false, error: errorMessage(error, 'This app could not be updated.') }
  return { ok: true, data: data as DeveloperApp }
}

export async function deleteDeveloperApp(appId: string): Promise<Result<void>> {
  const supabase = createClient()
  const { error } = await supabase.rpc('gh_delete_app', { p_app_id: appId })
  if (error) return { ok: false, error: errorMessage(error, 'This app could not be deleted.') }
  return { ok: true }
}

export async function regenerateClientSecret(appId: string): Promise<Result<{ clientSecret: string }>> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('gh_regenerate_client_secret', { p_app_id: appId })
  if (error || !data) return { ok: false, error: errorMessage(error, 'The client secret could not be regenerated.') }
  return { ok: true, data: data as { clientSecret: string } }
}

export async function regenerateApiKey(appId: string, env: 'sandbox' | 'live'): Promise<Result<{ apiKey: string }>> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('gh_regenerate_api_key', { p_app_id: appId, p_env: env })
  if (error || !data) return { ok: false, error: errorMessage(error, 'This key could not be regenerated.') }
  return { ok: true, data: data as { apiKey: string } }
}

export async function requestLiveKeyAccess(appId: string): Promise<Result<{ liveKeyRequestedAt: string }>> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('gh_request_live_key_access', { p_app_id: appId })
  if (error || !data) return { ok: false, error: errorMessage(error, 'That request could not be sent.') }
  return { ok: true, data: data as { liveKeyRequestedAt: string } }
}

export async function listAppEvents(appId: string): Promise<AppEvent[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('gh_list_app_events', { p_app_id: appId })
  if (error || !data) return []
  return data as AppEvent[]
}

/* ------------------------------ OAuth flow ------------------------------ */

export async function getOAuthAppPublicInfo(clientId: string): Promise<OAuthAppPublicInfo | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('gh_get_oauth_app_public_info', { p_client_id: clientId })
  if (error || !data) return null
  return data as OAuthAppPublicInfo
}

export async function authorizeOAuthApp(input: {
  clientId: string
  redirectUri: string
  scopes: OAuthScope[]
  codeChallenge?: string
  codeChallengeMethod?: string
}): Promise<Result<{ code: string }>> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('gh_oauth_authorize', {
    p_client_id: input.clientId,
    p_redirect_uri: input.redirectUri,
    p_scopes: input.scopes,
    p_code_challenge: input.codeChallenge ?? null,
    p_code_challenge_method: input.codeChallengeMethod ?? null,
  })
  if (error || !data) return { ok: false, error: errorMessage(error, 'This app could not be authorized.') }
  return { ok: true, data: data as { code: string } }
}

/* --------------------------- Connected apps ------------------------------ */

export async function listConnectedApps(): Promise<ConnectedApp[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('gh_list_connected_apps')
  if (error || !data) return []
  return data as ConnectedApp[]
}

export async function revokeConnectedApp(appId: string): Promise<Result<void>> {
  const supabase = createClient()
  const { error } = await supabase.rpc('gh_revoke_connected_app', { p_app_id: appId })
  if (error) return { ok: false, error: errorMessage(error, 'This app could not be disconnected.') }
  return { ok: true }
}

/* -------------------------------- Helpers -------------------------------- */

// Same validation the database enforces (supabase/migrations/0005_…sql,
// gh_oauth_validate_app_input) — checked client-side too so a mistake is
// caught before a round trip instead of only after the RPC rejects it.
export function isValidRedirectUri(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  return /^https:\/\//i.test(trimmed) || /^http:\/\/localhost([:/]|$)/i.test(trimmed) || /^http:\/\/127\.0\.0\.1([:/]|$)/i.test(trimmed)
}

export function isValidOptionalUrl(value?: string): boolean {
  const trimmed = value?.trim()
  if (!trimmed) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
