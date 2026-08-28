// Tests for the Combobox primitive.
//
// This control backs five fields on the Issue forms — Model Code plus the four
// classification levels — so a defect here shows up five times. What is pinned
// below is specifically the behaviour that is easy to break and invisible in a
// screenshot: the blur delay, the multi-select panel staying open, and the
// keyboard path.
//
// Written as SPECIFICATION rather than characterisation: unlike the screens,
// this component is new, so there is no prior behaviour to preserve — these
// assertions say what it must do.
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Combobox, type ComboboxOption } from '@pqms/ui-library'

const OPTIONS: ComboboxOption[] = [
  { value: 'KA', label: 'KA', detail: 'CARNIVAL', meta: 'MY2022-2027' },
  { value: 'DL', label: 'DL', detail: 'K5', meta: 'MY2021-2027' },
  { value: 'CV', label: 'CV', detail: 'EV6.KR', meta: 'MY2022-2025' },
]

const setup = (props: Partial<React.ComponentProps<typeof Combobox>> = {}) => {
  const onSelect = vi.fn()
  render(<Combobox options={OPTIONS} selected={[]} onSelect={onSelect} aria-label="Model code" {...props} />)
  return { onSelect, input: screen.getByRole('combobox') }
}

const options = () => screen.queryAllByRole('option')

describe('the panel opens on focus and lists every option', () => {
  it('is closed until the trigger is focused', () => {
    setup()
    expect(options()).toHaveLength(0)
  })

  it('opens on focus and shows all options', () => {
    const { input } = setup()
    fireEvent.focus(input)
    expect(options()).toHaveLength(3)
    expect(input.getAttribute('aria-expanded')).toBe('true')
  })

  it('filters on label OR detail, case-insensitively', () => {
    const { input } = setup()
    fireEvent.focus(input)

    fireEvent.change(input, { target: { value: 'ka' } })
    expect(options()).toHaveLength(1)

    // "carnival" appears only in `detail`, never in `label`.
    fireEvent.change(input, { target: { value: 'carnival' } })
    expect(options()).toHaveLength(1)
    expect(options()[0].textContent).toContain('KA')
  })

  it('reports no match rather than an empty panel', () => {
    const { input } = setup({ emptyText: 'No matching model code.' })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'zzzz' } })
    expect(options()).toHaveLength(0)
    expect(document.body.textContent).toContain('No matching model code.')
  })
})

describe('selection', () => {
  it('single-select reports the value and closes', () => {
    const { onSelect, input } = setup()
    fireEvent.focus(input)
    fireEvent.mouseDown(options()[1])
    expect(onSelect).toHaveBeenCalledWith('DL')
    expect(options()).toHaveLength(0)
  })

  // The panel must survive a pick, or picking a second code means re-opening it.
  it('multi-select reports the value and KEEPS the panel open', () => {
    const { onSelect, input } = setup({ multiple: true })
    fireEvent.focus(input)
    fireEvent.mouseDown(options()[0])
    expect(onSelect).toHaveBeenCalledWith('KA')
    expect(options()).toHaveLength(3)
  })

  it('marks the selected option for assistive tech', () => {
    const { input } = setup({ multiple: true, selected: ['DL'] })
    fireEvent.focus(input)
    expect(options()[1].getAttribute('aria-selected')).toBe('true')
    expect(options()[0].getAttribute('aria-selected')).toBe('false')
  })

  it('does not report anything while disabled', () => {
    const { onSelect, input } = setup({ disabled: true })
    fireEvent.focus(input)
    expect(options()).toHaveLength(0)
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('the keyboard path', () => {
  it('arrows move the highlight and Enter picks it', () => {
    const { onSelect, input } = setup()
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('DL')
  })

  it('the highlight wraps at the end of the list', () => {
    const { onSelect, input } = setup()
    fireEvent.focus(input)
    // Four downs across three options lands back on the first.
    for (let i = 0; i < 4; i++) fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('KA')
  })

  it('ArrowUp from nothing selects the last option', () => {
    const { onSelect, input } = setup()
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('CV')
  })

  it('Escape closes without selecting', () => {
    const { onSelect, input } = setup()
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(options()).toHaveLength(0)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('Enter with nothing highlighted does not select', () => {
    const { onSelect, input } = setup()
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('the trigger text', () => {
  it('shows the selected labels when closed', () => {
    setup({ selected: ['KA', 'CV'], multiple: true })
    expect(screen.getByRole('combobox')).toHaveProperty('value', 'KA, CV')
  })

  it('prefers an explicit displayValue over the labels', () => {
    setup({ selected: ['KA', 'CV'], multiple: true, displayValue: '2 Model Codes Selected' })
    expect(screen.getByRole('combobox')).toHaveProperty('value', '2 Model Codes Selected')
  })

  // While open the field belongs to the query, or typing fights a value the
  // user did not type.
  it('shows the live query while open', () => {
    const { input } = setup({ selected: ['KA'] })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'ev' } })
    expect(input).toHaveProperty('value', 'ev')
  })
})

describe('the blur delay', () => {
  // Closing on blur synchronously would unmount the option before its mousedown
  // lands, so clicking an option would do nothing at all.
  it('does not close synchronously on blur', () => {
    const { input } = setup()
    fireEvent.focus(input)
    fireEvent.blur(input)
    expect(options()).toHaveLength(3)
  })

  it('closes once the delay elapses', () => {
    vi.useFakeTimers()
    try {
      const { input } = setup()
      fireEvent.focus(input)
      fireEvent.blur(input)
      act(() => { vi.advanceTimersByTime(200) })
      expect(options()).toHaveLength(0)
    } finally {
      vi.useRealTimers()
    }
  })
})
