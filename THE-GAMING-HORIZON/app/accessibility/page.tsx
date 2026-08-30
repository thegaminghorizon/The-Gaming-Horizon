import type { Metadata } from 'next'
import { LegalView } from '@/components/legal-view'
import { LEGAL_PAGES } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description:
    'Gaming Horizon is being built to be usable by everyone, targeting WCAG 2.2 AA across the entire experience.',
}

export default function Page() {
  return <LegalView page={LEGAL_PAGES.accessibility} />
}
