// Coverage-closing interaction tests for IssueListScreen.tsx — deliberately
// separate from IssueListScreen.test.tsx, which is characterization-only and
// pins specific documented behaviours. This file's only job is to actually
// invoke every remaining handler the characterization suite doesn't reach:
// KPI-card filtering, row navigation, the New Issue button, the search box's
// clear control, drawer close/reset/restore controls, the bulk bar's Export
// and Clear actions, the bulk status modal's dismiss controls, and the Linked
// column's correlation modal.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'
import { IssueListScreen } from '@/features/issues/issue-list/IssueListScreen'

function WorkspaceStub() {
  const { id } = useParams()
  return <div>workspace-for-{id}</div>
}

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/']}>
    <RoleProvider>
      <StoreProvider>
        <Routes>
          <Route path="/" element={children} />
          <Route path="/issues/new" element={<div>new-issue-screen</div>} />
          <Route path="/issues/:id" element={<WorkspaceStub />} />
        </Routes>
      </StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)
const renderList = () => render(<IssueListScreen />, { wrapper: Wrapped })

const tab = (name: RegExp) => screen.getByRole('button', { name })
const firstRowId = () => screen.getAllByText(/^[A-Z]{2}-\d{6}$/)[0].textContent!

describe('KPI cards apply and clear the status filter', () => {
  it('clicking a status card narrows the list, and the scope card clears it again', () => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))
    const before = screen.getAllByText(/Showing .* issues/i)[0].textContent

    fireEvent.click(screen.getByRole('button', { name: /Open$/ }))
    expect(screen.getAllByText(/Showing .* issues/i)[0].textContent).not.toBe(before)

    fireEvent.click(screen.getByRole('button', { name: /All Issues$/ }))
    expect(screen.getAllByText(/Showing .* issues/i)[0].textContent).toBe(before)
  })
})

describe('row and header navigation', () => {
  it('clicking an Issue ID cell navigates to its workspace', () => {
    renderList()
    const id = firstRowId()
    fireEvent.click(screen.getByRole('button', { name: id }))
    expect(screen.getByText(`workspace-for-${id}`)).toBeTruthy()
  })

  it('New issue navigates to the entry screen', () => {
    renderList()
    fireEvent.click(screen.getByRole('button', { name: /New issue/i }))
    expect(screen.getByText('new-issue-screen')).toBeTruthy()
  })
})

describe('search box clear control', () => {
  it('clears the query and restores the full list', async () => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))
    const before = screen.getAllByText(/Showing .* issues/i)[0].textContent

    const box = screen.getByPlaceholderText(/Search by keyword/i)
    fireEvent.change(box, { target: { value: 'zzz-nomatch-zzz' } })
    // `q` (the clear button's precondition) updates immediately; the debounced
    // `searchTerm` the empty-state check would depend on does not need to
    // settle here since we are only exercising the clear control itself.
    await waitFor(() => expect(screen.getByRole('button', { name: /Clear search/i })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /Clear search/i }))

    expect((box as HTMLInputElement).value).toBe('')
    await waitFor(() => expect(screen.getAllByText(/Showing .* issues/i)[0].textContent).toBe(before))
  })
})

describe('the empty state', () => {
  it('Clear filters, shown when a search matches nothing, restores the list', async () => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))
    const before = screen.getAllByText(/Showing .* issues/i)[0].textContent

    fireEvent.change(screen.getByPlaceholderText(/Search by keyword/i), { target: { value: 'zzz-nomatch-zzz' } })
    // The empty state depends on the DEBOUNCED search term, not `q` itself.
    await waitFor(() => expect(screen.getByRole('button', { name: /^Clear filters$/i })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /^Clear filters$/i }))

    await waitFor(() => expect(screen.getAllByText(/Showing .* issues/i)[0].textContent).toBe(before))
  })
})

describe('the Filters drawer', () => {
  it('a section header collapses its fields, Reset clears the draft, and Close dismisses it', () => {
    renderList()
    fireEvent.click(screen.getByRole('button', { name: /^Filter$/i }))
    expect(screen.getByRole('combobox', { name: 'Model Code' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /^Vehicle$/i }))
    expect(screen.queryByRole('combobox', { name: 'Model Code' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /^Vehicle$/i }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Model Code' }), {
      target: { value: (screen.getByRole('combobox', { name: 'Model Code' }) as HTMLSelectElement).options[1].value },
    })
    fireEvent.click(screen.getByRole('button', { name: /^Reset$/i }))
    expect((screen.getByRole('combobox', { name: 'Model Code' }) as HTMLSelectElement).value).toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull()
  })
})

describe('the Columns drawer', () => {
  it('Restore default resets the draft, and Close dismisses it without applying', () => {
    renderList()
    fireEvent.click(screen.getByRole('button', { name: /^Columns$/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Severity' }))
    fireEvent.click(screen.getByRole('button', { name: /Restore default/i }))
    expect((screen.getByRole('checkbox', { name: 'Severity' }) as HTMLInputElement).checked).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog', { name: 'Columns' })).toBeNull()
    expect(screen.queryByText('Severity')).toBeNull()
  })
})

describe('the bulk action bar', () => {
  function selectAll() {
    fireEvent.click(screen.getAllByRole('checkbox')[0])
  }

  it('Export downloads the selected rows', () => {
    const urlAny = URL as unknown as Record<string, unknown>
    urlAny.createObjectURL = () => 'blob:stub'
    urlAny.revokeObjectURL = () => {}
    const realClick = HTMLAnchorElement.prototype.click
    const clicked: string[] = []
    HTMLAnchorElement.prototype.click = function stubbed(this: HTMLAnchorElement) {
      clicked.push(this.download)
    }
    try {
      renderList()
      selectAll()
      // Two "Export" buttons exist once rows are selected: the header's (exports
      // the current view) and the bulk bar's (exports the selection) — the bulk
      // bar's renders second in DOM order.
      const exportButtons = screen.getAllByRole('button', { name: /^Export$/i })
      fireEvent.click(exportButtons[exportButtons.length - 1])
      expect(clicked).toHaveLength(1)
      expect(clicked[0]).toMatch(/^issues-selected-\d{4}-\d{2}-\d{2}\.csv$/)
    } finally {
      HTMLAnchorElement.prototype.click = realClick
    }
  })

  it('the clear (X) control empties the selection', () => {
    renderList()
    selectAll()
    expect(screen.getByRole('button', { name: /^Change Status$/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Clear selection/i }))
    expect(screen.queryByRole('button', { name: /^Change Status$/i })).toBeNull()
  })

  it('the status modal dismisses via Cancel and via its header Close', () => {
    renderList()
    selectAll()
    fireEvent.click(screen.getByRole('button', { name: /^Change Status$/i }))
    expect(screen.getByText(/This will update/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^Cancel$/i }))
    expect(screen.queryByText(/This will update/i)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /^Change Status$/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByText(/This will update/i)).toBeNull()
  })
})

describe('the Linked column', () => {
  it('opens the correlation modal, which closes via its own Close control', () => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))
    const [firstLinkedBtn] = screen.getAllByRole('button', { name: /review correlated issues/i })
    fireEvent.click(firstLinkedBtn)

    const dialog = screen.getByText('Same existing issues').closest('[role="dialog"]') as HTMLElement
    expect(dialog).toBeTruthy()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    expect(screen.queryByText('Same existing issues')).toBeNull()
  })
})
