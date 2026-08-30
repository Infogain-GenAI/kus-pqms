// Tests for the multi-row draft modals — "Add parts manually" and
// "Add team member".
//
// ─── THE GAP THESE CLOSE ─────────────────────────────────────────────────────
//
// `ValuePicker`'s inline manual entry takes ONE STRING into the current field
// and forgets it. That is the whole requirement for a VIN. It is not enough for
// a part, which needs a quantity, or a team member, who needs a role and a
// company — and neither can be added several at a time.
//
// The rows also go somewhere different: they join the session DIRECTORY and
// become options for every later activity, which a value typed into the picker
// never does. That difference is the feature.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useState, type ReactNode } from 'react'
import { renderHook, act } from '@testing-library/react'
import { RoleProvider } from '@/data/roles'
import { StoreProvider, useStore } from '@/data/store'
import { ELIGIBLE_PARTS, TEAM_DIRECTORY } from '@/data/investigation'
import { MultiRowDraftModal, type MultiRowColumn } from '@/features/issues/workspace/IssueDetails/investigation/MultiRowDraftModal'
import { AddActivityForm } from '@/features/issues/workspace/IssueDetails/investigation/AddActivityForm'
import { AddPartsManuallyModal } from '@/features/issues/workspace/IssueDetails/investigation/AddPartsManuallyModal'
import { AddTeamMemberModal } from '@/features/issues/workspace/IssueDetails/investigation/AddTeamMemberModal'

const wrapper = ({ children }: { children: ReactNode }) => (
  <RoleProvider>
    <StoreProvider>{children}</StoreProvider>
  </RoleProvider>
)
const store = () => renderHook(() => useStore(), { wrapper }).result

/* -------------------------------------------------------------------------- */
/* The primitive                                                              */
/* -------------------------------------------------------------------------- */

const COLUMNS: MultiRowColumn[] = [
  { key: 'a', label: 'Alpha' },
  { key: 'b', label: 'Beta' },
]

function Primitive({ onSubmit = () => {} }: { onSubmit?: (rows: Record<string, string>[]) => void }) {
  const [open, setOpen] = useState(true)
  return (
    <MultiRowDraftModal
      open={open}
      title="Test modal"
      columns={COLUMNS}
      makeRow={() => ({ a: '', b: '' })}
      addMoreLabel="Add another"
      submitLabel="Submit"
      counterLabel="%n row(s)"
      emptyGuardTitle="Nothing to add"
      emptyGuardBody="Add at least one row."
      incompleteGuardTitle="Some rows are incomplete"
      incompleteGuardBody="Every field is required."
      removeRowLabel="Remove row"
      onClose={() => setOpen(false)}
      onSubmit={onSubmit}
    />
  )
}

const field = (label: string, row = 1) => screen.getByLabelText(`${label} ${row}`)
const rowCount = () => screen.getAllByLabelText(/^Alpha \d+$/).length

describe('the primitive: rows', () => {
  it('opens with exactly one blank row', () => {
    render(<Primitive />)
    expect(rowCount()).toBe(1)
    expect((field('Alpha') as HTMLInputElement).value).toBe('')
  })

  it('adds a row on demand and counts them', () => {
    render(<Primitive />)
    fireEvent.click(screen.getByTestId('multi-row-add'))
    expect(rowCount()).toBe(2)
    expect(screen.getByText('2 row(s)')).toBeTruthy()
  })

  it('removes a row', () => {
    render(<Primitive />)
    fireEvent.click(screen.getByTestId('multi-row-add'))
    fireEvent.click(screen.getByLabelText('Remove row 2'))
    expect(rowCount()).toBe(1)
  })

  it('REFUSES to remove the last row — the control says so rather than vanishing', () => {
    // Enforced in the handler, not only on `disabled`, so a programmatic call
    // cannot empty the form into a state the submit guards must then catch.
    render(<Primitive />)
    const remove = screen.getByLabelText('Remove row 1') as HTMLButtonElement
    expect(remove.disabled).toBe(true)

    fireEvent.click(remove)
    expect(rowCount()).toBe(1)
  })
})

describe('the primitive: submit guards', () => {
  it('blocks an incomplete row and marks the EMPTY FIELD, not the whole row', () => {
    // A row-wide border says only "somewhere here"; the user needs to know which
    // cell to fill.
    const submitted: unknown[] = []
    render(<Primitive onSubmit={(r) => submitted.push(r)} />)

    fireEvent.change(field('Alpha'), { target: { value: 'filled' } })
    fireEvent.click(screen.getByTestId('multi-row-submit'))

    expect(submitted).toHaveLength(0)
    expect(screen.getByTestId('multi-row-guard-incomplete')).toBeTruthy()
    expect(field('Beta').getAttribute('aria-invalid')).toBe('true')
    expect(field('Alpha').getAttribute('aria-invalid')).toBe('false')
  })

  it('clears the guard as soon as the user starts fixing it', () => {
    // A red banner over a form already corrected reads as broken.
    render(<Primitive />)
    fireEvent.click(screen.getByTestId('multi-row-submit'))
    expect(screen.getByTestId('multi-row-guard-incomplete')).toBeTruthy()

    fireEvent.change(field('Alpha'), { target: { value: 'x' } })
    expect(screen.queryByTestId('multi-row-guard-incomplete')).toBeNull()
  })

  it('submits complete rows and closes', () => {
    const submitted: Record<string, string>[][] = []
    render(<Primitive onSubmit={(r) => submitted.push(r)} />)

    fireEvent.change(field('Alpha'), { target: { value: 'a1' } })
    fireEvent.change(field('Beta'), { target: { value: 'b1' } })
    fireEvent.click(screen.getByTestId('multi-row-add'))
    fireEvent.change(field('Alpha', 2), { target: { value: 'a2' } })
    fireEvent.change(field('Beta', 2), { target: { value: 'b2' } })
    fireEvent.click(screen.getByTestId('multi-row-submit'))

    expect(submitted[0]).toEqual([
      { a: 'a1', b: 'b1' },
      { a: 'a2', b: 'b2' },
    ])
    expect(screen.queryByTestId('multi-row-draft-modal')).toBeNull()
  })

  it('starts clean when reopened after a cancel', () => {
    function Reopenable() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button onClick={() => setOpen(true)}>reopen</button>
          <MultiRowDraftModal
            open={open}
            title="t"
            columns={COLUMNS}
            makeRow={() => ({ a: '', b: '' })}
            addMoreLabel="Add another"
            submitLabel="Submit"
            counterLabel="%n row(s)"
            emptyGuardTitle="e"
            emptyGuardBody="e"
            incompleteGuardTitle="i"
            incompleteGuardBody="i"
            removeRowLabel="Remove row"
            onClose={() => setOpen(false)}
            onSubmit={() => {}}
          />
        </>
      )
    }
    render(<Reopenable />)
    fireEvent.change(field('Alpha'), { target: { value: 'abandoned' } })
    fireEvent.click(screen.getByText('Cancel'))
    fireEvent.click(screen.getByText('reopen'))

    expect((field('Alpha') as HTMLInputElement).value).toBe('')
  })
})

/* -------------------------------------------------------------------------- */
/* The directory the rows join                                                */
/* -------------------------------------------------------------------------- */

describe('REGRESSION — manual entry now reaches the shared directory', () => {
  it('adds a part WITH ITS QUANTITY and makes it an option', () => {
    // Inline entry could only capture the part number, leaving a directory row
    // with a blank quantity beside every catalogued row that had one.
    const s = store()
    act(() => {
      s.current.addManualParts([{ partNo: 'ZZ-999', qty: '3' }])
    })

    const added = s.current.partOptions().find((p) => p.partNo === 'ZZ-999')
    expect(added).toMatchObject({ partNo: 'ZZ-999', qty: '3', manual: true })
  })

  it('adds a member WITH role and company', () => {
    const s = store()
    act(() => {
      s.current.addManualTeamMembers([{ name: 'Dana Cho', role: 'TE', company: 'Mando' }])
    })

    expect(s.current.teamDirectory().find((m) => m.name === 'Dana Cho')).toMatchObject({
      role: 'TE',
      company: 'Mando',
      manual: true,
    })
  })

  it('keeps the seeded catalogue intact — additions are additive', () => {
    const s = store()
    act(() => {
      s.current.addManualParts([{ partNo: 'ZZ-1', qty: '1' }])
    })
    for (const seeded of ELIGIBLE_PARTS) {
      expect(s.current.partOptions().map((p) => p.partNo)).toContain(seeded.partNo)
    }
    for (const seeded of TEAM_DIRECTORY) {
      expect(s.current.teamDirectory().map((m) => m.name)).toContain(seeded.name)
    }
  })

  it('does NOT mutate the seed constants — that would leak across sessions', () => {
    // The seed is a module-level readonly array shared by every test in a file;
    // pushing into it would leak one test's additions into the next.
    const before = ELIGIBLE_PARTS.length
    const s = store()
    act(() => {
      s.current.addManualParts([{ partNo: 'ZZ-2', qty: '1' }])
    })
    expect(ELIGIBLE_PARTS.length).toBe(before)
  })

  it('ignores a duplicate rather than adding it twice', () => {
    const s = store()
    const existing = ELIGIBLE_PARTS[0].partNo
    let added: unknown[] = []
    act(() => {
      added = s.current.addManualParts([{ partNo: existing, qty: '9' }])
    })
    // Returns nothing new, and the catalogue still has one of it.
    expect(added).toEqual([])
    expect(s.current.partOptions().filter((p) => p.partNo === existing)).toHaveLength(1)
  })

  it('drops a blank part number', () => {
    const s = store()
    let added: unknown[] = []
    act(() => {
      added = s.current.addManualParts([{ partNo: '   ', qty: '1' }])
    })
    expect(added).toEqual([])
  })
})

/* -------------------------------------------------------------------------- */
/* The two wrappers                                                           */
/* -------------------------------------------------------------------------- */

describe('the wrappers capture the columns their field needs', () => {
  it('the parts modal asks for a part number AND a quantity', () => {
    const rows: unknown[] = []
    render(<AddPartsManuallyModal open onClose={() => {}} onSubmit={(r) => rows.push(r)} />)

    fireEvent.change(screen.getByLabelText('Part number 1'), { target: { value: 'AA-1' } })
    fireEvent.change(screen.getByLabelText('Qty 1'), { target: { value: '2' } })
    fireEvent.click(screen.getByTestId('multi-row-submit'))

    expect(rows[0]).toEqual([{ partNo: 'AA-1', qty: '2' }])
  })

  it('the member modal asks for name, role and company', () => {
    const rows: unknown[] = []
    render(<AddTeamMemberModal open onClose={() => {}} onSubmit={(r) => rows.push(r)} />)

    fireEvent.change(screen.getByLabelText('Name 1'), { target: { value: 'Dana Cho' } })
    fireEvent.change(screen.getByLabelText('Role 1'), { target: { value: 'TE' } })
    fireEvent.change(screen.getByLabelText('Company 1'), { target: { value: 'Mando' } })
    fireEvent.click(screen.getByTestId('multi-row-submit'))

    expect(rows[0]).toEqual([{ name: 'Dana Cho', role: 'TE', company: 'Mando' }])
  })

  it('a part with no quantity is refused — the column is required', async () => {
    const rows: unknown[] = []
    render(<AddPartsManuallyModal open onClose={() => {}} onSubmit={(r) => rows.push(r)} />)

    fireEvent.change(screen.getByLabelText('Part number 1'), { target: { value: 'AA-1' } })
    fireEvent.click(screen.getByTestId('multi-row-submit'))

    await waitFor(() => expect(screen.getByTestId('multi-row-guard-incomplete')).toBeTruthy())
    expect(rows).toHaveLength(0)
  })
})

/* -------------------------------------------------------------------------- */
/* Through the form — inline vs modal                                          */
/* -------------------------------------------------------------------------- */

describe('the two add-paths are wired to the right fields', () => {
  // `ValuePicker` keeps BOTH: inline single-value entry, and a modal trigger.
  // Which one a field gets is the whole distinction this port introduced, so it
  // is checked through the real form rather than by reading props.
  const renderForm = () =>
    render(<AddActivityForm issueId="HV-260101" disabled={false} onSave={() => {}} />, { wrapper })

  const pickType = (type: string) =>
    fireEvent.change(screen.getByLabelText('Activity type'), { target: { value: type } })

  it('Part number opens the MULTI-ROW MODAL, not an inline input', async () => {
    renderForm()
    pickType('PQ Evaluation')
    fireEvent.click(screen.getByText('Add parts manually'))

    await waitFor(() => expect(screen.getByTestId('multi-row-draft-modal')).toBeTruthy())
    expect(screen.getByLabelText('Qty 1')).toBeTruthy()
  })

  it('Team members opens the modal too', async () => {
    renderForm()
    pickType('Joint Investigation')
    fireEvent.click(screen.getByText('Add a team member'))

    await waitFor(() => expect(screen.getByTestId('multi-row-draft-modal')).toBeTruthy())
    expect(screen.getByLabelText('Company 1')).toBeTruthy()
  })

  it('VIN(s) keeps INLINE entry — a VIN is a bare identifier with no columns', () => {
    // Vue's VinsPicker has no manual path at all; React keeps one because this
    // app has no VIN seed data, so it is the only way to enter one. Recorded in
    // PARITY.md as a deliberate divergence.
    renderForm()
    pickType('Dealer Investigation')
    fireEvent.click(screen.getByText('Enter a VIN manually'))

    expect(screen.queryByTestId('multi-row-draft-modal')).toBeNull()
    expect(screen.getByLabelText('Add VIN(s) manually')).toBeTruthy()
  })

  it('a part added through the modal is auto-selected AND joins the picker', async () => {
    // AC17: append, auto-select and clear the error as ONE action. Adding
    // without selecting leaves the user staring at a picker they just fed.
    renderForm()
    pickType('PQ Evaluation')
    fireEvent.click(screen.getByText('Add parts manually'))
    await screen.findByTestId('multi-row-draft-modal')

    fireEvent.change(screen.getByLabelText('Part number 1'), { target: { value: 'QQ-777' } })
    fireEvent.change(screen.getByLabelText('Qty 1'), { target: { value: '5' } })
    fireEvent.click(screen.getByTestId('multi-row-submit'))

    // Selected: it appears as a removable chip on the field.
    await waitFor(() => expect(screen.getByLabelText('Remove QQ-777')).toBeTruthy())
  })
})
