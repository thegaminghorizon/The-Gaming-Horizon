import type { Metadata } from 'next'
import { ContactView } from './contact-view'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with the Gaming Horizon team — questions, press, partnerships and more.',
}

export default function Page() {
  return <ContactView />
}
