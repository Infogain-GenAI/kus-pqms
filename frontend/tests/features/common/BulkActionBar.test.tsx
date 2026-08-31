import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RefreshCw, FileOutput } from 'lucide-react'
import { BulkActionBar } from '@/features/common/BulkActionBar'

describe('BulkActionBar', () => {
  it('renders nothing when count is 0', () => {
    const { container } = render(<BulkActionBar count={0} label="Issues Selected" actions={[]} onClear={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the count, every action, and fires their handlers plus clear', () => {
    const onStatus = vi.fn()
    const onExport = vi.fn()
    const onClear = vi.fn()
    render(
      <BulkActionBar
        count={3}
        label="Issues Selected"
        actions={[
          { key: 'status', label: 'Change Status', icon: RefreshCw, onClick: onStatus },
          { key: 'export', label: 'Export', icon: FileOutput, onClick: onExport },
        ]}
        onClear={onClear}
      />,
    )
    expect(screen.getByText('3')).toBeTruthy()
    expect(screen.getByText('Issues Selected')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Change Status' }))
    expect(onStatus).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))
    expect(onExport).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('accepts a custom clearLabel', () => {
    render(<BulkActionBar count={1} label="Issue Selected" actions={[]} onClear={vi.fn()} clearLabel="Deselect" />)
    expect(screen.getByRole('button', { name: 'Deselect' })).toBeTruthy()
  })
})
