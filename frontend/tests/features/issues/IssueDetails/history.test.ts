// Ported from Vue's `tabs/HistoryTab/history.spec.ts`.
//
// ─── WHAT CARRIED OVER AND WHAT COULD NOT ────────────────────────────────────
//
// Vue's spec drives `IssueAuditEntry`, which carries `eventType`, `category`,
// `changes[]`, `justification`, `before`/`after` and `auto`. This app's
// `AuditEntry` has none of them — it stores an action STRING written at the call
// site, an actor, a role and an optional detail.
//
// So the cases that survive the port are the ones about BEHAVIOUR this app also
// has: AND-ing across filters, inclusive date bounds, what the search covers,
// icon stability, and day grouping with a filtered badge count.
//
// ⚠️ DELIBERATELY NOT PORTED, so nobody looks for them later:
//   • `buildChangeDetail` precedence (changes[] → justification → reason →
//     before/after) — three of those four fields do not exist here.
//   • `resolveActorName` / `isSystemEntry` — there is no system actor and no
//     `auto` flag in this app's audit vocabulary.
//   • The "declared category wins over the catalogue" precedence — this app's
//     entries declare no category, so the catalogue is the only source.
//   • Backend `IssueAuditAction` aliasing (BE-4) — this app writes no wire codes.
import { describe, it, expect } from 'vitest'
import type { AuditEntry } from '@/data/types'
import {
  QUICK_RANGES,
  activeQuickRange,
  classifyHistoryAction,
  groupHistoryByDay,
  historyIconFor,
  historyLabelFor,
  isoDaysBefore,
  matchesHistoryFilters,
  quickRangeValue,
} from '@/features/issues/workspace/history/history'

const TODAY = '2026-07-09'

function entry(over: Partial<AuditEntry> = {}): AuditEntry {
  return {
    id: 'au-1',
    issueId: 'ISS-1',
    actor: 'Arpita Chavda',
    actorRole: 'SE',
    action: 'Issue updated',
    timestamp: `${TODAY}T09:00:00.000Z`,
    ...over,
  }
}

/* -------------------------------------------------------------------------- */
/* Filters                                                                    */
/* -------------------------------------------------------------------------- */

describe('history — filters', () => {
  it('combines segment, search and date as AND', () => {
    const row = entry({ action: 'Issue created', detail: 'brake squeal' })

    expect(
      matchesHistoryFilters(row, {
        segment: 'lifecycle',
        search: 'brake',
        dateFrom: TODAY,
        dateTo: TODAY,
      }),
    ).toBe(true)

    // One failing clause is enough — this is a single predicate, not chained
    // passes that could each let a row through.
    expect(matchesHistoryFilters(row, { segment: 'audit', search: 'brake' })).toBe(false)
    expect(matchesHistoryFilters(row, { segment: 'lifecycle', search: 'clutch' })).toBe(false)
    expect(matchesHistoryFilters(row, { segment: 'lifecycle', dateFrom: '2026-07-10' })).toBe(false)
  })

  /*
   * ⚠️ BOTH BOUNDS ARE INCLUSIVE, AND THIS IS THE ASSERTION THAT PROVES IT.
   * An exclusive `dateTo` silently drops the last day of the range — the hardest
   * filtering bug to see, because the result still looks like a plausible month.
   */
  it('includes entries on the boundary days themselves', () => {
    const first = entry({ timestamp: '2026-07-01T00:00:00.000Z' })
    const last = entry({ timestamp: '2026-07-31T23:59:00.000Z' })

    const july = { dateFrom: '2026-07-01', dateTo: '2026-07-31' }
    expect(matchesHistoryFilters(first, july)).toBe(true)
    expect(matchesHistoryFilters(last, july)).toBe(true)
  })

  it('excludes entries outside the range', () => {
    const june = entry({ timestamp: '2026-06-30T23:59:00.000Z' })
    const august = entry({ timestamp: '2026-08-01T00:00:00.000Z' })

    const july = { dateFrom: '2026-07-01', dateTo: '2026-07-31' }
    expect(matchesHistoryFilters(june, july)).toBe(false)
    expect(matchesHistoryFilters(august, july)).toBe(false)
  })

  /*
   * ⚠️ THE SEARCH MUST COVER THE RENDERED LABEL, NOT ONLY THE STORED ACTION.
   * The store writes "Started investigation"; the row reads "Investigation
   * started". A user who types what they can see finds nothing otherwise, and
   * that reads as missing data rather than as a vocabulary mismatch.
   */
  it('searches the rendered label as well as the raw action', () => {
    const row = entry({ action: 'Started investigation' })

    expect(matchesHistoryFilters(row, { search: 'Investigation started' })).toBe(true)
    expect(matchesHistoryFilters(row, { search: 'Started investigation' })).toBe(true)
  })

  // Vue's spec calls the actor/role coverage "load-bearing": with no role filter
  // in the design, search is the only way to include or exclude by actor.
  it('searches the actor and the role, not just the text', () => {
    const row = entry({ actor: 'Park Soo-jin', actorRole: 'ASM' })

    expect(matchesHistoryFilters(row, { search: 'soo-jin' })).toBe(true)
    expect(matchesHistoryFilters(row, { search: 'ASM' })).toBe(true)
  })

  it('is case-insensitive and ignores surrounding whitespace', () => {
    const row = entry({ detail: 'Brake Squeal' })
    expect(matchesHistoryFilters(row, { search: '  brake SQUEAL ' })).toBe(true)
  })

  it('applies no constraint when a filter is absent', () => {
    expect(matchesHistoryFilters(entry(), {})).toBe(true)
  })
})

/* -------------------------------------------------------------------------- */
/* Classification                                                             */
/* -------------------------------------------------------------------------- */

describe('history — classification', () => {
  it('takes the segment from the catalogue, not from a regex', () => {
    // "Issue record created" matches /created/ — which the fallback regex would
    // file under lifecycle. The catalogue says audit, and the catalogue wins.
    expect(classifyHistoryAction('Issue record created')).toBe('audit')
    expect(classifyHistoryAction('Issue created')).toBe('lifecycle')
  })

  it('falls back for an action the catalogue does not know', () => {
    // Degrades to the old heuristic rather than disappearing or throwing — an
    // action added to the store without a catalogue row still renders.
    expect(classifyHistoryAction('Status recalculated')).toBe('lifecycle')
    expect(classifyHistoryAction('Something entirely new')).toBe('audit')
  })

  /*
   * ⚠️ AC12 / D-38 — ICON STABILITY. The icon is a property of the ENTRY, never
   * of its position in a filtered list. Vue's spec exists because a positional
   * glyph bug shipped there: the first row of any view got a different icon.
   */
  it('resolves the same icon for an entry under every filter', () => {
    const row = entry({ action: 'Parts request' })
    const icon = historyIconFor(row.action)

    expect(historyIconFor(row.action)).toBe(icon)
    // Nothing about position or filtering can reach this function — it takes
    // only the action, which is the structural guarantee behind the assertion.
    expect(historyIconFor('Parts request')).toBe(icon)
  })

  it('gives an uncatalogued action an icon rather than nothing', () => {
    expect(historyIconFor('Something entirely new')).toBeTruthy()
  })

  it('falls back to the raw action when there is no catalogue label', () => {
    expect(historyLabelFor('Started investigation')).toBe('Investigation started')
    expect(historyLabelFor('Something entirely new')).toBe('Something entirely new')
  })
})

/* -------------------------------------------------------------------------- */
/* Quick ranges                                                               */
/* -------------------------------------------------------------------------- */

describe('history — quick ranges', () => {
  /*
   * ⚠️ "LAST 7 DAYS" SPANS SEVEN DAYS INCLUDING TODAY, so it goes back SIX.
   * Going back seven gives an eight-day window — the off-by-one every date
   * preset makes at least once, and it is invisible without this assertion.
   */
  it('counts today as one of the seven', () => {
    expect(quickRangeValue('last7', TODAY)).toEqual({ from: '2026-07-03', to: TODAY })
  })

  it('does the same for 30 and 90', () => {
    expect(quickRangeValue('last30', TODAY)).toEqual({ from: '2026-06-10', to: TODAY })
    expect(quickRangeValue('last90', TODAY)).toEqual({ from: '2026-04-11', to: TODAY })
  })

  // Ends TODAY, not at month end: a history log has no forward extent, so a
  // bound running to the 31st of an unfinished month can never match anything.
  it('runs this month from the 1st to today, not to month end', () => {
    expect(quickRangeValue('thisMonth', TODAY)).toEqual({ from: '2026-07-01', to: TODAY })
  })

  /*
   * ⚠️ DAY 0 OF THIS MONTH IS THE LAST DAY OF THE PREVIOUS ONE. That is what
   * makes this correct without a month-length table.
   */
  it('spans the whole of last month', () => {
    expect(quickRangeValue('lastMonth', TODAY)).toEqual({ from: '2026-06-01', to: '2026-06-30' })
  })

  it('gets February right in a leap year', () => {
    expect(quickRangeValue('lastMonth', '2028-03-15')).toEqual({
      from: '2028-02-01',
      to: '2028-02-29',
    })
  })

  it('rolls back across a year boundary', () => {
    expect(quickRangeValue('lastMonth', '2026-01-10')).toEqual({
      from: '2025-12-01',
      to: '2025-12-31',
    })
  })

  // "No constraint" and "a range that happens to contain everything" behave
  // identically today and diverge the moment an entry is backdated.
  it('resolves All time to no constraint at all', () => {
    expect(quickRangeValue('all', TODAY)).toEqual({})
  })

  it('steps back across a month boundary', () => {
    expect(isoDaysBefore('2026-07-03', 5)).toBe('2026-06-28')
  })
})

describe('history — the active preset', () => {
  it('reports All time for an empty range', () => {
    // Not null: the trigger label reads from this, and a null would render an
    // empty dash for the default state.
    expect(activeQuickRange({}, TODAY)).toBe('all')
  })

  it('recognises each preset from its resolved value', () => {
    for (const preset of QUICK_RANGES) {
      expect(activeQuickRange(quickRangeValue(preset.key, TODAY), TODAY)).toBe(preset.key)
    }
  })

  it('reports null for a range that matches no preset', () => {
    expect(activeQuickRange({ from: '2026-05-04', to: '2026-05-09' }, TODAY)).toBeNull()
  })
})

/* -------------------------------------------------------------------------- */
/* Grouping                                                                   */
/* -------------------------------------------------------------------------- */

describe('history — grouping', () => {
  it('buckets by distance from today', () => {
    const groups = groupHistoryByDay(
      [
        entry({ id: 'a', timestamp: `${TODAY}T09:00:00.000Z` }),
        entry({ id: 'b', timestamp: '2026-07-08T09:00:00.000Z' }),
        entry({ id: 'c', timestamp: '2026-07-05T09:00:00.000Z' }),
        entry({ id: 'd', timestamp: '2026-05-01T09:00:00.000Z' }),
      ],
      TODAY,
    )

    expect(groups.map((g) => g.label)).toEqual(['Today', 'Yesterday', 'Last week', 'Older'])
  })

  /*
   * ⚠️ THE BADGE IS THE FILTERED COUNT, NOT THE DAY'S TOTAL. Narrowing to
   * Lifecycle otherwise shows "12" above three rows, and the user reasonably
   * concludes nine are hidden by a bug.
   */
  it('reports the filtered count, not the day total', () => {
    const all = [
      entry({ id: 'a', action: 'Issue created' }),
      entry({ id: 'b', action: 'Comment added' }),
      entry({ id: 'c', action: 'Comment added' }),
    ]
    const lifecycleOnly = all.filter((e) => matchesHistoryFilters(e, { segment: 'lifecycle' }))

    expect(groupHistoryByDay(all, TODAY)[0].count).toBe(3)
    expect(groupHistoryByDay(lifecycleOnly, TODAY)[0].count).toBe(1)
  })

  /*
   * An entry stamped slightly in the future — a clock skew between the writer
   * and this client — belongs under Today, not in a bucket that does not exist.
   */
  it('puts a future-stamped entry under Today rather than dropping it', () => {
    const groups = groupHistoryByDay([entry({ timestamp: '2026-07-20T09:00:00.000Z' })], TODAY)
    expect(groups.map((g) => g.label)).toEqual(['Today'])
  })

  it('returns no groups for an empty feed', () => {
    expect(groupHistoryByDay([], TODAY)).toEqual([])
  })

  /*
   * ⚠️ THIS APP BUCKETS INTO FOUR BANDS; VUE GROUPS BY CALENDAR DAY. Vue's spec
   * asserts `TODAY` / `YESTERDAY` / `12 AUG 2026` labels and newest-day-first
   * ordering. The shipped design here is the coarse one, so it is kept — this
   * assertion records the divergence rather than leaving a reader to wonder
   * whether the port lost something.
   */
  it('keeps every entry of a band in one group', () => {
    const groups = groupHistoryByDay(
      [
        entry({ id: 'a', timestamp: '2026-07-05T09:00:00.000Z' }),
        entry({ id: 'b', timestamp: '2026-07-04T09:00:00.000Z' }),
      ],
      TODAY,
    )

    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBe('Last week')
    expect(groups[0].entries.map((e) => e.id)).toEqual(['a', 'b'])
  })
})
