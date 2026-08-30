'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Music4, Pause, Play, SkipForward, Maximize2, MessageSquare, Send } from 'lucide-react'
import { useMusicRoom } from '@/components/providers/music-provider'
import { cn } from '@/lib/utils'
import { slashCommandName, SLASH_COMMAND_HELP } from '@/lib/music'

// Corner position -> container placement classes + which edge the
// entrance/exit animation should slide in from (down from the top for the
// two "top-*" spots, up from the bottom for the two "bottom-*" spots).
const POSITION_CLASSES: Record<string, string> = {
  'bottom-right': 'bottom-[calc(1rem+env(safe-area-inset-bottom))] right-3 sm:right-5',
  'bottom-left': 'bottom-[calc(1rem+env(safe-area-inset-bottom))] left-3 sm:left-5',
  'top-right': 'top-[calc(1rem+env(safe-area-inset-top))] right-3 sm:right-5',
  'top-left': 'top-[calc(1rem+env(safe-area-inset-top))] left-3 sm:left-5',
}

export function MiniPlayer() {
  const pathname = usePathname()
  const {
    nowPlaying, isPlaying, status, togglePlayPause, skip, queue,
    input, setInput, submitInput, resolving,
    miniPlayerPosition, miniPlayerSize,
  } = useMusicRoom()
  const isCompact = miniPlayerSize === 'compact'
  const slideFromTop = miniPlayerPosition.startsWith('top-')
  const yOffset = slideFromTop ? -24 : 24
  const [commandBarOpen, setCommandBarOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Same lightweight "/" autocomplete as the full Music room — type the
  // start of a command and pick it instead of typing the whole thing.
  const slashQuery = /^\/[a-z]*$/i.test(input) ? input.slice(1).toLowerCase() : null
  const suggestions =
    slashQuery === null ? [] : SLASH_COMMAND_HELP.filter((cmd) => slashCommandName(cmd).slice(1).toLowerCase().startsWith(slashQuery))
  const isExactMatch = slashQuery !== null && suggestions.length === 1 && slashCommandName(suggestions[0]).slice(1).toLowerCase() === slashQuery
  const suggestionsOpen = suggestions.length > 0 && !isExactMatch

  useEffect(() => {
    setActiveSuggestion(0)
  }, [slashQuery])

  function applySuggestion(cmd: (typeof SLASH_COMMAND_HELP)[number]) {
    const name = slashCommandName(cmd)
    const takesArg = cmd.command.includes('<')
    setInput(takesArg ? `${name} ` : name)
    inputRef.current?.focus()
  }

  // Only float above the app once something is actually loaded, and only
  // once the user has navigated away from the Music tab itself — the full
  // Now Playing bar there already covers this.
  const onMusicPage = pathname === '/music'
  const visible = Boolean(nowPlaying) && !onMusicPage

  return (
    <AnimatePresence>
      {visible && nowPlaying && (
        <motion.div
          initial={{ opacity: 0, y: yOffset, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: yOffset, scale: 0.94 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'gh-mini-player glass fixed z-[150] rounded-2xl shadow-lg',
            POSITION_CLASSES[miniPlayerPosition],
            isCompact ? 'w-[min(88vw,268px)] p-2' : 'w-[min(92vw,340px)] p-3',
          )}
          role="region"
          aria-label="Music mini player"
        >
        <div className="flex items-center gap-3">
          <Link
            href="/music"
            aria-label="Expand — return to Music page"
            title="Expand — return to Music page"
            className={cn(
              'gh-interactive relative shrink-0 overflow-hidden rounded-xl bg-[rgb(var(--accent-1)/0.12)] outline-none',
              isCompact ? 'size-9' : 'size-11',
            )}
          >
            {nowPlaying.thumbnail ? (
              <img src={nowPlaying.thumbnail} alt="" className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center text-[rgb(var(--accent-1))]">
                <Music4 className="size-5" />
              </div>
            )}
          </Link>

          <Link href="/music" className="min-w-0 flex-1 outline-none">
            <p className="truncate text-sm font-semibold text-foreground">{nowPlaying.title}</p>
            {!isCompact && (
              <p className="truncate text-xs text-muted-foreground">
                {isPlaying ? 'Playing' : status === 'loading' ? 'Loading…' : 'Paused'}
              </p>
            )}
          </Link>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause' : 'Play'}
              className={cn(
                'gh-interactive grid place-items-center rounded-xl bg-[rgb(var(--accent-1))] text-[var(--accent-button-fg)] outline-none disabled:opacity-40',
                isCompact ? 'size-8' : 'size-9',
              )}
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
            </button>
            <button
              type="button"
              onClick={skip}
              disabled={queue.length < 2}
              aria-label="Skip to next track"
              title="Skip to next track"
              className={cn(
                'gh-interactive grid place-items-center rounded-xl border border-border/70 text-foreground outline-none disabled:opacity-30',
                isCompact ? 'size-8' : 'size-9',
              )}
            >
              <SkipForward className="size-4" />
            </button>
            {/* Slash commands ("/pause", "/play", "/skip", "/previous"...)
                work from the Music tab's own chat box — this mirrors that
                same submitInput() pipeline here, so the commands work
                identically while just relying on the floating Mini-Player
                elsewhere on the site, without needing to navigate back to
                /music. Every command starts with "/". Hidden in compact
                mode to keep the footprint small — expand to /music (or
                switch back to Standard size) to use it. */}
            {!isCompact && (
              <button
                type="button"
                onClick={() => setCommandBarOpen((open) => !open)}
                aria-label={commandBarOpen ? 'Hide chat command bar' : 'Type a /command (/play, /pause, /skip…)'}
                title={commandBarOpen ? 'Hide chat command bar' : 'Type a /command (/play, /pause, /skip…)'}
                aria-pressed={commandBarOpen}
                className="gh-interactive grid size-9 place-items-center rounded-xl border text-foreground outline-none border-border/70 aria-pressed:border-[rgb(var(--accent-1)/0.55)] aria-pressed:bg-[rgb(var(--accent-1)/0.12)] aria-pressed:text-[rgb(var(--accent-1))]"
              >
                <MessageSquare className="size-4" />
              </button>
            )}
            <Link
              href="/music"
              aria-label="Expand — return to Music page"
              title="Expand — return to Music page"
              className={cn(
                'gh-interactive grid place-items-center rounded-xl border border-border/70 text-foreground outline-none',
                isCompact ? 'size-8' : 'size-9',
              )}
            >
              <Maximize2 className="size-4" />
            </Link>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {commandBarOpen && !isCompact && (
            <motion.form
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={(e) => {
                e.preventDefault()
                submitInput()
              }}
              className="relative flex items-center gap-2 overflow-visible"
            >
              <AnimatePresence>
                {suggestionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="glass absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-border/70 shadow-lg"
                    role="listbox"
                  >
                    <div className="max-h-48 overflow-y-auto p-1.5">
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
                            'flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left',
                            i === activeSuggestion ? 'bg-[rgb(var(--accent-1)/0.12)]' : 'hover:bg-muted/50',
                          )}
                        >
                          <code className="shrink-0 rounded-md bg-[rgb(var(--accent-1)/0.12)] px-1.5 py-0.5 text-[10px] font-semibold text-[rgb(var(--accent-1))]">
                            {cmd.command}
                          </code>
                          <span className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{cmd.description}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                  }
                }}
                role="combobox"
                aria-expanded={suggestionsOpen}
                aria-autocomplete="list"
                placeholder="/pause, /play, /skip…"
                aria-label="Music chat command"
                autoFocus
                className="min-w-0 flex-1 rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-[rgb(var(--accent-1)/0.5)]"
              />
              <button
                type="submit"
                disabled={!input.trim() || resolving}
                aria-label="Send command"
                title="Send command"
                className="gh-interactive grid size-8 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-1))] text-[var(--accent-button-fg)] outline-none disabled:cursor-not-allowed disabled:bg-[rgb(var(--accent-1)/0.35)]"
              >
                <Send className="size-3.5" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
