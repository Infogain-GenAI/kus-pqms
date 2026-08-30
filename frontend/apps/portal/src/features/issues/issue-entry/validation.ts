import type { ModelCodeSelection } from '../ModelCodeYearPicker'

/**
 * Full-submit validation for Issue Entry.
 *
 * Ported from `useIssueEntryValidation.ts`.
 *
 * ─── WHY THIS EXISTS WHEN THERE WAS ALREADY A `canRegister` FLAG ─────────────
 *
 * The screen gated Register Issue on a single boolean. That tells a user the
 * button is dead and nothing else — not which field is missing, not that there
 * are four of them, and not that one of the model codes they picked has no year
 * checked. A disabled button with no message is the least informative failure a
 * form can have, and this form has ten or more fields across three sections.
 *
 * So validation returns FIELD ERRORS, each carrying the section it belongs to
 * and the exact copy to render, and the screen shows them at the fields.
 *
 * ─── TWO RULES THIS ADDS THAT THE FLAG DID NOT HAVE ──────────────────────────
 *
 * 1. SYMPTOM IS REQUIRED AT SUBMIT. `canRegister` never checked it, so an issue
 *    could be registered with system/sub-system/component and no symptom — which
 *    is the field the correlation panel matches on. Note the asymmetry the Vue
 *    source is careful about: symptom gates REGISTRATION but not step progress,
 *    because you should be able to work through the cascade before committing.
 *
 * 2. EVERY SELECTED MODEL CODE MUST KEEP AT LEAST ONE YEAR. The picker allows
 *    clearing a code's years — that is a legitimate intermediate state — but
 *    submitting one is not. One error per offending code, keyed `year:{code}`,
 *    so the message can be shown against the row it belongs to rather than as a
 *    single vague sentence about "model years".
 */

export type IssueEntrySection = 'vehicle' | 'classification' | 'issue'

export interface FieldError {
  section: IssueEntrySection
  /** `title`, `description`, `source`, `system`… or `year:{code}` for a row. */
  fieldKey: string
  message: string
}

export interface IssueEntryDraft {
  vehicle: ModelCodeSelection
  system?: string
  subSystem?: string
  component?: string
  symptom?: string
  title: string
  description: string
}

export function validateIssueEntry(draft: IssueEntryDraft): FieldError[] {
  const errors: FieldError[] = []

  // ── Vehicle information ──
  if (draft.vehicle.codes.length === 0) {
    errors.push({ section: 'vehicle', fieldKey: 'modelCode', message: 'Select a model code.' })
  }
  for (const code of draft.vehicle.codes) {
    if ((draft.vehicle.yearsByCode[code] ?? []).length === 0) {
      errors.push({ section: 'vehicle', fieldKey: `year:${code}`, message: `Select at least one model year for ${code}.` })
    }
  }

  // ── System classification ──
  if (!draft.system) errors.push({ section: 'classification', fieldKey: 'system', message: 'Select a system.' })
  if (!draft.subSystem) errors.push({ section: 'classification', fieldKey: 'subsystem', message: 'Select a sub-system.' })
  if (!draft.component) errors.push({ section: 'classification', fieldKey: 'component', message: 'Select a component.' })
  if (!draft.symptom) errors.push({ section: 'classification', fieldKey: 'symptom', message: 'Select a symptom.' })

  // ── Issue information ──
  // The 5-character floor is this app's own rule and is kept: a title of "abc"
  // is not a title. The message says the requirement rather than only that the
  // value is wrong.
  if (!draft.title.trim()) {
    errors.push({ section: 'issue', fieldKey: 'title', message: 'Enter an issue title.' })
  } else if (draft.title.trim().length < 5) {
    errors.push({ section: 'issue', fieldKey: 'title', message: 'Enter an issue title of at least 5 characters.' })
  }
  if (!draft.description.trim()) {
    errors.push({ section: 'issue', fieldKey: 'description', message: 'Describe the issue.' })
  }
  return errors
}

/** Look up one field's message. Returns undefined once the field is filled. */
export function errorFor(errors: FieldError[], fieldKey: string): string | undefined {
  return errors.find((e) => e.fieldKey === fieldKey)?.message
}

/** How many errors belong to a section — drives the per-section count in the banner. */
export function countBySection(errors: FieldError[], section: IssueEntrySection): number {
  return errors.filter((e) => e.section === section).length
}
