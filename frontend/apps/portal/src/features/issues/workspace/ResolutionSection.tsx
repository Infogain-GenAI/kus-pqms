import { ClipboardList, ClipboardPlus, ClipboardX, ShieldCheck } from 'lucide-react'
import { Badge, Button } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { CardHead, IconChip, SectionCard, TagChip } from '@/app/chrome'
import { fmtMDY } from '@/data/util'
import { useWorkspace } from './context'

// Moved verbatim from IssueWorkspaceScreen.tsx's `ResolutionTab` (2026-08-27).
// Route path: /issues/:id/resolution.
//
// Its three props were all shell concerns and all come from context now:
// `onChangeStatus`/`onCreateQir` are the shell's modal openers, and `canQir` is
// the shell's own gate (not escalated/closed, may propose, AND scored — V4-V5,
// an issue's priority is the QIR's priority, so it must be scored before a QIR
// can be raised).

export function ResolutionSection() {
  const { issue, canQir, openModal } = useWorkspace()
  const escalated = issue.status === 'escalated'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>
      <SectionCard>
        <CardHead
          icon={ShieldCheck}
          tint="#E2F4F2"
          color="#0A6F64"
          title="Disposition"
          right={<TagChip style={{ textTransform: 'none' }}>{issue.dispositionOutcome ?? 'None yet'}</TagChip>}
        />
        {issue.dispositionOutcome ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 8 }}>
              <Badge tone="success">{issue.dispositionOutcome}</Badge>
              <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)' }}>Recorded — immutable after approval.</span>
            </div>
            {issue.monitoringNextReview && (
              <div style={{ font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)' }}>Next review {fmtMDY(issue.monitoringNextReview)}</div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--space-6)' }}>
            <IconChip icon={ShieldCheck} tint="var(--neutral-50)" color="var(--neutral-400)" size={48} />
            <div style={{ margin: '14px 0 4px', font: 'var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>No disposition recorded</div>
            <div style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-disabled)', maxWidth: 320, marginBottom: 14 }}>
              Propose NASO, Monitoring or Closed via Change status; an ASM/PQM approves with a remark.
            </div>
            <Button variant="secondary" size="sm" disabled={!!issue.proposedStatus} onClick={() => openModal('status')}>Change status</Button>
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <CardHead
          icon={ClipboardList}
          tint="#F0EBFB"
          color="#7C5CDB"
          title="Related QIR"
          subtitle="Quality Issue Reports associated with this issue. Authored in the QIR module — shown here for visibility."
          right={<TagChip style={{ textTransform: 'none' }} tint={escalated ? 'var(--warning-50)' : undefined} color={escalated ? 'var(--warning-600)' : undefined}>{escalated ? 'Escalated' : 'Not linked'}</TagChip>}
        />
        {escalated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <Icon icon={ClipboardPlus} size={16} />
            <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)', color: 'var(--text-secondary)' }}>
              QIR hand-off recorded — the reference appears here read-only; the QIR module owns what happens next.
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--space-6)' }}>
            <IconChip icon={ClipboardX} tint="var(--neutral-50)" color="var(--neutral-400)" size={48} />
            <div style={{ margin: '14px 0 4px', font: 'var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>No Related QIR</div>
            <div style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-disabled)', maxWidth: 340, marginBottom: 14 }}>
              No Quality Issue Report has been linked to this issue yet. Create QIR to continue the quality investigation.
            </div>
            <Button disabled={!canQir} iconLeft={<Icon icon={ClipboardPlus} size={15} />} onClick={() => openModal('qir')}>Create QIR</Button>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
