// DTC category derivation.
//
// A diagnostic trouble code's first character names its category — the
// convention the Create Issue screen's own help text already states verbatim:
// "P·Powertrain B·Body C·Chassis U·Network".
//
// Ported from the Vue app's `fallbackCategory` / `dtcCategoryName`
// (`services/master-data.mappers.ts`), which its Issue Detail card and its
// DtcTypeahead both read so the category letter is derived in exactly one
// place. Same reason for one module here.
//
// COLOUR IS DELIBERATELY NOT HERE. Vue pairs each category with a hex from its
// design-tokens package; this app's tokens have no DTC palette, and
// `scripts/ds-gate.mjs` counts hex literals in .ts/.tsx against a ceiling with
// zero headroom. So this module returns the LETTER, and the chip's stylesheet
// maps `[data-cat]` to a token colour — which also means the chip's tint can
// never drift from its text colour, since the tint is mixed from `currentColor`.

export type DtcCategory = 'P' | 'B' | 'C' | 'U' | 'X'

const CATEGORY_NAMES: Record<DtcCategory, string> = {
  P: 'Powertrain',
  B: 'Body',
  C: 'Chassis',
  U: 'Network',
  X: 'Other',
}

/** The category letter a code declares, or `X` when it declares none we know. */
export function dtcCategory(code: string): DtcCategory {
  const first = code.trim().charAt(0).toUpperCase()
  return first === 'P' || first === 'B' || first === 'C' || first === 'U' ? first : 'X'
}

export function dtcCategoryName(category: DtcCategory): string {
  return CATEGORY_NAMES[category]
}
