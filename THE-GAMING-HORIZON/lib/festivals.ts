// Indian festival calendar for the notification-centre "festival wisher".
//
// Fixed-date national/international occasions repeat every year. Lunar/
// panchang-based festivals (Holi, Raksha Bandhan, Janmashtami, Ganesh
// Chaturthi, Dussehra, Diwali) shift each year, so they're listed explicitly
// per year below. When a new year isn't listed yet, those festivals are
// simply skipped for it — nothing breaks, they just won't fire until this
// table is extended. Dates are in IST (Asia/Kolkata), matching the rest of
// the app's date handling (see lib/milestones.ts / lib/use-today.ts).

import { INDIA_TIME_ZONE } from '@/lib/milestones'

export interface Festival {
  id: string
  /** Shown as the notification title, e.g. "Happy Diwali! 🪔" */
  title: string
  /** Shown as the notification body. */
  message: string
  /** Month, 1-12. */
  month: number
  /** Day of month. */
  day: number
  /**
   * Optional path (under /public) to a celebration image for this
   * occasion, e.g. "/festival-images/independence-day.png". When set, the
   * full-screen Gateway image popup (components/festival-image-popup.tsx)
   * shows this image to every visitor on that date, until 11:59pm IST.
   * Leave unset for festivals that only get the notification-centre text
   * wish.
   */
  image?: string
}

// Occasions whose Gregorian date is fixed every year.
const FIXED_FESTIVALS: Festival[] = [
  {
    id: 'new-year',
    title: "Happy New Year! 🎉",
    message: "Wishing you a fantastic year ahead, filled with great games and even better moments. Whatever you're planning to play in the months ahead, here's to new releases, new personal bests, and new friends made along the way. Happy New Year from all of us at Gaming Horizon!",
    month: 1,
    day: 1,
  },
  {
    id: 'republic-day',
    title: 'Happy Republic Day! 🇮🇳',
    message: "Wishing you a proud and joyful Republic Day. Today's a good moment to reflect on how far we've come together — thank you for being part of the Gaming Horizon community. Jai Hind!",
    month: 1,
    day: 26,
  },
  {
    id: 'independence-day',
    title: 'Happy Independence Day! 🇮🇳',
    message: "Wishing you a proud and joyful Independence Day. Take a moment today to celebrate with family and friends, and thank you for being part of our community this year. Jai Hind!",
    month: 8,
    day: 15,
    image: '/festival-images/independence-day.png',
  },
  {
    id: 'gandhi-jayanti',
    title: 'Gandhi Jayanti 🕊️',
    message: "Remembering the Mahatma today, and the values of truth, non-violence, and simplicity he stood for. Wishing you a peaceful and reflective Gandhi Jayanti.",
    month: 10,
    day: 2,
  },
  {
    id: 'christmas',
    title: 'Merry Christmas! 🎄',
    message: "Wishing you a Merry Christmas filled with warmth, joy, and good company. However you're spending the holiday, we hope it's a restful one — and that there's a little time set aside for your favourite game too.",
    month: 12,
    day: 25,
  },
]

// Occasions whose date moves every year (lunar/panchang-based). Add future
// years here as their dates are confirmed.
const MOVABLE_FESTIVALS_BY_YEAR: Record<number, Festival[]> = {
  2025: [
    { id: 'holi', title: 'Happy Holi! 🎨', message: "Wishing you a Holi as colourful and joyful as you are! May the day be full of laughter, good company, and plenty of gulal.", month: 3, day: 14 },
    { id: 'raksha-bandhan', title: 'Happy Raksha Bandhan! 🧵', message: "Celebrating the bond of care and protection today. Whether near or far from family this year, we hope the day brings you close to the people who matter most. Happy Raksha Bandhan!", month: 8, day: 9 },
    { id: 'janmashtami', title: 'Happy Janmashtami! 🪈', message: "Wishing you joy, blessings, and a little bit of mischief this Janmashtami — just like the stories.", month: 8, day: 16 },
    { id: 'ganesh-chaturthi', title: 'Happy Ganesh Chaturthi! 🐘', message: "May Lord Ganesha bring you wisdom, good fortune, and the removal of every obstacle in your path this year. Happy Ganesh Chaturthi!", month: 8, day: 27 },
    { id: 'dussehra', title: 'Happy Dussehra! 🏹', message: "Wishing you the triumph of good over evil this Dussehra, and a season ahead full of the same kind of victories, big and small.", month: 10, day: 2 },
    { id: 'diwali', title: 'Happy Diwali! 🪔', message: "Wishing you a Diwali full of light, laughter, and legendary wins — on the board and off it. May the year ahead bring you prosperity and plenty of great games to play with the people you love. Happy Diwali from all of us at Gaming Horizon!", month: 10, day: 20 },
  ],
  2026: [
    { id: 'holi', title: 'Happy Holi! 🎨', message: "Wishing you a Holi as colourful and joyful as you are! May the day be full of laughter, good company, and plenty of gulal.", month: 3, day: 4 },
    { id: 'raksha-bandhan', title: 'Happy Raksha Bandhan! 🧵', message: "Celebrating the bond of care and protection today. Whether near or far from family this year, we hope the day brings you close to the people who matter most. Happy Raksha Bandhan!", month: 8, day: 28, image: '/festival-images/raksha-bandhan-2026.png' },
    { id: 'janmashtami', title: 'Happy Janmashtami! 🪈', message: "Wishing you joy, blessings, and a little bit of mischief this Janmashtami — just like the stories.", month: 9, day: 4, image: '/festival-images/janmashtami-2026.png' },
    { id: 'ganesh-chaturthi', title: 'Happy Ganesh Chaturthi! 🐘', message: "May Lord Ganesha bring you wisdom, good fortune, and the removal of every obstacle in your path this year. Happy Ganesh Chaturthi!", month: 9, day: 14 },
    { id: 'dussehra', title: 'Happy Dussehra! 🏹', message: "Wishing you the triumph of good over evil this Dussehra, and a season ahead full of the same kind of victories, big and small.", month: 10, day: 20 },
    { id: 'diwali', title: 'Happy Diwali! 🪔', message: "Wishing you a Diwali full of light, laughter, and legendary wins — on the board and off it. May the year ahead bring you prosperity and plenty of great games to play with the people you love. Happy Diwali from all of us at Gaming Horizon!", month: 11, day: 8 },
  ],
}

/** Returns today's date in IST as { year, month, day } (month is 1-12). */
export function getTodayInIndia(reference: Date = new Date()): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(reference)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return { year: get('year'), month: get('month'), day: get('day') }
}

/**
 * Returns the festival landing on today's date in India (if any), plus the
 * year it's occurring in — used to key the "already wished this year"
 * dedupe check.
 */
export function getTodaysFestival(reference: Date = new Date()): (Festival & { year: number }) | null {
  const { year, month, day } = getTodayInIndia(reference)

  // Lunar/panchang festivals don't repeat automatically — nothing crashes
  // if a year is missing, they just silently stop firing. Surface that in
  // the console (dev only, once per year) so it doesn't go unnoticed.
  if (
    process.env.NODE_ENV !== 'production' &&
    !MOVABLE_FESTIVALS_BY_YEAR[year] &&
    typeof window !== 'undefined'
  ) {
    const warnedKey = `gh:festival-year-warned:${year}`
    if (!window.sessionStorage.getItem(warnedKey)) {
      console.warn(
        `[festivals] MOVABLE_FESTIVALS_BY_YEAR has no entry for ${year} yet — ` +
          'Holi, Raksha Bandhan, Janmashtami, Ganesh Chaturthi, Dussehra and ' +
          'Diwali will not fire this year until lib/festivals.ts is updated ' +
          'with verified dates (e.g. from drikpanchang.com).',
      )
      window.sessionStorage.setItem(warnedKey, '1')
    }
  }

  const candidates = [...FIXED_FESTIVALS, ...(MOVABLE_FESTIVALS_BY_YEAR[year] ?? [])]
  const match = candidates.find((festival) => festival.month === month && festival.day === day)
  return match ? { ...match, year } : null
}

/**
 * The exact instant 23:59:59.999 IST on the given Gregorian date, as a UTC
 * `Date`. IST has been a fixed UTC+5:30 offset (no DST) since 1945, so this
 * is a plain arithmetic conversion — no Intl round-tripping needed.
 * This is the same instant `FestivalImagePopup` force-hides itself at, so
 * a wish image disappears from the popup and unlocks in the Library at
 * exactly the same moment.
 */
function istEndOfDay(year: number, month: number, day: number): Date {
  // 23:59:59.999 IST == 18:29:59.999 UTC the same calendar date.
  return new Date(Date.UTC(year, month - 1, day, 18, 29, 59, 999))
}

export interface LibraryEntry extends Omit<Festival, 'image'> {
  year: number
  /** Always set for a LibraryEntry — only festivals with an image graduate into the Library. */
  image: string
  /** The instant (UTC) this entry unlocked in the Library — 23:59:59.999 IST on its date. */
  unlockedAt: Date
}

/**
 * Every festival wish image that has finished its day as the full-screen
 * Gateway popup and has therefore "graduated" into the footer Library.
 *
 * This is a permanent archive: once an occasion's `image` has unlocked
 * (23:59:59.999 IST on its date — the same instant `FestivalImagePopup`
 * stops showing it), it stays in the Library for good. Nothing here is
 * scoped to "this year only", so nothing disappears when the calendar
 * rolls over:
 *
 * - Movable festivals (MOVABLE_FESTIVALS_BY_YEAR) are checked across every
 *   year in that table, not just the current one — so a 2026 image is
 *   still here in 2027, 2028, etc. Add a new year's dates (with or without
 *   an `image`) and, once that date passes, it just joins the list.
 * - Fixed festivals (FIXED_FESTIVALS) repeat every year with the same
 *   image, so rather than piling up an identical duplicate per year, the
 *   single most recent occurrence is kept: this year's, once it has
 *   passed, or last year's for the rest of the year until it does.
 *
 * Net effect: give any festival entry an `image` and, from the first time
 * its date passes, it is in the Library from then on — no other code or
 * bookkeeping required for it, this year or any future one.
 *
 * Sorted most-recently-unlocked first.
 */
export function getFestivalLibrary(reference: Date = new Date()): LibraryEntry[] {
  const { year: currentYear } = getTodayInIndia(reference)
  const entries: LibraryEntry[] = []

  for (const festival of FIXED_FESTIVALS) {
    if (!festival.image) continue
    const thisYearUnlock = istEndOfDay(currentYear, festival.month, festival.day)
    const unlockedThisYear = reference.getTime() >= thisYearUnlock.getTime()
    const year = unlockedThisYear ? currentYear : currentYear - 1
    const unlockedAt = unlockedThisYear ? thisYearUnlock : istEndOfDay(year, festival.month, festival.day)
    entries.push({ ...festival, image: festival.image, year, unlockedAt })
  }

  for (const [yearKey, festivals] of Object.entries(MOVABLE_FESTIVALS_BY_YEAR)) {
    const year = Number(yearKey)
    for (const festival of festivals) {
      if (!festival.image) continue
      const unlockedAt = istEndOfDay(year, festival.month, festival.day)
      if (reference.getTime() >= unlockedAt.getTime()) {
        entries.push({ ...festival, image: festival.image, year, unlockedAt })
      }
    }
  }

  return entries.sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
}

/** The Gateway site's launch year — the floor for the Library's year selector. */
export const LIBRARY_LAUNCH_YEAR = 2026

/**
 * Years to offer in the Library's year selector, newest first: from the
 * current year (in IST) down to `LIBRARY_LAUNCH_YEAR`. Grows by one entry
 * each New Year automatically — no yearly maintenance needed. If `reference`
 * is ever earlier than launch (shouldn't happen in production), it still
 * returns just the launch year rather than an empty/negative range.
 */
export function getLibraryYears(reference: Date = new Date()): number[] {
  const { year: currentYear } = getTodayInIndia(reference)
  const latest = Math.max(currentYear, LIBRARY_LAUNCH_YEAR)
  const years: number[] = []
  for (let year = latest; year >= LIBRARY_LAUNCH_YEAR; year--) years.push(year)
  return years
}
