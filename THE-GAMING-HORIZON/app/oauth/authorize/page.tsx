import type { Metadata } from 'next'
import { Suspense } from 'react'
import { OAuthAuthorizeView } from './oauth-authorize-view'

export const metadata: Metadata = {
  title: 'Authorize App',
  description: 'Approve a third-party app to connect with your Gaming Horizon account.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OAuthAuthorizeView />
    </Suspense>
  )
}
