// Issue Entry's View History — TWO modals, chosen by CARD TYPE.
//
// ⚠️ THE AXIS IS THE WHOLE POINT. Before this, both surfaces' history buttons
// opened one flat popup, so two controls the design means to differ behaved
// identically. The canonical builds both surfaces' cards from a single
// `_buildEntry` that switches on what the CARD IS:
//
//   a group card      → openGroupHistory  → "Related Issues & History"
//   a standalone card → openIssueHistory  → "View History"
//
// The tempting reading — that the difference is per-SURFACE — is wrong, and it is
// wrong in a way nothing catches: route both to one modal and every screen still
// renders. So what is pinned here is which modal opens, and the one structural
// difference between them that a reader would otherwise "fix".
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { RoleProvider } from '@/data/roles'
import { StoreProvider, useStore } from '@/data/store'
import { GroupHistoryModal, IssueHistoryModal } from '@/features/issues/issue-entry/HistoryModals'
import messages from '@/features/issues/issue-entry/IssueEntry.i18n'
import { HISTORY_CATALOGUE } from '@/features/issues/workspace/history/history.catalogue'

const M = messages.en

/** A seeded four-member group, and a seeded issue with a real trail. */
const GROUPED = 'EE-260023'
/** Seeded, with no audit trail of its own — the deliberate empty state. */
const UNTRAILED = 'ST-260002'

const Wrapped = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)

let captured: ReturnType<typeof useStore> | null = null
const body = () => document.body.textContent ?? ''

/**
 * Elements whose ENTIRE text is `label`.
 *
 * Substring counting over `document.body.textContent` cannot be used for badges:
 * "Parent" also occurs inside the group audit detail's "Parent Issue: …".
 */
const badgeCount = (label: string) => screen.queryAllByText(label, { exact: true }).length

function openGroup(anchor = GROUPED) {
  captured = null
  const Harness = () => {
    const store = useStore()
    captured = store
    return (
      <GroupHistoryModal
        members={store.groupMembers(anchor)}
        entriesFor={(id) => store.auditFor(id)}
        onOpenIssue={() => {}}
        onClose={() => {}}
      />
    )
  }
  render(<Harness />, { wrapper: Wrapped })
  return { store: () => captured! }
}

function openIssue(id: string) {
  captured = null
  const Harness = () => {
    const store = useStore()
    captured = store
    return (
      <IssueHistoryModal issue={store.getIssue(id) ?? null} entries={store.auditFor(id)} onClose={() => {}} />
    )
  }
  render(<Harness />, { wrapper: Wrapped })
  return { store: () => captured! }
}

describe('the two modals are actually different modals', () => {
  it('the GROUP modal is titled for the group and lists every member', () => {
    const { store } = openGroup()
    const members = store().groupMembers(GROUPED)
    expect(members.length, 'fixture must be a multi-member group').toBeGreaterThan(2)

    expect(body()).toContain(M.groupHistoryTitle)
    for (const m of members) expect(body(), `${m.id} missing from the group modal`).toContain(m.id)
  })

  it('the SINGLE-ISSUE modal is titled differently and shows no member list', () => {
    openIssue(GROUPED)
    expect(body()).toContain(M.issueHistoryTitle)
    // Deliberately NOT the group title — same anchor, different modal.
    expect(body(), 'the single-issue modal used the group heading').not.toContain(M.groupHistoryTitle)

    /*
     * ⚠️ THIS FIRST ASSERTED THAT NO OTHER MEMBER'S ID APPEARS, AND THAT WAS
     * WRONG. Audit details legitimately name other issues — 'Issues linked'
     * carries the id list, and the group row names every member and the parent.
     * Those ids SHOULD be readable. What must be absent is the group modal's
     * STRUCTURE, so that is what is checked: no Parent/Child badges, because
     * this modal has no member rows to badge.
     */
    expect(badgeCount(M.badgeParent), 'single-issue modal rendered member badges').toBe(0)
    expect(badgeCount(M.badgeChild), 'single-issue modal rendered member badges').toBe(0)
  })

  /*
   * ⚠️ AN ABSENCE THAT IS SPECIFIED, NOT AN OMISSION. The canonical's own comment
   * says the single-issue modal is the "same timeline UI as View Group History,
   * single issue, no info summary". Without these two tests, adding a Model Code
   * / Classification block there looks like an obvious improvement.
   *
   * ⚠️ AND THEY ARE TWO TESTS FOR A REASON. Asserting both halves in one test
   * does not work: `Modal` portals into `document.body`, and Testing Library
   * cleans up only BETWEEN tests — so the group modal was still mounted when the
   * single-issue one rendered, and the `not.toContain` read the group modal's own
   * markup and failed. One render per test is what keeps the negative honest.
   */
  it('shows the info summary in the GROUP modal', () => {
    openGroup()
    expect(body(), 'group modal lost its info summary').toContain(M.historyInfoModelCode)
  })

  it('does NOT show the info summary in the single-issue modal', () => {
    openIssue(GROUPED)
    expect(body(), 'the single-issue modal must NOT carry an info summary').not.toContain(
      M.historyInfoModelCode,
    )
  })
})

describe('the group modal derives Parent and Child rather than storing them', () => {
  /*
   * ⚠️ COUNTED AS WHOLE ELEMENTS, NOT AS SUBSTRINGS. Counting occurrences of
   * "Parent" in the body text found two: the badge, and the words "Parent Issue:"
   * inside a group audit detail. A substring count over rendered text will keep
   * finding incidental matches like that, so this counts elements whose entire
   * text is the badge.
   */
  it('badges the earliest member Parent and the others Child', () => {
    const { store } = openGroup()
    const members = store().groupMembers(GROUPED)
    expect(badgeCount(M.badgeParent), 'expected exactly one Parent badge').toBe(1)
    expect(badgeCount(M.badgeChild), 'wrong number of Child badges').toBe(members.length - 1)
  })
})

describe('the timeline speaks the CATALOGUE vocabulary, not the store internals', () => {
  /*
   * ⚠️ THIS IS THE DEFECT THE SURFACE SHIPPED WITH. It rendered `e.action` raw,
   * so a user read "Initial field values saved" and "Issue Unlinked" — internal
   * action strings — while the workspace rendered proper labels for the same
   * rows. The two surfaces disagreed about the same data.
   */
  it('renders a catalogued label for every row it shows', () => {
    const { store } = openIssue(GROUPED)
    const entries = store().auditFor(GROUPED)
    expect(entries.length, 'fixture issue must have a trail').toBeGreaterThan(0)

    for (const e of entries) {
      const row = HISTORY_CATALOGUE[e.action]
      expect(row, `"${e.action}" is not catalogued, so it renders raw`).toBeTruthy()
      expect(body(), `"${e.action}" did not render as "${row.label}"`).toContain(row.label)
    }
  })

  it('never shows an uncatalogued raw action', () => {
    const { store } = openIssue(GROUPED)
    for (const e of store().auditFor(GROUPED)) {
      const row = HISTORY_CATALOGUE[e.action]
      // Only meaningful where the label actually differs from the action — 16
      // entries legitimately set them equal, and there the two are the same text.
      if (row && row.label !== e.action) {
        expect(body(), `raw action "${e.action}" leaked to the user`).not.toContain(e.action)
      }
    }
  })
})

describe('⚠️ THE EMPTY STATE, WHICH IS OURS', () => {
  /*
   * The canonical never needs one: `lhEvents` synthesises a timeline from a hash
   * of the issue id, so it is never empty. Ours reads real audit rows, and a
   * newly registered issue genuinely has none — the most common real case. So
   * this state is designed rather than inherited, and it is asserted so that it
   * stays a state and does not decay into a blank panel.
   */
  it('explains itself instead of rendering blank', () => {
    const { store } = openIssue(UNTRAILED)
    expect(store().auditFor(UNTRAILED).length, 'fixture issue must have NO trail').toBe(0)
    expect(body()).toContain(M.historyEmpty)
    expect(body(), 'the empty state must say why it is empty').toContain(M.historyEmptyHint)
  })

  it('still identifies the issue, so the panel is not mistaken for a failure', () => {
    openIssue(UNTRAILED)
    expect(body()).toContain(UNTRAILED)
  })
})

describe('progressive disclosure inside a member row', () => {
  /*
   * The canonical shows 6 rows per member and offers "View complete history
   * (N earlier)". Reaching it needs a member with more than 6 audit rows, which
   * the seeded trails now provide — asserted, so that a thinner fixture makes
   * this test fail rather than silently stop exercising the control.
   */
  it('collapses a long trail and expands on request', () => {
    const { store } = openGroup()
    const parent = store().groupMembers(GROUPED)[0]
    const total = store().auditFor(parent.id).length
    expect(total, `${parent.id} needs >6 rows to exercise this`).toBeGreaterThan(6)

    // The member accordion starts closed; open it.
    fireEvent.click(screen.getAllByRole('button', { expanded: false })[0])
    expect(body()).toContain(M.historyShowAll.replace('{{count}}', String(total - 6)))
  })
})

describe('the member accordion', () => {
  const firstHead = () => screen.getAllByRole('button', { expanded: false })[0]

  it('starts closed, so a four-member group is not four timelines deep', () => {
    const { store } = openGroup()
    const parent = store().groupMembers(GROUPED)[0]
    const label = HISTORY_CATALOGUE[store().auditFor(parent.id)[0].action].label
    // A member's own timeline rows are absent until its row is opened.
    expect(body(), 'accordion rendered expanded').not.toContain(label)
  })

  it('expands to reveal that member timeline, and collapses again', () => {
    const { store } = openGroup()
    const parent = store().groupMembers(GROUPED)[0]
    const label = HISTORY_CATALOGUE[store().auditFor(parent.id)[0].action].label

    fireEvent.click(firstHead())
    expect(body(), 'expanding showed no rows').toContain(label)

    fireEvent.click(screen.getAllByRole('button', { expanded: true })[0])
    expect(body(), 'collapsing left the rows visible').not.toContain(label)
  })

  it('reveals the rest of a long trail when asked', () => {
    const { store } = openGroup()
    const parent = store().groupMembers(GROUPED)[0]
    const entries = store().auditFor(parent.id)
    expect(entries.length, 'need >6 rows to exercise progressive disclosure').toBeGreaterThan(6)

    fireEvent.click(firstHead())
    const showAll = screen.getByRole('button', {
      name: new RegExp(M.historyShowAll.replace('{{count}}', String(entries.length - 6)).replace(/[()]/g, '\\$&')),
    })
    fireEvent.click(showAll)

    // The oldest row — beyond the collapsed 6 — is now rendered.
    const oldest = HISTORY_CATALOGUE[entries[entries.length - 1].action]
    expect(body(), 'the full trail did not render').toContain(oldest.label)
    // And the control retires rather than sitting there doing nothing.
    expect(screen.queryByRole('button', { name: /view complete history/i })).toBeNull()
  })
})

describe('View Issue is a navigation, not an accordion toggle', () => {
  /*
   * ⚠️ IT SITS INSIDE THE ACCORDION HEADER, so without `stopPropagation` clicking
   * it would ALSO toggle the row — the user would navigate away and, on
   * returning, find the row in the opposite state. The canonical calls
   * `stopPropagation` at this exact spot for the same reason.
   */
  const openWithSpy = () => {
    const seen: string[] = []
    const Harness = () => {
      const store = useStore()
      captured = store
      return (
        <GroupHistoryModal
          members={store.groupMembers(GROUPED)}
          entriesFor={(id) => store.auditFor(id)}
          onOpenIssue={(id) => seen.push(id)}
          onClose={() => {}}
        />
      )
    }
    render(<Harness />, { wrapper: Wrapped })
    return seen
  }

  it('reports the member it belongs to', () => {
    const seen = openWithSpy()
    fireEvent.click(screen.getAllByText(M.historyViewIssue, { exact: true })[0])
    expect(seen, 'View Issue did not fire').toEqual([captured!.groupMembers(GROUPED)[0].id])
  })

  it('does NOT toggle the row it sits in', () => {
    openWithSpy()
    // queryAll, not getAll: every row starts collapsed, so the expanded count is
    // ZERO here and getAllByRole throws rather than returning an empty list.
    const expanded = () => screen.queryAllByRole('button', { expanded: true }).length
    expect(expanded(), 'rows should start collapsed').toBe(0)
    fireEvent.click(screen.getAllByText(M.historyViewIssue, { exact: true })[0])
    expect(expanded(), 'View Issue toggled the accordion').toBe(0)
  })

  it('is reachable from the keyboard', () => {
    const seen = openWithSpy()
    const link = screen.getAllByText(M.historyViewIssue, { exact: true })[0]
    fireEvent.keyDown(link, { key: 'Enter' })
    fireEvent.keyDown(link, { key: ' ' })
    expect(seen.length, 'Enter and Space did not activate View Issue').toBe(2)
    // An unrelated key must not fire it.
    fireEvent.keyDown(link, { key: 'a' })
    expect(seen.length).toBe(2)
  })
})

describe('neither modal renders when it has nothing to show', () => {
  it('the group modal stays shut for an issue with no group', () => {
    const Harness = () => {
      const store = useStore()
      captured = store
      return (
        <GroupHistoryModal
          members={store.groupMembers(UNTRAILED)}
          entriesFor={(id) => store.auditFor(id)}
          onOpenIssue={() => {}}
          onClose={() => {}}
        />
      )
    }
    render(<Harness />, { wrapper: Wrapped })
    expect(captured!.groupMembers(UNTRAILED), 'fixture issue must be ungrouped').toEqual([])
    expect(body(), 'the group modal opened with no members').not.toContain(M.groupHistoryTitle)
  })

  it('the single-issue modal stays shut for an unknown id', () => {
    render(<IssueHistoryModal issue={null} entries={[]} onClose={() => {}} />, { wrapper: Wrapped })
    expect(body()).not.toContain(M.issueHistoryTitle)
  })
})

describe('the info summary fills gaps rather than rendering blanks', () => {
  /*
   * `source` and `dtcCodes` are both optional on `Issue`, and a missing value
   * must read as an em dash rather than as an empty cell that looks like a
   * layout bug. Asserted against a member the fixture leaves incomplete.
   */
  it('shows an em dash for a member with no DTC codes', () => {
    const { store } = openGroup()
    const members = store().groupMembers(GROUPED)
    const gap = members.find((m) => !m.dtcCodes?.length)
    expect(gap, 'fixture has no member missing DTC codes — assertion is moot').toBeTruthy()
    expect(body()).toContain('—')
  })
})

