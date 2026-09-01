import type { Metadata } from 'next'
import { PressView } from './press-view'

export const metadata: Metadata = {
  title: 'Press Kit',
  description:
    'Brand assets, fast facts and palette for media, partners and creators writing about Gaming Horizon.',
}

export default function Page() {
  return <PressView />
}
