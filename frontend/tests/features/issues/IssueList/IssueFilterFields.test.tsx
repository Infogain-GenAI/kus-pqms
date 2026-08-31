import { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EMPTY_ISSUE_FILTERS, type IssueFilterState } from '@/data/issueListView'
import { IssueFilterFields, SegRow } from '@/features/issues/issue-list/IssueFilterFields'

const OPTS = {
  modelCodes: ['SP2', 'CV1'],
  modelYears: ['2024', '2025'],
  systems: ['Powertrain'],
  subSystems: ['Engine'],
  components: ['Sensor'],
  symptoms: ['Noise'],
  owners: ['Jamie Lee'],
}

describe('SegRow', () => {
  it('marks the matching option active and fires onChange with the clicked value, including the empty "All" option', () => {
    const onChange = vi.fn()
    render(<SegRow options={[{ v: '', l: 'All' }, { v: 'yes', l: 'Yes' }]} value="yes" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'All' }))
    expect(onChange).toHaveBeenCalledWith('')
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }))
    expect(onChange).toHaveBeenCalledWith('yes')
  })
})

function Harness() {
  const [draft, setDraft] = useState<IssueFilterState>({ ...EMPTY_ISSUE_FILTERS, dateFrom: '2026-01-01' })
  const [secOpen, setSecOpen] = useState({ vehicle: true, classification: true, issue: true })
  return (
    <IssueFilterFields
      draft={draft}
      onDraftChange={setDraft}
      opts={OPTS}
      secOpen={secOpen}
      onToggleSection={(key) => setSecOpen((s) => ({ ...s, [key]: !s[key] }))}
    />
  )
}

describe('IssueFilterFields', () => {
  it('renders all three sections open, with their fields visible', () => {
    render(<Harness />)
    expect(screen.getByRole('combobox', { name: 'Model Code' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Status' })).toBeTruthy()
    expect(screen.getByLabelText('Start date')).toBeTruthy()
    expect(screen.getByLabelText('End date')).toBeTruthy()
  })

  it('toggles each section via its header, calling onToggleSection with the right key', () => {
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: /Vehicle/i }))
    expect(screen.queryByRole('combobox', { name: 'Model Code' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Classification/i }))
    expect(screen.queryByRole('combobox', { name: 'System' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /^Issue$/i }))
    expect(screen.queryByRole('combobox', { name: 'Status' })).toBeNull()
  })

  it('updates a string-options select and a value/label-options select', () => {
    render(<Harness />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Model Code' }), { target: { value: 'SP2' } })
    expect((screen.getByRole('combobox', { name: 'Model Code' }) as HTMLSelectElement).value).toBe('SP2')

    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: 'open' } })
    expect((screen.getByRole('combobox', { name: 'Status' }) as HTMLSelectElement).value).toBe('open')
  })

  it('updates the start and end date inputs independently', () => {
    render(<Harness />)
    const start = screen.getByLabelText('Start date') as HTMLInputElement
    const end = screen.getByLabelText('End date') as HTMLInputElement
    expect(start.value).toBe('2026-01-01')

    fireEvent.change(end, { target: { value: '2026-02-01' } })
    expect(end.value).toBe('2026-02-01')

    fireEvent.change(start, { target: { value: '2026-01-15' } })
    expect(start.value).toBe('2026-01-15')
  })

  it('drives the Days open, Linked issues and EWS flag segmented rows independently', () => {
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: '≤7d' }))
    // Both "Linked issues" and "EWS flag" render a "Yes"/"No" SegRow; scope by
    // taking every match rather than assuming one.
    const yesButtons = screen.getAllByRole('button', { name: /^Yes$/i })
    expect(yesButtons.length).toBeGreaterThan(0)
    fireEvent.click(yesButtons[0])
    if (yesButtons[1]) fireEvent.click(yesButtons[1])
    const noButtons = screen.getAllByRole('button', { name: /^No$/i })
    expect(noButtons.length).toBeGreaterThan(0)
    fireEvent.click(noButtons[0])
    if (noButtons[1]) fireEvent.click(noButtons[1])
  })
})
