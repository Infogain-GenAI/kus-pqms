import type { Issue } from '@/data/types'
import { daysOpen, modelCodeLabel } from '@/data/util'

/**
 * Issue-list export.
 *
 * Ported from `IssueList/issue-export.ts`.
 *
 * ─── WHY THIS EXISTS: THE EXPORT BUTTONS WERE DEAD ───────────────────────────
 *
 * Both of them — the header's "Export" and the bulk bar's "Export XLSX" —
 * rendered with no `onClick` at all. They looked like working controls and did
 * nothing when pressed, which is worse than not offering the capability: a user
 * who clicks Export and sees no download assumes their browser blocked it.
 *
 * ─── CSV, NOT XLSX, AND THAT IS A DELIBERATE SUBSTITUTION ────────────────────
 *
 * The Vue implementation builds a real workbook with the `xlsx` package. That
 * package is NOT a dependency here, and adding it is not a free choice:
 *
 *   - `13-security-standards.md` sets a dependency release-age hold, so a new
 *     runtime dependency is a reviewed decision rather than an import.
 *   - npm's `xlsx@0.18.5` — the exact version the Vue app pins — is the
 *     abandoned npm mirror of SheetJS, with published prototype-pollution and
 *     ReDoS advisories and no fix on that channel. Pulling it in to make a
 *     button work would trade a dead control for a real supply-chain exposure.
 *
 * So this writes CSV with nothing but the platform: Excel, Numbers and Sheets
 * all open it directly, and the user gets their data today.
 *
 * THE COLUMN SET AND ROW SHAPE ARE VUE'S, VERBATIM, which is the part that
 * actually matters — `buildExportRows` is the same pure, testable function with
 * the same thirteen headers in the same order. Swapping CSV for a real workbook
 * later means replacing `toCsv`/`download` and nothing else.
 */

/**
 * Flat, human-readable rows — pure, so the column contract can be tested
 * without touching the DOM.
 *
 * Column names and order are carried over exactly. Three are adapted to this
 * app's `Issue` shape rather than invented: `Source` joins `sources` when an
 * issue has several (falling back to the single `source`), `Model Code` uses the
 * same `modelCodeLabel` helper the table itself renders, and `Days open` is
 * computed with the shared `daysOpen` helper so the file agrees with the column.
 */
export function buildExportRows(issues: Issue[]): Record<string, string | number>[] {
  return issues.map((i) => ({
    'Issue ID': i.id,
    Title: i.title,
    'Model Code': modelCodeLabel(i),
    Source: (i.sources?.length ? i.sources : [i.source]).join(', '),
    Model: i.model,
    'Model Year': String(i.modelYear),
    System: i.system ?? '',
    Component: i.component ?? '',
    Symptom: i.symptom ?? '',
    Status: i.status,
    'Days open': daysOpen(i.reportedDate, i.closedAt),
    Owner: i.owner,
    Linked: (i.linkedIssueIds ?? []).join(', '),
    'EWS flag': i.isEws ? 'Yes' : 'No',
    Created: i.createdAt,
  }))
}

/**
 * RFC 4180 quoting. Every field is quoted rather than only the ones that need
 * it — issue titles routinely contain commas and em-dashes, and conditional
 * quoting is the rule that gets one case wrong and corrupts a column silently.
 */
function toCsv(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0]!)
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const lines = [headers.map(cell).join(','), ...rows.map((r) => headers.map((h) => cell(r[h] ?? '')).join(','))]
  // CRLF: Excel on Windows treats a bare LF as one long row in some locales.
  return lines.join('\r\n')
}

/**
 * Save rows as a file the browser downloads.
 *
 * The BOM is not decoration: without it Excel reads the file as the system
 * codepage and mangles every non-ASCII character — and this data carries
 * em-dashes and Korean plant names as a matter of course.
 */
export function downloadIssuesCsv(issues: Issue[], filename = 'issues.csv'): void {
  const csv = toCsv(buildExportRows(issues))
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

/** `issues-2026-08-30.csv` — dated, so successive exports do not overwrite each other. */
export function exportFilename(prefix = 'issues'): string {
  return `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`
}
