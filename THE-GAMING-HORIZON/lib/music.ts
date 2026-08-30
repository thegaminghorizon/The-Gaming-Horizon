// Frontend music-room engine for Gaming Horizon.
// Parses song links (YouTube and Spotify), resolves a display title via each
// service's public oEmbed endpoint (no API key required), supports a mock
// song-name lookup, and models a Jockie-style chat + queue: every command
// starts with "/" — "/play <link or song name>" is the only way to queue and
// start playback (a bare link or plain song name typed without "/" is never
// auto-played). Every track — however it was found — plays through the same
// hidden YouTube IFrame player the UI drives directly (play/pause/seek/
// volume). A Spotify link is only ever used to look up what the song is
// (via Spotify's oEmbed) — it is never handed to Spotify's own embedded
// player, since that embed silently caps non-Premium playback at a 30-second
// preview. Instead the resolved title is matched to a real YouTube video and
// that plays in full, exactly like a native YouTube link or a typed song
// name would.

export type TrackSource = 'youtube' | 'spotify'

// ---------------------------------------------------------------------------
// General platform detection — used purely for the "via <Platform>" badge
// (queue list, now-playing card) and for the friendly name shown while
// resolving a link. Every link, whichever platform it's from, still ends up
// playing through the same in-app YouTube player (see resolveTrack in the
// music provider) — this just labels where it was found.
// ---------------------------------------------------------------------------

const PLATFORM_HOST_LABELS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /(^|\.)music\.youtube\.com$/, label: 'YouTube Music' },
  { pattern: /(^|\.)youtube\.com$/, label: 'YouTube' },
  { pattern: /(^|\.)youtu\.be$/, label: 'YouTube' },
  { pattern: /(^|\.)open\.spotify\.com$/, label: 'Spotify' },
  { pattern: /(^|\.)music\.apple\.com$/, label: 'Apple Music' },
  { pattern: /(^|\.)soundcloud\.com$/, label: 'SoundCloud' },
  { pattern: /(^|\.)deezer\.com$/, label: 'Deezer' },
  { pattern: /(^|\.)tidal\.com$/, label: 'Tidal' },
  { pattern: /(^|\.)music\.amazon\.[a-z.]+$/, label: 'Amazon Music' },
  { pattern: /(^|\.)bandcamp\.com$/, label: 'Bandcamp' },
  { pattern: /(^|\.)audiomack\.com$/, label: 'Audiomack' },
  { pattern: /(^|\.)pandora\.com$/, label: 'Pandora' },
  { pattern: /(^|\.)napster\.com$/, label: 'Napster' },
  { pattern: /(^|\.)iheart\.com$/, label: 'iHeartRadio' },
  { pattern: /(^|\.)music\.yandex\.[a-z.]+$/, label: 'Yandex Music' },
  { pattern: /(^|\.)qobuz\.com$/, label: 'Qobuz' },
  { pattern: /(^|\.)anghami\.com$/, label: 'Anghami' },
  { pattern: /(^|\.)gaana\.com$/, label: 'Gaana' },
  { pattern: /(^|\.)jiosaavn\.com$/, label: 'JioSaavn' },
  { pattern: /(^|\.)boomplay\.com$/, label: 'Boomplay' },
  { pattern: /(^|\.)audius\.co$/, label: 'Audius' },
  { pattern: /(^|\.)mixcloud\.com$/, label: 'Mixcloud' },
  { pattern: /(^|\.)vimeo\.com$/, label: 'Vimeo' },
]

/**
 * Friendly platform name for a link, e.g. "Apple Music", "SoundCloud", or —
 * for a music link from a site not in the curated list above — a
 * Title Cased guess from the domain itself ("Napster.com" -> "Napster"). One
 * of these is shown as "via <label>" wherever a track's origin link isn't
 * YouTube. Returns null for anything that isn't a URL at all.
 */
export function detectLinkPlatformLabel(rawUrl: string): string | null {
  let host: string
  try {
    host = new URL(rawUrl.trim()).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
  for (const { pattern, label } of PLATFORM_HOST_LABELS) {
    if (pattern.test(host)) return label
  }
  // Unrecognised host — fall back to a readable guess from the domain's
  // first label, e.g. "myfavoritemusicsite.io" -> "Myfavoritemusicsite".
  const firstLabel = host.split('.')[0]
  if (!firstLabel) return null
  return firstLabel.charAt(0).toUpperCase() + firstLabel.slice(1)
}

/** True for any link whose platform badge would read "via YouTube" — i.e. it already plays natively, no badge needed. */
export function isYoutubeHost(rawUrl: string): boolean {
  try {
    const host = new URL(rawUrl.trim()).hostname.toLowerCase().replace(/^www\./, '')
    return /(^|\.)youtube\.com$/.test(host) || /(^|\.)youtu\.be$/.test(host)
  } catch {
    return false
  }
}

export interface QueuedTrack {
  id: string
  /** Always 'youtube' now — every track, however it was resolved (a YouTube
   *  link, a typed song name, or a Spotify link looked up and matched to a
   *  YouTube video), plays through the same in-app player. Kept as a union
   *  (rather than narrowed to the literal) so the field stays meaningful if
   *  another playable source is ever added. */
  source: TrackSource
  /** YouTube video id — always populated, since this is what actually plays. */
  videoId: string
  /** The original link/query the track was resolved from. If this is a
   *  Spotify URL, `isSpotifyUrl(url)` tells the UI to show a "via Spotify"
   *  badge even though playback itself runs through YouTube. */
  url: string
  title: string
  thumbnail: string
  addedAt: Date
}

export interface MusicChatMessage {
  id: string
  kind: 'user' | 'system' | 'error'
  text: string
  track?: QueuedTrack
  timestamp: Date
}

let idCounter = 0
export function makeMusicId(prefix = 'mm') {
  return `${prefix}-${++idCounter}-${Date.now()}`
}

// Matches youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, youtube.com/embed/, music.youtube.com
const YOUTUBE_PATTERNS: RegExp[] = [
  /(?:youtube\.com|music\.youtube\.com)\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/,
  /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
]

export function extractYoutubeId(rawUrl: string): string | null {
  const trimmed = rawUrl.trim()
  if (!trimmed) return null
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

export function isLikelyUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

interface OEmbedResult {
  title: string
  thumbnail: string
}

// YouTube's oEmbed endpoint is public, key-free, and CORS-enabled — it lets
// us show a real track title/thumbnail without a backend or API key.
export async function fetchYoutubeOEmbed(videoId: string): Promise<OEmbedResult> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`)
    if (!res.ok) throw new Error('oEmbed request failed')
    const data = await res.json()
    return {
      title: typeof data.title === 'string' && data.title ? data.title : 'Untitled track',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    }
  } catch {
    return { title: 'Untitled track', thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` }
  }
}

export function formatQueuePosition(index: number): string {
  if (index === 0) return 'now playing'
  if (index === 1) return 'up next'
  return `#${index + 1} in queue`
}

// mm:ss formatter for the seek bar / duration readout. Falls back to 0:00
// for NaN/Infinity, which the YouTube API briefly reports before a track
// has finished buffering.
export function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00'
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Spotify links
// ---------------------------------------------------------------------------

// Matches open.spotify.com/track/<id> or open.spotify.com/intl-xx/track/<id>,
// with or without query params, and the spotify:track:<id> URI form.
const SPOTIFY_URL_PATTERN = /open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|album|playlist|episode|show)\/([a-zA-Z0-9]{22})/
const SPOTIFY_URI_PATTERN = /spotify:(track|album|playlist|episode|show):([a-zA-Z0-9]{22})/

export interface SpotifyRef {
  kind: 'track' | 'album' | 'playlist' | 'episode' | 'show'
  id: string
}

export function extractSpotifyRef(rawUrl: string): SpotifyRef | null {
  const trimmed = rawUrl.trim()
  const match = trimmed.match(SPOTIFY_URL_PATTERN) || trimmed.match(SPOTIFY_URI_PATTERN)
  if (!match) return null
  return { kind: match[1] as SpotifyRef['kind'], id: match[2] }
}

export function isSpotifyUrl(value: string): boolean {
  return extractSpotifyRef(value) !== null
}

// Spotify's oEmbed endpoint is public and key-free, same idea as YouTube's —
// it gives us a real title/artist and artwork so the link can be matched to
// a YouTube video (see resolveTrack in the music provider). It is a lookup
// only: the track never actually plays through Spotify's own embed, since
// that embed caps non-Premium playback at a 30-second preview.
export async function fetchSpotifyOEmbed(ref: SpotifyRef): Promise<OEmbedResult> {
  const canonicalUrl = `https://open.spotify.com/${ref.kind}/${ref.id}`
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(canonicalUrl)}`)
    if (!res.ok) throw new Error('Spotify oEmbed request failed')
    const data = await res.json()
    return {
      title: typeof data.title === 'string' && data.title ? data.title : spotifyFallbackTitle(ref.kind),
      thumbnail: typeof data.thumbnail_url === 'string' && data.thumbnail_url ? data.thumbnail_url : '',
    }
  } catch {
    return { title: spotifyFallbackTitle(ref.kind), thumbnail: '' }
  }
}

function spotifyFallbackTitle(kind: SpotifyRef['kind']): string {
  switch (kind) {
    case 'playlist': return 'Spotify playlist'
    case 'album': return 'Spotify album'
    case 'episode': return 'Spotify episode'
    case 'show': return 'Spotify show'
    default: return 'Spotify track'
  }
}

// ---------------------------------------------------------------------------
// Any other music platform link (Apple Music, SoundCloud, Deezer, Tidal,
// Amazon Music, Bandcamp, and effectively anything else that isn't YouTube
// or Spotify) — resolved generically instead of one-by-one per platform.
// Calls the server-side route in app/api/music/link-metadata, which fetches
// the page and pulls a title (and artwork, where available) from the page's
// own oEmbed link or Open Graph/Twitter meta tags — the same mechanism chat
// apps use to unfurl a link preview. That title is then matched to a real
// YouTube video, exactly like a Spotify link is (see resolveTrack in the
// music provider) — nothing is ever embedded from the original site itself.
// ---------------------------------------------------------------------------

export interface GenericLinkMetadata {
  title: string
  thumbnail: string
  siteName: string | null
}

export async function fetchGenericLinkMetadata(rawUrl: string): Promise<GenericLinkMetadata | null> {
  try {
    const res = await fetch(`/api/music/link-metadata?url=${encodeURIComponent(rawUrl.trim())}`)
    if (!res.ok) return null
    const data = await res.json()
    const title = typeof data?.title === 'string' ? data.title.trim() : ''
    if (!title) return null
    return {
      title,
      thumbnail: typeof data?.thumbnail === 'string' ? data.thumbnail : '',
      siteName: typeof data?.siteName === 'string' && data.siteName ? data.siteName : null,
    }
  } catch {
    return null
  }
}

export interface SpotifyCollectionTrack {
  title: string
  artist: string
}

export interface SpotifyCollection {
  name: string
  tracks: SpotifyCollectionTrack[]
}

// Fetches every track in a Spotify playlist or album (via the server-side
// scrape in app/api/music/spotify-collection — see that route for how, and
// its caveats) so the whole thing can be queued, one YouTube-matched track
// at a time, instead of only single track links working.
export async function fetchSpotifyCollection(ref: SpotifyRef): Promise<SpotifyCollection | null> {
  if (ref.kind !== 'playlist' && ref.kind !== 'album') return null
  try {
    const res = await fetch(`/api/music/spotify-collection?kind=${ref.kind}&id=${encodeURIComponent(ref.id)}`)
    if (!res.ok) return null
    const data = await res.json()
    const tracks = Array.isArray(data?.tracks) ? (data.tracks as SpotifyCollectionTrack[]) : []
    if (tracks.length === 0) return null
    return {
      name: typeof data?.name === 'string' && data.name ? data.name : spotifyFallbackTitle(ref.kind),
      tracks,
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Song-name search (mock lookup)
// ---------------------------------------------------------------------------
// There's no backend here and no third-party search API key configured, so
// typed song names resolve against a local demo catalog instead of a real
// search index. Swap `searchMockCatalog` for a call to a real search/lookup
// API (YouTube Data API, Spotify Web API, etc.) once one is wired up
// server-side.

interface CatalogEntry {
  title: string
  artist: string
  videoId: string
}

const MOCK_CATALOG: CatalogEntry[] = [
  { title: 'Never Gonna Give You Up', artist: 'Rick Astley', videoId: 'dQw4w9WgXcQ' },
  { title: 'Gangnam Style', artist: 'PSY', videoId: '9bZkp7q19f0' },
  { title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', videoId: 'kJQP7kiw5Fk' },
  { title: 'Shape of You', artist: 'Ed Sheeran', videoId: 'JGwWNGJdvx8' },
  { title: 'Bohemian Rhapsody', artist: 'Queen', videoId: 'fJ9rUzIMcZQ' },
  { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', videoId: 'OPf0YbXqDm0' },
  { title: 'See You Again', artist: 'Wiz Khalifa ft. Charlie Puth', videoId: 'RgKAFK5djSk' },
  { title: 'Baby', artist: 'Justin Bieber ft. Ludacris', videoId: 'kffacxfA7G4' },
  { title: 'Dark Horse', artist: 'Katy Perry ft. Juicy J', videoId: '0KSOMA3QBU0' },
  { title: 'Shake It Off', artist: 'Taylor Swift', videoId: 'nfWlot6h_JM' },
  { title: 'Sugar', artist: 'Maroon 5', videoId: '09R8_2nJtjg' },
  { title: 'Happy', artist: 'Pharrell Williams', videoId: 'ZbZSe6N_BXs' },
  { title: 'Gentleman', artist: 'PSY', videoId: 'ASO_zypdnsQ' },
  { title: 'Hello', artist: 'Adele', videoId: 'YQHsXMglC9A' },
  { title: 'Believer', artist: 'Imagine Dragons', videoId: '7wtfhZwyrcc' },
  { title: 'Closer', artist: 'The Chainsmokers ft. Halsey', videoId: 'PT2_F-1esPk' },
  { title: 'Perfect', artist: 'Ed Sheeran', videoId: '2Vv-BfVoq4g' },
  { title: 'Attention', artist: 'Charlie Puth', videoId: 'nfs8NYg7yQM' },
  { title: '24K Magic', artist: 'Bruno Mars', videoId: 'UqyT8IEBkvY' },
  { title: 'bad guy', artist: 'Billie Eilish', videoId: 'DyDfgMOUjCI' },
  { title: 'Blinding Lights', artist: 'The Weeknd', videoId: '4NRXx6U8ABQ' },
  { title: 'thank u, next', artist: 'Ariana Grande', videoId: 'gl1aHhXnN1k' },
  { title: 'Sunflower', artist: 'Post Malone & Swae Lee', videoId: 'ApXoWvfEYVU' },
  { title: 'Señorita', artist: 'Shawn Mendes & Camila Cabello', videoId: 'Pkh8UtuejGw' },
  { title: 'Roar', artist: 'Katy Perry', videoId: 'CevxZvSJLk8' },
  { title: 'Counting Stars', artist: 'OneRepublic', videoId: 'hT_nvWreIhg' },
  { title: 'Waka Waka (This Time for Africa)', artist: 'Shakira', videoId: 'pRpeEdMmmQ0' },
  { title: 'Faded', artist: 'Alan Walker', videoId: '60ItHLz5WEA' },
  { title: 'Havana', artist: 'Camila Cabello ft. Young Thug', videoId: 'BQ0mxQXmLsk' },
  { title: 'Wrecking Ball', artist: 'Miley Cyrus', videoId: 'My2FRPA3Gf8' },
  { title: 'Bones', artist: 'Imagine Dragons', videoId: 'TO-_3tck2tg' },
]

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

// Very small scored substring match against title + artist — good enough
// for a local demo catalog, not a real search engine.
export function searchMockCatalog(query: string): CatalogEntry | null {
  const q = normalize(query)
  if (!q) return null
  let best: { entry: CatalogEntry; score: number } | null = null
  for (const entry of MOCK_CATALOG) {
    const haystack = normalize(`${entry.title} ${entry.artist}`)
    if (haystack === q || normalize(entry.title) === q) {
      return entry
    }
    let score = 0
    if (haystack.includes(q) || normalize(entry.title).includes(q)) score += 2
    for (const token of q.split(' ')) {
      if (token.length > 1 && haystack.includes(token)) score += 1
    }
    if (score > 0 && (!best || score > best.score)) best = { entry, score }
  }
  return best?.entry ?? null
}

// ---------------------------------------------------------------------------
// Live YouTube search — used by "/play <song name>" so ANY song name
// resolves and plays, not just the curated demo catalog above. Calls the
// server-side keyless search route in
// app/api/music/search/route.ts (no YouTube Data API key required).
// ---------------------------------------------------------------------------

export interface YoutubeSearchResult {
  videoId: string
  title: string
  thumbnail: string
  channel?: string
}

export async function searchYoutube(query: string): Promise<YoutubeSearchResult[]> {
  const q = query.trim()
  if (!q) return []
  try {
    const res = await fetch(`/api/music/search?q=${encodeURIComponent(q)}`)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data?.results) ? (data.results as YoutubeSearchResult[]) : []
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Slash commands ("/play <query or URL>", "/skip", "/volume 50", ...)
// ---------------------------------------------------------------------------
// Every command in the Music room starts with "/" — mirrors how command
// palettes and modern chat bots (Discord slash commands) work. There is no
// bare-word ("play", "pause", "skip"...) fallback and no plain-link/plain
// song-name fallback: nothing plays unless it goes through "/play", so a
// pasted link, a typed song name, or a song literally titled "Play" can
// never be misread as an action.

export type SlashCommandType =
  | 'play'
  | 'skip'
  | 'voteskip'
  | 'pause'
  | 'resume'
  | 'previous'
  | 'stop'
  | 'loop'
  | 'unloop'
  | 'queue'
  | 'np'
  | 'volume'
  | 'setup'
  | 'clean'
  | 'faq'
  | 'help'
  | 'playlist'

export interface SlashCommand {
  type: SlashCommandType
  /** Everything after the command name, trimmed. Empty string if none. */
  arg: string
}

const SLASH_ALIASES: Record<string, SlashCommandType> = {
  play: 'play',
  p: 'play',
  skip: 'skip',
  s: 'skip',
  next: 'skip',
  forward: 'skip',
  voteskip: 'voteskip',
  'vote-skip': 'voteskip',
  'vote_skip': 'voteskip',
  pause: 'pause',
  resume: 'resume',
  unpause: 'resume',
  previous: 'previous',
  prev: 'previous',
  rewind: 'previous',
  back: 'previous',
  stop: 'stop',
  leave: 'stop',
  dc: 'stop',
  disconnect: 'stop',
  loop: 'loop',
  repeat: 'loop',
  unloop: 'unloop',
  unrepeat: 'unloop',
  noloop: 'unloop',
  norepeat: 'unloop',
  queue: 'queue',
  q: 'queue',
  np: 'np',
  nowplaying: 'np',
  'now-playing': 'np',
  volume: 'volume',
  vol: 'volume',
  setup: 'setup',
  clean: 'clean',
  clear: 'clean',
  faq: 'faq',
  help: 'help',
  commands: 'help',
  playlist: 'playlist',
  playlists: 'playlist',
  pl: 'playlist',
}

// Parses a leading-slash command, e.g. "/play bones" -> { type: 'play', arg: 'bones' }.
// Returns null for anything that doesn't start with "/" or isn't a
// recognised command name, so plain links/song names/free text are left
// completely untouched.
export function parseSlashCommand(raw: string): SlashCommand | null {
  const trimmed = raw.trim()
  if (!trimmed.startsWith('/')) return null
  const withoutSlash = trimmed.slice(1)
  const firstSpace = withoutSlash.search(/\s/)
  const name = (firstSpace === -1 ? withoutSlash : withoutSlash.slice(0, firstSpace)).toLowerCase()
  const arg = firstSpace === -1 ? '' : withoutSlash.slice(firstSpace + 1).trim()
  const type = SLASH_ALIASES[name]
  if (!type) return null
  return { type, arg }
}

export interface SlashCommandHelp {
  command: string
  description: string
}

/** The bare command token a help entry represents, e.g. "/play <song or link>" -> "/play". */
export function slashCommandName(entry: SlashCommandHelp): string {
  return entry.command.split(/\s/)[0]
}

// The literal, typeable prefix of a help entry — everything up to (but not
// including) the first "<placeholder>" token, e.g. "/playlist add <name>" ->
// "/playlist add ". Several /playlist entries share the same command name
// ("/playlist"), so autocompleting just the name (as slashCommandName does)
// would drop the literal subcommand word ("add", "create", ...); this keeps
// it. Entries with no placeholder (e.g. "/skip") are returned as-is, with no
// trailing space, since they're already complete and ready to send.
export function slashCommandPrefix(entry: SlashCommandHelp): string {
  const placeholderIndex = entry.command.indexOf('<')
  if (placeholderIndex === -1) return entry.command
  return entry.command.slice(0, placeholderIndex)
}

// Shown in the Music room's command reference / "/help" reply.
export const SLASH_COMMAND_HELP: SlashCommandHelp[] = [
  { command: '/play <song or link>', description: 'Search for a track, or play a link from YouTube, Spotify, Apple Music, SoundCloud, and most other music platforms. This is the only way to start playback.' },
  { command: '/skip', description: 'Skip the track currently playing.' },
  { command: '/voteskip', description: 'Start a vote to skip the current track.' },
  { command: '/pause', description: 'Pause active playback.' },
  { command: '/resume', description: 'Resume paused playback.' },
  { command: '/previous', description: 'Rewind, or go back to the previous track.' },
  { command: '/stop', description: 'Stop playback and clear the queue.' },
  { command: '/loop', description: 'Repeat the current track when it ends.' },
  { command: '/unloop', description: 'Turn off looping and resume the normal queue.' },
  { command: '/queue', description: 'Show the list of upcoming songs.' },
  { command: '/np', description: 'Show info on the currently playing track.' },
  { command: '/volume <1-100>', description: 'Change the playback volume.' },
  { command: '/setup', description: 'View this room\u2019s current playback preferences.' },
  { command: '/clean', description: 'Clear command messages and replies from this chat.' },
  { command: '/faq <topic>', description: 'Search Gaming Horizon\u2019s help topics.' },
  { command: '/playlist create <name>', description: 'Create a new, empty playlist.' },
  { command: '/playlist save <name>', description: 'Save the current queue as a new playlist.' },
  { command: '/playlist add <name>', description: 'Add the track that\u2019s currently playing to a playlist.' },
  { command: '/playlist addqueue <name>', description: 'Add every track in the current queue \u2014 the whole playlist that\u2019s playing \u2014 to a saved playlist.' },
  { command: '/playlist addsong <name> | <song or link>', description: 'Save a track to a playlist without playing it \u2014 resolves the song or link and adds it directly.' },
  { command: '/playlist play <name>', description: 'Queue every track from a playlist.' },
  { command: '/playlist show <name>', description: 'List the tracks saved in a playlist.' },
  { command: '/playlist list', description: 'List all of your saved playlists.' },
  { command: '/playlist delete <name>', description: 'Delete a saved playlist.' },
]
