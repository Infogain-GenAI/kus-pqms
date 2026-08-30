import { NOW } from './types'
import { ISSUES, NOTIFICATIONS } from './seed'

// Regression gate for the dataset's fixed "today" — the export's own _todayBase() is a
// hardcoded new Date(2026,6,9) (Jul 9 2026), and every relative label in the UX resolves
// against it. An anchor drift silently rewrites those labels while still looking plausible
// (it bit us once: the anchor and six relative-dated rows drifted a month before a source
// re-read caught it), so the app refuses to boot instead of rendering drifted dates.

function fail(msg: string): never {
  throw new Error(`seed anchor drift: ${msg}`)
}

export function assertSeedAnchors(): void {
  if (NOW !== '2026-07-09T09:00:00Z') fail(`NOW is ${NOW}, expected 2026-07-09T09:00:00Z`)

  // The rows the prototype dates relative to the anchor ('Today' / 'Yesterday' / '2h ago').
  const pinned: Record<string, string> = {
    'HV-260101': '2026-07-09',
    'EE-260013': '2026-07-09',
    'PT-260014': '2026-07-09',
    'IN-260016': '2026-07-09',
    'PT-260015': '2026-07-08',
    'SU-260017': '2026-07-08',
  }
  for (const [id, date] of Object.entries(pinned)) {
    const row = ISSUES.find((i) => i.id === id)
    if (!row) fail(`pinned issue ${id} is missing from the seed`)
    else if (row.reportedDate !== date) fail(`${id} reportedDate is ${row.reportedDate}, expected ${date}`)
  }

  const nowMs = new Date(NOW).getTime()
  for (const n of NOTIFICATIONS) {
    const t = new Date(n.createdAt).getTime()
    if (t > nowMs) fail(`notification ${n.id} createdAt ${n.createdAt} is after NOW`)
    /*
     * ⚠️ ONLY ISSUE-TYPED ROWS ARE CHECKED AGAINST `ISSUES`.
     *
     * This used to resolve EVERY `recordId` against the issue list, which was
     * correct only for as long as issues were the sole record type. A `qir` row
     * has no entry there and would fail this check while being perfectly valid —
     * so the assertion now asks what the row points AT before deciding where to
     * look for it.
     *
     * A row carrying an id but no type is still caught: `notificationTarget`
     * refuses to route it, so it is a dead notification, and saying so here is
     * cheaper than a user reporting a click that does nothing.
     */
    if (n.recordId && !n.recordType) {
      fail(`notification ${n.id} has recordId ${n.recordId} but no recordType, so it cannot be routed`)
    }
    const ref = n.recordType === 'issue' && n.recordId ? ISSUES.find((i) => i.id === n.recordId) : undefined
    if (n.recordType === 'issue' && n.recordId && !ref) {
      fail(`notification ${n.id} references missing issue ${n.recordId}`)
    }
    if (ref && t < new Date(`${ref.reportedDate}T00:00:00Z`).getTime()) {
      fail(`notification ${n.id} (${n.createdAt}) precedes issue ${ref.id} (${ref.reportedDate})`)
    }
  }
}
