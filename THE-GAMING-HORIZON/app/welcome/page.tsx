import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { WelcomeExperience } from '@/components/welcome-experience'

export const dynamic = 'force-dynamic'

export default async function WelcomePage() {
  if (!isSupabaseConfigured()) redirect('/signin')
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims) redirect('/signin')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')
  if (user.user_metadata?.onboarding_completed !== false) redirect('/')
  return <WelcomeExperience initial={user.user_metadata?.experience_profile as any} />
}
