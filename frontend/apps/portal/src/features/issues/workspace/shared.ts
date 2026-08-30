import type { CSSProperties } from 'react'

/**
 * The bare text-input style used by the part-request row (Investigation) and by
 * the Edit-issue modal (the shell). Both used to read it as a module-local
 * `inputStyle` inside IssueWorkspaceScreen.tsx; the section split put them in
 * different modules, so it lives here rather than being declared twice.
 *
 * A PURE MOVE — the values are unchanged from IssueWorkspaceScreen.tsx:491.
 * Duplicating it instead would have re-declared `padding: '0 10px'`, which
 * `scripts/ds-gate.mjs` counts in its `values` family, against a ceiling with
 * zero headroom. The current figure lives in `.ds-ceilings.json` and is
 * deliberately not repeated here — the gate ratchets it downward on its own, so
 * a number copied into a comment is stale the next time anyone improves the
 * count. Sharing keeps the count flat.
 *
 * Callers that need a taller field spread and override, e.g.
 * `{ ...inputStyle, height: 'var(--control-md)' }` — which is what the Edit
 * modal does, exactly as it did before.
 */
export const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  height: 'var(--control-sm)',
  padding: '0 10px',
  border: 'var(--border-width) solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)',
}
