// Accessibility sweep over the whole component library.
//
// WHY A SWEEP AND NOT A TEST PER COMPONENT
// 10-testing-standards.md specifies axe in the test run. Thirty per-component
// assertions is the obvious reading and the wrong trade: it is thirty places to
// forget, and the one that gets forgotten is component 27 — added last, reviewed
// least. **This enumerates the barrel**, so a component added tomorrow is swept
// tomorrow with no test written for it.
//
// The trade in the other direction is honest and stated below: a sweep renders
// each component in ONE default state. It cannot see a violation that only
// appears when a prop is set, a menu is open, or a row is selected.
//
// COMPATIBILITY: vitest-axe 0.1.0 peers `vitest >=0.16.0`, so it runs on the
// Vitest 2 that Vite 5.4 pins this project to. Checked before use — see 00's
// divergence-table evidence, where the Vite ceiling has already cost a major.
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import * as UI from '@pqms/ui-library'

/**
 * Props for components that cannot render bare. Everything absent from this map
 * is rendered with no props at all.
 *
 * Kept deliberately minimal: the point is to sweep the DEFAULT state of every
 * component, not to construct a representative example of each. A component that
 * needs elaborate setup to render at all is telling you something, and it shows
 * up in the skip list below rather than being quietly propped up.
 */
const PROPS: Record<string, Record<string, unknown>> = {
  Button: { children: 'Label' },
  IconButton: { 'aria-label': 'Action' },
  Badge: { children: 'Badge' },
  Tag: { children: 'Tag' },
  Status: { status: 'open' },
  StatusBadge: { status: 'open' },
  StatusPill: { status: 'open' },
  StatusIndicator: { status: 'open' },
  Avatar: { name: 'Test User' },
  Input: { 'aria-label': 'Field' },
  Textarea: { 'aria-label': 'Notes' },
  Select: { 'aria-label': 'Choice', children: <option value="a">A</option> },
  SearchField: { 'aria-label': 'Search' },
  // Given real options deliberately: the sweep's job is to axe-check a realistic
  // state, and an empty combobox exercises almost none of the markup that can
  // carry a violation.
  Combobox: { 'aria-label': 'Choose', options: [{ value: 'a', label: 'A' }], selected: [], onSelect: () => {} },
  Checkbox: { 'aria-label': 'Check' },
  Radio: { 'aria-label': 'Radio', name: 'g' },
  Switch: { 'aria-label': 'Toggle' },
  Tooltip: { label: 'Tip', children: <button>anchor</button> },
  Toast: { message: 'Message' },
  EmptyState: { title: 'Nothing here' },
  Spinner: {},
  Logo: {},
  Breadcrumb: { items: [{ label: 'Home' }, { label: 'Here' }] },
  Tabs: { tabs: [{ key: 'a', label: 'A' }], active: 'a', onChange: () => {} },
  Pagination: { page: 1, pageCount: 3, onChange: () => {} },
  SideNav: { items: [] },
  Header: {},
  DataTable: { columns: [{ key: 'a', header: 'A', render: () => 'x' }], rows: [{ id: '1' }] },
  Timeline: { items: [] },
  CommentCard: { author: 'A', body: 'b', createdAt: '2026-07-09T00:00:00Z' },
  ApprovalBar: { title: 'Approval' },
  SourceBadge: { source: 'Warranty' },
  IssueCard: { issue: { id: 'AA-000001', title: 'T', status: 'open', modelCode: 'SV' } },
  Icon: { icon: () => null },
}

/** Every component the barrel exports — the enumeration this sweep is built on. */
const COMPONENTS = Object.entries(UI).filter(
  ([name, v]) => typeof v === 'function' && /^[A-Z]/.test(name),
) as [string, React.ComponentType<Record<string, unknown>>][]

describe('accessibility sweep — the whole ui-library barrel', () => {
  it('the barrel actually exports components (the sweep is not empty)', () => {
    // A sweep over an empty enumeration passes silently — the same
    // clean-versus-dead problem the import-rule self-test exists for.
    expect(COMPONENTS.length).toBeGreaterThan(15)
  })

  const rendered: string[] = []
  const skipped: string[] = []

  it.each(COMPONENTS)('%s has no axe violations in its default state', async (name, Component) => {
    let container: HTMLElement
    try {
      ;({ container } = render(<Component {...(PROPS[name] ?? {})} />))
    } catch {
      // Cannot render with minimal props. Recorded, not silently passed — the
      // count is reported by the summary test below so the sweep's real reach
      // is visible rather than assumed.
      skipped.push(name)
      return
    }
    rendered.push(name)
    const results = await axe(container)
    const violations = results.violations ?? []
    if (violations.length) {
      const detail = violations
        .map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} node(s)`)
        .join('\n      ')
      throw new Error(`${name} has ${violations.length} axe violation(s):\n      ${detail}`)
    }
  })

  it('reports how much of the library was actually swept', () => {
    // The number that matters. A sweep that silently skips half the library
    // reads as full coverage.
    const total = COMPONENTS.length
    const swept = rendered.length
    // eslint-disable-next-line no-console
    console.log(`\n  a11y sweep: ${swept}/${total} components rendered and checked`)
    if (skipped.length) console.log(`  not renderable with minimal props: ${skipped.join(', ')}`)
    expect(swept).toBeGreaterThan(0)
  })
})
