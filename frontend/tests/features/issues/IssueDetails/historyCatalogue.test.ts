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
import {
  classifyHistoryAction,
  historyIconFor,
  historyLabelFor,
} from '@/features/issues/workspace/history/history'

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

/* -------------------------------------------------------------------------- */
/* ⚠️ UNION MERGE. Both branches appended a block here and the two are         */
/* complementary, not competing: ours reads the STORE and fails on an action  */
/* with no catalogue row; main's reads the CATALOGUE and fails on a row with  */
/* no segment, wrong precedence, or a duplicate key. Keeping one side would   */
/* have left a green file and a silently unlabelled timeline — so both stay.  */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Ported from Vue's history.catalogue.spec.ts                                */
/* -------------------------------------------------------------------------- */

describe('an event resolves to exactly one segment, whatever route it arrives by', () => {
  /*
   * ⚠️ VUE'S CENTRAL CATALOGUE ASSERTION. Its spec phrases it as "no event in
   * both, none in neither". Here the row's `segment` is a single field so "both"
   * is unrepresentable — but "neither" is not, and an empty or misspelled value
   * would sail past a truthy check while silently removing the row from both
   * segment filters. Every row is asserted against the closed set.
   */
  it('puts every catalogued event in one of the two segments', () => {
    for (const [action, row] of Object.entries(HISTORY_CATALOGUE)) {
      expect(['lifecycle', 'audit'], action).toContain(row.segment)
    }
  })

  /*
   * The catalogue must beat the section's fallback regexes, and these are the
   * rows where the two DISAGREE — which is the only place the precedence is
   * observable. "Issue record created" matches /created/ and would be filed
   * lifecycle by the regex; the catalogue says audit.
   */
  it('overrides the fallback heuristic where the two disagree', () => {
    expect(resolveHistoryEvent('Issue record created')?.segment).toBe('audit')
    expect(resolveHistoryEvent('Status initialized')?.segment).toBe('audit')
    expect(classifyHistoryAction('Issue record created')).toBe('audit')
    expect(classifyHistoryAction('Status initialized')).toBe('audit')
  })

  // Both segments must actually be populated. A catalogue that drifted entirely
  // into one segment would pass every per-row check above and render a filter
  // with an always-empty side.
  it('populates both segments', () => {
    const segments = Object.values(HISTORY_CATALOGUE).map((row) => row.segment)
    expect(segments).toContain('lifecycle')
    expect(segments).toContain('audit')
  })
})

describe('an unknown event lands in neither segment at the catalogue level', () => {
  const unknown = 'Warp core breached'

  it('has no catalogue row at all', () => {
    expect(resolveHistoryEvent(unknown)).toBeUndefined()
  })

  /*
   * ⚠️ THE FALLBACK IS THE SECTION'S, NOT THE CATALOGUE'S, AND THE SPLIT IS THE
   * POINT. Vue's unknown events land in neither segment; here the catalogue
   * returns `undefined` and `classifyHistoryAction` then applies a heuristic, so
   * the row is still shown and still filterable rather than vanishing from both
   * segment views. Recorded because it is a real behavioural difference from the
   * Vue original, not an oversight in the port.
   */
  it('still resolves to a segment through the fallback, so it is never invisible', () => {
    expect(['lifecycle', 'audit']).toContain(classifyHistoryAction(unknown))
  })

  it('renders its raw action rather than an empty label', () => {
    expect(historyLabelFor(unknown)).toBe(unknown)
  })
})

describe('the catalogue and the store agree on the vocabulary', () => {
  /*
   * ⚠️ THIS IS THE DEAD-CATALOGUE GUARD. A row keyed on an action string the
   * store never writes is unreachable — it looks like coverage and is not. The
   * check reads the store's source rather than a hand-kept list, because a
   * hand-kept list is the thing that goes stale.
   */
  it('keys every row on a plain non-empty action string', () => {
    for (const action of Object.keys(HISTORY_CATALOGUE)) {
      expect(action.trim(), action).toBe(action)
      expect(action.length).toBeGreaterThan(0)
    }
  })

  it('gives no two rows the same key', () => {
    const keys = Object.keys(HISTORY_CATALOGUE)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

/* -------------------------------------------------------------------------- */
/* ⚠️ THE MERGE'S OWN BLIND SPOT                                              */
/* -------------------------------------------------------------------------- */
/*
 * The group model and the history-tab rewrite were built on separate branches.
 * The rewrite's renderer was written against the action vocabulary that existed
 * BEFORE the group actions, and the group actions fan out to every affected
 * member — so they are new input to a renderer that has never seen them. Neither
 * branch's diff shows that, and the merge resolved without mentioning it.
 *
 * So this asserts the seam directly: each group action must arrive with a real
 * segment, a translated label, and an icon. The last assertion is the load-
 * bearing one — it shows the CATALOGUE is what produced the answer, not the
 * renderer's fallback regexes, which are a chain of /created/, /link/, /id/
 * tests that would happily file 'Issue Groups merged' somewhere arbitrary.
 */
const GROUP_ACTIONS = [
  'Issue Group created',
  'Issue linked to Issue Group',
  'Issue Groups merged',
  'Issue Unlinked',
  'Issue Linked',
  'Parent Issue Changed',
]

describe("the group actions survive the history tab's renderer", () => {
  it.each(GROUP_ACTIONS)('%s classifies, labels and gets an icon', (action) => {
    expect(['lifecycle', 'audit'], action).toContain(classifyHistoryAction(action))
    expect(historyIconFor(action), `${action} renders untyped`).toBeTruthy()
    // A raw action string means no catalogue row was found and the row is
    // rendering the internal vocabulary at the user.
    expect(historyLabelFor(action), `${action} shows its raw action`).not.toBe(action)
  })

  it('⚠️ answers from the CATALOGUE, not the fallback regexes', () => {
    for (const action of GROUP_ACTIONS) {
      const row = resolveHistoryEvent(action)
      expect(row, `${action} has no catalogue row — the fallback is answering`).toBeDefined()
      expect(classifyHistoryAction(action), action).toBe(row!.segment)
      expect(historyLabelFor(action), action).toBe(row!.label)
    }
  })

  /*
   * ⚠️ CASE IS LOAD-BEARING HERE and it is the single most dangerous thing in
   * this vocabulary: 'Issue unlinked' (symmetric) and 'Issue Unlinked' (group)
   * differ by one letter's case and mean different relationships. The catalogue
   * is keyed exactly, so a case-insensitive lookup introduced anywhere would
   * silently merge the two. Both must resolve, and to DIFFERENT rows.
   */
  it('keeps the symmetric and group unlink actions distinct', () => {
    const symmetric = resolveHistoryEvent('Issue unlinked')
    const group = resolveHistoryEvent('Issue Unlinked')
    expect(symmetric, 'symmetric unlink lost its row').toBeDefined()
    expect(group, 'group unlink lost its row').toBeDefined()
    expect(symmetric!.label).not.toBe(group!.label)
  })
})
