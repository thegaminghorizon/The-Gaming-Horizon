import { Palette, Sparkles, ArrowRight } from 'lucide-react'
import { GhButton, Reveal } from '@/components/ui/primitives'

export function DesignSuggestionsCta() {
  return (
    <section id="design-suggestions" className="relative px-4 py-24 cq-py-32">
      <Reveal className="mx-auto max-w-6xl">
        <div className="glass relative overflow-hidden rounded-[2rem] border border-[rgb(var(--accent-1)/0.22)] px-6 py-10 sm:px-10 md:px-14 md:py-14">
          <div aria-hidden className="absolute -left-24 -top-28 size-72 rounded-full bg-[rgb(var(--accent-1)/0.13)] blur-3xl" />
          <div aria-hidden className="absolute -bottom-28 -right-24 size-72 rounded-full bg-[rgb(var(--accent-2)/0.11)] blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--accent-1)/0.25)] bg-[rgb(var(--accent-1)/0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--accent-1))]">
                <Palette className="size-4" /> Made something for Gaming Horizon?
              </span>
              <h2 className="mt-5 max-w-3xl text-balance font-heading text-3xl font-bold sm:text-4xl md:text-5xl">Show off your logo or website design</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">Designed a logo, a website concept, or a UI mockup you think fits Gaming Horizon? Upload it and share it with the rest of the community.</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Sparkles className="size-4 text-[rgb(var(--accent-2))]" /> Open to every player</span>
                <span className="inline-flex items-center gap-2"><Sparkles className="size-4 text-[rgb(var(--accent-2))]" /> Visible to the whole community</span>
              </div>
            </div>
            <GhButton href="/suggestions" size="lg" magnetic={false} className="group !shadow-none hover:!shadow-[0_10px_35px_-10px_rgb(var(--accent-1)/0.7)]">
              Share a Design <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </GhButton>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
