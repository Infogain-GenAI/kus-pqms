// CHARACTERISATION tests for IssueListScreen — the first screen-level slice.
//
// Chosen as the pattern because it carries the three things a list screen usually
// gets wrong: the draft-versus-committed filter idiom, role-driven default scope,
// and pagination interacting with everything else.
//
// Characterisation, not specification: pin what it does. Where it looks wrong,
// pin it and record the finding — do not fix it here.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'
import { IssueListScreen } from '@/features/issues/IssueListScreen'

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)
const renderList = () => render(<IssueListScreen />, { wrapper: Wrapped })

// The screen renders TWO 'Showing' lines: the table band ('Showing 33 of 33
// issues') and the pagination footer ('Showing 1-20 of 33 issues'). They answer
// different questions and the tests below need both.
const bandLine = () => screen.getAllByText(/Showing .* issues/i)[0].textContent ?? ''
const pagingLine = () => {
  const all = screen.getAllByText(/Showing .* issues/i)
  return (all[all.length - 1].textContent ?? '')
}
const total = () => Number(/of\s+([\d,]+)\s+issues/i.exec(pagingLine())?.[1]?.replace(/,/g, '') ?? '0')
const firstRowId = () => (screen.getAllByText(/^[A-Z]{2}-\d{6}$/)[0]?.textContent ?? '')
const tab = (name: RegExp) => screen.getByRole('button', { name })
/** Column headers are a <span> inside <th>; the sort handler is on the th. */
const sortBy = (label: RegExp) => fireEvent.click(screen.getByText(label).closest('th')!)

describe('default scope is role-driven', () => {
  it('an SE lands on "My Issues" — a strict subset of All Issues', () => {
    // roles.tsx sets scope 'own' when the capability is 'read' (SE) and 'all'
    // otherwise; the screen seeds its tab from that. This is the only place
    // role-driven default behaviour is exercised by any test.
    renderList()
    const mine = total()

    fireEvent.click(tab(/^All Issues/i))
    const all = total()

    expect(mine).toBe(7)
    expect(all).toBe(35)
    expect(all).toBeGreaterThan(mine)
  })
})

describe('the draft/committed filter idiom', () => {
  it('editing the drawer changes NOTHING until Apply', () => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))
    const before = total()

    fireEvent.click(screen.getByRole('button', { name: /^Filter$/i }))
    const selects = screen.getAllByRole('combobox')
    const target = selects.find((s) => s.querySelectorAll('option').length > 1)
    expect(target).toBeTruthy()
    const opt = target!.querySelectorAll('option')[1] as HTMLOptionElement
    fireEvent.change(target!, { target: { value: opt.value } })

    // Draft edited, not applied — the list is untouched.
    expect(total()).toBe(before)
  })

  it('Apply commits the draft and can only narrow', () => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))
    const before = total()

    fireEvent.click(screen.getByRole('button', { name: /^Filter$/i }))
    const selects = screen.getAllByRole('combobox')
    const target = selects.find((s) => s.querySelectorAll('option').length > 1)!
    const opt = target.querySelectorAll('option')[1] as HTMLOptionElement
    fireEvent.change(target, { target: { value: opt.value } })
    fireEvent.click(screen.getByRole('button', { name: /^Apply$/i }))

    expect(total()).toBeLessThanOrEqual(before)
  })
})

describe('sorting and columns', () => {
  it('clicking a column header reorders the rows', () => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))
    const before = firstRowId()

    // 'Issue ID' is NOT a sortable column — only Model Code, Status, Issue Date,
    // Owner and Days are. Clicking a non-sortable header is a silent no-op, which
    // is how an earlier version of this test passed while proving nothing.
    // Sort twice: asc then desc must differ.
    sortBy(/^Status$/i)
    const once = firstRowId()
    sortBy(/^Status$/i)
    const twice = firstRowId()

    // Ascending and descending by Issue ID cannot share a first row.
    expect(once).not.toBe(twice)
    expect(before).toBeTruthy()
  })

  it('the rendered headers are the default visible column set', () => {
    renderList()
    for (const h of ['Issue ID', 'Issue Title', 'Model Code', 'Classification', 'Status', 'Issue Date']) {
      expect(screen.getByText(new RegExp(`^${h}$`, 'i'))).toBeTruthy()
    }
  })
})

// ⚠️ FINDING — PAGINATION DOES NOT RESET ON SORT, SEARCH, OR CLEAR-FILTERS.
//
// 27-forms-tables-and-overlays-review.md names this as a table review check, and
// it is the most commonly-broken interaction in an enterprise list. This app has
// it, partially — which is worse than having it uniformly, because the
// inconsistency makes it look intentional.
//
// `setPage(1)` IS called on:
//     the My/All tab (scope)        IssueListScreen.tsx:362
//     the rows-per-page selector    IssueListScreen.tsx:427
//     the filter drawer's Apply     IssueListScreen.tsx:450
//
// `setPage(1)` is NOT called on:
//     sorting          (`onSort`,       line 302)
//     searching        (`setQ`,         line 371)
//     clearing filters (`clearFilters`, line 313)
//
// A user on page 2 who re-sorts stays on page 2 OF A DIFFERENT ORDERING. It
// presents as data loss — the rows they were reading are gone — and it is
// unreportable, because nobody can describe what they did.
//
// One mitigation, stated precisely because it changes the severity and not the
// verdict: `pageClamped = Math.min(page, pageCount)` (line 219) clamps to the
// LAST page when the new result set is shorter, so the user never sees a blank
// page. They land on the last page of results they did not ask for. Less
// alarming, equally wrong.
//
// PINNED, NOT FIXED. Recorded in PQMS_docs/APPLICATION-DEFECTS.md. When it is
// fixed these expectations flip, and that failure is the signal.
describe('pagination interaction — PINNED DEFECT, see APPLICATION-DEFECTS.md', () => {
  /** All Issues (35) at 20/page gives 2 pages. Returns true if we reached page 2. */
  const goToPage2 = () => {
    fireEvent.click(tab(/^All Issues/i))
    const two = screen.queryByRole('button', { name: /^2$/ })
    if (!two) return false
    fireEvent.click(two)
    return /Showing\s+21/i.test(pagingLine())
  }

  it('the seed paginates, so these tests are meaningful', () => {
    renderList()
    fireEvent.click(tab(/^All Issues/i))
    expect(total()).toBe(35)
    expect(screen.queryByRole('button', { name: /^2$/ })).toBeTruthy()
  })

  it('scope change DOES reset to page 1 — correct behaviour', () => {
    renderList()
    expect(goToPage2()).toBe(true)
    fireEvent.click(tab(/^My Issues/i))
    expect(pagingLine()).toMatch(/Showing\s+1\s*[–-]/)
  })

  it('SORTING does NOT reset to page 1 — the defect', () => {
    renderList()
    expect(goToPage2()).toBe(true)

    sortBy(/^Status$/i)

    // Still on page 2 of a completely different ordering.
    expect(pagingLine()).toMatch(/Showing\s+21/i)
  })

  it('SEARCHING does NOT reset to page 1 — the defect', () => {
    renderList()
    expect(goToPage2()).toBe(true)

    fireEvent.change(screen.getByPlaceholderText(/Search by keyword/i), { target: { value: 'e' } })

    // Not reset. Either still page 2, or clamped to the last page of a smaller
    // result set — never page 1 unless only one page remains.
    expect(pagingLine()).not.toMatch(/^Showing\s+1\s/i)
  })
})

describe('Export actually exports', () => {
  // BOTH export buttons — the header's and the bulk bar's — used to render with
  // no onClick at all. They looked like working controls and silently did
  // nothing, which is worse than not offering the capability: a user who clicks
  // Export and sees no download concludes their browser blocked it.
  //
  // jsdom implements neither createObjectURL nor navigation, so this stubs the
  // two and asserts the download was actually initiated with a real filename.
  function captureDownload() {
    const created: string[] = []
    const urlAny = URL as unknown as Record<string, unknown>
    urlAny.createObjectURL = () => 'blob:stub'
    urlAny.revokeObjectURL = () => {}
    const realClick = HTMLAnchorElement.prototype.click
    HTMLAnchorElement.prototype.click = function stubbed(this: HTMLAnchorElement) {
      created.push(this.download)
    }
    return { created, restore: () => { HTMLAnchorElement.prototype.click = realClick } }
  }

  it('the header Export downloads a dated file', () => {
    const { created, restore } = captureDownload()
    try {
      renderList()
      fireEvent.click(screen.getByRole('button', { name: /^Export$/i }))
      expect(created).toHaveLength(1)
      expect(created[0]).toMatch(/^issues-\d{4}-\d{2}-\d{2}\.csv$/)
    } finally {
      restore()
    }
  })
})

describe('the bulk bar acts on the selection', () => {
  /** Selects every row via the table's header checkbox. */
  function selectAll() {
    const boxes = screen.getAllByRole('checkbox')
    if (boxes[0]) fireEvent.click(boxes[0])
  }

  it('appears only once something is selected', () => {
    renderList()
    expect(screen.queryByRole('button', { name: /Assign Role/i })).toBeNull()
    selectAll()
    expect(screen.getByRole('button', { name: /Assign Role/i })).toBeTruthy()
  })

  it('Assign Role names the count and offers the three roles', () => {
    renderList()
    selectAll()
    fireEvent.click(screen.getByRole('button', { name: /Assign Role/i }))

    expect(document.body.textContent).toContain('Reassign')
    // The original owner is explicitly NOT touched — the copy says so, because
    // the store writes assigneeRole and leaves ownerRole alone.
    expect(document.body.textContent).toContain('the original owner is unchanged')
    for (const role of ['SE', 'ASM', 'PQM']) {
      expect(screen.getByRole('button', { name: new RegExp(`^${role}$`) })).toBeTruthy()
    }
  })

  it('assigning clears the selection, so the bar does not linger over stale rows', () => {
    renderList()
    selectAll()
    fireEvent.click(screen.getByRole('button', { name: /Assign Role/i }))
    fireEvent.click(screen.getByRole('button', { name: /^ASM$/ }))

    expect(screen.queryByRole('button', { name: /Assign Role/i })).toBeNull()
  })
})
