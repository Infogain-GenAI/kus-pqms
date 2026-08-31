import type { Issue } from './types'

/**
 * Issue-group formation at REGISTRATION.
 *
 * ─── WHAT THIS IS AND WHY IT IS PURE ────────────────────────────────────────
 *
 * The design resolves group membership only at the moment an issue is
 * registered, from whatever ended up in its link set. That resolution has four
 * distinct behaviours (form / join / merge / block) and a fan-out that rewrites
 * OTHER issues, so it is computed here as a pure function and applied by the
 * store. Every branch is then testable without registering anything.
 *
 * ─── THE MODEL, CONFIRMED AGAINST THE CANONICAL ─────────────────────────────
 *
 * `groupId` IS THE PARENT'S ISSUE ID. The canonical sets `issueGroupId =
 * parentId = compare[0].id`, and our seed already follows that convention —
 * `assertIssueGroups` validates that a group is keyed on one of its own members.
 * So this needed no data-model change, only a write path.
 *
 * THE PARENT IS THE EARLIEST-REGISTERED MEMBER, always derived and never
 * assigned. `store.groupMembers()` already returns members parent-first on the
 * same rule; this computes the same answer prospectively, for a member that does
 * not exist yet.
 *
 * ─── ⚠️ TRANSITIVE, WHICH IS THE PART A READER WILL NOT EXPECT ──────────────
 *
 * Linking to ONE issue that already belongs to a group pulls in that group's
 * ENTIRE membership. So a user who selects a single issue can form a group of
 * five, and linking two issues that belong to two DIFFERENT groups MERGES them.
 * The canonical logs those three outcomes under different names, which is the
 * only outward sign the cases differ.
 */

/** What the three outcomes are called in the audit trail. */
export type GroupFormationAction = 'Issue Group created' | 'Issue linked to Issue Group' | 'Issue Groups merged'

export interface GroupFormation {
  /** The resolved group id (= the parent's issue id), or null when no group forms. */
  groupId: string | null
  /** The earliest-registered member, or null when no group forms. */
  parentId: string | null
  /** Existing issues pulled into the group, transitively. Excludes the new issue. */
  memberIds: string[]
  /** Distinct pre-existing groups touched. Two or more means a merge. */
  sourceGroupIds: string[]
  /** Null when no group forms. */
  action: GroupFormationAction | null
  /**
   * Existing members whose `groupId` must be REWRITTEN to `groupId`.
   *
   * Non-empty only on a merge, or when pulling in standalones. This is the
   * fan-out: registering one issue changes other issues' records.
   */
  rewriteIds: string[]
  /**
   * Set when registration must be REFUSED — see the chronology guard below.
   * The caller must not create the issue at all.
   */
  blockedReason: string | null
}

/** Members of `id`'s group, from a pool, earliest-registered first. */
function groupMembersOf(pool: Issue[], id: string): Issue[] {
  const self = pool.find((i) => i.id === id)
  if (!self?.groupId) return []
  return pool
    .filter((i) => i.groupId === self.groupId)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0))
}

export function formIssueGroup({
  newIssueId,
  newIssueCreatedAt,
  linkedIds,
  pool,
}: {
  newIssueId: string
  newIssueCreatedAt: string
  linkedIds: readonly string[]
  pool: Issue[]
}): GroupFormation {
  const none: GroupFormation = {
    groupId: null,
    parentId: null,
    memberIds: [],
    sourceGroupIds: [],
    action: null,
    rewriteIds: [],
    blockedReason: null,
  }

  // ── Collect the existing membership, transitively ──────────────────────────
  const existing: Issue[] = []
  const sourceGroupIds: string[] = []
  const seenGroup = new Set<string>()

  for (const lid of linkedIds) {
    const linked = pool.find((i) => i.id === lid)
    // A link can name an id with no issue behind it (seed data does this), and
    // that must not abort the whole formation.
    if (!linked) continue

    if (linked.groupId) {
      if (!sourceGroupIds.includes(linked.groupId)) sourceGroupIds.push(linked.groupId)
      // Each source group is expanded ONCE, however many of its members were
      // linked — otherwise selecting three siblings would collect them thrice.
      if (seenGroup.has(linked.groupId)) continue
      seenGroup.add(linked.groupId)
      for (const m of groupMembersOf(pool, lid)) {
        if (!existing.some((e) => e.id === m.id)) existing.push(m)
      }
    } else if (!existing.some((e) => e.id === linked.id)) {
      existing.push(linked)
    }
  }

  if (existing.length === 0) return none

  /*
   * ─── ⚠️ THE CHRONOLOGY GUARD, AND WHY IT LOOKS LIKE DEAD CODE ─────────────
   *
   * The parent is whichever member registered EARLIEST. A brand-new issue is by
   * definition the newest, so it can never legitimately become parent — unless a
   * member carries a date in the future, in which case sorting would silently
   * promote the new issue and invert the hierarchy. The canonical refuses to
   * register at all rather than produce that, with this message.
   *
   * ⚠️ IT WILL NEVER FIRE ON TODAY'S SEED, AND THAT IS NOT A REASON TO REMOVE IT.
   * Every seeded issue is dated 2026-05 to 2026-07 while a registration stamps
   * the real current date, so the new issue's timestamp is always the largest.
   * The guard becomes live the moment anything seeds a future-dated issue — which
   * is it working, not a defect. A guard that has never fired reads as dead code
   * to the next person; this note is why it stays. A test constructs the
   * future-dated case deliberately rather than waiting for one to appear.
   */
  const earliestExisting = existing.reduce((min, i) => (i.createdAt < min ? i.createdAt : min), existing[0].createdAt)
  if (newIssueCreatedAt < earliestExisting) {
    return { ...none, blockedReason: 'Child Issue Date cannot be earlier than the Parent Issue Date.' }
  }

  // ── Parent = earliest of {existing members} ∪ {the new issue} ─────────────
  const ranked = [
    ...existing.map((i) => ({ id: i.id, at: i.createdAt })),
    { id: newIssueId, at: newIssueCreatedAt },
  ].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))

  const parentId = ranked[0].id
  const groupId = parentId

  return {
    groupId,
    parentId,
    memberIds: existing.map((i) => i.id),
    sourceGroupIds,
    /*
     * The three outcomes, named as the canonical names them. The distinction is
     * only visible in the audit trail, which is the whole reason it logs them
     * differently: "merged" is a materially bigger event than "created", and
     * without the label they are indistinguishable after the fact.
     */
    action:
      sourceGroupIds.length >= 2
        ? 'Issue Groups merged'
        : sourceGroupIds.length === 1
          ? 'Issue linked to Issue Group'
          : 'Issue Group created',
    // Only members whose group actually changes. On a plain join, the existing
    // members already carry this groupId and must not be rewritten (or audited).
    rewriteIds: existing.filter((i) => i.groupId !== groupId).map((i) => i.id),
    blockedReason: null,
  }
}
