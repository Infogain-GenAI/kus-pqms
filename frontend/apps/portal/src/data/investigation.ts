// Investigation domain — activity types, their per-type form shapes and tints,
// and the picker directories the Add-activity form offers.
//
// PORTED FROM THE VUE IMPLEMENTATION (`investigation/investigation.types.ts`
// and `api/investigation.ts`). The vocabularies, the per-type field sets, the
// details labels and placeholders, and the tint map are carried over verbatim —
// those were traced there from design captures, and the file records at length
// which rows are evidenced and which were removed for being guesses.
//
// TWO THINGS THAT DELIBERATELY SURVIVE FROM THIS APP AND ARE NOT REPLACED:
//
//  - THE FIVE EXISTING ACTIVITY TYPES. Vue's captures evidence three types
//    ("PQ Evaluation" / "Dealer Investigation" / "Joint Investigation"); this
//    app already offers five different ones. Both lists are kept. Dropping this
//    app's five would remove working options to match a list its own source
//    calls "everything we can prove, not everything there is".
//
//  - THE URGENCY VOCABULARY. Vue uses the backend's LOW/MEDIUM/HIGH enum; this
//    app uses Routine/Priority/Emergency, and `addPart` derives auto-approval
//    from "Routine" specifically. There is no backend here for LOW/MEDIUM/HIGH
//    to be the wire format OF, so switching would break a working rule to match
//    a constraint this app does not have.

/**
 * Deliberately `string`, not a closed union — carried over from Vue, and its
 * reasoning holds here too: a user can request a NEW activity type, so the set
 * is open by construction and an approved request adds a member no union could
 * have contained. Everything that reads a type falls back rather than indexing.
 */
export type ActivityType = string

/** Tint vocabulary for the activity-type badge. */
export type ActivityTint = 'blue' | 'purple' | 'amber' | 'teal' | 'rose' | 'green' | 'neutral'

/**
 * Selectable activity types: this app's original five, then the three the Vue
 * captures evidence. Order puts the pre-existing ones first so nothing that was
 * one click away becomes two.
 */
export const ACTIVITY_TYPES: readonly ActivityType[] = [
  'Field Inspection',
  'Bench Test',
  'Data Analysis',
  'Supplier Review',
  'Note',
  'PQ Evaluation',
  'Dealer Investigation',
  'Joint Investigation',
]

/**
 * Per-type tint. A PARTIAL map with an explicit fallback, not a total one:
 * `ActivityType` is open, so totality is unachievable, and an untinted type will
 * occur the first time a requested type is approved.
 *
 * Vue's file records removing three tints that no capture ever showed, on the
 * grounds that "a tint for a type that may not exist is worse than no tint,
 * because it reads as confirmation". The same restraint applies to this app's
 * own five: they are given neutral rather than invented colours.
 */
const ACTIVITY_TINTS: Partial<Record<ActivityType, ActivityTint>> = {
  'PQ Evaluation': 'blue',
  'Joint Investigation': 'purple',
  'Dealer Investigation': 'teal',
}

export const ACTIVITY_TINT_FALLBACK: ActivityTint = 'neutral'

export function activityTint(type: ActivityType): ActivityTint {
  return ACTIVITY_TINTS[type] ?? ACTIVITY_TINT_FALLBACK
}

/* ───────────────────────────── per-type form shape ─────────────────────────── */

/** A field that may appear between Activity type and the details field. */
export type ActivityFieldKey = 'evaluationType' | 'vins' | 'dealerCode' | 'members' | 'parts'

export interface ActivityTypeForm {
  /** Fields between Activity type and the details field, in render order. */
  fields: ActivityFieldKey[]
  /**
   * The details field's label AND placeholder both vary by type and travel
   * together — two types share the same pair, so this is a `type → (label,
   * placeholder)` mapping, not a label swap over a fixed placeholder.
   */
  detailsLabel: string
  detailsPlaceholder: string
}

const GENERIC_DETAILS = 'Document observations, measurements, analysis and conclusions in detail…'

/**
 * The Add-activity form's field set is CONDITIONAL on the selected type. Every
 * type follows one skeleton:
 *
 *   Activity type* → [these fields] → {Type} details* → Attachments → Save
 *
 * Every conditional field that appears is required; Attachments is always
 * present and always optional; Save is always last.
 *
 * Only EVIDENCED rows appear. This app's own five types have no captured field
 * set, so they resolve to the fallback rather than being given invented fields —
 * which is exactly how they behaved before this file existed.
 */
const ACTIVITY_TYPE_FORMS: Record<string, ActivityTypeForm> = {
  'PQ Evaluation': {
    fields: ['evaluationType', 'parts'],
    detailsLabel: 'Evaluation details',
    detailsPlaceholder: 'Describe the evaluation findings…',
  },
  'Dealer Investigation': {
    fields: ['vins', 'dealerCode'],
    detailsLabel: 'Investigation details',
    detailsPlaceholder: GENERIC_DETAILS,
  },
  'Joint Investigation': {
    fields: ['members'],
    detailsLabel: 'Investigation details',
    detailsPlaceholder: GENERIC_DETAILS,
  },
}

/**
 * Reached by any type with no row above — including every type approved through
 * the request-new flow. Renders NO conditional fields: the details field and
 * attachments are the only elements every captured type shares, so they are the
 * only safe default. The wording stays generic rather than asserting an
 * evaluation or investigation framing the type may not have.
 */
export const ACTIVITY_TYPE_FORM_FALLBACK: ActivityTypeForm = {
  fields: [],
  detailsLabel: 'Details',
  detailsPlaceholder: GENERIC_DETAILS,
}

export function activityTypeForm(type: ActivityType): ActivityTypeForm {
  return ACTIVITY_TYPE_FORMS[type] ?? ACTIVITY_TYPE_FORM_FALLBACK
}

/** True when the given type renders the named field. */
export function typeHasField(type: ActivityType, field: ActivityFieldKey): boolean {
  return activityTypeForm(type).fields.includes(field)
}

/* ─────────────────────────── change requests ───────────────────────────────── */

import type { ChangeRequestField } from './types'

/**
 * Shown as the modal's subtitle and the reason the whole flow exists: a
 * recorded activity is evidence, so it is corrected by an approved request
 * rather than edited.
 */
export const IMMUTABILITY_NOTE = 'These are immutable records. Change is applied only after approval.'

/**
 * The fields a change request may target, in the order the select offers them.
 *
 * THREE MEMBERS, NOT THE WHOLE FORM. This list is INDEPENDENT of the activity
 * type's own field set: `partNumber` is offered on a PQ Evaluation activity
 * whose form does render a part field, but the two lists are not the same list
 * and must never be computed from one another — a correctable field and a
 * capturable field are different questions.
 */
export const CHANGE_REQUEST_FIELDS: readonly ChangeRequestField[] = ['details', 'activityDate', 'partNumber']

const STATIC_CHANGE_REQUEST_LABELS: Record<Exclude<ChangeRequestField, 'details'>, string> = {
  activityDate: 'Change Activity Date',
  partNumber: 'Part Number',
}

/** "Evaluation details" → "Evaluation Details". */
function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(' ')
}

/**
 * The label for a change-request field, RESOLVED AGAINST THE ACTIVITY'S TYPE.
 *
 * `details` is not a constant: on a PQ Evaluation activity it reads "Evaluation
 * Details", on an investigation it reads "Investigation Details".
 *
 * EVERY CONSUMER MUST RESOLVE THROUGH HERE — the modal's select, the
 * duplicate-field guard, and the request card's own header. The guard
 * interpolates this name into "You've already raised a request to update the
 * {field}…"; if that said "Details" while the select said "Evaluation Details",
 * the guard would name a field the user never saw, on the one screen whose
 * entire purpose is telling them which field is already pending.
 */
export function changeRequestFieldLabel(field: ChangeRequestField, activityType: ActivityType): string {
  if (field === 'details') return titleCase(activityTypeForm(activityType).detailsLabel)
  return STATIC_CHANGE_REQUEST_LABELS[field]
}

/**
 * The control the Proposed-change input renders for a field. Three genuinely
 * different controls, so the modal switches rather than reusing one textarea
 * with variants — a date typed into a textarea is a date nobody can validate.
 */
export function changeRequestControl(field: ChangeRequestField): 'textarea' | 'date' | 'parts' {
  if (field === 'activityDate') return 'date'
  if (field === 'partNumber') return 'parts'
  return 'textarea'
}

/* ───────────────────────────── picker directories ──────────────────────────── */

export const EVALUATION_TYPES: readonly string[] = [
  'Dimensional check',
  'Functional test',
  'Material analysis',
  'Supplier walkthrough',
  'Teardown',
]

/**
 * Dealers for the Dealer code picker. Names are carried as well as codes because
 * the field promises "Search dealer code or name" — someone who knows the dealer
 * but not its code must still be able to find it.
 */
export interface DealerOption {
  code: string
  name: string
}

export const DEALERS: readonly DealerOption[] = [
  { code: 'KD-1188', name: 'Kia Seoul Gangnam' },
  { code: 'KD-2043', name: 'Kia Busan Haeundae' },
  { code: 'KD-3310', name: 'Kia Incheon Songdo' },
  { code: 'KD-4501', name: 'Kia Daegu Suseong' },
]

export interface TeamMember {
  id: string
  name: string
  role: string
  company: string
}

export const TEAM_DIRECTORY: readonly TeamMember[] = [
  { id: 'tm-1', name: 'Arpita Chavda', role: 'SE', company: 'Kia' },
  { id: 'tm-2', name: 'Choi Min-seo', role: 'SE', company: 'Kia' },
  { id: 'tm-3', name: 'Ravi Kumar', role: 'TE', company: 'Kia' },
  { id: 'tm-4', name: 'Sunil Rao', role: 'DE', company: 'Mando' },
]

/** A part offered in the Add-activity parts picker. */
export interface PartOption {
  partNo: string
  qty: string
  /** true = typed in manually rather than drawn from the eligible list. */
  manual?: boolean
}

/**
 * The issue's eligible parts — the catalogue half of the picker's directory.
 *
 * DISTINCT FROM A PART REQUEST, and the two must never be routed to each other.
 * This is a list of parts to CITE on a finding; a part request is a formal
 * record with its own status and history.
 */
export const ELIGIBLE_PARTS: readonly PartOption[] = [
  { partNo: '0K2A1-58-810', qty: '2' },
  { partNo: '0K2B3-11-204', qty: '1' },
  { partNo: '0K2C7-33-090', qty: '4' },
]

/** VINs offered by the VIN(s) picker, derived from the issue's own model codes. */
export function vinOptionsFor(issueId: string): string[] {
  // No VIN data exists in this app's seed. Rather than fabricate plausible VINs
  // — which would look like real vehicles and be cited on real findings — the
  // picker offers none and accepts manual entry, which is what a VIN field is
  // mostly used for anyway.
  void issueId
  return []
}
