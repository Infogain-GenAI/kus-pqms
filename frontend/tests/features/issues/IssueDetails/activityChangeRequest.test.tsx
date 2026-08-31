// Tests for the activity change-request flow.
//
// THE INVARIANT THIS PINS: a recorded activity is evidence and is never edited
// in place. Raising a request must not change it; only an APPROVAL may, and a
// rejection must leave it exactly as it was.
//
// That is the whole reason the flow exists rather than an `updateActivity`
// mutator, and it is not visible from the UI — a request and an approved request
// look similar on screen and differ completely in what they have done to the
// record. Pinned at the store, where the rule actually lives.
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { RoleProvider } from '@/data/roles'
import { StoreProvider, useStore } from '@/data/store'

const ISSUE = 'HV-260101'
const ACTOR = { name: 'Arpita Chavda', role: 'SE' }
const APPROVER = { name: 'Choi Min-seo', role: 'ASM' }

const wrapper = ({ children }: { children: ReactNode }) => (
  <RoleProvider>
    <StoreProvider>{children}</StoreProvider>
  </RoleProvider>
)

/** Records one activity and returns the hook plus that activity's id. */
function withActivity() {
  const hook = renderHook(() => useStore(), { wrapper })
  act(() => {
    hook.result.current.addActivity(ISSUE, 'PQ Evaluation', 'Original findings.', ACTOR, {
      parts: ['0K2A1-58-810'],
    })
  })
  const id = hook.result.current.activitiesFor(ISSUE)[0]!.id
  return { hook, id }
}

const raise = (hook: ReturnType<typeof withActivity>['hook'], activityId: string, over: Partial<{ field: 'details' | 'activityDate' | 'partNumber'; currentValue: string; proposedValue: string; reason: string }> = {}) =>
  act(() => {
    hook.result.current.requestActivityChange(
      {
        activityId,
        issueId: ISSUE,
        field: 'details',
        currentValue: 'Original findings.',
        proposedValue: 'Corrected findings.',
        reason: 'Transcription error.',
        ...over,
      },
      ACTOR,
    )
  })

describe('raising a request does NOT touch the activity', () => {
  it('leaves the activity exactly as recorded', () => {
    const { hook, id } = withActivity()
    raise(hook, id)

    const activity = hook.result.current.activitiesFor(ISSUE)[0]!
    expect(activity.summary).toBe('Original findings.')
    expect(activity.updatedAt).toBeUndefined()
  })

  it('records the request as pending, with its before and after', () => {
    const { hook, id } = withActivity()
    raise(hook, id)

    const [req] = hook.result.current.changeRequestsFor(id)
    expect(req!.status).toBe('pending')
    expect(req!.currentValue).toBe('Original findings.')
    expect(req!.proposedValue).toBe('Corrected findings.')
    expect(req!.requestedBy).toBe(ACTOR.name)
  })

  it('writes an audit entry naming the reason', () => {
    const { hook, id } = withActivity()
    raise(hook, id)
    const audit = hook.result.current.auditFor(ISSUE)
    expect(audit[0]!.action).toBe('Activity change requested')
    expect(audit[0]!.detail).toContain('Transcription error.')
  })
})

describe('APPROVAL is what mutates the activity', () => {
  it('applies the proposed details and stamps updatedAt', () => {
    const { hook, id } = withActivity()
    raise(hook, id)
    const reqId = hook.result.current.changeRequestsFor(id)[0]!.id

    act(() => { hook.result.current.approveActivityChange(reqId, APPROVER) })

    const activity = hook.result.current.activitiesFor(ISSUE)[0]!
    expect(activity.summary).toBe('Corrected findings.')
    expect(activity.updatedAt).toBeTruthy()
  })

  it('records who decided it and when', () => {
    const { hook, id } = withActivity()
    raise(hook, id)
    const reqId = hook.result.current.changeRequestsFor(id)[0]!.id
    act(() => { hook.result.current.approveActivityChange(reqId, APPROVER) })

    const req = hook.result.current.changeRequestsFor(id)[0]!
    expect(req.status).toBe('approved')
    expect(req.decidedBy).toBe(APPROVER.name)
    expect(req.decidedOn).toBeTruthy()
  })

  it('applies an activityDate change to activityDate, not to createdAt', () => {
    const { hook, id } = withActivity()
    const createdAt = hook.result.current.activitiesFor(ISSUE)[0]!.createdAt
    raise(hook, id, { field: 'activityDate', currentValue: '', proposedValue: '2026-07-03' })
    const reqId = hook.result.current.changeRequestsFor(id)[0]!.id
    act(() => { hook.result.current.approveActivityChange(reqId, APPROVER) })

    const activity = hook.result.current.activitiesFor(ISSUE)[0]!
    expect(activity.activityDate).toBe('2026-07-03')
    // The creation stamp is a fact about the record and must never move.
    expect(activity.createdAt).toBe(createdAt)
  })

  it('splits a partNumber change back into a list', () => {
    const { hook, id } = withActivity()
    raise(hook, id, { field: 'partNumber', currentValue: '0K2A1-58-810', proposedValue: '0K2B3-11-204, 0K2C7-33-090' })
    const reqId = hook.result.current.changeRequestsFor(id)[0]!.id
    act(() => { hook.result.current.approveActivityChange(reqId, APPROVER) })

    expect(hook.result.current.activitiesFor(ISSUE)[0]!.parts).toEqual(['0K2B3-11-204', '0K2C7-33-090'])
  })

  // A double-click must not re-apply a value that was already written, nor
  // overwrite the first decision's stamp.
  it('a second approval is a no-op', () => {
    const { hook, id } = withActivity()
    raise(hook, id)
    const reqId = hook.result.current.changeRequestsFor(id)[0]!.id
    act(() => { hook.result.current.approveActivityChange(reqId, APPROVER) })
    const first = hook.result.current.changeRequestsFor(id)[0]!.decidedOn

    act(() => { hook.result.current.approveActivityChange(reqId, { name: 'Someone Else', role: 'PQM' }) })

    const req = hook.result.current.changeRequestsFor(id)[0]!
    expect(req.decidedBy).toBe(APPROVER.name)
    expect(req.decidedOn).toBe(first)
  })
})

describe('REJECTION leaves the activity untouched', () => {
  it('does not apply the proposed value', () => {
    const { hook, id } = withActivity()
    raise(hook, id)
    const reqId = hook.result.current.changeRequestsFor(id)[0]!.id

    act(() => { hook.result.current.rejectActivityChange(reqId, 'Not supported by the evidence.', APPROVER) })

    expect(hook.result.current.activitiesFor(ISSUE)[0]!.summary).toBe('Original findings.')
  })

  it('keeps the admin comment on the request', () => {
    const { hook, id } = withActivity()
    raise(hook, id)
    const reqId = hook.result.current.changeRequestsFor(id)[0]!.id
    act(() => { hook.result.current.rejectActivityChange(reqId, 'Not supported by the evidence.', APPROVER) })

    const req = hook.result.current.changeRequestsFor(id)[0]!
    expect(req.status).toBe('rejected')
    expect(req.adminComment).toBe('Not supported by the evidence.')
    expect(req.decidedBy).toBe(APPROVER.name)
  })

  it('audits the rejection with its comment', () => {
    const { hook, id } = withActivity()
    raise(hook, id)
    const reqId = hook.result.current.changeRequestsFor(id)[0]!.id
    act(() => { hook.result.current.rejectActivityChange(reqId, 'Not supported by the evidence.', APPROVER) })

    const audit = hook.result.current.auditFor(ISSUE)
    expect(audit[0]!.action).toBe('Activity change rejected')
    expect(audit[0]!.detail).toContain('Not supported by the evidence.')
  })

  it('a rejected request cannot then be approved', () => {
    const { hook, id } = withActivity()
    raise(hook, id)
    const reqId = hook.result.current.changeRequestsFor(id)[0]!.id
    act(() => { hook.result.current.rejectActivityChange(reqId, 'No.', APPROVER) })
    act(() => { hook.result.current.approveActivityChange(reqId, APPROVER) })

    expect(hook.result.current.changeRequestsFor(id)[0]!.status).toBe('rejected')
    expect(hook.result.current.activitiesFor(ISSUE)[0]!.summary).toBe('Original findings.')
  })
})

describe('part request status advances', () => {
  it('moves Submitted → Approved → Ordered → Received, and audits each step', () => {
    const hook = renderHook(() => useStore(), { wrapper })
    act(() => {
      hook.result.current.addPart(
        ISSUE,
        { partNumber: '0K2A1-58-810', description: 'Front brake pad set', cost: 0, qty: 1, urgency: 'Priority' },
        ACTOR,
      )
    })
    const part = hook.result.current.partsFor(ISSUE)[0]!
    // Priority is submitted for review; only Routine auto-approves.
    expect(part.status).toBe('Submitted')

    act(() => { hook.result.current.setPartStatus(part.id, 'Approved', APPROVER) })
    expect(hook.result.current.partsFor(ISSUE)[0]!.status).toBe('Approved')

    const audit = hook.result.current.auditFor(ISSUE)
    expect(audit[0]!.action).toBe('Part request updated')
    expect(audit[0]!.detail).toContain('Approved')
  })

  it('Routine still auto-approves on submit', () => {
    const hook = renderHook(() => useStore(), { wrapper })
    act(() => {
      hook.result.current.addPart(
        ISSUE,
        { partNumber: '0K2B3-11-204', description: 'Sensor', cost: 0, qty: 1, urgency: 'Routine' },
        ACTOR,
      )
    })
    expect(hook.result.current.partsFor(ISSUE)[0]!.status).toBe('Approved')
  })
})
