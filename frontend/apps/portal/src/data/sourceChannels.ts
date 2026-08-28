// Source-channel field vocabulary — the per-channel evidence schema behind the
// Issue source card and the Add / edit sources form.
//
// PORTED FROM THE VUE IMPLEMENTATION (`kus-pqms/frontend/apps/pqms-portal/src/
// api/issues.ts`, SOURCE_CHANNEL_FIELD_TEMPLATES and the option vocabularies
// above it). Every field label, placeholder, option list, `required` marker,
// `readOnly` marker and `metaSuffix` is carried over verbatim — those were
// traced there from the V5 prototype's own JS state (`weibCIOpts`,
// `casePriorityOpts`, `callerRoleOpts`, `ewsThresholdOpts`, `ewsCategoryOpts`,
// `gqisSeverityOpts`), not guessed, and re-deriving them here would throw that
// away.
//
// TWO DELIBERATE DIFFERENCES FROM THE VUE FILE, both to avoid a second source
// of truth rather than to change behaviour:
//
//  1. KEYED BY `SourceKey`, NOT BY DISPLAY NAME. Vue keys these by the string
//     "Warranty"/"Weibull"/…; this app already has `SOURCE` in the ui-library
//     mapping the same seven channels to their label AND their Lucide icon —
//     and to the same icons Vue's own SOURCE_CHANNEL_TILES lists (FileWarning,
//     Activity, RotateCcw, Headset, ClipboardList, ShieldAlert, Globe). So the
//     names and icons are read from there and are not restated here. Vue needed
//     its own tile list precisely because it had no such registry.
//
//  2. NO GENERATED DEMO VALUES. Vue's templates take a seed index and fabricate
//     a plausible value per field, because its fixtures ARE the data source.
//     Here the seed already carries `sourceEvidence`, so values come from the
//     issue (see `resolveSourceChannels`) and templates start blank — which is
//     what Vue's own `getSourceChannelFieldTemplate` does for a freshly toggled
//     channel anyway.
//
// The three deliberately-blank read-only fields (EWS alert ID, GQIS record ID,
// GQIS Sync date) stay blank here for the same reason they are blank in Vue:
// no backend generator or sync process exists for them, and the prototype's
// "auto · writeback" behaviour has nothing behind it. They are never fabricated.
import { SOURCE, SOURCE_KEYS, type SourceKey } from '@pqms/ui-library'

/** Control the "Add / edit sources" form renders for a field. */
export type SourceFieldType = 'text' | 'select' | 'date' | 'textarea'

/** Only present when `type: 'select'` — value is the stored string, label is display text. */
export interface SourceFieldOption {
  label: string
  value: string
}

export interface SourceChannelField {
  label: string
  value: string
  /** Which control renders this field. */
  type: SourceFieldType
  /** Only meaningful when `type: 'select'`. */
  options?: SourceFieldOption[]
  required: boolean
  /**
   * True for the three fields the prototype marks system-populated (EWS alert
   * ID, GQIS record ID, GQIS Sync date). Carried on the field rather than
   * matched by label at render time.
   */
  readOnly: boolean
  /**
   * Text/textarea: the prototype's `placeholder` attribute, verbatim.
   * Select: the prototype's own `{value:'',label:'Select …'}` first-option text —
   * 5 of the 6 selects carry one (Weibull's Confidence level is the exception).
   * Date inputs never carry one.
   */
  placeholder?: string
  /**
   * The prototype's field-specific "· auto · writeback" / "· auto · INT-02 sync"
   * / "· read-only" suffix. Only set on the three `readOnly` fields, since the
   * text differs per field and is not derivable from `readOnly` alone. A generic
   * "· optional" is shown for any `required: false, readOnly: false` field.
   */
  metaSuffix?: string
  /**
   * True only for Weibull's "Analysis report reference" and FPQR's "Defect count
   * in field" — renders the attachment control beneath the field.
   */
  attachable?: boolean
  /** Names of files attached to this field. */
  attachments?: SourceFieldAttachment[]
}

export interface SourceFieldAttachment {
  id: string
  fileName: string
  sizeBytes: number
}

/** One captured evidence channel. */
export interface SourceChannel {
  channel: SourceKey
  fields: SourceChannelField[]
}

// ---------------------------------------------------------------------------
// Select vocabularies — verbatim from the Vue file, which traced them from the
// prototype's own JS consts. Where the prototype's value differs from its label
// (EWS "Telematics DTC"/"Telematics", every GQIS severity), that distinction is
// preserved exactly. Do not assume value === label; several of these prove it
// wrong. The blank `{value:'',label:'Select …'}` entry is dropped in both
// implementations — the control shows its own placeholder instead.
// ---------------------------------------------------------------------------

const WEIBULL_CONFIDENCE_OPTIONS: SourceFieldOption[] = [
  { label: '90%', value: '90%' },
  { label: '95%', value: '95%' },
  { label: '99%', value: '99%' },
]

const CASE_PRIORITY_OPTIONS: SourceFieldOption[] = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' },
]

const CALLER_ROLE_OPTIONS: SourceFieldOption[] = [
  { label: 'Dealer Technician', value: 'Dealer Technician' },
  { label: 'Service Advisor', value: 'Service Advisor' },
  { label: 'Field Engineer', value: 'Field Engineer' },
  { label: 'Shop Foreman', value: 'Shop Foreman' },
]

const EWS_THRESHOLD_OPTIONS: SourceFieldOption[] = [
  { label: 'IPTV', value: 'IPTV' },
  { label: 'Claim spike', value: 'Claim spike' },
  { label: 'Cost spike', value: 'Cost spike' },
  { label: 'Telematics DTC', value: 'Telematics' },
]

const EWS_CATEGORY_OPTIONS: SourceFieldOption[] = [
  { label: 'Safety', value: 'Safety' },
  { label: 'Emissions', value: 'Emissions' },
  { label: 'Reliability', value: 'Reliability' },
  { label: 'Compliance', value: 'Compliance' },
]

const GQIS_SEVERITY_OPTIONS: SourceFieldOption[] = [
  { label: 'S1 · Critical', value: 'S1' },
  { label: 'S2 · Major', value: 'S2' },
  { label: 'S3 · Moderate', value: 'S3' },
  { label: 'S4 · Minor', value: 'S4' },
]

/** Shorthand so the templates below read as the field lists they are. */
const text = (label: string, required: boolean, placeholder?: string, extra?: Partial<SourceChannelField>): SourceChannelField =>
  ({ label, value: '', type: 'text', required, readOnly: false, placeholder, ...extra })
const area = (label: string, required: boolean, placeholder: string): SourceChannelField =>
  ({ label, value: '', type: 'textarea', required, readOnly: false, placeholder })
const date = (label: string, required: boolean): SourceChannelField =>
  ({ label, value: '', type: 'date', required, readOnly: false })
const select = (label: string, required: boolean, options: SourceFieldOption[], placeholder?: string): SourceChannelField =>
  ({ label, value: '', type: 'select', required, readOnly: false, options, placeholder })
/** The three system-populated fields — blank, never fabricated. */
const auto = (label: string, metaSuffix: string): SourceChannelField =>
  ({ label, value: '', type: 'text', required: false, readOnly: true, metaSuffix })

/**
 * Per-channel field schema. Field order is the prototype's own order and is
 * also the order the evidence panel renders in.
 */
export const SOURCE_CHANNEL_FIELDS: Record<SourceKey, () => SourceChannelField[]> = {
  warranty: () => [
    text('Claim count', true, 'e.g. 124'),
    text('IPTV rate %', true, 'e.g. 2.5%'),
    date('Claim period from', true),
    date('Claim period to', true),
    text('Primary dealer region', true, 'e.g. NA · Southeast'),
    text('Warranty part number', false, 'e.g. 0K2A1-58-810'),
    text('Average repair cost', false, 'e.g. $1,240'),
  ],
  weibull: () => [
    text('Analysis ID', true, 'WB-…'),
    text('Failure rate at mileage', true, 'e.g. 1.9%'),
    text('B10 life estimate', true, 'e.g. 92,000 mi'),
    select('Confidence level %', true, WEIBULL_CONFIDENCE_OPTIONS),
    // Anchors the "Attach analysis report" capability.
    text('Analysis report reference', false, 'Report ID or link', { attachable: true }),
  ],
  comeback: () => [
    text('Comeback count', true, 'e.g. 3'),
    text('Comeback window (days)', true, 'e.g. 30'),
    text('Primary dealer', true, 'Dealer name / code'),
    text('Original RO number', false, 'RO-…'),
    area('Complaint description', true, 'Describe the repeat concern reported by the customer…'),
  ],
  techline: () => [
    text('Techline case number', true, 'TL-…'),
    select('Case priority', true, CASE_PRIORITY_OPTIONS, 'Select priority…'),
    text('Caller name', true, 'Full name'),
    select('Caller role', true, CALLER_ROLE_OPTIONS, 'Select role…'),
    area('Technical summary', true, 'Summarize the technical inquiry and findings…'),
  ],
  fpqr: () => [
    text('FPQR reference number', true, 'FPQR-…'),
    date('Field report date', true),
    text('Reporting location / market', true, 'e.g. NA · Southeast'),
    text('Field engineer name', true, 'Full name'),
    // Anchors the "Attach field photos" capability. A judgment call carried over
    // from Vue: no FPQR field is literally "the evidence field", so this mirrors
    // the prototype's visual adjacency — the button trails the panel's last field.
    text('Defect count in field', true, 'e.g. 17', { attachable: true }),
  ],
  ews: () => [
    auto('EWS alert ID', '· auto · writeback'),
    select('Alert threshold type', true, EWS_THRESHOLD_OPTIONS, 'Select threshold type…'),
    text('Alert trigger value', true, 'e.g. 3.2%'),
    date('Alert date', true),
    select('EWS category', true, EWS_CATEGORY_OPTIONS, 'Select category…'),
  ],
  gqis: () => [
    auto('GQIS record ID', '· auto · INT-02 sync'),
    text('GQIS category code', true, 'e.g. ELEC-014'),
    text('Market region', true, 'Korea / NA / EU'),
    select('GQIS severity level', true, GQIS_SEVERITY_OPTIONS, 'Select severity…'),
    auto('Sync date', '· read-only'),
  ],
}

/** Channel system codes shown as a mono badge on the evidence panel. */
export const SOURCE_CHANNEL_CODES: Partial<Record<SourceKey, string>> = {
  warranty: 'INT-03',
  weibull: 'INT-01',
  comeback: 'ADM0200',
  fpqr: 'QIM0040',
  gqis: 'INT-02',
}

/** Tile subtitle in the channel picker. */
export const SOURCE_CHANNEL_DESCRIPTOR: Record<SourceKey, string> = {
  warranty: 'Field claims & cost',
  weibull: 'Reliability model',
  comeback: 'Repeat repairs',
  techline: 'Dealer inquiry',
  fpqr: 'Field PQ report',
  ews: 'Early warning',
  gqis: 'Global QI',
}

/**
 * Evidence-panel heading — the prototype's own combined heading per channel,
 * distinct from the tile descriptor above (which is only the picker's subtitle).
 */
export const SOURCE_CHANNEL_PANEL_HEADING: Record<SourceKey, string> = {
  warranty: 'Warranty evidence',
  weibull: 'Weibull reliability analysis',
  comeback: 'Comeback · repeat repairs',
  techline: 'Techline inquiry',
  fpqr: 'FPQR · field report',
  ews: 'Early warning signal',
  gqis: 'Global quality information',
}

/**
 * Attach-button label. Only Weibull's "Analysis report reference" and FPQR's
 * "Defect count in field" are attachable; the prototype gives each its own
 * label rather than one generic string.
 */
export const SOURCE_ATTACH_LABEL: Partial<Record<SourceKey, string>> = {
  weibull: 'Attach analysis report',
  fpqr: 'Attach field photos',
}

/** A freshly toggled-on channel: the full schema, all values blank. */
export function blankChannel(channel: SourceKey): SourceChannel {
  return { channel, fields: SOURCE_CHANNEL_FIELDS[channel]().map((f) => ({ ...f })) }
}

/**
 * The channels to display for an issue.
 *
 * ADDITIVE BY DESIGN — `sourceChannels` is optional on `Issue`, so every issue
 * that predates it still renders. When absent this derives the channel list
 * from `sources ?? [source]` (the fields the seed already carries) and overlays
 * the issue's existing flat `sourceEvidence` onto the primary channel.
 *
 * NOTHING IN `sourceEvidence` IS DROPPED. A label that matches a template field
 * fills that field; a label that matches nothing is appended as an extra
 * read-only field rather than discarded — the seed's own evidence labels
 * ("Warranty claims", "Coverage", "Avg repair cost") are close to but not
 * identical with the template's ("Claim count", "Average repair cost"), and
 * silently losing the ones that differ is exactly the data loss this avoids.
 */
export function resolveSourceChannels(issue: {
  source: SourceKey
  sources?: SourceKey[]
  sourceEvidence?: { label: string; value: string }[]
  sourceChannels?: SourceChannel[]
}): SourceChannel[] {
  if (issue.sourceChannels) return issue.sourceChannels

  const keys = issue.sources?.length ? issue.sources : [issue.source]
  // Tile order, not selection order — so the panels never reshuffle.
  const ordered = SOURCE_KEYS.filter((k) => keys.includes(k))

  return ordered.map((channel, index) => {
    const base = blankChannel(channel)
    // Only the primary (first) channel carries the issue's flat evidence; there
    // is nothing in the old shape that says which channel a given row belonged
    // to, and inventing an attribution would be worse than under-claiming.
    if (index !== 0 || !issue.sourceEvidence?.length) return base

    const remaining = [...issue.sourceEvidence]
    const fields = base.fields.map((f) => {
      const hit = remaining.findIndex((e) => e.label.toLowerCase() === f.label.toLowerCase())
      if (hit === -1) return f
      const [ev] = remaining.splice(hit, 1)
      return { ...f, value: ev.value }
    })
    // Whatever did not match a template label is kept, not thrown away.
    const extras = remaining.map<SourceChannelField>((e) => ({
      label: e.label,
      value: e.value,
      type: 'text',
      required: false,
      readOnly: true,
      metaSuffix: '· recorded',
    }))
    return { channel, fields: [...fields, ...extras] }
  })
}

/** Display name for a channel — read from the shared registry, never restated. */
export function channelLabel(channel: SourceKey): string {
  return SOURCE[channel].label
}
