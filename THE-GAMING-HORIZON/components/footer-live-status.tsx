'use client'

import { useEffect, useMemo, useState } from 'react'
import { BETA_DATE, DEV_PROGRESS, LAUNCH_DATE } from '@/lib/data'
import { projectedProgress, roadmapCompletion } from '@/lib/progress'

function compactRemaining(target: string) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now())
  const days = Math.floor(ms / 86_400_000)
  const hours = Math.floor((ms / 3_600_000) % 24)
  return `${days}d ${hours}h`
}

export function FooterLiveStatus() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 60_000)
    return () => window.clearInterval(id)
  }, [])
  const { overall, verified, roadmap } = useMemo(() => {
    const values = DEV_PROGRESS.map((item) => projectedProgress(item.progress))
    const verifiedValues = DEV_PROGRESS.map((item) => item.progress)
    return {
      overall: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
      verified: Math.round(verifiedValues.reduce((sum, value) => sum + value, 0) / verifiedValues.length),
      roadmap: roadmapCompletion(),
    }
  }, [tick])
  return (
    <div className="mt-11 grid gap-3 rounded-2xl border border-[rgb(var(--accent-1)/0.14)] bg-background/35 p-4 backdrop-blur md:grid-cols-6">
      <div><p className="text-xs text-muted-foreground">Platform Status</p><p className="text-sm font-semibold">Development active</p></div>
      <div><p className="text-xs text-muted-foreground">Development Progress</p><p className="font-mono text-sm font-semibold tabular-nums">{overall}%</p></div>
      <div><p className="text-xs text-muted-foreground">Verified / Roadmap</p><p className="font-mono text-sm font-semibold tabular-nums">{verified}% · {roadmap}%</p></div>
      <div><p className="text-xs text-muted-foreground">Public Beta</p><p className="font-mono text-sm font-semibold tabular-nums">{compactRemaining(BETA_DATE)}</p></div>
      <div><p className="text-xs text-muted-foreground">Official Launch</p><p className="font-mono text-sm font-semibold tabular-nums">{compactRemaining(LAUNCH_DATE)}</p></div>
      <div><p className="text-xs text-muted-foreground">Latest Update</p><p className="text-sm font-semibold">Progress Update #2</p></div>
    </div>
  )
}
