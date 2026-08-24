/**
 * Model Code master data — verbatim from the prototype's `MC_MASTER`.
 *
 * Lifted out of `CreateIssueScreen` so Issue Entry, Issue Detail's in-tab edit mode and the
 * list's model filters all resolve codes from one table rather than three copies.
 */

export interface ModelCodeEntry {
  code: string
  name: string
  y0: number
  y1: number
  /** Display range: a single year collapses to `2027`, a span renders `2022–2027`. */
  range: string
}

const MASTER: Omit<ModelCodeEntry, 'range'>[] = [
  { code: 'GH', name: 'AMANTI', y0: 2004, y1: 2009 },
  { code: 'HM', name: 'BORREGO', y0: 2009, y1: 2011 },
  { code: 'TD', name: 'FORTE', y0: 2010, y1: 2013 },
  { code: 'VG', name: 'CADENZA', y0: 2014, y1: 2016 },
  { code: 'YD', name: 'FORTE', y0: 2014, y1: 2018 },
  { code: 'KH', name: 'K900', y0: 2015, y1: 2018 },
  { code: 'CK', name: 'STINGER', y0: 2018, y1: 2023 },
  { code: 'BD', name: 'FORTE MEXICO', y0: 2019, y1: 2024 },
  { code: 'DL', name: 'K5', y0: 2021, y1: 2027 },
  { code: 'KA', name: 'CARNIVAL', y0: 2022, y1: 2027 },
  { code: 'CV', name: 'EV6.KR', y0: 2022, y1: 2025 },
  { code: 'NQ', name: 'SPORTAGE PLUG-IN HYBRID', y0: 2023, y1: 2027 },
  { code: 'SV', name: 'EV3', y0: 2027, y1: 2027 },
  { code: 'LQ', name: 'TELLURIDE', y0: 2027, y1: 2027 },
]

export const MODEL_CODES: ModelCodeEntry[] = MASTER.map((m) => ({
  ...m,
  range: m.y0 === m.y1 ? String(m.y0) : `${m.y0}–${m.y1}`,
}))

/** The nominal model years for a code. Empty for an unknown code. */
export function modelYearsFor(code: string): string[] {
  const e = MODEL_CODES.find((m) => m.code === code)
  if (!e) return []
  return Array.from({ length: e.y1 - e.y0 + 1 }, (_, i) => String(e.y0 + i))
}

/** Model name for a code, or undefined when the code is not in the master list. */
export function modelNameFor(code: string): string | undefined {
  return MODEL_CODES.find((m) => m.code === code)?.name
}
