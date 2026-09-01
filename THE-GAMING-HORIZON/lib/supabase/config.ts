const FALLBACK_SUPABASE_URL = 'https://hpkeranmvefqirczmrmk.supabase.co'
const FALLBACK_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_hkG5UE8ZroSQmsWFGsci2g_bJvjbL6V'

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_PUBLISHABLE_KEY

  return { url, publishableKey }
}

export function isSupabaseConfigured() {
  const { url, publishableKey } = getSupabaseConfig()
  return Boolean(url && publishableKey)
}
