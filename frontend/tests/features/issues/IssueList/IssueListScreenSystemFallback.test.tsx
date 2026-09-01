// Every seeded issue has `system` set, so IssueListScreen's classification
// filter guard (`(i.system ?? '').split('/')[0].trim()`) never takes its `??`
// fallback under real data. This is its own file — like tableErrorBoundary's
// store mock — because `vi.mock` is hoisted and file-scoped: mixing a mocked
// and an unmocked `@/data/store` in one file risks exactly the module-identity
// mismatch (two different RoleContext/StoreContext instances) that a
// mid-test `vi.resetModules()` would otherwise cause.
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'
import { IssueListScreen } from '@/features/issues/issue-list/IssueListScreen'

vi.mock('@/data/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/store')>()
  return {
    ...actual,
    useStore: () => {
      const real = actual.useStore()
      return {
        ...real,
        issues: [{ ...real.issues[0], id: 'ZZ-000001', system: undefined, modelCode: '', modelCodes: undefined }, ...real.issues.slice(1)],
      }
    },
  }
})

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)

describe('the filtered memo — the classification guard real seed data cannot reach', () => {
  it('renders the options list and applies a system filter without throwing', async () => {
    render(<IssueListScreen />, { wrapper: Wrapped })
    fireEvent.click(screen.getByRole('button', { name: /^All Issues/i }))

    // Search (not page position, which depends on sort order) is what makes this
    // row findable regardless of where the default issueDate-desc sort places it.
    fireEvent.change(screen.getByPlaceholderText(/Search by keyword/i), { target: { value: 'ZZ-000001' } })
    await waitFor(() => expect(screen.getByText('ZZ-000001')).toBeTruthy())

    // Both `(i.system ?? '')` occurrences — the options-list derivation and the
    // row-filter comparison — only run this row's fallback when a system filter
    // is actually applied.
    fireEvent.click(screen.getByRole('button', { name: /^Filter/i }))
    const select = screen.getByRole('combobox', { name: 'System' }) as HTMLSelectElement
    fireEvent.change(select, { target: { value: select.options[1].value } })
    fireEvent.click(screen.getByRole('button', { name: /^Apply$/i }))

    expect(screen.queryByText('ZZ-000001')).toBeNull()
  })
})

describe('the sort comparator — the modelCode fallback real seed data cannot reach', () => {
  it('sorts by Model Code without throwing when an issue has an empty one', async () => {
    render(<IssueListScreen />, { wrapper: Wrapped })
    fireEvent.click(screen.getByRole('button', { name: /^All Issues/i }))

    // A single-row result never invokes the sort comparator at all (nothing to
    // compare) — raise the page size so this row is on-page alongside others
    // for the comparator to actually run `i.modelCode || i.model` against.
    fireEvent.change(screen.getByRole('combobox', { name: /Rows/i }), { target: { value: '100' } })

    // `i.modelCode || i.model` — the comparator falls back to the model name
    // when modelCode is empty, per this row's mocked shape.
    fireEvent.click(screen.getByText('Model Code').closest('th')!)
    expect(screen.getAllByText(/^[A-Z]{2}-\d{6}$/).length).toBeGreaterThan(1)
  })
})
