// Tests for the History event catalogue.
//
// The catalogue exists because the section previously decided an event's segment
// and icon by REGEX-MATCHING its action string. That works only for the strings
// it was written against, and its failure mode is invisible: a wrongly-segmented
// row still renders perfectly, it just never appears under the filter someone is
// looking at.
//
// So what is pinned here is the thing a screenshot cannot show — that every
// action the app actually WRITES has a catalogue row, and that the two segments
// mean what they say.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { HISTORY_CATALOGUE, resolveHistoryEvent } from '@/features/issues/workspace/history/history.catalogue'

/**
 * Every action string the store and the seed write, collected from source.
 *
 * THIS LIST IS THE POINT OF THE FILE. If someone adds an `appendAudit` call with
 * a new action and does not catalogue it, this test tells them — instead of the
 * row silently falling back to a regex guess in production.
 */
const ACTIONS_WRITTEN_BY_THE_APP = [
  // store.tsx
  'Activity change approved',
  'Activity change rejected',
  'Activity change requested',
  'Approved transition',
  'Bulk role assignment',
  'Bulk status change',
  'Issue linked',
  'Issue unlinked',
  'Issue updated',
  'Issues linked',
  'Logged activity',
  'Part request updated',
  'Parts request',
  'Proposed transition',
  'Rejected transition',
  'Started investigation',
  // seed.ts
  'Classification selected',
  'Initial field values saved',
  'Initial owner assigned',
  'Issue ID generated',
  'Issue created',
  'Issue record created',
  'Owner assigned',
  'Status initialized',
]

describe('every action the app writes is catalogued', () => {
  it.each(ACTIONS_WRITTEN_BY_THE_APP)('%s has a catalogue row', (action) => {
    expect(resolveHistoryEvent(action), `"${action}" needs a row in HISTORY_CATALOGUE`).toBeDefined()
  })
})

describe('the catalogue is well-formed', () => {
  it('gives every row a non-empty label', () => {
    for (const [key, row] of Object.entries(HISTORY_CATALOGUE)) {
      expect(row.label.trim(), `${key} has an empty label`).not.toBe('')
    }
  })

  it('gives every row an explicit segment — there is no default', () => {
    for (const [key, row] of Object.entries(HISTORY_CATALOGUE)) {
      expect(['lifecycle', 'audit'], `${key} has an invalid segment`).toContain(row.segment)
    }
  })

  it('gives every row an icon, so no row renders untyped', () => {
    for (const [key, row] of Object.entries(HISTORY_CATALOGUE)) {
      expect(row.icon, `${key} has no icon`).toBeTruthy()
    }
  })
})

describe('the lifecycle / audit split', () => {
  // "What happened to the issue" versus "what someone did to the record".
  it('files status and ownership movement under lifecycle', () => {
    for (const a of ['Issue created', 'Started investigation', 'Approved transition', 'Owner assigned', 'Issue linked']) {
      expect(resolveHistoryEvent(a)!.segment, a).toBe('lifecycle')
    }
  })

  // The subtle half: these are the system's own bookkeeping at creation time.
  // The lifecycle event a reader wants there is "Issue created", not three rows
  // about IDs and initialisation.
  it('files creation bookkeeping under audit, not lifecycle', () => {
    for (const a of ['Issue record created', 'Issue ID generated', 'Status initialized', 'Initial field values saved']) {
      expect(resolveHistoryEvent(a)!.segment, a).toBe('audit')
    }
  })
})

describe('an uncatalogued action', () => {
  // The agreed arrangement: unknown actions fall through to the section's
  // existing heuristics rather than being guessed into a segment here. A default
  // is exactly what would file a lifecycle event under the audit log, where
  // nobody reading the lifecycle segment would ever see it.
  it('resolves to undefined rather than a default', () => {
    expect(resolveHistoryEvent('Something Nobody Has Written Yet')).toBeUndefined()
  })
})

/*
 * ─── ⚠️ EVERY ACTION THE APP CAN EMIT MUST HAVE AN ENTRY ────────────────────
 *
 * The list above is hand-maintained, and hand-maintained lists go stale: the
 * group editor shipped emitting 'Issue Unlinked', 'Issue Linked' and 'Parent
 * Issue Changed' with NO catalogue entries, so those rows rendered with no icon
 * and no label. Nothing failed — an unknown action falls through to a default.
 *
 * This derives the action strings from the SOURCE instead, so a new
 * `appendAudit(..., 'Some Action', ...)` cannot be added without an entry. It is
 * the inverse of the dead-trace check: that one finds entries with no action,
 * this finds actions with no entry.
 *
 * ⚠️ IT SCANS TEXT, so it sees only literal action arguments — an action built
 * from a variable is invisible to it. That is a real limit, and the reason the
 * hand-maintained list above is not deleted in favour of this.
 */
describe('the catalogue covers every action the store emits', () => {
  const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../apps/portal/src')

  const sources = ['data/store.tsx', 'data/groupEdits.ts'].map((f) =>
    readFileSync(join(SRC, f), 'utf8'),
  )

  it('has an entry for each literal action argument in the store', () => {
    const emitted = new Set<string>()
    for (const src of sources) {
      // `appendAudit(id, actor, 'Action', …)` and the planner's `action: 'Action'`
      for (const m of src.matchAll(/appendAudit\([^,]+,[^,]+,\s*'([^']+)'/g)) emitted.add(m[1])
      for (const m of src.matchAll(/action:\s*'([^']+)'/g)) emitted.add(m[1])
    }
    expect(emitted.size, 'scanned no actions at all').toBeGreaterThan(5)

    const missing = [...emitted].filter((a) => !(a in HISTORY_CATALOGUE)).sort()
    expect(missing, `actions with no catalogue entry: ${missing.join(', ')}`).toEqual([])
  })
})
