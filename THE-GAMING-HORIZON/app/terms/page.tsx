import type { Metadata } from 'next'
import { LegalView } from '@/components/legal-view'
import { LEGAL_PAGES } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms that will govern your use of Gaming Horizon — a pre-launch draft published for transparency.',
}

export default function Page() {
  return <LegalView page={LEGAL_PAGES.terms} />
}
