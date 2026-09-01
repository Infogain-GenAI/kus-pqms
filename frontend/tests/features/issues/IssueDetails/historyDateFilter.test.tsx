// Ported from Vue's `tabs/HistoryTab/HistoryDateFilter.spec.ts`.
//
// The pure range arithmetic is covered in `history.test.ts`. What only exists
// here is the INTERACTION contract: what opens the panel, what Apply is allowed
// to do, and what the trigger says afterwards.
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HistoryDateFilter } from '@/features/issues/workspace/history/HistoryDateFilter'
import type { DateRange } from '@/features/issues/workspace/history/history'

const TODAY = '2026-07-09'

function setup(value: DateRange = {}) {
  const onChange = vi.fn()
  const view = render(<HistoryDateFilter value={value} onChange={onChange} today={TODAY} />)
  return { onChange, ...view }
}

const trigger = () => screen.getByTestId('history-date-trigger')
const panel = () => screen.queryByTestId('history-date-panel')

describe('the panel', () => {
  it('is closed until the trigger is pressed', () => {
    setup()
    expect(panel()).toBeNull()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('opens on the trigger and reports it', () => {
    setup()
    fireEvent.click(trigger())
    expect(panel()).not.toBeNull()
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
  })

  /*
   * ⚠️ `mousedown`, NOT `click`. A `click` listener fires after the trigger's own
   * handler on the same gesture, so opening the panel would immediately close it
   * again — the control would look completely inert.
   */
  it('closes on a press outside itself', () => {
    setup()
    fireEvent.click(trigger())
    expect(panel()).not.toBeNull()

    fireEvent.mouseDown(document.body)
    expect(panel()).toBeNull()
  })

  it('stays open on a press inside itself', () => {
    setup()
    fireEvent.click(trigger())

    fireEvent.mouseDown(screen.getByTestId('history-date-from'))
    expect(panel()).not.toBeNull()
  })
})

describe('quick ranges', () => {
  it('lists all six', () => {
    setup()
    fireEvent.click(trigger())

    for (const key of ['all', 'last7', 'last30', 'last90', 'thisMonth', 'lastMonth']) {
      expect(screen.getByTestId(`history-date-quick-${key}`)).toBeTruthy()
    }
  })

  it('emits the resolved range and closes', () => {
    const { onChange } = setup()
    fireEvent.click(trigger())
    fireEvent.click(screen.getByTestId('history-date-quick-last7'))

    // Six days back, because the range INCLUDES today — see `history.test.ts`.
    expect(onChange).toHaveBeenCalledWith({ from: '2026-07-03', to: TODAY })
    expect(panel()).toBeNull()
  })

  it('emits an empty range for All time', () => {
    const { onChange } = setup({ from: '2026-07-03', to: TODAY })
    fireEvent.click(trigger())
    fireEvent.click(screen.getByTestId('history-date-quick-all'))

    expect(onChange).toHaveBeenCalledWith({})
  })

  /*
   * ⚠️ `aria-pressed`, NOT ONLY A CLASS. The active state is information, and a
   * colour change alone is invisible to a screen reader and to anyone who cannot
   * distinguish the colour.
   */
  it('marks the active preset for assistive technology, not just visually', () => {
    setup({ from: '2026-07-03', to: TODAY })
    fireEvent.click(trigger())

    expect(screen.getByTestId('history-date-quick-last7').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('history-date-quick-last30').getAttribute('aria-pressed')).toBe('false')
  })
})

describe('the custom range', () => {
  /*
   * ⚠️ VUE'S AC5 — APPLY IS DISABLED UNTIL BOTH ENDPOINTS ARE CHOSEN. A
   * half-complete range is an open-ended filter, and applying one silently
   * changes what the user thought they were asking for.
   */
  it('disables Apply until both endpoints are set', () => {
    setup()
    fireEvent.click(trigger())

    const apply = screen.getByTestId('history-date-apply') as HTMLButtonElement
    expect(apply.disabled).toBe(true)

    fireEvent.change(screen.getByTestId('history-date-from'), { target: { value: '2026-07-01' } })
    expect((screen.getByTestId('history-date-apply') as HTMLButtonElement).disabled).toBe(true)

    fireEvent.change(screen.getByTestId('history-date-to'), { target: { value: '2026-07-08' } })
    expect((screen.getByTestId('history-date-apply') as HTMLButtonElement).disabled).toBe(false)
  })

  it('emits the range and closes on Apply', () => {
    const { onChange } = setup()
    fireEvent.click(trigger())
    fireEvent.change(screen.getByTestId('history-date-from'), { target: { value: '2026-07-01' } })
    fireEvent.change(screen.getByTestId('history-date-to'), { target: { value: '2026-07-08' } })
    fireEvent.click(screen.getByTestId('history-date-apply'))

    expect(onChange).toHaveBeenCalledWith({ from: '2026-07-01', to: '2026-07-08' })
    expect(panel()).toBeNull()
  })

  /*
   * ⚠️ A HISTORY LOG HAS NO FORWARD EXTENT, so no future date is selectable.
   * Vue states this as a rule of theirs rather than a picker default, and it is
   * carried over as the `max` bound on both inputs.
   */
  it('bounds both inputs at today', () => {
    setup()
    fireEvent.click(trigger())

    expect(screen.getByTestId('history-date-from').getAttribute('max')).toBe(TODAY)
    expect(screen.getByTestId('history-date-to').getAttribute('max')).toBe(TODAY)
  })

  /*
   * ⚠️ `to` IS ALSO BOUNDED BELOW BY `from`. Without it a user can select a `to`
   * before their `from`, which Apply accepts and which then matches nothing — an
   * empty feed that reads as missing data rather than an impossible range.
   */
  it('bounds the end date below by the start date', () => {
    setup()
    fireEvent.click(trigger())
    expect(screen.getByTestId('history-date-to').getAttribute('min')).toBeNull()

    fireEvent.change(screen.getByTestId('history-date-from'), { target: { value: '2026-07-04' } })
    expect(screen.getByTestId('history-date-to').getAttribute('min')).toBe('2026-07-04')
  })

  // Clearing is a step towards choosing something else, so closing the panel
  // would make the common case two extra clicks. Vue behaves the same way.
  it('Clear empties the range and leaves the panel open', () => {
    const { onChange } = setup({ from: '2026-07-01', to: '2026-07-08' })
    fireEvent.click(trigger())
    fireEvent.click(screen.getByTestId('history-date-clear'))

    expect(onChange).toHaveBeenCalledWith({})
    expect(panel()).not.toBeNull()
  })

  // A user who picks a preset after typing a half-finished custom range means
  // the preset; leaving the draft would re-apply it on the next open.
  it('discards a half-typed custom draft when a preset is chosen', () => {
    setup()
    fireEvent.click(trigger())
    fireEvent.change(screen.getByTestId('history-date-from'), { target: { value: '2026-07-01' } })
    fireEvent.click(screen.getByTestId('history-date-quick-last30'))

    fireEvent.click(trigger())
    expect((screen.getByTestId('history-date-from') as HTMLInputElement).value).toBe('')
  })
})

describe('the trigger label', () => {
  it('names the active preset', () => {
    setup({ from: '2026-07-03', to: TODAY })
    expect(trigger().textContent).toContain('Last 7 days')
  })

  // Not null for the empty case: a null active preset would render an empty
  // dash for the default state, which reads as a broken control.
  it('reads All time when nothing is constrained', () => {
    setup()
    expect(trigger().textContent).toContain('All time')
  })

  it('shows the two dates for a custom range', () => {
    setup({ from: '2026-05-04', to: '2026-05-09' })
    expect(trigger().textContent).toContain('2026-05-04')
    expect(trigger().textContent).toContain('2026-05-09')
  })
})
