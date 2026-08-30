import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { UpdatePasswordForm } from '@/components/update-password-form'

export const dynamic = 'force-dynamic'

export default async function UpdatePasswordPage() {
  if (!isSupabaseConfigured()) {
    redirect('/signin')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect('/signin')
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-32">
      <UpdatePasswordForm />
    </main>
  )
}
