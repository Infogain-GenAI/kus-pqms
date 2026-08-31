import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Footer } from '@/features/common/Footer'

describe('Footer', () => {
  it('renders the range text and pagination slot without a page-size picker when omitted', () => {
    render(<Footer rangeText="Showing 1-20 of 35 issues" pagination={<div>pager</div>} />)
    expect(screen.getByText('Showing 1-20 of 35 issues')).toBeTruthy()
    expect(screen.getByText('pager')).toBeTruthy()
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('renders the page-size picker when both pageSizeOptions and onPageSizeChange are given, and fires on change', () => {
    const onPageSizeChange = vi.fn()
    render(
      <Footer
        rangeText="Showing 1-20 of 35 issues"
        pageSize={20}
        pageSizeOptions={[20, 50, 100]}
        pageSizeLabel="Rows:"
        onPageSizeChange={onPageSizeChange}
      />,
    )
    expect(screen.getByText('Rows:')).toBeTruthy()
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '50' } })
    expect(onPageSizeChange).toHaveBeenCalledWith(50)
  })

  it('omits the picker when pageSizeOptions is given but onPageSizeChange is not', () => {
    render(<Footer rangeText="x" pageSizeOptions={[20, 50]} />)
    expect(screen.queryByRole('combobox')).toBeNull()
  })
})
