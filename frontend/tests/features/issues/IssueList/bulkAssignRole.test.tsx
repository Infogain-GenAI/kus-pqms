// Bulk role assignment.
//
// ─── ⚠️ THIS SUITE EXISTS BECAUSE THE LAST ONE WAS SILENTLY DELETED ──────────
//
// The feature, its store function, its i18n keys AND a dedicated test suite were
// all lost when a merge let main's Issue List rewrite win at the old file's path.
// Nothing conflicted; no gate failed; two reviewers missed it. It was found on a
// post-push review, and `scripts/check-merge-loss.mjs` was written afterwards to
// catch the class.
//
// So the assertions here deliberately pin the two things a rebuild is most likely
// to get wrong, both of which were documented decisions before the loss:
//   · it writes `assigneeRole` and NEVER `ownerRole`;
//   · every affected issue gets its OWN audit row.
import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { IssueListScreen } from '@/features/issues/issue-list/IssueListScreen'
import { ASSIGNABLE_ROLES } from '@/data/assignableRoles'
import listMessages from '@/features/issues/issue-list/IssueListScreen.i18n'
import { renderWithStore } from '../../../support/storeHarness'

const L = listMessages.en

/** Select the first N data rows, and prove the selection actually took. */
function selectRows(n: number) {
  const boxes = screen.getAllByRole('checkbox')
  // boxes[0] is the header select-all; data rows follow.
  expect(boxes.length, 'no rows to select').toBeGreaterThan(n)
  for (let i = 1; i <= n; i++) fireEvent.click(boxes[i])
}

describe('the bulk bar offers role assignment', () => {
  it('shows the action once rows are selected, and not before', () => {
    renderWithStore(<IssueListScreen />)
    // Negative control FIRST: the bar renders nothing at zero selection, so a
    // later positive assertion cannot be passing on furniture that was always
    // there.
    expect(screen.queryByRole('button', { name: L.bulkAssignRole })).toBeNull()

    selectRows(2)
    expect(screen.getByRole('button', { name: L.bulkAssignRole })).toBeTruthy()
  })

  it('offers all FIVE canonical roles, not the three our old port allowed', () => {
    // The previous version typed the role as `RoleKey` and so could only offer
    // the session roles minus ADMIN. The canonical's menu has five.
    renderWithStore(<IssueListScreen />)
    selectRows(1)
    fireEvent.click(screen.getByRole('button', { name: L.bulkAssignRole }))

    for (const r of ASSIGNABLE_ROLES) {
      expect(screen.getByRole('button', { name: r.label }), `${r.code} missing`).toBeTruthy()
    }
    expect(ASSIGNABLE_ROLES.length).toBe(5)
  })
})

describe('assigning writes the right field', () => {
  /*
   * ⚠️ THE CHANGED ROWS ARE DERIVED FROM THE STORE, NOT FROM THE DOM.
   *
   * The first version read `(checkbox as HTMLInputElement).value` expecting the
   * issue id. The checkboxes carry no value, so `rowIds` was EMPTY and both
   * assertions below became zero-iteration loops — they PASSED while testing
   * nothing. Only the `toBeGreaterThan(0)` guard caught it.
   *
   * Diffing a before/after snapshot is both robust to that and a stronger claim:
   * it asserts EXACTLY which issues moved, so an assignment that leaked to
   * unselected rows would fail too.
   */
  const assignTo = (roleLabel: string, rows: number) => {
    const { store } = renderWithStore(<IssueListScreen />)
    selectRows(rows)
    const before = new Map(store().issues.map((i) => [i.id, { assignee: i.assigneeRole, owner: i.ownerRole }]))

    fireEvent.click(screen.getByRole('button', { name: L.bulkAssignRole }))
    fireEvent.click(screen.getByRole('button', { name: roleLabel }))

    const changed = store().issues.filter((i) => i.assigneeRole !== before.get(i.id)?.assignee)
    return { store, before, changed }
  }

  it('sets assigneeRole on exactly the selected rows and leaves ownerRole alone', () => {
    // `TE` is load-bearing: it is NOT a `RoleKey`, so this also proves the
    // vocabulary widened rather than the old three-option set surviving.
    const { before, changed } = assignTo('Test Engineer', 2)

    expect(changed.length, 'expected exactly the 2 selected rows to move').toBe(2)
    for (const i of changed) {
      expect(i.assigneeRole, `${i.id} assigneeRole`).toBe('TE')
      // THE DISTINCTION THAT WAS DOCUMENTED AND MUST SURVIVE A REBUILD:
      // ownerRole is untouched — compared to its OWN prior value, not merely
      // asserted different from the new role.
      expect(i.ownerRole, `${i.id} ownerRole must not move`).toBe(before.get(i.id)?.owner)
    }
  })

  it('writes ONE audit row per affected issue', () => {
    const { store, changed } = assignTo('After-Sales Mgr', 2)
    expect(changed.length, 'nothing changed, so there is nothing to audit').toBe(2)

    for (const i of changed) {
      const rows = store().auditFor(i.id).filter((a) => a.action === 'Bulk role assignment')
      // Exactly one: a single combined entry would leave the other issue with no
      // record, and two would double-count one action.
      expect(rows.length, `${i.id} audit rows`).toBe(1)
      expect(rows[0].detail).toContain('ASM')
    }
  })
})
