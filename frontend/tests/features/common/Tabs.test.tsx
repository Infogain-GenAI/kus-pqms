import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tabs } from '@/features/common/Tabs'

describe('Tabs', () => {
  it('renders each tab with its count and marks the active one', () => {
    const onChange = vi.fn()
    render(
      <Tabs
        tabs={[
          { key: 'my', label: 'My Issues', count: 7 },
          { key: 'all', label: 'All Issues', count: 35 },
        ]}
        activeKey="my"
        onChange={onChange}
      />,
    )
    expect(screen.getByText('My Issues')).toBeTruthy()
    expect(screen.getByText('7')).toBeTruthy()
    expect(screen.getByText('All Issues')).toBeTruthy()
    expect(screen.getByText('35')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /All Issues/i }))
    expect(onChange).toHaveBeenCalledWith('all')
  })
})
