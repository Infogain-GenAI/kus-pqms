import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Download, Plus } from 'lucide-react'
import { PageHeading } from '@/features/common/PageHeading'

describe('PageHeading', () => {
  it('renders the title alone when there is no subtitle and no actions', () => {
    render(<PageHeading title="Issue list" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Issue list' })).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders the subtitle when provided', () => {
    render(<PageHeading title="Issue list" subtitle="Monitor issues" />)
    expect(screen.getByText('Monitor issues')).toBeTruthy()
  })

  it('renders both actions with icons and fires their handlers', () => {
    const onSecondary = vi.fn()
    const onPrimary = vi.fn()
    render(
      <PageHeading
        title="Issue list"
        secondaryAction={{ label: 'Export', icon: Download, onClick: onSecondary }}
        primaryAction={{ label: 'New issue', icon: Plus, onClick: onPrimary }}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))
    fireEvent.click(screen.getByRole('button', { name: 'New issue' }))
    expect(onSecondary).toHaveBeenCalledOnce()
    expect(onPrimary).toHaveBeenCalledOnce()
  })

  it('renders an action without an icon and respects disabled', () => {
    render(<PageHeading title="Issue list" secondaryAction={{ label: 'Export', onClick: vi.fn(), disabled: true }} />)
    const btn = screen.getByRole('button', { name: 'Export' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('hides the secondary action when showSecondaryAction is false, but keeps the primary one', () => {
    render(
      <PageHeading
        title="Issue list"
        secondaryAction={{ label: 'Export', onClick: vi.fn() }}
        showSecondaryAction={false}
        primaryAction={{ label: 'New issue', onClick: vi.fn() }}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Export' })).toBeNull()
    expect(screen.getByRole('button', { name: 'New issue' })).toBeTruthy()
  })

  it('hides the primary action when showPrimaryAction is false, but keeps the secondary one', () => {
    render(
      <PageHeading
        title="Issue list"
        secondaryAction={{ label: 'Export', onClick: vi.fn() }}
        primaryAction={{ label: 'New issue', onClick: vi.fn() }}
        showPrimaryAction={false}
      />,
    )
    expect(screen.getByRole('button', { name: 'Export' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'New issue' })).toBeNull()
  })

  it('renders no action row at all when both flags are false', () => {
    render(
      <PageHeading
        title="Issue list"
        secondaryAction={{ label: 'Export', onClick: vi.fn() }}
        showSecondaryAction={false}
        primaryAction={{ label: 'New issue', onClick: vi.fn() }}
        showPrimaryAction={false}
      />,
    )
    expect(screen.queryByRole('button')).toBeNull()
  })
})
