import { useState } from 'react'
import { Expand, Microscope, PackagePlus, Plus, UploadCloud } from 'lucide-react'
import { Badge, Button, Select, Textarea } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { CardHead, IconChip, SectionCard, TagChip, ToggleGroup, ULabel } from '@/app/chrome'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import { fmtHM, fmtMDY } from '@/data/util'
import type { ActivityType, PartUrgency } from '@/data/types'
import { useWorkspace } from './context'
import { inputStyle } from './shared'

// Moved verbatim from IssueWorkspaceScreen.tsx's `InvestigationTab` (2026-08-27).
// Route path: /issues/:id/investigation.
//
// NOTE THE TWO KINDS OF TAB STRIP NOW IN PLAY, because they look similar and are
// not the same thing. The Activities/Parts switch below stays a `ToggleGroup` —
// component state is CORRECT for it: it filters what this section shows, it is
// not a different place. 07's reasoning for routing the Workspace sections is the
// exact converse ("a section is a place, not a filter"), so the two coexisting is
// the rule being applied, not an inconsistency.

export function InvestigationSection() {
  const { issueId, canPropose: canEdit } = useWorkspace()
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
                  <div key={a.id} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderTop: idx === 0 ? 'none' : 'var(--border-width) solid var(--divider)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
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
