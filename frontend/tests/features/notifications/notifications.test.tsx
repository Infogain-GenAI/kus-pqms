// Tests for notification click-through routing.
//
// ─── WHAT THE BUG WAS, SO THE TESTS READ AS A FIX ────────────────────────────
//
// The header dropdown and the Notifications page each carried their own copy of
// the row-click handler, and both said `if (n.recordId) nav('/issues/' + id)`.
// Identical — and identically wrong: every notification was assumed to point at
// an issue, so a QIR notification sent the user to `/issues/QIR-26014` and a Not
// Found page.
//
// So the routing TABLE is tested as a pure function (fast, exhaustive, covers
// the cases no seed contains), and each SURFACE is tested through a real router
// to prove it actually consults that table rather than its own copy.
import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { notificationTarget } from '@/data/notifications'
import { NOTIFICATION_CATEGORIES } from '@/data/notificationCategory'
import { NOTIFICATIONS } from '@/data/seed'
import { routes } from '@/routes'
import { bodyText, renderAt } from '../../support/dataRouter'

describe('the routing table', () => {
  it('sends an issue notification to that issue', () => {
    expect(notificationTarget({ recordId: 'EE-260001', recordType: 'issue' })).toBe('/issues/EE-260001')
  })

  it('sends a QIR notification to QIR Management, not to /issues/<qir-id>', () => {
    // THE REGRESSION. `/issues/QIR-26014` is a Not Found page; `/qir` is a real
    // screen the QIR is listed on.
    expect(notificationTarget({ recordId: 'QIR-26014', recordType: 'qir' })).toBe('/qir')
    expect(notificationTarget({ recordId: 'QIR-26014', recordType: 'qir' })).not.toContain('/issues/')
  })

  it('routes nowhere when there is no record', () => {
    expect(notificationTarget({})).toBeNull()
  })

  it('routes nowhere when the type is unknown, rather than guessing', () => {
    // A row with an id but no type is the real-backend case Vue documents: mark
    // it read, but do not invent a destination for it.
    expect(notificationTarget({ recordId: 'EE-260001' })).toBeNull()
    expect(notificationTarget({ recordType: 'issue' })).toBeNull()
  })

  it('every destination it produces is a route this app actually has', () => {
    // Guards the failure that started this: a handler happily building a path to
    // a screen that does not exist. Asserted against the route tree, not against
    // a list of strings retyped here.
    const paths = new Set<string>()
    const walk = (rs: readonly { path?: string; children?: readonly unknown[] }[]) => {
      for (const r of rs) {
        if (r.path) paths.add(r.path)
        if (r.children) walk(r.children as { path?: string; children?: readonly unknown[] }[])
      }
    }
    walk(routes as unknown as { path?: string; children?: readonly unknown[] }[])

    for (const n of NOTIFICATIONS) {
      const target = notificationTarget(n)
      if (!target) continue
      const matches = paths.has(target) || paths.has(target.replace(/\/[^/]+$/, '/:id'))
      expect(matches, `${n.id} routes to ${target}, which is not a route`).toBe(true)
    }
  })
})

describe('the seed exercises both branches', () => {
  // A branch no seed can reach is a branch nobody sees break. This pins that the
  // QIR row stays in the fixtures.
  it('carries at least one issue notification and one QIR notification', () => {
    expect(NOTIFICATIONS.some((n) => n.recordType === 'issue')).toBe(true)
    expect(NOTIFICATIONS.some((n) => n.recordType === 'qir')).toBe(true)
  })

  it('gives every routable row a type, so none is a dead click', () => {
    for (const n of NOTIFICATIONS) {
      if (n.recordId) expect(n.recordType, `${n.id} has an id but no type`).toBeTruthy()
    }
  })
})

describe('the category taxonomy is one table', () => {
  it('gives every category a colour, a tint, an icon AND a badge tone', () => {
    // The page used to map categories to Badge tones in its own table, free to
    // drift from the header's colours. One record per category now.
    for (const [name, meta] of Object.entries(NOTIFICATION_CATEGORIES)) {
      expect(meta.color, name).toBeTruthy()
      expect(meta.tint, name).toBeTruthy()
      expect(meta.icon, name).toBeTruthy()
      expect(meta.tone, name).toBeTruthy()
    }
  })

  it('covers every category the seed actually uses', () => {
    for (const n of NOTIFICATIONS) {
      expect(NOTIFICATION_CATEGORIES[n.category], `${n.category} has no meta`).toBeTruthy()
    }
  })
})

// ─── The surfaces ─────────────────────────────────────────────────────────────

const openBell = async () => {
  const bell = await screen.findByRole('button', { name: /Notifications, \d+ unread/i })
  fireEvent.click(bell)
  return await screen.findByTestId('notification-panel')
}

describe('the header dropdown', () => {
  it('opens from the bell and lists notifications', async () => {
    renderAt(routes, '/dashboard', { role: 'SE' })
    await openBell()
    expect(screen.getByTestId(`notification-row-${NOTIFICATIONS[0].id}`)).toBeTruthy()
  })

  it('navigates to the issue when an issue notification is clicked', async () => {
    const issueRow = NOTIFICATIONS.find((n) => n.recordType === 'issue')!
    renderAt(routes, '/dashboard', { role: 'SE' })
    await openBell()

    fireEvent.click(screen.getByTestId(`notification-row-${issueRow.id}`))
    await waitFor(() => expect(bodyText()).toContain(issueRow.recordId!))
  })

  it('closes the panel on navigation, rather than leaving it floating', async () => {
    const issueRow = NOTIFICATIONS.find((n) => n.recordType === 'issue')!
    renderAt(routes, '/dashboard', { role: 'SE' })
    await openBell()

    fireEvent.click(screen.getByTestId(`notification-row-${issueRow.id}`))
    await waitFor(() => expect(screen.queryByTestId('notification-panel')).toBeNull())
  })

  it('marks a clicked notification read', async () => {
    const issueRow = NOTIFICATIONS.find((n) => n.recordType === 'issue' && !n.read)!
    renderAt(routes, '/dashboard', { role: 'SE' })
    const before = Number(/Notifications, (\d+) unread/i.exec(
      (await screen.findByRole('button', { name: /Notifications, \d+ unread/i })).getAttribute('aria-label') ?? '',
    )?.[1])

    await openBell()
    fireEvent.click(screen.getByTestId(`notification-row-${issueRow.id}`))

    await waitFor(() => {
      const label = screen.getByRole('button', { name: /Notifications, \d+ unread/i }).getAttribute('aria-label') ?? ''
      expect(Number(/(\d+) unread/i.exec(label)?.[1])).toBe(before - 1)
    })
  })

  it('disables Mark all read once nothing is unread', async () => {
    renderAt(routes, '/dashboard', { role: 'SE' })
    await openBell()
    const markAll = screen.getByTestId('notif-mark-all-read') as HTMLButtonElement
    expect(markAll.disabled).toBe(false)

    fireEvent.click(markAll)
    await waitFor(() => expect((screen.getByTestId('notif-mark-all-read') as HTMLButtonElement).disabled).toBe(true))
  })

  it('View all opens the full feed', async () => {
    renderAt(routes, '/dashboard', { role: 'SE' })
    await openBell()
    fireEvent.click(screen.getByTestId('notif-view-all'))
    await waitFor(() => expect(screen.getByRole('heading', { name: /^Notifications$/ })).toBeTruthy())
  })
})

describe('the Notifications page routes the same way the dropdown does', () => {
  // The point of the shared hook: these two cannot disagree. If the page kept
  // its own handler, the QIR case below would fail here while passing above.
  it('sends a QIR notification to QIR Management', async () => {
    const qirRow = NOTIFICATIONS.find((n) => n.recordType === 'qir')!
    renderAt(routes, '/notifications', { role: 'SE' })
    await screen.findByTestId(`notification-page-row-${qirRow.id}`)

    fireEvent.click(screen.getByTestId(`notification-page-row-${qirRow.id}`))
    await waitFor(() => expect(bodyText()).toMatch(/QIR Management/i))
    expect(bodyText()).not.toMatch(/was not found/i)
  })

  it('sends an issue notification to that issue', async () => {
    const issueRow = NOTIFICATIONS.find((n) => n.recordType === 'issue')!
    renderAt(routes, '/notifications', { role: 'SE' })
    await screen.findByTestId(`notification-page-row-${issueRow.id}`)

    fireEvent.click(screen.getByTestId(`notification-page-row-${issueRow.id}`))
    await waitFor(() => expect(bodyText()).toContain(issueRow.recordId!))
  })
})

describe('a record type TypeScript never knew about', () => {
  // Types do not hold at the edge of the program: this shape can arrive from an
  // API response or from a value that outlived a rename. The cast is the whole
  // point of the test — it reproduces what the compiler cannot prevent.
  it('routes nowhere, rather than using the unknown type AS the path', () => {
    const rogue = { recordId: 'TSB-1', recordType: 'tsb' } as unknown as Parameters<typeof notificationTarget>[0]
    expect(notificationTarget(rogue)).toBeNull()
  })
})
