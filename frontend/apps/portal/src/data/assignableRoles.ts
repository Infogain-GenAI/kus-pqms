/**
 * The roles an issue can be ASSIGNED to.
 *
 * ─── ⚠️ NOT `RoleKey`, AND CONFLATING THEM WAS OUR BUG ───────────────────────
 *
 * `RoleKey` is the SESSION vocabulary — who can sign in and what they are allowed
 * to do (`SE | ASM | PQM | ADMIN`), and the capability model reads it. This is a
 * different vocabulary: the engineering functions an issue's work can be handed
 * to. They overlap without being the same list, and neither is a subset of the
 * other — `ADMIN` is a session role nobody assigns work to, `TE` and `DE` are
 * assignable functions nobody signs in as.
 *
 * Our first port typed bulk assignment as `RoleKey` and therefore offered three
 * options (SE, ASM, PQM — ADMIN being nonsense to assign). The canonical offers
 * FIVE. So the missing two were not a design simplification anyone chose; they
 * were a casualty of borrowing the wrong type. Restoring the feature after it was
 * lost in a merge is the moment to fix that rather than faithfully reproduce our
 * own drift.
 *
 * Codes and labels are the canonical's own, from the bulk menu's option map:
 *   {SE:'Service Engineer', TE:'Test Engineer', ASM:'After-Sales Mgr',
 *    PQM:'Product Quality Mgr', DE:'Design Engineer'}
 *
 * `Issue.assigneeRole` is typed `string`, so this needs no change there — and
 * nothing in the app GATES on `assigneeRole` (checked: it is seed, display and
 * filter data only), which is why widening the set is safe rather than a
 * permissions change.
 */
export const ASSIGNABLE_ROLES = [
  { code: 'SE', label: 'Service Engineer' },
  { code: 'TE', label: 'Test Engineer' },
  { code: 'ASM', label: 'After-Sales Mgr' },
  { code: 'PQM', label: 'Product Quality Mgr' },
  { code: 'DE', label: 'Design Engineer' },
] as const

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number]['code']

/** The label for a code, or the code itself if it is not one we know. */
export const assignableRoleLabel = (code: string): string =>
  ASSIGNABLE_ROLES.find((r) => r.code === code)?.label ?? code
