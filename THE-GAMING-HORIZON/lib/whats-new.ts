// Shared "What's New" feature catalogue.
//
// This single list backs two surfaces:
//   1. The one-time WhatsNewModal shown on first visit (components/whats-new-modal.tsx)
//   2. A standing entry filed into every user's Notification Centre so the
//      full catalogue stays reachable there too, not just behind the footer
//      link the first time it's dismissed.
//
// Bump the version string here (and keep it in sync with WHATS_NEW_VERSION
// in lib/notifications.ts) whenever this list changes enough that it's
// worth re-surfacing to people who already saw an older version.
export const WHATS_NEW_VERSION = 'v4'

export interface WhatsNewFeature {
  title: string
  body: string
}

export const WHATS_NEW_FEATURES: WhatsNewFeature[] = [
  {
    title: 'Personalized Experience Onboarding',
    body: "Build your Gaming Horizon profile in a few quick steps — genres, play style, device, and how much you want AI recommendations involved — and see a live preview update as you go. It's completely optional, separate from the Customization Studio's visual settings, and saves locally so you can pick it up later, edit it anytime, or reset and start over.",
  },
  {
    title: 'Music Room',
    body: "Queue songs with /play <song or link>, drop in a link from YouTube, Spotify, Apple Music, SoundCloud, and most other platforms directly, and control playback with /skip, /pause, /loop and more. Save tracks into named playlists — including copying every song out of a playing Spotify playlist one at a time, not just whatever's currently on. Everything keeps playing in the background as you browse the rest of the site, so your queue never has to stop just because you navigated away.",
  },
  {
    title: 'Customization Studio',
    body: 'Reshape how the whole site looks and feels: theme, accent color, background atmosphere, cursor style, motion intensity and performance mode — previewed live as you change them, no reload needed. Dial things up for a richer, more animated look, or dial them back for a faster, calmer experience on lower-powered devices. Your choices are saved to your profile and follow you across sessions.',
  },
  {
    title: 'AI Companion',
    body: 'Tell it your mood, the time you have, and your device, and it reasons about what you actually want to play right now — with a clear explanation for every recommendation instead of a black-box guess. It factors in session length, difficulty preference, and play style from your experience profile, so the suggestions get more relevant the more you use it.',
  },
  {
    title: 'Design Suggestions',
    body: "Pitch a feature or design idea, browse what the community has already proposed, and upvote the ones you'd want to see built next. Every submission goes into a public gallery, so you can track which ideas are gaining traction and see how the community's priorities shape the roadmap over time.",
  },
  {
    title: 'Command Palette',
    body: 'Jump anywhere on the site without touching the mouse — press the shortcut to search pages, settings and actions instantly. It understands partial matches and recently visited pages, so you rarely have to type more than a couple of characters to land where you meant to go.',
  },
  {
    title: 'Brand Kit & Logo Download',
    body: 'Grab the Gaming Horizon logo in any color palette you like: pick a preset or build a custom gradient, preview it live, then export as SVG or PNG. Handy if you want to reference the brand in a video, thumbnail, or write-up of your own.',
  },
  {
    title: 'Multi-language interface',
    body: 'Pick a language from the footer selector and the whole site — navigation, footer, and pricing — switches to it immediately. Your choice is remembered for next time, so you only need to set it once per device.',
  },
  {
    title: 'Currency display',
    body: 'Choose a currency from the footer selector to see every planned membership price converted and formatted for that currency across the Pricing section and the Plans page. Billing currency is still confirmed at checkout once payments launch, so treat these figures as a helpful estimate rather than a locked-in rate.',
  },
  {
    title: 'Developer Portal',
    body: "Register your own app, get a sandbox API key instantly, and start building against the Gaming Horizon API. The portal covers API reference docs, webhook configuration, and a changelog so you can track platform changes that might affect your integration.",
  },
  {
    title: 'Community Blog',
    body: "Publish your own posts — reviews, guides, opinion pieces, whatever you want to share with the community — complete with a cover image, categories, and the option to schedule a post to go live later instead of publishing immediately.",
  },
  {
    title: 'Support Center',
    body: "Open a ticket with a category and priority level, and the team follows up by email using the reference number you're given. You can also search existing FAQ answers first, in case your question's already been answered.",
  },
]

/**
 * Renders the catalogue as a single plain-text block, one feature per
 * paragraph, suitable for a notification body (which renders with
 * `whitespace-pre-line`).
 */
export function formatWhatsNewForNotification(): string {
  return WHATS_NEW_FEATURES.map((feature) => `${feature.title} — ${feature.body}`).join('\n\n')
}

// The catalogue can be exported in a few different visual styles — people
// downloading a copy don't all want the same thing: some want it to match
// the site, some just want the plainest possible printout. Pick one and
// pass its id into downloadWhatsNewPdf.
export type PdfTemplateId = 'brand' | 'minimal' | 'classic' | 'compact'

export interface PdfTemplateOption {
  id: PdfTemplateId
  name: string
  description: string
}

export const PDF_TEMPLATES: PdfTemplateOption[] = [
  {
    id: 'brand',
    name: 'Brand',
    description: 'Dark cover header, gradient accent bar, and color throughout — matches the site.',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Plain white page, no color, generous whitespace. Easiest to read or print.',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Formal serif typography with a centered title — reads like a printed report.',
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Smaller type and tighter spacing so the whole catalogue fits on fewer pages.',
  },
]

interface PdfTemplateStyle {
  margin: number
  headerHeight: number
  footerHeight: number
  font: 'helvetica' | 'times'
  titleSize: number
  bodySize: number
  titleLineHeight: number
  bodyLineHeight: number
  paraGap: number
  darkHeader: boolean
  accentBar: boolean
  colorMarkers: boolean
  centeredTitle: boolean
  numbered: boolean
  showLogo: boolean
}

const TEMPLATE_STYLES: Record<PdfTemplateId, PdfTemplateStyle> = {
  brand: {
    margin: 56,
    headerHeight: 118,
    footerHeight: 34,
    font: 'helvetica',
    titleSize: 13,
    bodySize: 10.5,
    titleLineHeight: 16,
    bodyLineHeight: 14,
    paraGap: 22,
    darkHeader: true,
    accentBar: true,
    colorMarkers: true,
    centeredTitle: false,
    numbered: false,
    showLogo: true,
  },
  minimal: {
    margin: 64,
    headerHeight: 66,
    footerHeight: 30,
    font: 'helvetica',
    titleSize: 12.5,
    bodySize: 10.5,
    titleLineHeight: 16,
    bodyLineHeight: 14.5,
    paraGap: 26,
    darkHeader: false,
    accentBar: false,
    colorMarkers: false,
    centeredTitle: false,
    numbered: false,
    showLogo: false,
  },
  classic: {
    margin: 64,
    headerHeight: 96,
    footerHeight: 34,
    font: 'times',
    titleSize: 13,
    bodySize: 11,
    titleLineHeight: 16,
    bodyLineHeight: 15,
    paraGap: 24,
    darkHeader: false,
    accentBar: false,
    colorMarkers: false,
    centeredTitle: true,
    numbered: true,
    showLogo: false,
  },
  compact: {
    margin: 40,
    headerHeight: 54,
    footerHeight: 24,
    font: 'helvetica',
    titleSize: 10.5,
    bodySize: 8.5,
    titleLineHeight: 12,
    bodyLineHeight: 11,
    paraGap: 12,
    darkHeader: false,
    accentBar: false,
    colorMarkers: false,
    centeredTitle: false,
    numbered: false,
    showLogo: false,
  },
}

// Brand gradient stops (see components/ui/logo.tsx) as RGB triples, for
// drawing the header band / accent bars without needing live CSS vars —
// a downloaded PDF has no theme, so it always uses these fixed brand colors
// rather than whatever accent the visitor currently has selected on-site.
const BRAND_STOPS: [number, number, number][] = [
  [0x3d, 0x07, 0xb5], // deep violet
  [0x01, 0xa8, 0xfa], // sky blue
  [0x01, 0xe3, 0xcf], // teal
]
const BRAND_INK: [number, number, number] = [0x0b, 0x07, 0x10] // icon backing color

function lerpStop(t: number): [number, number, number] {
  const segments = BRAND_STOPS.length - 1
  const scaled = Math.min(Math.max(t, 0), 1) * segments
  const i = Math.min(Math.floor(scaled), segments - 1)
  const localT = scaled - i
  const [r1, g1, b1] = BRAND_STOPS[i]
  const [r2, g2, b2] = BRAND_STOPS[i + 1]
  return [r1 + (r2 - r1) * localT, g1 + (g2 - g1) * localT, b1 + (b2 - b1) * localT]
}

/** Loads /apple-icon.png as a data URL so it can be embedded in the PDF. */
async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch('/apple-icon.png')
    const blob = await response.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/**
 * Renders the same catalogue as a downloadable PDF, for people who'd rather
 * save/print the release notes than read them in the popup. Built entirely
 * client-side with jsPDF (dynamically imported so it never lands in the
 * main bundle for people who never click the button) — no server round
 * trip needed since this is static copy.
 *
 * `template` picks one of PDF_TEMPLATES (defaults to the branded look this
 * used to always render). The layout math — pagination, wrapping, footer
 * placement — is shared; only the styling (fonts, color, header treatment,
 * spacing) changes per template.
 */
export async function downloadWhatsNewPdf(template: PdfTemplateId = 'brand') {
  const style = TEMPLATE_STYLES[template]
  const [{ jsPDF }, logoDataUrl] = await Promise.all([
    import('jspdf'),
    style.showLogo ? loadLogoDataUrl() : Promise.resolve(null),
  ])
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = style.margin
  const contentWidth = pageWidth - margin * 2
  const headerHeight = style.headerHeight
  const accentBarHeight = 5
  const footerHeight = style.footerHeight

  let y = 0
  let page = 1

  // Thin gradient rule used both under the header and above the footer —
  // drawn as a run of slim rectangles since jsPDF has no native linear
  // gradient fill. Only the 'brand' template uses this.
  function drawAccentBar(barY: number) {
    const steps = 60
    const stepWidth = pageWidth / steps
    for (let i = 0; i < steps; i++) {
      const [r, g, b] = lerpStop(i / (steps - 1))
      doc.setFillColor(r, g, b)
      doc.rect(i * stepWidth, barY, stepWidth + 0.5, accentBarHeight, 'F')
    }
  }

  function drawFooter() {
    doc.setDrawColor(225, 225, 230)
    doc.setLineWidth(0.75)
    doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight)
    doc.setFont(style.font, 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(140, 140, 150)
    if (style.centeredTitle) {
      doc.text(`— ${page} —`, pageWidth / 2, pageHeight - footerHeight + 16, { align: 'center' })
    } else {
      doc.text('Gaming Horizon', margin, pageHeight - footerHeight + 16)
      doc.text(String(page), pageWidth - margin, pageHeight - footerHeight + 16, { align: 'right' })
    }
  }

  function drawHeader(isFirstPage: boolean) {
    if (style.darkHeader) {
      doc.setFillColor(...BRAND_INK)
      doc.rect(0, 0, pageWidth, headerHeight, 'F')
      if (style.accentBar) drawAccentBar(headerHeight)

      if (logoDataUrl) {
        const markSize = 34
        doc.addImage(logoDataUrl, 'PNG', margin, 34, markSize, markSize, undefined, 'FAST')
      }

      doc.setFont(style.font, 'bold')
      doc.setFontSize(16)
      doc.setTextColor(255, 255, 255)
      doc.text('Gaming Horizon', logoDataUrl ? margin + 44 : margin, 55)

      doc.setFont(style.font, 'normal')
      doc.setFontSize(10)
      doc.setTextColor(180, 180, 195)
      doc.text(isFirstPage ? "What's New" : "What's New (continued)", logoDataUrl ? margin + 44 : margin, 70)

      if (isFirstPage) {
        doc.setFont(style.font, 'normal')
        doc.setFontSize(9.5)
        doc.setTextColor(150, 150, 165)
        doc.text(
          new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
          pageWidth - margin,
          55,
          { align: 'right' },
        )
      }

      y = headerHeight + accentBarHeight + 34
      return
    }

    if (style.centeredTitle) {
      // Classic: centered serif title with a rule above and below.
      doc.setDrawColor(60, 60, 64)
      doc.setLineWidth(0.75)
      doc.line(margin, 40, pageWidth - margin, 40)

      doc.setFont(style.font, 'bold')
      doc.setFontSize(18)
      doc.setTextColor(20, 20, 24)
      doc.text('Gaming Horizon', pageWidth / 2, 66, { align: 'center' })

      doc.setFont(style.font, 'normal')
      doc.setFontSize(10.5)
      doc.setTextColor(90, 90, 96)
      doc.text(
        isFirstPage
          ? `What's New — ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`
          : "What's New (continued)",
        pageWidth / 2,
        82,
        { align: 'center' },
      )

      doc.line(margin, headerHeight - 8, pageWidth - margin, headerHeight - 8)
      y = headerHeight + 24
      return
    }

    // Minimal / compact: plain small heading, no rule box, just enough to
    // orient the reader before the list starts.
    doc.setFont(style.font, 'bold')
    doc.setFontSize(style.headerHeight > 60 ? 15 : 12)
    doc.setTextColor(20, 20, 24)
    doc.text('Gaming Horizon', margin, 40)

    doc.setFont(style.font, 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 128)
    doc.text(isFirstPage ? "What's New" : "What's New (continued)", margin, 54)

    if (isFirstPage) {
      doc.text(
        new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
        pageWidth - margin,
        40,
        { align: 'right' },
      )
    }

    doc.setDrawColor(220, 220, 226)
    doc.setLineWidth(0.75)
    doc.line(margin, headerHeight - 10, pageWidth - margin, headerHeight - 10)
    y = headerHeight + (style.headerHeight > 60 ? 20 : 14)
  }

  function newPage() {
    doc.addPage()
    page += 1
    drawHeader(false)
  }

  function ensureSpace(nextBlockHeight: number) {
    if (y + nextBlockHeight > pageHeight - footerHeight - 16) {
      drawFooter()
      newPage()
    }
  }

  drawHeader(true)

  WHATS_NEW_FEATURES.forEach((feature, index) => {
    const titleText = style.numbered ? `${String(index + 1).padStart(2, '0')}.  ${feature.title}` : feature.title
    const titleIndent = style.colorMarkers ? 16 : 0

    doc.setFont(style.font, 'bold')
    doc.setFontSize(style.titleSize)
    doc.setTextColor(20, 20, 24)
    const titleLines: string[] = doc.splitTextToSize(titleText, contentWidth - titleIndent)
    ensureSpace(titleLines.length * style.titleLineHeight + 8)

    if (style.colorMarkers) {
      // Small brand-gradient marker to the left of each title, cycling
      // through the three stop colors so the accent color is felt
      // throughout the document, not just in the header.
      const [r, g, b] = lerpStop(WHATS_NEW_FEATURES.length <= 1 ? 0 : index / (WHATS_NEW_FEATURES.length - 1))
      doc.setFillColor(r, g, b)
      doc.roundedRect(margin, y - 9, 8, 8, 2, 2, 'F')
    }
    doc.text(titleLines, margin + titleIndent, y)
    y += titleLines.length * style.titleLineHeight + 4

    doc.setFont(style.font, 'normal')
    doc.setFontSize(style.bodySize)
    doc.setTextColor(70, 70, 78)
    const bodyLines: string[] = doc.splitTextToSize(feature.body, contentWidth - titleIndent)
    ensureSpace(bodyLines.length * style.bodyLineHeight + style.paraGap)
    doc.text(bodyLines, margin + titleIndent, y)
    y += bodyLines.length * style.bodyLineHeight + style.paraGap

    if (index < WHATS_NEW_FEATURES.length - 1) {
      ensureSpace(1)
      doc.setDrawColor(235, 235, 240)
      doc.setLineWidth(0.75)
      doc.line(margin, y - style.paraGap / 2, pageWidth - margin, y - style.paraGap / 2)
    }
  })

  drawFooter()
  doc.save(`gaming-horizon-whats-new-${template}.pdf`)
}
