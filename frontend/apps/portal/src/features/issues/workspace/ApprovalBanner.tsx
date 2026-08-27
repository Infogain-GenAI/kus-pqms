import { useState } from 'react'
import { Button, STATUS, Textarea } from '@pqms/ui-library'
import type { Issue } from '@/data/types'

// Moved verbatim from IssueWorkspaceScreen.tsx's `ApprovalBanner` (2026-08-27).
//
// IT STAYS IN THE SHELL, ABOVE THE OUTLET, not in any section. The banner was
// commented "(all tabs)" before the split and that is exactly the property the
// route tree must preserve: a pending proposal is a fact about the ISSUE, so it
// has to be visible whichever section is routed. Pushing it into the sections
// would mean rendering it five times.

export function ApprovalBanner({ issue, canApprove, isProposer, onApprove, onReject }: { issue: Issue; canApprove: boolean; isProposer: boolean; onApprove: (r: string) => void; onReject: (r: string) => void }) {
  const [remark, setRemark] = useState('')
  return (
    <div style={{ background: 'var(--warning-50)', border: '1px solid #F4E2C0', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4) var(--space-5)', marginBottom: 'var(--space-4)' }}>
      <div style={{ font: 'var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>
        Proposed: {issue.dispositionOutcome ?? STATUS[issue.proposedStatus ?? 'review'].label} — awaiting approval
      </div>
      <div style={{ margin: 'var(--space-1) 0 0', font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>{issue.proposalRationale}</div>
      <div style={{ margin: 'var(--space-1) 0 0', font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)' }}>Proposed by {issue.proposedBy}</div>
      {canApprove ? (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <Textarea rows={1} value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Approver remark (required)…" />
          </div>
          <Button disabled={!remark.trim()} onClick={() => onApprove(remark.trim())}>Approve</Button>
          <Button variant="danger" disabled={!remark.trim()} onClick={() => onReject(remark.trim())}>Reject</Button>
        </div>
      ) : (
        <p style={{ margin: '10px 0 0', font: 'var(--fw-regular) var(--fs-caption)/1.3 var(--font-body)', color: 'var(--text-muted)' }}>
          {isProposer ? 'Read-only to you until an ASM/PQM decides.' : 'Awaiting an override-role decision.'}
        </p>
      )}
    </div>
  )
}
