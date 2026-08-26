import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeftRight,
  Bold as BoldIcon,
  Calendar,
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  CircleDot,
  ClipboardList,
  ClipboardPlus,
  ClipboardX,
  Expand,
  FilePlus,
  FilePlus2,
  FileText,
  Flag,
  Gauge,
  GitBranch,
  GitFork,
  Globe,
  Hash,
  History as HistoryIcon,
  Italic as ItalicIcon,
  LayoutPanelLeft,
  Link,
  Link2,
  List as ListIcon,
  ListOrdered,
  Lock,
  Mail,
  MessagesSquare,
  Microscope,
  Package,
  PackagePlus,
  Paperclip,
  PenSquare,
  Plus,
  Radio,
  SearchX,
  Send,
  Settings2,
  ShieldCheck,
  SquarePen,
  Tags,
  UploadCloud,
  UserRoundCheck,
  UserRoundCog,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar, Badge, Button, CommentCard, SearchField, Select, SOURCE, SOURCE_KEYS, STATUS, STATUS_KEYS, StatusBadge, Textarea, type SourceKey, type StatusKey } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { CardHead, IconChip, MetaChip, Modal, PageContainer, PageCrumb, SectionCard, TagChip, ToggleGroup, ULabel } from '@/app/chrome'
import { PriorityTab } from './PriorityTab'
import { PRIORITY_BANDS } from '@/data/priorityMatrix'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import { fmtHM, fmtMDY, modelCodeLabel } from '@/data/util'
import { NOW } from '@/data/types'
import type { ActivityType, CommEntryType, DispositionOutcome, Issue, PartUrgency } from '@/data/types'

const WS_TABS = [
  { key: 'overview', label: 'Issue Detail', icon: LayoutPanelLeft },
  { key: 'investigation', label: 'Investigation', icon: Microscope },
  { key: 'priority', label: 'Issue Priority', icon: Gauge },
  { key: 'resolution', label: 'Resolution', icon: GitBranch },
  { key: 'communication', label: 'Communication', icon: MessagesSquare },
  { key: 'activity', label: 'History', icon: HistoryIcon },
]

export function IssueWorkspaceScreen() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { user, can } = useRole()
  const store = useStore()
  const issue = store.getIssue(id)
  const [tab, setTab] = useState('overview')
  const [modal, setModal] = useState<'' | 'status' | 'qir' | 'edit' | 'links'>('')

  if (!issue) {
    return (
      <PageContainer>
        <PageCrumb backTo="/issues" trail={[{ label: 'Issue Management', to: '/issues' }, { label: id, mono: true }]} />
        <SectionCard>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Issue {id} was not found.</p>
        </SectionCard>
      </PageContainer>
    )
  }

  const actor = { name: user.name, role: user.role }
  const comments = store.commentsFor(id).filter((c) => !c.hidden)
  const isOwn = issue.owner === user.name || issue.assignee === user.name
  const canEditIssue = can('propose') && isOwn && issue.status === 'open'
  // V4-V5: an issue's priority is the QIR's priority, so it must be scored and saved
  // before a QIR can be raised. Unscored issues route the user to the matrix instead.
  const priority = store.priorityResult(id)
  const canQir = issue.status !== 'escalated' && issue.status !== 'closed' && can('propose') && priority.scored
  const tabs = WS_TABS.map((t) => (t.key === 'communication' ? { ...t, badge: comments.length || undefined } : t))

  return (
    <PageContainer wide>
      <PageCrumb backTo="/issues" trail={[{ label: 'Issue Management', to: '/issues' }, { label: issue.id, mono: true }]} />

      {/* Header card */}
      <SectionCard style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ font: 'var(--fw-semibold) var(--fs-caption)/1 var(--font-mono)', color: 'var(--text-muted)' }}>{issue.id}</span>
              <StatusBadge status={issue.status} />
              {/* Priority reads out in the header only once scored — an unscored issue
                  shows nothing rather than a misleading default letter. */}
              {priority.scored && (
                <TagChip tint={PRIORITY_BANDS[priority.final].tint} color={PRIORITY_BANDS[priority.final].color}>
                  Priority {priority.final}
                </TagChip>
              )}
              {issue.isEws && <TagChip tint="var(--danger-50)" color="var(--danger-600)">EWS flagged</TagChip>}
            </div>
            <h1 style={{ margin: '0 0 var(--space-3)', font: 'var(--fw-bold) 24px/1.2 var(--font-display)', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{issue.title}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <MetaChip icon={Car}>{modelCodeLabel(issue)}</MetaChip>
              {issue.system && <MetaChip icon={Settings2}>{issue.system}{issue.component ? ` / ${issue.component}` : issue.subSystem ? ` / ${issue.subSystem}` : ''}</MetaChip>}
              <MetaChip icon={FileText}>{SOURCE[issue.source].label}</MetaChip>
              <MetaChip icon={Calendar}>{fmtMDY(issue.reportedDate)}</MetaChip>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-4)', flex: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={issue.owner} size="md" />
              <span>
                <span style={{ display: 'block', font: 'var(--fw-semibold) var(--fs-body-sm)/1.2 var(--font-body)', color: 'var(--text-primary)' }}>{issue.owner}</span>
                <span style={{ display: 'block', font: 'var(--fw-regular) var(--fs-caption)/1.2 var(--font-body)', color: 'var(--text-muted)' }}>Owner · {issue.ownerRole}</span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" size="sm" disabled={!canEditIssue} iconLeft={<Icon icon={PenSquare} size={14} />} onClick={() => setModal('edit')}>Edit issue</Button>
              <Button variant="secondary" size="sm" disabled={!!issue.proposedStatus} iconLeft={<Icon icon={ArrowLeftRight} size={14} />} onClick={() => setModal('status')}>Change status</Button>
              <Button variant="secondary" size="sm" disabled={!canQir} iconLeft={<Icon icon={ClipboardPlus} size={14} />} onClick={() => setModal('qir')}>Create QIR</Button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Pill tab bar */}
      <SectionCard pad={false} style={{ marginBottom: 'var(--space-4)', padding: '6px 10px' }}>
        <ToggleGroup variant="dark" options={tabs} value={tab} onChange={setTab} />
      </SectionCard>

      {/* Pending-approval banner (all tabs) */}
      {issue.proposedStatus && (
        <ApprovalBanner issue={issue} canApprove={can('approve')} isProposer={issue.proposedBy === user.name}
          onApprove={(r) => store.approveProposal(id, r, actor)} onReject={(r) => store.rejectProposal(id, r, actor)} />
      )}

      {tab === 'overview' && <DetailTab issue={issue} canEdit={canEditIssue} onManageLinks={() => setModal('links')} onOpen={(x) => nav(`/issues/${x}`)} />}
      {tab === 'investigation' && <InvestigationTab issueId={id} canEdit={can('propose')} />}
      {tab === 'priority' && <PriorityTab issueId={id} />}
      {tab === 'resolution' && <ResolutionTab issue={issue} onChangeStatus={() => setModal('status')} onCreateQir={() => setModal('qir')} canQir={canQir} />}
      {tab === 'communication' && <CommunicationTab comments={comments} onPost={(t, b) => store.addComment(id, t, b, actor)} />}
      {tab === 'activity' && <HistoryTab issueId={id} />}

      <ChangeStatusModal open={modal === 'status'} issue={issue} canApprove={can('approve')} onClose={() => setModal('')} />
      <CreateQirModal open={modal === 'qir'} issue={issue} onClose={() => setModal('')} />
      <EditIssueModal open={modal === 'edit'} issue={issue} onClose={() => setModal('')} />
      <ManageLinksModal open={modal === 'links'} issue={issue} onClose={() => setModal('')} />
    </PageContainer>
  )
}

/* ---------- banner ---------- */

function ApprovalBanner({ issue, canApprove, isProposer, onApprove, onReject }: { issue: Issue; canApprove: boolean; isProposer: boolean; onApprove: (r: string) => void; onReject: (r: string) => void }) {
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

/* ---------- Issue Detail ---------- */

// Channel subtitles for the source edit-mode cards, verbatim from the export's srcSub map.
const SRC_SUB: Record<SourceKey, string> = { warranty: 'Field claims & cost', weibull: 'Reliability model', comeback: 'Repeat repairs', techline: 'Dealer inquiry', fpqr: 'Field PQ report', ews: 'Early warning', gqis: 'Global QI' }

function DetailTab({ issue, canEdit, onManageLinks, onOpen }: { issue: Issue; canEdit: boolean; onManageLinks: () => void; onOpen: (id: string) => void }) {
  const linked = issue.linkedIssueIds ?? []
  const store = useStore()
  const { user } = useRole()
  const actor = { name: user.name, role: user.role }
  const [srcEditing, setSrcEditing] = useState(false)
  const [srcDraft, setSrcDraft] = useState<SourceKey>(issue.source)
  const [srcOpen, setSrcOpen] = useState(true)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-4)', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <SectionCard>
          <CardHead icon={Car} title="Vehicle information" />
          <div style={{ border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', background: 'var(--neutral-50)', borderBottom: 'var(--border-width) solid var(--border-subtle)' }}>
              <span style={{ padding: '9px 14px', font: 'var(--fw-bold) 10.5px/1 var(--font-body)', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-disabled)' }}>Model code</span>
              <span style={{ padding: '9px 14px', font: 'var(--fw-bold) 10.5px/1 var(--font-body)', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-disabled)', borderLeft: 'var(--border-width) solid var(--border-subtle)' }}>Selected model year(s)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
              <span style={{ padding: '12px 14px', font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-mono)', color: 'var(--text-primary)' }}>{(issue.modelCodes ?? [issue.modelCode]).join(', ')}</span>
              <span style={{ padding: '9px 14px', borderLeft: 'var(--border-width) solid var(--border-subtle)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 'var(--radius-md)', background: 'var(--neutral-50)', font: 'var(--fw-semibold) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-primary)' }}>{issue.modelYear}</span>
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <CardHead icon={GitFork} title="System classification" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
            {([['System', issue.system], ['Sub-system', issue.subSystem], ['Component', issue.component], ['Symptom', issue.symptom]] as const).map(([label, val]) => (
              <div key={label}>
                <ULabel>{label}</ULabel>
                <div style={{ font: 'var(--fw-regular) var(--fs-body-md)/1.35 var(--font-body)', color: val ? 'var(--text-primary)' : 'var(--text-muted)' }}>{val ?? '—'}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <CardHead icon={FileText} title="Basic issue information" />
          <ULabel>Description</ULabel>
          <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-regular) var(--fs-body-md)/1.55 var(--font-body)', color: 'var(--text-secondary)' }}>{issue.description || '—'}</p>
          <ULabel>DTC / trouble codes</ULabel>
          {issue.dtcCodes?.length ? (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {issue.dtcCodes.map((d) => (
                <span key={d} style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 'var(--radius-md)', background: 'var(--neutral-100)', font: 'var(--fw-semibold) var(--fs-caption)/1 var(--font-mono)', color: 'var(--text-primary)' }}>{d}</span>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>No diagnostic trouble codes captured for this issue.</p>
          )}
        </SectionCard>

        <SectionCard>
          <CardHead
            icon={Radio}
            title="Issue source"
            subtitle="Origin signals for this issue — add or edit source channels and evidence"
            right={
              srcEditing ? (
                <span style={{ display: 'inline-flex', gap: 8 }}>
                  <Button variant="secondary" size="sm" onClick={() => setSrcEditing(false)}>Cancel</Button>
                  <Button size="sm" iconLeft={<Icon icon={Check} size={14} />} onClick={() => { if (srcDraft !== issue.source) store.updateIssue(issue.id, { source: srcDraft }, actor); setSrcEditing(false) }}>Save sources</Button>
                </span>
              ) : (
                <Button variant="secondary" size="sm" disabled={!canEdit} iconLeft={<Icon icon={PenSquare} size={14} />} onClick={() => { setSrcDraft(issue.source); setSrcEditing(true) }}>
                  Add / edit sources
                </Button>
              )
            }
          />
          {srcEditing ? (
            // Prototype edit mode: the channel sub-cards become selectable (checkbox cards).
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
              {SOURCE_KEYS.map((k) => {
                const active = srcDraft === k
                return (
                  <button
                    key={k}
                    onClick={() => setSrcDraft(k)}
                    aria-pressed={active}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left', padding: '12px 13px', border: `1.5px solid ${active ? 'var(--kia-midnight)' : 'var(--border-subtle)'}`, borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', cursor: 'pointer' }}
                  >
                    <IconChip icon={SOURCE[k].icon} tint="var(--neutral-50)" color="var(--text-secondary)" size={30} iconSize={15} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', font: 'var(--fw-semibold) var(--fs-body-sm)/1.2 var(--font-body)', color: 'var(--text-primary)' }}>{SOURCE[k].label}</span>
                      <span style={{ display: 'block', marginTop: 2, font: 'var(--fw-regular) var(--fs-caption)/1.2 var(--font-body)', color: 'var(--text-muted)' }}>{SRC_SUB[k]}</span>
                    </span>
                    <span aria-hidden style={{ width: 16, height: 16, flex: 'none', borderRadius: 4, border: `1.5px solid ${active ? 'var(--kia-midnight)' : 'var(--neutral-300)'}`, background: active ? 'var(--kia-midnight)' : 'var(--surface-card)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {active && <Icon icon={Check} size={11} />}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : issue.sourceEvidence?.length ? (
            <div style={{ border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <button
                onClick={() => setSrcOpen((v) => !v)}
                aria-expanded={srcOpen}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', border: 'none', background: 'var(--surface-card)', padding: '12px 14px', cursor: 'pointer', textAlign: 'left' }}
              >
                <Icon icon={SOURCE[issue.source].icon} size={15} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ flex: 1, font: 'var(--fw-semibold) var(--fs-body-md)/1 var(--font-body)', color: 'var(--text-primary)' }}>{SOURCE[issue.source].label}</span>
                <Icon icon={srcOpen ? ChevronUp : ChevronDown} size={15} style={{ color: 'var(--text-muted)' }} />
              </button>
              {srcOpen && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(issue.sourceEvidence.length, 5)}, 1fr)`, gap: 'var(--space-4)', padding: '4px 14px 14px', borderTop: 'var(--border-width) solid var(--border-subtle)', paddingTop: 12 }}>
                  {issue.sourceEvidence.map((ev) => (
                    <div key={ev.label}>
                      <ULabel>{ev.label}</ULabel>
                      <div style={{ font: 'var(--fw-regular) var(--fs-body-md)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{ev.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MetaChip icon={SOURCE[issue.source].icon}>{SOURCE[issue.source].label}</MetaChip>
              <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>No source channels recorded for this issue yet. Select <b style={{ color: 'var(--text-secondary)' }}>Add / edit sources</b> to capture where it originated.</span>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Right rail */}
      <SectionCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <ULabel style={{ marginBottom: 0 }}>Related linked issue</ULabel>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, padding: '0 6px', borderRadius: 'var(--radius-pill)', background: 'var(--success-50)', color: 'var(--success-600)', font: 'var(--fw-bold) 11px/1 var(--font-body)' }}>{linked.length}</span>
        </div>
        <button onClick={onManageLinks} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--accent-700)', marginBottom: 12 }}>
          Manage Related Issues
        </button>
        {linked.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)' }}>
            <Icon icon={Link} size={14} /> No related issues linked
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {linked.map((lid) => {
              const li = store.getIssue(lid)
              return (
                <button key={lid} onClick={() => onOpen(lid)} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', padding: 'var(--space-2) var(--space-3)', cursor: 'pointer' }}>
                  <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-mono)', color: 'var(--accent-700)' }}>{lid}</span>
                  {li && <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', font: 'var(--fw-semibold) var(--fs-caption)/1.2 var(--font-body)', color: 'var(--text-primary)' }}>{li.title}</span>}
                  {li && <StatusBadge status={li.status} size="sm" />}
                </button>
              )
            })}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

/* ---------- Investigation ---------- */

function InvestigationTab({ issueId, canEdit }: { issueId: string; canEdit: boolean }) {
  const store = useStore()
  const { user } = useRole()
  const [sub, setSub] = useState<'activities' | 'parts'>('activities')
  const activities = store.activitiesFor(issueId)
  const parts = store.partsFor(issueId)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ToggleGroup
          variant="light"
          options={[
            { key: 'activities', label: 'Investigation Activities' },
            { key: 'parts', label: 'Part Requests', badge: parts.length || undefined },
          ]}
          value={sub}
          onChange={(k) => setSub(k as 'activities' | 'parts')}
        />
        <Button variant="secondary" size="sm" disabled iconLeft={<Icon icon={Expand} size={14} />}>Expand all</Button>
      </div>

      {sub === 'activities' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>
          <SectionCard>
            <h3 style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-semibold) var(--fs-body-md)/1.25 var(--font-body)', color: 'var(--text-primary)' }}>Add activity</h3>
            <AddActivityForm disabled={!canEdit} onAdd={(t, s) => store.addActivity(issueId, t, s, { name: user.name, role: user.role })} />
          </SectionCard>
          <SectionCard>
            <h3 style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-semibold) var(--fs-body-md)/1.25 var(--font-body)', color: 'var(--text-primary)' }}>Activity timeline</h3>
            {activities.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--space-8) var(--space-6)' }}>
                <IconChip icon={Microscope} tint="var(--neutral-50)" color="var(--neutral-400)" size={48} />
                <div style={{ margin: '14px 0 4px', font: 'var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>No investigation activities have been recorded yet</div>
                <div style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-disabled)', maxWidth: 380 }}>
                  Record inspection results, analysis, observations and supporting evidence throughout the investigation.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activities.map((a, idx) => (
                  <div key={a.id} style={{ display: 'flex', gap: 12, padding: 'var(--space-3) 0', borderTop: idx === 0 ? 'none' : '1px solid var(--divider)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{a.type}</span>
                        {a.attachments?.length ? <TagChip>{a.attachments.length} file{a.attachments.length > 1 ? 's' : ''}</TagChip> : null}
                      </div>
                      <div style={{ margin: '3px 0 0', font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>{a.summary}</div>
                      <div style={{ margin: 'var(--space-1) 0 0', font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)' }}>{a.author} · {fmtMDY(a.createdAt)} {fmtHM(a.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      ) : (
        <PartsPanel issueId={issueId} canEdit={canEdit} />
      )}
    </div>
  )
}

function AddActivityForm({ disabled, onAdd }: { disabled: boolean; onAdd: (t: ActivityType, s: string) => void }) {
  const [type, setType] = useState<ActivityType>('Field Inspection')
  const [details, setDetails] = useState('')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div>
        <ULabel>Activity type *</ULabel>
        <Select aria-label="Activity type" value={type} onChange={(e) => setType(e.target.value as ActivityType)} options={['Field Inspection', 'Bench Test', 'Data Analysis', 'Supplier Review', 'Note']} disabled={disabled} />
      </div>
      <div>
        <ULabel>Evaluation details *</ULabel>
        <Textarea rows={5} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Describe the evaluation findings…" disabled={disabled} />
      </div>
      <div>
        <ULabel>Attachments <span style={{ textTransform: 'none', letterSpacing: 'normal', fontWeight: 'var(--fw-medium)', color: 'var(--text-disabled)' }}>— optional</span></ULabel>
        <div style={{ border: '1.5px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', textAlign: 'center' }}>
          <Icon icon={UploadCloud} size={20} style={{ color: 'var(--text-disabled)' }} />
          <div style={{ marginTop: 6, font: 'var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)', color: 'var(--text-secondary)' }}>
            Drag &amp; drop, or <span style={{ color: 'var(--accent-600)', fontWeight: 600 }}>browse</span>
            <br />PDF/CSV/JPEG/PNG · ≤25 MB · ≤10 files
          </div>
        </div>
      </div>
      <Button fullWidth disabled={disabled || !details.trim()} iconLeft={<Icon icon={Plus} size={14} />} onClick={() => { onAdd(type, details.trim()); setDetails('') }}>Save activity</Button>
    </div>
  )
}

function PartsPanel({ issueId, canEdit }: { issueId: string; canEdit: boolean }) {
  const store = useStore()
  const { user } = useRole()
  const parts = store.partsFor(issueId)
  const [pn, setPn] = useState(''); const [pdesc, setPdesc] = useState(''); const [pqty, setPqty] = useState('1'); const [purg, setPurg] = useState<PartUrgency>('Routine')
  return (
    <SectionCard>
      <CardHead title="Part requests" subtitle="Priority / Emergency need manager approval; Routine auto-approves within 24 h." />
      {parts.length > 0 && (
        <div style={{ marginBottom: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {parts.map((p) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 56px 110px 110px', gap: 'var(--space-3)', alignItems: 'center', padding: '10px 12px', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-md)', font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)' }}>
              <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-mono)' }}>{p.partNumber}</span>
              <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</span>
              <span>×{p.qty}</span>
              <Badge tone={p.urgency === 'Emergency' ? 'danger' : p.urgency === 'Priority' ? 'warning' : 'neutral'} size="sm">{p.urgency}</Badge>
              <Badge tone={p.status === 'Received' ? 'success' : p.status === 'Approved' || p.status === 'Ordered' ? 'accent' : 'neutral'} size="sm">{p.status}</Badge>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 70px 150px auto', gap: 'var(--space-3)', alignItems: 'end' }}>
        <div><ULabel>Part number *</ULabel><input value={pn} onChange={(e) => setPn(e.target.value)} placeholder="e.g. 0K2A1-58-810" disabled={!canEdit} style={inputStyle} /></div>
        <div><ULabel>Description</ULabel><input value={pdesc} onChange={(e) => setPdesc(e.target.value)} placeholder="Auto-fills on lookup" disabled={!canEdit} style={inputStyle} /></div>
        <div><ULabel>Quantity</ULabel><input value={pqty} onChange={(e) => setPqty(e.target.value.replace(/\D/g, ''))} disabled={!canEdit} style={inputStyle} /></div>
        <div><ULabel>Priority *</ULabel><Select aria-label="Priority" size="sm" value={purg} onChange={(e) => setPurg(e.target.value as PartUrgency)} options={['Routine', 'Priority', 'Emergency']} disabled={!canEdit} /></div>
        <Button disabled={!canEdit || !pn.trim()} iconLeft={<Icon icon={PackagePlus} size={14} />} onClick={() => { store.addPart(issueId, { partNumber: pn.trim(), description: pdesc.trim() || 'Part', cost: 0, qty: Number(pqty) || 1, urgency: purg }, { name: user.name, role: user.role }); setPn(''); setPdesc(''); setPqty('1') }}>Submit request</Button>
      </div>
    </SectionCard>
  )
}

const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', height: 'var(--control-sm)', padding: '0 10px', border: 'var(--border-width) solid var(--border-default)', borderRadius: 'var(--radius-md)', font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)' }

/* ---------- Resolution ---------- */

function ResolutionTab({ issue, onChangeStatus, onCreateQir, canQir }: { issue: Issue; onChangeStatus: () => void; onCreateQir: () => void; canQir: boolean }) {
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
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
            <Button variant="secondary" size="sm" disabled={!!issue.proposedStatus} onClick={onChangeStatus}>Change status</Button>
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
            <Button disabled={!canQir} iconLeft={<Icon icon={ClipboardPlus} size={15} />} onClick={onCreateQir}>Create QIR</Button>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

/* ---------- Communication ---------- */

function CommunicationTab({ comments, onPost }: { comments: import('@/data/types').Comment[]; onPost: (t: CommEntryType, b: string) => void }) {
  const [type, setType] = useState<CommEntryType>('Internal')
  const [body, setBody] = useState('')
  return (
    <SectionCard>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <ToggleGroup variant="dark" size="sm" options={[{ key: 'Internal', label: 'Internal' }, { key: 'External', label: 'External' }]} value={type} onChange={(k) => setType(k as CommEntryType)} />
        <span style={{ font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)' }}>
          {type === 'Internal' ? 'Visible only to internal PQMS users.' : 'Visible to external partners on this issue.'}
        </span>
      </div>
      <div style={{ border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 8px', background: 'var(--neutral-25)', borderBottom: 'var(--border-width) solid var(--border-subtle)' }}>
          {[BoldIcon, ItalicIcon, ListIcon, ListOrdered, Link2, Paperclip].map((I, i) => (
            <span key={i} aria-hidden style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, color: 'var(--text-muted)' }}>
              <Icon icon={I} size={14} />
            </span>
          ))}
        </div>
        <textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message — use @ to notify a teammate…"
          style={{ display: 'block', width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', resize: 'vertical', padding: '12px 14px', font: 'var(--fw-regular) var(--fs-body-md)/1.5 var(--font-body)', color: 'var(--text-primary)', background: 'var(--surface-card)' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon icon={ShieldCheck} size={13} style={{ color: 'var(--text-muted)' }} />
        <span style={{ font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)' }}>Messages are immutable once posted.</span>
        <span style={{ flex: 1 }} />
        <Button disabled={!body.trim()} iconLeft={<Icon icon={Send} size={14} />} onClick={() => { onPost(type, body.trim()); setBody('') }}>Post</Button>
      </div>
      {comments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          {[...comments].reverse().map((c) => (
            <CommentCard key={c.id} author={c.author} role={c.authorRole} time={`${fmtMDY(c.createdAt)} ${fmtHM(c.createdAt)}`} internal={c.type === 'Internal'}>
              {c.body}
              <span style={{ marginLeft: 8 }}>
                <Badge size="sm" tone={c.type === 'Email' ? 'accent' : c.type === 'External' ? 'warning' : 'neutral'}>
                  <Icon icon={c.type === 'Email' ? Mail : c.type === 'External' ? Globe : Lock} size={11} />
                  <span style={{ marginLeft: 4 }}>{c.type}</span>
                </Badge>
              </span>
            </CommentCard>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

/* ---------- History ---------- */

function classify(action: string): 'LIFECYCLE' | 'AUDIT LOG' {
  if (/^issue record created$/i.test(action) || /^status initialized$/i.test(action)) return 'AUDIT LOG'
  if (/^initial owner assigned$/i.test(action)) return 'LIFECYCLE'
  return /status|created|submitted|approved|rejected|escalated|investigation|disposition/i.test(action) ? 'LIFECYCLE' : 'AUDIT LOG'
}
function iconFor(action: string): LucideIcon {
  if (/initial owner assigned/i.test(action)) return UserRoundCheck
  if (/record created/i.test(action)) return FilePlus
  if (/created/i.test(action)) return Flag
  if (/link/i.test(action)) return Link2
  if (/parts/i.test(action)) return Package
  if (/updated|field/i.test(action)) return SquarePen
  if (/classif/i.test(action)) return Tags
  if (/status|approved|rejected|escalat/i.test(action)) return CircleDot
  if (/owner|assign/i.test(action)) return UserRoundCog
  if (/activity/i.test(action)) return Microscope
  if (/id/i.test(action)) return Hash
  return FilePlus2
}

function HistoryTab({ issueId }: { issueId: string }) {
  const store = useStore()
  const [filter, setFilter] = useState<'all' | 'lifecycle' | 'audit'>('all')
  const [q, setQ] = useState('')
  const entries = store.auditFor(issueId)
  const shown = entries.filter((e) => {
    const cls = classify(e.action)
    if (filter === 'lifecycle' && cls !== 'LIFECYCLE') return false
    if (filter === 'audit' && cls !== 'AUDIT LOG') return false
    if (q && !`${e.action} ${e.detail ?? ''} ${e.actor}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })
  const groups = useMemo(() => {
    // Proto buckets (Today / Yesterday / Last week / Older), resolved against the fixed NOW anchor.
    const nowDay = Math.floor(new Date(NOW).getTime() / 86400000)
    const m = new Map<string, typeof shown>()
    for (const e of shown) {
      const diff = nowDay - Math.floor(new Date(e.timestamp).getTime() / 86400000)
      const key = diff <= 0 ? 'Today' : diff === 1 ? 'Yesterday' : diff <= 7 ? 'Last week' : 'Older'
      m.set(key, [...(m.get(key) ?? []), e])
    }
    return Array.from(m.entries())
  }, [shown])

  return (
    <SectionCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <ToggleGroup variant="light" options={[{ key: 'all', label: 'All' }, { key: 'lifecycle', label: 'Lifecycle' }, { key: 'audit', label: 'Audit Log' }]} value={filter} onChange={(k) => setFilter(k as typeof filter)} />
        <span style={{ flex: 1 }} />
        <div style={{ width: 280 }}>
          <SearchField value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search history…" size="sm" />
        </div>
        <Select aria-label="Date range" size="sm" value="all" options={[{ value: 'all', label: 'Date: All time' }]} onChange={() => undefined} style={{ width: 150 }} />
        <Button variant="secondary" size="sm" disabled iconLeft={<Icon icon={Expand} size={14} />}>Expand all</Button>
      </div>
      {groups.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--space-8) var(--space-6)' }}>
          <IconChip icon={SearchX} tint="var(--neutral-100)" color="var(--neutral-500)" size={48} />
          <div style={{ margin: '14px 0 4px', font: 'var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>No activities match</div>
          <div style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-muted)', maxWidth: 360 }}>
            Adjust the filter, date range, or search to see more of the audit trail.
          </div>
        </div>
      )}
      {groups.map(([day, list]) => (
        <div key={day} style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ font: 'var(--fw-bold) 10.5px/1 var(--font-body)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{day}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 5px', borderRadius: 'var(--radius-pill)', background: 'var(--neutral-100)', color: 'var(--text-secondary)', font: 'var(--fw-bold) 10px/1 var(--font-body)' }}>{list.length}</span>
          </div>
          {list.map((e) => {
            const cls = classify(e.action)
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0' }}>
                <IconChip icon={iconFor(e.action)} tint={cls === 'LIFECYCLE' ? 'var(--success-50)' : 'var(--neutral-100)'} color={cls === 'LIFECYCLE' ? 'var(--success-600)' : 'var(--neutral-600)'} size={34} iconSize={15} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{e.action}</span>
                    <TagChip tint={cls === 'LIFECYCLE' ? 'var(--success-50)' : '#EEEBFB'} color={cls === 'LIFECYCLE' ? 'var(--success-600)' : '#6B4EDB'}>{cls}</TagChip>
                  </div>
                  <div style={{ marginTop: 3, font: 'var(--fw-regular) var(--fs-caption)/1.3 var(--font-body)', color: 'var(--text-muted)' }}>
                    {e.actor} · {e.actorRole}{e.detail ? ` · ${e.detail}` : ''}
                  </div>
                </div>
                <span style={{ font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)', flex: 'none' }}>{fmtMDY(e.timestamp)} · {fmtHM(e.timestamp)}</span>
              </div>
            )
          })}
        </div>
      ))}
    </SectionCard>
  )
}

/* ---------- Modals ---------- */

function ChangeStatusModal({ open, issue, canApprove, onClose }: { open: boolean; issue: Issue; canApprove: boolean; onClose: () => void }) {
  const store = useStore()
  const { user } = useRole()
  const [target, setTarget] = useState<StatusKey | ''>('')
  const [reason, setReason] = useState('')
  const actor = { name: user.name, role: user.role }
  // NASO (no action) keeps the ≥30-char justification gate the disposition flow required.
  const minLen = target === 'outofscope' ? 30 : 1
  const valid = target && reason.trim().length >= minLen
  const submit = () => {
    if (!valid || !target) return
    const oc: DispositionOutcome | undefined = target === 'outofscope' ? 'No Action' : target === 'monitoring' ? 'Monitoring' : undefined
    if (canApprove) store.setStatus(issue.id, target, reason.trim(), actor, 'Status changed', oc)
    else store.proposeTransition(issue.id, target, reason.trim(), actor, oc)
    setTarget(''); setReason(''); onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title={
      <>
        Change issue status
        <div style={{ marginTop: 3, font: 'var(--fw-regular) var(--fs-body-sm)/1.3 var(--font-body)', color: 'var(--text-disabled)' }}>A valid reason is required for every status change.</div>
      </>
    } footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!valid} iconLeft={<Icon icon={Check} size={16} />} onClick={submit}>Save status change</Button>
      </>
    }>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
        <ULabel style={{ marginBottom: 0 }}>Current status</ULabel>
        <StatusBadge status={issue.status} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div>
          <ULabel>New status *</ULabel>
          <Select aria-label="New status" value={target} placeholder="Select status…" options={STATUS_KEYS.filter((k) => k !== issue.status).map((k) => ({ value: k, label: STATUS[k].label }))} onChange={(e) => setTarget(e.target.value as StatusKey)} />
        </div>
      </div>
      <ULabel>Reason / comment *</ULabel>
      <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={target === 'outofscope' ? 'NASO (no action) requires at least 30 characters…' : 'e.g. Reviewed investigation details and moved for technical validation'} />
      <p style={{ margin: '10px 0 0', font: 'var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
        {canApprove ? 'Override roles apply directly; the justification is audit-logged.' : 'Submits as Pending Approval — an ASM/PQM decides with a remark.'}
      </p>
    </Modal>
  )
}

function CreateQirModal({ open, issue, onClose }: { open: boolean; issue: Issue; onClose: () => void }) {
  const store = useStore()
  const { user } = useRole()
  const [reason, setReason] = useState('')
  const valid = reason.trim().length >= 20
  return (
    <Modal open={open} onClose={onClose} title="Create QIR" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!valid} iconLeft={<Icon icon={ClipboardPlus} size={15} />} onClick={() => { store.setStatus(issue.id, 'escalated', reason.trim(), { name: user.name, role: user.role }, 'Escalated to QIR (hand-off)'); setReason(''); onClose() }}>Create QIR</Button>
      </>
    }>
      <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>
        Escalates {issue.id} to the QIR module. The issue becomes <b>Escalated</b>; the QIR reference will appear read-only in Resolution. The QIR module owns what happens next.
      </p>
      <ULabel>Escalation reason * (min 20 characters)</ULabel>
      <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why does this issue warrant a QIR?" />
    </Modal>
  )
}

function EditIssueModal({ open, issue, onClose }: { open: boolean; issue: Issue; onClose: () => void }) {
  const store = useStore()
  const { user } = useRole()
  const [title, setTitle] = useState(issue.title)
  const [description, setDescription] = useState(issue.description)
  const [dtc, setDtc] = useState((issue.dtcCodes ?? []).join(', '))
  const valid = title.trim().length >= 5
  return (
    <Modal open={open} onClose={onClose} title="Edit issue" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!valid} onClick={() => { store.updateIssue(issue.id, { title: title.trim(), description: description.trim(), dtcCodes: dtc.trim() ? dtc.split(',').map((d) => d.trim()).filter(Boolean) : undefined }, { name: user.name, role: user.role }); onClose() }}>Save changes</Button>
      </>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div><ULabel>Issue title *</ULabel><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. EV6 — HV battery rapid SOC drop under cold soak" style={{ ...inputStyle, height: 'var(--control-md)' }} /></div>
        <div><ULabel>Description *</ULabel><Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Symptoms, reproduction steps, environmental conditions, frequency, and any safety implications…" /></div>
        <div><ULabel>DTC / trouble code <span style={{ color: 'var(--text-disabled)', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>· optional · comma-separated</span></ULabel><input value={dtc} onChange={(e) => setDtc(e.target.value)} placeholder="e.g. P0A0F, C1234, B1020" style={{ ...inputStyle, height: 'var(--control-md)' }} /></div>
      </div>
    </Modal>
  )
}

function ManageLinksModal({ open, issue, onClose }: { open: boolean; issue: Issue; onClose: () => void }) {
  const store = useStore()
  const { user } = useRole()
  const actor = { name: user.name, role: user.role }
  const committed = useMemo(() => issue.linkedIssueIds ?? [], [issue.linkedIssueIds])
  // Prototype behavior: edits are a draft; everything applies together on Save.
  const [draft, setDraft] = useState<string[]>(committed)
  useEffect(() => { if (open) setDraft(committed) }, [open, committed])
  const dirty = draft.length !== committed.length || draft.some((d) => !committed.includes(d))
  const candidates = store.correlations(issue.id).filter((c) => !draft.includes(c.id))
  const save = () => {
    committed.filter((id) => !draft.includes(id)).forEach((id) => store.unlinkIssue(issue.id, id, actor))
    draft.filter((id) => !committed.includes(id)).forEach((id) => store.linkIssue(issue.id, id, actor))
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title={
      <>
        Manage Related Issues
        <div style={{ marginTop: 3, font: 'var(--fw-regular) var(--fs-body-sm)/1.3 var(--font-body)', color: 'var(--text-disabled)' }}>Review, unlink, and link Parent/Child issues. All changes apply together on Save.</div>
      </>
    } width={620} footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!dirty} iconLeft={<Icon icon={Check} size={15} />} onClick={save}>Save changes</Button>
      </>
    }>
      <ULabel>Current Related Issues</ULabel>
      {draft.length === 0 ? (
        <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>This issue has no related Parent/Child issues.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--space-4)' }}>
          {draft.map((lid) => {
            const li = store.getIssue(lid)
            return (
              <div key={lid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--space-2) var(--space-3)', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-mono)', color: 'var(--text-secondary)' }}>{lid}</span>
                <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', font: 'var(--fw-regular) var(--fs-body-sm)/1.2 var(--font-body)' }}>{li?.title}</span>
                <Button variant="ghost" size="sm" style={{ color: 'var(--danger-500)', borderColor: '#E3B8B0' }} onClick={() => setDraft((d) => d.filter((x) => x !== lid))}>Unlink</Button>
              </div>
            )
          })}
        </div>
      )}
      <ULabel>Link Another Issue</ULabel>
      {candidates.length === 0 ? (
        <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>No classification-matched candidates.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {candidates.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--space-2) var(--space-3)', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-mono)', color: 'var(--text-secondary)' }}>{c.id}</span>
              <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', font: 'var(--fw-regular) var(--fs-body-sm)/1.2 var(--font-body)' }}>{c.title}</span>
              <StatusBadge status={c.status} size="sm" />
              <Button variant="secondary" size="sm" iconLeft={<Icon icon={Link2} size={14} />} onClick={() => setDraft((d) => [...d, c.id])}>Link</Button>
            </div>
          ))}
        </div>
      )}
      <p style={{ margin: 'var(--space-3) 0 0', font: 'var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
        Links notify both owners; unlink is a soft delete recorded in the audit trail.
      </p>
    </Modal>
  )
}
