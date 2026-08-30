// Tests for the i18n layer.
//
// ─── WHY THESE EXIST: THE FAILURE MODE IS SILENT ─────────────────────────────
//
// `09-i18n-and-localization.md` states it plainly — a namespace mismatch between
// `addResourceBundle` and `useTranslation` "FAILS SILENTLY, falling back rather
// than throwing". The screen renders the KEY where a sentence should be, and
// nothing errors. Neither tsc nor a render-smoke test catches it.
//
// So these assert on RESOLVED TEXT, not on the objects. A test that reads
// `messages.en.title` and compares it to itself proves nothing; a test that asks
// i18next for the key and gets English back proves the bundle is registered,
// the namespace matches, and the variant selection works.
//
// Per 26/09: a test asserting on user-facing text asserts against the `en` value
// in that component's own `.i18n.ts`, never a hardcoded string — so a reword
// breaks one place.
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'
import { IssueListScreen } from '@/features/issues/IssueListScreen'
import { i18n, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n'
import issueListMessages, { NS as ISSUE_LIST_NS } from '@/features/issues/issue-list/IssueListScreen.i18n'
import issueEntryMessages, { NS as ISSUE_ENTRY_NS } from '@/features/issues/issue-entry/IssueEntry.i18n'
import issueDetailMessages, { NS as ISSUE_DETAIL_NS } from '@/features/issues/workspace/IssueDetail.i18n'

const NAMESPACES = [
  [ISSUE_LIST_NS, issueListMessages],
  [ISSUE_ENTRY_NS, issueEntryMessages],
  [ISSUE_DETAIL_NS, issueDetailMessages],
] as const

describe('the instance', () => {
  it('runs in en with en as the fallback', () => {
    expect(i18n.language).toBe(DEFAULT_LOCALE)
    expect(SUPPORTED_LOCALES).toEqual(['en'])
  })

  it('scaffolds NO empty locale — 09 forbids it', () => {
    // An empty-string locale renders BLANK UI the moment SUPPORTED_LOCALES is
    // extended, which is worse than an untranslated English string. Adding
    // Korean means adding `ko` WITH content, at that time.
    for (const [, messages] of NAMESPACES) {
      expect(Object.keys(messages)).toEqual(['en'])
    }
  })
})

describe('every namespace is registered as a side effect of import', () => {
  it.each(NAMESPACES.map(([ns]) => ns))('%s has a bundle', (ns) => {
    expect(i18n.hasResourceBundle('en', ns)).toBe(true)
  })

  it('resolves every declared key to its own English text', () => {
    // The direct test of the silent failure: a mismatched namespace returns the
    // KEY, so any key resolving to itself means the bundle is not reachable.
    for (const [ns, messages] of NAMESPACES) {
      for (const [key, value] of Object.entries(messages.en)) {
        const resolved = i18n.t(key, { ns, count: 1, issueId: 'X', letter: 'A', role: 'SE', status: 'Open', shown: 1, total: 1, from: 1, to: 1, codes: 'AB' })
        expect(resolved, `${ns}:${key}`).not.toBe(key)
        // A plural variant key is never asked for directly, so skip the exact
        // comparison for those; every other key must round-trip.
        if (!/_one$|_other$/.test(key) && !value.includes('{{')) {
          expect(resolved, `${ns}:${key}`).toBe(value)
        }
      }
    }
  })
})

describe('interpolation is double-brace', () => {
  // 09 calls single-brace the most likely defect when transcribing from the Vue
  // app, where vue-i18n's single-brace syntax was used throughout. A single
  // brace does not interpolate — it renders literally.
  it('no message uses a single-brace placeholder', () => {
    for (const [ns, messages] of NAMESPACES) {
      for (const [key, value] of Object.entries(messages.en)) {
        const singles = value.replace(/\{\{[^}]*\}\}/g, '').match(/\{[^{}]+\}/g)
        expect(singles, `${ns}:${key} — single-brace placeholder ${singles?.join(', ')}`).toBeNull()
      }
    }
  })

  it('substitutes a value rather than rendering the placeholder', () => {
    expect(i18n.t('shellNotFound', { ns: ISSUE_DETAIL_NS, issueId: 'HV-260101' })).toBe(
      'Issue HV-260101 was not found.',
    )
  })
})

describe('ICU plural variants, not hand-rolled key pairs', () => {
  // 00-core-rules.md bans hand-rolled singular/plural by name. These pin that
  // the library is doing the selection.
  it.each([
    [1, 'field needs'],
    [2, 'fields need'],
    [0, 'fields need'],
  ])('validationBanner with count=%i reads "%s"', (count, expected) => {
    expect(i18n.t('validationBanner', { ns: ISSUE_ENTRY_NS, count })).toContain(expected)
  })

  it('declares both variants for every plural key', () => {
    // A key with `_one` and no `_other` resolves to the key for every count but
    // one — the silent failure again, narrowed to a single quantity.
    for (const [ns, messages] of NAMESPACES) {
      for (const key of Object.keys(messages.en)) {
        if (key.endsWith('_one')) {
          expect(messages.en[key.replace(/_one$/, '_other')], `${ns}:${key} has no _other`).toBeTruthy()
        }
      }
    }
  })
})

// ─── Through a real screen ────────────────────────────────────────────────────

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <RoleProvider>
      <StoreProvider>{children}</StoreProvider>
    </RoleProvider>
  </MemoryRouter>
)

describe('the Issue List renders resolved text, not keys', () => {
  it('shows its own title and subtitle', () => {
    render(<IssueListScreen />, { wrapper })
    expect(screen.getByText(issueListMessages.en.title)).toBeTruthy()
    expect(screen.getByText(issueListMessages.en.subtitle)).toBeTruthy()
  })

  it('selects the SINGULAR variant for one selected row', async () => {
    // The behaviour that replaced `n === 1 ? '' : 's'`. Driven through the UI
    // because the point is that the screen passes `count` correctly, not that
    // i18next can pluralise.
    render(<IssueListScreen />, { wrapper })
    const boxes = screen.getAllByRole('checkbox')
    fireEvent.click(boxes[1])

    fireEvent.click(await screen.findByText(issueListMessages.en.bulkAssignRole))
    await waitFor(() => expect(document.body.textContent).toContain('1 selected issue to a role'))
    expect(document.body.textContent).not.toContain('1 selected issues')
  })

  it('selects the PLURAL variant for two', async () => {
    render(<IssueListScreen />, { wrapper })
    const boxes = screen.getAllByRole('checkbox')
    fireEvent.click(boxes[1])
    fireEvent.click(boxes[2])

    fireEvent.click(await screen.findByText(issueListMessages.en.bulkAssignRole))
    await waitFor(() => expect(document.body.textContent).toContain('2 selected issues to a role'))
  })
})
