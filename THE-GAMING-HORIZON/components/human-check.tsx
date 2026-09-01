'use client'

import { ShieldCheck, AlertCircle } from 'lucide-react'

export function HumanCheck({
  checked,
  onChange,
  id = 'human-check',
}: {
  checked: boolean
  onChange: (value: boolean) => void
  id?: string
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={[
          'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition-all',
          checked
            ? 'border-[rgb(var(--accent-1)/0.6)] bg-[rgb(var(--accent-1)/0.1)]'
            : 'border-border-strong bg-muted/25 hover:border-[rgb(var(--accent-1)/0.45)]',
        ].join(' ')}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="size-4 accent-[rgb(var(--accent-1))]"
        />
        <span className="grid size-8 place-items-center rounded-lg bg-[rgb(var(--accent-1)/0.1)] text-[rgb(var(--accent-1))]">
          <ShieldCheck className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">I’m not a robot</span>
          <span className="block text-[11px] text-muted-foreground">
            Complete this quick human check before continuing.
          </span>
        </span>
        {checked && <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--accent-1))]">Verified</span>}
      </label>

      {!checked && (
        <p role="status" className="mt-2 flex items-center gap-1.5 px-1 text-[11px] font-medium text-amber-400">
          <AlertCircle className="size-3.5 shrink-0" />
          Verify above that you are not a robot to continue.
        </p>
      )}
    </div>
  )
}
