// Public entry for @pqms/design-tokens.
//
// The CSS custom properties are the RUNTIME contract and are imported as a side
// effect from '@pqms/design-tokens/styles.css'. This module is the TYPED half:
// a literal map and a cssVar() helper for logic, lookups and tests.
//
// tokens.generated.ts is generated from design-system-manifest.json by
// scripts/gen-tokens.mjs and is never hand-edited (ADR-0003).
export { tokens, cssVar } from './tokens/tokens.generated'
export type { TokenName } from './tokens/tokens.generated'
