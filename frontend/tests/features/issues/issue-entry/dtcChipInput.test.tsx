// DTC chip entry — the four commit paths, removal, and the catalogue search.
//
// ⚠️ EVERY ASSERTION READS THE COMMITTED VALUE, NEVER "a handler ran". A chip
// input is full of shapes that pass while doing nothing: Enter and blur both
// LOOK like they commit when only one does, backspace-removal silently no-ops
// when the draft is non-empty, and a suggestion click can be eaten by the input's
// own blur firing first. A test that observes the callback rather than the
// resulting array cannot tell any of those apart.
//
// ⚠️ AND THE HARNESS IS CONTROLLED ON PURPOSE. `codes` is a prop; the component
// holds no list of its own. Rendering it with a fixed array would make
// de-duplication, backspace-removal and every multi-step sequence assert against
// a value that never changes — passing while proving nothing. State lives in the
// harness so the component sees its own output, as it does in the form.
import { describe, it, expect } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DtcChipInput } from '@/features/issues/issue-entry/DtcChipInput'

const LABEL = 'DTC codes'

/** Real catalogue entries — invented codes would not exercise the lookup. */
const CATALOGUED = 'P0301'
const CATALOGUED_DESC = 'Cylinder 1 Misfire Detected'
const BODY_CODE = 'B1020'

function setup(initial: string[] = []) {
  /** The last value the component committed, so assertions read the array. */
  let latest: string[] = initial
  const Harness = () => {
    const [codes, setCodes] = useState<string[]>(initial)
    latest = codes
    return <DtcChipInput codes={codes} onChange={setCodes} aria-label={LABEL} />
  }
  const view = render(<Harness />)
  return { ...view, codes: () => latest }
}

const input = () => screen.getByRole('textbox', { name: LABEL }) as HTMLInputElement
const type = (value: string) => fireEvent.change(input(), { target: { value } })
const options = () => screen.queryAllByRole('option')

describe('the four ways a code gets committed', () => {
  /*
   * All four are separate code paths in the same component, and the design
   * commits on all of them. Testing one and assuming the rest is how three
   * broken paths hide behind one working one.
   */
  it('commits on Enter', () => {
    const { codes } = setup()
    type(CATALOGUED)
    fireEvent.keyDown(input(), { key: 'Enter' })
    expect(codes()).toEqual([CATALOGUED])
    expect(input().value, 'the draft was not cleared').toBe('')
  })

  it('commits on comma — the habit from the old comma-separated field', () => {
    const { codes } = setup()
    type(CATALOGUED)
    fireEvent.keyDown(input(), { key: ',' })
    expect(codes()).toEqual([CATALOGUED])
  })

  it('commits on Tab, so leaving the field by keyboard does not lose it', () => {
    const { codes } = setup()
    type(BODY_CODE)
    fireEvent.keyDown(input(), { key: 'Tab' })
    expect(codes()).toEqual([BODY_CODE])
  })

  it('commits on blur — a half-typed code must not vanish on click-away', () => {
    const { codes } = setup()
    type(BODY_CODE)
    fireEvent.blur(input())
    expect(codes(), 'blur discarded the draft instead of committing it').toEqual([BODY_CODE])
  })
})

describe('what a commit normalises, and what it refuses', () => {
  it('uppercases, so case cannot create two chips for one code', () => {
    const { codes } = setup()
    type('p0301')
    fireEvent.keyDown(input(), { key: 'Enter' })
    expect(codes()).toEqual(['P0301'])
  })

  it('trims surrounding whitespace', () => {
    const { codes } = setup()
    type('  P0420  ')
    fireEvent.keyDown(input(), { key: 'Enter' })
    expect(codes()).toEqual(['P0420'])
  })

  it('refuses a duplicate, including one differing only by case', () => {
    const { codes } = setup([CATALOGUED])
    type(CATALOGUED.toLowerCase())
    fireEvent.keyDown(input(), { key: 'Enter' })
    expect(codes(), 'a duplicate was added').toEqual([CATALOGUED])
    // The draft still clears — the code is already there, so there is nothing
    // for the user to correct and leaving it would look like a failure.
    expect(input().value).toBe('')
  })

  it('refuses an empty or whitespace-only draft on every path', () => {
    const { codes } = setup()
    for (const key of ['Enter', ',', 'Tab']) {
      type('   ')
      fireEvent.keyDown(input(), { key })
      expect(codes(), `${key} committed whitespace`).toEqual([])
    }
    type('   ')
    fireEvent.blur(input())
    expect(codes(), 'blur committed whitespace').toEqual([])
  })

  it('keeps the order codes were entered in', () => {
    const { codes } = setup()
    for (const c of ['P0301', 'B1020', 'P0420']) {
      type(c)
      fireEvent.keyDown(input(), { key: 'Enter' })
    }
    expect(codes()).toEqual(['P0301', 'B1020', 'P0420'])
  })
})

describe('⚠️ BACKSPACE REMOVAL — the path that no-ops silently', () => {
  it('removes the last chip when the draft is empty', () => {
    const { codes } = setup(['P0301', 'B1020'])
    fireEvent.keyDown(input(), { key: 'Backspace' })
    expect(codes()).toEqual(['P0301'])
  })

  /*
   * The guard that matters. Without `!draft` the key would delete a chip while
   * the user was mid-word — and a test that only checks the empty-draft case
   * would never see it, because that case passes either way.
   */
  it('does NOT remove a chip while the draft has text', () => {
    const { codes } = setup(['P0301', 'B1020'])
    type('P04')
    fireEvent.keyDown(input(), { key: 'Backspace' })
    expect(codes(), 'backspace ate a chip mid-word').toEqual(['P0301', 'B1020'])
  })

  it('does nothing on an empty field with no chips', () => {
    const { codes } = setup()
    fireEvent.keyDown(input(), { key: 'Backspace' })
    expect(codes()).toEqual([])
  })

  it('ignores keys that are neither a commit key nor Backspace', () => {
    const { codes } = setup(['P0301'])
    type('P04')
    fireEvent.keyDown(input(), { key: 'a' })
    fireEvent.keyDown(input(), { key: 'ArrowLeft' })
    expect(codes()).toEqual(['P0301'])
    expect(input().value, 'an unrelated key changed the draft').toBe('P04')
  })
})

describe('removing a chip by its own button', () => {
  it('removes THAT code, not the last one', () => {
    const { codes } = setup(['P0301', 'B1020', 'P0420'])
    fireEvent.click(screen.getByRole('button', { name: 'Remove B1020' }))
    expect(codes()).toEqual(['P0301', 'P0420'])
  })

  /*
   * The chip sits inside a row whose click handler focuses the input. Without
   * `stopPropagation` the removal would also refocus, which is harmless here but
   * is the same omission that makes nested controls fight elsewhere — and the
   * assertion is cheap.
   */
  it('leaves the draft alone', () => {
    setup(['P0301'])
    type('P04')
    fireEvent.click(screen.getByRole('button', { name: 'Remove P0301' }))
    expect(input().value).toBe('P04')
  })
})

describe('the catalogue search', () => {
  it('shows nothing until the field is focused', () => {
    setup()
    type(CATALOGUED)
    // `showSuggestions` requires focus as well as matches.
    expect(options().length, 'suggestions appeared without focus').toBe(0)
  })

  it('suggests by CODE', () => {
    setup()
    fireEvent.focus(input())
    type('P030')
    expect(options().length).toBeGreaterThan(0)
    expect(document.body.textContent).toContain(CATALOGUED)
  })

  /*
   * ⚠️ DESCRIPTION SEARCH IS THE CAPABILITY THE COMPONENT WAS MISSING, and it is
   * the reason the description is rendered at all. "misfire" matches no code.
   */
  it('suggests by DESCRIPTION, and shows the description it matched on', () => {
    setup()
    fireEvent.focus(input())
    type('misfire')
    expect(options().length, 'description search returned nothing').toBeGreaterThan(0)
    expect(document.body.textContent).toContain(CATALOGUED_DESC)
  })

  it('offers nothing for an empty draft', () => {
    setup()
    fireEvent.focus(input())
    type('')
    expect(options().length).toBe(0)
  })

  it('never offers a code already committed', () => {
    setup([CATALOGUED])
    fireEvent.focus(input())
    type('P030')
    const shown = options().map((o) => o.textContent ?? '')
    expect(
      shown.some((t) => t.startsWith(CATALOGUED)),
      'an already-entered code was offered again',
    ).toBe(false)
  })

  /*
   * ⚠️ mouseDown, NOT click. The input's blur fires first on a plain click,
   * committing the draft and closing the panel before a click handler could run —
   * so the component binds onMouseDown with preventDefault. A test firing `click`
   * would pass for the wrong reason: the draft would commit via blur and the
   * resulting chip would look like the suggestion working.
   */
  it('commits the suggestion that was pressed, not the draft', () => {
    const { codes } = setup()
    fireEvent.focus(input())
    type('misfire')
    fireEvent.mouseDown(options()[0])
    // 'MISFIRE' would be the draft committing; P0301 is the suggestion.
    expect(codes()).toEqual([CATALOGUED])
  })

  it('closes on blur', () => {
    setup()
    fireEvent.focus(input())
    type('P030')
    expect(options().length).toBeGreaterThan(0)
    fireEvent.blur(input())
    expect(options().length, 'the panel outlived focus').toBe(0)
  })
})

describe('each chip is labelled with its category', () => {
  it('names the category and tags it for the stylesheet to colour', () => {
    setup(['P0301', BODY_CODE])
    const body = document.body.textContent ?? ''
    expect(body).toContain('Powertrain')
    expect(body).toContain('Body')
    // The colour is resolved in CSS from `data-cat`, so no hex reaches the TS
    // side — asserted here because that is what keeps this off ds-gate's ceiling.
    expect(document.querySelector('[data-cat="P"]')).toBeTruthy()
    expect(document.querySelector('[data-cat="B"]')).toBeTruthy()
  })

  it('falls back to first-character inference for a code the catalogue lacks', () => {
    // U-codes are Network; this one is hand-typed and not in the catalogue.
    setup(['U9999'])
    expect(document.body.textContent).toContain('Network')
    expect(document.querySelector('[data-cat="U"]')).toBeTruthy()
  })
})

describe('disabled', () => {
  it('disables the input and offers no removal buttons', () => {
    const Harness = () => <DtcChipInput codes={['P0301']} onChange={() => {}} disabled aria-label={LABEL} />
    render(<Harness />)
    expect((screen.getByRole('textbox', { name: LABEL }) as HTMLInputElement).disabled).toBe(true)
    expect(screen.queryByRole('button', { name: 'Remove P0301' }), 'removal offered while disabled').toBeNull()
    // The chip itself still renders — disabled means read-only, not hidden.
    expect(document.body.textContent).toContain('P0301')
  })
})

describe('the help text', () => {
  /*
   * It is the ONLY place the four category letters are explained, so the
   * coloured tags on the chips have no legend without it. Pinned because it
   * reads as decoration and would be an easy deletion.
   */
  it('explains free entry and every category letter', () => {
    setup()
    const body = document.body.textContent ?? ''
    for (const legend of ['P·Powertrain', 'B·Body', 'C·Chassis', 'U·Network']) {
      expect(body, `${legend} missing from the legend`).toContain(legend)
    }
  })
})

describe('⚠️ A PASTED COMMA LIST BECOMES ONE MALFORMED CHIP — pinned, not blessed', () => {
  /*
   * ─── THIS IS A DEFECT, RECORDED AT ITS CURRENT BEHAVIOUR ───────────────────
   *
   * The comma COMMIT is a keydown handler, so it only fires for a comma the user
   * TYPES. A paste arrives as a single change event carrying the whole string, no
   * comma keydown happens, and the next Enter or blur commits the lot as ONE
   * token: `["P0301,P0302,P0420"]`.
   *
   * ⚠️ AND IT LOOKS RIGHT. `dtcCategory` infers the category from the first
   * character, so the junk value renders as a confident "Powertrain" chip. There
   * is no validation to catch it, and the malformed string goes on to become the
   * issue's `dtcCodes` entry.
   *
   * ⚠️ THE COMPONENT'S OWN HELP TEXT INVITES THE INPUT IT MISHANDLES: "enter your
   * own separated by commas". Typing that works; pasting it does not. That is the
   * gap, and it is why this is a defect rather than a missing nicety.
   *
   * Left AS-IS deliberately. Fixing it means deciding what a commit does with a
   * separator — split on commas in `commit`, or add an `onPaste` — and that is a
   * product behaviour change, not coverage work, which is what this file is. So
   * the behaviour is pinned exactly as it stands: if someone fixes it, this test
   * fails and tells them the pin was deliberate rather than an assertion that the
   * bug is correct.
   */
  const pasteInto = (value: string) => fireEvent.change(input(), { target: { value } })

  it('fuses a pasted list into a single invalid code on blur', () => {
    const { codes } = setup()
    pasteInto('P0301,P0302,P0420')
    fireEvent.blur(input())
    expect(codes()).toEqual(['P0301,P0302,P0420'])
  })

  it('does the same on Enter', () => {
    const { codes } = setup()
    pasteInto('P0301,P0302')
    fireEvent.keyDown(input(), { key: 'Enter' })
    expect(codes()).toEqual(['P0301,P0302'])
  })

  it('and the malformed chip renders as a plausible Powertrain code', () => {
    // The reason this is worth reporting rather than shrugging at: nothing on
    // screen suggests the value is wrong.
    setup(['P0301,P0302'])
    expect(document.body.textContent).toContain('Powertrain')
    expect(document.querySelector('[data-cat="P"]')).toBeTruthy()
  })

  it('whereas TYPING the same list separates it correctly', () => {
    // The control the paste path lacks. Typed commas commit one code each.
    const { codes } = setup()
    type('P0301')
    fireEvent.keyDown(input(), { key: ',' })
    type('P0302')
    fireEvent.keyDown(input(), { key: ',' })
    expect(codes()).toEqual(['P0301', 'P0302'])
  })
})

