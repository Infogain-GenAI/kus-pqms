// Tests for the Zod response schemas that guard the mapper boundary.
//
// ─── WHAT THESE ARE ACTUALLY FOR ─────────────────────────────────────────────
//
// 05's stated reason for the schemas is a failure mode, not a shape: *"A mapper
// without schema validation does not fail when the backend drifts; it produces
// `undefined` deep inside a component, far from the cause."* So the tests that
// matter are the REJECTION ones. A test that only proves a valid payload parses
// would pass just as happily against `z.any()`, which is exactly the schema that
// would not have caught the bug.
import { describe, it, expect } from 'vitest'
import {
  backendIssuePageSchema,
  backendIssueSummarySchema,
  parseResponse,
} from '@/services/issue.schemas'
import { backendNotificationPageSchema } from '@/services/notification.schemas'

const validIssue = {
  issueId: 'ISS-1',
  title: 'Brake squeal',
  status: 'OPEN',
}

describe('issue response schemas', () => {
  it('accepts a minimal valid row', () => {
    expect(backendIssueSummarySchema.parse(validIssue)).toMatchObject({ issueId: 'ISS-1' })
  })

  it('rejects a row whose required field has the wrong type', () => {
    expect(() => backendIssueSummarySchema.parse({ ...validIssue, title: 42 })).toThrow()
  })

  it('rejects a row missing a required field', () => {
    const { status, ...withoutStatus } = validIssue
    void status
    expect(() => backendIssueSummarySchema.parse(withoutStatus)).toThrow()
  })

  // The `.strict()` half. A backend that RENAMES a field produces one unknown
  // key and one missing key; without strict mode only the missing half is seen,
  // and if the field were optional neither half would be — the rename would pass
  // silently and the value would vanish. This is the test for that.
  it('rejects an unknown key rather than dropping it', () => {
    expect(() => backendIssueSummarySchema.parse({ ...validIssue, ownerUserID: 'u1' })).toThrow()
  })

  // 05's first named leniency exception. Asserted explicitly so that tightening
  // it — which would reject every response the real backend currently sends —
  // fails here with a test that says why, rather than in the browser.
  it('accepts a row with no ownerUserId — 05s first named exception', () => {
    expect(() => backendIssueSummarySchema.parse(validIssue)).not.toThrow()
  })

  it('validates page rows element by element', () => {
    const page = { content: [validIssue, { ...validIssue, status: null }], totalElements: 2 }
    expect(() => backendIssuePageSchema.parse(page)).toThrow()
  })
})

describe('parseResponse', () => {
  it('returns the parsed value on success', () => {
    const page = { content: [validIssue], totalElements: 1 }
    expect(parseResponse(backendIssuePageSchema, page, 'GET /issues').content).toHaveLength(1)
  })

  // The endpoint name is the whole point of the wrapper: a bare ZodError says a
  // field is wrong but not which of six endpoints returned it, and the stack at
  // that moment is inside Zod rather than inside the caller.
  it('names the endpoint and the failing field in the error', () => {
    expect(() => parseResponse(backendIssuePageSchema, { content: [] }, 'GET /issues')).toThrow(
      /GET \/issues/,
    )
    expect(() => parseResponse(backendIssuePageSchema, { content: [] }, 'GET /issues')).toThrow(
      /totalElements/,
    )
  })
})

describe('notification response schema', () => {
  const validNotification = {
    id: 'N-1',
    category: 'CRITICAL',
    message: 'Issue escalated',
    read: false,
    createdAt: '2026-08-31T00:00:00Z',
  }

  it('accepts a valid page', () => {
    expect(
      backendNotificationPageSchema.parse({ content: [validNotification], unreadCount: 1 }),
    ).toMatchObject({ unreadCount: 1 })
  })

  it('rejects a row with a non-boolean read flag', () => {
    expect(() =>
      backendNotificationPageSchema.parse({ content: [{ ...validNotification, read: 'no' }] }),
    ).toThrow()
  })

  // No leniency here — 05 permits exactly three lenient fields across the API and
  // all three are on the issue endpoints. This asserts the notification schema
  // has not quietly acquired a fourth.
  it('rejects an unknown key', () => {
    expect(() =>
      backendNotificationPageSchema.parse({ content: [{ ...validNotification, seen: true }] }),
    ).toThrow()
  })
})
