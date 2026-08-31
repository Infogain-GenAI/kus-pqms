import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BulkChangeStatusModal } from '@/features/issues/issue-list/BulkChangeStatusModal'

function baseProps() {
  return {
    open: true,
    onClose: vi.fn(),
    count: 3,
    target: '',
    onTargetChange: vi.fn(),
    reason: '',
    onReasonChange: vi.fn(),
    onSubmit: vi.fn(),
    submitDisabled: true,
  }
}

describe('BulkChangeStatusModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<BulkChangeStatusModal {...baseProps()} open={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the count in the body and disables submit while incomplete', () => {
    render(<BulkChangeStatusModal {...baseProps()} />)
    expect(screen.getByText(/This will update 3 selected issues/i)).toBeTruthy()
    const submit = screen.getByRole('button', { name: /Update status for/i }) as HTMLButtonElement
    expect(submit.disabled).toBe(true)
  })

  it('enables submit and fires it when not disabled', () => {
    const onSubmit = vi.fn()
    render(<BulkChangeStatusModal {...baseProps()} submitDisabled={false} onSubmit={onSubmit} />)
    const submit = screen.getByRole('button', { name: /Update status for/i }) as HTMLButtonElement
    expect(submit.disabled).toBe(false)
    fireEvent.click(submit)
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('closes via the header close button and via Cancel', () => {
    const onClose = vi.fn()
    render(<BulkChangeStatusModal {...baseProps()} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('picking a status calls onTargetChange', () => {
    const onTargetChange = vi.fn()
    render(<BulkChangeStatusModal {...baseProps()} onTargetChange={onTargetChange} />)
    fireEvent.click(screen.getByRole('button', { name: /Select status/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Open$/ }))
    expect(onTargetChange).toHaveBeenCalledWith('open')
  })

  it('shows the selected status and typing a reason calls onReasonChange', () => {
    const onReasonChange = vi.fn()
    render(<BulkChangeStatusModal {...baseProps()} target="closed" onReasonChange={onReasonChange} />)
    expect(screen.getByRole('button', { name: /Closed/i })).toBeTruthy()

    fireEvent.change(screen.getByLabelText(/Reason \/ comment/i), { target: { value: 'Bulk triage' } })
    expect(onReasonChange).toHaveBeenCalledWith('Bulk triage')
  })
})
