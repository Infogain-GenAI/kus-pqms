import { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Columns3 } from 'lucide-react'
import { ColumnDrawer, type ColumnDrawerColumn } from '@/features/common/ColumnDrawer'

const DEFAULT_SECTION: ColumnDrawerColumn[] = [
  { key: '_id', label: 'Issue ID', required: true },
  { key: '_title', label: 'Issue Title', required: true },
  { key: 'modelCode', label: 'Model Code', required: false },
]
const OPTIONAL: ColumnDrawerColumn[] = [
  { key: 'source', label: 'Source' },
  { key: 'model', label: 'Model' },
]

function Harness({ initialVisible }: { initialVisible: string[] }) {
  const [visible, setVisible] = useState(initialVisible)
  return (
    <ColumnDrawer
      icon={Columns3}
      title="Columns"
      subtitle="Show or hide columns"
      onClose={vi.fn()}
      defaultSectionLabel="Default columns"
      defaultSectionColumns={DEFAULT_SECTION}
      optionalSectionLabel="Optional columns"
      optionalColumns={OPTIONAL}
      selectAllLabel="Select all"
      requiredBadgeLabel="Required"
      visible={visible}
      onVisibleChange={setVisible}
      restoreDefaultLabel="Restore default"
      onRestoreDefault={vi.fn()}
      applyLabel="Apply"
      onApply={vi.fn()}
    />
  )
}

describe('ColumnDrawer', () => {
  it('renders required columns as disabled+checked with a badge, and non-required ones as plain checkboxes', () => {
    render(<Harness initialVisible={['modelCode']} />)

    const idBox = screen.getByRole('checkbox', { name: 'Issue ID' }) as HTMLInputElement
    expect(idBox.checked).toBe(true)
    expect(idBox.disabled).toBe(true)
    expect(screen.getAllByText('Required')).toHaveLength(2)

    const modelCodeBox = screen.getByRole('checkbox', { name: 'Model Code' }) as HTMLInputElement
    expect(modelCodeBox.checked).toBe(true)
    expect(modelCodeBox.disabled).toBe(false)
  })

  it('toggling a non-required default column off then on updates visible both ways', () => {
    render(<Harness initialVisible={['modelCode']} />)
    const modelCodeBox = screen.getByRole('checkbox', { name: 'Model Code' }) as HTMLInputElement

    fireEvent.click(modelCodeBox)
    expect(modelCodeBox.checked).toBe(false)

    fireEvent.click(modelCodeBox)
    expect(modelCodeBox.checked).toBe(true)
  })

  it('select-all is unchecked when no optional column is visible, and checking it adds every optional column', () => {
    render(<Harness initialVisible={[]} />)
    const selectAll = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement
    expect(selectAll.checked).toBe(false)

    fireEvent.click(selectAll)
    expect(selectAll.checked).toBe(true)
    expect((screen.getByRole('checkbox', { name: 'Source' }) as HTMLInputElement).checked).toBe(true)
    expect((screen.getByRole('checkbox', { name: 'Model' }) as HTMLInputElement).checked).toBe(true)
  })

  it('select-all is checked when every optional column is already visible, and unchecking it removes them all', () => {
    render(<Harness initialVisible={['source', 'model']} />)
    const selectAll = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement
    expect(selectAll.checked).toBe(true)

    fireEvent.click(selectAll)
    expect(selectAll.checked).toBe(false)
    expect((screen.getByRole('checkbox', { name: 'Source' }) as HTMLInputElement).checked).toBe(false)
    expect((screen.getByRole('checkbox', { name: 'Model' }) as HTMLInputElement).checked).toBe(false)
  })

  it('toggles an individual optional column independently of select-all', () => {
    render(<Harness initialVisible={[]} />)
    const sourceBox = screen.getByRole('checkbox', { name: 'Source' }) as HTMLInputElement
    fireEvent.click(sourceBox)
    expect(sourceBox.checked).toBe(true)
    expect((screen.getByRole('checkbox', { name: 'Model' }) as HTMLInputElement).checked).toBe(false)
  })

  it('wires Restore default and Apply to their callbacks', () => {
    const onRestoreDefault = vi.fn()
    const onApply = vi.fn()
    render(
      <ColumnDrawer
        icon={Columns3}
        title="Columns"
        subtitle="Show or hide columns"
        onClose={vi.fn()}
        defaultSectionLabel="Default columns"
        defaultSectionColumns={DEFAULT_SECTION}
        optionalSectionLabel="Optional columns"
        optionalColumns={OPTIONAL}
        selectAllLabel="Select all"
        requiredBadgeLabel="Required"
        visible={[]}
        onVisibleChange={vi.fn()}
        restoreDefaultLabel="Restore default"
        onRestoreDefault={onRestoreDefault}
        applyLabel="Apply"
        onApply={onApply}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Restore default/i }))
    expect(onRestoreDefault).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: /^Apply$/i }))
    expect(onApply).toHaveBeenCalledOnce()
  })
})
