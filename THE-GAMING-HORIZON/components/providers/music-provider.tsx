'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { useMusicPlayer, type PlayerStatus } from '@/lib/use-music-player'
import {
  extractYoutubeId,
  extractSpotifyRef,
  fetchYoutubeOEmbed,
  fetchSpotifyOEmbed,
  fetchSpotifyCollection,
  fetchGenericLinkMetadata,
  detectLinkPlatformLabel,
  isYoutubeHost,
  isLikelyUrl,
  isSpotifyUrl,
  searchMockCatalog,
  searchYoutube,
  parseSlashCommand,
  SLASH_COMMAND_HELP,
  formatTime,
  makeMusicId,
  formatQueuePosition,
  type MusicChatMessage,
  type QueuedTrack,
  type SlashCommand,
  type SpotifyRef,
} from '@/lib/music'
import { FAQS } from '@/lib/data'
import { useAuth } from '@/components/providers/auth-provider'
import {
  readPlaylists,
  createPlaylist as createPlaylistInStore,
  addTrackToPlaylist as addTrackToPlaylistInStore,
  addTracksToPlaylist as addTracksToPlaylistInStore,
  removeTrackFromPlaylist as removeTrackFromPlaylistInStore,
  deletePlaylist as deletePlaylistInStore,
  findPlaylistByName,
  PLAYLISTS_EVENT,
  type Playlist,
} from '@/lib/playlists'

// Stable mount id for the hidden YouTube IFrame API player. Now lives at the
// provider level (mounted once, above the router outlet) instead of inside
// the Music page, so the underlying <iframe> — and therefore playback —
// survives navigating to any other tab/page in the app.
export const MUSIC_MOUNT_ID = 'gh-music-room-player'
const REWIND_RESTART_THRESHOLD = 3 // seconds — under this, "previous" jumps back a track instead of restarting

// ---------------------------------------------------------------------------
// Player layout — separate from the color/gradient THEME above. This
// controls the *arrangement* of the player rather than its palette: which
// side of the full Music room the "Now Playing" hero sits on, and where /
// how big the floating Mini Player is everywhere else on the site. Lives
// here (provider level) rather than inside the Music room component so both
// the room and the Mini Player — which mount in completely different parts
// of the tree — read and persist the same values.
export type PlayerPanelSide = 'left' | 'right'
export type MiniPlayerPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
export type MiniPlayerSize = 'compact' | 'standard'

const PANEL_SIDE_STORAGE_KEY = 'gh:music-layout-panel-side'
const MINI_POSITION_STORAGE_KEY = 'gh:music-layout-mini-position'
const MINI_SIZE_STORAGE_KEY = 'gh:music-layout-mini-size'

const DEFAULT_PANEL_SIDE: PlayerPanelSide = 'left'
const DEFAULT_MINI_POSITION: MiniPlayerPosition = 'bottom-right'
const DEFAULT_MINI_SIZE: MiniPlayerSize = 'standard'

function readStoredLayoutValue<T extends string>(key: string, valid: readonly T[], fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const stored = window.localStorage.getItem(key)
    if (stored && (valid as readonly string[]).includes(stored)) return stored as T
  } catch {
    // Best-effort read only — fall back to the default below.
  }
  return fallback
}

const WELCOME: MusicChatMessage = {
  id: 'mm-welcome',
  kind: 'system',
  text: "Every command starts with \"/\" — music only plays through /play, so a pasted link or typed song name alone won't start anything. Try /play <song or link>, /skip, /pause, /resume, /previous, /loop, /unloop, /queue, /np, /volume 50, /playlist create <name>, or /help to see the full list.",
  timestamp: new Date(),
}

interface MusicRoomContextValue {
  messages: MusicChatMessage[]
  queue: QueuedTrack[]
  history: QueuedTrack[]
  input: string
  setInput: Dispatch<SetStateAction<string>>
  resolving: boolean
  showQueue: boolean
  setShowQueue: Dispatch<SetStateAction<boolean>>

  playlists: Playlist[]
  showPlaylists: boolean
  setShowPlaylists: Dispatch<SetStateAction<boolean>>
  createPlaylist: (name: string) => void
  savePlaylistFromQueue: (name: string) => void
  addNowPlayingToPlaylist: (name: string) => void
  // Adds every track currently queued (now playing + up next — i.e. the
  // whole playlist that's actively playing) to an existing saved playlist,
  // instead of only the single track that's playing.
  addQueueToPlaylist: (name: string) => void
  // Adds ONE specific track (any track object — from the queue, from
  // another playlist, from history) to a named playlist. This is what
  // actually lets someone pick individual songs out of a playing playlist
  // and add just those to a different saved playlist, one at a time,
  // rather than only ever being able to add whichever track happens to be
  // at queue position 0 ("now playing"). See the queue drawer's per-track
  // "add to playlist" control.
  addTrackToPlaylistByName: (name: string, track: QueuedTrack) => void
  // Adds a track to a playlist WITHOUT queueing or playing it — resolves a
  // link or a typed song name (same resolution "/play" uses) and saves the
  // result straight to the playlist. Backs both "/playlist addsong <name> |
  // <song or link>" and the inline "add without playing" field in the
  // playlists drawer.
  addSongToPlaylist: (playlistName: string, query: string) => Promise<void>
  playPlaylist: (name: string) => void
  deletePlaylistById: (id: string) => void
  // Manage the songs saved inside a playlist — used by the drawer's
  // expanded track list so a playlist can be edited without deleting and
  // recreating it.
  removeTrackFromPlaylistById: (playlistId: string, trackId: string) => void
  // Queues a single saved track (appends to the queue; starts it right away
  // if the queue was empty) — lets a user play just one song from a
  // playlist instead of the whole thing.
  queueTrackFromPlaylist: (playlistId: string, trackId: string) => void

  status: PlayerStatus
  volume: number
  muted: boolean
  currentTime: number
  duration: number
  nowPlaying: QueuedTrack | null
  isPlaying: boolean
  // Friendly platform name ("Spotify", "Apple Music", "SoundCloud", ...) if
  // the currently playing track was originally shared as a link from
  // anywhere other than YouTube — null for a native YouTube link or a
  // typed song name. Purely a display badge: every platform is only ever
  // used to look up the track title, and playback always runs through the
  // same in-app YouTube player, so it doesn't gate any controls.
  sourcePlatformLabel: string | null
  loop: boolean

  submitInput: () => Promise<void>
  togglePlayPause: () => void
  skip: () => void
  previousOrRewind: () => void
  removeFromQueue: (id: string) => void
  seek: (seconds: number) => void
  setVolume: (next: number) => void
  toggleMute: () => void

  // Player layout (see block above) — how the room/Mini Player are
  // arranged, distinct from their color theme.
  playerPanelSide: PlayerPanelSide
  setPlayerPanelSide: Dispatch<SetStateAction<PlayerPanelSide>>
  miniPlayerPosition: MiniPlayerPosition
  setMiniPlayerPosition: Dispatch<SetStateAction<MiniPlayerPosition>>
  miniPlayerSize: MiniPlayerSize
  setMiniPlayerSize: Dispatch<SetStateAction<MiniPlayerSize>>
}

const MusicRoomContext = createContext<MusicRoomContextValue | null>(null)

export function MusicProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  // Playlists are saved per account (namespaced by user id in localStorage —
  // see lib/playlists.ts) so signed-out visitors and different accounts on
  // the same browser never see each other's saved playlists.
  const userKey = user?.id ?? 'guest'
  const [messages, setMessages] = useState<MusicChatMessage[]>([WELCOME])
  const [queue, setQueue] = useState<QueuedTrack[]>([])
  const [history, setHistory] = useState<QueuedTrack[]>([])
  const [input, setInput] = useState('')
  const [resolving, setResolving] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [showPlaylists, setShowPlaylists] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loop, setLoop] = useState(false)
  const [playerPanelSide, setPlayerPanelSide] = useState<PlayerPanelSide>(() =>
    readStoredLayoutValue(PANEL_SIDE_STORAGE_KEY, ['left', 'right'] as const, DEFAULT_PANEL_SIDE),
  )
  const [miniPlayerPosition, setMiniPlayerPosition] = useState<MiniPlayerPosition>(() =>
    readStoredLayoutValue(
      MINI_POSITION_STORAGE_KEY,
      ['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const,
      DEFAULT_MINI_POSITION,
    ),
  )
  const [miniPlayerSize, setMiniPlayerSize] = useState<MiniPlayerSize>(() =>
    readStoredLayoutValue(MINI_SIZE_STORAGE_KEY, ['compact', 'standard'] as const, DEFAULT_MINI_SIZE),
  )
  useEffect(() => {
    try {
      window.localStorage.setItem(PANEL_SIDE_STORAGE_KEY, playerPanelSide)
    } catch {
      // Best-effort persistence only — not saving is a minor inconvenience.
    }
  }, [playerPanelSide])
  useEffect(() => {
    try {
      window.localStorage.setItem(MINI_POSITION_STORAGE_KEY, miniPlayerPosition)
    } catch {
      // Best-effort persistence only — not saving is a minor inconvenience.
    }
  }, [miniPlayerPosition])
  useEffect(() => {
    try {
      window.localStorage.setItem(MINI_SIZE_STORAGE_KEY, miniPlayerSize)
    } catch {
      // Best-effort persistence only — not saving is a minor inconvenience.
    }
  }, [miniPlayerSize])
  const queueRef = useRef<QueuedTrack[]>([])
  const historyRef = useRef<QueuedTrack[]>([])
  const loopRef = useRef(false)
  const playlistsRef = useRef<Playlist[]>([])
  queueRef.current = queue
  historyRef.current = history
  loopRef.current = loop
  playlistsRef.current = playlists

  const appendMessage = useCallback((msg: Omit<MusicChatMessage, 'id' | 'timestamp'>) => {
    setMessages((prev) => [...prev, { ...msg, id: makeMusicId(), timestamp: new Date() }])
  }, [])

  // Load this account's saved playlists, and keep them in sync with any
  // other mounted panel/tab writing to the same store (see PLAYLISTS_EVENT
  // in lib/playlists.ts).
  useEffect(() => {
    setPlaylists(readPlaylists(userKey))
    const onChange = (e: Event) => {
      const detailKey = (e as CustomEvent<{ userKey: string }>).detail?.userKey
      if (!detailKey || detailKey === userKey) setPlaylists(readPlaylists(userKey))
    }
    window.addEventListener(PLAYLISTS_EVENT, onChange)
    return () => window.removeEventListener(PLAYLISTS_EVENT, onChange)
  }, [userKey])

  // "/playlist create <name>" — makes a new, empty playlist.
  const createPlaylist = useCallback((name: string) => {
    const result = createPlaylistInStore(userKey, name)
    if ('error' in result) {
      appendMessage({
        kind: 'error',
        text:
          result.error === 'empty-name'
            ? 'Give the playlist a name — try "/playlist create <name>".'
            : result.error === 'duplicate-name'
              ? `You already have a playlist named "${name.trim()}".`
              : 'You\u2019ve hit the playlist limit — delete one before creating another.',
      })
      return
    }
    setPlaylists(readPlaylists(userKey))
    appendMessage({ kind: 'system', text: `Created playlist "${result.playlist.name}". Use /playlist add ${result.playlist.name} to save the current track to it.` })
  }, [appendMessage, userKey])

  // "/playlist save <name>" — creates a new playlist pre-filled with
  // whatever's currently in the queue (now playing + up next).
  const savePlaylistFromQueue = useCallback((name: string) => {
    if (queueRef.current.length === 0) {
      appendMessage({ kind: 'error', text: 'The queue is empty — queue a track with /play first, or use /playlist create <name> for an empty playlist.' })
      return
    }
    const result = createPlaylistInStore(userKey, name, queueRef.current)
    if ('error' in result) {
      appendMessage({
        kind: 'error',
        text:
          result.error === 'empty-name'
            ? 'Give the playlist a name — try "/playlist save <name>".'
            : result.error === 'duplicate-name'
              ? `You already have a playlist named "${name.trim()}".`
              : 'You\u2019ve hit the playlist limit — delete one before creating another.',
      })
      return
    }
    setPlaylists(readPlaylists(userKey))
    appendMessage({ kind: 'system', text: `Saved the current queue (${result.playlist.tracks.length} track${result.playlist.tracks.length === 1 ? '' : 's'}) as playlist "${result.playlist.name}".` })
  }, [appendMessage, userKey])

  // "/playlist add <name>" — adds the track currently playing to a playlist.
  const addNowPlayingToPlaylist = useCallback((name: string) => {
    const current = queueRef.current[0]
    if (!current) {
      appendMessage({ kind: 'error', text: 'Nothing is playing to add — try /play <song or link> first.' })
      return
    }
    const result = addTrackToPlaylistInStore(userKey, name, current)
    if ('error' in result) {
      appendMessage({
        kind: 'error',
        text:
          result.error === 'not-found'
            ? `No playlist named "${name.trim()}" — try /playlist create ${name.trim()} first, or /playlist list to see what you have.`
            : result.error === 'duplicate-track'
              ? `"${current.title}" is already in "${name.trim()}".`
              : `"${name.trim()}" is full — remove a track before adding another.`,
      })
      return
    }
    setPlaylists(readPlaylists(userKey))
    appendMessage({ kind: 'system', text: `Added "${current.title}" to "${result.playlist.name}".` })
  }, [appendMessage, userKey])

  // "/playlist addqueue <name>" — adds every track in the current queue
  // (the whole playlist that's actively playing, not just the current
  // track) to an existing saved playlist. Fixes the common case of playing
  // a saved/Spotify playlist and wanting to copy all of it into another
  // playlist, where the single-track "add" above would only ever save one
  // song.
  const addQueueToPlaylist = useCallback((name: string) => {
    const tracks = queueRef.current
    if (tracks.length === 0) {
      appendMessage({ kind: 'error', text: 'Nothing is playing to add — try /play <song or link>, or /playlist play <name> first.' })
      return
    }
    const result = addTracksToPlaylistInStore(userKey, name, tracks)
    if ('error' in result) {
      appendMessage({
        kind: 'error',
        text:
          result.error === 'not-found'
            ? `No playlist named "${name.trim()}" — try /playlist create ${name.trim()} first, or /playlist list to see what you have.`
            : 'Nothing is playing to add.',
      })
      return
    }
    setPlaylists(readPlaylists(userKey))
    const { addedCount, duplicateCount, skippedForLimit, playlist } = result
    const parts = [`Added ${addedCount} track${addedCount === 1 ? '' : 's'} to "${playlist.name}".`]
    if (duplicateCount > 0) parts.push(`${duplicateCount} already there.`)
    if (skippedForLimit > 0) parts.push(`${skippedForLimit} skipped — playlist is full.`)
    appendMessage({ kind: addedCount > 0 ? 'system' : 'error', text: parts.join(' ') })
  }, [appendMessage, userKey])

  // Adds ONE specific track — passed in directly, not read from
  // queueRef.current[0] — to a named playlist. addNowPlayingToPlaylist above
  // can only ever add whichever track is at queue position 0, so picking a
  // *different* song out of a multi-track queue and clicking "add" would
  // silently re-add the same now-playing track every time (and correctly,
  // but confusingly, report it as already there on the 2nd+ click). This is
  // the fix: any track — from the queue drawer, from a different playlist,
  // from history — can be added by reference, so every song in a playing
  // playlist can actually be saved into another playlist, not just track 1.
  const addTrackToPlaylistByName = useCallback((name: string, track: QueuedTrack) => {
    const result = addTrackToPlaylistInStore(userKey, name, track)
    if ('error' in result) {
      appendMessage({
        kind: 'error',
        text:
          result.error === 'not-found'
            ? `No playlist named "${name.trim()}" — try /playlist create ${name.trim()} first.`
            : result.error === 'duplicate-track'
              ? `"${track.title}" is already in "${name.trim()}".`
              : `"${name.trim()}" is full — remove a track before adding another.`,
      })
      return
    }
    setPlaylists(readPlaylists(userKey))
    appendMessage({ kind: 'system', text: `Added "${track.title}" to "${result.playlist.name}".` })
  }, [appendMessage, userKey])

  // "/playlist play <name>" — queues every track from a saved playlist.
  const playPlaylist = useCallback((name: string) => {
    const playlist = findPlaylistByName(userKey, name)
    if (!playlist) {
      appendMessage({ kind: 'error', text: `No playlist named "${name.trim()}" — try /playlist list to see what you have.` })
      return
    }
    if (playlist.tracks.length === 0) {
      appendMessage({ kind: 'error', text: `"${playlist.name}" is empty — add a track first with /playlist add ${playlist.name}.` })
      return
    }
    const wasEmpty = queueRef.current.length === 0
    setQueue((prev) => [...prev, ...playlist.tracks])
    if (wasEmpty) {
      const first = playlist.tracks[0]
      if (first.source === 'youtube') playVideoRef.current?.(first.videoId)
    }
    appendMessage({ kind: 'system', text: `Queued "${playlist.name}" — ${playlist.tracks.length} track${playlist.tracks.length === 1 ? '' : 's'}.` })
  }, [appendMessage, userKey])

  // "/playlist show <name>" — lists the tracks saved in a playlist.
  const showPlaylistTracks = useCallback((name: string) => {
    const playlist = findPlaylistByName(userKey, name)
    if (!playlist) {
      appendMessage({ kind: 'error', text: `No playlist named "${name.trim()}" — try /playlist list to see what you have.` })
      return
    }
    setShowPlaylists(true)
    const lines =
      playlist.tracks.length === 0
        ? [`"${playlist.name}" is empty.`]
        : [`"${playlist.name}" — ${playlist.tracks.length} track${playlist.tracks.length === 1 ? '' : 's'}:`, ...playlist.tracks.map((t, i) => `${i + 1}. ${t.title}`)]
    appendMessage({ kind: 'system', text: lines.join('\n') })
  }, [appendMessage, userKey])

  // "/playlist list" — lists every saved playlist with its track count.
  const listPlaylists = useCallback(() => {
    setShowPlaylists(true)
    const current = readPlaylists(userKey)
    if (current.length === 0) {
      appendMessage({ kind: 'system', text: 'No playlists yet — try /playlist create <name> to make one.' })
      return
    }
    const lines = current.map((p) => `${p.name} — ${p.tracks.length} track${p.tracks.length === 1 ? '' : 's'}`)
    appendMessage({ kind: 'system', text: lines.join('\n') })
  }, [appendMessage, userKey])

  // "/playlist delete <name>" — deletes a saved playlist. Also used by the
  // playlist drawer's delete button (called with an id there).
  const deletePlaylistByName = useCallback((name: string) => {
    const playlist = findPlaylistByName(userKey, name)
    if (!playlist) {
      appendMessage({ kind: 'error', text: `No playlist named "${name.trim()}" — try /playlist list to see what you have.` })
      return
    }
    deletePlaylistInStore(userKey, playlist.id)
    setPlaylists(readPlaylists(userKey))
    appendMessage({ kind: 'system', text: `Deleted playlist "${playlist.name}".` })
  }, [appendMessage, userKey])

  const deletePlaylistById = useCallback((id: string) => {
    deletePlaylistInStore(userKey, id)
    setPlaylists(readPlaylists(userKey))
  }, [userKey])

  // Removes a single saved song from a playlist — the drawer's per-track
  // "remove" button, so a playlist can be edited without deleting the whole
  // thing and starting over.
  const removeTrackFromPlaylistById = useCallback((playlistId: string, trackId: string) => {
    removeTrackFromPlaylistInStore(userKey, playlistId, trackId)
    setPlaylists(readPlaylists(userKey))
  }, [userKey])

  // Plays one saved song from a playlist — appends it to the queue and
  // starts it immediately if nothing else is queued, mirroring how
  // playPlaylist starts the first track when the queue was empty.
  const queueTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    const playlist = playlistsRef.current.find((p) => p.id === playlistId)
    const track = playlist?.tracks.find((t) => t.id === trackId)
    if (!track) return
    const wasEmpty = queueRef.current.length === 0
    setQueue((prev) => [...prev, track])
    if (wasEmpty && track.source === 'youtube') playVideoRef.current?.(track.videoId)
    appendMessage({ kind: 'system', text: `Queued "${track.title}" from "${playlist?.name}".` })
  }, [appendMessage])

  // Advances the queue to the next track. When "/loop" is active and this
  // was triggered by the track naturally ending (not an explicit "/skip"),
  // the current track replays instead of the queue advancing — pass
  // `force: true` to always advance regardless of loop (used by /skip).
  const playNextInQueue = useCallback((opts: { force?: boolean } = {}) => {
    if (!opts.force && loopRef.current) {
      const current = queueRef.current[0]
      if (current?.source === 'youtube') playVideoRef.current?.(current.videoId)
      return
    }
    setQueue((prev) => {
      const [finished, ...rest] = prev
      if (finished) setHistory((h) => [...h, finished].slice(-25))
      const next = rest[0]
      if (next) {
        if (next.source === 'youtube') playVideoRef.current?.(next.videoId)
        appendMessage({ kind: 'system', text: `Now playing: ${next.title}` })
      }
      return rest
    })
  }, [appendMessage])

  const {
    status,
    volume,
    muted,
    currentTime,
    duration,
    playVideo,
    play,
    pause,
    togglePlayPause,
    seek,
    setVolume,
    toggleMute,
  } = useMusicPlayer(MUSIC_MOUNT_ID, {
    onTrackEnded: playNextInQueue,
    onError: () => {
      appendMessage({ kind: 'error', text: 'That track failed to play (it may be region-locked or embedding-disabled). Skipping to the next one.' })
      playNextInQueue()
    },
  })

  // playVideoRef lets the queue-advance callback above call the latest
  // playVideo without being recreated every render (it's stable from the
  // hook, but this keeps the pattern resilient either way).
  const playVideoRef = useRef(playVideo)
  playVideoRef.current = playVideo

  const nowPlaying = queue[0] ?? null
  // Purely a display badge now — the track was originally shared as a link
  // from some other platform, but it's already been matched to a YouTube
  // video and plays through the exact same in-app player as everything
  // else, so nothing about controls needs to change based on this. Null
  // for a native YouTube link or a typed song name (no link at all).
  const sourcePlatformLabel =
    nowPlaying && isLikelyUrl(nowPlaying.url) && !isYoutubeHost(nowPlaying.url)
      ? detectLinkPlatformLabel(nowPlaying.url)
      : null
  const isPlaying = status === 'playing'

  // `silent` skips the per-track chat message — used when queueing every
  // track from a Spotify playlist/album at once, where a message per track
  // would flood the chat; that flow posts its own single summary instead.
  const enqueueTrack = useCallback((track: QueuedTrack, opts: { silent?: boolean } = {}) => {
    const wasEmpty = queueRef.current.length === 0
    setQueue((prev) => [...prev, track])
    if (!opts.silent) {
      appendMessage({
        kind: 'system',
        text: wasEmpty ? `Now playing: ${track.title}` : `Added to queue — ${formatQueuePosition(queueRef.current.length)}`,
      })
    }
    if (wasEmpty) playVideo(track.videoId)
  }, [appendMessage, playVideo])

  const skip = useCallback(() => {
    if (queueRef.current.length === 0) return
    const current = queueRef.current[0]
    appendMessage({ kind: 'system', text: `Skipped: ${current.title}` })
    playNextInQueue({ force: true })
  }, [appendMessage, playNextInQueue])

  // "Previous / Rewind": restarts the current track if it's only just
  // started, otherwise steps back to whatever played before it — mirrors how
  // most music-bot / streaming-app "previous" buttons behave.
  const previousOrRewind = useCallback(() => {
    if (nowPlaying && currentTime > REWIND_RESTART_THRESHOLD) {
      seek(0)
      appendMessage({ kind: 'system', text: 'Rewound to the start.' })
      return
    }
    const prevTrack = historyRef.current[historyRef.current.length - 1]
    if (!prevTrack) {
      if (nowPlaying) seek(0)
      return
    }
    setHistory((h) => h.slice(0, -1))
    setQueue((q) => [prevTrack, ...q])
    playVideoRef.current?.(prevTrack.videoId)
    appendMessage({ kind: 'system', text: `Now playing: ${prevTrack.title}` })
  }, [appendMessage, currentTime, nowPlaying, seek])

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Shared playback actions dispatched by their matching slash commands
  // ("/resume" or bare "/play", "/pause", "/skip", "/previous").
  const runChatCommand = useCallback((command: 'play' | 'pause' | 'skip' | 'previous') => {
    switch (command) {
      case 'play':
        if (!nowPlaying) {
          appendMessage({ kind: 'error', text: "Nothing is queued yet — try /play <song name or link> first." })
          return
        }
        play()
        appendMessage({ kind: 'system', text: 'Resumed playback.' })
        return
      case 'pause':
        if (!nowPlaying) return
        pause()
        appendMessage({ kind: 'system', text: 'Paused.' })
        return
      case 'skip':
        skip()
        return
      case 'previous':
        previousOrRewind()
        return
    }
  }, [appendMessage, nowPlaying, pause, play, previousOrRewind, skip])

  // Resolves a link or a typed song name to a playable track, WITHOUT
  // queueing or playing it — shared by "/play" (which enqueues the result
  // below) and "/playlist addsong" (which only saves it to a playlist, so a
  // song can be collected into a playlist without ever playing it).
  //
  // A Spotify link is only ever used to look up the track's title via
  // Spotify's oEmbed — it is never handed to Spotify's own embedded player,
  // since that embed caps non-Premium playback at a 30-second preview. The
  // resolved title is matched to a real YouTube video instead, so the track
  // plays in full through the same in-app player as everything else.
  const resolveTrack = useCallback(async (raw: string): Promise<QueuedTrack | null> => {
    if (isLikelyUrl(raw)) {
      if (isSpotifyUrl(raw)) {
        const ref = extractSpotifyRef(raw)!
        if (ref.kind !== 'track') {
          // Playlist/album links ARE supported by "/play" (see
          // resolveAndQueueSpotifyCollection), which queues every track in
          // them — but resolveTrack always resolves to a single track, so
          // it's also what backs "/playlist addsong", where "add this whole
          // playlist as one song" genuinely doesn't make sense.
          appendMessage({
            kind: 'error',
            text: 'A whole Spotify playlist or album can\u2019t be added as a single song. Play it with "/play <link>" instead, or paste one track link to add just that song.',
          })
          return null
        }
        setResolving(true)
        const { title, thumbnail: spotifyThumbnail } = await fetchSpotifyOEmbed(ref)
        const results = await searchYoutube(title)
        setResolving(false)
        const top = results[0]
        if (!top) {
          appendMessage({ kind: 'error', text: `Found "${title}" on Spotify but couldn't find a matching YouTube video to play it with. Try a direct YouTube link instead.` })
          return null
        }
        return {
          id: makeMusicId('track'),
          source: 'youtube',
          videoId: top.videoId,
          url: raw,
          title,
          thumbnail: top.thumbnail || spotifyThumbnail,
          addedAt: new Date(),
        }
      }

      const videoId = extractYoutubeId(raw)
      if (videoId) {
        setResolving(true)
        const { title, thumbnail } = await fetchYoutubeOEmbed(videoId)
        setResolving(false)
        return { id: makeMusicId('track'), source: 'youtube', videoId, url: raw, title, thumbnail, addedAt: new Date() }
      }

      // Not YouTube or Spotify — try every other platform generically:
      // unfurl the link (oEmbed / Open Graph, via the server-side route)
      // to get a real title, then match that to a YouTube video the same
      // way a Spotify link is. Covers Apple Music, SoundCloud, Deezer,
      // Tidal, Amazon Music, Bandcamp, and effectively any other site that
      // publishes normal link-preview metadata.
      setResolving(true)
      const metadata = await fetchGenericLinkMetadata(raw)
      if (!metadata) {
        setResolving(false)
        appendMessage({
          kind: 'error',
          text: `Couldn't read anything playable from that link — try a YouTube, Spotify, Apple Music, or SoundCloud link, or just type the song name.`,
        })
        return null
      }
      const platformLabel = detectLinkPlatformLabel(raw) ?? metadata.siteName ?? 'that link'
      const genericResults = await searchYoutube(metadata.title)
      setResolving(false)
      const genericTop = genericResults[0]
      if (!genericTop) {
        appendMessage({
          kind: 'error',
          text: `Found "${metadata.title}" via ${platformLabel} but couldn't find a matching YouTube video to play it with. Try a direct YouTube link instead.`,
        })
        return null
      }
      return {
        id: makeMusicId('track'),
        source: 'youtube',
        videoId: genericTop.videoId,
        url: raw,
        title: metadata.title,
        thumbnail: genericTop.thumbnail || metadata.thumbnail || '',
        addedAt: new Date(),
      }
    }

    // Not a link — treat it as a typed song name/search term. Checks the
    // small curated demo catalog first (instant, no network round-trip),
    // then falls back to a live YouTube search so ANY song name — not just
    // what's in the demo catalog — actually resolves.
    const catalogMatch = searchMockCatalog(raw)
    if (catalogMatch) {
      setResolving(true)
      const { title, thumbnail } = await fetchYoutubeOEmbed(catalogMatch.videoId)
      setResolving(false)
      return {
        id: makeMusicId('track'),
        source: 'youtube',
        videoId: catalogMatch.videoId,
        url: `https://www.youtube.com/watch?v=${catalogMatch.videoId}`,
        title: title !== 'Untitled track' ? title : `${catalogMatch.title} — ${catalogMatch.artist}`,
        thumbnail,
        addedAt: new Date(),
      }
    }

    setResolving(true)
    const results = await searchYoutube(raw)
    setResolving(false)
    const top = results[0]
    if (!top) {
      appendMessage({
        kind: 'error',
        text: `I couldn't find "${raw}" on YouTube. Try a different title, or paste a direct link (YouTube, Spotify, Apple Music, SoundCloud, and most other platforms work).`,
      })
      return null
    }
    return {
      id: makeMusicId('track'),
      source: 'youtube',
      videoId: top.videoId,
      url: `https://www.youtube.com/watch?v=${top.videoId}`,
      title: top.title,
      thumbnail: top.thumbnail,
      addedAt: new Date(),
    }
  }, [appendMessage])

  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

  // Handles a Spotify *playlist* or *album* link: fetches every track in it
  // (see fetchSpotifyCollection), matches each to a YouTube video the same
  // way a single Spotify track link does, and queues them all in order — so
  // the whole playlist plays through, and /skip advances one track at a
  // time within it (skip already does this "for free": the queue is just a
  // flat list of tracks regardless of where they came from).
  const resolveAndQueueSpotifyCollection = useCallback(async (ref: SpotifyRef, raw: string) => {
    setResolving(true)
    const collection = await fetchSpotifyCollection(ref)
    if (!collection) {
      setResolving(false)
      appendMessage({
        kind: 'error',
        text: `Couldn't read that Spotify ${ref.kind} — it may be private, empty, or unavailable right now. Try a track link instead.`,
      })
      return
    }
    appendMessage({
      kind: 'system',
      text: `Found "${collection.name}" — matching ${collection.tracks.length} track${collection.tracks.length === 1 ? '' : 's'} to YouTube, this may take a moment…`,
    })
    // Opens the queue panel so tracks are visible landing in it live as each
    // one resolves below, rather than the user only finding out what got
    // added from the summary message at the end.
    setShowQueue(true)

    const added: string[] = []
    let failed = 0
    for (let i = 0; i < collection.tracks.length; i++) {
      const item = collection.tracks[i]
      // Bollywood/Indian tracks are often credited to several artists
      // ("Atif Aslam, Nusrat Fateh Ali Khan, Rochak Kohli, Manoj
      // Muntashir") — searching YouTube for the title plus the *entire*
      // credit string is often too specific to match any real video
      // title and returns nothing, even though the song is easy to find
      // with a shorter query. firstArtist below is used as a fallback.
      const firstArtist = item.artist ? item.artist.split(',')[0].trim() : ''
      const fullQuery = item.artist ? `${item.title} ${item.artist}` : item.title

      // YouTube's unauthenticated search page (no API key — see
      // app/api/music/search) starts serving a stripped-down anti-bot
      // response after a handful of requests fired back-to-back, which
      // made every track past roughly #9-10 in a playlist come back as
      // "no results" even though it matches fine on its own. Spacing
      // requests out, retrying after a longer pause on a miss, and
      // falling back to a shorter query keeps the whole playlist from
      // silently failing to match.
      let results = await searchYoutube(fullQuery)
      if (results.length === 0) {
        await sleep(1200)
        results = await searchYoutube(fullQuery)
      }
      if (results.length === 0 && firstArtist && firstArtist !== item.artist) {
        await sleep(600)
        results = await searchYoutube(`${item.title} ${firstArtist}`)
      }
      if (results.length === 0) {
        await sleep(600)
        results = await searchYoutube(item.title)
      }

      const top = results[0]
      if (!top) {
        failed++
      } else {
        const title = item.artist ? `${item.title} — ${item.artist}` : item.title
        enqueueTrack(
          {
            id: makeMusicId('track'),
            source: 'youtube',
            videoId: top.videoId,
            // Each track gets its own unique url — not just the shared
            // Spotify playlist/album link every track in this batch was
            // resolved from. Playlists dedupe saved songs by url (see
            // lib/playlists.ts), so if every track here kept the identical
            // collection link, saving the first song to a playlist would
            // make every OTHER song from the same playlist look like a
            // duplicate of it — the exact "only one song saves, the rest
            // say already added" bug. Appending the resolved video id
            // keeps the url unique per song while still starting with the
            // original open.spotify.com/... link, so isSpotifyUrl()/
            // extractSpotifyRef() (used for the "via Spotify" badge) still
            // matches it correctly.
            url: `${raw}#${top.videoId}`,
            title,
            thumbnail: top.thumbnail,
            addedAt: new Date(),
          },
          { silent: true },
        )
        added.push(title)
      }

      // Small pacing delay between tracks (skip after the last one) so
      // requests don't hammer YouTube's search page in a tight loop.
      if (i < collection.tracks.length - 1) await sleep(400)
    }
    setResolving(false)

    if (added.length === 0) {
      appendMessage({ kind: 'error', text: `Couldn't match any tracks from "${collection.name}" to YouTube videos. Try a track link instead.` })
      return
    }
    // Lists what actually got queued (not just a count) so the user can see
    // the songs added right in the chat, same style as "/queue" — capped so
    // a huge playlist doesn't flood the feed; the full list is always
    // visible in the queue panel opened above.
    const listLines = added.slice(0, 15).map((title, i) => `${i + 1}. ${title}`)
    if (added.length > 15) listLines.push(`…and ${added.length - 15} more`)
    appendMessage({
      kind: 'system',
      text: [
        failed > 0
          ? `Queued ${added.length} track${added.length === 1 ? '' : 's'} from "${collection.name}" (${failed} couldn't be matched):`
          : `Queued ${added.length} track${added.length === 1 ? '' : 's'} from "${collection.name}":`,
        ...listLines,
      ].join('\n'),
    })
  }, [appendMessage, enqueueTrack])

  // Resolves a link or typed song name and queues (and, if nothing was
  // already playing, immediately plays) the result. Only ever called from
  // "/play <link or song name>". A Spotify playlist/album link branches off
  // to resolveAndQueueSpotifyCollection instead, since that queues many
  // tracks rather than resolving to one.
  const resolveAndQueue = useCallback(async (raw: string) => {
    if (isLikelyUrl(raw) && isSpotifyUrl(raw)) {
      const ref = extractSpotifyRef(raw)!
      if (ref.kind === 'playlist' || ref.kind === 'album') {
        await resolveAndQueueSpotifyCollection(ref, raw)
        return
      }
    }
    const track = await resolveTrack(raw)
    if (track) enqueueTrack(track)
  }, [resolveTrack, enqueueTrack, resolveAndQueueSpotifyCollection])

  // Adds a track to a playlist WITHOUT queueing or playing it — resolves a
  // link or typed song name the same way "/play" does, but saves the result
  // straight to the playlist instead. Backs "/playlist addsong <name> |
  // <song or link>" and the inline "add without playing" field in the
  // playlists drawer.
  const addSongToPlaylist = useCallback(async (playlistName: string, query: string) => {
    const name = playlistName.trim()
    const q = query.trim()
    if (!name || !q) {
      appendMessage({ kind: 'error', text: 'Usage: /playlist addsong <name> | <song or link>' })
      return
    }
    if (!findPlaylistByName(userKey, name)) {
      appendMessage({ kind: 'error', text: `No playlist named "${name}" — try /playlist create ${name} first, or /playlist list to see what you have.` })
      return
    }
    const track = await resolveTrack(q)
    if (!track) return
    const result = addTrackToPlaylistInStore(userKey, name, track)
    if ('error' in result) {
      appendMessage({
        kind: 'error',
        text:
          result.error === 'not-found'
            ? `No playlist named "${name}" — try /playlist create ${name} first.`
            : result.error === 'duplicate-track'
              ? `"${track.title}" is already in "${name}".`
              : `"${name}" is full — remove a track before adding another.`,
      })
      return
    }
    setPlaylists(readPlaylists(userKey))
    appendMessage({ kind: 'system', text: `Added "${track.title}" to "${result.playlist.name}" — saved without playing it.` })
  }, [appendMessage, resolveTrack, userKey])

  // "/stop", "/leave", "/dc" — halts playback and clears the queue (there's
  // no voice channel to disconnect from in the browser room, so this is the
  // closest equivalent).
  const stopMusic = useCallback(() => {
    if (!nowPlaying && queueRef.current.length === 0) {
      appendMessage({ kind: 'system', text: 'Nothing is playing.' })
      return
    }
    pause()
    setQueue([])
    setHistory([])
    appendMessage({ kind: 'system', text: 'Stopped playback and cleared the queue.' })
  }, [appendMessage, nowPlaying, pause])

  // "/clean" — clears command messages and bot replies from the chat feed.
  const cleanMessages = useCallback(() => {
    setMessages([{ ...WELCOME, id: makeMusicId('mm'), timestamp: new Date() }])
  }, [])

  // Dispatches a parsed "/command". Every command in the Music room starts
  // with "/" (see lib/music.ts#parseSlashCommand).
  const runSlashCommand = useCallback(async (command: SlashCommand) => {
    switch (command.type) {
      case 'play': {
        const arg = command.arg.trim()
        if (!arg) {
          runChatCommand('play')
          return
        }
        await resolveAndQueue(arg)
        return
      }
      case 'skip':
        skip()
        return
      case 'voteskip':
        if (!nowPlaying) {
          appendMessage({ kind: 'system', text: 'Nothing is playing to vote on.' })
          return
        }
        appendMessage({ kind: 'system', text: 'Skip vote passed — skipping.' })
        skip()
        return
      case 'pause':
        runChatCommand('pause')
        return
      case 'resume':
        runChatCommand('play')
        return
      case 'previous':
        runChatCommand('previous')
        return
      case 'stop':
        stopMusic()
        return
      case 'loop':
        if (!nowPlaying) {
          appendMessage({ kind: 'system', text: 'Nothing is playing to loop.' })
          return
        }
        setLoop(true)
        appendMessage({ kind: 'system', text: `Looping "${nowPlaying.title}".` })
        return
      case 'unloop':
        if (!loopRef.current) {
          appendMessage({ kind: 'system', text: 'Loop is already off.' })
          return
        }
        setLoop(false)
        appendMessage({ kind: 'system', text: 'Loop disabled — the queue will advance normally.' })
        return
      case 'queue': {
        setShowQueue(true)
        if (queueRef.current.length === 0) {
          appendMessage({ kind: 'system', text: 'The queue is empty.' })
          return
        }
        const upcoming = queueRef.current.slice(1)
        const lines = [`Now playing: ${queueRef.current[0].title}`]
        if (upcoming.length === 0) {
          lines.push('Nothing queued up next.')
        } else {
          lines.push(...upcoming.slice(0, 8).map((t, i) => `${i + 1}. ${t.title}`))
          if (upcoming.length > 8) lines.push(`…and ${upcoming.length - 8} more`)
        }
        appendMessage({ kind: 'system', text: lines.join('\n') })
        return
      }
      case 'np':
        appendMessage({
          kind: 'system',
          text: nowPlaying
            ? `Now playing: ${nowPlaying.title}${duration ? ` (${formatTime(currentTime)} / ${formatTime(duration)})` : ''}`
            : 'Nothing is playing right now.',
        })
        return
      case 'volume': {
        const num = Number(command.arg)
        if (!command.arg || !Number.isFinite(num)) {
          appendMessage({ kind: 'error', text: 'Usage: /volume <1-100>' })
          return
        }
        const clamped = Math.max(0, Math.min(100, Math.round(num)))
        setVolume(clamped)
        appendMessage({ kind: 'system', text: `Volume set to ${clamped}%.` })
        return
      }
      case 'setup':
        appendMessage({
          kind: 'system',
          text: `Current room preferences — volume ${muted ? 0 : volume}% (${muted ? 'muted' : 'unmuted'}), loop ${loop ? 'on' : 'off'}, ${queueRef.current.length} track${queueRef.current.length === 1 ? '' : 's'} in queue. This room plays directly for you, so there are no channel locks or DJ roles to configure here.`,
        })
        return
      case 'clean':
        cleanMessages()
        return
      case 'faq': {
        const q = command.arg.trim()
        if (!q) {
          const popular = FAQS.filter((f) => f.popular).slice(0, 4).map((f) => f.q).join(' · ')
          appendMessage({ kind: 'system', text: `Try /faq <topic>. Popular topics: ${popular}` })
          return
        }
        const norm = q.toLowerCase()
        const hit =
          FAQS.find((f) => f.q.toLowerCase().includes(norm)) ||
          FAQS.find((f) => f.category.toLowerCase().includes(norm) || f.a.toLowerCase().includes(norm))
        appendMessage({
          kind: 'system',
          text: hit ? `${hit.q}\n${hit.a}` : `I couldn't find a help topic matching "${q}". Check the full FAQ page for more.`,
        })
        return
      }
      case 'help':
        appendMessage({
          kind: 'system',
          text: SLASH_COMMAND_HELP.map((h) => `${h.command} — ${h.description}`).join('\n'),
        })
        return
      case 'playlist': {
        const arg = command.arg.trim()
        const firstSpace = arg.search(/\s/)
        const sub = (firstSpace === -1 ? arg : arg.slice(0, firstSpace)).toLowerCase()
        const rest = firstSpace === -1 ? '' : arg.slice(firstSpace + 1).trim()
        switch (sub) {
          case 'create':
          case 'new':
            createPlaylist(rest)
            return
          case 'save':
            savePlaylistFromQueue(rest)
            return
          case 'add':
            addNowPlayingToPlaylist(rest)
            return
          case 'addqueue':
          case 'addall':
            addQueueToPlaylist(rest)
            return
          case 'addsong':
          case 'add-song':
          case 'addtrack': {
            const sep = rest.indexOf('|')
            if (sep === -1) {
              appendMessage({
                kind: 'error',
                text: 'Usage: /playlist addsong <name> | <song or link> — e.g. /playlist addsong Chill | Perfect by Ed Sheeran',
              })
              return
            }
            await addSongToPlaylist(rest.slice(0, sep), rest.slice(sep + 1))
            return
          }
          case 'play':
          case 'load':
            playPlaylist(rest)
            return
          case 'show':
          case 'view':
            showPlaylistTracks(rest)
            return
          case 'list':
          case '':
            listPlaylists()
            return
          case 'delete':
          case 'remove':
            deletePlaylistByName(rest)
            return
          default:
            appendMessage({
              kind: 'error',
              text: `Unknown /playlist option "${sub}". Try create, save, add, addqueue, addsong, play, show, list, or delete — /help lists the full syntax.`,
            })
            return
        }
      }
    }
  }, [appendMessage, cleanMessages, currentTime, duration, loop, muted, nowPlaying, resolveAndQueue, runChatCommand, skip, stopMusic, volume, createPlaylist, savePlaylistFromQueue, addNowPlayingToPlaylist, addQueueToPlaylist, addTrackToPlaylistByName, addSongToPlaylist, playPlaylist, showPlaylistTracks, listPlaylists, deletePlaylistByName])

  // Every command in the Music room starts with "/". Music only ever starts
  // playing through "/play <song name or link>" — a bare link, a plain
  // typed song name, or a bare word like "play"/"pause" is never treated as
  // an action and never starts playback on its own.
  const submitInput = useCallback(async () => {
    const raw = input.trim()
    if (!raw || resolving) return
    setInput('')

    const slash = parseSlashCommand(raw)
    if (slash) {
      appendMessage({ kind: 'user', text: raw })
      await runSlashCommand(slash)
      return
    }

    appendMessage({ kind: 'user', text: raw })
    appendMessage({
      kind: 'error',
      text: isLikelyUrl(raw)
        ? `Links only play through a command — try "/play ${raw}".`
        : 'Music only plays through a command — try "/play <song name or link>". Type /help to see every command.',
    })
  }, [appendMessage, input, resolving, runSlashCommand])

  const value = useMemo<MusicRoomContextValue>(() => ({
    messages,
    queue,
    history,
    input,
    setInput,
    resolving,
    showQueue,
    setShowQueue,
    playlists,
    showPlaylists,
    setShowPlaylists,
    createPlaylist,
    savePlaylistFromQueue,
    addNowPlayingToPlaylist,
    addQueueToPlaylist,
    addTrackToPlaylistByName,
    addSongToPlaylist,
    playPlaylist,
    deletePlaylistById,
    removeTrackFromPlaylistById,
    queueTrackFromPlaylist,
    status,
    volume,
    muted,
    currentTime,
    duration,
    nowPlaying,
    isPlaying,
    sourcePlatformLabel,
    loop,
    submitInput,
    togglePlayPause,
    skip,
    previousOrRewind,
    removeFromQueue,
    seek,
    setVolume,
    toggleMute,
    playerPanelSide,
    setPlayerPanelSide,
    miniPlayerPosition,
    setMiniPlayerPosition,
    miniPlayerSize,
    setMiniPlayerSize,
  }), [
    messages, queue, history, input, resolving, showQueue,
    playlists, showPlaylists, createPlaylist, savePlaylistFromQueue, addNowPlayingToPlaylist, addQueueToPlaylist, addTrackToPlaylistByName, addSongToPlaylist, playPlaylist, deletePlaylistById,
    removeTrackFromPlaylistById, queueTrackFromPlaylist,
    status, volume, muted, currentTime, duration, nowPlaying, isPlaying, sourcePlatformLabel, loop,
    submitInput, togglePlayPause, skip, previousOrRewind, removeFromQueue, seek, setVolume, toggleMute,
    playerPanelSide, miniPlayerPosition, miniPlayerSize,
  ])

  return (
    <MusicRoomContext.Provider value={value}>
      {children}
      {/* Mount point for the YouTube IFrame API player — kept alive here, above
          the router outlet, so playback survives navigating to any other
          page/section instead of living inside the Music page itself.
          Deliberately NOT display:none, NOT 0x0, and NOT opacity:0: several
          browsers auto-pause video that's collapsed to zero size or zero
          opacity, treating it as "not really visible" and suspending it on
          the next repaint (which is exactly what a route change triggers).
          Instead it's rendered at a real size and pushed off-screen, which
          keeps it fully invisible to the user while staying "visible" enough
          that playback isn't throttled. Every track — YouTube link, typed
          song name, or a Spotify link matched to its YouTube equivalent —
          plays through this one player, so there's no separate Spotify
          embed to keep alive alongside it. */}
      <div className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-[124px] w-[220px] overflow-hidden" aria-hidden>
        <div id={MUSIC_MOUNT_ID} />
      </div>
    </MusicRoomContext.Provider>
  )
}

export function useMusicRoom() {
  const ctx = useContext(MusicRoomContext)
  if (!ctx) throw new Error('useMusicRoom must be used within MusicProvider')
  return ctx
}
