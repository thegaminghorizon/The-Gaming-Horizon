import Link from 'next/link'
import { ArrowUpRight, PenSquare } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { BLOG_ARTICLES } from '@/lib/blog'
import { UserBlogPosts } from './user-blog-posts'

export const metadata = { title: 'Gaming Horizon Blog', description: 'Ideas, design notes and development updates from THE Gaming Horizon.' }

export default function BlogPage() {
  return (
    <main>
      <PageHeader eyebrow="Gaming Horizon Blog" title={<>Ideas from beyond the <span className="text-gradient">horizon</span></>} subtitle="Product thinking, browser gaming perspectives and honest progress reports from the team building THE Gaming Horizon.">
        <Link href="/blog/new" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[rgb(var(--accent-1))] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5">
          <PenSquare className="size-4" /> Create and post
        </Link>
      </PageHeader>
      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {BLOG_ARTICLES.map((article, index) => {
            const Icon = article.icon
            return (
              <Link key={article.slug} href={`/blog/${article.slug}`} className={index === 0 ? 'md:col-span-2' : ''}>
                <article className={`glass gh-card-hover group relative h-full overflow-hidden rounded-3xl p-7 md:p-8 ${index === 0 ? 'md:grid md:grid-cols-[1fr_auto] md:items-end md:gap-10' : ''}`}>
                  <div aria-hidden className="absolute -right-20 -top-20 size-56 rounded-full bg-[rgb(var(--accent-1)/0.12)] blur-3xl transition-transform duration-500 group-hover:scale-125" />
                  <div className="relative">
                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--accent-1))]"><Icon className="size-4" />{article.category}</div>
                    <h2 className="mt-5 font-heading text-2xl font-bold md:text-3xl">{article.title}</h2>
                    <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{article.excerpt}</p>
                  </div>
                  <div className="relative mt-7 flex items-center justify-between gap-4 md:mt-0">
                    <span className="text-sm text-muted-foreground">{article.read}</span>
                    <span aria-label={`Read ${article.title}`} className="inline-flex size-11 items-center justify-center rounded-xl border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.08)] text-[rgb(var(--accent-1))] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"><ArrowUpRight className="size-5" /></span>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
        <UserBlogPosts />
      </section>
    </main>
  )
}
