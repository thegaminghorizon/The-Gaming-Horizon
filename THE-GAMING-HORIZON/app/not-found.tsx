'use client'

import { motion } from 'framer-motion'
import { GhButton } from '@/components/ui/primitives'
import { Logo } from '@/components/ui/logo'

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            'radial-gradient(45% 45% at 50% 40%, rgb(var(--accent-1)/0.18), transparent 70%)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <Logo className="mb-8 h-10 w-auto" />
        <p className="font-heading text-[7rem] font-bold leading-none gh-text-gradient sm:text-[10rem]">
          404
        </p>
        <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Lost in the horizon
        </h1>
        <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
          This page hasn&apos;t been built yet — or drifted beyond the edge of the map. Let&apos;s
          get you back to solid ground.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <GhButton href="/" size="lg">
            Back to home
          </GhButton>
          <GhButton href="/roadmap" variant="glass" size="lg">
            View Roadmap
          </GhButton>
        </div>
      </motion.div>
    </main>
  )
}
