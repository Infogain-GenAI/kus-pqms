import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ListTooltipBody, CountPill } from '@/features/issues/issue-list/IssueTableCells'

describe('IssueTableCells', () => {
  it('ListTooltipBody renders the label and every item', () => {
    render(<ListTooltipBody label="Model Codes" items={['SP2', 'CV1']} />)
    expect(screen.getByText('Model Codes')).toBeTruthy()
    expect(screen.getByText('SP2')).toBeTruthy()
    expect(screen.getByText('CV1')).toBeTruthy()
  })

  it('CountPill renders its children', () => {
    render(<CountPill>2 Models</CountPill>)
    expect(screen.getByText('2 Models')).toBeTruthy()
  })
})
