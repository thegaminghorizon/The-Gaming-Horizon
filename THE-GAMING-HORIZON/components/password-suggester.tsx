'use client'

import { useState } from 'react'
import { Check, ChevronDown, Copy, Loader2, Sparkles } from 'lucide-react'
import { GhButton } from '@/components/ui/primitives'

type Style = 'random' | 'phrase' | 'detail'

const STYLE_OPTIONS: Array<{ value: Style; label: string; description: string }> = [
  { value: 'random', label: 'Strong & random', description: 'Hardest to guess, no personal detail needed.' },
  { value: 'phrase', label: 'Memorable phrase', description: 'A few unrelated words, easier to recall.' },
  { value: 'detail', label: 'Include a detail', description: "Blend in something of yours (not just used raw)." },
]

const SYMBOLS = '!@#$%^&*?-_+='
const WORDS = [
  'meteor', 'canyon', 'falcon', 'ember', 'harbor', 'lantern', 'quartz', 'nimbus',
  'cipher', 'granite', 'voyage', 'tundra', 'delta', 'orbit', 'thicket', 'summit',
  'cobalt', 'ripple', 'anchor', 'zephyr', 'sable', 'onyx', 'basalt', 'copper',
  'glacier', 'nebula', 'prairie', 'obsidian', 'marlin', 'ridge',
  'wildfire', 'crimson', 'juniper', 'meridian', 'echo', 'talon', 'vortex', 'ashen',
  'crescent', 'boulder', 'thunder', 'vapor', 'coral', 'plateau', 'ironwood', 'frost',
]

function randomInt(max: number) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1)
    crypto.getRandomValues(arr)
    return arr[0] % max
  }
  return Math.floor(Math.random() * max)
}

function pick<T>(items: T[]): T {
  return items[randomInt(items.length)]
}

function randomDigits(count: number) {
  let out = ''
  for (let i = 0; i < count; i++) out += randomInt(10)
  return out
}

function titleCase(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// Every generator below is checked to satisfy the same rules shown under the
// password field: 8+ chars, upper, lower, digit, special character. Beyond
// that minimum, each style aims for real-world strength (16+ chars of random,
// 3+ words for phrases) rather than just barely clearing the checklist.
function generateRandom(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnpqrstuvwxyz'
  const digits = '23456789'
  const all = upper + lower + digits + SYMBOLS
  // Guarantee at least two of each required class, then fill to 16 chars
  // from the full pool — comfortably past the 8-char minimum and well into
  // "would take centuries to brute-force" territory.
  const required = [
    ...Array.from({ length: 2 }, () => pick(upper.split(''))),
    ...Array.from({ length: 2 }, () => pick(lower.split(''))),
    ...Array.from({ length: 2 }, () => pick(digits.split(''))),
    ...Array.from({ length: 2 }, () => pick(SYMBOLS.split(''))),
  ]
  const rest = Array.from({ length: 8 }, () => pick(all.split('')))
  const chars = [...required, ...rest]
  // shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

function generatePhrase(): string {
  const chosen = new Set<string>()
  while (chosen.size < 3) chosen.add(pick(WORDS))
  const [a, b, c] = Array.from(chosen)
  const sep = pick(['-', '_', '.'])
  return `${titleCase(a)}${sep}${titleCase(b)}${sep}${titleCase(c)}${randomDigits(3)}${pick(SYMBOLS.split(''))}`
}

function generateFromDetail(rawDetail: string): string {
  const detail = rawDetail.trim().replace(/[^a-zA-Z0-9]/g, '') || pick(WORDS)
  const word = pick(WORDS)
  let other = pick(WORDS)
  while (other === word) other = pick(WORDS)
  const layouts = [
    () => `${titleCase(detail)}${pick(SYMBOLS.split(''))}${titleCase(word)}${randomDigits(3)}`,
    () => `${titleCase(word)}${detail}${titleCase(other)}${randomDigits(2)}${pick(SYMBOLS.split(''))}`,
    () => `${pick(SYMBOLS.split(''))}${titleCase(detail)}${randomDigits(2)}${titleCase(word)}${pick(SYMBOLS.split(''))}`,
  ]
  return pick(layouts)()
}

function meetsRequirements(value: string) {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  )
}

function generateOne(style: Style, detail: string): string {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = style === 'random' ? generateRandom() : style === 'phrase' ? generatePhrase() : generateFromDetail(detail)
    if (meetsRequirements(candidate)) return candidate
  }
  // Fallback: guaranteed to pass the checks above.
  return generateRandom()
}

export function PasswordSuggester({ onSelect }: { onSelect: (password: string) => void }) {
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState<Style>('random')
  const [detail, setDetail] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  function generate() {
    setGenerating(true)
    // Client-side and effectively instant; the tiny delay just lets the
    // spinner register so repeated clicks visibly produce fresh options.
    window.setTimeout(() => {
      setSuggestions(Array.from({ length: 5 }, () => generateOne(style, detail)))
      setGenerating(false)
    }, 150)
  }

  async function copy(value: string, index: number) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedIndex(index)
      window.setTimeout(() => setCopiedIndex((current) => (current === index ? null : current)), 1500)
    } catch {
      /* clipboard unavailable — selecting still fills the field below */
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--accent-1))] hover:underline"
      >
        <Sparkles className="size-3.5" />
        Suggest a password
        <ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-border/70 bg-muted/20 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">What kind of password?</p>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
            {STYLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStyle(option.value)}
                className={`rounded-lg border px-2.5 py-2 text-left text-xs transition-colors ${
                  style === option.value
                    ? 'border-[rgb(var(--accent-1)/0.6)] bg-[rgb(var(--accent-1)/0.08)] text-foreground'
                    : 'border-border bg-background/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="block font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-[10px] leading-snug opacity-80">{option.description}</span>
              </button>
            ))}
          </div>

          {style === 'detail' && (
            <label className="mt-3 grid gap-1.5 text-xs font-medium">
              A word to include (a hobby, pet, team — avoid your real name or birthday)
              <input
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="e.g. skyline"
                maxLength={24}
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[rgb(var(--accent-1)/0.6)]"
              />
              <span className="text-[10px] font-normal text-muted-foreground">
                We mix this with random characters — it won't be used on its own.
              </span>
            </label>
          )}

          <GhButton type="button" magnetic={false} className="mt-3 w-full" disabled={generating} onClick={generate}>
            {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {generating ? 'Generating…' : suggestions.length ? 'Generate 5 more' : 'Generate 5 suggestions'}
          </GhButton>

          {suggestions.length > 0 && (
            <div className="mt-3 grid gap-1.5">
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background/50 px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => { onSelect(suggestion); setOpen(false) }}
                    className="min-w-0 flex-1 truncate text-left font-mono text-xs"
                    title="Use this password"
                  >
                    {suggestion}
                  </button>
                  <button
                    type="button"
                    onClick={() => void copy(suggestion, index)}
                    aria-label="Copy password"
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground"
                  >
                    {copiedIndex === index ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  </button>
                </div>
              ))}
              <p className="mt-1 text-[10px] text-muted-foreground">Tap a suggestion to use it, or the copy icon to copy it.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
