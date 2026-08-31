import type { Issue } from './types'

/**
 * Draft/commit edits to issue-group membership — the workspace's "Manage Related
 * Issues" flow, planned as a pure function.
 *
 * ─── WHY PURE, AND WHY PLANNED RATHER THAN APPLIED ──────────────────────────
 *
 * One Save can change several issues and write audit rows to more, and it has
 * three cascades that are invisible on screen: a group of two DISSOLVES when a
 * member leaves, removing a PARENT promotes the next-earliest and logs a
 * system-generated entry, and each removal is computed against the result of the
 * previous one. None of that is testable through a modal.
 *
 * So this returns a PLAN — the new `groupId` for each affected issue, and the
 * audit rows to write — and the store applies it.
 *
 * ─── ⚠️ CHAINED, NOT INDEPENDENT ────────────────────────────────────────────
 *
 * The canonical computes each removal against `_membersWithOv(uid, ov)`, where
 * `ov` is the override map accumulated so far. So removing two members from a
 * three-member group is NOT two independent removals: the first leaves two
 * members, and the second then triggers the dissolve. Treating them
 * independently gives a different final state, which is why the loop below
 * threads its own working map instead of reading `pool` each time.
 *
 * ─── ⚠️ GROUP IDS ARE PARENT ISSUE IDS HERE, AND THE CANONICAL DISAGREES WITH
 *     ITSELF ABOUT THAT ────────────────────────────────────────────────────
 *
 * Its REGISTRATION path sets `issueGroupId = parentId` — the parent's own issue
 * id. Its WORKSPACE path generates `'GRP-' + activeId + '-' + Date.now()`. Both
 * work, because membership is only ever tested by equality on the field.
 *
 * We use parent-issue-id everywhere, for consistency with the registration path
 * that already shipped, and because a generated id embeds a creation timestamp
 * that means nothing after the parent changes. `assertIssueGroups` permits
 * either — its disjointness check is conditional on the key resolving to a
 * seeded issue — so this is our choice, recorded as ours.
 *
 * ⚠️ A CONSEQUENCE, ported deliberately: when the PARENT leaves a group, the
 * remaining members keep their `groupId`, which now names a non-member. The key
 * DANGLES. The canonical does exactly this — its removal path never rewrites the
 * survivors — and membership still resolves correctly because it is equality on
 * a shared value, not a lookup. Migrating the key would mean rewriting every
 * survivor on every parent removal, for no functional gain.
 */

export interface GroupEditRequest {
  /** The issue whose Manage Related Issues modal is open. */
  activeId: string
  /** Members being removed, each with the reason the user gave for THAT removal. */
  removals: { id: string; justification: string }[]
  /** Issues being added to the active issue's group, each with its own reason. */
  additions: { id: string; justification: string }[]
}

export interface PlannedAudit {
  issueId: string
  action: string
  detail: string
}

export interface GroupEditPlan {
  /**
   * Final `groupId` per affected issue. `null` means CLEARED — the issue belongs
   * to no group any more.
   */
  groupIds: Record<string, string | null>
  audits: PlannedAudit[]
}

/**
 * Members sharing a group, earliest-registered first, as seen THROUGH a working
 * override — an id present in `override` takes that value, otherwise its stored
 * one. This is what makes the removal loop chained rather than independent.
 */
function membersUnder(pool: Issue[], override: Record<string, string | null>, id: string): Issue[] {
  const groupOf = (i: Issue) => (i.id in override ? override[i.id] : i.groupId)
  const self = pool.find((i) => i.id === id)
  if (!self) return []
  const group = groupOf(self)
  if (!group) return []
  return pool
    .filter((i) => groupOf(i) === group)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0))
}

export function planGroupEdits(pool: Issue[], req: GroupEditRequest): GroupEditPlan {
  const override: Record<string, string | null> = {}
  const audits: PlannedAudit[] = []

  // ── Removals, in order, each against the previous one's result ─────────────
  for (const { id: uid, justification } of req.removals) {
    const members = membersUnder(pool, override, uid)
    if (!members.length) continue

    const wasParent = members[0].id === uid
    const remaining = members.filter((m) => m.id !== uid)

    override[uid] = null
    /*
     * ⚠️ THE CASCADING DISSOLVE. A group needs at least two members to be a
     * group at all — `assertIssueGroups` says so for the seed — so when a
     * removal would leave exactly ONE, that member is cleared too and the group
     * ceases to exist. Needs a 2-member group to observe, which is why it is the
     * case most likely to go untested.
     */
    if (remaining.length === 1) override[remaining[0].id] = null

    audits.push({
      issueId: uid,
      action: 'Issue Unlinked',
      detail: `${uid} removed from Issue Group. Justification: "${justification}".`,
    })
    // Every other member is told, with wording that distinguishes their view of
    // it ("this Issue Group") from the removed member's own row.
    for (const m of remaining) {
      audits.push({
        issueId: m.id,
        action: 'Issue Unlinked',
        detail: `${uid} removed from this Issue Group. Justification: "${justification}".`,
      })
    }

    /*
     * ⚠️ THE PARENT-CHANGE ENTRY IS SYSTEM-GENERATED AND CARRIES NO USER REASON.
     *
     * Only when the removed member WAS the parent and at least two members
     * remain — a dissolve leaves no group to have a parent, so it is not emitted
     * there. Its reason states the promotion and why, and deliberately does NOT
     * repeat the user's justification: that reason was given for the REMOVAL, and
     * reusing it here would attribute to the user a decision the system made.
     */
    if (wasParent && remaining.length >= 2) {
      audits.push({
        issueId: remaining[0].id,
        action: 'Parent Issue Changed',
        detail: `Previous Parent: ${uid}. New Parent: ${remaining[0].id}. Reason: Previous Parent Issue was unlinked.`,
      })
    }
  }

  // ── Additions: join the ACTIVE issue's group, forming one if it has none ───
  for (const { id: addId, justification } of req.additions) {
    const current = membersUnder(pool, override, req.activeId)
    let groupId: string

    if (current.length) {
      groupId = current[0].id
    } else {
      /*
       * The active issue has no group, so one forms containing both. The key is
       * the EARLIEST of the two — the same parent rule as everywhere else, and
       * the reason this does not generate a `GRP-` id (see the header).
       */
      const active = pool.find((i) => i.id === req.activeId)
      const added = pool.find((i) => i.id === addId)
      if (!active || !added) continue
      groupId = active.createdAt <= added.createdAt ? active.id : added.id
      override[req.activeId] = groupId
    }

    override[addId] = groupId
    audits.push({
      issueId: addId,
      action: 'Issue Linked',
      detail: `${addId} linked to ${req.activeId}. Justification: "${justification}".`,
    })
    audits.push({
      issueId: req.activeId,
      action: 'Issue Linked',
      detail: `${addId} linked to this issue. Justification: "${justification}".`,
    })
  }

  return { groupIds: override, audits }
}
