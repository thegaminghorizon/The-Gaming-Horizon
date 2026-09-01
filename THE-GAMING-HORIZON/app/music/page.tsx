'use client'

import { PageHeader } from '@/components/page-header'
import { GhButton, Reveal, SectionHeading } from '@/components/ui/primitives'
import { MusicRoom } from '@/components/music/music-room'
import { useAuth } from '@/components/providers/auth-provider'
import { Link2, Volume2, ListMusic, Lock, ArrowRight, Loader2 } from 'lucide-react'

const HOW_IT_WORKS = [
  { icon: Link2, title: 'Type /play', desc: 'Every command starts with "/" — use /play <song name or link> to queue a track from YouTube, Spotify, Apple Music, SoundCloud, and most other platforms, just like messaging a bot.' },
  { icon: ListMusic, title: 'It joins the queue', desc: 'Tracks play in order. Add as many as you want — /skip, /previous, /loop, or remove any of them anytime.' },
  { icon: Volume2, title: 'Full playback control', desc: 'Play, pause, skip, rewind, seek, and adjust volume — all through slash commands like /pause, /resume, or /skip.' },
]

function MusicGate() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-2xl p-8 text-center sm:p-12">
            <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
              <Lock className="size-6" />
            </div>
            <h3 className="font-heading text-2xl font-semibold">Sign in to open the Music Room</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              The Music Room is a player feature — sign in (or create a free account) to queue tracks, chat with the bot, and control playback.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <GhButton href="/signin" magnetic={false}>
                <ArrowRight className="size-4" />
                Sign in
              </GhButton>
              <GhButton href="/signup" variant="outline" magnetic={false}>
                Create an account
              </GhButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function MusicPage() {
  const { user, loading } = useAuth()

  return (
    <main id="music" className="relative scroll-mt-32">
      <PageHeader
        eyebrow="Music Room"
        title={<>Queue songs like you're <span className="gh-text-gradient">talking to a bot.</span></>}
        subtitle="Every command starts with / — use /play <song name or link> to queue a track, with a queue, full playback controls, and simple slash commands."
      />

      <section className="px-4 pb-10">
        <div className="mx-auto max-w-6xl">
          <div className="mt-2 grid gap-4 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.06}>
                <div className="glass gh-card-hover h-full rounded-2xl p-6">
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                    <step.icon className="size-5" />
                  </div>
                  <h3 className="font-heading mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <section className="px-4 pb-24">
          <div className="mx-auto flex max-w-3xl items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        </section>
      ) : !user ? (
        <MusicGate />
      ) : (
        <section className="px-4 pb-24">
          <div className="mx-auto max-w-[96rem]">
            <SectionHeading
              center
              eyebrow="Music Room"
              title="Type /play and go"
              subtitle="Playback runs through YouTube and Spotify — try /play <song title or link> to search the catalog or queue a link directly."
            />
            <Reveal className="mt-10">
              <MusicRoom />
            </Reveal>
            <Reveal delay={0.08} className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Audio plays only for links you add, in this browser tab. Nothing is shared with other visitors.
              </p>
            </Reveal>
          </div>
        </section>
      )}
    </main>
  )
}
