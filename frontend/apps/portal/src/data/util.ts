import { NOW } from './types'

/** Whole days between reportedDate and closedAt (or the fixed NOW). Deterministic on mock data. */
export function daysOpen(reportedDate: string, closedAt?: string): number {
  const start = new Date(reportedDate).getTime()
  const end = closedAt ? new Date(closedAt).getTime() : new Date(NOW).getTime()
  return Math.max(0, Math.round((end - start) / 86_400_000))
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** MM/DD/YYYY (prototype date format). */
export function fmtMDY(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}/${p(d.getDate())}/${d.getFullYear()}`
}

/** HH:mm 24h. */
export function fmtHM(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}`
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

/**
 * "Jun 17" — a short month/day, for the fixed-width date column in the
 * existing-issue preview's Related-history list.
 *
 * ⚠️ LOCAL TIME, MATCHING `fmtMDY` AND `fmtHM` ABOVE, NOT UTC. The Vue original
 * formats the same column in UTC, which would put this app's dates one day out
 * from every other date on screen for any viewer west of Greenwich — the audit
 * row would read "Jun 16" beside a timestamp the History tab renders as Jun 17.
 * Consistency inside this app beats matching the other app's helper.
 */
export function fmtMD(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}
