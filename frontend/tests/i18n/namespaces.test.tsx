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
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, sep } from 'node:path'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'
import { IssueListScreen } from '@/features/issues/issue-list/IssueListScreen'
import { i18n, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n'
import issueListMessages, { NS as ISSUE_LIST_NS } from '@/features/issues/issue-list/IssueListScreen.i18n'
import issueEntryMessages, { NS as ISSUE_ENTRY_NS } from '@/features/issues/issue-entry/IssueEntry.i18n'
import issueDetailMessages, { NS as ISSUE_DETAIL_NS } from '@/features/issues/workspace/IssueDetail.i18n'

/*
 * ENUMERATED, NOT LISTED. This was a hardcoded three-entry array, and it went
 * stale the moment two more namespaces were added — which is the failure this
 * file exists to prevent, reproduced in the file itself.
 *
 * ⚠️ A GLOB THAT MATCHES NOTHING REPORTS ZERO AND EVERY LOOP BELOW PASSES
 * VACUOUSLY. That is the same dead-gate shape `ds-gate.mjs` warns about, so the
 * count is cross-checked against a filesystem walk rather than trusted.
 */
const i18nModules = import.meta.glob('../../apps/portal/src/**/*.i18n.ts', { eager: true }) as Record<
  string,
  { NS: string; default: Record<string, Record<string, string>> }
>
const NAMESPACES = Object.values(i18nModules).map((m) => [m.NS, m.default] as const)

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '../../apps/portal/src')

function walkSrc(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry !== 'node_modules' && entry !== 'dist') walkSrc(full, out)
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) out.push(full)
  }
  return out
}

/** Comments quote `useTranslation('X')` in prose — `i18n/index.ts` most of all. */
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

const posix = (p: string) => p.split(sep).join('/')

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
  it('enumerated every .i18n.ts on disk — the glob is not silently empty', () => {
    const onDisk = walkSrc(SRC).filter((f) => f.endsWith('.i18n.ts'))
    expect(onDisk.length).toBeGreaterThan(0)
    // The assertion that matters: the glob and the filesystem agree. If the glob
    // pattern ever stops matching, this fails loudly instead of every loop in
    // this file quietly iterating an empty array.
    expect(NAMESPACES.length, `glob saw ${NAMESPACES.length}, disk has ${onDisk.length}`).toBe(onDisk.length)
    // Namespaces are unique — two files exporting the same NS would have one
    // bundle overwrite the other, with only the second file's keys resolving.
    expect(new Set(NAMESPACES.map(([ns]) => ns)).size).toBe(NAMESPACES.length)
  })

  it.each(NAMESPACES.map(([ns]) => ns))('%s has a bundle', (ns) => {
    expect(i18n.hasResourceBundle('en', ns)).toBe(true)
  })

  /*
   * ─── THE INVERSE CHECK, AND WHY IT HAD TO BE ADDED ─────────────────────────
   *
   * Every other test here walks DECLARED keys and asks whether they resolve.
   * That direction cannot see a key which is USED in a component but was never
   * declared — and that shipped: a rename deleted `clearFormCancel`, repointed
   * three call sites to `t('cancel')`, and never added `cancel`. All three
   * buttons rendered the lowercase string "cancel", because
   * `parseMissingKeyHandler` returns the key.
   *
   * Nothing else could have caught it. `t()` accepts any string, so tsc was
   * happy; `lint:i18n` checks NAMESPACES, not keys; and no test asserted the
   * exact button text. So this walks the source instead of the bundles.
   */
  it('every t(key) in the app is declared in the namespace it reads from', () => {
    const byFile = new Map<string, string>()
    for (const [ns, messages] of NAMESPACES) {
      const src = Object.entries(i18nModules).find(([, m]) => m.NS === ns)?.[0]
      if (src) byFile.set(posix(resolve(dirname(fileURLToPath(import.meta.url)), src)), ns)
    }

    const missing: string[] = []
    let checked = 0

    for (const file of walkSrc(SRC)) {
      if (file.endsWith('.i18n.ts')) continue
      const raw = readFileSync(file, 'utf8')
      const src = stripComments(raw)
      if (!src.includes('useTranslation(')) continue

      /*
       * ⚠️ ALL the namespaces this file imports, not just one.
       *
       * The first version kept a single `ns`, so this loop OVERWROTE it and every
       * key was checked against whichever namespace happened to be imported
       * last. That is a false positive waiting to happen, and it fired the moment
       * a file legitimately read two: `DetailSection` renders a control inside
       * `ExistingIssueModal`'s footer, so it reads that namespace AND the
       * justification one, and `t('unlink')` was checked against the wrong half.
       *
       * A key now passes if ANY imported namespace declares it. Slightly weaker
       * — a key present in the wrong one of two would pass — but a guard that
       * cries wolf on correct code is the one that gets deleted.
       */
      /*
       * ⚠️ IT ONLY RESOLVED RELATIVE IMPORTS, AND THAT SILENTLY SHRANK ITS SCOPE.
       *
       * A file importing its namespace as `@/features/.../X.i18n` was skipped
       * ENTIRELY: no namespace resolved, so the `continue` below fired and none of
       * its `t()` calls were ever checked. Found when extracting the Same Existing
       * Issues cards into `related/RelatedIssueCards` — the new file used `@/`
       * specifiers, which removed 300+ lines of translate calls from this guard
       * without failing anything. The guard did not get weaker in a way anyone
       * could see; it just stopped looking at a file.
       *
       * Both forms resolve now. `@/` maps to `apps/portal/src`, matching the
       * tsconfig path alias.
       */
      const namespaces: string[] = []
      for (const m of src.matchAll(/import \{[^}]*\bNS\b[^}]*\} from '([^']+)'/g)) {
        const spec = m[1]
        const abs = spec.startsWith('@/')
          ? posix(resolve(SRC, spec.slice(2)))
          : spec.startsWith('.')
            ? posix(resolve(dirname(file), spec))
            : null
        if (!abs) continue
        const found = byFile.get(abs + '.ts')
        if (found && !namespaces.includes(found)) namespaces.push(found)
      }
      // A file may take its namespace from elsewhere; only assert what resolves.
      if (!namespaces.length) continue

      const ns = namespaces.join('|')
      const declared = Object.assign(
        {},
        ...namespaces.map((n) => NAMESPACES.find(([name]) => name === n)![1].en),
      ) as Record<string, string>

      /*
       * ⚠️ ALIASED TRANSLATE FUNCTIONS WERE INVISIBLE, and that blind spot was
       * found by mutation, not by reading.
       *
       * A file reading two namespaces has to rename one of them:
       *     const { t } = useTranslation(A)
       *     const { t: tj } = useTranslation(B)
       * The scan looked only for `t(`, so every `tj('key')` went unchecked.
       * Deleting a key that only `tj` used left this test GREEN — the guard was
       * giving false confidence on precisely the newest code.
       *
       * Aliases are now derived from the destructuring itself rather than
       * guessed, because a pattern loose enough to catch `tj(` by shape would
       * also match `test(`, `toBe(` and every other call ending in t.
       */
      const aliases = new Set<string>()
      for (const m of src.matchAll(/\{\s*t\s*(?::\s*([A-Za-z_$][\w$]*))?\s*[,}][^=]*=\s*useTranslation\(/g)) {
        aliases.add(m[1] ?? 't')
      }
      if (!aliases.size) aliases.add('t')
      const keyCalls = new RegExp(`\\b(?:${[...aliases].join('|')})\\('([A-Za-z0-9_]+)'`, 'g')
      for (const m of src.matchAll(keyCalls)) {
        const key = m[1]
        checked++
        // An ICU plural is declared only as key_one / key_other and is never a
        // bare key, so accept either form.
        const ok = key in declared || `${key}_one` in declared || `${key}_other` in declared
        if (!ok) missing.push(`${ns}.${key} used in ${posix(file).split('/apps/portal/src/')[1]}`)
      }
    }

    // Guards the whole test against passing because the scan found nothing.
    expect(checked, 'scanned no t() calls at all').toBeGreaterThan(50)
    expect(missing, `undeclared keys:\n  ${missing.join('\n  ')}`).toEqual([])
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

    fireEvent.click(await screen.findByText(issueListMessages.en.bulkChangeStatus))
    await waitFor(() => expect(document.body.textContent).toContain('will update 1 selected issue.'))
    expect(document.body.textContent).not.toContain('selected issues.')
  })

  it('selects the PLURAL variant for two', async () => {
    render(<IssueListScreen />, { wrapper })
    const boxes = screen.getAllByRole('checkbox')
    fireEvent.click(boxes[1])
    fireEvent.click(boxes[2])

    fireEvent.click(await screen.findByText(issueListMessages.en.bulkChangeStatus))
    await waitFor(() => expect(document.body.textContent).toContain('will update 2 selected issues.'))
  })
})
