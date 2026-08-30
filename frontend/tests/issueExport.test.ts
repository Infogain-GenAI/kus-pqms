// Tests for the issue-list export.
//
// The export is the one feature whose output nobody looks at in the app — it
// lands in a file and is opened somewhere else. So the column contract is
// pinned here rather than trusted: a renamed or dropped column is invisible in
// every screenshot and every manual pass.
import { describe, it, expect } from 'vitest'
import { buildExportRows, exportFilename } from '@/features/issues/issue-list/issue-export'
import { ISSUES } from '@/data/seed'

const EXPECTED_COLUMNS = [
  'Issue ID',
  'Title',
  'Model Code',
  'Source',
  'Model',
  'Model Year',
  'System',
  'Component',
  'Symptom',
  'Status',
  'Days open',
  'Owner',
  'Linked',
  'EWS flag',
  'Created',
]

describe('the exported column set', () => {
  it('is exactly the agreed columns, in order', () => {
    const [row] = buildExportRows(ISSUES.slice(0, 1))
    expect(Object.keys(row!)).toEqual(EXPECTED_COLUMNS)
  })

  it('produces one row per issue', () => {
    expect(buildExportRows(ISSUES).length).toBe(ISSUES.length)
  })

  it('is empty for an empty selection rather than throwing', () => {
    expect(buildExportRows([])).toEqual([])
  })
})

describe('the values a spreadsheet actually receives', () => {
  it('never emits undefined — an unset field exports as blank', () => {
    // A JS `undefined` in a cell renders as the literal text "undefined" in
    // Excel, which reads as data rather than as an empty field.
    for (const row of buildExportRows(ISSUES)) {
      for (const [key, value] of Object.entries(row)) {
        expect(value, `${key} must not be undefined`).not.toBeUndefined()
        expect(String(value)).not.toBe('undefined')
      }
    }
  })

  it('joins multi-valued fields rather than dropping the extras', () => {
    const multi = ISSUES.find((i) => (i.sources?.length ?? 0) > 1 || (i.linkedIssueIds?.length ?? 0) > 1)
    if (!multi) return
    const [row] = buildExportRows([multi])
    if ((multi.sources?.length ?? 0) > 1) {
      for (const s of multi.sources!) expect(String(row!.Source)).toContain(s)
    }
    if ((multi.linkedIssueIds?.length ?? 0) > 1) {
      for (const id of multi.linkedIssueIds!) expect(String(row!.Linked)).toContain(id)
    }
  })

  it('renders the EWS flag as a word, not a boolean', () => {
    for (const row of buildExportRows(ISSUES)) {
      expect(['Yes', 'No']).toContain(row['EWS flag'])
    }
  })

  it('exports Days open as a number so it sorts numerically', () => {
    for (const row of buildExportRows(ISSUES)) {
      expect(typeof row['Days open']).toBe('number')
    }
  })
})

describe('the filename', () => {
  it('is dated, so successive exports do not overwrite each other', () => {
    expect(exportFilename()).toMatch(/^issues-\d{4}-\d{2}-\d{2}\.csv$/)
  })

  it('carries a caller-supplied prefix', () => {
    expect(exportFilename('issues-selected')).toMatch(/^issues-selected-\d{4}-\d{2}-\d{2}\.csv$/)
  })
})
