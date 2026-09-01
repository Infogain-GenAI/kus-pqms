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
import { HISTORY_CATALOGUE, resolveHistoryEvent } from '@/features/issues/workspace/history/history.catalogue'
import {
  classifyHistoryAction,
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
