import type { Metadata } from 'next'
import { StatusView } from './status-view'

export const metadata: Metadata = {
  title: 'System Status',
  description:
    'Track where each Gaming Horizon service stands on the road to the Public Beta.',
}

export default function Page() {
  return <StatusView />
}
