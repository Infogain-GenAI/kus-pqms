// Single source for adherence message text that is used as a JOIN KEY.
//
// eslint.adherence.config.mjs emits these strings; scripts/ds-gate.mjs buckets
// messages into ceiling families by matching them. If the two ever disagree, the
// family silently counts zero and its ceiling ratchets to zero — a gate that
// reports success because it stopped seeing anything. Both sides import from here
// so that cannot happen.
//
// The vendored families (`Raw px value`, `Raw hex color`, `Font not provided`)
// are NOT listed here: their wording belongs to _adherence.oxlintrc.json, which is
// a byte-copy. ds-gate.mjs matches those by prefix and fails loudly if the prefix
// ever matches nothing.

/** App-side rule closing the numeric hard-coded dimension loophole. */
export const NUMERIC_DIM_MESSAGE = 'Numeric hard-coded dimension — use a design-system spacing token via var().'

/**
 * App-side rule for user-facing copy written inline in JSX.
 *
 * Tier 0's non-negotiables ban hardcoded copy, and this is the family that
 * measures it. Vue co-locates every component's strings in a sibling
 * `*.i18n.ts`; this port's equivalent is `*.copy.ts`.
 */
export const JSX_COPY_MESSAGE = 'Hardcoded user-facing copy — move it to the feature\u2019s *.copy.ts module.'
