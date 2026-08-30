import { PageHeader } from '@/components/page-header'
import { GameRequestForm } from './game-request-form'

export const metadata = { title: 'Game Request Portal', description: 'Suggest browser games for consideration on THE Gaming Horizon.' }

export default function GameRequestPage() {
  return (
    <main>
      <PageHeader eyebrow="Game Request Portal" title={<>Help shape the <span className="text-gradient">game library</span></>} subtitle="Know a browser game that belongs on THE Gaming Horizon? Share it with us for licensing, quality and compatibility review." />
      <section className="px-4 pb-24"><div className="mx-auto max-w-3xl"><GameRequestForm /></div></section>
    </main>
  )
}
