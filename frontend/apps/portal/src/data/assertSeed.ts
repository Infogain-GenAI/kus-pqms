import { NOW, type ClassLevel, type ClassificationNode, type Issue } from './types'
import { ACTIVITIES, CLASSIFICATION, ISSUES, NOTIFICATIONS } from './seed'

// Regression gate for the dataset's fixed "today" — the export's own _todayBase() is a
// hardcoded new Date(2026,6,9) (Jul 9 2026), and every relative label in the UX resolves
// against it. An anchor drift silently rewrites those labels while still looking plausible
// (it bit us once: the anchor and six relative-dated rows drifted a month before a source
// re-read caught it), so the app refuses to boot instead of rendering drifted dates.

function fail(msg: string): never {
  throw new Error(`seed anchor drift: ${msg}`)
}

function failGroup(msg: string): never {
  throw new Error(`seed group invariant: ${msg}`)
}

/**
 * Issue groups are a hand-tagged partition, so the ways they break are the ways
 * hand-tagging breaks. All four failures are silent in the UI — a wrong parent
 * or a dropped member still renders a perfectly plausible card.
 */
/**
 * Every issue is filed against a path that exists in the taxonomy.
 *
 * Half the seed failed this before the design's full tree was ported — issues
 * were classified against labels no picker could offer, so classification-driven
 * features silently could not reach them. A count in a report rots; this does not.
 *
 * Exported as a PURE function over its inputs so its failure paths can be tested
 * with crafted rows. Wired to the real seed by `assertSeedAnchors`; the failures
 * are the whole point of it and would otherwise never execute.
 */
export function classificationErrors(
  issues: Pick<Issue, 'id' | 'system' | 'subSystem' | 'component' | 'symptom'>[],
  taxonomy: ClassificationNode[],
): string[] {
  const at = (level: ClassLevel, label: string, parentId?: string) =>
    taxonomy.find((c) => c.level === level && c.label === label && (parentId === undefined || c.parentId === parentId))

  const errors: string[] = []
  for (const issue of issues) {
    // An unclassified issue is legitimate — registration can precede triage.
    if (![issue.system, issue.subSystem, issue.component, issue.symptom].some(Boolean)) continue

    const sys = at('system', issue.system ?? '')
    if (!sys) { errors.push(`${issue.id}: system "${issue.system}" is not in the taxonomy`); continue }
    const sub = at('subSystem', issue.subSystem ?? '', sys.id)
    if (!sub) { errors.push(`${issue.id}: sub-system "${issue.subSystem}" is not under "${issue.system}"`); continue }
    const cmp = at('component', issue.component ?? '', sub.id)
    if (!cmp) { errors.push(`${issue.id}: component "${issue.component}" is not under "${issue.subSystem}"`); continue }
    if (!at('symptom', issue.symptom ?? '', cmp.id)) {
      errors.push(`${issue.id}: symptom "${issue.symptom}" is not under "${issue.component}"`)
    }
  }
  return errors
}

function assertIssueClassification(): void {
  const errors = classificationErrors(ISSUES, CLASSIFICATION)
  if (errors.length) failGroup(errors.join('; '))
}

function assertIssueGroups(): void {
  const byGroup = new Map<string, typeof ISSUES>()
  const ids = new Set(ISSUES.map((i) => i.id))

  for (const issue of ISSUES) {
    if (!issue.groupId) continue
    // 4. A typo'd key makes a one-member group that quietly never renders.
    if (!ids.has(issue.groupId)) failGroup(`${issue.id} has groupId "${issue.groupId}", which is not a seeded issue id`)
    const bucket = byGroup.get(issue.groupId) ?? []
    bucket.push(issue)
    byGroup.set(issue.groupId, bucket)
  }

  for (const [groupId, members] of byGroup) {
    // 2. A group of one is a standalone issue wearing a group card.
    if (members.length < 2) failGroup(`group "${groupId}" has ${members.length} member(s); a group needs at least 2`)

    // 3. The parent is DERIVED as the earliest member, so a tie makes it depend
    //    on array order — and silently breaks "removal re-parents automatically".
    const dates = members.map((m) => m.createdAt)
    if (new Set(dates).size !== dates.length) {
      failGroup(`group "${groupId}" has members sharing a createdAt; the derived parent would be ambiguous`)
    }
  }

  // 1. Disjointness. `groupId` is a single field, so overlap is only possible via
  //    a key that is itself a member of another group — which would chain two
  //    cohorts into one card.
  for (const groupId of byGroup.keys()) {
    const key = ISSUES.find((i) => i.id === groupId)
    if (key && key.groupId !== groupId) {
      failGroup(`group "${groupId}" is keyed on an issue that belongs to group "${key.groupId}"; groups must be disjoint`)
    }
  }
}

function failActivity(msg: string): never {
  throw new Error(`seed activity invariant: ${msg}`)
}

/**
 * Activity invariants.
 *
 * ⚠️ THE ORDER CHECK IS THE POINT. `store.activitiesFor()` does NOT sort — it
 * filters in array order — and `ExistingIssueModal` renders
 * `activities[0].summary` as the issue's "Investigation summary". So an editor
 * who appends a new activity above an issue's existing block silently changes
 * which text that panel shows, with nothing failing. This makes it fail.
 */
function assertActivities(): void {
  const ids = new Set<string>()
  const firstSeen = new Map<string, string>()

  for (const a of ACTIVITIES) {
    if (ids.has(a.id)) failActivity(`duplicate activity id ${a.id}`)
    ids.add(a.id)

    const issue = ISSUES.find((i) => i.id === a.issueId)
    if (!issue) failActivity(`${a.id} targets ${a.issueId}, which is not a seeded issue`)
    // An activity that predates its own issue reads as a data-entry error to
    // anyone reading the timeline, and sorts wrongly the moment anything sorts.
    if (a.createdAt < issue.createdAt) {
      failActivity(`${a.id} is dated ${a.createdAt}, before its issue's ${issue.createdAt}`)
    }
    if (!a.summary.trim()) failActivity(`${a.id} has an empty summary`)

    if (!firstSeen.has(a.issueId)) firstSeen.set(a.issueId, a.id)
  }

  // Each issue's FIRST activity must be its investigation entry — see above.
  for (const [issueId, firstId] of firstSeen) {
    if (!firstId.endsWith('-0')) {
      failActivity(`${issueId}'s first activity is ${firstId}; the investigation entry (…-0) must come first`)
    }
  }

  /*
   * HV-260101 STAYS EMPTY — a recorded decision, not an omission. The prototype's
   * hero issue opens with no parts, comms or activities, and `seed.ts` mirrors
   * that deliberately. Pinned so a future "let's seed the main issue too" cannot
   * quietly undo it.
   */
  if (ACTIVITIES.some((a) => a.issueId === 'HV-260101')) {
    failActivity('HV-260101 must open with NO activities — see the note in seed.ts')
  }
}

export function assertSeedAnchors(): void {
  assertIssueGroups()
  assertIssueClassification()
  assertActivities()
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
