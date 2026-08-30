'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Palette, Trash2 } from 'lucide-react'
import {
  DESIGN_SUGGESTIONS_EVENT,
  deleteDesignSuggestion,
  readDesignSuggestions,
  type DesignSuggestion,
} from '@/lib/design-suggestions'
import { useAuth } from '@/components/providers/auth-provider'
import { createClient } from '@/lib/supabase/client'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function SuggestionCard({ suggestion, mine, onDelete }: { suggestion: DesignSuggestion; mine: boolean; onDelete: (id: string) => void }) {
  return (
    <div className="glass gh-card-hover group relative overflow-hidden rounded-3xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={suggestion.image} alt={suggestion.title} className="h-48 w-full bg-background/60 object-contain" />
      <div className="p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--accent-1))]">
          <Palette className="size-3.5" />
          {suggestion.category}
          {mine && <span className="rounded-full bg-[rgb(var(--accent-1)/0.14)] px-2 py-0.5 normal-case tracking-normal text-[rgb(var(--accent-1))]">You</span>}
        </div>
        <h3 className="mt-3 font-heading text-lg font-bold">{suggestion.title}</h3>
        {suggestion.description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{suggestion.description}</p>}
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">By {suggestion.authorName} · {formatDate(suggestion.createdAt)}</span>
          {suggestion.link && (
            <a
              href={suggestion.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open link for ${suggestion.title}`}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.08)] text-[rgb(var(--accent-1))] transition-transform hover:-translate-y-0.5"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      </div>
      {mine && (
        <button
          type="button"
          onClick={() => onDelete(suggestion.id)}
          aria-label={`Delete ${suggestion.title}`}
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/70 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  )
}

export function DesignSuggestionsGallery() {
  const [suggestions, setSuggestions] = useState<DesignSuggestion[] | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    let cancelled = false
    const load = () => {
      readDesignSuggestions().then((next) => {
        if (!cancelled) setSuggestions(next)
      })
    }
    load()
    window.addEventListener(DESIGN_SUGGESTIONS_EVENT, load)

    const supabase = createClient()
    const channel = supabase
      .channel('design_suggestions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'design_suggestions' }, load)
      .subscribe()

    return () => {
      cancelled = true
      window.removeEventListener(DESIGN_SUGGESTIONS_EVENT, load)
      supabase.removeChannel(channel)
    }
  }, [])

  function handleDelete(id: string) {
    if (!window.confirm('Delete this submission? This can\u2019t be undone.')) return
    void deleteDesignSuggestion(id)
  }

  if (!suggestions) return null

  if (suggestions.length === 0) {
    return (
      <div className="glass mx-auto mt-14 max-w-2xl rounded-3xl p-10 text-center">
        <Palette className="mx-auto size-8 text-[rgb(var(--accent-1))]" />
        <h3 className="mt-4 font-heading text-lg font-bold">No submissions yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">Be the first to share a logo, website design, or UI concept with the community.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-14 max-w-6xl">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--accent-1))]">
        <Palette className="size-4" /> From the community
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((suggestion) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} mine={user?.id === suggestion.authorId} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  )
}
