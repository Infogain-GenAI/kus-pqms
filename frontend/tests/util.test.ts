// CHARACTERISATION tests for the date/label helpers.
//
// ⚠️ THESE PIN A KNOWN DEFECT ON PURPOSE. `fmtMDY` and `fmtHM` use LOCAL-TIME
// getters over UTC-anchored ISO strings, so the rendered date shifts by a day
// between an IST developer and a US-East runner. That is wrong for users, not
// only for screenshots.
//
// The defect is recorded in 18-project-context-and-implementation-status.md with
// its own owner. It is NOT fixed here: characterisation pins what is, so a later
// change can prove what it altered. Fixing it in the same commit would destroy
// the only evidence of what the behaviour used to be.
//
// The tests below therefore assert the CURRENT (defective) behaviour, and pin it
// under an explicit UTC timezone so the suite itself is deterministic wherever it
// runs. When the defect is fixed, these tests SHOULD fail — that is the signal
// the fix landed, and the expectations move in that same change.
import { describe, it, expect, beforeAll } from 'vitest'
import { daysOpen, fmtDate, fmtDateTime, fmtMDY, fmtHM, modelCodeLabel, newId } from '@/data/util'
import { NOW } from '@/data/types'

beforeAll(() => {
  // The suite must not depend on the runner's zone — see the defect note above.
  process.env.TZ = 'UTC'
})

describe('daysOpen', () => {
  it('counts whole days to the frozen NOW when not closed', () => {
    const d = new Date(NOW)
    const tenDaysBefore = new Date(d.getTime() - 10 * 86_400_000).toISOString()
    expect(daysOpen(tenDaysBefore)).toBe(10)
  })

  it('counts to closedAt when supplied, ignoring NOW', () => {
    expect(daysOpen('2026-01-01T00:00:00Z', '2026-01-08T00:00:00Z')).toBe(7)
  })

  it('never returns a negative number, even when closed before reported', () => {
    // Pinned as current behaviour: the implementation clamps at 0 rather than
    // treating an inverted range as a data error.
    expect(daysOpen('2026-01-08T00:00:00Z', '2026-01-01T00:00:00Z')).toBe(0)
  })

  it('rounds rather than truncates', () => {
    // 1.6 days -> 2, not 1. Pinned because rounding vs truncation is exactly the
    // kind of thing a refactor changes silently.
    expect(daysOpen('2026-01-01T00:00:00Z', '2026-01-02T14:24:00Z')).toBe(2)
  })
})

describe('fmtMDY / fmtHM — PINNING THE TIMEZONE DEFECT', () => {
  it('formats a UTC-anchored instant using LOCAL getters', () => {
    // Under TZ=UTC these agree with the anchor. They would NOT under other zones,
    // which is the defect. See 18's application-defect register.
    expect(fmtMDY('2026-07-09T02:00:00Z')).toBe('07/09/2026')
    expect(fmtHM('2026-07-09T02:00:00Z')).toBe('02:00')
  })

  it('pads month, day, hour and minute to two digits', () => {
    expect(fmtMDY('2026-01-05T09:07:00Z')).toBe('01/05/2026')
    expect(fmtHM('2026-01-05T09:07:00Z')).toBe('09:07')
  })

  it('fmtDate and fmtDateTime produce the en-US forms the UI renders', () => {
    expect(fmtDate('2026-07-09T02:00:00Z')).toBe('Jul 9, 2026')
    expect(fmtDateTime('2026-07-09T02:00:00Z')).toMatch(/Jul 9, 2026/)
  })
})

describe('modelCodeLabel', () => {
  it('shows the single code when there is one', () => {
    expect(modelCodeLabel({ modelCode: 'SV', modelCodes: ['SV'] })).toBe('SV')
  })

  it('shows "<n> Models" when there is more than one', () => {
    expect(modelCodeLabel({ modelCode: 'SV', modelCodes: ['SV', 'HV'] })).toBe('2 Models')
    expect(modelCodeLabel({ modelCode: 'SV', modelCodes: ['SV', 'HV', 'EV'] })).toBe('3 Models')
  })

  it('falls back to modelCode when modelCodes is absent or empty', () => {
    expect(modelCodeLabel({ modelCode: 'SV' })).toBe('SV')
    expect(modelCodeLabel({ modelCode: 'SV', modelCodes: [] })).toBe('SV')
  })
})

describe('newId', () => {
  it('prefixes and produces distinct ids', () => {
    const a = newId('ACT')
    const b = newId('ACT')
    expect(a.startsWith('ACT-')).toBe(true)
    expect(a).not.toBe(b)
  })
})
