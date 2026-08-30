import type { Metadata } from 'next'
import { LegalView } from '@/components/legal-view'
import { LEGAL_PAGES } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Cookies & Browser Storage',
  description: 'How Gaming Horizon uses essential browser storage and protects visitor privacy.',
}

export default function Page() {
  return <LegalView page={LEGAL_PAGES.cookies} />
}
