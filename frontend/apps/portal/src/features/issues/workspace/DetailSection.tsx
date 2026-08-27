import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Check, ChevronDown, ChevronUp, FileText, GitFork, Link, PenSquare, Radio } from 'lucide-react'
import { Button, SOURCE, SOURCE_KEYS, StatusBadge, type SourceKey } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { CardHead, IconChip, MetaChip, SectionCard, ULabel } from '@/app/chrome'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import { useWorkspace } from './context'

// Moved verbatim from IssueWorkspaceScreen.tsx's `DetailTab` (2026-08-27) when
// the five Workspace sections became child routes. Route path: /issues/:id/detail.
//
// 07 names this section "detail"; the old local tab key was "overview". Only the
// route path and this file's name follow 07's naming — nothing else depended on
// the old key string (verified: it appeared only inside IssueWorkspaceScreen.tsx).
//
// Its props became context + hooks: `issue` and `canEdit` come from the shell via
// outlet context, `onManageLinks` is the shell's modal opener, and `onOpen` was
// always just a navigate, so it is one here.

// Channel subtitles for the source edit-mode cards, verbatim from the export's srcSub map.
const SRC_SUB: Record<SourceKey, string> = { warranty: 'Field claims & cost', weibull: 'Reliability model', comeback: 'Repeat repairs', techline: 'Dealer inquiry', fpqr: 'Field PQ report', ews: 'Early warning', gqis: 'Global QI' }

export function DetailSection() {
  const { issue, canEditIssue: canEdit, openModal } = useWorkspace()
  const nav = useNavigate()
  const onOpen = (id: string) => nav(`/issues/${id}`)
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
                <span style={{ display: 'inline-flex', alignItems: 'center', height: 'var(--icon-lg)', padding: '0 10px', borderRadius: 'var(--radius-md)', background: 'var(--neutral-50)', font: 'var(--fw-semibold) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-primary)' }}>{issue.modelYear}</span>
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
                <span key={d} style={{ display: 'inline-flex', alignItems: 'center', height: 'var(--icon-lg)', padding: '0 10px', borderRadius: 'var(--radius-md)', background: 'var(--neutral-100)', font: 'var(--fw-semibold) var(--fs-caption)/1 var(--font-mono)', color: 'var(--text-primary)' }}>{d}</span>
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
                <span style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
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
                    <span aria-hidden style={{ width: 'var(--icon-sm)', height: 'var(--icon-sm)', flex: 'none', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${active ? 'var(--kia-midnight)' : 'var(--neutral-300)'}`, background: active ? 'var(--kia-midnight)' : 'var(--surface-card)', color: 'var(--neutral-0)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
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
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%', border: 'none', background: 'var(--surface-card)', padding: '12px 14px', cursor: 'pointer', textAlign: 'left' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 'var(--icon-md)', height: 'var(--icon-md)', padding: '0 6px', borderRadius: 'var(--radius-pill)', background: 'var(--success-50)', color: 'var(--success-600)', font: 'var(--fw-bold) 11px/1 var(--font-body)' }}>{linked.length}</span>
        </div>
        <button onClick={() => openModal('links')} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--accent-700)', marginBottom: 12 }}>
          Manage Related Issues
        </button>
        {linked.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)', font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)' }}>
            <Icon icon={Link} size={14} /> No related issues linked
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
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
