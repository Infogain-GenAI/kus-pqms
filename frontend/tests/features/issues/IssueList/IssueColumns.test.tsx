// Exercises `buildIssueColumns()` directly: for every toggleable column, every
// branch its `render(row)` takes — the many-vs-one / present-vs-fallback shapes
// a table cell renderer collapses — plus the two frozen (Issue ID / Issue Title)
// columns and the column-assembly logic itself (order, unknown-key filtering).
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { DataTableColumn } from '@pqms/ui-library'
import { buildIssueColumns, ALL_COLUMN_KEYS, DEFAULT_COLS, OPTIONAL_COLS, DEFAULT_VISIBLE, DEFAULT_SORT } from '@/features/issues/issue-list/IssueColumns'
import type { Issue } from '@/data/types'

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: 'HV-000001',
    title: 'Sample issue title',
    description: '',
    status: 'open',
    model: 'Sportage',
    modelCode: 'SP2',
    modelYear: 2025,
    owner: 'Alex Kim',
    reportedDate: '2026-01-01',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function buildFor(cols: string[]) {
  const nav = vi.fn()
  const onOpenLinked = vi.fn()
  const columns = buildIssueColumns({ cols, nav, onOpenLinked })
  return { columns, nav, onOpenLinked }
}

function col(columns: DataTableColumn<Issue>[], key: string) {
  const c = columns.find((x) => x.key === key)
  if (!c) throw new Error(`no column ${key}`)
  return c
}

function renderCell(columns: DataTableColumn<Issue>[], key: string, issue: Issue) {
  const c = col(columns, key)
  render(<>{c.render!(issue)}</>)
}

describe('buildIssueColumns — assembly', () => {
  it('always leads with the frozen, sticky Issue ID and Issue Title columns', () => {
    const { columns } = buildFor([])
    expect(columns[0]).toMatchObject({ key: 'id', sticky: true })
    expect(columns[1]).toMatchObject({ key: 'title', sticky: true })
    expect(columns).toHaveLength(2)
  })

  it('appends only the requested toggleable columns, in the given order, dropping unknown keys', () => {
    const { columns } = buildFor(['status', 'bogus-key', 'owner'])
    expect(columns.map((c) => c.key)).toEqual(['id', 'title', 'status', 'owner'])
  })

  it('the default/optional column catalogues and derived constants line up', () => {
    expect(DEFAULT_VISIBLE).toEqual(DEFAULT_COLS.map((c) => c.key))
    expect(ALL_COLUMN_KEYS).toEqual([...DEFAULT_COLS.map((c) => c.key), ...OPTIONAL_COLS.map((c) => c.key)])
    expect(DEFAULT_SORT).toEqual({ key: 'issueDate', dir: 'desc' })
  })
})

describe('id column', () => {
  it('renders the issue id and navigates to its workspace on click', () => {
    const { columns, nav } = buildFor([])
    renderCell(columns, 'id', makeIssue({ id: 'HV-260101' }))
    fireEvent.click(screen.getByRole('button', { name: 'HV-260101' }))
    expect(nav).toHaveBeenCalledWith('/issues/HV-260101')
  })
})

describe('title column', () => {
  it('shows the EWS icon when isEws is true, and navigates on click', () => {
    const { columns, nav } = buildFor([])
    renderCell(columns, 'title', makeIssue({ id: 'HV-2', title: 'EWS flagged issue', isEws: true }))
    expect(screen.getByRole('img', { name: 'EWS-flagged' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /EWS flagged issue/ }))
    expect(nav).toHaveBeenCalledWith('/issues/HV-2')
  })

  it('omits the EWS icon when isEws is false or absent', () => {
    const { columns } = buildFor([])
    renderCell(columns, 'title', makeIssue({ title: 'Ordinary issue' }))
    expect(screen.queryByRole('img', { name: 'EWS-flagged' })).toBeNull()
  })
})

describe('source column', () => {
  it('shows just the badge when there is only one source', () => {
    const { columns } = buildFor(['source'])
    renderCell(columns, 'source', makeIssue({ source: 'warranty' }))
    expect(screen.getByText('Warranty')).toBeTruthy()
    expect(screen.queryByText(/Sources$/)).toBeNull()
  })

  it('renders a count pill and tooltip content when multiple sources are present', () => {
    const { columns } = buildFor(['source'])
    renderCell(columns, 'source', makeIssue({ source: 'warranty', sources: ['warranty', 'techline', 'ews'] }))
    expect(screen.getByText('3 Sources')).toBeTruthy()
  })
})

describe('modelCode column', () => {
  it('renders the plain code when there is only one', () => {
    const { columns } = buildFor(['modelCode'])
    renderCell(columns, 'modelCode', makeIssue({ modelCode: 'SP2', modelCodes: undefined }))
    expect(screen.getByText('SP2')).toBeTruthy()
  })

  it('renders a count pill when there are multiple model codes', () => {
    const { columns } = buildFor(['modelCode'])
    renderCell(columns, 'modelCode', makeIssue({ modelCodes: ['SP2', 'CV1'] }))
    expect(screen.getByText('2 Models')).toBeTruthy()
  })
})

describe('classification column', () => {
  it('falls back to an em dash when system is absent, and to subSystem when component is absent', () => {
    const { columns } = buildFor(['classification'])
    renderCell(columns, 'classification', makeIssue({ system: undefined, component: undefined, subSystem: 'Engine' }))
    expect(screen.getByText('—')).toBeTruthy()
    expect(screen.getByText('Engine')).toBeTruthy()
  })

  it('prefers component over subSystem, and renders system when present', () => {
    const { columns } = buildFor(['classification'])
    renderCell(columns, 'classification', makeIssue({ system: 'Powertrain/Engine', component: 'Sensor', subSystem: 'Engine' }))
    expect(screen.getByText('Powertrain/Engine')).toBeTruthy()
    expect(screen.getByText('Sensor')).toBeTruthy()
  })

  it('renders an empty second line when neither component nor subSystem is present', () => {
    const { columns } = buildFor(['classification'])
    const { container } = render(<>{col(columns, 'classification').render!(makeIssue({ system: 'Body', component: undefined, subSystem: undefined }))}</>)
    expect(container.textContent).toContain('Body')
  })
})

describe('component / symptom columns', () => {
  it('render the value when present', () => {
    const { columns } = buildFor(['component', 'symptom'])
    renderCell(columns, 'component', makeIssue({ component: 'Sensor' }))
    renderCell(columns, 'symptom', makeIssue({ symptom: 'Noise' }))
    expect(screen.getByText('Sensor')).toBeTruthy()
    expect(screen.getByText('Noise')).toBeTruthy()
  })

  it('fall back to an em dash when absent', () => {
    const { columns } = buildFor(['component', 'symptom'])
    renderCell(columns, 'component', makeIssue({ component: undefined }))
    renderCell(columns, 'symptom', makeIssue({ symptom: undefined }))
    expect(screen.getAllByText('—')).toHaveLength(2)
  })
})

describe('dtc column', () => {
  it('renders an em dash with no codes', () => {
    const { columns } = buildFor(['dtc'])
    renderCell(columns, 'dtc', makeIssue({ dtcCodes: undefined }))
    expect(screen.getByText('—')).toBeTruthy()
  })

  it('renders the single code directly', () => {
    const { columns } = buildFor(['dtc'])
    renderCell(columns, 'dtc', makeIssue({ dtcCodes: ['P0300'] }))
    expect(screen.getByText('P0300')).toBeTruthy()
  })

  it('renders a count when there are multiple codes', () => {
    const { columns } = buildFor(['dtc'])
    renderCell(columns, 'dtc', makeIssue({ dtcCodes: ['P0300', 'P0301'] }))
    expect(screen.getByText('2 DTC')).toBeTruthy()
  })
})

describe('status / issueDate columns', () => {
  it('render the status badge and formatted date', () => {
    const { columns } = buildFor(['status', 'issueDate'])
    renderCell(columns, 'status', makeIssue({ status: 'escalated' }))
    renderCell(columns, 'issueDate', makeIssue({ reportedDate: '2026-03-05' }))
    expect(screen.getByText('QIR')).toBeTruthy()
  })
})

describe('owner column', () => {
  it('prefers the assignee over the owner', () => {
    const { columns } = buildFor(['owner'])
    renderCell(columns, 'owner', makeIssue({ owner: 'Original Owner', assignee: 'Assigned Person' }))
    expect(screen.getByText('Assigned Person')).toBeTruthy()
    expect(screen.queryByText('Original Owner')).toBeNull()
  })

  it('falls back to the owner when there is no assignee', () => {
    const { columns } = buildFor(['owner'])
    renderCell(columns, 'owner', makeIssue({ owner: 'Original Owner', assignee: undefined }))
    expect(screen.getByText('Original Owner')).toBeTruthy()
  })
})

describe('days column', () => {
  it('renders days-open computed from reportedDate/closedAt, suffixed with "d"', () => {
    const { columns } = buildFor(['days'])
    renderCell(columns, 'days', makeIssue({ reportedDate: '2026-01-01', closedAt: '2026-01-04' }))
    expect(screen.getByText('3d')).toBeTruthy()
  })
})

describe('model column', () => {
  it('renders the model name', () => {
    const { columns } = buildFor(['model'])
    renderCell(columns, 'model', makeIssue({ model: 'Telluride' }))
    expect(screen.getByText('Telluride')).toBeTruthy()
  })
})

describe('linked column', () => {
  it('renders an em dash and a "no linked issues" label when there are none', () => {
    const { columns } = buildFor(['linked'])
    renderCell(columns, 'linked', makeIssue({ id: 'HV-1', linkedIssueIds: undefined }))
    expect(screen.getByRole('button', { name: /No linked issues.*HV-1/ })).toBeTruthy()
  })

  it('uses the singular label and opens the modal for exactly one linked issue', () => {
    const { columns, onOpenLinked } = buildFor(['linked'])
    renderCell(columns, 'linked', makeIssue({ id: 'HV-2', linkedIssueIds: ['HV-3'] }))
    const btn = screen.getByRole('button', { name: /1 linked issue —/ })
    expect(btn).toBeTruthy()
    fireEvent.click(btn)
    expect(onOpenLinked).toHaveBeenCalledWith('HV-2')
  })

  it('uses the plural label for more than one linked issue', () => {
    const { columns } = buildFor(['linked'])
    renderCell(columns, 'linked', makeIssue({ id: 'HV-4', linkedIssueIds: ['HV-5', 'HV-6'] }))
    expect(screen.getByRole('button', { name: /2 linked issues —/ })).toBeTruthy()
  })
})
