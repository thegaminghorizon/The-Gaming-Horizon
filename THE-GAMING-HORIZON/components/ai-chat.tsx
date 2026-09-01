'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, RotateCcw, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getAiResponse,
  makeId,
  SUGGESTED_STARTERS,
  MOOD_TOPICS,
  type ChatMessage,
  type Topic,
} from '@/lib/ai-chat'

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full bg-[rgb(var(--accent-1))]"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -4, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  )
}

// ── Client-only timestamp (avoids SSR/client hydration mismatch) ───────────────

function Timestamp({ date }: { date: Date }) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    setLabel(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }, [date])
  // Render empty (but reserve height) on the server and first client paint.
  return <span className="text-[10px] text-muted-foreground/50">{label || '\u00A0'}</span>
}

// ── A single message bubble ───────────────────────────────────────────────────

function Bubble({
  msg,
  onChip,
}: {
  msg: ChatMessage
  onChip?: (text: string) => void
}) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex w-full gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {/* Avatar — companion only */}
      {!isUser && (
        <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[rgb(var(--accent-1)/0.3)] to-[rgb(var(--accent-2)/0.2)] ring-1 ring-[rgb(var(--accent-1)/0.25)]">
          <Sparkles className="size-4 text-[rgb(var(--accent-1))]" />
        </div>
      )}

      <div className={cn('flex max-w-[80%] flex-col gap-2', isUser && 'items-end')}>
        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'rounded-tr-sm bg-[rgb(var(--accent-1)/0.18)] text-foreground ring-1 ring-[rgb(var(--accent-1)/0.3)]'
              : 'glass rounded-tl-sm text-foreground',
          )}
        >
          {msg.text}
        </div>

        {/* Quick-reply chips for assistant messages */}
        {!isUser && msg.chips && msg.chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.chips.map((chip) => (
              <button
                key={chip}
                onClick={() => onChip?.(chip)}
                className="rounded-full border border-[rgb(var(--accent-1)/0.3)] bg-[rgb(var(--accent-1)/0.07)] px-3 py-1 text-[11px] font-medium text-foreground/80 transition-all hover:bg-[rgb(var(--accent-1)/0.16)] hover:text-foreground"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <Timestamp date={msg.timestamp} />
      </div>
    </motion.div>
  )
}

// ── Main AiChat component ─────────────────────────────────────────────────────

const WELCOME: ChatMessage = {
  id: 'm-0',
  role: 'assistant',
  text: "Hi! I'm your Gaming Horizon AI Companion. I can tell you about our games, the platform, the beta timeline, upcoming features, or anything else you're curious about. What would you like to know?",
  timestamp: new Date(),
  chips: ['What is Gaming Horizon?', 'When does beta start?', 'Recommend me a game', 'Tell me about the AI'],
}

interface AiChatProps {
  /** Optional extra className for the outer wrapper */
  className?: string
  /** Constrain height so it fits inside a section */
  compact?: boolean
}

export function AiChat({ className, compact = false }: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [showScroll, setShowScroll] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // Tracks the topic of the AI's last reply so short follow-ups ("tell me more") stay on-topic.
  const lastTopicRef = useRef<Topic | undefined>(undefined)
  // Remembers the last play-style/mood mentioned this session, so a later plain "recommend
  // me something" can skip straight to a pick instead of re-asking what mood you're in.
  const moodHintRef = useRef<Topic | undefined>(undefined)
  // Counts consecutive fallback replies, so a run of misses can change tone instead of
  // repeating "try rephrasing" forever.
  const fallbackStreakRef = useRef(0)

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  // Show scroll-to-bottom button when user scrolls up
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const handler = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      setShowScroll(scrollHeight - scrollTop - clientHeight > 60)
    }
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  const scrollToBottom = () => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || typing) return

      // Add user message
      const userMsg: ChatMessage = {
        id: makeId(),
        role: 'user',
        text: trimmed,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setTyping(true)

      // Simulate thinking delay: 800–1400 ms
      const delay = 800 + Math.random() * 600
      clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => {
        const { text: responseText, chips, topic, fallbackStreak } = getAiResponse(trimmed, {
          lastTopic: lastTopicRef.current,
          moodHint: moodHintRef.current,
          fallbackStreak: fallbackStreakRef.current,
        })
        lastTopicRef.current = topic
        fallbackStreakRef.current = fallbackStreak
        if (MOOD_TOPICS.includes(topic)) moodHintRef.current = topic
        const botMsg: ChatMessage = {
          id: makeId(),
          role: 'assistant',
          text: responseText,
          timestamp: new Date(),
          chips,
          topic,
        }
        setMessages((prev) => [...prev, botMsg])
        setTyping(false)
      }, delay)
    },
    [typing],
  )

  useEffect(() => () => clearTimeout(typingTimer.current), [])

  const reset = () => {
    clearTimeout(typingTimer.current)
    setMessages([{ ...WELCOME, timestamp: new Date() }])
    setInput('')
    setTyping(false)
    lastTopicRef.current = undefined
    moodHintRef.current = undefined
    fallbackStreakRef.current = 0
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send(input)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [input])

  return (
    <div
      className={cn(
        'glass flex flex-col overflow-hidden rounded-3xl',
        compact ? 'h-[560px]' : 'h-[640px]',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[rgb(var(--accent-1)/0.3)] to-[rgb(var(--accent-2)/0.2)] ring-1 ring-[rgb(var(--accent-1)/0.3)]">
            <Sparkles className="size-4 text-[rgb(var(--accent-1))]" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">AI Companion</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {typing ? 'Thinking...' : 'Online · Gaming Horizon'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status dot */}
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          <button
            onClick={reset}
            title="Start new conversation"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>

      {/* Message body */}
      <div
        ref={bodyRef}
        className="relative flex-1 space-y-5 overflow-y-auto px-5 py-5"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <Bubble key={msg.id} msg={msg} onChip={send} />
          ))}
          {typing && (
            <motion.div
              key="typing-indicator"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3"
            >
              <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[rgb(var(--accent-1)/0.3)] to-[rgb(var(--accent-2)/0.2)] ring-1 ring-[rgb(var(--accent-1)/0.25)]">
                <Sparkles className="size-4 text-[rgb(var(--accent-1))]" />
              </div>
              <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScroll && (
          <motion.button
            key="scroll-btn"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={scrollToBottom}
            className="absolute bottom-[80px] right-6 z-10 grid size-8 place-items-center rounded-full border border-border bg-background/80 text-muted-foreground shadow-md backdrop-blur-sm hover:text-foreground"
          >
            <ChevronDown className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Suggested starters — only visible when conversation is at welcome */}
      {messages.length === 1 && (
        <div className="border-t border-border px-5 py-3">
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">Suggested questions</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_STARTERS.slice(0, 4).map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-[rgb(var(--accent-1)/0.25)] bg-[rgb(var(--accent-1)/0.06)] px-3 py-1 text-[11px] font-medium text-foreground/80 transition-all hover:bg-[rgb(var(--accent-1)/0.14)] hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-muted/30 px-4 py-2.5 focus-within:border-[rgb(var(--accent-1)/0.5)] focus-within:bg-muted/50 transition-colors">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about Gaming Horizon…"
            disabled={typing}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || typing}
            aria-label="Send message"
            className="mb-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[rgb(var(--accent-1))] to-[rgb(var(--accent-2))] text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_-4px_rgb(var(--accent-1)/0.6)] disabled:opacity-40 disabled:pointer-events-none"
          >
            <Send className="size-4" />
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[10px] text-muted-foreground/50">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
