// CHARACTERISATION tests for the priority matrix.
//
// These pin CURRENT behaviour so a later phase can prove it did not change them.
// They are not specification tests: where the behaviour looks questionable it is
// pinned and the question recorded, never "fixed" here. That is the same role the
// pixel gate plays for rendering.
import { describe, it, expect } from 'vitest'
import {
  priorityLetter,
  priorityTotal,
  findPriorityItem,
  PRIORITY_SCORE_CAP,
  PRIORITY_BANDS,
  PRI_MATRIX,
} from '@/data/priorityMatrix'

describe('priorityLetter — the A/B/C thresholds', () => {
  // The runbook names this one of three domain rules that must survive any
  // rewrite. Every boundary is pinned, including both sides of each.
  it.each([
    [0, 'C'],
    [10, 'C'],
    [11, 'B'],
    [25, 'B'],
    [26, 'A'],
    [100, 'A'],
  ])('score %i -> %s', (total, letter) => {
    expect(priorityLetter(total)).toBe(letter)
  })

  it('boundaries are >=26 for A and >=11 for B, not >25 and >10', () => {
    // Stated separately because the reference table shown to users says
    // "> 25" and "11-24" while the code uses >=26 and >=11. Those agree for
    // integers and would diverge for a fractional score. Pinned as-is.
    expect(priorityLetter(25.5)).toBe('B')
    expect(priorityLetter(26)).toBe('A')
  })

  it('negative totals fall to C rather than throwing', () => {
    expect(priorityLetter(-5)).toBe('C')
  })
})

describe('priorityTotal', () => {
  it('sums the score map', () => {
    expect(priorityTotal({ a: 5, b: 6 })).toBe(11)
  })

  it('treats missing and nullish entries as zero rather than NaN', () => {
    // @ts-expect-error — deliberately passing the shape a caller might produce
    expect(priorityTotal({ a: 5, b: undefined, c: null })).toBe(5)
  })

  it('returns 0 for an empty or absent map', () => {
    expect(priorityTotal({})).toBe(0)
    // @ts-expect-error — the implementation guards with `?? {}`, so this is reachable
    expect(priorityTotal(undefined)).toBe(0)
  })
})

describe('the matrix itself', () => {
  it('PRIORITY_SCORE_CAP is the sum of the highest option in every item', () => {
    const recomputed = PRI_MATRIX.reduce(
      (a, sec) => a + sec.items.reduce((b, it) => b + Math.max(...it.options.map((o) => o.pts)), 0),
      0,
    )
    expect(PRIORITY_SCORE_CAP).toBe(recomputed)
  })

  it('the maximum achievable score reaches band A', () => {
    expect(priorityLetter(PRIORITY_SCORE_CAP)).toBe('A')
  })

  it('every item key is unique across sections', () => {
    const keys = PRI_MATRIX.flatMap((s) => s.items.map((i) => i.key))
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('findPriorityItem resolves every key, and nothing else', () => {
    for (const key of PRI_MATRIX.flatMap((s) => s.items.map((i) => i.key))) {
      expect(findPriorityItem(key)?.key).toBe(key)
    }
    expect(findPriorityItem('no-such-key')).toBeUndefined()
  })

  it('all three bands are defined with day targets', () => {
    expect(Object.keys(PRIORITY_BANDS).sort()).toEqual(['A', 'B', 'C'])
    expect(PRIORITY_BANDS.A.target).toBe(60)
    expect(PRIORITY_BANDS.B.target).toBe(75)
    expect(PRIORITY_BANDS.C.target).toBe(90)
  })
})
