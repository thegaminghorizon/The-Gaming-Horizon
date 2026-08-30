import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your Gaming Horizon account.',
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signup" />
    </Suspense>
  )
}
