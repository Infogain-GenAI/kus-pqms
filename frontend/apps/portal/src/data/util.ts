import { NOW } from './types'

/**
 * ─── THE DATE FORMATTERS MOVED TO `@/shared/format/date` ─────────────────────
 *
 * They are RE-EXPORTED here, not reimplemented, so the 51 existing
 * `from '@/data/util'` imports keep working and cannot drift onto a second
 * implementation. New code should import from `@/shared/format/date` directly.
 *
 * They moved because every one of them was wrong. Each called `new Date(iso)`
 * and then read it back with LOCAL getters — and a date-only string like
 * `"2026-06-16"` parses as UTC midnight, so west of UTC it rendered the previous
 * day. `Issue.reportedDate` is date-only throughout the seed and the user base
 * is Kia US, so this was firing on essentially every date in the application.
 * The full explanation and the fix are in that module's header.
 */
export { fmtDate, fmtDateTime, fmtHM, fmtMD, fmtMDY, parseCalendarDate, toLocalIsoDate } from '@/shared/format/date'

/** Whole days between reportedDate and closedAt (or the fixed NOW). Deterministic on mock data. */
export function daysOpen(reportedDate: string, closedAt?: string): number {
  const start = new Date(reportedDate).getTime()
  const end = closedAt ? new Date(closedAt).getTime() : new Date(NOW).getTime()
  return Math.max(0, Math.round((end - start) / 86_400_000))
}

/** "SV" for single-model issues, "2 Models"/"3 Models" for multi (matches the UX list). */
export function modelCodeLabel(i: { modelCode: string; modelCodes?: string[] }): string {
  const n = i.modelCodes?.length ?? 0
  return n > 1 ? `${n} Models` : i.modelCodes?.[0] ?? i.modelCode
}

export function newId(prefix: string): string {
  const rand = (globalThis.crypto?.randomUUID?.() ?? String(Math.round(performance.now() * 1000))).slice(0, 8)
  return `${prefix}-${rand}`
}
