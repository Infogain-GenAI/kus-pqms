import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SlidersHorizontal } from 'lucide-react'
import { DrawerShell, DrawerSection } from '@/features/common/DrawerShell'

describe('DrawerShell', () => {
  it('renders title, subtitle, children and footer', () => {
    render(
      <DrawerShell icon={SlidersHorizontal} title="Filters" subtitle="Refine the list" onClose={vi.fn()} footer={<button>Apply</button>}>
        <div>filter fields</div>
      </DrawerShell>,
    )
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeTruthy()
    expect(screen.getByText('Refine the list')).toBeTruthy()
    expect(screen.getByText('filter fields')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeTruthy()
  })

  it('calls onClose from the close button', () => {
    const onClose = vi.fn()
    render(
      <DrawerShell icon={SlidersHorizontal} title="Filters" subtitle="Refine the list" onClose={onClose} footer={null}>
        <div />
      </DrawerShell>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose from the scrim', () => {
    const onClose = vi.fn()
    const { container } = render(
      <DrawerShell icon={SlidersHorizontal} title="Filters" subtitle="Refine the list" onClose={onClose} footer={null}>
        <div />
      </DrawerShell>,
    )
    fireEvent.click(container.firstElementChild!)
    expect(onClose).toHaveBeenCalledOnce()
  })
})

describe('DrawerSection', () => {
  it('shows children and the collapse icon when open, and calls onToggle', () => {
    const onToggle = vi.fn()
    render(
      <DrawerSection icon={SlidersHorizontal} label="Vehicle" open onToggle={onToggle}>
        <div>section content</div>
      </DrawerSection>,
    )
    expect(screen.getByText('section content')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Vehicle/i }))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('hides children and shows the expand icon when closed', () => {
    render(
      <DrawerSection icon={SlidersHorizontal} label="Vehicle" open={false} onToggle={vi.fn()}>
        <div>section content</div>
      </DrawerSection>,
    )
    expect(screen.queryByText('section content')).toBeNull()
  })
})
