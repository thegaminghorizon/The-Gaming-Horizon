'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Music4,
  Send,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Volume1,
  VolumeX,
  ListMusic,
  ListPlus,
  ListChecks,
  PlusCircle,
  Trash2,
  X,
  Link2,
  Search,
  Terminal,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Repeat,
  SlidersHorizontal,
  Palette,
  Sparkles,
  Check,
  PanelLeft,
  PanelRight,
  Minimize2,
  Maximize2,
  Image as ImageIcon,
  Waves,
  Moon,
  Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMusicRoom } from '@/components/providers/music-provider'
import { useUI } from '@/components/providers/ui-provider'
import { ACCENTS, ACCENT_GROUPS, type AccentKey, type AccentGroup } from '@/components/providers/settings-provider'
import { formatTime, isLikelyUrl, isYoutubeHost, detectLinkPlatformLabel, slashCommandName, slashCommandPrefix, SLASH_COMMAND_HELP, type MusicChatMessage } from '@/lib/music'

// The Music room has its own theme swatch, independent of the site-wide
// accent in Settings/Customization Studio — picking a color here only
// re-paints the player itself (persisted locally per browser) and never
// touches document.documentElement, so it can't leak out to the rest of
// the site the way it used to when it was wired to the global accent.
const MUSIC_ACCENT_STORAGE_KEY = 'gh:music-room-accent'
const MUSIC_THEME_MODE_STORAGE_KEY = 'gh:music-room-theme-mode'
const MUSIC_GRADIENT_STORAGE_KEY = 'gh:music-room-gradient'
const DEFAULT_MUSIC_ACCENT: AccentKey = 'aurora'

// The now-playing panel's backdrop *style* — separate from the color/
// gradient swatch above, which only decides the tone. This decides how
// that tone gets rendered: blurred cover art, an animated aurora wash,
// a twinkling starfield, or a flat minimal panel. Persisted the same way
// (localStorage, panel-scoped) as the color/gradient/room-layout prefs.
type MusicBackgroundStyle = 'artBlur' | 'aurora' | 'starfield' | 'minimal'
const MUSIC_BACKGROUND_STORAGE_KEY = 'gh:music-room-background'
const DEFAULT_MUSIC_BACKGROUND: MusicBackgroundStyle = 'artBlur'
const MUSIC_BACKGROUND_OPTIONS: { key: MusicBackgroundStyle; label: string; description: string; icon: typeof ImageIcon }[] = [
  { key: 'artBlur', label: 'Blurred art', description: 'Cover art, softly blurred behind the player', icon: ImageIcon },
  { key: 'aurora', label: 'Aurora waves', description: 'Slow-drifting color wash in your chosen theme', icon: Waves },
  { key: 'starfield', label: 'Starfield', description: 'A twinkling night sky, no cover art', icon: Moon },
  { key: 'minimal', label: 'Minimal', description: 'Flat and clean, no background effects', icon: Circle },
]
function readStoredMusicBackground(): MusicBackgroundStyle {
  if (typeof window === 'undefined') return DEFAULT_MUSIC_BACKGROUND
  try {
    const stored = window.localStorage.getItem(MUSIC_BACKGROUND_STORAGE_KEY)
    if (stored === 'artBlur' || stored === 'aurora' || stored === 'starfield' || stored === 'minimal') return stored
  } catch {
    /* ignore */
  }
  return DEFAULT_MUSIC_BACKGROUND
}

// Fixed (not random) star positions so server and client render the exact
// same markup — real Math.random() here would mismatch on hydration since
// the server has no window to seed from. "Starfield" mode reuses these
// plus a denser second set, for a fuller night sky than the quiet version
// blended under "Blurred art".
const STAR_POSITIONS: [number, number][] = [
  [8, 12], [22, 4], [88, 9], [95, 30], [5, 45], [70, 6], [40, 3], [60, 22],
  [12, 70], [90, 62], [30, 88], [78, 92], [50, 96], [15, 30], [96, 80], [4, 90],
]
const STARFIELD_DENSE_POSITIONS: [number, number][] = [
  ...STAR_POSITIONS,
  [18, 18], [35, 55], [55, 12], [65, 68], [82, 45], [10, 58], [45, 82], [72, 28],
  [28, 35], [92, 15], [58, 90], [3, 20], [98, 55], [38, 65], [80, 78], [25, 8],
]

// A player's "mode" is either a flat accent color (the original swatches)
// or one of the multi-stop gradients below — kept as its own type so the
// rest of the component can stay agnostic about which flavor is active.
type MusicThemeMode = 'color' | 'gradient'

type MusicGradientKey =
  | 'auroraBorealis'
  | 'sunsetBlaze'
  | 'midnightOcean'
  | 'neonDusk'
  | 'emeraldDepth'
  | 'crimsonNova'
  | 'goldenHour'
  | 'cosmicFade'

type MusicGradientDefinition = {
  label: string
  description: string
  // Full-bleed backdrop painted behind the now-playing side of the
  // player, blending down into the same near-black base (#0b0710) the
  // solid-color themes already sit on so art/controls stay legible.
  panel: string
  // Small round swatch shown in the theme picker — a tighter, more
  // saturated version of the same stops so it reads clearly at 24px.
  swatch: string
  a1: string
  a2: string
  a3: string
}

// Multi-color gradient themes, distinct from the flat accent swatches —
// each pairs a full-panel backdrop wash with the same a1/a2/a3 tone
// triplet the rest of the room already reads (buttons, equalizer,
// waveform ring), so switching to a gradient re-colors everything at
// once instead of just the backdrop.
const MUSIC_GRADIENTS: Record<MusicGradientKey, MusicGradientDefinition> = {
  auroraBorealis: {
    label: 'Aurora Borealis',
    description: 'Violet drifting into deep cyan',
    panel: 'linear-gradient(160deg, rgb(76 29 149 / 0.55), rgb(67 56 202 / 0.4) 45%, rgb(14 116 144 / 0.3) 70%, #0b0710 92%)',
    swatch: 'linear-gradient(135deg, rgb(76 29 149), rgb(67 56 202), rgb(14 116 144))',
    a1: '76 29 149', a2: '67 56 202', a3: '14 116 144',
  },
  sunsetBlaze: {
    label: 'Sunset Blaze',
    description: 'Burnt orange into hot magenta',
    panel: 'linear-gradient(160deg, rgb(194 65 12 / 0.55), rgb(219 39 119 / 0.4) 45%, rgb(124 58 237 / 0.3) 70%, #0b0710 92%)',
    swatch: 'linear-gradient(135deg, rgb(194 65 12), rgb(219 39 119), rgb(124 58 237))',
    a1: '194 65 12', a2: '219 39 119', a3: '124 58 237',
  },
  midnightOcean: {
    label: 'Midnight Ocean',
    description: 'Deep navy easing into teal',
    panel: 'linear-gradient(160deg, rgb(12 74 110 / 0.55), rgb(7 89 133 / 0.4) 45%, rgb(22 78 99 / 0.3) 70%, #0b0710 92%)',
    swatch: 'linear-gradient(135deg, rgb(12 74 110), rgb(7 89 133), rgb(22 78 99))',
    a1: '12 74 110', a2: '7 89 133', a3: '22 78 99',
  },
  neonDusk: {
    label: 'Neon Dusk',
    description: 'Electric magenta into indigo',
    panel: 'linear-gradient(160deg, rgb(162 28 175 / 0.55), rgb(217 70 239 / 0.35) 45%, rgb(99 102 241 / 0.3) 70%, #0b0710 92%)',
    swatch: 'linear-gradient(135deg, rgb(162 28 175), rgb(217 70 239), rgb(99 102 241))',
    a1: '162 28 175', a2: '217 70 239', a3: '99 102 241',
  },
  emeraldDepth: {
    label: 'Emerald Depth',
    description: 'Forest green into cyan clarity',
    panel: 'linear-gradient(160deg, rgb(6 78 59 / 0.55), rgb(4 120 87 / 0.4) 45%, rgb(14 116 144 / 0.3) 70%, #0b0710 92%)',
    swatch: 'linear-gradient(135deg, rgb(6 78 59), rgb(4 120 87), rgb(14 116 144))',
    a1: '6 78 59', a2: '4 120 87', a3: '14 116 144',
  },
  crimsonNova: {
    label: 'Crimson Nova',
    description: 'Deep red flaring into pink',
    panel: 'linear-gradient(160deg, rgb(127 29 29 / 0.55), rgb(185 28 28 / 0.4) 45%, rgb(219 39 119 / 0.3) 70%, #0b0710 92%)',
    swatch: 'linear-gradient(135deg, rgb(127 29 29), rgb(185 28 28), rgb(219 39 119))',
    a1: '127 29 29', a2: '185 28 28', a3: '219 39 119',
  },
  goldenHour: {
    label: 'Golden Hour',
    description: 'Warm amber into soft rose',
    panel: 'linear-gradient(160deg, rgb(120 53 15 / 0.55), rgb(217 119 6 / 0.4) 45%, rgb(244 63 94 / 0.3) 70%, #0b0710 92%)',
    swatch: 'linear-gradient(135deg, rgb(120 53 15), rgb(217 119 6), rgb(244 63 94))',
    a1: '120 53 15', a2: '217 119 6', a3: '244 63 94',
  },
  cosmicFade: {
    label: 'Cosmic Fade',
    description: 'Indigo night into deep rose',
    panel: 'linear-gradient(160deg, rgb(30 27 75 / 0.6), rgb(76 29 149 / 0.4) 50%, rgb(131 24 67 / 0.3) 75%, #0b0710 92%)',
    swatch: 'linear-gradient(135deg, rgb(30 27 75), rgb(76 29 149), rgb(131 24 67))',
    a1: '30 27 75', a2: '76 29 149', a3: '131 24 67',
  },
}
const MUSIC_GRADIENT_KEYS = Object.keys(MUSIC_GRADIENTS) as MusicGradientKey[]
const DEFAULT_MUSIC_GRADIENT: MusicGradientKey = 'auroraBorealis'

function readStoredMusicAccent(): AccentKey {
  if (typeof window === 'undefined') return DEFAULT_MUSIC_ACCENT
  try {
    const stored = window.localStorage.getItem(MUSIC_ACCENT_STORAGE_KEY)
    if (stored && stored !== 'custom' && stored in ACCENTS) return stored as AccentKey
  } catch {
    // localStorage unavailable (private mode, etc.) — fall back to default.
  }
  return DEFAULT_MUSIC_ACCENT
}

function readStoredMusicGradient(): MusicGradientKey {
  if (typeof window === 'undefined') return DEFAULT_MUSIC_GRADIENT
  try {
    const stored = window.localStorage.getItem(MUSIC_GRADIENT_STORAGE_KEY)
    if (stored && stored in MUSIC_GRADIENTS) return stored as MusicGradientKey
  } catch {
    // localStorage unavailable — fall back to default.
  }
  return DEFAULT_MUSIC_GRADIENT
}

function readStoredMusicThemeMode(): MusicThemeMode {
  if (typeof window === 'undefined') return 'color'
  try {
    const stored = window.localStorage.getItem(MUSIC_THEME_MODE_STORAGE_KEY)
    if (stored === 'gradient' || stored === 'color') return stored
  } catch {
    // localStorage unavailable — fall back to default.
  }
  return 'color'
}

// Same contrast math as the site-wide accent system, kept as a local copy
// (like the Gateway's own scoped theme does) so the Music room's palette
// never has to reach into global settings to compute readable button text.
function readableMusicAccentForeground(...tones: string[]) {
  const luminance = (tone: string) => {
    const [r, g, b] = tone.split(/\s+/).map(Number).map((value) => value / 255)
    const linear = (value: number) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
  }
  return luminance(tones[0]) > 0.33 ? 'rgb(8 18 32)' : 'rgb(255 255 255)'
}

function VolumeIcon({ volume, muted }: { volume: number; muted: boolean }) {
  if (muted || volume === 0) return <VolumeX className="size-4" />
  if (volume < 50) return <Volume1 className="size-4" />
  return <Volume2 className="size-4" />
}

// Tiny bouncing level-meter shown next to "Playing" — three bars animating
// out of phase so it reads like a live equalizer instead of a static icon.
function MiniEqualizer({ className }: { className?: string }) {
  return (
    <span className={cn('flex h-3 items-end gap-[2px]', className)} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-[rgb(var(--accent-1))]"
          style={{
            height: '100%',
            animation: 'gh-eq-bar 0.9s ease-in-out infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </span>
  )
}

// Circular neon waveform ring shown behind the now-playing art — a ring of
// thin bars radiating from the artwork's edge, alternating the site's two
// theme accents (violet → blue by default, but follows whatever accent
// pair the user has picked) so it reads as one continuous glow like the
// reference design's pink/blue halo. Purely decorative — it bounces on a
// staggered loop while something plays and settles flat when paused/idle,
// the same way MiniEqualizer already does for the tiny status-line meter.
function WaveformRing({ isPlaying }: { isPlaying: boolean }) {
  const bars = Array.from({ length: 40 })
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {bars.map((_, i) => {
        const angle = (i / bars.length) * 360
        const period = 1 + (i % 5) * 0.15
        const delay = (i % 10) * 0.08
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 w-[3px] origin-top"
            style={{ height: '50%', transform: `rotate(${angle}deg)` }}
          >
            <span
              className={cn(
                'absolute bottom-0 block w-full origin-bottom rounded-full',
                i % 2 === 0 ? 'bg-[rgb(var(--accent-1)/0.85)]' : 'bg-[rgb(var(--accent-2)/0.85)]',
              )}
              style={{
                height: '20%',
                animation: isPlaying ? `gh-eq-bar ${period}s ease-in-out infinite` : undefined,
                animationDelay: `${delay}s`,
                transform: isPlaying ? undefined : 'scaleY(0.3)',
                transition: 'transform 0.4s ease',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

// Shrinks its text to fit on one line instead of truncating with an
// ellipsis or spilling out of its container. Measures the natural width
// against the available space and steps the font-size down (down to
// minFontSize) until it fits — re-measures on resize, so it keeps up as
// the panel gets wider/narrower (e.g. the left player column growing,
// or the window resizing). Falls back to an ellipsis only once it's
// already as small as it's allowed to get, so nothing ever gets visually
// cut off or pushed out of view before shrinking first.
function AutoFitText({
  children,
  className,
  maxFontSizePx,
  minFontSizePx = 10,
}: {
  children: React.ReactNode
  className?: string
  maxFontSizePx?: number
  minFontSizePx?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [fontSizePx, setFontSizePx] = useState<number | null>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    const text = textRef.current
    if (!container || !text) return

    const fit = () => {
      const available = container.clientWidth
      if (!available) return
      const baseSize = maxFontSizePx ?? parseFloat(getComputedStyle(text).fontSize)
      text.style.fontSize = `${baseSize}px`
      const natural = text.scrollWidth
      if (natural <= available) {
        setFontSizePx(null)
        return
      }
      // Scale proportionally first (fast), then nudge down in small steps
      // to correct for rounding/kerning so it lands just inside the box.
      let size = Math.max(minFontSizePx, baseSize * (available / natural))
      text.style.fontSize = `${size}px`
      let guard = 0
      while (text.scrollWidth > available && size > minFontSizePx && guard < 10) {
        size -= 0.5
        text.style.fontSize = `${size}px`
        guard += 1
      }
      setFontSizePx(size)
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(container)
    return () => ro.disconnect()
  }, [children, maxFontSizePx, minFontSizePx])

  return (
    <div ref={containerRef} className="min-w-0 w-full overflow-hidden">
      <span
        ref={textRef}
        className={cn('inline-block max-w-full truncate align-bottom', className)}
        style={fontSizePx ? { fontSize: `${fontSizePx}px` } : undefined}
      >
        {children}
      </span>
    </div>
  )
}

function Timestamp({ date }: { date: Date }) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    setLabel(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }, [date])
  return <span className="text-[10px] text-muted-foreground/50">{label || '\u00A0'}</span>
}

function ChatBubble({ msg }: { msg: MusicChatMessage }) {
  const isUser = msg.kind === 'user'
  const isError = msg.kind === 'error'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex w-full gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div
          className={cn(
            'mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl ring-1',
            isError
              ? 'bg-destructive/10 text-destructive ring-destructive/25'
              : 'bg-gradient-to-br from-[rgb(var(--accent-1)/0.3)] to-[rgb(var(--accent-2)/0.2)] text-[rgb(var(--accent-1))] ring-[rgb(var(--accent-1)/0.25)]',
          )}
        >
          <Music4 className="size-4" />
        </div>
      )}
      <div className={cn('flex max-w-[80%] flex-col gap-2', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'rounded-tr-sm bg-[rgb(var(--accent-1)/0.18)] text-foreground ring-1 ring-[rgb(var(--accent-1)/0.3)]'
              : isError
                ? 'rounded-tl-sm bg-destructive/10 text-destructive ring-1 ring-destructive/20'
                : 'glass rounded-tl-sm text-foreground',
          )}
        >
          {msg.track ? (
            <div className="flex items-center gap-3">
              {msg.track.thumbnail ? (
                <img
                  src={msg.track.thumbnail}
                  alt=""
                  className="size-12 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                  <Music4 className="size-5" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{msg.track.title}</p>
                <p className="text-xs text-muted-foreground">{msg.text}</p>
              </div>
            </div>
          ) : (
            <span className="whitespace-pre-line">{msg.text}</span>
          )}
        </div>
        <Timestamp date={msg.timestamp} />
      </div>
    </motion.div>
  )
}

// " · via Spotify" / " · via Apple Music" / etc. — null (no suffix) for a
// native YouTube link or a typed song name, since those need no badge.
function viaPlatformSuffix(url: string): string {
  if (!isLikelyUrl(url) || isYoutubeHost(url)) return ''
  const label = detectLinkPlatformLabel(url)
  return label ? ` · via ${label}` : ''
}

export function MusicRoom() {
  const {
    messages,
    queue,
    input,
    setInput,
    resolving,
    showQueue,
    setShowQueue,
    playlists,
    showPlaylists,
    setShowPlaylists,
    createPlaylist,
    addNowPlayingToPlaylist,
    addQueueToPlaylist,
    addTrackToPlaylistByName,
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
    addSongToPlaylist,
    playerPanelSide,
    setPlayerPanelSide,
    miniPlayerPosition,
    setMiniPlayerPosition,
    miniPlayerSize,
    setMiniPlayerSize,
  } = useMusicRoom()
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { openStudio } = useUI()

  // Music room's own theme — separate from the site-wide accent in
  // Settings, so switching it here re-paints only the player (and persists
  // per-browser) without touching the rest of the site. Two independent
  // choices: which "mode" (a flat color or a multi-stop gradient) and
  // which swatch within that mode — each persisted on its own so
  // switching modes back and forth remembers the last pick in both.
  const [musicThemeMode, setMusicThemeMode] = useState<MusicThemeMode>(() => readStoredMusicThemeMode())
  const [musicAccent, setMusicAccent] = useState<AccentKey>(() => readStoredMusicAccent())
  const [musicGradient, setMusicGradient] = useState<MusicGradientKey>(() => readStoredMusicGradient())
  const [musicBackground, setMusicBackground] = useState<MusicBackgroundStyle>(() => readStoredMusicBackground())
  const [themePanelTab, setThemePanelTab] = useState<'color' | 'gradient'>(musicThemeMode)
  // Visual LAYOUT — where the "Now Playing" panel sits in the full room and
  // where/how big the floating Mini Player is elsewhere on the site.
  // Distinct from the color THEME above; state itself lives in
  // MusicProvider so the Mini Player (mounted separately, site-wide) reads
  // the same values.
  const [colorCategory, setColorCategory] = useState<AccentGroup>('recommended')
  useEffect(() => {
    try {
      window.localStorage.setItem(MUSIC_THEME_MODE_STORAGE_KEY, musicThemeMode)
    } catch {
      // Best-effort persistence only — not saving is a minor inconvenience.
    }
  }, [musicThemeMode])
  useEffect(() => {
    try {
      window.localStorage.setItem(MUSIC_ACCENT_STORAGE_KEY, musicAccent)
    } catch {
      // Best-effort persistence only — not saving is a minor inconvenience.
    }
  }, [musicAccent])
  useEffect(() => {
    try {
      window.localStorage.setItem(MUSIC_GRADIENT_STORAGE_KEY, musicGradient)
    } catch {
      // Best-effort persistence only — not saving is a minor inconvenience.
    }
  }, [musicGradient])
  useEffect(() => {
    try {
      window.localStorage.setItem(MUSIC_BACKGROUND_STORAGE_KEY, musicBackground)
    } catch {
      // Best-effort persistence only — not saving is a minor inconvenience.
    }
  }, [musicBackground])
  const musicThemeStyle = useMemo<CSSProperties>(() => {
    const tones = musicThemeMode === 'gradient' ? MUSIC_GRADIENTS[musicGradient] : ACCENTS[musicAccent]
    return {
      '--accent-1': tones.a1,
      '--accent-2': tones.a2,
      '--accent-3': tones.a3,
      '--accent-button-fg': readableMusicAccentForeground(tones.a1, tones.a2),
    } as CSSProperties
  }, [musicThemeMode, musicAccent, musicGradient])
  // What actually paints the "now playing" panel's backdrop — a flat
  // near-black base for color themes (unchanged from before), or the
  // selected gradient's full wash when a gradient theme is active.
  const musicPanelBackground = musicThemeMode === 'gradient' ? MUSIC_GRADIENTS[musicGradient].panel : '#0b0710'
  const [showCommands, setShowCommands] = useState(false)
  const [showTheme, setShowTheme] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(0)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  // Per-playlist "add a song without playing it" inline field — keyed by
  // playlist id so only one row's form is open at a time.
  const [addSongOpenId, setAddSongOpenId] = useState<string | null>(null)
  const [addSongQuery, setAddSongQuery] = useState('')
  const [addingSong, setAddingSong] = useState(false)
  // Which playlist's saved-songs list is expanded — only one at a time, so
  // opening a playlist's tracks to manage them doesn't clutter the drawer.
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null)
  // Which queue track currently has its "add to playlist" picker open —
  // lets a user save ANY individual song out of the playing queue/playlist
  // into a saved playlist, not just whichever one happens to be playing.
  const [addToPlaylistTrackId, setAddToPlaylistTrackId] = useState<string | null>(null)

  // The right side is a real tab strip (Queue / Playlists / Commands)
  // instead of three independently-toggled stacked drawers — only one
  // panel shows at a time, like a real music app's library pane. The
  // underlying open/closed booleans still come from the same
  // showQueue/showPlaylists/showCommands state (showQueue and
  // showPlaylists are shared with chat commands like "/queue" and
  // "/playlist list", which still need to be able to open them), this
  // just keeps them mutually exclusive and adds one place to reason about
  // "which tab is active".
  type MusicTab = 'queue' | 'playlists' | 'commands' | 'theme' | null
  const activeTab: MusicTab = showQueue ? 'queue' : showPlaylists ? 'playlists' : showCommands ? 'commands' : showTheme ? 'theme' : null
  function selectTab(tab: Exclude<MusicTab, null>) {
    const next = activeTab === tab ? null : tab
    setShowQueue(next === 'queue')
    setShowPlaylists(next === 'playlists')
    setShowCommands(next === 'commands')
    setShowTheme(next === 'theme')
  }

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // While the user is still typing the command name itself (no space yet),
  // show a filtered, selectable list of every "/command" instead of making
  // them type the whole thing out. Once there's a space (they're now typing
  // the command's argument, e.g. "/play bones"), the suggestions close.
  const slashQuery = /^\/[a-z]*$/i.test(input) ? input.slice(1).toLowerCase() : null
  const suggestions =
    slashQuery === null
      ? []
      : SLASH_COMMAND_HELP.filter((cmd) => slashCommandName(cmd).slice(1).toLowerCase().startsWith(slashQuery))
  // Once the input exactly matches a command name (the player already
  // picked it, or typed it out in full), close the list so Enter submits
  // normally instead of just re-applying the same suggestion.
  const isExactMatch = slashQuery !== null && suggestions.length === 1 && slashCommandName(suggestions[0]).slice(1).toLowerCase() === slashQuery
  const suggestionsOpen = suggestions.length > 0 && !isExactMatch

  useEffect(() => {
    setActiveSuggestion(0)
  }, [slashQuery])

  function applySuggestion(cmd: (typeof SLASH_COMMAND_HELP)[number]) {
    // Fills in everything up to the first "<placeholder>" (e.g. "/playlist
    // add " for "/playlist add <name>"), so the user can keep typing the
    // argument immediately; argument-less commands are ready to send as-is.
    setInput(slashCommandPrefix(cmd))
    inputRef.current?.focus()
  }

  const seekPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  return (
    <div
      className={cn(
        'relative flex h-[760px] max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl border border-border/60 md:h-[820px] md:flex-row',
        playerPanelSide === 'right' && 'md:flex-row-reverse',
      )}
      style={musicThemeStyle}
    >
      {/* LEFT — the "play" side. A real now-playing hero: the track's own
          art blurred huge behind everything (like a real streaming app's
          full-bleed player), a spinning vinyl-style disc in front, and a
          pill-shaped transport bar. Deliberately holds nothing but
          playback — queue/playlists/commands live entirely on the right
          now, so this side reads as pure "now playing", not a toolbar.
          overflow-hidden (not auto): everything below is sized to always
          fit this column, so it never needs its own scrollbar. */}
      <div
        className={cn(
          'relative flex shrink-0 flex-col overflow-hidden border-b border-border/60 p-5 md:w-[320px] md:border-b-0 lg:w-[360px] xl:w-[400px]',
          playerPanelSide === 'right' ? 'md:border-l' : 'md:border-r',
        )}
        style={{ background: musicPanelBackground, transition: 'background 0.5s ease' }}
      >
        {/* Blurred backdrop from the track's own art — the same trick
            Spotify/Apple Music use so the player's mood always matches
            whatever's playing, instead of a flat static panel. Only for
            the "Blurred art" background style; other styles replace it
            below. */}
        {musicBackground === 'artBlur' && nowPlaying?.thumbnail && (
          <div
            aria-hidden="true"
            className="absolute inset-0 scale-125 bg-cover bg-center opacity-40 blur-3xl"
            style={{ backgroundImage: `url(${nowPlaying.thumbnail})` }}
          />
        )}
        {musicBackground === 'artBlur' && <div className="gh-music-grid absolute inset-0 opacity-40" aria-hidden="true" />}
        {/* "Aurora waves" — three soft blobs in the panel's own accent
            tones (rgb(var(--accent-1/2/3)), set by musicThemeStyle above),
            drifting slowly via CSS transform only. No new colors here —
            it always matches whatever swatch/gradient is active. */}
        {musicBackground === 'aurora' && (
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
            <div className="gh-music-aurora-a absolute -left-1/4 -top-1/3 size-[70%] rounded-full bg-[rgb(var(--accent-1)/0.55)] blur-3xl" />
            <div className="gh-music-aurora-b absolute -right-1/3 -bottom-1/4 size-[65%] rounded-full bg-[rgb(var(--accent-2)/0.5)] blur-3xl" />
            <div className="gh-music-aurora-a absolute left-1/4 top-1/4 size-[50%] rounded-full bg-[rgb(var(--accent-3)/0.4)] blur-3xl [animation-delay:-9s]" />
          </div>
        )}
        {/* Scattered star field — small dots for a night-sky feel behind
            the player. Under "Blurred art" it's a quiet static accent;
            under "Starfield" it's the whole show, denser and twinkling. */}
        {(musicBackground === 'artBlur' || musicBackground === 'starfield') && (
          <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true">
            {(musicBackground === 'starfield' ? STARFIELD_DENSE_POSITIONS : STAR_POSITIONS).map(([x, y], i) => (
              <span
                key={i}
                className={cn('absolute size-[2px] rounded-full bg-white', musicBackground === 'starfield' && 'gh-music-star')}
                style={
                  musicBackground === 'starfield'
                    ? ({
                        left: `${x}%`,
                        top: `${y}%`,
                        '--star-min': 0.15,
                        '--star-max': 0.95,
                        '--star-duration': `${2.4 + (i % 5) * 0.6}s`,
                        '--star-delay': `${(i % 7) * 0.35}s`,
                      } as CSSProperties)
                    : { left: `${x}%`, top: `${y}%`, opacity: 0.2 + (i % 4) * 0.15 }
                }
              />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/70" aria-hidden="true" />
        {/* Ambient glow that breathes while something plays. */}
        {isPlaying && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--accent-1)/0.35)] blur-3xl"
            animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Header — "NOW PLAYING" status + loop badge, standing in for the
            old toolbar row now that queue/playlists/commands live on the
            right as real tabs. */}
        <div className="relative z-10 flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[rgb(var(--accent-1))]">
            <MiniEqualizer className={!isPlaying ? 'opacity-30' : undefined} />
            Now Playing
          </div>
          {loop && (
            <span className="flex items-center gap-1 rounded-full bg-[rgb(var(--accent-1)/0.15)] px-2.5 py-1 text-[10px] font-semibold text-[rgb(var(--accent-1))] ring-1 ring-[rgb(var(--accent-1)/0.3)]">
              <Repeat className="size-3" /> Loop
            </span>
          )}
        </div>

        <div className="relative z-10 flex w-full min-h-0 flex-1 flex-col items-center justify-center gap-3 py-2 text-center">
          {/* Neon waveform ring around the art — replaces the old vinyl
              spin with the reference design's radiating halo, colored from
              the site's own accent pair so it follows whatever theme the
              user has picked elsewhere. */}
          <div className="relative grid size-28 shrink-0 place-items-center md:size-40">
            <WaveformRing isPlaying={isPlaying} />
            <div
              className={cn(
                'relative size-20 shrink-0 overflow-hidden rounded-full bg-[rgb(var(--accent-1)/0.15)] shadow-[0_20px_50px_-16px_rgba(0,0,0,0.7)] ring-4 ring-black/40 md:size-28',
                isPlaying && 'animate-[gh-pulse-ring_2.4s_ease-out_infinite]',
              )}
            >
              {nowPlaying?.thumbnail ? (
                <img src={nowPlaying.thumbnail} alt="" className="size-full object-cover" />
              ) : (
                <div className="grid size-full place-items-center text-[rgb(var(--accent-1))]">
                  <Music4 className="size-8 md:size-12" />
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 w-full px-1">
            <AutoFitText
              className="font-bold text-white"
              maxFontSizePx={18}
              minFontSizePx={12}
            >
              {nowPlaying ? nowPlaying.title : 'Nothing queued yet'}
            </AutoFitText>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-xs font-medium text-white/60">
              {isPlaying && <MiniEqualizer />}
              {nowPlaying
                ? isPlaying
                  ? 'Playing'
                  : status === 'loading'
                    ? 'Loading…'
                    : 'Paused'
                : 'Type /play <song or link> below to start'}
            </p>
            {sourcePlatformLabel && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Found via {sourcePlatformLabel}
              </span>
            )}
          </div>

          {/* Seek bar */}
          <div className="flex w-full items-center gap-2.5">
            <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-white/50">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.5}
              value={Math.min(currentTime, duration || 0)}
              onChange={(e) => seek(Number(e.target.value))}
              disabled={!nowPlaying || !duration}
              aria-label="Seek"
              className="gh-seek h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[rgb(var(--accent-1))] disabled:cursor-default disabled:opacity-40"
              style={{ background: duration ? `linear-gradient(90deg, rgb(var(--accent-1)) ${seekPercent}%, rgb(255 255 255 / 0.15) ${seekPercent}%)` : undefined }}
            />
            <span className="w-9 shrink-0 text-[10px] tabular-nums text-white/50">
              {duration ? formatTime(duration) : '0:00'}
            </span>
          </div>

          {/* Transport — a pill-shaped control bar, the centerpiece of the
              player, with a bigger glowing play button. */}
          <div className="flex items-center gap-2 rounded-full bg-black/30 p-2 shadow-inner ring-1 ring-white/10">
            <button
              type="button"
              onClick={previousOrRewind}
              disabled={!nowPlaying}
              aria-label="Previous / rewind track"
              title="Previous / rewind"
              className="gh-interactive grid size-9 place-items-center rounded-full text-white/80 outline-none hover:bg-white/10 disabled:opacity-30"
            >
              <SkipBack className="size-4" />
            </button>
            <motion.button
              type="button"
              onClick={togglePlayPause}
              disabled={!nowPlaying}
              whileHover={nowPlaying ? { scale: 1.08 } : undefined}
              whileTap={nowPlaying ? { scale: 0.92 } : undefined}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="gh-interactive relative grid size-14 place-items-center rounded-full bg-[rgb(var(--accent-1))] text-[var(--accent-button-fg)] shadow-[0_10px_28px_-6px_rgb(var(--accent-1)/0.75)] outline-none disabled:opacity-40 disabled:shadow-none"
            >
              {isPlaying ? <Pause className="size-6" /> : <Play className="size-6 translate-x-px" />}
            </motion.button>
            <button
              type="button"
              onClick={skip}
              disabled={queue.length < 2}
              aria-label="Skip to next track"
              title="Forward / skip"
              className="gh-interactive grid size-9 place-items-center rounded-full text-white/80 outline-none hover:bg-white/10 disabled:opacity-30"
            >
              <SkipForward className="size-4" />
            </button>
          </div>

          {/* Volume control */}
          <div className="flex w-full items-center gap-3">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className="gh-interactive grid size-8 shrink-0 place-items-center rounded-lg text-white/60 outline-none hover:text-white"
            >
              <VolumeIcon volume={volume} muted={muted} />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[rgb(var(--accent-1))]"
            />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-white/50">
              {muted ? 0 : volume}%
            </span>
          </div>
        </div>

        {/* Up next strip — a quick peek at what's coming, pulled straight
            from the real queue. "See all" opens the full Queue tab on the
            right instead of duplicating it here. */}
        {queue.length > 1 && (
          <div className="relative z-10 shrink-0 pt-1">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/50">
                <ListMusic className="size-3" /> Up Next
              </span>
              <button
                type="button"
                onClick={() => selectTab('queue')}
                className="gh-interactive flex items-center gap-0.5 text-[10px] font-semibold text-white/50 outline-none hover:text-white"
              >
                See all <ChevronRight className="size-3" />
              </button>
            </div>
            <div className="flex w-full gap-2">
              <AnimatePresence initial={false}>
                {queue.slice(1, 4).map((track, i) => (
                  <motion.div
                    key={track.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.28, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white/5 p-1.5 ring-1 ring-white/10"
                  >
                    {track.thumbnail ? (
                      <img src={track.thumbnail} alt="" className="size-8 shrink-0 rounded-lg object-cover" loading="lazy" />
                    ) : (
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-white/50">
                        <Music4 className="size-3.5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <AutoFitText
                        className="text-left font-medium text-white/80"
                        maxFontSizePx={11}
                        minFontSizePx={8}
                      >
                        {track.title}
                      </AutoFitText>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Just the full-studio shortcut now — Theme colors/gradients and
            Room layout both moved to the "Theme" tab on the right, so this
            side stays pure "now playing" with no controls of its own. */}
        <div className="relative z-10 flex shrink-0 justify-end pt-2">
          <button
            type="button"
            onClick={openStudio}
            aria-label="Open full customization studio"
            title="Full site customization"
            className="gh-interactive grid size-6 shrink-0 place-items-center rounded-full bg-white/10 text-white/60 outline-none hover:bg-white/20 hover:text-white"
          >
            <SlidersHorizontal className="size-3" />
          </button>
        </div>
      </div>

      {/* Right side — "all functions": queue, playlists, command
          reference, the chat log, and the command input. On mobile this
          stays stacked directly under the player like before; from md up
          it becomes its own scrollable column next to the player so
          browsing playlists/queue/commands never has to interrupt or
          scroll past playback controls. */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background/40">

      {/* Tab strip — Queue / Playlists / Commands as real, mutually
          exclusive tabs (a real music app's library switcher) instead of
          three independently-toggleable buttons buried in the transport
          bar. Badges carry over from the old icon buttons. */}
      <div role="tablist" className="flex shrink-0 border-b border-border/60">
        {([
          { key: 'queue' as const, label: 'Queue', icon: ListMusic, count: queue.length > 1 ? queue.length - 1 : 0 },
          { key: 'playlists' as const, label: 'Playlists', icon: ListPlus, count: playlists.length },
          { key: 'commands' as const, label: 'Commands', icon: Terminal, count: 0 },
          { key: 'theme' as const, label: 'Theme', icon: Palette, count: 0 },
        ]).map((tab) => {
          const isActive = activeTab === tab.key
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => selectTab(tab.key)}
              className="gh-music-tab gh-interactive relative flex min-w-0 flex-1 items-center justify-center gap-1.5 px-2 py-3 text-xs font-semibold text-muted-foreground outline-none"
            >
              <Icon className="size-3.5 shrink-0" />
              {/* Auto-shrinks instead of wrapping/clipping — so on a
                  narrow right column ("Playlists" being the long one)
                  every tab always stays fully visible and legible
                  rather than getting cut off or pushed out of view. */}
              <AutoFitText maxFontSizePx={12} minFontSizePx={9}>
                {tab.label}
              </AutoFitText>
              {tab.count > 0 && (
                <span
                  className={cn(
                    'grid size-4 shrink-0 place-items-center rounded-full text-[9px] font-bold',
                    isActive ? 'bg-[rgb(var(--accent-1))] text-[var(--accent-button-fg)]' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="gh-music-tab-underline"
                  className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-[rgb(var(--accent-1))]"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Queue tab */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden border-b border-border/60 bg-background/30"
          >
            <div className="max-h-[22rem] space-y-1.5 overflow-y-auto p-3">
              {queue.length <= 1 ? (
                <p className="px-2 py-2 text-xs text-muted-foreground">{'Nothing queued up next. Use /play <song or link> to add one.'}</p>
              ) : (
                <AnimatePresence initial={false}>
                  {queue.slice(1).map((track, i) => (
                    <motion.div
                      key={track.id}
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.26, delay: Math.min(i, 6) * 0.03, ease: [0.22, 1, 0.36, 1] }}
                      className="group rounded-xl p-2 transition-colors hover:bg-white/5"
                    >
                    <div className="flex items-center gap-2.5">
                      {track.thumbnail ? (
                        <img src={track.thumbnail} alt="" className="size-9 shrink-0 rounded-md object-cover shadow-md" />
                      ) : (
                        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                          <Music4 className="size-3.5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">{track.title}</p>
                        <p className="text-[10px] text-muted-foreground">#{i + 1} in queue{viaPlatformSuffix(track.url)}</p>
                      </div>
                      {/* Save THIS specific song to a playlist — picks from
                          any track in the queue, not just whatever's
                          currently playing, so a whole playing playlist can
                          be copied over one song at a time without every
                          click just re-adding track #1. Stays visible when
                          its own picker is open even if the row isn't
                          hovered (aria-pressed), otherwise only shows on
                          hover to keep the row clean like a real playlist
                          list. */}
                      <button
                        type="button"
                        onClick={() => setAddToPlaylistTrackId((id) => (id === track.id ? null : track.id))}
                        aria-label={`Add ${track.title} to a playlist`}
                        title="Add to playlist"
                        aria-pressed={addToPlaylistTrackId === track.id}
                        className="gh-interactive grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 outline-none hover:text-[rgb(var(--accent-1))] group-hover:opacity-100 aria-pressed:opacity-100 aria-pressed:bg-[rgb(var(--accent-1)/0.14)] aria-pressed:text-[rgb(var(--accent-1))]"
                      >
                        <PlusCircle className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromQueue(track.id)}
                        aria-label={`Remove ${track.title} from queue`}
                        className="gh-interactive grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 outline-none hover:text-destructive group-hover:opacity-100"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                    <AnimatePresence>
                      {addToPlaylistTrackId === track.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-[42px] mt-1.5 flex flex-wrap gap-1.5 pb-1">
                            {playlists.length === 0 ? (
                              <p className="text-[10px] text-muted-foreground">No playlists yet — create one first.</p>
                            ) : (
                              playlists.map((playlist) => (
                                <button
                                  key={playlist.id}
                                  type="button"
                                  onClick={() => {
                                    addTrackToPlaylistByName(playlist.name, track)
                                    setAddToPlaylistTrackId(null)
                                  }}
                                  className="gh-interactive rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-[10px] font-medium text-foreground outline-none hover:border-[rgb(var(--accent-1)/0.5)] hover:text-[rgb(var(--accent-1))]"
                                >
                                  {playlist.name}
                                </button>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlists drawer */}
      <AnimatePresence>
        {showPlaylists && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden border-b border-border/60 bg-background/30"
          >
            <div className="max-h-72 space-y-2.5 overflow-y-auto p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const name = newPlaylistName.trim()
                  if (!name) return
                  createPlaylist(name)
                  setNewPlaylistName('')
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="New playlist name…"
                  aria-label="New playlist name"
                  className="min-w-0 flex-1 rounded-lg border border-border/70 bg-background/60 px-3 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-[rgb(var(--accent-1)/0.5)]"
                />
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  aria-label="Create playlist"
                  title="Create playlist"
                  className="gh-interactive flex shrink-0 items-center gap-1 rounded-lg bg-[rgb(var(--accent-1))] px-2.5 py-1.5 text-xs font-semibold text-[var(--accent-button-fg)] outline-none disabled:cursor-not-allowed disabled:bg-[rgb(var(--accent-1)/0.35)]"
                >
                  <PlusCircle className="size-3.5" />
                  Create
                </button>
              </form>

              {playlists.length === 0 ? (
                <p className="px-1 py-1 text-xs text-muted-foreground">No playlists yet — name one above, or use /playlist save &lt;name&gt; to save the current queue.</p>
              ) : (
                playlists.map((playlist) => (
                  <div key={playlist.id} className="rounded-xl bg-background/50 p-2">
                    {/* Name/avatar and action buttons are split into their own
                        flex groups (rather than one long row) so the six
                        action icons wrap onto their own line on narrow
                        screens instead of crushing the playlist name. */}
                    <div className="flex flex-wrap items-center gap-y-1.5">
                      <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-1">
                        <div className="grid size-8 shrink-0 place-items-center rounded-md bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                          <ListMusic className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground">{playlist.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {playlist.tracks.length} track{playlist.tracks.length === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => nowPlaying && addNowPlayingToPlaylist(playlist.name)}
                          disabled={!nowPlaying}
                          aria-label={`Add current track to ${playlist.name}`}
                          title="Add currently playing track"
                          className="gh-interactive grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:text-[rgb(var(--accent-1))] disabled:opacity-30"
                        >
                          <PlusCircle className="size-3.5" />
                        </button>
                        {/* Adds every track in the currently playing queue
                            (e.g. a whole playlist someone just queued with
                            /playlist play or a pasted Spotify playlist link)
                            to this saved playlist in one go, instead of only
                            the single now-playing track above. */}
                        <button
                          type="button"
                          onClick={() => queue.length > 0 && addQueueToPlaylist(playlist.name)}
                          disabled={queue.length === 0}
                          aria-label={`Add all ${queue.length} playing track${queue.length === 1 ? '' : 's'} to ${playlist.name}`}
                          title="Add every track that's currently queued/playing"
                          className="gh-interactive grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:text-[rgb(var(--accent-1))] disabled:opacity-30"
                        >
                          <ListChecks className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddSongOpenId((id) => (id === playlist.id ? null : playlist.id))
                            setAddSongQuery('')
                          }}
                          aria-label={`Add a song to ${playlist.name} without playing it`}
                          title="Add a song without playing it"
                          aria-pressed={addSongOpenId === playlist.id}
                          className="gh-interactive grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:text-[rgb(var(--accent-1))] aria-pressed:bg-[rgb(var(--accent-1)/0.12)] aria-pressed:text-[rgb(var(--accent-1))]"
                        >
                          <Search className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => playPlaylist(playlist.name)}
                          disabled={playlist.tracks.length === 0}
                          aria-label={`Play ${playlist.name}`}
                          title="Queue this playlist"
                          className="gh-interactive grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:text-[rgb(var(--accent-1))] disabled:opacity-30"
                        >
                          <Play className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePlaylistById(playlist.id)}
                          aria-label={`Delete ${playlist.name}`}
                          title="Delete playlist"
                          className="gh-interactive grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedPlaylistId((id) => (id === playlist.id ? null : playlist.id))}
                          aria-label={expandedPlaylistId === playlist.id ? `Hide songs in ${playlist.name}` : `Manage songs in ${playlist.name}`}
                          title="Manage songs"
                          aria-pressed={expandedPlaylistId === playlist.id}
                          className="gh-interactive grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:text-[rgb(var(--accent-1))] aria-pressed:bg-[rgb(var(--accent-1)/0.12)] aria-pressed:text-[rgb(var(--accent-1))]"
                        >
                          {expandedPlaylistId === playlist.id ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded song list — lets a user see every track
                        saved in this playlist and play or remove them
                        individually, instead of only being able to queue
                        or delete the playlist as a whole. */}
                    {expandedPlaylistId === playlist.id && (
                      <div className="mt-2 space-y-1 pl-[42px]">
                        {playlist.tracks.length === 0 && (
                          <p className="px-1 py-1 text-[10px] text-muted-foreground">No songs left in this playlist.</p>
                        )}
                        {playlist.tracks.map((track, i) => (
                          <div key={track.id} className="flex items-center gap-2 rounded-lg bg-background/40 p-1.5">
                            {track.thumbnail ? (
                              <img src={track.thumbnail} alt="" className="size-7 shrink-0 rounded object-cover" />
                            ) : (
                              <div className="grid size-7 shrink-0 place-items-center rounded bg-[rgb(var(--accent-1)/0.12)] text-[rgb(var(--accent-1))]">
                                <Music4 className="size-3" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs text-foreground">{track.title}</p>
                              <p className="text-[10px] text-muted-foreground">#{i + 1}{viaPlatformSuffix(track.url)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => queueTrackFromPlaylist(playlist.id, track.id)}
                              aria-label={`Play ${track.title}`}
                              title="Queue this song"
                              className="gh-interactive grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:text-[rgb(var(--accent-1))]"
                            >
                              <Play className="size-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTrackFromPlaylistById(playlist.id, track.id)}
                              aria-label={`Remove ${track.title} from ${playlist.name}`}
                              title="Remove from playlist"
                              className="gh-interactive grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:text-destructive"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline "add without playing" field — resolves a song
                        name or a link from most platforms and saves it straight
                        to this playlist without queueing or playing it. */}
                    {addSongOpenId === playlist.id && (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault()
                          const q = addSongQuery.trim()
                          if (!q || addingSong) return
                          setAddingSong(true)
                          await addSongToPlaylist(playlist.name, q)
                          setAddingSong(false)
                          setAddSongQuery('')
                          setAddSongOpenId(null)
                        }}
                        className="mt-2 flex items-center gap-2 pl-[42px]"
                      >
                        <input
                          type="text"
                          value={addSongQuery}
                          onChange={(e) => setAddSongQuery(e.target.value)}
                          placeholder="Song name or link — won\u2019t play"
                          aria-label={`Song to add to ${playlist.name} without playing`}
                          autoFocus
                          className="min-w-0 flex-1 rounded-lg border border-border/70 bg-background/60 px-2.5 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-[rgb(var(--accent-1)/0.5)]"
                        />
                        <button
                          type="submit"
                          disabled={!addSongQuery.trim() || addingSong}
                          aria-label="Add song to playlist"
                          title="Add to playlist"
                          className="gh-interactive flex shrink-0 items-center gap-1 rounded-lg bg-[rgb(var(--accent-1))] px-2.5 py-1.5 text-xs font-semibold text-[var(--accent-button-fg)] outline-none disabled:cursor-not-allowed disabled:bg-[rgb(var(--accent-1)/0.35)]"
                        >
                          <PlusCircle className="size-3.5" />
                          {addingSong ? 'Adding…' : 'Add'}
                        </button>
                      </form>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Commands reference — every command in this room starts with "/" */}
      <AnimatePresence>
        {showCommands && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden border-b border-border/60 bg-background/30"
          >
            {/* Taller cap (25 commands total) and a two-column grid once
                there's room, with each row stacking its command above its
                description instead of squeezing them side by side — long
                commands like "/playlist addqueue <name>" used to crush the
                description text into a tall, barely-readable sliver. */}
            <div className="max-h-[28rem] space-y-2 overflow-y-auto p-3 sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0">
              <p className="col-span-full px-1 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Every command starts with <span className="text-[rgb(var(--accent-1))]">/</span>
              </p>
              {SLASH_COMMAND_HELP.map((cmd) => (
                <div key={cmd.command} className="flex flex-col items-start gap-1.5 rounded-xl bg-background/50 p-2.5">
                  <code className="w-fit shrink-0 rounded-md bg-[rgb(var(--accent-1)/0.12)] px-1.5 py-1 text-[11px] font-semibold text-[rgb(var(--accent-1))]">
                    {cmd.command}
                  </code>
                  <p className="text-[11px] leading-4 text-muted-foreground">{cmd.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme tab — color/gradient picker plus Room layout, both moved
          here next to Queue/Playlists/Commands so neither adds scrollable
          height to the "now playing" side. Colors/gradients are the Music
          room's own scoped theme (musicThemeStyle/musicPanelBackground);
          Room layout is arrangement only (panel side, Mini Player position
          & size — state lives in MusicProvider). Uses the same
          foreground/muted-foreground tokens as the rest of this panel so
          text stays legible in both light and dark site themes, instead of
          hardcoded white. */}
      <AnimatePresence>
        {showTheme && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden border-b border-border/60 bg-background/30"
          >
            <div className="max-h-[28rem] space-y-4 overflow-y-auto p-3">
              <div>
                <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
                  <button
                    type="button"
                    onClick={() => setThemePanelTab('color')}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-semibold outline-none transition-colors',
                      themePanelTab === 'color' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Palette className="size-3" /> Colors
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemePanelTab('gradient')}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-semibold outline-none transition-colors',
                      themePanelTab === 'gradient' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Sparkles className="size-3" /> Gradients
                  </button>
                </div>

                <div className="mt-2.5">
                  {themePanelTab === 'color' ? (
                    <div>
                      <div className="flex flex-wrap items-center gap-1">
                        {ACCENT_GROUPS.map((group) => (
                          <button
                            key={group.key}
                            type="button"
                            onClick={() => setColorCategory(group.key)}
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold outline-none transition-colors',
                              colorCategory === group.key
                                ? 'bg-[rgb(var(--accent-1))] text-[var(--accent-button-fg)]'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                          >
                            {group.label}
                          </button>
                        ))}
                      </div>
                      {/* Fixed small size (not grid-stretched) so the
                          swatches stay compact instead of ballooning to
                          fill the column width. */}
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {(ACCENT_GROUPS.find((g) => g.key === colorCategory)?.accents ?? []).map((key, i) => {
                          const isActive = musicThemeMode === 'color' && musicAccent === key
                          return (
                            <motion.button
                              key={key}
                              type="button"
                              initial={{ opacity: 0, scale: 0.6 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.22, delay: i * 0.02, ease: [0.22, 1, 0.36, 1] }}
                              onClick={() => {
                                setMusicThemeMode('color')
                                setMusicAccent(key)
                              }}
                              aria-label={`Use ${ACCENTS[key].label} theme`}
                              title={ACCENTS[key].label}
                              className={cn(
                                'gh-interactive relative grid size-6 shrink-0 place-items-center rounded-full outline-none ring-2 ring-offset-2 ring-offset-background transition-transform',
                                isActive ? 'ring-[rgb(var(--accent-1))]' : 'ring-transparent hover:scale-105',
                              )}
                              style={{ background: `linear-gradient(135deg, rgb(${ACCENTS[key].a1}), rgb(${ACCENTS[key].a2}))` }}
                            >
                              {isActive && <Check className="size-3 text-white drop-shadow" />}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
                      {MUSIC_GRADIENT_KEYS.map((key, i) => {
                        const gradient = MUSIC_GRADIENTS[key]
                        const isActive = musicThemeMode === 'gradient' && musicGradient === key
                        return (
                          <motion.button
                            key={key}
                            type="button"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.22, delay: i * 0.02, ease: [0.22, 1, 0.36, 1] }}
                            onClick={() => {
                              setMusicThemeMode('gradient')
                              setMusicGradient(key)
                            }}
                            aria-label={`Use ${gradient.label} theme`}
                            title={`${gradient.label} — ${gradient.description}`}
                            className="flex flex-col items-center gap-1"
                          >
                            <span
                              className={cn(
                                'gh-interactive relative grid size-8 place-items-center rounded-lg outline-none ring-2 ring-offset-2 ring-offset-background transition-transform',
                                isActive ? 'ring-[rgb(var(--accent-1))]' : 'ring-transparent hover:scale-105',
                              )}
                              style={{ background: gradient.swatch }}
                            >
                              {isActive && <Check className="size-3 text-white drop-shadow" />}
                            </span>
                            <span className="w-full truncate text-center text-[9px] font-medium leading-tight text-muted-foreground">
                              {gradient.label}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Player background — the visual STYLE of the now-playing
                  backdrop, independent of the Colors/Gradients swatch
                  above (that only picks the tone; this picks how it's
                  rendered — blurred art, an animated wash in that same
                  tone, a twinkling starfield, or a flat minimal panel). */}
              <div className="border-t border-border/60 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Player background</span>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {MUSIC_BACKGROUND_OPTIONS.map((opt, i) => {
                    const isActive = musicBackground === opt.key
                    return (
                      <motion.button
                        key={opt.key}
                        type="button"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                        onClick={() => setMusicBackground(opt.key)}
                        aria-pressed={isActive}
                        title={opt.description}
                        className={cn(
                          'flex items-center gap-1.5 rounded-md border py-1.5 pl-2 pr-2.5 text-left text-[11px] font-semibold outline-none transition-colors',
                          isActive
                            ? 'border-[rgb(var(--accent-1)/0.55)] bg-[rgb(var(--accent-1)/0.15)] text-foreground'
                            : 'border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        <opt.icon className="size-3.5 shrink-0" />
                        {opt.label}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Room layout — arrangement, not color. Which side the "Now
                  Playing" panel sits on in the full room, plus where and
                  how big the floating Mini Player is elsewhere on the
                  site. */}
              <div className="space-y-3 border-t border-border/60 pt-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Room layout</span>
                  <div className="mt-1.5 flex items-center gap-1 rounded-lg bg-muted/50 p-1">
                    <button
                      type="button"
                      onClick={() => setPlayerPanelSide('left')}
                      aria-pressed={playerPanelSide === 'left'}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-semibold outline-none transition-colors',
                        playerPanelSide === 'left' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <PanelLeft className="size-3" /> Player left
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlayerPanelSide('right')}
                      aria-pressed={playerPanelSide === 'right'}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-semibold outline-none transition-colors',
                        playerPanelSide === 'right' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <PanelRight className="size-3" /> Player right
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Mini Player position</span>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    {([
                      { key: 'top-left', label: 'Top left' },
                      { key: 'top-right', label: 'Top right' },
                      { key: 'bottom-left', label: 'Bottom left' },
                      { key: 'bottom-right', label: 'Bottom right' },
                    ] as const).map((pos) => (
                      <button
                        key={pos.key}
                        type="button"
                        onClick={() => setMiniPlayerPosition(pos.key)}
                        aria-pressed={miniPlayerPosition === pos.key}
                        className={cn(
                          'rounded-md border py-1.5 text-[11px] font-semibold outline-none transition-colors',
                          miniPlayerPosition === pos.key
                            ? 'border-[rgb(var(--accent-1)/0.55)] bg-[rgb(var(--accent-1)/0.15)] text-foreground'
                            : 'border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Mini Player size</span>
                  <div className="mt-1.5 flex items-center gap-1 rounded-lg bg-muted/50 p-1">
                    <button
                      type="button"
                      onClick={() => setMiniPlayerSize('standard')}
                      aria-pressed={miniPlayerSize === 'standard'}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-semibold outline-none transition-colors',
                        miniPlayerSize === 'standard' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <Maximize2 className="size-3" /> Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setMiniPlayerSize('compact')}
                      aria-pressed={miniPlayerSize === 'compact'}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-semibold outline-none transition-colors',
                        miniPlayerSize === 'compact' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <Minimize2 className="size-3" /> Compact
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat feed */}
      <div ref={bodyRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} />
        ))}
        {resolving && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link2 className="size-3.5 animate-pulse" /> Resolving…
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submitInput()
        }}
        className="flex shrink-0 items-center gap-2 border-t border-border/60 bg-background/40 p-3"
      >
        <div className="relative min-w-0 flex-1">
          {/* Slash-command suggestions — lets the player pick a command
              instead of typing the whole thing out. */}
          <AnimatePresence>
            {suggestionsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="glass absolute bottom-full left-0 mb-2 w-full max-w-lg overflow-hidden rounded-xl border border-border/70 shadow-lg"
                role="listbox"
              >
                <div className="max-h-80 overflow-y-auto p-1.5">
                  {suggestions.map((cmd, i) => (
                    <button
                      key={cmd.command}
                      type="button"
                      role="option"
                      aria-selected={i === activeSuggestion}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        applySuggestion(cmd)
                      }}
                      onMouseEnter={() => setActiveSuggestion(i)}
                      className={cn(
                        'flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left',
                        i === activeSuggestion ? 'bg-[rgb(var(--accent-1)/0.12)]' : 'hover:bg-muted/50',
                      )}
                    >
                      <code className="shrink-0 rounded-md bg-[rgb(var(--accent-1)/0.12)] px-1.5 py-1 text-[11px] font-semibold text-[rgb(var(--accent-1))]">
                        {cmd.command}
                      </code>
                      <span className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{cmd.description}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (!suggestionsOpen) return
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActiveSuggestion((i) => (i + 1) % suggestions.length)
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActiveSuggestion((i) => (i - 1 + suggestions.length) % suggestions.length)
              } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault()
                applySuggestion(suggestions[activeSuggestion])
              } else if (e.key === 'Escape') {
                setInput('')
              }
            }}
            role="combobox"
            aria-expanded={suggestionsOpen}
            aria-autocomplete="list"
            placeholder="/play <song or link>, or another /command…"
            className="min-w-0 w-full rounded-xl border border-border/70 bg-background/60 py-2.5 pl-9 pr-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[rgb(var(--accent-1)/0.5)]"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || resolving}
          aria-label="Send"
          title="Send"
          className="gh-interactive flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[rgb(var(--accent-1))] px-4 text-sm font-semibold text-[var(--accent-button-fg)] shadow-sm outline-none transition-opacity disabled:cursor-not-allowed disabled:bg-[rgb(var(--accent-1)/0.35)] disabled:text-[color-mix(in_srgb,var(--accent-button-fg)_70%,transparent)] disabled:shadow-none"
        >
          <Send className="size-4" />
          <span>Send</span>
        </button>
      </form>
      </div>
    </div>
  )
}
