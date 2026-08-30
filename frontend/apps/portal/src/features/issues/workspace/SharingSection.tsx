import { Share2 } from 'lucide-react'
import { IconChip, SectionCard } from '@/app/chrome'
import { useRole } from '@/data/roles'
import { useWorkspace } from './context'
import styles from './SharingSection.module.css'

// Route target for /issues/:id/sharing.
//
// Ported from `tabs/SharingTab/SharingTab.vue`.
//
// ─── THIS IS A STUB, AND IT SAYS SO ──────────────────────────────────────────
//
// The Vue original is a stub too — an empty state reading "planned for Story
// 4-11". It is carried over rather than invented, and rather than left out,
// because the tab is part of the workspace's shape: cross-organisation sharing
// is a named surface with a place in the strip, and a section that will exist is
// worth showing as not-yet-built instead of appearing later as a surprise.
//
// What it must NOT do is imply a capability. There is no share action, no
// recipient picker and no button that does nothing — just a statement of what
// this section will hold.
//
// ─── THE VISIBILITY GATE IS REAL, THOUGH ─────────────────────────────────────
//
// Vue gates the tab on `canAccessSharing` (ASM/PQM). That gate is honoured in
// the tab strip, which does not render the link for a user without it, and again
// here — a section reachable only by typing the URL should still refuse, or the
// gate is decoration. Checked as a CAPABILITY, never a role comparison, per
// Tier 0's RBAC rule.

export function SharingSection() {
  const { issue } = useWorkspace()
  const { can } = useRole()

  if (!can('approve')) {
    return (
      <SectionCard>
        <div className={styles.empty}>
          <IconChip icon={Share2} tint="var(--neutral-50)" color="var(--neutral-400)" size={48} />
          <div className={styles.title}>
            Sharing is not available to your role
          </div>
          <div className={styles.body}>
            Cross-organisation sharing is managed by ASM and PQM roles.
          </div>
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard>
      <div className={styles.empty} data-testid="sharing-section">
        <IconChip icon={Share2} tint="var(--accent-50)" color="var(--accent-600)" size={48} />
        <div className={styles.title}>
          Sharing — {issue.id}
        </div>
        <div className={styles.body}>
          Cross-organisation sharing is planned but not built. When it lands, this section will
          control which external organisations can see this issue and what they can see of it.
        </div>
      </div>
    </SectionCard>
  )
}
