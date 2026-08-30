import type { Metadata } from 'next'
import { LegalView } from '@/components/legal-view'
import { LEGAL_PAGES } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Gaming Horizon intends to handle your data — a pre-launch draft published for transparency.',
}

export default function Page() {
  return <LegalView page={LEGAL_PAGES.privacy} />
}
