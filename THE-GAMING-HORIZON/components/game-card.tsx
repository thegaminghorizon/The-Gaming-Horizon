'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Globe, Sparkles } from 'lucide-react'
import type { Game } from '@/lib/data'
import { toAnchorSlug } from '@/lib/utils'

const statusStyle: Record<Game['status'], string> = {
  'Browser Ready': 'bg-[rgb(52_211_153/0.16)] text-[rgb(110_231_183)]',
  'Planned for Beta': 'bg-[rgb(var(--accent-1)/0.16)] text-[rgb(var(--accent-1))]',
  'Under Review': 'bg-[rgb(251_191_36/0.16)] text-[rgb(253_224_71)]',
}

export function GameCard({ game, index = 0 }: { game: Game; index?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [glow, setGlow] = useState({ x: 50, y: 50 })

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setGlow({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
      id={`game-${toAnchorSlug(game.name)}`}
      data-focus-target
      tabIndex={-1}
      className="group glass relative scroll-mt-[calc(var(--banner-h,0px)+var(--nav-h,64px)+1.5rem)] overflow-hidden rounded-3xl p-1 outline-none transition-transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-1)/0.72)]"
      style={{ ['--glow-x' as string]: `${glow.x}%`, ['--glow-y' as string]: `${glow.y}%` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(320px circle at var(--glow-x) var(--glow-y), rgb(${game.color.split(' ').join(',')}/0.18), transparent 60%)` }}
      />
      {/* artwork */}
      <div
        className="relative flex h-36 items-center justify-center overflow-hidden rounded-[20px]"
        style={{ background: `linear-gradient(135deg, hsl(${game.color}/0.85), hsl(${game.color}/0.25))` }}
      >
        <span className="font-heading text-2xl font-bold tracking-tight text-white drop-shadow">{game.name}</span>
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle[game.status]}`}>
          {game.status}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold">{game.name}</h3>
          <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground">{game.genre}</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{game.tagline}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          {game.multiplayer && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1"><Users className="size-3" />Multiplayer</span>
          )}
          {game.browserReady && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1"><Globe className="size-3" />Browser</span>
          )}
          {game.aiSupport && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1"><Sparkles className="size-3" />AI</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
