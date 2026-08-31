import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DataTable } from '@/features/common/DataTable'

interface Row {
  id: string
  name: string
}

describe('DataTable (common alias)', () => {
  it('renders the ui-library DataTable borderless by default', () => {
    render(
      <DataTable<Row>
        columns={[{ key: 'name', header: 'Name' }]}
        rows={[{ id: '1', name: 'Alpha' }]}
        rowKey="id"
      />,
    )
    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.getByText('Alpha')).toBeTruthy()
  })

  it('lets a caller-supplied style override the borderless default', () => {
    const { container } = render(
      <DataTable<Row>
        columns={[{ key: 'name', header: 'Name' }]}
        rows={[{ id: '1', name: 'Alpha' }]}
        rowKey="id"
        style={{ border: '1px solid red' }}
      />,
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.style.border).toBe('1px solid red')
  })
})
