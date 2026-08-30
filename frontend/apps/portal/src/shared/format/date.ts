/**
 * DATE AND TIME FORMATTING — one module, one parser.
 *
 * Ported from `shared/format/date.ts` in the Vue app. Before this, the same
 * five formatters lived as loose helpers in `data/util.ts`, each calling
 * `new Date(iso)` directly, and every one of them carried the bug below.
 *
 * ─── THE BUG THIS MODULE EXISTS TO FIX ───────────────────────────────────────
 *
 * `new Date("2026-06-16")` — a DATE-ONLY string, no time component — is parsed
 * as UTC midnight. That is not a quirk, it is what the ECMAScript spec requires.
 * Every formatter here then reads it back with LOCAL getters (`getMonth()`,
 * `getDate()`, `getFullYear()`).
 *
 * West of UTC those two facts disagree by a day:
 *
 *     TZ=America/New_York
 *     new Date('2026-06-16').getDate()  →  15
 *
 * So `fmtMDY(issue.reportedDate)` rendered **06/15/2026** for an issue reported
 * on the 16th. Not an edge case: `Issue.reportedDate` is date-only throughout
 * the seed, and the product's entire user base (Kia US) is west of UTC. It was
 * invisible in development only because this machine runs Asia/Calcutta, which
 * is east of UTC and therefore rounds the other way.
 *
 * On 1 January it shifts the YEAR, not just the day.
 *
 * ─── THE FIX: PARSE DATE-ONLY STRINGS AS LOCAL CALENDAR DATES ────────────────
 *
 * A bare `YYYY-MM-DD` is a calendar date, not an instant — it means "the 16th",
 * not "midnight UTC on the 16th". `parseCalendarDate` builds it with the local
 * `Date(y, m, d)` constructor so it reads back as the same day it names. Strings
 * that DO carry a time (`2026-07-09T08:52:00Z`) are real instants and are left
 * to `new Date()`, which handles them correctly.
 *
 * ─── ONE MODULE SO THE CONVENTION IS ONE DECISION ────────────────────────────
 *
 * The Vue original's reason applies unchanged: if `MM/DD/YYYY` turns out not to
 * be the app-wide convention, the change is this file, not fifty call sites.
 * `data/util.ts` re-exports everything here, so the 51 existing imports did not
 * have to move and cannot drift onto a second implementation.
 */

/**
 * Parses an ISO string for the formatters below.
 *
 * DATE-ONLY (`YYYY-MM-DD`) → a LOCAL calendar date. See the header for why.
 * Anything else → `new Date()` unchanged, because it is a real instant.
 *
 * An out-of-range date-only string (`"2026-13-45"`) returns an Invalid Date
 * rather than silently rolling over into the next month — `new Date(2026, 12, 45)`
 * would happily produce a date in 2027, which is worse than no date at all.
 */
export function parseCalendarDate(iso: string): Date {
  const bare = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!bare) return new Date(iso)

  const year = Number(bare[1])
  const month = Number(bare[2])
  const day = Number(bare[3])
  const date = new Date(year, month - 1, day)

  // Rollover check: the constructor normalises out-of-range parts instead of
  // rejecting them, so the only way to detect a bad input is to read it back.
  const valid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  return valid ? date : new Date(NaN)
}

/** Two-digit pad, used by every fixed-width format below. */
const p2 = (n: number) => String(n).padStart(2, '0')

/**
 * Invalid input renders as an EMPTY STRING, never as "NaN/NaN/NaN".
 *
 * The Vue original does the same. A blank cell reads as "no date recorded",
 * which is at worst incomplete; "NaN/NaN/NaN" reads as a broken application and
 * costs someone a bug report.
 */
const guard = (iso: string, fn: (d: Date) => string): string => {
  const d = parseCalendarDate(iso)
  return Number.isNaN(d.getTime()) ? '' : fn(d)
}

/** `Jun 16, 2026` — long form, for prose contexts. */
export function fmtDate(iso: string): string {
  return guard(iso, (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }))
}

/** `Jun 16, 2026, 08:52 AM` — long form with a time. */
export function fmtDateTime(iso: string): string {
  return guard(iso, (d) =>
    d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  )
}

/** `06/16/2026` — the prototype's own date format, and the app's default. */
export function fmtMDY(iso: string): string {
  return guard(iso, (d) => `${p2(d.getMonth() + 1)}/${p2(d.getDate())}/${d.getFullYear()}`)
}

/** `08:52` — 24-hour clock. */
export function fmtHM(iso: string): string {
  return guard(iso, (d) => `${p2(d.getHours())}:${p2(d.getMinutes())}`)
}

/** `Jun 16` — short month/day, for the preview modal's fixed-width history column. */
export function fmtMD(iso: string): string {
  return guard(iso, (d) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }))
}

/**
 * `2026-06-16` — a local calendar date as the date-only wire format.
 *
 * DELIBERATELY NOT `date.toISOString().slice(0, 10)`. That converts to UTC
 * first, so between local midnight and UTC midnight it emits the wrong day —
 * the same class of error as the read-side bug above, in the opposite
 * direction. Ported from Vue's `toLocalIsoDate`, which exists for this reason.
 */
export function toLocalIsoDate(date: Date): string {
  return `${date.getFullYear()}-${p2(date.getMonth() + 1)}-${p2(date.getDate())}`
}
