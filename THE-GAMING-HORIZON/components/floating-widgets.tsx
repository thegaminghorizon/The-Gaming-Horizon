'use client'

import { useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Trophy,
  Users,
  Flame,
  Crown,
  MessageSquare,
  Globe,
  Rocket,
} from 'lucide-react'
import { useSettings } from '@/components/providers/settings-provider'
import { useUI } from '@/components/providers/ui-provider'

const WIDGETS = [
  { icon: Sparkles, title: 'AI Recommendation', sub: 'PolyTrack fits your mood', pos: 'left-[2%] top-[12%]', color: '250 100% 72%' },
  { icon: Trophy, title: 'Achievement Unlocked', sub: 'First Lap Legend', pos: 'right-[3%] top-[8%]', color: '40 95% 60%' },
  { icon: Users, title: 'Friend Online', sub: 'NovaByte started playing', pos: 'left-[5%] top-[62%]', color: '150 70% 52%' },
  { icon: Flame, title: 'Trending Now', sub: 'Smash Karts +240%', pos: 'right-[4%] top-[58%]', color: '10 90% 62%' },
  { icon: Crown, title: 'Leaderboard', sub: 'You reached Rank #12', pos: 'left-[16%] top-[38%]', color: '280 85% 68%' },
  { icon: MessageSquare, title: 'Community', sub: '38 new posts today', pos: 'right-[15%] top-[36%]', color: '190 90% 58%' },
  { icon: Globe, title: 'Browser Support', sub: 'Chrome · Edge · Firefox', pos: 'left-[30%] top-[80%]', color: '200 80% 60%' },
  { icon: Rocket, title: 'Beta Status', sub: 'On track · Jan 2027', pos: 'right-[26%] top-[82%]', color: '330 85% 64%' },
]

type Widget = (typeof WIDGETS)[number]

function FloatingWidgetItem({ widget, index }: { widget: Widget; index: number }) {
  const { registerRightFloatingObstacle } = useUI()
  const ref = useRef<HTMLDivElement>(null)
  const isRight = widget.pos.includes('right-')

  useLayoutEffect(() => {
    if (!isRight) return
    registerRightFloatingObstacle(`hero-widget-${index}`, ref.current)
    return () => registerRightFloatingObstacle(`hero-widget-${index}`, null)
  }, [index, isRight, registerRightFloatingObstacle])

  return (
    <motion.div
      ref={ref}
      className={`absolute ${widget.pos}`}
      data-gh-floating-obstacle={isRight ? 'right' : undefined}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{
        opacity: 1,
        y: [0, index % 2 === 0 ? -12 : 12, 0],
        scale: 1,
      }}
      transition={{
        opacity: { duration: 0.6, delay: 0.6 + index * 0.12 },
        scale: { duration: 0.6, delay: 0.6 + index * 0.12 },
        y: { duration: 5 + (index % 4), repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 },
      }}
    >
      <div className="glass flex items-center gap-3 rounded-2xl px-3.5 py-2.5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)]">
        <span
          className="flex size-9 items-center justify-center rounded-xl"
          style={{
            background: `hsl(${widget.color} / 0.16)`,
            color: `hsl(${widget.color})`,
          }}
        >
          <widget.icon className="size-4.5" style={{ width: 18, height: 18 }} />
        </span>
        <div>
          <p className="text-xs font-semibold leading-tight">{widget.title}</p>
          <p className="text-[11px] leading-tight text-muted-foreground">{widget.sub}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function FloatingWidgets() {
  const { settings } = useSettings()
  // Decorative cards are intentionally disabled for the battery preset and
  // reduced-motion users. This removes several perpetual Framer Motion loops
  // on phones and lower-end laptops without affecting page functionality.
  if (settings.reducedMotion || settings.performance === 'battery') return null

  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block" aria-hidden>
      {WIDGETS.map((widget, index) => (
        <FloatingWidgetItem key={widget.title} widget={widget} index={index} />
      ))}
    </div>
  )
}
