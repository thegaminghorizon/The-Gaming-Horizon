import { NextResponse } from 'next/server'

// Generic music-link resolver. Rather than hand-writing a scraper for every
// platform (Apple Music, SoundCloud, Deezer, Tidal, Amazon Music, Bandcamp,
// ...), this fetches the page server-side (avoiding the browser's CORS
// restriction) and pulls a title/artwork out of it the same way chat apps
// unfurl a link preview:
//
//   1. oEmbed discovery — look for the page's own
//      <link type="application/json+oembed" href="..."> tag (most
//      streaming platforms, including Apple Music and SoundCloud, publish
//      one) and fetch that for a first-party title + thumbnail.
//   2. Open Graph / Twitter Card meta tags (og:title, og:image,
//      og:site_name, twitter:title) — near-universal fallback most pages
//      ship regardless of oEmbed support.
//   3. The page's <title> tag as a last resort.
//
// The resolved title is then matched to a real YouTube video client-side
// (see fetchGenericLinkMetadata / resolveTrack) — this route never returns
// anything playable itself, only metadata to search with.
export const runtime = 'nodejs'

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
}

function extractAttr(tag: string, attr: string): string | null {
  const re = new RegExp(`${attr}=["']([^"']*)["']`, 'i')
  const match = tag.match(re)
  return match?.[1] ?? null
}

// Finds a <link ... type="application/json+oembed" ... href="..."> tag
// regardless of attribute order.
function findOembedUrl(html: string): string | null {
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? []
  for (const tag of linkTags) {
    const type = extractAttr(tag, 'type')
    if (type && /application\/(json|xml)\+oembed/i.test(type)) {
      const href = extractAttr(tag, 'href')
      if (href) return href
    }
  }
  return null
}

// Finds a <meta ... property|name="X" ... content="..."> tag regardless of
// attribute order, for a given property/name value.
function findMetaContent(html: string, key: string): string | null {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? []
  for (const tag of metaTags) {
    const prop = extractAttr(tag, 'property') ?? extractAttr(tag, 'name')
    if (prop && prop.toLowerCase() === key.toLowerCase()) {
      const content = extractAttr(tag, 'content')
      if (content) return content
    }
  }
  return null
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function extractTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  return match?.[1] ? decodeEntities(match[1]).trim() : null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const target = searchParams.get('url') || ''

  let parsed: URL
  try {
    parsed = new URL(target)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('bad protocol')
  } catch {
    return NextResponse.json({ title: null, thumbnail: null, siteName: null }, { status: 400 })
  }

  try {
    const pageRes = await fetch(parsed.toString(), { headers: BROWSER_HEADERS, cache: 'no-store' })
    if (!pageRes.ok) {
      return NextResponse.json({ title: null, thumbnail: null, siteName: null }, { status: 502 })
    }
    const html = await pageRes.text()

    // 1) oEmbed discovery — best quality when a platform supports it.
    const oembedUrl = findOembedUrl(html)
    if (oembedUrl) {
      try {
        const absoluteOembedUrl = new URL(oembedUrl, parsed.toString()).toString()
        const oembedRes = await fetch(absoluteOembedUrl, { headers: BROWSER_HEADERS, cache: 'no-store' })
        if (oembedRes.ok) {
          const data = await oembedRes.json()
          const title = typeof data?.title === 'string' ? data.title.trim() : ''
          if (title) {
            return NextResponse.json({
              title,
              thumbnail: typeof data?.thumbnail_url === 'string' ? data.thumbnail_url : null,
              siteName: typeof data?.provider_name === 'string' ? data.provider_name : null,
            })
          }
        }
      } catch {
        // Fall through to meta-tag scraping below.
      }
    }

    // 2) Open Graph / Twitter Card meta tags.
    const ogTitle = findMetaContent(html, 'og:title') || findMetaContent(html, 'twitter:title')
    const ogImage = findMetaContent(html, 'og:image') || findMetaContent(html, 'twitter:image')
    const siteName = findMetaContent(html, 'og:site_name')
    if (ogTitle) {
      return NextResponse.json({
        title: decodeEntities(ogTitle).trim(),
        thumbnail: ogImage ? decodeEntities(ogImage).trim() : null,
        siteName: siteName ? decodeEntities(siteName).trim() : null,
      })
    }

    // 3) Bare <title> tag as a last resort.
    const titleTag = extractTitleTag(html)
    if (titleTag) {
      return NextResponse.json({ title: titleTag, thumbnail: ogImage, siteName })
    }

    return NextResponse.json({ title: null, thumbnail: null, siteName: null }, { status: 404 })
  } catch {
    return NextResponse.json({ title: null, thumbnail: null, siteName: null }, { status: 502 })
  }
}
