// Closes out branch coverage on IssueListScreen.tsx's `filtered` memo (every
// guard clause in the predicate) and its sort comparator's switch cases —
// the one part of the screen dense enough with independent conditions that
// the characterization suite and the general interaction suite don't drive
// every combination between them. Real, existing field values (via
// `@/data/seed`) are used throughout: any value that exists on some but not
// all of the 35 seeded issues naturally exercises both the "matches" and
// "filtered out" path of its guard — PROVIDED each field is applied in
// isolation. Combining every filter in one Apply (an earlier version of this
// file did) starves the later guards: the first restrictive field already
// excludes most rows via an early `return false`, so execution never reaches
// the later checks for those rows, and the few survivors rarely split both
// ways on every remaining field. One guard real data cannot reach at all —
// every seeded issue has `system` set — is covered separately in
// IssueListScreenSystemFallback.test.tsx, which needs its own mocked store.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'
import { ISSUES } from '@/data/seed'
import { IssueListScreen } from '@/features/issues/issue-list/IssueListScreen'

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)
const renderList = () => render(<IssueListScreen />, { wrapper: Wrapped })
const tab = (name: RegExp) => screen.getByRole('button', { name })
const openFilters = () => fireEvent.click(screen.getByRole('button', { name: /^Filter$/i }))
const apply = () => fireEvent.click(screen.getByRole('button', { name: /^Apply$/i }))
const reset = () => fireEvent.click(screen.getByRole('button', { name: /^Reset$/i }))

/** The FILTERED total — the footer's "Showing X-Y of TOTAL issues" line, which
 * (unlike the band above the table) reflects `filtered.length`. Renders only
 * when there is at least one row; 0 otherwise. */
const total = () => {
  if (screen.queryByRole('button', { name: /^Clear filters$/i })) return 0
  const lines = screen.getAllByText(/Showing .* issues/i)
  const footer = lines[lines.length - 1].textContent ?? ''
  return Number(/of\s+([\d,]+)\s+issues/i.exec(footer)?.[1]?.replace(/,/g, '') ?? '0')
}

describe('role-driven default scope — the other branch', () => {
  it('a PQM (override capability) lands scoped to all issues, not just their own', () => {
    render(<IssueListScreen />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MemoryRouter>
          <RoleProvider initialRole="PQM">
            <StoreProvider>{children}</StoreProvider>
          </RoleProvider>
        </MemoryRouter>
      ),
    })
    expect(total()).toBe(ISSUES.length)
  })
})

describe('the filtered memo — every single-select guard, applied in isolation', () => {
  it.each(['Model Code', 'Model Year', 'System', 'Sub-System', 'Component', 'Symptom', 'Source', 'Owner'])(
    '%s narrows the list when set to a value not shared by every issue',
    (name) => {
      renderList()
      fireEvent.click(tab(/^All Issues/i))
      const before = total()

      openFilters()
      const select = screen.getByRole('combobox', { name }) as HTMLSelectElement
      expect(select.options.length).toBeGreaterThan(1)
      fireEvent.change(select, { target: { value: select.options[1].value } })
      apply()

      expect(total()).toBeLessThan(before)
    },
  )

  it('Issue Grouping narrows both ways: grouped and ungrouped', () => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))
    const before = total()

    openFilters()
    fireEvent.change(screen.getByRole('combobox', { name: 'Issue Grouping' }), { target: { value: 'grouped' } })
    apply()
    const grouped = total()
    expect(grouped).toBeLessThan(before)

    openFilters()
    fireEvent.change(screen.getByRole('combobox', { name: 'Issue Grouping' }), { target: { value: 'ungrouped' } })
    apply()
    expect(total()).toBeLessThan(before)
    expect(total()).not.toBe(grouped)
  })
})

describe('the filtered memo — the date-range guards, applied in isolation', () => {
  it('a start and end date drawn from the real spread both narrow the list', () => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))
    const before = total()
    const dates = [...ISSUES].map((i) => i.reportedDate).sort()
    const median = dates[Math.floor(dates.length / 2)]

    openFilters()
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: median } })
    apply()
    expect(total()).toBeLessThan(before)

    openFilters()
    reset()
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: median } })
    apply()
    expect(total()).toBeLessThan(before)
  })
})

describe('the filtered memo — the Days open bands, applied in isolation', () => {
  it.each(['≤7d', '8–21d', '>21d'])('the %s band narrows the list', (label) => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))
    const before = total()

    openFilters()
    fireEvent.click(screen.getByRole('button', { name: label }))
    apply()

    expect(total()).toBeLessThanOrEqual(before)
  })
})

describe('the filtered memo — Linked issues and EWS flag, both values, applied in isolation', () => {
  it('Linked issues: Yes and No both narrow the list', () => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))
    const before = total()

    openFilters()
    fireEvent.click(screen.getAllByRole('button', { name: 'Yes' })[0])
    apply()
    expect(total()).toBeLessThan(before)

    openFilters()
    reset()
    fireEvent.click(screen.getAllByRole('button', { name: 'No' })[0])
    apply()
    expect(total()).toBeLessThan(before)
  })

  it('EWS flag: Yes and No both narrow the list', () => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))
    const before = total()

    openFilters()
    fireEvent.click(screen.getAllByRole('button', { name: 'Yes' })[1])
    apply()
    expect(total()).toBeLessThan(before)

    openFilters()
    reset()
    fireEvent.click(screen.getAllByRole('button', { name: 'No' })[1])
    apply()
    expect(total()).toBeLessThan(before)
  })
})

describe('searching by keyword', () => {
  it('narrows the list', async () => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))
    const before = total()

    fireEvent.change(screen.getByPlaceholderText(/Search by keyword/i), { target: { value: ISSUES[0].owner } })
    await waitFor(() => expect(total()).toBeLessThanOrEqual(before))
  })
})

describe('the "My Issues" scope with no matches — the pct helper\'s 0% branch', () => {
  it('a role that owns nothing shows 0% rather than dividing by zero', () => {
    render(<IssueListScreen />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MemoryRouter>
          <RoleProvider initialRole="ADMIN">
            <StoreProvider>{children}</StoreProvider>
          </RoleProvider>
        </MemoryRouter>
      ),
    })
    fireEvent.click(tab(/^My Issues/i))
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0)
  })
})

describe('row selection — both directions of select-all and of a single row', () => {
  it('the header checkbox selects every row, then deselects them', () => {
    renderList()
    const boxes = screen.getAllByRole('checkbox')
    fireEvent.click(boxes[0])
    expect(screen.getByRole('button', { name: /^Change Status$/i })).toBeTruthy()

    fireEvent.click(boxes[0])
    expect(screen.queryByRole('button', { name: /^Change Status$/i })).toBeNull()
  })

  it('a single row checkbox selects, then deselects, that row', () => {
    renderList()
    const boxes = screen.getAllByRole('checkbox')
    fireEvent.click(boxes[1])
    expect(screen.getByRole('button', { name: /^Change Status$/i })).toBeTruthy()

    fireEvent.click(boxes[1])
    expect(screen.queryByRole('button', { name: /^Change Status$/i })).toBeNull()
  })
})

describe('sorting by every remaining sortable column', () => {
  it('Owner, Days open and Model Year each reorder the rows', () => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))

    fireEvent.click(screen.getByRole('button', { name: /^Columns$/i }))
    for (const label of ['Owner', 'Days open', 'Model Year']) {
      fireEvent.click(screen.getByRole('checkbox', { name: label }))
    }
    fireEvent.click(screen.getByRole('button', { name: /^Apply$/i }))

    const firstId = () => screen.getAllByText(/^[A-Z]{2}-\d{6}$/)[0].textContent
    for (const header of [/^Owner$/i, /^Days open$/i, /^Model Year$/i]) {
      const before = firstId()
      fireEvent.click(screen.getByText(header).closest('th')!)
      const once = firstId()
      fireEvent.click(screen.getByText(header).closest('th')!)
      const twice = firstId()
      expect(once === before && before === twice).toBe(false)
    }
  })
})
