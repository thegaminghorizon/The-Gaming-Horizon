// Support for rich-text (bold/italic/color/font/etc.) blog post bodies.
//
// The composer stores each post's `content` as UserBlogPost.content: string[]
// (see lib/user-posts.ts) — one entry per rendered block. Older posts have
// plain-text entries (optionally an image markdown line, see
// parseImageParagraph); posts written with the rich-text editor have entries
// that are sanitized HTML fragments (e.g. "<p>Hello <strong>world</strong></p>").
// isHtmlBlock() tells a renderer which case it's looking at.
//
// Everything here touches the DOM (DOMParser / document), so it only runs in
// the browser — every export no-ops safely during server rendering.

const ALLOWED_TAGS = new Set([
  'P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'SPAN',
  'H1', 'H2', 'H3', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A', 'DIV', 'IMG',
])

const ALLOWED_STYLE_PROPS = new Set([
  'color', 'background-color', 'font-size', 'font-family',
  'font-weight', 'font-style', 'text-decoration', 'text-align',
])

const BLOCK_TAGS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'UL', 'OL', 'BLOCKQUOTE', 'IMG'])

// Legacy font size keywords for the 1–7 scale `execCommand('fontSize', …)`
// and <font size="…"> use, in case a browser emits the old-style tag.
const LEGACY_FONT_SIZES: Record<string, string> = {
  '1': 'x-small', '2': 'small', '3': 'medium', '4': 'large',
  '5': 'x-large', '6': 'xx-large', '7': 'xxx-large',
}

/** A post-content entry is an HTML block (new-style) rather than plain text (old-style). */
export function isHtmlBlock(paragraph: string): boolean {
  return /^\s*</.test(paragraph)
}

/**
 * Some browsers apply text color/font formatting via legacy
 * <font color="…" face="…" size="…"> elements rather than an inline style,
 * depending on execCommand's styleWithCSS mode. Rather than dropping that
 * formatting, fold it into an inline style on a <span> so it survives
 * sanitization and still renders.
 */
function normalizeFontElement(fontEl: HTMLElement) {
  const styleParts: string[] = []
  const existingStyle = fontEl.getAttribute('style')
  if (existingStyle) styleParts.push(existingStyle.replace(/;\s*$/, ''))
  const color = fontEl.getAttribute('color')
  if (color) styleParts.push(`color: ${color}`)
  const face = fontEl.getAttribute('face')
  if (face) styleParts.push(`font-family: ${face}`)
  const size = fontEl.getAttribute('size')
  if (size && LEGACY_FONT_SIZES[size]) styleParts.push(`font-size: ${LEGACY_FONT_SIZES[size]}`)

  const span = fontEl.ownerDocument.createElement('span')
  if (styleParts.length) span.setAttribute('style', styleParts.join('; '))
  while (fontEl.firstChild) span.appendChild(fontEl.firstChild)
  fontEl.replaceWith(span)
  return span
}

function sanitizeElement(el: Element) {
  Array.from(el.childNodes).forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      let childEl = child as HTMLElement
      if (childEl.tagName === 'FONT') {
        childEl = normalizeFontElement(childEl)
      }
      if (!ALLOWED_TAGS.has(childEl.tagName)) {
        // Unwrap disallowed elements (e.g. <script>, <style>) but keep their text content.
        while (childEl.firstChild) childEl.parentNode?.insertBefore(childEl.firstChild, childEl)
        childEl.parentNode?.removeChild(childEl)
        return
      }
      Array.from(childEl.attributes).forEach((attr) => {
        if (childEl.tagName === 'A' && attr.name === 'href') {
          if (!/^https?:\/\//i.test(attr.value)) childEl.removeAttribute('href')
          else {
            childEl.setAttribute('target', '_blank')
            childEl.setAttribute('rel', 'noopener noreferrer')
          }
          return
        }
        if (childEl.tagName === 'IMG' && (attr.name === 'src' || attr.name === 'alt')) return
        if (attr.name === 'style') {
          const kept = Array.from(childEl.style)
            .filter((prop) => ALLOWED_STYLE_PROPS.has(prop))
            .map((prop) => `${prop}: ${childEl.style.getPropertyValue(prop)}`)
            .join('; ')
          if (kept) childEl.setAttribute('style', kept)
          else childEl.removeAttribute('style')
          return
        }
        if (attr.name === 'target' || attr.name === 'rel') return
        childEl.removeAttribute(attr.name)
      })
      sanitizeElement(childEl)
    } else if (child.nodeType !== Node.TEXT_NODE) {
      child.parentNode?.removeChild(child)
    }
  })
}

/** Strips any tag/attribute not on the formatting allowlist. Safe to call on untrusted HTML. */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  sanitizeElement(doc.body)
  return doc.body.innerHTML
}

/** Splits a contentEditable's innerHTML into one string per top-level block, dropping empty ones. */
export function splitHtmlIntoBlocks(html: string): string[] {
  if (typeof window === 'undefined') return []
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const blocks: string[] = []
  let buffer: ChildNode[] = []

  const flush = () => {
    if (!buffer.length) return
    const wrapper = document.createElement('p')
    buffer.forEach((n) => wrapper.appendChild(n.cloneNode(true)))
    if (wrapper.innerHTML.trim() && wrapper.textContent?.trim()) blocks.push(wrapper.outerHTML)
    buffer = []
  }

  Array.from(doc.body.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has((node as Element).tagName)) {
      flush()
      const el = node as HTMLElement
      const hasText = Boolean(el.textContent?.trim())
      const hasImg = el.tagName === 'IMG' || Boolean(el.querySelector('img'))
      if (hasText || hasImg) blocks.push(el.outerHTML)
    } else if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
      // whitespace between blocks — ignore
    } else {
      buffer.push(node)
    }
  })
  flush()

  return blocks
}

/** Plain-text rendering of an HTML block, for excerpts and word counts. */
export function htmlToText(html: string): string {
  if (typeof window === 'undefined') return html.replace(/<[^>]+>/g, ' ')
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent ?? ''
}

/** Word count across mixed plain-text / HTML-block content, for reading-time estimates. */
export function countWords(content: string[]): number {
  return content
    .map((block) => (isHtmlBlock(block) ? htmlToText(block) : block))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
}
