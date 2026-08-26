import { useState, type CSSProperties, type ReactNode } from 'react'
import {
  Activity,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleX,
  ClipboardList,
  Clock,
  ClockAlert,
  Cpu,
  FileClock,
  FileWarning,
  FoldVertical,
  Gavel,
  Globe,
  Headset,
  History,
  Layers,
  LoaderCircle,
  Lock,
  MousePointerClick,
  Play,
  Plus,
  RotateCcw,
  ShieldAlert,
  Timer,
  TriangleAlert,
  UnfoldVertical,
  type LucideIcon,
} from 'lucide-react'
import { Button, EmptyState, IconButton, Switch } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { IconChip, PageContainer, PageCrumb, SectionCard, TagChip, ULabel } from '@/app/chrome'
import { useRole } from '@/data/roles'

// ---------------------------------------------------------------------------
// Issue Administration — aligned to the UX prototype's admin screen
// (ISM + QIR SE Role - P-C.dc.html, `showAdmin` template + adminVals()).
// All rows/values below are the prototype's seed display data.
// ---------------------------------------------------------------------------

interface JobStatusMeta {
  label: string
  color: string
  tint: string
  icon: LucideIcon
}

const JOB_STATUS: Record<string, JobStatusMeta> = {
  completed: { label: 'Completed', color: 'var(--success-500)', tint: '#1F8A5B14', icon: CheckCircle2 },
  running: { label: 'Running', color: 'var(--status-review)', tint: '#7C5CDB14', icon: LoaderCircle },
  scheduled: { label: 'Scheduled', color: 'var(--info-500)', tint: '#2A6FDB14', icon: Clock },
  failed: { label: 'Failed', color: 'var(--danger-500)', tint: '#D92D2014', icon: CircleX },
}

const JOBS = [
  { id: 'JOB-GQIS', name: 'GQIS Sync', desc: 'Pulls global quality incidents from GQIS (INT-01).', status: 'completed', lastRun: '07/09/2026 · 05:30', nextRun: 'Tomorrow · 05:30', dur: '1m 48s', by: 'Scheduler' },
  { id: 'JOB-EWS', name: 'EWS Signal Processing', desc: 'Evaluates early-warning signals and raises EWS flags.', status: 'running', lastRun: '07/09/2026 · 08:30', nextRun: 'In progress', dur: '—', by: 'M. Singh (Admin)' },
  { id: 'JOB-AUTO', name: 'Issue Auto-Close', desc: 'Closes monitored issues meeting auto-close rules.', status: 'scheduled', lastRun: '07/08/2026 · 23:00', nextRun: '07/09/2026 · 23:00', dur: '0m 54s', by: 'Scheduler' },
  { id: 'JOB-REM', name: 'Overdue Reminder Processing', desc: 'Sends aging, QIR and disposition reminders.', status: 'failed', lastRun: '07/09/2026 · 04:00', nextRun: 'Retry pending', dur: '0m 22s', by: 'Scheduler' },
]

const KPIS = [
  { label: 'Scheduled jobs', value: '4', icon: Layers, color: 'var(--info-500)', tint: '#2A6FDB14' },
  { label: 'Running now', value: '1', icon: LoaderCircle, color: 'var(--status-review)', tint: '#7C5CDB14' },
  { label: 'Failed (24h)', value: '1', icon: CircleX, color: 'var(--danger-500)', tint: '#D92D2014' },
  { label: 'Avg duration', value: '1m 14s', icon: Timer, color: 'var(--status-disposed)', tint: '#0E938414' },
]

const SOURCES = [
  { key: 'warranty', label: 'Warranty', icon: FileWarning, desc: 'Field warranty claims and cost data (INT-03).' },
  { key: 'weibull', label: 'Weibull', icon: Activity, desc: 'Reliability model outputs and hazard curves.' },
  { key: 'comeback', label: 'Comeback', icon: RotateCcw, desc: 'Repeat-repair / comeback detection from dealers.' },
  { key: 'techline', label: 'Techline', icon: Headset, desc: 'Dealer technical inquiries and support tickets.' },
  { key: 'fpqr', label: 'FPQR', icon: ClipboardList, desc: 'Field product quality reports.' },
  { key: 'ews', label: 'EWS', icon: ShieldAlert, desc: 'Early-warning system signals.' },
  { key: 'gqis', label: 'GQIS', icon: Globe, desc: 'Global quality incident sync (INT-01).' },
]

const MODULE_TINT: Record<string, { color: string; tint: string }> = {
  Scoring: { color: 'var(--info-500)', tint: '#2A6FDB14' },
  Sources: { color: 'var(--status-review)', tint: '#7C5CDB14' },
  Reminders: { color: 'var(--status-disposed)', tint: '#0E938414' },
  Batch: { color: 'var(--kia-midnight)', tint: '#05141F14' },
}

const AUDIT = [
  { action: 'Updated scoring weight', module: 'Scoring', by: 'M. Singh (Admin)', when: 'Jun 23 · 06:12', old: 'Claim Frequency 30%', new: '35%' },
  { action: 'Disabled source channel', module: 'Sources', by: 'D. Okafor (Admin)', when: 'Jun 21 · 14:48', old: 'FPQR · Enabled', new: 'Disabled' },
  { action: 'Changed reminder threshold', module: 'Reminders', by: 'M. Singh (Admin)', when: 'Jun 20 · 09:30', old: 'Aging warning 21 days', new: '30 days' },
  { action: 'Ran batch manually', module: 'Batch', by: 'M. Singh (Admin)', when: 'Jun 19 · 16:05', old: 'GQIS Sync', new: 'Triggered' },
  { action: 'Enabled source channel', module: 'Sources', by: 'D. Okafor (Admin)', when: 'Jun 17 · 11:22', old: 'Weibull · Disabled', new: 'Enabled' },
]

const CLASS_COUNTS = [
  { label: 'Systems', value: '10', icon: Layers, color: 'var(--info-500)', tint: '#2A6FDB14' },
  { label: 'Sub-systems', value: '25', icon: Box, color: 'var(--status-review)', tint: '#7C5CDB14' },
  { label: 'Components', value: '35', icon: Cpu, color: 'var(--status-disposed)', tint: '#0E938414' },
  { label: 'Symptoms', value: '43', icon: Activity, color: 'var(--warning-500)', tint: '#E2820B14' },
]

/** System → sub-system slice of the prototype's classTree() (deeper levels out of scope here). */
const CLASS_TREE: { name: string; subs: { name: string; count: number }[] }[] = [
  { name: 'Electrical / HV', subs: [{ name: 'Integrated Charging Control Unit (ICCU)', count: 2 }, { name: 'High Voltage Battery', count: 2 }, { name: 'High-Voltage Battery System', count: 1 }] },
  { name: 'Steering', subs: [{ name: 'Steering Column', count: 1 }, { name: 'Rack', count: 1 }] },
  { name: 'Powertrain', subs: [{ name: 'Automatic Transmission', count: 2 }, { name: '2.5T Gasoline Engine', count: 2 }, { name: '6-Speed Automatic Transmission', count: 1 }, { name: '8-Speed Automatic Transmission', count: 1 }, { name: '2.5 L Turbo Engine', count: 1 }] },
  { name: 'Engine', subs: [{ name: 'Fuel System', count: 1 }] },
  { name: 'Cooling / HV Pack', subs: [{ name: 'Coolant Circuit', count: 2 }, { name: 'HV Pack Coolant Circuit', count: 1 }] },
  { name: 'Brakes', subs: [{ name: 'Regenerative Brake System', count: 3 }, { name: 'Front Brake', count: 1 }] },
  { name: 'Body / Closures', subs: [{ name: 'Door System', count: 1 }, { name: 'Sunroof Assembly', count: 2 }, { name: 'Door Latch Assembly', count: 1 }, { name: 'Wiper System', count: 1 }] },
  { name: 'Infotainment', subs: [{ name: 'Head Unit', count: 2 }] },
  { name: 'HVAC', subs: [{ name: 'Blower System', count: 1 }, { name: 'Blower Assembly', count: 1 }] },
  { name: 'Chassis / Suspension', subs: [{ name: 'Front Suspension', count: 2 }, { name: 'TPMS', count: 1 }, { name: 'Tire Pressure Monitoring', count: 1 }] },
]

const CLASS_AUDIT = [
  { action: 'Deactivated', type: 'Symptom', name: 'Charge port no communication', by: 'Seo-yeon Park', date: 'Jun 11, 2026 · 14:22' },
  { action: 'Added', type: 'Component', name: 'Onboard Charger (OBC)', by: 'M. Singh (Admin)', date: 'May 22, 2026 · 09:41' },
  { action: 'Renamed', type: 'Subsystem', name: 'High Voltage Battery', by: 'Park Soo-jin', date: 'Apr 08, 2026 · 16:10' },
]

const FREQ_OPTS = ['Daily', 'Every 2 days', 'Weekly']

// ---- shared style fragments -----------------------------------------------

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '10px 16px',
  font: 'var(--fw-bold) 12px/1.3 var(--font-body)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#5A6672',
}

const inputStyle: CSSProperties = {
  width: '100%',
  height: 40,
  boxSizing: 'border-box',
  border: '1px solid #DDE3E9',
  borderRadius: 'var(--radius-lg)',
  padding: '0 var(--space-3)',
  font: 'var(--fw-regular) 13.5px/1 var(--font-body)',
  color: 'var(--text-primary)',
  background: 'var(--surface-card)',
  outline: 'none',
}

/** Numbered-chip section header (26px Kia-Midnight square + title/subtitle). */
function SectionHead({ n, title, sub, right }: { n: number; title: string; sub: string; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '18px 20px', borderBottom: '1px solid #F0F2F5' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 26, height: 26, borderRadius: 'var(--radius-lg)', background: 'var(--kia-midnight)', color: 'var(--neutral-0)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', font: 'var(--fw-bold) 13px/1 var(--font-display)', flex: 'none' }}>{n}</span>
        <div>
          <div style={{ font: 'var(--fw-bold) 15.5px/1.3 var(--font-body)', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{title}</div>
          <div style={{ marginTop: 1, font: 'var(--fw-regular) 12px/1.35 var(--font-body)', color: 'var(--text-disabled)' }}>{sub}</div>
        </div>
      </div>
      {right}
    </div>
  )
}

/** Number field with a right-aligned "days" suffix. */
function DaysInput({ value, onChange, style }: { value: string; onChange: (v: string) => void; style?: CSSProperties }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', font: 'var(--fw-regular) 12px/1 var(--font-body)', color: 'var(--text-disabled)' }}>days</span>
    </div>
  )
}

function FreqSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
      {FREQ_OPTS.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

export function AdminScreen() {
  const { can } = useRole()

  // Issue reminder configuration (local, prototype-parity interactivity only)
  const [agingWarn, setAgingWarn] = useState('30')
  const [agingCrit, setAgingCrit] = useState('60')
  const [qirOn, setQirOn] = useState(true)
  const [qirDays, setQirDays] = useState('14')
  const [qirFreq, setQirFreq] = useState('Daily')
  const [dispOn, setDispOn] = useState(true)
  const [dispDays, setDispDays] = useState('7')
  const [dispFreq, setDispFreq] = useState('Daily')

  // Issue source configuration
  const [sourceOn, setSourceOn] = useState<Record<string, boolean>>({ warranty: true, weibull: true, comeback: true, techline: true, fpqr: false, ews: true, gqis: true })
  const toggleSource = (k: string) => setSourceOn((s) => ({ ...s, [k]: !s[k] }))

  // Classification tree expansion
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggleNode = (name: string) => setExpanded((e) => ({ ...e, [name]: !e[name] }))

  if (!can('administer')) {
    return (
      <div style={{ padding: 'var(--space-8)' }}>
        <EmptyState icon={<Icon icon={Lock} size={28} />} title="Administrator access required" message="Administration is restricted to the Administrator role. Switch role to view." />
      </div>
    )
  }

  return (
    <PageContainer>
      <PageCrumb trail={[{ label: 'Admin' }, { label: 'Issue Administration' }]} />

      {/* page header + last configuration update */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: '0 0 5px', font: 'var(--fw-bold) 28px/1.15 var(--font-display)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Issue Administration</h1>
          <p style={{ margin: 0, font: 'var(--fw-regular) 13.5px/1.4 var(--font-body)', color: 'var(--text-secondary)' }}>Manage ISM module operations, configurations, and system controls.</p>
        </div>
        <div style={{ textAlign: 'right', flex: 'none', background: 'var(--surface-card)', border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '11px 16px', boxShadow: 'var(--shadow-xs)' }}>
          <ULabel style={{ letterSpacing: '0.05em', marginBottom: 4 }}>Last configuration update</ULabel>
          <div style={{ font: 'var(--fw-semibold) 13px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>06/23/2026 · 06:12</div>
          <div style={{ marginTop: 1, font: 'var(--fw-regular) 11.5px/1.3 var(--font-body)', color: 'var(--text-disabled)' }}>by M. Singh (Admin)</div>
        </div>
      </div>

      {/* system health KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        {KPIS.map((k) => (
          <SectionCard key={k.label} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 13 }}>
            <IconChip icon={k.icon} tint={k.tint} color={k.color} size={40} iconSize={20} />
            <div>
              <div style={{ font: 'var(--fw-bold) 24px/1 var(--font-display)', color: 'var(--text-primary)' }}>{k.value}</div>
              <div style={{ marginTop: 3, font: 'var(--fw-regular) 11.5px/1.3 var(--font-body)', color: 'var(--text-disabled)' }}>{k.label}</div>
            </div>
          </SectionCard>
        ))}
      </div>

      {/* SECTION 1 — Scheduled batch jobs */}
      <SectionCard pad={false} style={{ marginBottom: 18 }}>
        <SectionHead n={1} title="Scheduled batch jobs" sub="Monitor and manually trigger ISM data and processing jobs." />
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            {['22%', '10%', '11%', '10%', '8%', '12%', '27%'].map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1px solid #F0F2F5' }}>
              <th style={thStyle}>Job name</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Last run</th>
              <th style={thStyle}>Next run</th>
              <th style={thStyle}>Duration</th>
              <th style={thStyle}>Triggered by</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {JOBS.map((j) => {
              const st = JOB_STATUS[j.status]
              return (
                <tr key={j.id} style={{ borderBottom: '1px solid #F6F8FA' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ font: 'var(--fw-semibold) 13px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{j.name}</div>
                    <div style={{ marginTop: 2, font: 'var(--fw-regular) 11.5px/1.3 var(--font-body)', color: 'var(--text-disabled)' }}>{j.desc}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 25, padding: '0 11px', borderRadius: 20, font: 'var(--fw-bold) 11.5px/1 var(--font-body)', color: st.color, background: st.tint }}>
                      <Icon icon={st.icon} size={13} />
                      {st.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', font: 'var(--fw-regular) 12.5px/1.3 var(--font-body)', color: 'var(--text-secondary)' }}>{j.lastRun}</td>
                  <td style={{ padding: '14px 16px', font: 'var(--fw-regular) 12.5px/1.3 var(--font-body)', color: 'var(--text-secondary)' }}>{j.nextRun}</td>
                  <td style={{ padding: '14px 16px', font: 'var(--fw-regular) 12.5px/1.3 var(--font-mono)', color: 'var(--text-secondary)' }}>{j.dur}</td>
                  <td style={{ padding: '14px 16px', font: 'var(--fw-regular) 12.5px/1.3 var(--font-body)', color: 'var(--text-secondary)' }}>{j.by}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                      <Button iconLeft={<Icon icon={Play} size={13} />} style={{ height: 34, padding: '0 13px', borderRadius: 'var(--radius-lg)', font: 'var(--fw-semibold) 12.5px/1 var(--font-body)' }}>
                        Run now
                      </Button>
                      <IconButton variant="default" aria-label="View history" title="View history" style={{ width: 34, height: 34, borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)' }}>
                        <Icon icon={History} size={15} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </SectionCard>

      {/* SECTION 2 — Issue reminder configuration */}
      <SectionCard pad={false} style={{ marginBottom: 18 }}>
        <SectionHead n={2} title="Issue reminder configuration" sub="Configure notification thresholds for aging and overdue actions." />
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          <div style={{ border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <IconChip icon={ClockAlert} tint="var(--warning-50)" color="var(--warning-500)" size={30} iconSize={16} />
              <div style={{ font: 'var(--fw-semibold) 13.5px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>Issue aging reminder</div>
            </div>
            <ULabel style={{ letterSpacing: '0.05em' }}>Warning threshold</ULabel>
            <DaysInput value={agingWarn} onChange={setAgingWarn} style={{ marginBottom: 14 }} />
            <ULabel style={{ letterSpacing: '0.05em' }}>Critical threshold</ULabel>
            <DaysInput value={agingCrit} onChange={setAgingCrit} />
          </div>
          <div style={{ border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 9, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <IconChip icon={FileClock} tint="var(--accent-50)" color="var(--accent-600)" size={30} iconSize={16} />
                <div style={{ font: 'var(--fw-semibold) 13.5px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>QIR overdue reminder</div>
              </div>
              <Switch checked={qirOn} onChange={() => setQirOn((v) => !v)} aria-label="QIR overdue reminder" />
            </div>
            <ULabel style={{ letterSpacing: '0.05em' }}>Days open threshold</ULabel>
            <DaysInput value={qirDays} onChange={setQirDays} style={{ marginBottom: 14 }} />
            <ULabel style={{ letterSpacing: '0.05em' }}>Notification frequency</ULabel>
            <FreqSelect value={qirFreq} onChange={setQirFreq} />
          </div>
          <div style={{ border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 9, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <IconChip icon={Gavel} tint="#EDE9FB" color="#7C5CDB" size={30} iconSize={16} />
                <div style={{ font: 'var(--fw-semibold) 13.5px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>Disposition overdue reminder</div>
              </div>
              <Switch checked={dispOn} onChange={() => setDispOn((v) => !v)} aria-label="Disposition overdue reminder" />
            </div>
            <ULabel style={{ letterSpacing: '0.05em' }}>Days open threshold</ULabel>
            <DaysInput value={dispDays} onChange={setDispDays} style={{ marginBottom: 14 }} />
            <ULabel style={{ letterSpacing: '0.05em' }}>Notification frequency</ULabel>
            <FreqSelect value={dispFreq} onChange={setDispFreq} />
          </div>
        </div>
        <div style={{ padding: '0 var(--space-5) var(--space-5)', display: 'flex', justifyContent: 'flex-end' }}>
          <Button iconLeft={<Icon icon={Check} size={16} />} style={{ height: 40, padding: '0 18px', borderRadius: 'var(--radius-lg)' }}>
            Save reminder settings
          </Button>
        </div>
      </SectionCard>

      {/* SECTION 3 — Issue source configuration */}
      <SectionCard pad={false} style={{ marginBottom: 18 }}>
        <SectionHead n={3} title="Issue source configuration" sub="Control which channels are available in the Issue Entry source dropdown." />
        <div style={{ padding: 'var(--space-2) var(--space-5) var(--space-4)' }}>
          {SOURCES.map((s) => {
            const on = sourceOn[s.key]
            const c = on ? '#1F8A5B' : 'var(--text-muted)'
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid #F6F8FA' }}>
                <IconChip icon={s.icon} tint={on ? 'var(--accent-50)' : '#F1F4F7'} color={on ? 'var(--accent-600)' : 'var(--text-disabled)'} size={36} iconSize={18} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ font: 'var(--fw-semibold) 13.5px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{s.label}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--fw-bold) 11.5px/1 var(--font-body)', color: c }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
                      {on ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div style={{ marginTop: 2, font: 'var(--fw-regular) 12px/1.35 var(--font-body)', color: 'var(--text-disabled)' }}>{s.desc}</div>
                  {!on && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, font: 'var(--fw-regular) 11.5px/1.3 var(--font-body)', color: 'var(--warning-500)' }}>
                      <Icon icon={TriangleAlert} size={13} />
                      This source will no longer appear in the Issue Entry source dropdown.
                    </div>
                  )}
                </div>
                <Switch checked={on} onChange={() => toggleSource(s.key)} aria-label={`${s.label} source`} />
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* SECTION 4 — Configuration audit history */}
      <SectionCard pad={false} style={{ marginBottom: 18 }}>
        <SectionHead n={4} title="Configuration audit history" sub="A transparent record of all administrative changes." />
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            {['16%', '12%', '16%', '15%', '20.5%', '20.5%'].map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1px solid #F0F2F5' }}>
              <th style={thStyle}>Action</th>
              <th style={thStyle}>Module</th>
              <th style={thStyle}>Changed by</th>
              <th style={thStyle}>Date / time</th>
              <th style={thStyle}>Old value</th>
              <th style={thStyle}>New value</th>
            </tr>
          </thead>
          <tbody>
            {AUDIT.map((x) => {
              const m = MODULE_TINT[x.module]
              return (
                <tr key={x.action + x.when} style={{ borderBottom: '1px solid #F6F8FA' }}>
                  <td style={{ padding: '13px 16px', font: 'var(--fw-semibold) 12.5px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{x.action}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--fw-bold) 11px/1 var(--font-body)', color: m.color, background: m.tint, borderRadius: 'var(--radius-md)', padding: '3px 9px' }}>{x.module}</span>
                  </td>
                  <td style={{ padding: '13px 16px', font: 'var(--fw-regular) 12.5px/1.3 var(--font-body)', color: 'var(--text-secondary)' }}>{x.by}</td>
                  <td style={{ padding: '13px 16px', font: 'var(--fw-regular) 12.5px/1.3 var(--font-body)', color: 'var(--text-secondary)' }}>{x.when}</td>
                  <td style={{ padding: '13px 16px', font: 'var(--fw-regular) 12.5px/1.3 var(--font-body)', color: 'var(--text-disabled)' }}>{x.old}</td>
                  <td style={{ padding: '13px 16px', font: 'var(--fw-semibold) 12.5px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{x.new}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </SectionCard>

      {/* SECTION 5 — Classification management */}
      <SectionCard pad={false} style={{ marginBottom: 18 }}>
        <SectionHead
          n={5}
          title="Classification management"
          sub="Maintain the System → Sub-system → Component → Symptom hierarchy used across Issue Entry, search and analysis."
          right={
            <Button iconLeft={<Icon icon={Plus} size={15} />} style={{ height: 38, padding: '0 15px', borderRadius: 'var(--radius-lg)', font: 'var(--fw-semibold) 13px/1 var(--font-body)', flex: 'none' }}>
              Add system
            </Button>
          }
        />
        <div style={{ padding: '18px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
            {CLASS_COUNTS.map((k) => (
              <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: 11, border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '12px 14px' }}>
                <IconChip icon={k.icon} tint={k.tint} color={k.color} size={34} iconSize={17} />
                <div>
                  <div style={{ font: 'var(--fw-bold) 20px/1 var(--font-display)', color: 'var(--text-primary)' }}>{k.value}</div>
                  <div style={{ marginTop: 2, font: 'var(--fw-regular) 11px/1.3 var(--font-body)', color: 'var(--text-disabled)' }}>{k.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16, alignItems: 'start' }}>
            {/* left: classification tree */}
            <div style={{ border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '11px 13px', borderBottom: '1px solid #F0F2F5', background: 'var(--bg-app)' }}>
                <ULabel style={{ letterSpacing: '0.05em', marginBottom: 0 }}>Classification tree</ULabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconButton variant="default" aria-label="Expand all" title="Expand all" style={{ width: 28, height: 28, color: 'var(--text-muted)' }} onClick={() => setExpanded(Object.fromEntries(CLASS_TREE.map((t) => [t.name, true])))}>
                    <Icon icon={UnfoldVertical} size={14} />
                  </IconButton>
                  <IconButton variant="default" aria-label="Collapse all" title="Collapse all" style={{ width: 28, height: 28, color: 'var(--text-muted)' }} onClick={() => setExpanded({})}>
                    <Icon icon={FoldVertical} size={14} />
                  </IconButton>
                </div>
              </div>
              <div style={{ padding: 7, maxHeight: 480, overflow: 'auto' }}>
                {CLASS_TREE.map((sys) => (
                  <div key={sys.name}>
                    <div onClick={() => toggleNode(sys.name)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px 8px 12px', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }}>
                      <span style={{ width: 20, height: 20, flex: 'none', color: 'var(--text-disabled)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon icon={expanded[sys.name] ? ChevronDown : ChevronRight} size={15} />
                      </span>
                      <IconChip icon={Layers} tint="#2A6FDB14" color="var(--info-500)" size={24} iconSize={14} />
                      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', font: 'var(--fw-bold) 13px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{sys.name}</span>
                      <span style={{ flex: 'none', font: 'var(--fw-regular) 11px/1 var(--font-body)', color: 'var(--text-disabled)' }}>{sys.subs.length}</span>
                    </div>
                    {expanded[sys.name] &&
                      sys.subs.map((sub) => (
                        <div key={sub.name} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px 8px 32px', borderRadius: 'var(--radius-lg)' }}>
                          <span style={{ width: 20, flex: 'none' }} />
                          <IconChip icon={Box} tint="#7C5CDB14" color="#7C5CDB" size={24} iconSize={14} />
                          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', font: 'var(--fw-semibold) 13px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{sub.name}</span>
                          <span style={{ flex: 'none', font: 'var(--fw-regular) 11px/1 var(--font-body)', color: 'var(--text-disabled)' }}>{sub.count}</span>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>

            {/* right: empty state (no selection) */}
            <div style={{ border: 'var(--border-width) dashed var(--neutral-200)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-12) var(--space-6)', textAlign: 'center', color: 'var(--text-disabled)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Icon icon={MousePointerClick} size={24} />
              <div style={{ font: 'var(--fw-semibold) 13.5px/1.3 var(--font-body)', color: 'var(--text-secondary)' }}>Select a classification item</div>
              <div style={{ maxWidth: 320, font: 'var(--fw-regular) 12.5px/1.45 var(--font-body)' }}>Choose any System, Sub-system, Component or Symptom from the tree to view details and configuration options.</div>
            </div>
          </div>

          {/* recent classification changes */}
          <div style={{ marginTop: 20 }}>
            <ULabel style={{ letterSpacing: '0.05em', marginBottom: 10 }}>Recent classification changes · audit history</ULabel>
            <div style={{ border: '1px solid #F0F2F5', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              {CLASS_AUDIT.map((a) => (
                <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 15px', borderBottom: '1px solid #F6F8FA' }}>
                  <span style={{ width: 92, flex: 'none', font: 'var(--fw-bold) 11.5px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{a.action}</span>
                  <TagChip tint="#F0F2F5" color="var(--text-muted)">
                    {a.type}
                  </TagChip>
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', font: 'var(--fw-semibold) 12.5px/1.3 var(--font-body)', color: 'var(--text-primary)' }}>{a.name}</span>
                  <span style={{ flex: 'none', font: 'var(--fw-regular) 12px/1.3 var(--font-body)', color: 'var(--text-secondary)' }}>{a.by}</span>
                  <span style={{ flex: 'none', font: 'var(--fw-regular) 12px/1.3 var(--font-body)', color: 'var(--text-disabled)' }}>{a.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </PageContainer>
  )
}
