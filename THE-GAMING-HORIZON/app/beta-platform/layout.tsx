import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Beta Platform Preview',
  description: 'Preview the locked Gaming Horizon Beta Platform and follow the live countdown to Public Beta on January 1, 2027 at 12:01 AM IST.',
  alternates: { canonical: '/beta-platform' },
}

export default function BetaPlatformLayout({ children }: { children: React.ReactNode }) {
  return children
}
