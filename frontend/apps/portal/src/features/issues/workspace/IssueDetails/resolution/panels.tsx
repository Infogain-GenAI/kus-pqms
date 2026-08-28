import { ClipboardList, ClipboardPlus, ClipboardX, FilePlus, Megaphone, ShieldCheck, Wrench } from 'lucide-react'
import { Badge, Button, Icon } from '@pqms/ui-library'
import type { Issue } from '@/data/types'
import { fmtMDY } from '@/data/util'
import { ResolutionEmptyState, ResolutionSectionPanel } from './ResolutionSectionPanel'
import styles from './resolution.module.css'

/**
 * The four Resolution workstream panels.
 *
 * Ported from `RelatedQirSection.vue`, `CountermeasuresSection.vue` and
 * `RelatedPublicationSection.vue`, plus this app's own Disposition, which Vue
 * has no equivalent of.
 *
 * Grouped in one module because each is a single panel whose whole body is one
 * empty state or one short block — four files would be more navigation than
 * contents. They share the panel chrome and this folder is already the boundary.
 *
 * ─── EVERY POPULATED RENDERING IS DELIBERATELY MINIMAL ───────────────────────
 *
 * Vue's own file records why: the populated views of Related QIR, the
 * publication record, the countermeasure list and the affinity matrix each
 * depend on a data contract that is still unconfirmed, and it ships the empty
 * states rather than freezing shapes the design has not evidenced. The same
 * holds here and more so — this app has no QIR, TSB or countermeasure store at
 * all. What is built is what can be shown truthfully.
 */

export function DispositionPanel({ issue, onChangeStatus }: { issue: Issue; onChangeStatus: () => void }) {
  return (
    <ResolutionSectionPanel
      name="disposition"
      icon={ShieldCheck}
      tone="mint"
      title="Disposition"
      description="The outcome recorded for this issue, and when it is next reviewed."
    >
      {issue.dispositionOutcome ? (
        <div>
          <div className={styles.dispositionRow}>
            <Badge tone="success">{issue.dispositionOutcome}</Badge>
            <span className={styles.dispositionMeta}>Recorded — immutable after approval.</span>
          </div>
          {issue.monitoringNextReview && (
            <div className={styles.dispositionReview}>Next review {fmtMDY(issue.monitoringNextReview)}</div>
          )}
        </div>
      ) : (
        <ResolutionEmptyState
          icon={ShieldCheck}
          title="No disposition recorded"
          body="Propose NASO, Monitoring or Closed via Change status; an ASM/PQM approves with a remark."
          testId="disposition-empty"
          action={
            <Button variant="secondary" size="sm" disabled={!!issue.proposedStatus} onClick={onChangeStatus}>
              Change status
            </Button>
          }
        />
      )}
    </ResolutionSectionPanel>
  )
}

export function RelatedQirPanel({
  issue,
  canQir,
  onCreateQir,
}: {
  issue: Issue
  canQir: boolean
  onCreateQir: () => void
}) {
  const escalated = issue.status === 'escalated'
  return (
    <ResolutionSectionPanel
      name="qir"
      icon={ClipboardList}
      tone="violet"
      title="Related QIR"
      description="Quality Issue Reports associated with this issue. Authored in the QIR module — shown here for visibility."
    >
      {escalated ? (
        <div className={styles.linkedRow}>
          <Icon icon={ClipboardPlus} size={16} />
          <span>
            QIR hand-off recorded — the reference appears here read-only; the QIR module owns what happens next.
          </span>
        </div>
      ) : (
        <ResolutionEmptyState
          icon={ClipboardX}
          title="No Related QIR"
          body="No Quality Issue Report has been linked to this issue yet. Create QIR to continue the quality investigation."
          testId="related-qir-empty"
          action={
            <Button disabled={!canQir} iconLeft={<Icon icon={ClipboardPlus} size={15} />} onClick={onCreateQir}>
              Create QIR
            </Button>
          }
        />
      )}
    </ResolutionSectionPanel>
  )
}

/**
 * Countermeasures.
 *
 * ITS EMPTY STATE IS AN INLINE NOTE, not the centred tile the other panels use —
 * and that difference is from the design, not an oversight. A countermeasure
 * list with no rows yet is a list awaiting entries; the others are capabilities
 * nobody has started. The centred treatment says "nothing here"; the inline note
 * says "not yet", which is the accurate reading of each.
 *
 * `ISM0080` is the system code chip, carried over verbatim.
 */
export function CountermeasuresPanel() {
  return (
    <ResolutionSectionPanel
      name="cm"
      icon={Wrench}
      tone="green"
      title="Countermeasures"
      description="Corrective actions tracked to completion and verification."
      code="ISM0080"
    >
      <p className={styles.inlineEmpty} data-testid="countermeasures-empty">
        <Icon icon={ClipboardList} size={18} className={styles.inlineGlyph} />
        <span>No countermeasures defined yet. They appear here once corrective actions are added.</span>
      </p>
    </ResolutionSectionPanel>
  )
}

/**
 * Related Publication.
 *
 * "Create Publication" IS DISABLED, and the note says why. Vue emits an event
 * that opens its TSB module; this application has no `/tsb` route — the README
 * puts QIR and TSB out of scope, and `routes.tsx` records the same. An enabled
 * button with nowhere to go would be worse than a disabled one that explains
 * itself, and dropping it would lose the design's statement that this is where
 * the publication is raised from.
 */
export function RelatedPublicationPanel() {
  return (
    <ResolutionSectionPanel
      name="pub"
      icon={Megaphone}
      tone="teal"
      title="Related Publication"
      description="Publications associated with this issue. Authored in the TSB module — shown here for visibility."
    >
      <ResolutionEmptyState
        icon={FilePlus}
        title="No publication has been created for this issue"
        body="Create a publication in TSB Management to communicate the outcome to dealers. Issue context pre-populates the entry."
        testId="related-publication-empty"
        action={
          <>
            <Button disabled iconLeft={<Icon icon={FilePlus} size={15} />}>Create Publication</Button>
            <p className={styles.note}>TSB Management is not part of this application yet.</p>
          </>
        }
      />
    </ResolutionSectionPanel>
  )
}
