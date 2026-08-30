import type { Metadata } from 'next'
import { PlansView } from './plans-view'

export const metadata: Metadata = {
  title: 'Planned Memberships',
  description: 'Explore Gaming Horizon’s planned player and creator memberships. Pricing and benefits are previews and may change before launch.',
  alternates: { canonical: '/plans' },
  openGraph: {
    title: 'Gaming Horizon Planned Memberships',
    description: 'A transparent preview of five planned Gaming Horizon memberships for players, families, and creators.',
    url: '/plans',
  },
}

export default function PlansPage() {
  return <PlansView />
}
