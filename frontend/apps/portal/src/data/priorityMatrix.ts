// Issue Priority — Phase 1 manual scoring matrix.
// Ported verbatim from the V4-V5 prototype's `PRI_MATRIX` / `QPRIO` (ISM + QIR SE Role).
// This is the source of truth for QIR priority: a QIR inherits the letter computed here,
// and the prototype blocks QIR creation until an issue has been scored and saved.

export type PriorityLetter = 'A' | 'B' | 'C'

export interface PriorityOption {
  label: string
  pts: number
}

export interface PriorityItem {
  key: string
  label: string
  options: PriorityOption[]
}

export interface PrioritySection {
  key: string
  title: string
  items: PriorityItem[]
}

/** Rating bands. Tints/colors are the prototype's QPRIO values; `target` is the day target. */
export const PRIORITY_BANDS: Record<PriorityLetter, { color: string; tint: string; target: number; band: string }> = {
  A: { color: 'var(--danger-500)', tint: 'var(--danger-50)', target: 60, band: 'Rating A · 60-day target' },
  B: { color: '#B8860B', tint: '#FBF0D9', target: 75, band: 'Rating B · 75-day target' },
  C: { color: 'var(--success-500)', tint: 'var(--success-50)', target: 90, band: 'Rating C · 90-day target' },
}

/** Score → letter. Thresholds are the prototype's: >=26 → A, >=11 → B, else C. */
export function priorityLetter(total: number): PriorityLetter {
  return total >= 26 ? 'A' : total >= 11 ? 'B' : 'C'
}

/** Reference table shown beside the matrix (the prototype's priInfoRows). */
export const PRIORITY_INFO: { letter: PriorityLetter; score: string; desc: string }[] = [
  { letter: 'A', score: '> 25', desc: 'Immediate escalation' },
  { letter: 'B', score: '11–24', desc: 'Management awareness required' },
  { letter: 'C', score: '< 10', desc: 'Standard team handling' },
]

export const PRI_MATRIX: PrioritySection[] = [
  {
    key: 'leading',
    title: 'Leading Indicator',
    items: [
      { key: 'li_techline', label: 'Tech Line Cases', options: [{ label: '> 5/week or > 10 total', pts: 3 }, { label: '1–5/week or 1–10 total', pts: 2 }] },
      { key: 'li_fpqr', label: 'FPQR / DPQR', options: [{ label: '> 2/week or > 5 total', pts: 3 }, { label: '1–2/week or 1–5 total', pts: 2 }] },
      { key: 'li_sudden', label: 'Sudden Increase', options: [{ label: 'Parts demand (warranty/demand)', pts: 3 }] },
      { key: 'li_field', label: 'Field QIR', options: [{ label: 'Field or Key Dealer QIR', pts: 1 }] },
      { key: 'li_vendor', label: 'Vendor QIR', options: [{ label: 'Discovered by vendor/supplier', pts: 1 }] },
      { key: 'li_warrOcc', label: 'Warranty Occurrence % (Claims/UIO)', options: [{ label: '> 1.0%', pts: 3 }, { label: '0.5%–1.0%', pts: 2 }, { label: '0.05%–0.49%', pts: 1 }] },
    ],
  },
  {
    key: 'voice',
    title: 'Customer Voice',
    items: [
      { key: 'cv_social', label: 'Social Media', options: [{ label: '> 2/week or > 5 total', pts: 3 }, { label: '1–2/week or 1–5 total', pts: 2 }] },
      { key: 'cv_jdp', label: 'JDP IQS / VDS', options: [{ label: '> 2 PP/100', pts: 3 }, { label: '1–2 PP/100', pts: 2 }] },
      { key: 'cv_care', label: 'Customer Care Cases', options: [{ label: '> 5/week or > 10 total', pts: 3 }, { label: '1–5/week or 1–10 total', pts: 2 }] },
    ],
  },
  {
    key: 'modifier',
    title: 'Modifier',
    items: [
      { key: 'mod_importance', label: 'Importance', options: [{ label: 'Safety / Regulatory / Emissions', pts: 3 }, { label: 'Functional / NVH', pts: 2 }, { label: 'Appearance', pts: 1 }, { label: 'New Model', pts: 3 }] },
      { key: 'mod_durability', label: 'Durability / Occurrence Rate', options: [{ label: 'Weibull: Shape K > 1 (wearout)', pts: 3 }, { label: 'O.R. ≥ 0.2%', pts: 3 }, { label: '0 < O.R. < 0.2%', pts: 2 }] },
      { key: 'mod_recurrence', label: 'Recurrence', options: [{ label: 'Recurrence of Priority A QIR', pts: 3 }, { label: 'Post-countermeasure recurrence', pts: 3 }, { label: 'Recurrence of B/C QIR', pts: 2 }] },
      { key: 'mod_repairability', label: 'Repairability', options: [{ label: 'No repair available / Buy-backs', pts: 3 }, { label: 'Difficult to repair', pts: 2 }, { label: 'Can be repaired (non-standard)', pts: 1 }] },
      { key: 'mod_multiModel', label: 'Multi-Model', options: [{ label: 'Affects more than one model', pts: 3 }] },
      { key: 'mod_dup', label: 'QIR Duplication', options: [{ label: 'Confirmed on a vehicle', pts: 2 }, { label: 'Confirmed by recovered parts/software', pts: 2 }] },
      { key: 'mod_wildcard', label: 'Wild Card', options: [{ label: 'Escalation by Region or Key Dealer', pts: 2 }, { label: 'Kia Executive Escalation', pts: 3 }] },
      { key: 'mod_repairCost', label: 'Repair Cost', options: [{ label: 'High: > $1,000', pts: 3 }, { label: 'Medium: $500–$1,000', pts: 2 }, { label: 'Low: < $500', pts: 1 }] },
    ],
  },
]

/** Maximum attainable score — the highest option of every item. Drives the progress bar. */
export const PRIORITY_SCORE_CAP = PRI_MATRIX.reduce(
  (a, sec) => a + sec.items.reduce((b, it) => b + Math.max(...it.options.map((o) => o.pts)), 0),
  0,
)

export function priorityTotal(scores: Record<string, number>): number {
  return Object.values(scores ?? {}).reduce((a, n) => a + (n || 0), 0)
}

export function findPriorityItem(key: string): PriorityItem | undefined {
  for (const sec of PRI_MATRIX) {
    const it = sec.items.find((x) => x.key === key)
    if (it) return it
  }
  return undefined
}
