// Proves the table-only error boundary added around IssueListScreen's
// <DataTable>/<Footer> pair: a render error confined to one column's cell
// renderer must blank only the table region, not the KPI strip, tab switcher,
// search box or Columns/Filter controls above it — and must clear once the
// cause (the offending column) is removed, via the boundary's resetKey.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { ReactNode } from 'react'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'
import { IssueListScreen } from '@/features/issues/issue-list/IssueListScreen'
import { resetLoggerTransport, setLoggerTransport, type LoggerTransport } from '@/shared/logger'

// Only `combinedSources` is overridden — everything else is the real module.
// The Source column (`IssueColumns.tsx`) is the one renderer that calls it,
// so the throw only fires once that column is switched on, inside the table.
vi.mock('@/data/util', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/util')>()
  return {
    ...actual,
    combinedSources: () => {
      throw new Error('boom: combinedSources')
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
const renderList = () => render(<IssueListScreen />, { wrapper: Wrapped })

const fallback = () => screen.queryByTestId('error-boundary-fallback')

/** Opens Columns, sets Source to the given state, and Applies. */
function setSourceColumn(on: boolean) {
  fireEvent.click(screen.getByRole('button', { name: /^Columns$/i }))
  const box = screen.getByRole('checkbox', { name: 'Source' }) as HTMLInputElement
  if (box.checked !== on) fireEvent.click(box)
  fireEvent.click(screen.getByRole('button', { name: /^Apply$/i }))
}

let restoreConsole: () => void

beforeEach(() => {
  // React logs the caught error to console.error itself; silence it so a
  // deliberate throw does not read as a suite failure.
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  restoreConsole = () => spy.mockRestore()
})

afterEach(() => {
  restoreConsole()
  resetLoggerTransport()
})

describe('the table-only error boundary', () => {
  it('a throwing column renderer blanks only the table, not the rest of the page', () => {
    renderList()
    expect(fallback()).toBeNull()

    setSourceColumn(true)

    expect(fallback()).toBeTruthy()
    // The surrounding page is untouched: title, KPI strip and toolbar survive.
    expect(screen.getByText('Issue list')).toBeTruthy()
    expect(screen.getByRole('button', { name: /^Filter/i })).toBeTruthy()
    expect(screen.getByPlaceholderText(/Search by keyword/i)).toBeTruthy()
  })

  it('names the table as the source in the log', () => {
    const errors: { err: unknown; context?: Record<string, unknown> }[] = []
    const t: LoggerTransport = {
      error: (err, context) => errors.push({ err, context }),
      warn: () => {},
      info: () => {},
    }
    setLoggerTransport(t)

    renderList()
    setSourceColumn(true)

    expect(errors).toHaveLength(1)
    expect(errors[0].context?.source).toBe('issue-list:table')
  })

  it('offers Try again, and re-catches while the cause has not gone away', () => {
    renderList()
    setSourceColumn(true)
    expect(fallback()).toBeTruthy()

    fireEvent.click(screen.getByTestId('error-boundary-retry'))
    expect(fallback()).toBeTruthy()
  })

  it('clears once the offending column is removed — the resetKey wiring', () => {
    renderList()
    setSourceColumn(true)
    expect(fallback()).toBeTruthy()

    setSourceColumn(false)

    expect(fallback()).toBeNull()
    expect(screen.getByText('Issue ID')).toBeTruthy()
  })
})
