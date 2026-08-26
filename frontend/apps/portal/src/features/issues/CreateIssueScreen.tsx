import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Info, Link2, RotateCcw, Send } from 'lucide-react'
import { Badge, Button, Input, Select, SOURCE, SOURCE_KEYS, SourceBadge, StatusBadge, Textarea, type SourceKey } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { CardHead, Modal, PageContainer, PageCrumb, SectionCard, ULabel } from '@/app/chrome'
import { modelNameFor, modelYearsFor } from '@/data/modelCodes'
import { ModelCodeYearPicker, type ModelCodeSelection } from './ModelCodeYearPicker'
import { LinkIssuesSection } from './LinkIssuesSection'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'

export function CreateIssueScreen() {
  const nav = useNavigate()
  const { user } = useRole()
  const store = useStore()

  const [vehicle, setVehicle] = useState<ModelCodeSelection>({ codes: [], yearsByCode: {} })
  const [linkedIds, setLinkedIds] = useState<string[]>([])
  const [sysId, setSysId] = useState(''); const [subId, setSubId] = useState(''); const [compId, setCompId] = useState(''); const [symId, setSymId] = useState('')
  const [pendingSymptom, setPendingSymptom] = useState('')
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestValue, setRequestValue] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dtc, setDtc] = useState('')
  const [source, setSource] = useState<SourceKey | ''>('')

  const systems = store.classByLevel('system')
  const subs = useMemo(() => (sysId ? store.classChildren(sysId) : []), [sysId, store])
  const comps = useMemo(() => (subId ? store.classChildren(subId) : []), [subId, store])
  const symptoms = useMemo(() => (compId ? store.classChildren(compId) : []), [compId, store])

  // The anchor is the first code in master order; it supplies the displayed model name.
  const anchorCode = vehicle.codes[0] ?? ''
  const anchorYears = useMemo(
    () => (anchorCode ? (vehicle.yearsByCode[anchorCode] ?? modelYearsFor(anchorCode)) : []),
    [anchorCode, vehicle.yearsByCode],
  )
  const label = (list: { id: string; label: string }[], id: string) => list.find((c) => c.id === id)?.label
  const symptomLabel = pendingSymptom || (symId ? label(symptoms, symId) : undefined)
  const correlated = useMemo(() => (symptomLabel ? store.issues.filter((i) => i.symptom === symptomLabel).slice(0, 5) : []), [symptomLabel, store.issues])

  const canRegister = !!source && vehicle.codes.length > 0 && title.trim().length >= 5 && description.trim().length > 0

  const clearAll = () => {
    setVehicle({ codes: [], yearsByCode: {} }); setLinkedIds([]); setSysId(''); setSubId(''); setCompId(''); setSymId(''); setPendingSymptom('')
    setTitle(''); setDescription(''); setDtc(''); setSource('')
  }

  const register = () => {
    if (!canRegister || !source) return
    const created = store.createIssue(
      {
        title: title.trim(),
        description: description.trim(),
        source,
        model: modelNameFor(anchorCode) ?? anchorCode,
        modelCode: anchorCode,
        modelCodes: vehicle.codes,
        yearsByCode: vehicle.yearsByCode,
        // The record carries one year; use the earliest selected on the anchor code.
        modelYear: Number(anchorYears[0]) || 2026,
        linkedIssueIds: linkedIds,
        system: sysId ? label(systems, sysId) : undefined,
        subSystem: subId ? label(subs, subId) : undefined,
        component: compId ? label(comps, compId) : undefined,
        symptom: symptomLabel,
        dtcCodes: dtc.trim() ? dtc.split(',').map((d) => d.trim()).filter(Boolean) : undefined,
        submit: true,
      },
      { name: user.name, role: user.role },
    )
    nav(`/issues/${created.id}`)
  }

  const pathSteps: { label: string; done: boolean }[] = [
    { label: 'Model Code', done: vehicle.codes.length > 0 },
    { label: 'System', done: !!sysId },
    { label: 'Sub-System', done: !!subId },
    { label: 'Component', done: !!compId },
    { label: 'Symptom', done: !!symptomLabel },
  ]

  return (
    <PageContainer>
      <PageCrumb backTo="/issues" trail={[{ label: 'Issue Management', to: '/issues' }, { label: 'Issue Entry' }]} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ margin: 0, font: 'var(--fw-bold) 30px/1.15 var(--font-display)', letterSpacing: 'var(--ls-h1)', color: 'var(--text-primary)' }}>New issue</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="secondary" iconLeft={<Icon icon={RotateCcw} size={15} />} onClick={clearAll}>Clear</Button>
          <Button iconLeft={<Icon icon={Send} size={15} />} disabled={!canRegister} onClick={register}>Register Issue</Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Vehicle Information */}
        <SectionCard>
          <CardHead title="Vehicle Information" />
          <ModelCodeYearPicker value={vehicle} onChange={setVehicle} />
        </SectionCard>

        {/* System Classification */}
        <SectionCard>
          <CardHead title="System Classification" />
          {/* PATH bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--accent-50)', border: 'var(--border-width) solid var(--accent-100)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
            <span style={{ font: 'var(--fw-bold) 10px/1 var(--font-body)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Path</span>
            {pathSteps.map((s, i) => (
              <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <span style={{ font: `${s.done ? 'var(--fw-semibold)' : 'var(--fw-regular)'} var(--fs-body-sm)/1 var(--font-body)`, color: s.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</span>
                {i < pathSteps.length - 1 && <Icon icon={ChevronRight} size={13} style={{ color: 'var(--neutral-300)' }} />}
              </span>
            ))}
          </div>
          {!anchorCode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 'var(--space-3)', font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-muted)' }}>
              <Icon icon={Info} size={14} /> Select a Model Code in Vehicle information to enable classification.
            </div>
          )}
          <div style={{ marginBottom: 'var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)' }}>
            Can't find the required classification?{' '}
            <button onClick={() => setRequestOpen(true)} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-link)' }}>Request New</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <ULabel>System *</ULabel>
              <Select aria-label="System" value={sysId} placeholder={anchorCode ? 'Search system… (e.g. “Bat”, “Electrical”)' : 'Select model code first'} disabled={!anchorCode} options={systems.map((s) => ({ value: s.id, label: s.label }))} onChange={(e) => { setSysId(e.target.value); setSubId(''); setCompId(''); setSymId(''); setPendingSymptom('') }} />
            </div>
            <div>
              <ULabel>Sub-system *</ULabel>
              <Select aria-label="Sub-system" value={subId} placeholder={sysId ? 'Search sub-system…' : 'Select a system first'} disabled={!sysId} options={subs.map((s) => ({ value: s.id, label: s.label }))} onChange={(e) => { setSubId(e.target.value); setCompId(''); setSymId(''); setPendingSymptom('') }} />
            </div>
            <div>
              <ULabel>Component *</ULabel>
              <Select aria-label="Component" value={compId} placeholder={subId ? 'Search component…' : 'Select a sub-system first'} disabled={!subId} options={comps.map((s) => ({ value: s.id, label: s.label }))} onChange={(e) => { setCompId(e.target.value); setSymId(''); setPendingSymptom('') }} />
            </div>
            <div>
              <ULabel>Symptom *</ULabel>
              <Select aria-label="Symptom" value={symId} placeholder={compId ? 'Search symptom…' : 'Select a component first'} disabled={!compId || !!pendingSymptom} options={symptoms.map((s) => ({ value: s.id, label: s.label }))} onChange={(e) => setSymId(e.target.value)} />
              {pendingSymptom && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)' }}>{pendingSymptom}</span>
                  <Badge tone="warning" size="sm">Pending Approval</Badge>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Issue Information */}
        <SectionCard>
          <CardHead title="Issue Information" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <ULabel>Issue title *</ULabel>
              <Input aria-label="Issue title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. EV6 — HV battery rapid SOC drop under cold soak" error={title && title.length < 5 ? 'Enter an issue title.' : undefined} />
            </div>
            <div>
              <ULabel>Description *</ULabel>
              <Textarea aria-label="Description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Symptoms, reproduction steps, environmental conditions, frequency, and any safety implications…" />
            </div>
            <div>
              <ULabel>DTC / trouble code <span style={{ color: 'var(--text-disabled)', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>· optional · comma-separated</span></ULabel>
              <Input aria-label="DTC codes" value={dtc} onChange={(e) => setDtc(e.target.value)} placeholder="e.g. P0A0F, C1234, B1020" />
            </div>
            <div>
              <ULabel>Issue source *</ULabel>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SOURCE_KEYS.map((k) => {
                  const active = source === k
                  const Meta = SOURCE[k]
                  return (
                    <button
                      key={k}
                      onClick={() => setSource(k)}
                      aria-pressed={active}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 34, padding: '0 13px', borderRadius: 'var(--radius-md)', border: `1px solid ${active ? 'var(--kia-midnight)' : 'var(--border-default)'}`, background: active ? 'var(--kia-midnight)' : 'var(--surface-card)', color: active ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', font: `${active ? 'var(--fw-semibold)' : 'var(--fw-medium)'} var(--fs-body-sm)/1 var(--font-body)` }}
                    >
                      <Icon icon={Meta.icon} size={14} /> {Meta.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Correlation advisory (non-blocking) */}
        {symptomLabel && (
          <SectionCard>
            <CardHead icon={Link2} title="Same Existing Issues" subtitle="We found existing issues with similar system classification. Review the issue or issue group before linking." />
            {correlated.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)', font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)' }}>No similar issues were found based on the current issue information.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {correlated.map((i) => (
                  <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '9px 12px', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-mono)', color: 'var(--text-secondary)' }}>{i.id}</span>
                    <SourceBadge source={i.source} size="sm" />
                    <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', font: 'var(--fw-regular) var(--fs-body-sm)/1.2 var(--font-body)' }}>{i.title}</span>
                    <StatusBadge status={i.status} size="sm" />
                    <Button variant="link" size="sm" onClick={() => nav(`/issues/${i.id}`)}>Preview</Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={linkedIds.includes(i.id)}
                      iconLeft={<Icon icon={Link2} size={13} />}
                      onClick={() => setLinkedIds((l) => (l.includes(i.id) ? l : [...l, i.id]))}
                    >
                      {linkedIds.includes(i.id) ? 'Linked' : 'Link'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        <LinkIssuesSection
          linkedIds={linkedIds}
          onLink={(id) => setLinkedIds((l) => (l.includes(id) ? l : [...l, id]))}
          onUnlink={(id) => setLinkedIds((l) => l.filter((x) => x !== id))}
        />
      </div>

      {/* Request-new classification (submits to approval queue; non-blocking) */}
      <Modal open={requestOpen} onClose={() => setRequestOpen(false)} title="Request New Classification" footer={
        <>
          <Button variant="ghost" onClick={() => setRequestOpen(false)}>Cancel</Button>
          <Button disabled={!requestValue.trim() || !compId} onClick={() => { setPendingSymptom(requestValue.trim()); setSymId(''); setRequestValue(''); setRequestOpen(false) }}>Submit Request</Button>
        </>
      }>
        <p style={{ margin: '0 0 var(--space-4)', font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)', color: 'var(--text-secondary)' }}>
          Submit a request. Once approved, it will be added.
        </p>
        <ULabel>New symptom value * {compId ? '' : '(select a component first)'}</ULabel>
        <Input aria-label="New symptom" value={requestValue} onChange={(e) => setRequestValue(e.target.value)} placeholder="e.g. Latch fails to release" disabled={!compId} />
      </Modal>
    </PageContainer>
  )
}
