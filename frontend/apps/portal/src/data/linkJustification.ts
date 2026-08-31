/**
 * The link/unlink justification rule — ONE definition, four surfaces.
 *
 * ─── WHY THIS IS A MODULE AND NOT A COMPONENT ────────────────────────────────
 *
 * The four places that capture a justification do not look alike:
 *
 *   Issue Entry          a confirmation MODAL, before a draft link commits
 *   Manage Links         an INLINE row, one per pending change, confirmed by Apply
 *   Edit-issue form      immediate, per action
 *   Issue list modal     immediate, per action
 *
 * A shared component would have to be all four shapes at once. What they
 * genuinely share is the RULE — the threshold, the cap, and the sentence shown
 * when the threshold is not met — so that is what lives here. Presentation stays
 * with each surface.
 *
 * ─── THE RULE IS THE PROTOTYPE'S, NOT AN APPROXIMATION ───────────────────────
 *
 * Confirmed byte-for-byte against the canonical's `mrApplyUnlink` / `mrApplyLink`
 * and Issue Entry's own gate: `>= 20` on the TRIMMED text, a 500-character cap
 * applied as `slice(0, 500)` on input, and the error sentence below verbatim.
 * Both screens already implemented the same numbers independently; this removes
 * the second copy rather than inventing a rule.
 *
 * ─── ⚠️ RAW LENGTH COUNTS, TRIMMED LENGTH VALIDATES ──────────────────────────
 *
 * These measure DIFFERENT strings, in the design and in both implementations:
 *
 *   the counter and the cap  use the RAW text     (what you typed)
 *   the threshold and error  use the TRIMMED text (what you actually said)
 *
 * It reads like an inconsistency and it is not one. The cap protects a storage
 * bound, so it counts every character; the threshold is a governance floor, so
 * whitespace must not be able to buy it — 20 spaces is not a reason. Do not
 * "consistency-fix" these onto one string; a test pins the whitespace case.
 */

/** Governance floor, on the trimmed text. */
export const JUSTIFICATION_MIN = 20

/** Storage cap, on the raw text. */
export const JUSTIFICATION_MAX = 500

/** What the threshold is measured against. */
export const justificationLength = (raw: string): number => raw.trim().length

/** True once the justification is long enough to commit the change. */
export const isJustificationValid = (raw: string): boolean => justificationLength(raw) >= JUSTIFICATION_MIN

/**
 * The design's own sentence, or `null` when valid.
 *
 * It reports the TRIMMED count, so a box full of spaces reads "0 entered"
 * rather than "20 entered" — which is the whole point of showing the number.
 */
export const justificationError = (raw: string): string | null =>
  isJustificationValid(raw)
    ? null
    : `Enter a justification of at least ${JUSTIFICATION_MIN} characters. ${justificationLength(raw)} entered.`

/** Applied on every keystroke, matching the design's `slice(0, 500)`. */
export const clampJustification = (raw: string): string => raw.slice(0, JUSTIFICATION_MAX)

/*
 * ─── TWO COUNTER FORMATS, DELIBERATELY ──────────────────────────────────────
 *
 * Issue Entry renders `20/500`; the workspace renders `20 / 500 characters`.
 * That is the design's own difference, and both are recorded here rather than
 * flattened to one, so that the divergence is visible in a single place and
 * nobody tidies one into the other believing it a typo. The NUMBER is shared;
 * only the wording differs.
 *
 * Both count the RAW text — see the note at the top of this file.
 */

/** Issue Entry's form: `20/500`. */
export const justificationCounterCompact = (raw: string): string => `${raw.length}/${JUSTIFICATION_MAX}`

/** The workspace and issue-list surfaces: `20 / 500 characters`. */
export const justificationCounterVerbose = (raw: string): string =>
  `${raw.length} / ${JUSTIFICATION_MAX} characters`
