import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowUpRight, BellRing, CalendarClock, CheckCheck, ChevronRight, ClipboardList, Clock, History, IdCard, ListChecks, ShieldAlert } from 'lucide-react'
import { Badge, StatusBadge, StatusIndicator, type StatusKey } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { NOW } from '@/data/types'
import { CardHead, PageContainer, PageCrumb, SectionCard, TagChip } from '@/app/chrome'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import { daysOpen, fmtMDY } from '@/data/util'
import type { Issue } from '@/data/types'

function StatBox({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <div style={{ border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', padding: '12px 14px' }}>
      <div style={{ font: 'var(--fw-bold) var(--fs-h2)/1 var(--font-display)', color: tone }}>{value}</div>
      <div style={{ marginTop: 4, font: 'var(--fw-regular) var(--fs-caption)/1.2 var(--font-body)', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  )
}

export function DashboardScreen() {
  const nav = useNavigate()
  const { user, scope, can } = useRole()
  const { issues } = useStore()
  const [tab, setTab] = useState<'all' | 'due' | 'overdue'>('all')

  const mine = scope === 'own' ? issues.filter((i) => i.assignee === user.name || i.owner === user.name) : issues
  const byStatus = (s: StatusKey) => mine.filter((i) => i.status === s).length
  const overdue = (i: Issue) => i.status !== 'closed' && daysOpen(i.reportedDate, i.closedAt) > 30

  const actionAll = mine.filter((i) => (can('approve') ? !!i.proposedStatus : ['open', 'review'].includes(i.status)))
  const actionDueToday = actionAll.filter((i) => i.reportedDate === NOW.slice(0, 10))
  const actionOverdue = mine.filter(overdue)
  const actionItems = tab === 'due' ? actionDueToday : tab === 'overdue' ? actionOverdue : actionAll

  const attention = mine.filter((i) => i.isEws || overdue(i) || (i.linkedIssueIds?.length ?? 0) > 0).slice(0, 5)
  const recents = [...mine].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 5)

  const open = (i: Issue) => nav(`/issues/${i.id}`)

  return (
    <PageContainer>
      <PageCrumb trail={[{ label: 'Kia PQMS' }, { label: 'Overview' }]} />

      {/* Greeting */}
      <h1 style={{ margin: 0, font: 'var(--fw-bold) 30px/1.15 var(--font-display)', letterSpacing: 'var(--ls-h1)', color: 'var(--text-primary)' }}>
        Good morning, {user.name.split(' ')[0]}
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: '10px 0 var(--space-6)', flexWrap: 'wrap' }}>
        <span style={{ font: 'var(--fw-regular) var(--fs-body-md)/1 var(--font-body)', color: 'var(--text-secondary)' }}>Here is what needs your attention today</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 'var(--icon-lg)', padding: '0 9px', borderRadius: 'var(--radius-md)', background: 'var(--neutral-100)', color: 'var(--text-secondary)', font: 'var(--fw-semibold) var(--fs-caption)/1 var(--font-body)' }}>
          <Icon icon={IdCard} size={13} /> {user.roleLabel}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)' }}>
          <Icon icon={Clock} size={13} /> Last login 07/09/2026 · 07:42
        </span>
      </div>

      {/* Module summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <SectionCard>
          <CardHead
            icon={ClipboardList}
            title="Issue Management"
            right={
              <button aria-label="Open Issue Management" onClick={() => nav('/issues')} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: 'var(--space-1)' }}>
                <Icon icon={ArrowUpRight} size={16} />
              </button>
            }
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            <StatBox label="Open" value={byStatus('open')} tone="var(--status-open)" />
            <StatBox label="Investigating" value={byStatus('review')} tone="var(--status-review)" />
            <StatBox label="QIR" value={byStatus('escalated')} tone="#D97706" />
          </div>
        </SectionCard>
        <SectionCard>
          <CardHead icon={History} tint="#E2F4F2" color="#0A6F64" title="Monitoring & disposition" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            <StatBox label="Monitoring" value={byStatus('monitoring')} tone="var(--status-monitor)" />
            <StatBox label="NASO" value={byStatus('outofscope')} tone="#8B5A2B" />
            <StatBox label="Closed" value={byStatus('closed')} tone="var(--status-closed)" />
          </div>
        </SectionCard>
        <SectionCard>
          <CardHead icon={ShieldAlert} tint="var(--danger-50)" color="var(--danger-600)" title="Risk signals" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            <StatBox label="Top Issue" value={byStatus('topissue')} tone="var(--danger-500)" />
            <StatBox label="EWS-flagged" value={mine.filter((i) => i.isEws).length} tone="var(--danger-500)" />
            <StatBox label="Overdue >30d" value={mine.filter(overdue).length} tone="var(--warning-600)" />
          </div>
        </SectionCard>
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.35fr minmax(320px, 1fr)', gap: 'var(--space-4)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* My action items */}
          <SectionCard>
            <CardHead
              icon={ListChecks}
              tint="var(--kia-midnight)"
              color="#fff"
              title="My action items"
              subtitle="Waiting on your action across ISM"
              right={
                <button onClick={() => nav('/issues')} style={{ border: 'none', background: 'transparent', color: 'var(--text-link)', cursor: 'pointer', font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-body)', padding: 0 }}>
                  View all
                </button>
              }
            />
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 18, borderBottom: 'var(--border-width) solid var(--divider)', marginBottom: 'var(--space-2)' }}>
              {([['all', 'All', actionAll.length], ['due', 'Due today', actionDueToday.length], ['overdue', 'Overdue', actionOverdue.length]] as const).map(([k, label, n]) => {
                const active = tab === k
                return (
                  <button key={k} onClick={() => setTab(k)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', background: 'transparent', padding: '6px 2px 10px', cursor: 'pointer', font: `${active ? 'var(--fw-bold)' : 'var(--fw-medium)'} var(--fs-body-sm)/1 var(--font-body)`, color: active ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: active ? 'inset 0 -2px 0 0 var(--kia-midnight)' : 'none' }}>
                    {label}
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 5px', borderRadius: 'var(--radius-pill)', background: active ? 'var(--kia-midnight)' : 'var(--neutral-100)', color: active ? '#fff' : 'var(--text-secondary)', font: 'var(--fw-bold) 10.5px/1 var(--font-body)' }}>{n}</span>
                  </button>
                )
              })}
            </div>
            {actionItems.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '34px 16px', gap: 9 }}>
                <span style={{ width: 42, height: 42, borderRadius: 'var(--radius-lg)', background: 'var(--success-50)', color: 'var(--success-500)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon icon={CheckCheck} size={20} />
                </span>
                <div style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-primary)' }}>Nothing waiting on you</div>
                <div style={{ font: 'var(--fw-regular) var(--fs-caption)/1.5 var(--font-body)', color: 'var(--text-muted)' }}>
                  {tab === 'overdue' ? 'No overdue action items. Everything is on track.' : tab === 'due' ? 'No action items are due today. You are all caught up.' : 'No action items waiting on you.'}
                </div>
              </div>
            ) : (
              actionItems.slice(0, 6).map((i, idx) => {
                const isOver = overdue(i)
                const bar = isOver ? 'var(--danger-500)' : i.proposedStatus ? 'var(--warning-500)' : 'var(--accent-500)'
                return (
                  <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderTop: idx === 0 ? 'none' : 'var(--border-width) solid var(--divider)' }}>
                    <span aria-hidden style={{ alignSelf: 'stretch', width: 3, borderRadius: 2, background: bar, flex: 'none' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: 'var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 4 }}>
                        <Badge tone="accent" size="sm">ISSUE</Badge>
                        <span style={{ font: 'var(--fw-medium) var(--fs-caption)/1 var(--font-mono)', color: 'var(--text-secondary)' }}>{i.id}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)' }}>
                          · <Icon icon={CalendarClock} size={12} /> {fmtMDY(i.reportedDate)}
                        </span>
                        {isOver && <span style={{ font: 'var(--fw-semibold) var(--fs-caption)/1 var(--font-body)', color: 'var(--danger-500)' }}>Overdue · {daysOpen(i.reportedDate, i.closedAt)}d open</span>}
                      </div>
                    </div>
                    <StatusBadge status={i.status} size="sm" />
                    <button onClick={() => open(i)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 var(--space-3)', border: 'var(--border-width) solid var(--border-default)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', cursor: 'pointer', font: 'var(--fw-semibold) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-primary)', flex: 'none' }}>
                      <Icon icon={ArrowUpRight} size={13} /> Open
                    </button>
                  </div>
                )
              })
            )}
          </SectionCard>

          {/* Recently accessed */}
          <SectionCard>
            <CardHead
              icon={History}
              tint="var(--neutral-100)"
              color="var(--text-primary)"
              title="Recently accessed"
              subtitle="Continue where you left off"
              right={
                <button onClick={() => nav('/issues')} style={{ border: 'none', background: 'transparent', color: 'var(--text-link)', cursor: 'pointer', font: 'var(--fw-semibold) var(--fs-body-sm)/1 var(--font-body)', padding: 0 }}>
                  View all
                </button>
              }
            />
            {recents.map((i, idx) => (
              <button key={i.id} onClick={() => open(i)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%', textAlign: 'left', border: 'none', borderTop: idx === 0 ? 'none' : 'var(--border-width) solid var(--divider)', background: 'transparent', cursor: 'pointer', padding: '11px 0' }}>
                <Badge tone="accent" size="sm">ISSUE</Badge>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', font: 'var(--fw-semibold) var(--fs-caption)/1.2 var(--font-mono)', color: 'var(--text-muted)' }}>{i.id}</span>
                  <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)', font: 'var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)' }}>{i.title}</span>
                </span>
                <StatusIndicator status={i.status} size="sm" />
                <span style={{ font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)' }}>{fmtMDY(i.updatedAt)}</span>
                <Icon icon={ChevronRight} size={15} style={{ color: 'var(--neutral-300)' }} />
              </button>
            ))}
          </SectionCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Attention required */}
          <SectionCard>
            <CardHead icon={BellRing} tint="var(--danger-50)" color="var(--danger-600)" title="Attention required" subtitle="High-impact records to investigate or monitor" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {attention.length === 0 && <p style={{ margin: 0, color: 'var(--text-muted)', font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)' }}>No high-priority signals.</p>}
              {attention.map((i, idx) => (
                <button key={i.id} onClick={() => open(i)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', border: 'none', borderTop: idx === 0 ? 'none' : 'var(--border-width) solid var(--divider)', background: 'transparent', cursor: 'pointer', padding: 'var(--space-3) 0' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <Badge tone="accent" size="sm">ISSUE</Badge>
                      <span style={{ font: 'var(--fw-semibold) var(--fs-caption)/1 var(--font-mono)', color: 'var(--text-secondary)' }}>{i.id}</span>
                      {i.isEws ? <TagChip tint="var(--danger-50)" color="var(--danger-600)">EWS flagged</TagChip> : overdue(i) ? <TagChip tint="var(--warning-50)" color="var(--warning-600)">Overdue</TagChip> : <TagChip tint="var(--accent-50)" color="var(--accent-700)">Linked</TagChip>}
                    </div>
                    <div style={{ font: 'var(--fw-semibold) var(--fs-body-sm)/1.35 var(--font-body)', color: 'var(--text-primary)' }}>{i.title}</div>
                    <div style={{ marginTop: 3, font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)' }}>{daysOpen(i.reportedDate, i.closedAt)} days open</div>
                  </div>
                  <Icon icon={ChevronRight} size={15} style={{ color: 'var(--neutral-300)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Lifecycle health — the prototype's five stages (homeVals lifecycleStages), not raw statuses. */}
          <SectionCard>
            <CardHead icon={Activity} tint="var(--accent-50)" color="var(--accent-600)" title="Lifecycle health" subtitle="Issue progression" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { label: 'Open', value: mine.filter((i) => ['open', 'review', 'escalated', 'monitoring', 'topissue'].includes(i.status)).length, color: 'var(--status-open)' },
                { label: 'Investigation', value: mine.filter((i) => ['open', 'review', 'escalated'].includes(i.status)).length, color: 'var(--status-disposed)' },
                { label: 'Review', value: byStatus('review'), color: 'var(--status-review)' },
                { label: 'QIR', value: byStatus('escalated'), color: '#D97706' },
                { label: 'Closed', value: byStatus('closed'), color: 'var(--success-500)' },
              ].map((l, idx, arr) => (
                <div key={l.label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '11px 2px' }}>
                    <span aria-hidden style={{ width: 10, height: 10, borderRadius: 3, background: l.color, flex: 'none' }} />
                    <span style={{ flex: 1, font: 'var(--fw-semibold) 13px/1 var(--font-body)', color: 'var(--text-primary)' }}>{l.label}</span>
                    <span style={{ font: 'var(--fw-bold) 20px/1 var(--font-display)', color: l.color }}>{l.value}</span>
                  </div>
                  {idx < arr.length - 1 && <div style={{ height: 'var(--icon-xs)', marginLeft: 4, borderLeft: 'var(--border-width-emphasis) dotted #DCE1E6' }} />}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  )
}
