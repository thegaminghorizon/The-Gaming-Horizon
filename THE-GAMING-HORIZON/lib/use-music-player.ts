'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Minimal shape of the bits of the YouTube IFrame Player API this hook uses.
// The real global is untyped (loaded from an external script), so we keep
// this loose on purpose rather than pulling in a full third-party type pack.
interface YTPlayerLike {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  loadVideoById: (videoId: string) => void
  cueVideoById: (videoId: string) => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  setVolume: (v: number) => void
  getVolume: () => number
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  getCurrentTime: () => number
  getDuration: () => number
  destroy: () => void
}

declare global {
  interface Window {
    YT?: {
      Player: new (elementId: string, options: Record<string, unknown>) => YTPlayerLike
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; CUED: number; BUFFERING: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiLoadPromise: Promise<void> | null = null

// Loads the YouTube IFrame API script exactly once per page, no matter how
// many components ask for it — subsequent calls reuse the same promise.
function loadYoutubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.YT?.Player) return Promise.resolve()
  if (apiLoadPromise) return apiLoadPromise

  apiLoadPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      resolve()
    }
    if (document.querySelector('script[data-gh-youtube-api]')) return
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.setAttribute('data-gh-youtube-api', 'true')
    document.head.appendChild(script)
  })
  return apiLoadPromise
}

export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'

interface UseMusicPlayerOptions {
  onTrackEnded?: () => void
  onError?: () => void
}

export function useMusicPlayer(mountId: string, options: UseMusicPlayerOptions = {}) {
  const playerRef = useRef<YTPlayerLike | null>(null)
  const [status, setStatus] = useState<PlayerStatus>('idle')
  const [volume, setVolumeState] = useState(70)
  const [muted, setMuted] = useState(false)
  const [ready, setReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const optionsRef = useRef(options)
  optionsRef.current = options
  // If a track is requested before the (async-loaded) YouTube API has
  // finished initializing, remember it and play it as soon as onReady fires
  // instead of silently dropping the request.
  const pendingVideoIdRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadYoutubeApi().then(() => {
      if (cancelled || !window.YT) return
      const player = new window.YT.Player(mountId, {
        // A genuinely 0x0 player gets auto-paused by some browsers'
        // "not really visible" power-saving heuristics the moment the page
        // repaints (e.g. on client-side route changes) — even though it's
        // just an audio-only background player. Giving it a real, non-zero
        // size (and hiding it off-screen via CSS instead) keeps playback
        // alive across navigation.
        height: '124',
        width: '220',
        playerVars: { playsinline: 1, controls: 0, disablekb: 1 },
        events: {
          onReady: (e: { target: YTPlayerLike }) => {
            e.target.setVolume(volume)
            playerRef.current = e.target
            setReady(true)
            if (pendingVideoIdRef.current) {
              e.target.loadVideoById(pendingVideoIdRef.current)
              pendingVideoIdRef.current = null
            }
          },
          onStateChange: (e: { data: number }) => {
            const YT = window.YT
            if (!YT) return
            if (e.data === YT.PlayerState.PLAYING) setStatus('playing')
            else if (e.data === YT.PlayerState.PAUSED) setStatus('paused')
            else if (e.data === YT.PlayerState.ENDED) {
              setStatus('ended')
              optionsRef.current.onTrackEnded?.()
            }
          },
          onError: () => {
            setStatus('error')
            optionsRef.current.onError?.()
          },
        },
      })
      playerRef.current = player
    })
    return () => {
      cancelled = true
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
    // mountId is a stable static id for this widget instance — intentionally excluded from re-run triggers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const playVideo = useCallback((videoId: string) => {
    setStatus('loading')
    setCurrentTime(0)
    setDuration(0)
    if (!playerRef.current) {
      pendingVideoIdRef.current = videoId
      return
    }
    playerRef.current.loadVideoById(videoId)
  }, [])

  const play = useCallback(() => {
    playerRef.current?.playVideo()
  }, [])

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo()
  }, [])

  const togglePlayPause = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    if (status === 'playing') player.pauseVideo()
    else player.playVideo()
  }, [status])

  const seek = useCallback((seconds: number) => {
    const player = playerRef.current
    if (!player) return
    const clamped = Math.max(0, Math.min(duration || seconds, seconds))
    player.seekTo(clamped, true)
    setCurrentTime(clamped)
  }, [duration])

  // Polls the current playback position while a track is playing so the seek
  // bar can advance. The YouTube IFrame API has no timeupdate event, so this
  // is the standard way of tracking progress.
  useEffect(() => {
    if (status !== 'playing') return
    const interval = window.setInterval(() => {
      const player = playerRef.current
      if (!player) return
      setCurrentTime(player.getCurrentTime() || 0)
      const d = player.getDuration()
      if (d && Number.isFinite(d)) setDuration(d)
    }, 500)
    return () => window.clearInterval(interval)
  }, [status])

  const setVolume = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(next)))
    setVolumeState(clamped)
    const player = playerRef.current
    if (!player) return
    player.setVolume(clamped)
    if (clamped === 0) {
      player.mute()
      setMuted(true)
    } else if (muted) {
      player.unMute()
      setMuted(false)
    }
  }, [muted])

  const toggleMute = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    if (muted) {
      player.unMute()
      setMuted(false)
    } else {
      player.mute()
      setMuted(true)
    }
  }, [muted])

  const stop = useCallback(() => {
    playerRef.current?.stopVideo()
    setStatus('idle')
    setCurrentTime(0)
    setDuration(0)
  }, [])

  return {
    status,
    ready,
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
    stop,
  }
}
