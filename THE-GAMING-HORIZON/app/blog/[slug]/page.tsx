import Link from 'next/link'
import { ArrowLeft, Clock3 } from 'lucide-react'
import { BLOG_ARTICLES, getBlogArticle } from '@/lib/blog'
import { UserPostView } from './user-post-view'

export function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getBlogArticle(slug)
  return article ? { title: article.title, description: article.excerpt } : {}
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getBlogArticle(slug)
  // Official articles are known at build time. Anything else might be a
  // community post published from the Gateway's blog composer, which is
  // stored client-side — so it's checked in the browser rather than 404ing
  // here on the server.
  if (!article) return <UserPostView slug={slug} />
  const Icon = article.icon

  return (
    <main className="px-4 pb-24 pt-[calc(var(--banner-h,0px)+var(--nav-h,64px)+3rem)] sm:pt-[calc(var(--banner-h,0px)+var(--nav-h,64px)+4rem)]">
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="group inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Back to the blog
        </Link>
        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--accent-1))]"><Icon className="size-4" />{article.category}<span className="h-1 w-1 rounded-full bg-border" /><span className="inline-flex items-center gap-1.5 normal-case tracking-normal text-muted-foreground"><Clock3 className="size-3.5" />{article.read}</span></div>
          <h1 className="mt-5 text-balance font-heading text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">{article.title}</h1>
          <p className="mt-6 text-pretty text-xl leading-relaxed text-muted-foreground">{article.intro}</p>
        </header>

        <div className="mt-12 space-y-10">
          {article.sections.map((section) => (
            <section key={section.heading} className="glass rounded-3xl p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">{section.heading}</h2>
              <div className="mt-5 space-y-4 text-base leading-8 text-muted-foreground sm:text-lg">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              {section.points && (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {section.points.map((point) => <li key={point} className="rounded-2xl border border-[rgb(var(--accent-1)/0.2)] bg-[rgb(var(--accent-1)/0.06)] px-4 py-3 text-sm font-medium">{point}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}
