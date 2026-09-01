'use client'

import Link from 'next/link'
import { Activity, FileClock, GitBranch, RadioTower } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { RoadmapTimeline } from '@/components/roadmap-timeline'
import { Countdown } from '@/components/countdown'
import { DevDashboard } from '@/components/dev-dashboard'
import { GhButton, Reveal, SectionHeading } from '@/components/ui/primitives'
import { useUI } from '@/components/providers/ui-provider'
import { BETA_DATE } from '@/lib/data'

const HUB_ITEMS = [
  { title: 'Timeline', description: 'Major project phases from foundation through public beta and launch.', href: '#timeline', icon: FileClock },
  { title: 'Development Updates', description: 'Current progress across frontend, infrastructure, AI, accessibility, and testing.', href: '#development', icon: GitBranch },
  { title: 'Changelog', description: 'Read complete project notes and published progress updates.', href: '/blog/progress-update-2', icon: Activity },
  { title: 'Platform Status', description: 'Check the current state of public-facing services and development systems.', href: '/status', icon: RadioTower },
]

export default function RoadmapPage() {
  const { openWaitlist } = useUI()
  return (
    <main className="relative min-h-screen pb-24">
      <PageHeader
        eyebrow="Roadmap & Development Hub"
        title="One place to follow the build"
        subtitle="Explore the timeline, current development progress, changelog, and platform status without jumping between disconnected sections."
      >
        <GhButton onClick={openWaitlist}>Join the Waitlist</GhButton>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HUB_ITEMS.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.05}>
              <Link href={item.href} className="glass group flex h-full min-h-[170px] flex-col rounded-2xl p-5 transition-all hover:-translate-y-1 hover:border-[rgb(var(--accent-1)/0.35)]">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]"><item.icon className="size-5" /></span>
                <h2 className="mt-4 font-heading text-lg font-bold">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="timeline" className="mx-auto mt-20 max-w-3xl scroll-mt-36 px-4">
        <Reveal className="glass mb-12 rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">Public Beta unlocks in</p>
          <div className="mt-4"><Countdown target={BETA_DATE} /></div>
        </Reveal>
        <SectionHeading eyebrow="Timeline" title="Roadmap to launch" center />
        <div className="mt-10"><RoadmapTimeline expandable /></div>
      </section>

      <section id="development" className="mx-auto mt-28 max-w-6xl scroll-mt-36 px-4">
        <SectionHeading
          eyebrow="Development Updates"
          title="Live build status"
          subtitle="A consolidated view of the systems currently being designed, implemented, tested, and prepared for backend integration."
          center
        />
        <Reveal className="mt-10"><DevDashboard /></Reveal>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <GhButton href="/blog/progress-update-2" variant="glass" magnetic={false}>Read latest changelog</GhButton>
          <GhButton href="/status" variant="outline" magnetic={false}>View platform status</GhButton>
        </div>
      </section>
    </main>
  )
}
