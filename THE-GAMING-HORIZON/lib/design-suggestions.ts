// Community design suggestions — logos, website concepts, UI mockups, and
// similar fan-made work players want to show off. Stored centrally in
// Supabase (see supabase/migrations/0002_design_suggestions.sql) so a
// submission is visible to every player, not just the device that uploaded
// it. The image itself is stored as a compressed base64 data URL, the same
// technique already used for profile avatars and blog cover images.

import { createClient } from '@/lib/supabase/client'

export const DESIGN_SUGGESTIONS_EVENT = 'gh:design-suggestions-changed'

export const DESIGN_SUGGESTION_CATEGORIES = ['Logo', 'Website Design', 'UI Concept', 'Other'] as const
export type DesignSuggestionCategory = (typeof DESIGN_SUGGESTION_CATEGORIES)[number]

export interface DesignSuggestion {
  id: string
  title: string
  description: string
  category: string
  image: string
  link?: string
  authorId: string
  authorName: string
  authorInitials: string
  createdAt: string
}

interface DesignSuggestionRow {
  id: string
  title: string
  description: string
  category: string
  image: string
  link: string | null
  author_id: string
  author_name: string
  author_initials: string
  created_at: string
}

function rowToSuggestion(row: DesignSuggestionRow): DesignSuggestion {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    image: row.image,
    link: row.link ?? undefined,
    authorId: row.author_id,
    authorName: row.author_name,
    authorInitials: row.author_initials,
    createdAt: row.created_at,
  }
}

function notifyChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(DESIGN_SUGGESTIONS_EVENT))
}

// Newest first, so freshly submitted designs lead the gallery.
export async function readDesignSuggestions(): Promise<DesignSuggestion[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('design_suggestions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return (data as DesignSuggestionRow[]).map(rowToSuggestion)
}

export async function submitDesignSuggestion(input: {
  title: string
  description: string
  category: string
  image: string
  link?: string
  authorId: string
  authorName: string
  authorInitials: string
}): Promise<{ ok: true; suggestion: DesignSuggestion } | { ok: false; error: string }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('design_suggestions')
    .insert({
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category.trim() || 'Other',
      image: input.image,
      link: input.link?.trim() || null,
      author_id: input.authorId,
      author_name: input.authorName,
      author_initials: input.authorInitials,
    })
    .select('*')
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message || 'This design could not be submitted. Please try again.' }
  }
  notifyChanged()
  return { ok: true, suggestion: rowToSuggestion(data as DesignSuggestionRow) }
}

export async function deleteDesignSuggestion(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('design_suggestions').delete().eq('id', id)
  notifyChanged()
}
