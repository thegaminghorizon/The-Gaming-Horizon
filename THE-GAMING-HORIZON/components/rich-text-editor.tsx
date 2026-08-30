'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from 'lucide-react'

export interface RichTextEditorHandle {
  /** Inserts raw HTML at the current (or last known) cursor position. */
  insertHtml: (html: string) => void
  getHtml: () => string
  focus: () => void
}

const FONT_FAMILIES: { label: string; value: string }[] = [
  { label: 'Default font', value: '' },
  { label: 'Sans-serif', value: 'ui-sans-serif, system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Monospace', value: '"JetBrains Mono", ui-monospace, monospace' },
  { label: 'Comic', value: '"Comic Sans MS", "Comic Sans", cursive' },
]

// document.execCommand('fontSize', …) only accepts legacy sizes 1–7.
const FONT_SIZES: { label: string; value: string }[] = [
  { label: 'Small', value: '2' },
  { label: 'Normal', value: '3' },
  { label: 'Medium', value: '4' },
  { label: 'Large', value: '5' },
  { label: 'X-Large', value: '6' },
  { label: 'Huge', value: '7' },
]

const TEXT_COLORS = [
  '#111111', '#6b7280', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
]

export const RichTextEditor = forwardRef<
  RichTextEditorHandle,
  {
    initialHtml?: string
    placeholder?: string
    onChange?: (html: string) => void
    className?: string
  }
>(function RichTextEditor({ initialHtml = '', placeholder, onChange, className }, ref) {
  const editorRef = useRef<HTMLDivElement>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const [isEmpty, setIsEmpty] = useState(!initialHtml)

  // Set once on mount — this editor is used uncontrolled after that so the
  // caret doesn't jump around while typing.
  useEffect(() => {
    if (editorRef.current && initialHtml) {
      editorRef.current.innerHTML = initialHtml
      setIsEmpty(false)
    }
    // Without this, execCommand('foreColor'/'hiliteColor'/'fontName'/'fontSize', …)
    // wraps the selection in legacy <font color="…" face="…" size="…"> elements in
    // Chrome/Edge instead of a <span style="…">. The publish-time sanitizer only
    // allows inline *styles* (not legacy tag attributes), so any color/font change
    // made without this would get silently stripped when the post is saved.
    // Forcing CSS-based styling here keeps what you see in the editor and what
    // gets published in sync.
    document.execCommand('styleWithCSS', false, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useImperativeHandle(ref, () => ({
    insertHtml(html: string) {
      focusEditor()
      restoreSelection()
      document.execCommand('insertHTML', false, html)
      handleInput()
    },
    getHtml() {
      return editorRef.current?.innerHTML ?? ''
    },
    focus() {
      focusEditor()
    },
  }))

  function focusEditor() {
    editorRef.current?.focus()
  }

  function saveSelection() {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange()
    }
  }

  function restoreSelection() {
    const sel = window.getSelection()
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges()
      sel.addRange(savedRangeRef.current)
    }
  }

  function exec(command: string, value?: string) {
    focusEditor()
    restoreSelection()
    // Re-assert on every call — cheap, and guards against the flag not
    // sticking across focus changes in some browsers.
    document.execCommand('styleWithCSS', false, true)
    document.execCommand(command, false, value)
    handleInput()
  }

  function handleInput() {
    const el = editorRef.current
    setIsEmpty(!el?.textContent?.trim() && !el?.querySelector('img'))
    onChange?.(el?.innerHTML ?? '')
  }

  return (
    <div className={className}>
      <div
        role="toolbar"
        aria-label="Text formatting"
        // Keep focus/selection in the editor when a toolbar control is clicked.
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'SELECT') {
            e.preventDefault()
          }
        }}
        className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-border bg-muted/40 p-2"
      >
        <ToolbarButton label="Bold" onClick={() => exec('bold')}>
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => exec('italic')}>
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Underline" onClick={() => exec('underline')}>
          <Underline className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" onClick={() => exec('strikeThrough')}>
          <Strikethrough className="size-4" />
        </ToolbarButton>

        <Divider />

        <select
          aria-label="Font family"
          defaultValue=""
          onChange={(e) => {
            exec('fontName', e.target.value || 'inherit')
            e.currentTarget.blur()
          }}
          className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Font size"
          defaultValue="3"
          onChange={(e) => {
            exec('fontSize', e.target.value)
            e.currentTarget.blur()
          }}
          className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
        >
          {FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <Divider />

        <label
          title="Text color"
          className="flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-1.5 text-xs font-semibold"
        >
          A
          <input
            type="color"
            aria-label="Text color"
            list="rte-text-colors"
            defaultValue="#111111"
            onMouseDown={(e) => e.stopPropagation()}
            onInput={(e) => exec('foreColor', (e.target as HTMLInputElement).value)}
            className="size-5 cursor-pointer border-0 bg-transparent p-0"
          />
          <datalist id="rte-text-colors">
            {TEXT_COLORS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <label
          title="Highlight color"
          className="flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-1.5 text-xs font-semibold"
        >
          <span className="rounded bg-yellow-200 px-1 text-black">H</span>
          <input
            type="color"
            aria-label="Highlight color"
            defaultValue="#fef08a"
            onMouseDown={(e) => e.stopPropagation()}
            onInput={(e) => exec('hiliteColor', (e.target as HTMLInputElement).value)}
            className="size-5 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>

        <Divider />

        <select
          aria-label="Paragraph style"
          defaultValue="p"
          onChange={(e) => {
            exec('formatBlock', e.target.value)
            e.currentTarget.blur()
          }}
          className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading</option>
          <option value="h3">Subheading</option>
          <option value="blockquote">Quote</option>
        </select>

        <ToolbarButton label="Bullet list" onClick={() => exec('insertUnorderedList')}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" onClick={() => exec('insertOrderedList')}>
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Quote" onClick={() => exec('formatBlock', 'blockquote')}>
          <Quote className="size-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="Align left" onClick={() => exec('justifyLeft')}>
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Align center" onClick={() => exec('justifyCenter')}>
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Align right" onClick={() => exec('justifyRight')}>
          <AlignRight className="size-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label="Insert link"
          onClick={() => {
            saveSelection()
            const url = window.prompt('Link URL (https://…)')
            if (url) exec('createLink', url)
          }}
        >
          <Link2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Undo" onClick={() => exec('undo')}>
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => exec('redo')}>
          <Redo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Clear formatting" onClick={() => exec('removeFormat')}>
          <Eraser className="size-4" />
        </ToolbarButton>
      </div>

      <div className="relative">
        {isEmpty && placeholder && (
          <p className="pointer-events-none absolute left-4 top-3 text-sm text-muted-foreground">{placeholder}</p>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          onBlur={saveSelection}
          className="min-h-[16rem] resize-y overflow-auto rounded-b-xl border border-border bg-background/65 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-[rgb(var(--accent-1)/0.7)] focus:ring-2 focus:ring-[rgb(var(--accent-1)/0.15)] [&_a]:text-[rgb(var(--accent-1))] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[rgb(var(--accent-1)/0.4)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
        />
      </div>
    </div>
  )
})

function ToolbarButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-background hover:text-foreground"
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden />
}
