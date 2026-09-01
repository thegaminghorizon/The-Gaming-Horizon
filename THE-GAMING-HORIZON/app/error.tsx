'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'
import { Logo } from '@/components/ui/logo'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-28 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_45%_at_50%_42%,rgb(var(--accent-1)/0.16),transparent_72%)]" />
      <section className="glass-strong relative w-full max-w-2xl rounded-[32px] border border-border/70 p-7 shadow-[0_32px_90px_-52px_rgb(var(--accent-1)/0.55)] sm:p-10">
        <Logo className="mx-auto mb-8 h-9 w-auto" />
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]"><AlertTriangle className="size-6" /></span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[rgb(var(--accent-1))]">System interruption</p>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-5xl">The horizon paused for a moment.</h1>
        <p className="mx-auto mt-4 max-w-lg leading-7 text-muted-foreground">Something unexpected interrupted this page. Your settings are safe, and you can retry without losing your place.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <GhButton size="lg" onClick={reset}><RotateCcw className="size-4" /> Try Again</GhButton>
          <GhButton href="/" size="lg" variant="glass">Return Home</GhButton>
        </div>
      </section>
    </main>
  )
}
