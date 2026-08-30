import type { Issue } from '@/data/types'

/**
 * Related-issue ranking for the "Same Existing Issues" panel on Issue Entry.
 *
 * ─── WHY THIS EXISTS: THE MATCHER WAS EXACT-SYMPTOM EQUALITY ─────────────────
 *
 * The panel used to be driven by
 * `store.issues.filter(i => i.symptom === symptomLabel).slice(0, 5)` — a single
 * exact string comparison on one field. Almost nothing ever matched, so the card
 * rendered its "No similar issues were found" branch on virtually every entry
 * and the feature read as broken rather than empty.
 *
 * NOTE THE FAILURE MODE, because it is why this went unnoticed: a card that
 * renders empty compiles cleanly and captures pixel-identically. Neither a
 * typecheck nor a fidelity capture can see it. Only reading the predicate or
 * exercising the screen finds this class of defect.
 *
 * ─── A FAITHFUL PORT, WEIGHTS INCLUDED ──────────────────────────────────────
 *
 * This reproduces the UX prototype's `_relatedRank(ctx, pool, excludeId)` —
 * scoring weights, reason strings, thresholds and tie-breaks — rather than
 * inventing a similarity measure that happens to return more rows. The weights
 * are not arbitrary and are not ours to retune: they encode which coincidences
 * the domain considers meaningful. A same-DTC hit (16) outranks a same-system
 * hit (14) because two issues quoting one trouble code is stronger evidence than
 * two issues merely sharing a top-level system.
 *
 * TWO FIELD-NAME TRANSLATIONS, deliberate and worth stating so nobody "fixes"
 * them back: the prototype's `subsystem` is our `subSystem`, and its `dtcChips`
 * is our `dtcCodes`. Its description keywords come from `p.summary`; the
 * equivalent field on our `Issue` is `description`.
 *
 * ─── SCOPE — THE SECOND SITE IS NOW FIXED TOO (2026-08-31) ──────────────────
 *
 * This note used to say the ranker was for Issue Entry only, and that
 * `store.correlations()` carried the SAME exact-symptom defect but was being
 * left alone as out of scope for that pass. That follow-up has happened:
 * `correlations()` now calls this function, so Issue Entry and the workspace's
 * Manage-Links modal share ONE definition of "related".
 *
 * The measurement, since it is what justified the change: under exact-symptom
 * equality **20 of the 35 seeded issues returned no candidates at all**, so the
 * modal reported none for well over half the register.
 *
 * ─── AND THAT IS WHY THIS FILE LIVES IN `data/` ─────────────────────────────
 *
 * It was `features/issues/issue-entry/relatedRank.ts` while Issue Entry was its
 * only consumer. `data/` is a leaf layer that has never imported from
 * `features/`, so leaving it there and having the store reach upward would have
 * been the first such inversion. Nothing about the logic changed in the move —
 * it imports only `Issue` from `data/types`.
 */

/** One ranked candidate. `reasons` drives the "Suggested because: …" line. */
export interface RankedIssue {
  issue: Issue
  /** All four classification fields present and equal. Scores 100 on its own. */
  exact: boolean
  reasons: string[]
  score: number
}

/** The draft being registered, as far as it has been filled in. */
export interface RankContext {
  system?: string
  subSystem?: string
  component?: string
  symptom?: string
  title?: string
  description?: string
  dtcCodes?: string[]
  modelCode?: string
}

const cn = (v: unknown) => String(v ?? '').trim().toLowerCase()

/**
 * A system's first token — "Electrical / Charge port" and "Electrical" are the
 * same system for matching purposes. Split on space OR slash, per the prototype.
 */
const sysTok = (v: unknown) => cn(String(v ?? '').split(/[ /]/)[0])

/**
 * Words too common to carry signal. Note it includes domain filler — `issue`,
 * `fault`, `error` appear in most titles in this application and matching on
 * them would make every pair look related.
 */
const STOP = new Set([
  'the', 'and', 'for', 'with', 'under', 'after', 'from',
  'issue', 'fault', 'error', 'over', 'into', 'when', 'that', 'this',
])

/** Distinct keywords longer than three characters, stop-words removed. */
const kw = (t: unknown): string[] =>
  Array.from(
    new Set(
      String(t ?? '')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 3 && !STOP.has(w)),
    ),
  )

/**
 * Rank `pool` against `ctx`, strongest first. Only candidates scoring above zero
 * are returned, so "no reason at all" never appears as a weak suggestion.
 *
 * Callers cap the list — Issue Entry takes the top 8, matching the prototype.
 */
export function relatedRank(ctx: RankContext, pool: Issue[], excludeId?: string): RankedIssue[] {
  const cSys = sysTok(ctx.system)
  const cSub = cn(ctx.subSystem)
  const cComp = cn(ctx.component)
  const cSymp = cn(ctx.symptom)
  const cMC = cn(ctx.modelCode)
  const cTitleKw = kw(ctx.title)
  const cDescKw = kw(ctx.description)
  const cDtc = (ctx.dtcCodes ?? []).map((x) => String(x).toUpperCase())

  const out: RankedIssue[] = []

  for (const p of pool) {
    if (excludeId && p.id === excludeId) continue

    let score = 0
    const reasons: string[] = []

    const pSys = sysTok(p.system)
    const pSub = cn(p.subSystem)
    const pComp = cn(p.component)
    const pSymp = cn(p.symptom)

    // All four set AND all four equal. Scores as one fact rather than four,
    // because four partial matches that happen to add up is a weaker claim than
    // a complete classification match.
    const exact = !!(cSys && cSub && cComp && cSymp) && pSys === cSys && pSub === cSub && pComp === cComp && pSymp === cSymp

    if (exact) {
      score += 100
      reasons.push('Exact classification match')
    } else {
      if (cSys && pSys === cSys) { score += 14; reasons.push('Same system') }
      if (cSub && pSub === cSub) { score += 10; reasons.push('Same sub-system') }
      if (cComp && pComp === cComp) { score += 12; reasons.push('Same component') }
      if (cSymp && pSymp === cSymp) { score += 10; reasons.push('Similar symptom') }
    }

    if (cMC && cn(p.modelCode) === cMC) { score += 8; reasons.push('Same model code') }

    const pDtc = (p.dtcCodes ?? []).map((x) => String(x).toUpperCase())
    if (cDtc.length && pDtc.length && cDtc.some((d) => pDtc.includes(d))) {
      score += 16
      reasons.push('Same DTC')
    }

    // Two shared title keywords is the threshold — one is coincidence.
    const pTitleKw = kw(p.title)
    const titleHit = cTitleKw.filter((w) => pTitleKw.includes(w)).length >= 2
    if (titleHit) { score += 9; reasons.push('Similar issue title') }

    // Description is checked only when the title did NOT hit, so a pair cannot
    // claim both prose reasons; it needs three shared keywords rather than two,
    // because descriptions are longer and collide more easily by chance.
    if (!titleHit) {
      const pDescKw = kw(p.description)
      if (cTitleKw.concat(cDescKw).filter((w) => pDescKw.includes(w)).length >= 3) {
        score += 7
        reasons.push('Similar description')
      }
    }

    if (score > 0) out.push({ issue: p, exact, reasons, score })
  }

  out.sort((a, b) => b.score - a.score)
  return out
}
