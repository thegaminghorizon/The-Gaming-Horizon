import Link from 'next/link'
import { ArrowUpRight, Clock3 } from 'lucide-react'
import { BLOG_ARTICLES } from '@/lib/blog'
import { Reveal, SectionHeading } from '@/components/ui/primitives'

export function LatestUpdates() {
  return (
    <section id="latest-updates" className="relative px-4 py-24 cq-py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Latest Updates"
          title="Notes from behind the horizon"
          subtitle="Product thinking, browser-gaming perspectives, and honest progress reports from the team building THE Gaming Horizon."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {BLOG_ARTICLES.slice(0, 3).map((article, index) => {
            const Icon = article.icon
            return (
              <Reveal key={article.slug} delay={index * 0.06}>
                <Link href={`/blog/${article.slug}`} className="group block h-full">
                  <article className="glass gh-card-hover relative flex h-full min-h-[290px] flex-col overflow-hidden rounded-3xl p-6">
                    <div aria-hidden className="absolute -right-16 -top-16 size-44 rounded-full bg-[rgb(var(--accent-1)/0.1)] blur-3xl transition-transform duration-500 group-hover:scale-125" />
                    <div className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[rgb(var(--accent-1))]">
                      <Icon className="size-4" /> {article.category}
                    </div>
                    <h3 className="relative mt-5 font-heading text-2xl font-bold">{article.title}</h3>
                    <p className="relative mt-3 flex-1 leading-relaxed text-muted-foreground">{article.excerpt}</p>
                    <div className="relative mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" />{article.read}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-[rgb(var(--accent-1))]">Read article <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                    </div>
                  </article>
                </Link>
              </Reveal>
            )
          })}
        </div>
        <div className="mt-8 text-center">
          <Link href="/blog" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.07)] px-5 text-sm font-semibold transition-colors hover:bg-[rgb(var(--accent-1)/0.14)]">
            View all updates <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
