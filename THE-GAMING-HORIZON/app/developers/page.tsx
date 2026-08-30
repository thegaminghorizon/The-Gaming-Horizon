import type { Metadata } from 'next'
import { DeveloperPortalView } from './developer-portal-view'

export const metadata: Metadata = {
  title: 'Developer Portal',
  description:
    'Build on Gaming Horizon. Generate sandbox API keys, explore the REST API and webhooks, and follow the platform changelog.',
}

export default function Page() {
  return <DeveloperPortalView />
}
