import {
  CircleDot,
  FilePlus,
  FilePlus2,
  Flag,
  Hash,
  Link2,
  Microscope,
  Package,
  SquarePen,
  Tags,
  UserRoundCheck,
  UserRoundCog,
  type LucideIcon,
} from 'lucide-react'
import type { AuditEntry } from '@/data/types'
import { resolveHistoryEvent, type HistorySegment } from './history.catalogue'

/**
 * THE HISTORY FEED'S PURE LOGIC — classification, filtering and day grouping.
 *
 * Ported in shape from Vue's `tabs/HistoryTab/history.ts`.
 *
 * ─── WHY IT MOVED OUT OF `HistorySection.tsx` ────────────────────────────────
 *
 * It was all inline in the component, which meant none of it could be tested
 * without rendering a screen, a store and a router. Filtering rules are exactly
 * the kind of thing that is cheap to get subtly wrong and expensive to notice —
 * an off-by-one on an inclusive date bound looks identical to a slow day.
 *
 * ⚠️ THIS MODULE IS PURE AND MUST STAY THAT WAY. It takes `today` as an
 * ARGUMENT rather than reading the clock, exactly as Vue's does. A module that
 * calls `new Date()` internally cannot be tested for "last 30 days" without
 * freezing time, and every such test then depends on the day it is run.
 *
 * ─── ⚠️ ALL DATE COMPARISON IS ON `yyyy-mm-dd` STRINGS, IN UTC ───────────────
 *
 * `entry.timestamp` is a full ISO instant; `.slice(0, 10)` takes its UTC day.
 * Every bound below is compared as a STRING (`day < dateFrom`), never as a
 * `Date`. Two reasons, and the second one has already bitten this codebase:
 *
 *   • Lexicographic comparison on `yyyy-mm-dd` is exactly date ordering, so it
 *     needs no parsing at all.
 *   • `new Date("2026-07-09")` parses as UTC midnight, and reading it back with
 *     LOCAL getters returns the 8th anywhere west of UTC. `shared/format/date.ts`
 *     carries the same warning after that bug shipped. Comparing strings makes
 *     the class of bug unrepresentable rather than merely fixed.
 */

/* -------------------------------------------------------------------------- */
/* Classification                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The segment an action belongs to.
 *
 * ⚠️ THE CATALOGUE ANSWERS FIRST, ALWAYS. The regexes below are the fallback for
 * an action with no catalogue row — they were once the whole mechanism, and they
 * mis-file anything they were not written against SILENTLY, because a wrongly
 * segmented row still renders perfectly. Adding a row to the catalogue is how a
 * new action gets classified; adding a regex here is not.
 */
export function classifyHistoryAction(action: string): HistorySegment {
  const known = resolveHistoryEvent(action)
  if (known) return known.segment

  if (/^issue record created$/i.test(action) || /^status initialized$/i.test(action)) return 'audit'
  if (/^initial owner assigned$/i.test(action)) return 'lifecycle'
  return /status|created|submitted|approved|rejected|escalated|investigation|disposition/i.test(
    action,
  )
    ? 'lifecycle'
    : 'audit'
}

/** The icon for an action. Same catalogue-first rule as the segment. */
export function historyIconFor(action: string): LucideIcon {
  const known = resolveHistoryEvent(action)
  if (known) return known.icon

  if (/initial owner assigned/i.test(action)) return UserRoundCheck
  if (/record created/i.test(action)) return FilePlus
  if (/created/i.test(action)) return Flag
  if (/link/i.test(action)) return Link2
  if (/parts/i.test(action)) return Package
  if (/updated|field/i.test(action)) return SquarePen
  if (/classif/i.test(action)) return Tags
  if (/status|approved|rejected|escalat/i.test(action)) return CircleDot
  if (/owner|assign/i.test(action)) return UserRoundCog
  if (/activity/i.test(action)) return Microscope
  if (/id/i.test(action)) return Hash
  return FilePlus2
}

/**
 * What the row actually reads as.
 *
 * The store writes "Started investigation"; a reader expects "Investigation
 * started". Falls back to the raw action so an uncatalogued event still shows
 * something true rather than nothing.
 */
export function historyLabelFor(action: string): string {
  return resolveHistoryEvent(action)?.label ?? action
}

/* -------------------------------------------------------------------------- */
/* Filtering                                                                  */
/* -------------------------------------------------------------------------- */

export interface HistoryFilters {
  /** `undefined` ⇒ the "All" segment. */
  segment?: HistorySegment
  search?: string
  /** ISO `yyyy-mm-dd`, INCLUSIVE. */
  dateFrom?: string
  /** ISO `yyyy-mm-dd`, INCLUSIVE. */
  dateTo?: string
}

/**
 * AND across every active filter — one predicate, not chained passes.
 *
 * ⚠️ THE SEARCH COVERS THE RENDERED LABEL, NOT ONLY THE STORED ACTION. A user
 * who reads "Investigation started" and types it must find the row whose stored
 * action is "Started investigation". Searching only the raw action returns
 * nothing and reads as missing data rather than as a vocabulary mismatch.
 *
 * ⚠️ BOTH DATE BOUNDS ARE INCLUSIVE. `>` and `<`, never `>=`/`<=` inverted: a
 * user who picks 1st–31st means the whole month, and an exclusive `dateTo`
 * silently drops the last day — the single hardest filtering bug to see, because
 * the result still looks like a plausible month.
 */
export function matchesHistoryFilters(entry: AuditEntry, filters: HistoryFilters): boolean {
  if (filters.segment && classifyHistoryAction(entry.action) !== filters.segment) return false

  const search = filters.search?.trim().toLowerCase()
  if (search) {
    const haystack = [
      entry.action,
      historyLabelFor(entry.action),
      entry.detail ?? '',
      entry.actor,
      entry.actorRole,
    ]
      .join(' ')
      .toLowerCase()
    if (!haystack.includes(search)) return false
  }

  const day = entry.timestamp.slice(0, 10)
  if (filters.dateFrom && day < filters.dateFrom) return false
  if (filters.dateTo && day > filters.dateTo) return false

  return true
}

/* -------------------------------------------------------------------------- */
/* Quick ranges                                                               */
/* -------------------------------------------------------------------------- */

export type QuickRangeKey = 'all' | 'last7' | 'last30' | 'last90' | 'thisMonth' | 'lastMonth'

export interface DateRange {
  from?: string
  to?: string
}

/**
 * The six presets, in the order the panel lists them. Ported 1:1 from Vue.
 *
 * ⚠️ CARRIES AN i18n KEY, NOT A LABEL. Vue holds the English strings inline
 * here; this app resolves them through `IssueDetail.i18n.ts` so the screen's
 * vocabulary lives in one file and the `lint:ds:copy` gate stays satisfied.
 * Keeping the English here would also make this module unusable from a locale
 * other than the one it was written in.
 */
export const QUICK_RANGES: readonly { key: QuickRangeKey; labelKey: string }[] = [
  { key: 'all', labelKey: 'historyRangeAll' },
  { key: 'last7', labelKey: 'historyRangeLast7' },
  { key: 'last30', labelKey: 'historyRangeLast30' },
  { key: 'last90', labelKey: 'historyRangeLast90' },
  { key: 'thisMonth', labelKey: 'historyRangeThisMonth' },
  { key: 'lastMonth', labelKey: 'historyRangeLastMonth' },
]

/**
 * `n` days before an ISO day, in UTC.
 *
 * ⚠️ `setUTCDate` RATHER THAN SUBTRACTING MILLISECONDS. Subtraction is wrong
 * across a DST boundary — a day is not always 86,400,000ms in a local zone — and
 * `setUTCDate` handles month and year rollover for free.
 */
export function isoDaysBefore(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

/**
 * The from/to a preset resolves to, measured against `today`.
 *
 * ⚠️ "LAST 7 DAYS" GOES BACK 6, NOT 7 — it INCLUDES today, so the range spans
 * seven days in total. Going back 7 gives an eight-day window, which is the
 * off-by-one every date-preset implementation makes at least once. Same for 30
 * (29 back) and 90 (89 back).
 */
export function quickRangeValue(key: QuickRangeKey, today: string): DateRange {
  const date = new Date(`${today}T00:00:00.000Z`)

  switch (key) {
    case 'all':
      // Deliberately EMPTY, not a huge span. "No constraint" and "a range that
      // happens to contain everything" behave identically today and diverge the
      // moment an entry is backdated.
      return {}
    case 'last7':
      return { from: isoDaysBefore(today, 6), to: today }
    case 'last30':
      return { from: isoDaysBefore(today, 29), to: today }
    case 'last90':
      return { from: isoDaysBefore(today, 89), to: today }
    case 'thisMonth': {
      const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
      // Ends TODAY, not at month end: a history log has no forward extent, so a
      // range running to the 31st of an unfinished month would be a bound that
      // can never match anything.
      return { from: start.toISOString().slice(0, 10), to: today }
    }
    case 'lastMonth': {
      const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1))
      // ⚠️ DAY 0 OF THIS MONTH IS THE LAST DAY OF THE PREVIOUS ONE. That is the
      // whole trick, and it is why this needs no month-length table and gets
      // February right in a leap year without special-casing it.
      const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 0))
      return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }
    }
  }
}

/**
 * Which preset the current range corresponds to, or `null` for a custom one.
 *
 * ⚠️ AN EMPTY RANGE IS `all`, NOT `null`. The trigger label reads from this, and
 * a null there would render an empty "–" dash for the default state.
 */
export function activeQuickRange(range: DateRange, today: string): QuickRangeKey | null {
  if (!range.from && !range.to) return 'all'
  for (const preset of QUICK_RANGES) {
    const value = quickRangeValue(preset.key, today)
    if (value.from === range.from && value.to === range.to) return preset.key
  }
  return null
}

/* -------------------------------------------------------------------------- */
/* Grouping                                                                   */
/* -------------------------------------------------------------------------- */

export interface HistoryDayGroup {
  label: string
  count: number
  entries: AuditEntry[]
}

/**
 * The feed's day buckets — Today / Yesterday / Last week / Older.
 *
 * ⚠️ THESE FOUR BUCKETS ARE THIS APP'S, NOT VUE'S. Vue groups by calendar day
 * and labels each one (`TODAY`, `YESTERDAY`, `12 AUG 2026`); this app buckets
 * into four coarse bands. The shipped design is the coarse one, so it is kept —
 * changing it would be a redesign smuggled in behind a filter port. Noted so the
 * difference from Vue's `groupByDay` reads as deliberate.
 *
 * ⚠️ THE COUNT IS THE FILTERED COUNT, NOT THE DAY'S TOTAL. The badge has to
 * track the active filter, or narrowing to Lifecycle shows "12" above three
 * rows and the user reasonably concludes nine are hidden by a bug.
 *
 * Bucket order follows first appearance in `entries`, which the store writes
 * newest-first — so the buckets come out newest-first without a sort. Stated
 * because it is a property of the input, not of this function.
 */
export function groupHistoryByDay(entries: AuditEntry[], today: string): HistoryDayGroup[] {
  const todayDay = Math.floor(Date.parse(`${today}T00:00:00.000Z`) / 86_400_000)
  const groups = new Map<string, AuditEntry[]>()

  for (const entry of entries) {
    const entryDay = Math.floor(Date.parse(`${entry.timestamp.slice(0, 10)}T00:00:00.000Z`) / 86_400_000)
    const diff = todayDay - entryDay
    // `diff <= 0` rather than `=== 0`: an entry stamped slightly in the future —
    // a clock skew between the writer and this client — belongs under Today, not
    // in a bucket that does not exist.
    const label = diff <= 0 ? 'Today' : diff === 1 ? 'Yesterday' : diff <= 7 ? 'Last week' : 'Older'
    const bucket = groups.get(label)
    if (bucket) bucket.push(entry)
    else groups.set(label, [entry])
  }

  return [...groups.entries()].map(([label, list]) => ({
    label,
    count: list.length,
    entries: list,
  }))
}
