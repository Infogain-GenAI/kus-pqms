// Tests for the Request-New-System flow.
//
// WHAT THIS PINS, and why it is not visible on screen: a requested classification
// must LAND SOMEWHERE. The two half-implementations this replaced both failed on
// exactly that point — the Edit form's button was disabled with nothing behind
// it, and Create Issue wrote the requested symptom into one local string that
// reached no store and vanished on unmount. In both cases the UI looked like it
// had accepted a request nobody would ever see.
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { RoleProvider } from '@/data/roles'
import { StoreProvider, useStore } from '@/data/store'

const ACTOR = { name: 'Arpita Chavda', role: 'SE' }
const ISSUE = 'HV-260101'

const wrapper = ({ children }: { children: ReactNode }) => (
  <RoleProvider>
    <StoreProvider>{children}</StoreProvider>
  </RoleProvider>
)

const store = () => renderHook(() => useStore(), { wrapper })

describe('a requested classification enters the taxonomy', () => {
  it('is added immediately, flagged pending', () => {
    const hook = store()
    const before = hook.result.current.classByLevel('system').length

    let id = ''
    act(() => {
      id = hook.result.current.requestClassification(
        { level: 'system', label: 'ADAS / Driver Assistance', justification: 'New programme.' },
        ACTOR,
      ).id
    })

    const systems = hook.result.current.classByLevel('system')
    expect(systems.length).toBe(before + 1)
    const added = systems.find((s) => s.id === id)!
    expect(added.label).toBe('ADAS / Driver Assistance')
    expect(added.pendingApproval).toBe(true)
  })

  // It must be SELECTABLE at once — that is the entire reason the affordance
  // sits inside the form rather than in Admin. A request the user then cannot
  // use has not solved the problem that made them ask.
  it('is immediately selectable from its level', () => {
    const hook = store()
    act(() => {
      hook.result.current.requestClassification(
        { level: 'system', label: 'Thermal Management', justification: 'Needed for EV programme.' },
        ACTOR,
      )
    })
    expect(hook.result.current.classByLevel('system').some((s) => s.label === 'Thermal Management')).toBe(true)
  })

  it('lands under its parent when one is given, not at the root', () => {
    const hook = store()
    const parent = hook.result.current.classByLevel('system')[0]!

    let id = ''
    act(() => {
      id = hook.result.current.requestClassification(
        { level: 'subSystem', parentId: parent.id, label: 'HV Battery Pack', justification: 'Missing sub-system.' },
        ACTOR,
      ).id
    })

    expect(hook.result.current.classChildren(parent.id).some((c) => c.id === id)).toBe(true)
  })

  it('starts at zero issues — a requested node has no history', () => {
    const hook = store()
    let node
    act(() => {
      node = hook.result.current.requestClassification(
        { level: 'symptom', label: 'Latch fails to release', justification: 'Observed in the field.' },
        ACTOR,
      )
    })
    expect(node!.issueCount).toBe(0)
  })

  it('derives a code rather than asking the requester to invent one', () => {
    const hook = store()
    let node
    act(() => {
      node = hook.result.current.requestClassification(
        { level: 'system', label: 'Chassis Control', justification: 'Missing.' },
        ACTOR,
      )
    })
    expect(node!.code).toBe('CHA')
  })
})

describe('the audit trail', () => {
  it('records the request against the issue that prompted it', () => {
    const hook = store()
    act(() => {
      hook.result.current.requestClassification(
        { level: 'system', label: 'ADAS', justification: 'New programme.', issueId: ISSUE },
        ACTOR,
      )
    })

    const [entry] = hook.result.current.auditFor(ISSUE)
    expect(entry!.action).toBe('Classification requested')
    // The justification is the whole of what an approver has to go on, so it
    // must survive into the trail rather than only into the modal.
    expect(entry!.detail).toContain('New programme.')
    expect(entry!.detail).toContain('ADAS')
  })

  it('writes no issue audit when the request came from outside an issue', () => {
    const hook = store()
    const before = hook.result.current.auditFor(ISSUE).length
    act(() => {
      hook.result.current.requestClassification(
        { level: 'system', label: 'Standalone', justification: 'No issue context.' },
        ACTOR,
      )
    })
    expect(hook.result.current.auditFor(ISSUE).length).toBe(before)
  })
})

describe('input handling', () => {
  it('trims the label so a stray space does not create a distinct value', () => {
    const hook = store()
    let node
    act(() => {
      node = hook.result.current.requestClassification(
        { level: 'system', label: '  Padded Name  ', justification: 'x' },
        ACTOR,
      )
    })
    expect(node!.label).toBe('Padded Name')
  })

  it('gives each request its own id', () => {
    const hook = store()
    let a = '', b = ''
    act(() => {
      a = hook.result.current.requestClassification({ level: 'system', label: 'One', justification: 'x' }, ACTOR).id
      b = hook.result.current.requestClassification({ level: 'system', label: 'Two', justification: 'x' }, ACTOR).id
    })
    expect(a).not.toBe(b)
  })
})
