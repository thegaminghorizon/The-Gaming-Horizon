import type { Metadata } from 'next'
import { SupportView } from './support-view'

export const metadata: Metadata = {
  title: 'Support Center',
  description:
    'Get help with your Gaming Horizon account, the beta, billing or the developer platform. Browse help articles, open a ticket or track an existing one.',
}

export default function Page() {
  return <SupportView />
}
