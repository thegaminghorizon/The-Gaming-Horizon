import { PageHeader } from '@/components/page-header'
import { DesignSuggestionForm } from './design-suggestion-form'
import { DesignSuggestionsGallery } from './design-suggestions-gallery'

export const metadata = {
  title: 'Design Suggestions',
  description: 'Share a logo, website design, or UI concept you made for THE Gaming Horizon and browse what the community has submitted.',
}

export default function SuggestionsPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Design Suggestions"
        title={<>Show off your <span className="text-gradient">designs</span></>}
        subtitle="Made a logo, website concept, or UI mockup for Gaming Horizon? Upload it here for the community to see."
      />
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-3xl">
          <DesignSuggestionForm />
        </div>
        <DesignSuggestionsGallery />
      </section>
    </main>
  )
}
