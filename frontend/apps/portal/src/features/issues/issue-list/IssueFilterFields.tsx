import type { Dispatch, SetStateAction } from 'react'
import { Car, ClipboardList, Layers } from 'lucide-react'
import { Select, SOURCE, SOURCE_KEYS, STATUS, STATUS_KEYS } from '@pqms/ui-library'
import { drawerLabel, DrawerSection } from '@/features/common/DrawerShell'
import { useTranslation } from 'react-i18next'
import { NS } from './IssueListScreen.i18n'
import type { IssueFilterState } from '@/data/issueListView'

export const fieldRow = { display: 'grid', gridTemplateColumns: '116px 1fr', gap: 'var(--space-4)', alignItems: 'center', padding: 'var(--space-2) 0' } as const

/** Plain value-picker segmented row (Days-open / Linked / EWS-flag) — NOT `ToggleGroup`,
 * which carries `tablist`/`tab` ARIA semantics appropriate for genuine tabs; these three
 * are filter values, not navigable tabs, so that semantics would be a regression here. */
export function SegRow({ options, value, onChange }: { options: { v: string; l: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 7, minWidth: 0 }}>
      {options.map((o) => {
        const active = value === o.v
        return (
          <button key={o.v || 'all'} onClick={() => onChange(o.v)} style={{ height: 34, padding: '0 14px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${active ? 'var(--kia-midnight)' : 'transparent'}`, background: active ? 'var(--surface-card)' : 'var(--neutral-50)', color: active ? 'var(--text-primary)' : 'var(--text-secondary)', font: `${active ? 'var(--fw-semibold)' : 'var(--fw-medium)'} var(--fs-body-sm)/1 var(--font-body)`, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {o.l}
          </button>
        )
      })}
    </div>
  )
}

export interface IssueFilterFieldsProps {
  draft: IssueFilterState
  onDraftChange: Dispatch<SetStateAction<IssueFilterState>>
  opts: { modelCodes: string[]; modelYears: string[]; systems: string[]; subSystems: string[]; components: string[]; symptoms: string[]; owners: string[] }
  secOpen: { vehicle: boolean; classification: boolean; issue: boolean }
  onToggleSection: (key: 'vehicle' | 'classification' | 'issue') => void
}

/** The Filters drawer's concrete fields: Vehicle / Classification / Issue sections. */
export function IssueFilterFields({ draft, onDraftChange, opts, secOpen, onToggleSection }: IssueFilterFieldsProps) {
  const { t } = useTranslation(NS)

  const draftSelect = (key: keyof IssueFilterState, label: string, options: string[] | { value: string; label: string }[]) => (
    <div style={fieldRow}>
      <label style={drawerLabel}>{label}</label>
      <Select aria-label={label} size="lg" value={draft[key]} placeholder="All" options={options} onChange={(e) => onDraftChange((d) => ({ ...d, [key]: e.target.value }))} />
    </div>
  )

  return (
    <>
      <DrawerSection icon={Car} label="Vehicle" open={secOpen.vehicle} onToggle={() => onToggleSection('vehicle')}>
        {draftSelect('modelCode', 'Model Code', opts.modelCodes)}
        {draftSelect('modelYear', 'Model Year', opts.modelYears)}
      </DrawerSection>
      <DrawerSection icon={Layers} label="Classification" open={secOpen.classification} onToggle={() => onToggleSection('classification')}>
        {draftSelect('system', 'System', opts.systems)}
        {draftSelect('subSystem', 'Sub-System', opts.subSystems)}
        {draftSelect('component', 'Component', opts.components)}
        {draftSelect('symptom', 'Symptom', opts.symptoms)}
      </DrawerSection>
      <DrawerSection icon={ClipboardList} label="Issue" open={secOpen.issue} onToggle={() => onToggleSection('issue')}>
        {draftSelect('status', 'Status', STATUS_KEYS.map((k) => ({ value: k, label: STATUS[k].label })))}
        {draftSelect('source', 'Source', SOURCE_KEYS.map((k) => ({ value: k, label: SOURCE[k].label })))}
        {draftSelect('owner', 'Owner', opts.owners)}
        {draftSelect('grouping', 'Issue Grouping', [{ value: 'grouped', label: 'Grouped issues' }, { value: 'ungrouped', label: 'Ungrouped issues' }])}
        <div style={fieldRow}>
          <label style={drawerLabel}>{t('filterIssueDate')}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <input type="date" aria-label="Start date" value={draft.dateFrom} onChange={(e) => onDraftChange((d) => ({ ...d, dateFrom: e.target.value }))} style={{ flex: 1, minWidth: 0, height: 42, boxSizing: 'border-box', padding: '0 11px', border: 'var(--border-width) solid var(--border-default)', borderRadius: 10, font: 'var(--fw-medium) 13.5px/1 var(--font-body)', color: draft.dateFrom ? 'var(--text-primary)' : 'var(--text-disabled)', background: 'var(--surface-card)' }} />
            <span style={{ font: 'var(--fw-regular) 12px/1 var(--font-body)', color: 'var(--text-disabled)', flex: 'none' }}>{t('filterDateSeparator')}</span>
            <input type="date" aria-label="End date" value={draft.dateTo} onChange={(e) => onDraftChange((d) => ({ ...d, dateTo: e.target.value }))} style={{ flex: 1, minWidth: 0, height: 42, boxSizing: 'border-box', padding: '0 11px', border: 'var(--border-width) solid var(--border-default)', borderRadius: 10, font: 'var(--fw-medium) 13.5px/1 var(--font-body)', color: draft.dateTo ? 'var(--text-primary)' : 'var(--text-disabled)', background: 'var(--surface-card)' }} />
          </div>
        </div>
        <div style={fieldRow}>
          <label style={drawerLabel}>{t('filterDaysOpen')}</label>
          <SegRow options={[{ v: '', l: 'All' }, { v: '0-7', l: '≤7d' }, { v: '8-21', l: '8–21d' }, { v: '22', l: '>21d' }]} value={draft.days} onChange={(v) => onDraftChange((d) => ({ ...d, days: v }))} />
        </div>
        <div style={fieldRow}>
          <label style={drawerLabel}>{t('filterLinkedIssues')}</label>
          <SegRow options={[{ v: '', l: 'All' }, { v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }]} value={draft.linked} onChange={(v) => onDraftChange((d) => ({ ...d, linked: v }))} />
        </div>
        <div style={fieldRow}>
          <label style={drawerLabel}>{t('filterEwsFlag')}</label>
          <SegRow options={[{ v: '', l: 'All' }, { v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }]} value={draft.ews} onChange={(v) => onDraftChange((d) => ({ ...d, ews: v }))} />
        </div>
      </DrawerSection>
    </>
  )
}
