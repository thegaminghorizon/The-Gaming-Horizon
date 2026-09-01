import { PageHeader } from '@/components/page-header'
import { BlogComposer } from './blog-composer'

export const metadata = { title: 'Write a Post', description: 'Create and publish a post to the Gaming Horizon blog.' }

export default function NewBlogPostPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Gaming Horizon Blog"
        title={<>Create and <span className="text-gradient">post</span></>}
        subtitle="Share an update, an opinion, or a story with the Gaming Horizon community."
      />
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-3xl">
          <BlogComposer />
        </div>
      </section>
    </main>
  )
}
