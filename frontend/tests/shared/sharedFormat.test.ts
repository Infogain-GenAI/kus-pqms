// Tests for the shared formatting utilities.
//
// ─── THE SUITE RUNS IN America/New_York — see tests/support/setup.ts ─────────
//
// That is what makes the date block below mean anything. The bug these tests
// pin is invisible east of UTC, and this project is developed in Asia/Calcutta,
// so a test inheriting the machine's zone would have passed against the broken
// implementation. Every date assertion here fails under the old code and passes
// under the new one, in the zone the users are actually in.
import { describe, it, expect } from 'vitest'
import {
  fmtDate,
  fmtDateTime,
  fmtHM,
  fmtMD,
  fmtMDY,
  parseCalendarDate,
  toLocalIsoDate,
} from '@/shared/format/date'
import { formatFileSize } from '@/shared/format/fileSize'

describe('the suite is pinned west of UTC, which is the point', () => {
  it('runs in America/New_York', () => {
    // If this ever fails, every assertion below has quietly stopped testing the
    // thing it was written for.
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('America/New_York')
  })

  it('reproduces the raw platform behaviour these formatters had to work around', () => {
    // Not testing our code — testing the premise. `new Date(date-only)` is UTC
    // midnight per spec, so local getters read the day before.
    expect(new Date('2026-06-16').getDate()).toBe(15)
  })
})

describe('REGRESSION — a date-only string rendered a day early', () => {
  // `Issue.reportedDate` is date-only throughout the seed, so this was firing on
  // essentially every date the application displayed.
  it('formats a bare YYYY-MM-DD as the day it names', () => {
    expect(fmtMDY('2026-06-16')).toBe('06/16/2026')
    expect(fmtDate('2026-06-16')).toBe('Jun 16, 2026')
    expect(fmtMD('2026-06-16')).toBe('Jun 16')
  })

  it('does not shift the YEAR on 1 January', () => {
    // The worst version of the same bug: an issue reported on New Year's Day
    // rendered as 12/31 of the PREVIOUS year.
    expect(fmtMDY('2026-01-01')).toBe('01/01/2026')
    expect(fmtDate('2026-01-01')).toBe('Jan 1, 2026')
  })

  it('parses a date-only string into the local calendar date', () => {
    const d = parseCalendarDate('2026-06-16')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(5)
    expect(d.getDate()).toBe(16)
    // Local midnight, not UTC midnight — that is the whole fix.
    expect(d.getHours()).toBe(0)
  })
})

describe('strings that carry a time are real instants and stay untouched', () => {
  it('converts a UTC timestamp into local time, as it should', () => {
    // 08:52 UTC is 04:52 in New York (EDT). This is CORRECT behaviour, not the
    // bug above: an instant genuinely happens at a different clock time here.
    expect(fmtHM('2026-07-09T08:52:00Z')).toBe('04:52')
    expect(fmtMDY('2026-07-09T08:52:00Z')).toBe('07/09/2026')
  })

  it('formats a datetime with both parts', () => {
    const out = fmtDateTime('2026-07-09T08:52:00Z')
    expect(out).toContain('Jul 9, 2026')
    expect(out).toContain('04:52')
  })
})

describe('invalid input renders blank, never NaN', () => {
  // "NaN/NaN/NaN" on screen reads as a broken application and costs someone a
  // bug report; a blank cell reads as "no date recorded".
  it.each(['', 'not a date', '2026-13-45', '2026-02-30'])('returns "" for %j', (bad) => {
    expect(fmtMDY(bad)).toBe('')
    expect(fmtDate(bad)).toBe('')
    expect(fmtHM(bad)).toBe('')
    expect(fmtMD(bad)).toBe('')
    expect(fmtDateTime(bad)).toBe('')
  })

  it('rejects an out-of-range date instead of rolling it over', () => {
    // `new Date(2026, 12, 45)` would silently produce a date in 2027. Detecting
    // that requires reading the parts back, which is what the parser does.
    expect(Number.isNaN(parseCalendarDate('2026-13-45').getTime())).toBe(true)
  })
})

describe('toLocalIsoDate writes the local day, not the UTC one', () => {
  it('round-trips a local calendar date', () => {
    expect(toLocalIsoDate(parseCalendarDate('2026-06-16'))).toBe('2026-06-16')
  })

  it('emits the LOCAL day for a late-evening local time', () => {
    // 23:30 local on the 16th is already the 17th in UTC. `toISOString().slice(0,10)`
    // would emit "2026-06-17" — the read-side bug, in reverse.
    expect(toLocalIsoDate(new Date(2026, 5, 16, 23, 30))).toBe('2026-06-16')
  })

  it('pads single-digit months and days', () => {
    expect(toLocalIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('formatFileSize', () => {
  it('uses bytes below 1 KB', () => {
    expect(formatFileSize(0)).toBe('0 B')
    expect(formatFileSize(1023)).toBe('1023 B')
  })

  it('switches to KB at 1024 and rounds — this app shows no decimal there', () => {
    // Vue renders "1.5 KB"; this app rounds. Kept as-is deliberately, so that
    // extracting the duplicate did not change what every attachment row says.
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1536)).toBe('2 KB')
  })

  it('switches to MB at 1024 KB and keeps one decimal', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
    expect(formatFileSize(Math.round(2.5 * 1024 * 1024))).toBe('2.5 MB')
  })
})
