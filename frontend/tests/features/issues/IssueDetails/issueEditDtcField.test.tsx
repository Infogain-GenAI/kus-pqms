// Issue Edit's DTC field, now the same chip input Issue Entry uses.
//
// ⚠️ WHAT HAD TO BE ESTABLISHED BEFORE CONVERTING IT. The field held a `string`
// (`dtcCodes.join(', ')`) edited through a plain `<Input>`, while `onSave` has
// always taken `dtcCodes: string[]` — so the string was only ever an input
// representation. The conversion is therefore confined to the field, but that
// claim is worth asserting rather than believing: stored values must ROUND-TRIP
// (an array arrives as chips and leaves as the same array), and the save payload's
// shape must not change.
//
// ⚠️ AND THE PASTE FIX HAD TO LAND FIRST. Porting the component before fixing it
// would have spread a live defect onto a screen whose plain input handled that
// input correctly — making one thing worse in the name of consistency. The last
// describe here is the regression guard for that on THIS surface.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { RoleProvider } from '@/data/roles'
import { StoreProvider, useStore } from '@/data/store'
import { IssueEditForm } from '@/features/issues/workspace/IssueDetails/IssueEditForm/IssueEditForm'
import messages from '@/features/issues/workspace/IssueDetail.i18n'

const M = messages.en

/** Seeded with three DTC codes — the round-trip subject. */
const SUBJECT = 'PT-260014'
const SEEDED = ['P0301', 'P0420', 'C1234']

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)

type Saved = { dtcCodes: string[] } & Record<string, unknown>

function mount() {
  const saves: Saved[] = []
  const Harness = () => {
    const store = useStore()
    const issue = store.getIssue(SUBJECT)
    if (!issue) return null
    return (
      <IssueEditForm
        issue={issue}
        channels={issue.sourceChannels ?? []}
        onCancel={() => {}}
        onSave={(payload) => saves.push(payload as Saved)}
      />
    )
  }
  render(<Harness />, { wrapper: Wrapped })
  return { saves: () => saves }
}

const dtcInput = () => screen.getByRole('textbox', { name: M.editFormDtc }) as HTMLInputElement
const saveBtn = () => screen.getByTestId('edit-form-save') as HTMLButtonElement
const body = () => document.body.textContent ?? ''

describe('the field is the chip input, not a comma-separated box', () => {
  it('renders one chip per stored code', () => {
    mount()
    for (const code of SEEDED) {
      expect(screen.getByRole('button', { name: `Remove ${code}` }), `${code} did not render as a chip`).toBeTruthy()
    }
  })

  it('brings its category legend with it, and does not print it twice', () => {
    mount()
    // The chip input's own help text carries the legend...
    expect(body()).toContain('P·Powertrain')
    // ...and the field's old hint is gone, so the legend appears once.
    const occurrences = body().split('P·Powertrain').length - 1
    expect(occurrences, 'the P/B/C/U legend is printed more than once').toBe(1)
  })

  it('shows the category of each stored code', () => {
    mount()
    expect(body()).toContain('Powertrain') // P0301, P0420
    expect(body()).toContain('Chassis') // C1234
  })
})

describe('⚠️ STORED VALUES ROUND-TRIP', () => {
  it('saves the same array back when the codes are untouched', () => {
    const { saves } = mount()
    // Make the form dirty WITHOUT touching DTC, so Save is enabled and the DTC
    // payload can be compared against what was stored.
    /*
     * Targeted by PLACEHOLDER, not by label. The title field is an `<Input>` with
     * a visual `ULabel` that is not associated with it, so it has no accessible
     * name — `getByRole('textbox', { name: … })` cannot find it. Worth stating
     * because the DTC field beside it DOES have one, which makes the asymmetry
     * look like a test mistake rather than a labelling gap in the form.
     */
    fireEvent.change(screen.getByPlaceholderText(/EV6 — HV battery/), {
      target: { value: 'A title long enough to pass validation' },
    })
    fireEvent.click(saveBtn())

    expect(saves().length, 'the form did not save').toBe(1)
    expect(saves()[0].dtcCodes, 'stored codes did not round-trip').toEqual(SEEDED)
  })

  it('an added code reaches the save payload', () => {
    const { saves } = mount()
    fireEvent.change(dtcInput(), { target: { value: 'B1020' } })
    fireEvent.keyDown(dtcInput(), { key: 'Enter' })
    fireEvent.click(saveBtn())
    expect(saves()[0].dtcCodes).toEqual([...SEEDED, 'B1020'])
  })

  it('a removed code leaves the save payload', () => {
    const { saves } = mount()
    fireEvent.click(screen.getByRole('button', { name: 'Remove P0420' }))
    fireEvent.click(saveBtn())
    expect(saves()[0].dtcCodes).toEqual(['P0301', 'C1234'])
  })

  /*
   * Dirty tracking moved from comparing strings to comparing joined arrays, so
   * its MEANING has to be unchanged: editing DTC alone must still enable Save.
   */
  it('a DTC change alone is enough to enable Save', () => {
    mount()
    expect(saveBtn().disabled, 'Save was enabled on an untouched form').toBe(true)
    fireEvent.change(dtcInput(), { target: { value: 'B1020' } })
    fireEvent.keyDown(dtcInput(), { key: 'Enter' })
    expect(saveBtn().disabled, 'a DTC edit did not mark the form dirty').toBe(false)
  })

  it('and re-adding what was removed leaves the form clean again', () => {
    // The inverse, which is what makes the assertion above about DIRTY rather
    // than about "any interaction enables Save".
    mount()
    fireEvent.click(screen.getByRole('button', { name: 'Remove C1234' }))
    expect(saveBtn().disabled).toBe(false)
    fireEvent.change(dtcInput(), { target: { value: 'C1234' } })
    fireEvent.keyDown(dtcInput(), { key: 'Enter' })
    expect(saveBtn().disabled, 'restoring the original codes left the form dirty').toBe(true)
  })
})

describe('⚠️ THE PASTE DEFECT DOES NOT ARRIVE WITH THE COMPONENT', () => {
  /*
   * On the old plain `<Input>` a pasted "P0301,P0302" was parsed correctly by the
   * form's own `split(',')` at save time. The chip input previously committed such
   * a string as ONE fused code, so porting it before fixing it would have
   * REGRESSED this screen. Guarded here, on this surface, not only in the
   * component's own suite.
   */
  it('a pasted list becomes separate codes in the save payload', () => {
    const { saves } = mount()
    fireEvent.change(dtcInput(), { target: { value: 'B1020,U0100' } })
    fireEvent.blur(dtcInput())
    fireEvent.click(saveBtn())
    expect(saves()[0].dtcCodes).toEqual([...SEEDED, 'B1020', 'U0100'])
  })

  it('and no saved code contains a separator', () => {
    const { saves } = mount()
    fireEvent.change(dtcInput(), { target: { value: 'B1020, U0100 ,' } })
    fireEvent.blur(dtcInput())
    fireEvent.click(saveBtn())
    for (const c of saves()[0].dtcCodes) {
      expect(c, `"${c}" reached the save payload with a separator in it`).not.toContain(',')
    }
  })

  it('a pasted duplicate of a stored code does not double it', () => {
    const { saves } = mount()
    fireEvent.change(dtcInput(), { target: { value: 'P0301,B1020' } })
    fireEvent.blur(dtcInput())
    fireEvent.click(saveBtn())
    expect(saves()[0].dtcCodes).toEqual([...SEEDED, 'B1020'])
  })
})
