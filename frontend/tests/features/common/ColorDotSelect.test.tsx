import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ColorDotSelect, type ColorDotOption } from '@/features/common/ColorDotSelect'

const OPTIONS: ColorDotOption[] = [
  { key: 'open', label: 'Open', color: 'blue' },
  { key: 'closed', label: 'Closed', color: 'gray' },
]

describe('ColorDotSelect', () => {
  it('shows the placeholder when the value matches no option', () => {
    render(<ColorDotSelect value="" options={OPTIONS} onChange={vi.fn()} />)
    expect(screen.getByText('Select…')).toBeTruthy()
  })

  it('accepts a custom placeholder', () => {
    render(<ColorDotSelect value="" options={OPTIONS} onChange={vi.fn()} placeholder="Choose one…" />)
    expect(screen.getByText('Choose one…')).toBeTruthy()
  })

  it('shows the selected option label when the value matches', () => {
    render(<ColorDotSelect value="open" options={OPTIONS} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Open/i })).toBeTruthy()
  })

  it('opens the panel on trigger click, and picking an option calls onChange and closes it', () => {
    const onChange = vi.fn()
    render(<ColorDotSelect value="" options={OPTIONS} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: /Select…/i }))
    const closedOption = screen.getByRole('button', { name: 'Closed' })
    expect(closedOption).toBeTruthy()

    fireEvent.click(closedOption)
    expect(onChange).toHaveBeenCalledWith('closed')
    expect(screen.queryByRole('button', { name: 'Closed' })).toBeNull()
  })

  it('closes on an outside click without changing the value', () => {
    const onChange = vi.fn()
    render(
      <div>
        <button>outside</button>
        <ColorDotSelect value="" options={OPTIONS} onChange={onChange} />
      </div>,
    )
    fireEvent.click(screen.getByRole('button', { name: /Select…/i }))
    expect(screen.getByRole('button', { name: 'Open' })).toBeTruthy()

    fireEvent.mouseDown(screen.getByRole('button', { name: 'outside' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Open' })).toBeNull()
  })

  it('does not close on a mousedown inside the panel that misses an option', () => {
    render(<ColorDotSelect value="" options={OPTIONS} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Select…/i }))
    const panel = screen.getByRole('button', { name: 'Open' }).parentElement!
    fireEvent.mouseDown(panel)
    expect(screen.getByRole('button', { name: 'Open' })).toBeTruthy()
  })

  it('does not close on a mousedown on the trigger itself', () => {
    render(<ColorDotSelect value="" options={OPTIONS} onChange={vi.fn()} />)
    const trigger = screen.getByRole('button', { name: /Select…/i })
    fireEvent.click(trigger)
    fireEvent.mouseDown(trigger)
    expect(screen.getByRole('button', { name: 'Open' })).toBeTruthy()
  })

  it('highlights the option matching the current value', () => {
    render(<ColorDotSelect value="closed" options={OPTIONS} onChange={vi.fn()} />)
    // The trigger itself now also reads "Closed" (the selected label), so two
    // buttons match once the panel is open — the panel's option is the second.
    fireEvent.click(screen.getByRole('button', { name: /Closed/i }))
    const [, panelOption] = screen.getAllByRole('button', { name: 'Closed' })
    expect(panelOption.style.background).not.toBe('transparent')
  })

  it('recomputes position on scroll and resize while open', () => {
    render(<ColorDotSelect value="" options={OPTIONS} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Select…/i }))
    act(() => {
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('resize'))
    })
    expect(screen.getByRole('button', { name: 'Open' })).toBeTruthy()
  })

  it('toggles closed when the trigger is clicked again while open', () => {
    render(<ColorDotSelect value="" options={OPTIONS} onChange={vi.fn()} />)
    const trigger = screen.getByRole('button', { name: /Select…/i })
    fireEvent.click(trigger)
    expect(screen.getByRole('button', { name: 'Open' })).toBeTruthy()
    fireEvent.click(trigger)
    expect(screen.queryByRole('button', { name: 'Open' })).toBeNull()
  })
})
