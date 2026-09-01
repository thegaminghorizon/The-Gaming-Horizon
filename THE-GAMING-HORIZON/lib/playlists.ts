// Per-user playlist store for the Music room. Mirrors the localStorage-backed
// pattern already used by lib/notifications.ts and lib/services.ts, since
// this project has no custom backend for user data. Playlists are namespaced
// by user id so signed-out / different accounts on the same browser never
// see each other's playlists.

import type { QueuedTrack } from './music'

export interface Playlist {
  id: string
  name: string
  tracks: QueuedTrack[]
  createdAt: string
}

const PREFIX = 'gh:playlists:'
const MAX_PLAYLISTS = 40
const MAX_TRACKS_PER_PLAYLIST = 100

// Dispatched on the window whenever a user's playlist set changes, so every
// mounted provider/panel can stay in sync without polling.
export const PLAYLISTS_EVENT = 'gh:playlists-changed'

function storageKey(userKey: string) {
  return `${PREFIX}${userKey}`
}

export function readPlaylists(userKey: string): Playlist[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(storageKey(userKey))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as Playlist[]) : []
  } catch {
    return []
  }
}

function writePlaylists(userKey: string, list: Playlist[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey(userKey), JSON.stringify(list.slice(0, MAX_PLAYLISTS)))
  } catch {
    // Storage is best-effort (private browsing, quota, etc.) — the UI still
    // reflects the in-memory change even if persistence fails.
  }
  window.dispatchEvent(new CustomEvent(PLAYLISTS_EVENT, { detail: { userKey } }))
}

let idCounter = 0
function makePlaylistId() {
  return `pl-${Date.now()}-${++idCounter}`
}

export function findPlaylistByName(userKey: string, name: string): Playlist | null {
  const norm = name.trim().toLowerCase()
  if (!norm) return null
  return readPlaylists(userKey).find((p) => p.name.toLowerCase() === norm) ?? null
}

export type CreatePlaylistError = 'empty-name' | 'duplicate-name' | 'limit-reached'

export function createPlaylist(
  userKey: string,
  name: string,
  initialTracks: QueuedTrack[] = [],
): { playlist: Playlist } | { error: CreatePlaylistError } {
  const trimmed = name.trim()
  if (!trimmed) return { error: 'empty-name' }
  const existing = readPlaylists(userKey)
  if (existing.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) return { error: 'duplicate-name' }
  if (existing.length >= MAX_PLAYLISTS) return { error: 'limit-reached' }

  const playlist: Playlist = {
    id: makePlaylistId(),
    name: trimmed,
    tracks: initialTracks.slice(0, MAX_TRACKS_PER_PLAYLIST),
    createdAt: new Date().toISOString(),
  }
  writePlaylists(userKey, [playlist, ...existing])
  return { playlist }
}

export type AddTrackError = 'not-found' | 'duplicate-track' | 'limit-reached'

export function addTrackToPlaylist(
  userKey: string,
  playlistName: string,
  track: QueuedTrack,
): { playlist: Playlist } | { error: AddTrackError } {
  const existing = readPlaylists(userKey)
  const target = existing.find((p) => p.name.toLowerCase() === playlistName.trim().toLowerCase())
  if (!target) return { error: 'not-found' }
  if (target.tracks.some((t) => t.url === track.url)) return { error: 'duplicate-track' }
  if (target.tracks.length >= MAX_TRACKS_PER_PLAYLIST) return { error: 'limit-reached' }

  const updated: Playlist = { ...target, tracks: [...target.tracks, track] }
  writePlaylists(userKey, existing.map((p) => (p.id === updated.id ? updated : p)))
  return { playlist: updated }
}

export type AddTracksError = 'not-found' | 'empty'

// Adds every track in `tracks` to an existing playlist in one write (used
// when saving an entire currently-playing queue/playlist into another saved
// playlist, instead of only the single track that's playing). Duplicates
// (matched by url) and anything past the per-playlist track cap are silently
// skipped rather than failing the whole operation, and the counts are
// returned so the caller can tell the user exactly what happened.
export function addTracksToPlaylist(
  userKey: string,
  playlistName: string,
  tracks: QueuedTrack[],
): { playlist: Playlist; addedCount: number; duplicateCount: number; skippedForLimit: number } | { error: AddTracksError } {
  if (tracks.length === 0) return { error: 'empty' }
  const existing = readPlaylists(userKey)
  const target = existing.find((p) => p.name.toLowerCase() === playlistName.trim().toLowerCase())
  if (!target) return { error: 'not-found' }

  const seenUrls = new Set(target.tracks.map((t) => t.url))
  const toAdd: QueuedTrack[] = []
  let duplicateCount = 0
  let skippedForLimit = 0
  for (const track of tracks) {
    if (seenUrls.has(track.url)) {
      duplicateCount += 1
      continue
    }
    if (target.tracks.length + toAdd.length >= MAX_TRACKS_PER_PLAYLIST) {
      skippedForLimit += 1
      continue
    }
    seenUrls.add(track.url)
    toAdd.push(track)
  }

  const updated: Playlist = { ...target, tracks: [...target.tracks, ...toAdd] }
  writePlaylists(userKey, existing.map((p) => (p.id === updated.id ? updated : p)))
  return { playlist: updated, addedCount: toAdd.length, duplicateCount, skippedForLimit }
}

export function removeTrackFromPlaylist(userKey: string, playlistId: string, trackId: string) {
  const existing = readPlaylists(userKey)
  writePlaylists(
    userKey,
    existing.map((p) => (p.id === playlistId ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) } : p)),
  )
}

export function deletePlaylist(userKey: string, playlistId: string) {
  writePlaylists(userKey, readPlaylists(userKey).filter((p) => p.id !== playlistId))
}
