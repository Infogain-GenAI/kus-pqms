import { render, type RenderResult } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { RoleProvider } from '@/data/roles'
import { StoreProvider, useStore } from '@/data/store'
import type { RoleKey } from '@/data/types'

/**
 * Render a component AND get the store instance it actually uses.
 *
 * ─── ⚠️ THE TRAP THIS EXISTS TO CLOSE ────────────────────────────────────────
 *
 * The obvious way to assert on store state after driving a component is:
 *
 *     const { result } = renderHook(() => useStore(), { wrapper: Wrapped })
 *     render(<Thing />, { wrapper: Wrapped })
 *     …drive the UI…
 *     expect(result.current.issues.length).toBe(before)   // ← ALWAYS PASSES
 *
 * Passing the same `wrapper` REFERENCE does not share a provider. Each call
 * mounts its own `StoreProvider`, so `result.current` is a DIFFERENT store from
 * the one the component mutates. The assertion then compares an untouched store
 * against itself.
 *
 * THIS HAS HAPPENED TWICE. Once in the link-justification gate tests, where it
 * failed loudly because the assertion was POSITIVE ("the reason IS recorded");
 * and once in `CreateIssueScreen.test.tsx`, where a NEGATIVE assertion ("typing
 * does not create an issue") passed unconditionally for months. Confirmed by
 * mutation: with typing wired straight into `store.createIssue`, the old test
 * still passed.
 *
 * ⚠️ A NEGATIVE ASSERTION AGAINST THE WRONG OBJECT IS INDISTINGUISHABLE FROM THE
 * BEHAVIOUR IT CLAIMS TO PROVE. That is the whole hazard, and it is why this
 * helper returns the store rather than leaving each test to reach for one.
 *
 * ─── WHY A HELPER AND NOT A LINT RULE ────────────────────────────────────────
 *
 * A rule that flags `renderHook` beside `render` would have to distinguish the
 * mutate-one/read-other case from the many legitimate uses, and would sit in the
 * adherence config where an unknown-rule reference is itself an error. So this
 * is a guard by CONSTRUCTION rather than by enforcement: the correct pattern is
 * now the shortest one to write. It does not PREVENT the two-provider shape —
 * nothing cheap does — so the hazard is documented here where someone reaching
 * for the tool will read it.
 */
export function renderWithStore(
  ui: ReactElement,
  { role, wrapper }: { role?: RoleKey; wrapper?: (p: { children: ReactNode }) => ReactElement } = {},
): RenderResult & { store: () => ReturnType<typeof useStore> } {
  let captured: ReturnType<typeof useStore> | null = null

  const Probe = () => {
    captured = useStore()
    return ui
  }

  const Default = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <RoleProvider initialRole={role}>
        <StoreProvider>{children}</StoreProvider>
      </RoleProvider>
    </MemoryRouter>
  )

  const result = render(<Probe />, { wrapper: wrapper ?? Default })

  return {
    ...result,
    /**
     * A GETTER, not a snapshot. The store value is a new object on every render,
     * so a captured reference goes stale the moment the component re-renders and
     * assertions would read pre-interaction state.
     */
    store: () => {
      if (!captured) throw new Error('renderWithStore: the store was never captured — did the tree fail to mount?')
      return captured
    },
  }
}
