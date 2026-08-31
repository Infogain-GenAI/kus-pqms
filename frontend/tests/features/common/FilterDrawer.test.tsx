import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SlidersHorizontal } from 'lucide-react'
import { FilterDrawer } from '@/features/common/FilterDrawer'

describe('FilterDrawer', () => {
  it('renders children and wires Reset/Apply to their callbacks', () => {
    const onApply = vi.fn()
    const onReset = vi.fn()
    const onClose = vi.fn()
    render(
      <FilterDrawer
        icon={SlidersHorizontal}
        title="Filters"
        subtitle="Refine the list"
        onClose={onClose}
        onApply={onApply}
        onReset={onReset}
        resetLabel="Reset"
        applyLabel="Apply"
      >
        <div>a filter field</div>
      </FilterDrawer>,
    )
    expect(screen.getByText('a filter field')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(onReset).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onApply).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
