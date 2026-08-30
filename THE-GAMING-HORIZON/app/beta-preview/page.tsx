import type { Metadata } from 'next'
import { WebsiteBetaPreview } from './beta-preview-view'

export const metadata: Metadata = {
  title: 'Website Beta Preview — Gaming Horizon',
  description: 'See the planned Gaming Horizon Public Beta modules, synchronized opening milestones, feedback program, and current closed-access status.',
  alternates: { canonical: '/beta-preview' },
}

export default function BetaPreviewPage() {
  return <WebsiteBetaPreview />
}
