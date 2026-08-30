import type { DtcCategory } from './dtcCategory'

/**
 * DTC reference catalogue — codes with their category and a human-readable
 * description.
 *
 * ─── WHY THIS EXISTS, AND WHAT THE INVESTIGATION ESTABLISHED ────────────────
 *
 * Issue Entry previously offered DTC suggestions drawn from codes already
 * recorded on other issues. That was wrong, and the two reference
 * implementations agree on why:
 *
 * · **The UX prototype** suggests from a `DTC_CODES()` array, filtering on code
 *   OR description. Its seven entries carry a dealer name, a region and a
 *   repair-order count — that content is demo data, a prop. **Its SHAPE is the
 *   spec**: a catalogue keyed by code and searchable by description.
 *
 * · **The Vue predecessor** (`kus-pqms`) is stronger evidence, being a working
 *   implementation of this product. Its `DtcTypeahead.vue` calls
 *   `masterDataService.dtcCodes()` behind `VITE_USE_FIXTURES`, with the twelve
 *   entries below standing in as the fixture. So DTC is treated there as
 *   **master data behind a service**, not as a static list — an architecture
 *   rather than a data set.
 *
 * The capability neither of them lacks and we did: **searching the
 * description.** Typing "misfire" returns `P0301 Cylinder 1 Misfire Detected`
 * in both references and returned nothing here, because we held no descriptions
 * at all. That is a missing capability, not a smaller version of one.
 *
 * ─── WHY A LOCAL FIXTURE AND NOT A SERVICE ──────────────────────────────────
 * There is no backend to call. Building the service seam now would commit this
 * app to an endpoint that does not exist, so the decision was the fixture alone.
 * The shape below is deliberately the Vue app's `DtcOption`, so replacing this
 * module with a fetch later is a change of source, not a change of contract.
 *
 * ─── CATEGORY IS DATA HERE, NOT A GUESS ─────────────────────────────────────
 * Each entry carries its own category. `@/data/dtcCategory` remains the home for
 * the letter → name and letter → colour mapping, and keeps that job — what
 * changed is that for a catalogue code the letter is now LOOKED UP rather than
 * inferred from the first character. The inference is correct for all twelve of
 * these and is still the fallback for a code typed by hand that is not in the
 * catalogue; it is a heuristic, and a heuristic that happens to agree is not the
 * same as a lookup that is right by construction.
 */
export interface DtcCatalogEntry {
  code: string
  category: DtcCategory
  description: string
}

/**
 * Ported verbatim from the Vue app's `api/vehicle-master.ts` `DTC_CATALOG`.
 * Twelve entries across all four categories — deliberately not extended here: a
 * longer list invented locally would look like reference data without being it,
 * which is exactly the trap the prototype's seven dealer-tagged codes set.
 */
export const DTC_CATALOG: DtcCatalogEntry[] = [
  { code: 'P0301', category: 'P', description: 'Cylinder 1 Misfire Detected' },
  { code: 'P0302', category: 'P', description: 'Cylinder 2 Misfire Detected' },
  { code: 'P0420', category: 'P', description: 'Catalyst System Efficiency Below Threshold' },
  { code: 'P0A0F', category: 'P', description: 'Drive Motor A Performance' },
  { code: 'P0D00', category: 'P', description: 'Hybrid Battery Pack Charge Depleted' },
  { code: 'B1020', category: 'B', description: 'Airbag Control Module Communication Error' },
  { code: 'B2201', category: 'B', description: 'Door Open Switch Circuit' },
  { code: 'C1234', category: 'C', description: 'ABS Wheel Speed Sensor Front Right' },
  { code: 'C1241', category: 'C', description: 'Low Battery Positive Voltage' },
  { code: 'U0100', category: 'U', description: 'Lost Communication With ECM/PCM' },
  { code: 'U0155', category: 'U', description: 'Lost Communication With Instrument Panel' },
  { code: 'U0401', category: 'U', description: 'Invalid Data Received From ECM/PCM' },
]

/**
 * Catalogue lookup by exact code. Returns `undefined` for anything not in the
 * catalogue — which is a legitimate state, not an error: a technician may enter
 * a real code this fixture does not carry, and the form must accept it.
 */
export function dtcEntry(code: string): DtcCatalogEntry | undefined {
  const c = code.trim().toUpperCase()
  return DTC_CATALOG.find((d) => d.code === c)
}

/**
 * Suggestions for a search term, matching **code OR description** — the
 * behaviour both references share.
 *
 * An empty term returns nothing rather than the whole catalogue, matching both
 * references: the field is for entering a code you already have, and opening a
 * list of twelve unprompted would suggest otherwise.
 *
 * `exclude` drops codes already committed as chips, so the panel never offers
 * something the user has just added.
 */
export function dtcSuggestions(term: string, exclude: string[] = [], limit = 6): DtcCatalogEntry[] {
  const q = term.trim().toUpperCase()
  if (!q) return []
  const taken = new Set(exclude.map((c) => c.trim().toUpperCase()))
  return DTC_CATALOG.filter(
    (d) => !taken.has(d.code) && (d.code.includes(q) || d.description.toUpperCase().includes(q)),
  ).slice(0, limit)
}
