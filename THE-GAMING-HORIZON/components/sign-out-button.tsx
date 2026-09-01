'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { useAuth } from '@/components/providers/auth-provider'

export function SignOutButton() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignOut() {
    setError(null)
    setLoading(true)

    try {
      const result = await signOut()

      if (!result.ok) {
        setError(result.error || 'Unable to sign out.')
        setLoading(false)
        return
      }

      router.replace('/signin')
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign out.')
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <GhButton
        variant="outline"
        magnetic={false}
        onClick={handleSignOut}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4" />
        )}
        {loading ? 'Signing out...' : 'Sign out'}
      </GhButton>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  )
}
