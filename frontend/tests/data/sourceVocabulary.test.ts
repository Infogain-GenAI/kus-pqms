import { describe, it, expect } from 'vitest'
import { SOURCE, SOURCE_KEYS } from '@pqms/ui-library'

/**
 * The issue-source VOCABULARY — the set of channel keys that may exist.
 *
 * ─── WHY THIS IS NOT A SCREEN TEST ──────────────────────────────────────────
 * These assertions used to live in `CreateIssueScreen.test.tsx`, against a chip
 * row on Issue Entry. That control is gone: registration no longer collects a
 * source, because the design registers an issue first and attributes its origin
 * later on the edit path.
 *
 * The knowledge outlived the control, which is why it moved rather than being
 * deleted with it. The vocabulary is a DOMAIN fact — it does not belong to
 * whichever screen happens to render it today, and the screen that renders it
 * now is `EditSourcesForm`, which builds its channel panels from `SOURCE_KEYS`.
 *
 * ─── THE DISTINCTION THIS PINS, AND THE ONE IT DOES NOT ─────────────────────
 * There are two different things here and only the first is a domain fact:
 *
 *   · THE VOCABULARY — the seven keys that may exist. Adding or renaming one is
 *     a domain change and should break a test. **This is what is pinned below.**
 *   · THE AVAILABLE SET — which of them a given surface offers today. That is
 *     ADMIN CONFIGURATION, not a domain fact, and it can legitimately be fewer:
 *     `AdminScreen`'s `sourceOn` already seeds `fpqr: false`. **Not pinned, and
 *     must not be** — a test asserting all seven are *offered* would fail
 *     correctly the moment a surface honours the admin configuration, and the
 *     wrong fix would be to re-enable `fpqr` to make it pass.
 *
 * ─── A CITATION CORRECTED IN THE MOVE ───────────────────────────────────────
 * The original comment cited the prototype's Admin subtitle — "Control which
 * channels are available in the Issue Entry source dropdown" — as evidence about
 * Issue Entry. **That reading does not survive checking.** The prototype's Issue
 * Entry screen contains no source control at all: zero occurrences of "source",
 * case-insensitive, in its markup, and its own history text reads "Registered
 * from Issue Entry — no source assigned yet." The Admin copy is stale within the
 * prototype itself. The admin-configuration POINT still stands — it just cannot
 * be sourced from that sentence, and now applies to the edit path.
 *
 * ─── ONE OPEN QUESTION, CARRIED NOT RESOLVED ────────────────────────────────
 * A component inventory's `SourceEvidencePanel` row cited EIGHT variants against
 * the seven asserted here. STILL UNRESOLVED. The reconciliation note that carried
 * the discrepancy lived in a docs corpus no longer in this repo, so the facts are
 * inlined: the canonical prototype has SEVEN, the discrepancy is to be settled
 * against BRD Appendix C, and the owner is the Frontend Lead. If it is ever
 * settled at eight, this test is the thing that should fail — which is precisely
 * why it is pinned rather than left loose.
 */
describe('the issue-source vocabulary is a domain fact', () => {
  it('is exactly the seven known channels', () => {
    expect([...SOURCE_KEYS].sort()).toEqual(
      ['comeback', 'ews', 'fpqr', 'gqis', 'techline', 'warranty', 'weibull'].sort(),
    )
  })

  it('every key carries a label and an icon, so any renderer can show it', () => {
    // The vocabulary is only useful if each member is renderable. This is what
    // makes `SOURCE[key]` safe at every call site that iterates `SOURCE_KEYS`.
    for (const key of SOURCE_KEYS) {
      expect(SOURCE[key], `SOURCE is missing an entry for "${key}"`).toBeTruthy()
      expect(SOURCE[key].label, `"${key}" has no label`).toBeTruthy()
      expect(SOURCE[key].icon, `"${key}" has no icon`).toBeTruthy()
    }
  })
})
