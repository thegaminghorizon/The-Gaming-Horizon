import type { Metadata } from 'next'
import { SupportUsView } from './support-us-view'

export const metadata: Metadata = {
  title: 'Support Us',
  description:
    "Help fund Gaming Horizon's servers, development, and community rewards. See exactly where every rupee is planned to go, pick a supporter tier, and preview how UPI donations will work once they go live.",
}

export default function Page() {
  return <SupportUsView />
}
