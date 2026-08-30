import { NextResponse } from 'next/server'

// Keyless YouTube search. There's no backend search API configured (no
// YouTube Data API key), so this route fetches YouTube's public search
// results page server-side (avoiding the browser's CORS restriction) and
// pulls video results out of the same `ytInitialData` JSON blob the page
// itself renders from. This is what lets "/play <any song name>" resolve
// and play something real from YouTube instead of only the small curated
// demo catalog in lib/music.ts.
export const runtime = 'nodejs'

interface YoutubeSearchResult {
  videoId: string
  title: string
  thumbnail: string
  channel?: string
}

function extractInitialData(html: string): unknown {
  const patterns = [
    /var ytInitialData\s*=\s*(\{.+?\});<\/script>/s,
    /window\["ytInitialData"\]\s*=\s*(\{.+?\});/s,
    /ytInitialData"\]\s*=\s*(\{.+?\});/s,
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      try {
        return JSON.parse(match[1])
      } catch {
        // Try the next pattern.
      }
    }
  }
  return null
}

// Walks the deeply nested ytInitialData tree collecting every
// `videoRenderer` node (each one is a single search-result video card).
function collectVideoRenderers(node: unknown, out: Record<string, unknown>[] = [], depth = 0): Record<string, unknown>[] {
  if (!node || typeof node !== 'object' || depth > 40) return out
  if (Array.isArray(node)) {
    for (const item of node) collectVideoRenderers(item, out, depth + 1)
    return out
  }
  const obj = node as Record<string, unknown>
  if (obj.videoRenderer && typeof obj.videoRenderer === 'object') {
    out.push(obj.videoRenderer as Record<string, unknown>)
  }
  for (const key of Object.keys(obj)) {
    if (key === 'videoRenderer') continue
    collectVideoRenderers(obj[key], out, depth + 1)
  }
  return out
}

function textFromRuns(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const runs = (value as { runs?: Array<{ text?: string }> }).runs
  if (!Array.isArray(runs)) return ''
  return runs.map((run) => run.text ?? '').join('')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = (searchParams.get('q') || '').trim()
  if (!query) {
    return NextResponse.json({ results: [] as YoutubeSearchResult[] }, { status: 400 })
  }

  try {
    const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en`, {
      headers: {
        // A browser-like UA/Accept-Language is required — YouTube serves a
        // stripped-down page (no ytInitialData) to obvious bot requests.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cache: 'no-store',
    })
    if (!res.ok) {
      return NextResponse.json({ results: [] as YoutubeSearchResult[] }, { status: 502 })
    }
    const html = await res.text()
    const data = extractInitialData(html)
    if (!data) {
      return NextResponse.json({ results: [] as YoutubeSearchResult[] }, { status: 502 })
    }

    const renderers = collectVideoRenderers(data)
    const results: YoutubeSearchResult[] = []
    const seen = new Set<string>()

    for (const renderer of renderers) {
      const videoId = typeof renderer.videoId === 'string' ? renderer.videoId : null
      const title = textFromRuns(renderer.title)
      if (!videoId || !title || seen.has(videoId)) continue
      seen.add(videoId)

      const thumbnails = (renderer.thumbnail as { thumbnails?: Array<{ url?: string }> } | undefined)?.thumbnails
      const bestThumb = Array.isArray(thumbnails) && thumbnails.length ? thumbnails[thumbnails.length - 1]?.url : undefined

      results.push({
        videoId,
        title,
        thumbnail: bestThumb || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        channel: textFromRuns(renderer.ownerText) || undefined,
      })

      if (results.length >= 8) break
    }

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] as YoutubeSearchResult[] }, { status: 502 })
  }
}
