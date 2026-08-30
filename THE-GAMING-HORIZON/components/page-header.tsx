'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Pill } from '@/components/ui/primitives'
import type { ReactNode } from 'react'

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: ReactNode
  subtitle: string
  children?: ReactNode
}) {
  return (
    <header data-interface-copy="true" className="relative px-4 pb-10 pt-[calc(var(--banner-h,0px)+var(--nav-h,64px)+2.75rem)] md:pt-[calc(var(--banner-h,0px)+var(--nav-h,64px)+4rem)]">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Pill className="mb-5">{eyebrow}</Pill>
        </motion.div>
        <motion.h1
          className="font-heading text-section-title text-balance gh-heading-shine drop-shadow-[0_10px_34px_rgb(var(--accent-1)/0.10)]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {title}
        </motion.h1>
        <motion.div aria-hidden className="mx-auto mt-6 h-[2px] w-32 rounded-full bg-gradient-to-r from-transparent via-[rgb(var(--accent-1)/0.72)] to-transparent shadow-[0_0_16px_-6px_rgb(var(--accent-1)/0.5)]" initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.2, duration: 0.55 }} />
        <motion.p
          className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {subtitle}
        </motion.p>
        {children && (
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </header>
  )
}
