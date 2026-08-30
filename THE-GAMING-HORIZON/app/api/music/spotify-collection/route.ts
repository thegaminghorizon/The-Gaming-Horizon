import { NextResponse } from 'next/server'

// Keyless Spotify playlist/album track listing. There's no Spotify Web API
// credentials configured (that flow needs a client id/secret even for public
// data), so instead this route fetches Spotify's public, unauthenticated
// *embed* page — https://open.spotify.com/embed/playlist/<id> — server-side
// (avoiding the browser's CORS restriction) and pulls the track list out of
// the `__NEXT_DATA__` JSON blob the page itself renders from. This is what
// lets a whole playlist/album link queue every track (each later matched to
// a YouTube video in lib/music.ts) instead of only single track links.
//
// Caveat: the embed page only ships a bounded slice of a large playlist's
// tracks (not the full thing for huge playlists), and Spotify can change
// this markup at any time without notice — this is inherently best-effort
// scraping, not a stable API.
export const runtime = 'nodejs'

interface CollectionTrack {
  title: string
  artist: string
}

function extractNextData(html: string): unknown {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.+?)<\/script>/s)
  if (!match?.[1]) return null
  try {
    return JSON.parse(match[1])
  } catch {
    return null
  }
}

// Spotify's embed page nests the entity a few different ways depending on
// the build; rather than depend on one exact path, walk the whole tree for
// the first `trackList` array (or `tracks.items`) shaped like actual tracks.
function findTrackList(node: unknown, depth = 0): unknown[] | null {
  if (!node || typeof node !== 'object' || depth > 25) return null
  const obj = node as Record<string, unknown>

  if (Array.isArray((obj as { trackList?: unknown }).trackList)) {
    const list = (obj as { trackList: unknown[] }).trackList
    if (list.length && looksLikeTrack(list[0])) return list
  }
  if (Array.isArray((obj as { items?: unknown }).items)) {
    const list = (obj as { items: unknown[] }).items
    if (list.length && looksLikeTrack(unwrapItem(list[0]))) return list.map(unwrapItem)
  }

  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (value && typeof value === 'object') {
      const found = findTrackList(value, depth + 1)
      if (found) return found
    }
  }
  return null
}

function unwrapItem(item: unknown): unknown {
  if (item && typeof item === 'object' && 'track' in (item as Record<string, unknown>)) {
    return (item as Record<string, unknown>).track
  }
  return item
}

function looksLikeTrack(item: unknown): boolean {
  if (!item || typeof item !== 'object') return false
  const obj = item as Record<string, unknown>
  const hasTitle = typeof obj.title === 'string' || typeof obj.name === 'string'
  const hasArtistish =
    typeof obj.subtitle === 'string' ||
    Array.isArray((obj as { artists?: unknown[] }).artists)
  return hasTitle && hasArtistish
}

function artistFrom(item: Record<string, unknown>): string {
  if (typeof item.subtitle === 'string') return item.subtitle
  const artists = (item as { artists?: Array<{ name?: string }> }).artists
  if (Array.isArray(artists)) {
    return artists.map((a) => a?.name).filter(Boolean).join(', ')
  }
  return ''
}

function findEntityName(node: unknown, depth = 0): string | null {
  if (!node || typeof node !== 'object' || depth > 25) return null
  const obj = node as Record<string, unknown>
  if (typeof obj.name === 'string' && (obj.type === 'playlist' || obj.type === 'album')) {
    return obj.name
  }
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (value && typeof value === 'object') {
      const found = findEntityName(value, depth + 1)
      if (found) return found
    }
  }
  return null
}

// Spotify's embed page itself only ships a bounded slice of a very large
// playlist's tracks (not guaranteed to be the literal full thing for e.g.
// 300+ song playlists) — that's an upstream limit we can't control. This
// constant used to additionally cap it at 40 on our own end, which is what
// was truncating normal-sized playlists (e.g. a 61-track playlist coming
// back as only 40). Raised well above what the embed page realistically
// returns so our own code is never the bottleneck.
const MAX_TRACKS = 150

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const kind = searchParams.get('kind')
  const id = searchParams.get('id') || ''
  if ((kind !== 'playlist' && kind !== 'album') || !id) {
    return NextResponse.json({ name: null, tracks: [] as CollectionTrack[] }, { status: 400 })
  }

  try {
    const res = await fetch(`https://open.spotify.com/embed/${kind}/${id}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cache: 'no-store',
    })
    if (!res.ok) {
      return NextResponse.json({ name: null, tracks: [] as CollectionTrack[] }, { status: 502 })
    }
    const html = await res.text()
    const data = extractNextData(html)
    if (!data) {
      return NextResponse.json({ name: null, tracks: [] as CollectionTrack[] }, { status: 502 })
    }

    const rawList = findTrackList(data) ?? []
    const name = findEntityName(data)

    const tracks: CollectionTrack[] = []
    for (const raw of rawList) {
      const item = raw as Record<string, unknown>
      const title = typeof item.title === 'string' ? item.title : typeof item.name === 'string' ? (item.name as string) : ''
      if (!title) continue
      tracks.push({ title, artist: artistFrom(item) })
      if (tracks.length >= MAX_TRACKS) break
    }

    return NextResponse.json({ name, tracks })
  } catch {
    return NextResponse.json({ name: null, tracks: [] as CollectionTrack[] }, { status: 502 })
  }
}
