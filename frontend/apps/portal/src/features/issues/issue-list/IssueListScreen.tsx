import { useMemo, useState, type ChangeEvent } from 'react'
import {
  EMPTY_ISSUE_FILTERS,
  useIssueListView,
  type IssueFilterState,
  type IssueListView,
} from '@/data/issueListView'
import { useDebouncedValue } from '@/shared/useDebouncedCallback'
import { useNavigate } from 'react-router'
import { CircleCheck, Columns3, Download, FileOutput, Flame, FolderOpen, Layers, Plus, RefreshCw, Search, SlidersHorizontal, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Button,
  EmptyState,
  Icon,
  Pagination,
  SearchField,
  STATUS,
  STATUS_KEYS,
  type StatusKey,
} from '@pqms/ui-library'
import { PageContainer, PageCrumb, SectionCard } from '@/app/chrome'
import { ErrorBoundary } from '@/app/ErrorBoundary'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import { daysOpen } from '@/data/util'
import { LinkedIssuesModal } from '../LinkedIssuesModal'
import { Trans, useTranslation } from 'react-i18next'
import { NS } from './IssueListScreen.i18n'
import { downloadIssuesCsv, exportFilename } from './issue-export'
import { ALL_COLUMN_KEYS, buildIssueColumns, DEFAULT_COLS, DEFAULT_SORT, DEFAULT_VISIBLE, OPTIONAL_COLS } from './IssueColumns'
import { IssueFilterFields } from './IssueFilterFields'
import { BulkChangeStatusModal } from './BulkChangeStatusModal'
import { PageHeading } from '@/features/common/PageHeading'
import { Card } from '@/features/common/Card'
import { Tabs } from '@/features/common/Tabs'
import { CountBadge } from '@/features/common/CountBadge'
import { DataTable } from '@/features/common/DataTable'
import { Footer } from '@/features/common/Footer'
import { FilterDrawer } from '@/features/common/FilterDrawer'
import { ColumnDrawer } from '@/features/common/ColumnDrawer'
import { BulkActionBar } from '@/features/common/BulkActionBar'
import type { Issue } from '@/data/types'

const PAGE_SIZES = [20, 50, 100]

// Filters-drawer draft (the prototype applies the whole draft on Apply, discards on Reset).
//
// THE SHAPE MOVED TO `@/data/issueListView` when the view became persisted: it
// is now part of what gets serialised to sessionStorage, so the module that
// validates the stored blob has to own the field list. Aliased here so the ~30
// `FilterDraft` references below read unchanged.
type FilterDraft = IssueFilterState
const EMPTY_FILTERS: FilterDraft = EMPTY_ISSUE_FILTERS

/** The view a first-time visitor sees, and the fallback for anything invalid. */
const DEFAULT_VIEW: IssueListView = {
  q: '',
  flt: EMPTY_FILTERS,
  cols: DEFAULT_VISIBLE,
  sort: DEFAULT_SORT,
  page: 1,
  pageSize: 20,
}

export function IssueListScreen() {
  const { t } = useTranslation(NS)
  const nav = useNavigate()
  const { user, scope } = useRole()
  const { issues, bulkStatus } = useStore()

  /*
   * ─── THE PERSISTED VIEW ─────────────────────────────────────────────────────
   *
   * Search, applied filters, visible columns, sort, page, page size AND the
   * My/All Issues tab are all owned by `useIssueListView` now — a Zustand
   * `persist` store as of the issue-filters-store merge, previously a bare
   * `useState` + sessionStorage effect here. Before that original change,
   * opening an issue and pressing Back returned an unfiltered list at page 1
   * and discarded whatever the user had narrowed down to.
   *
   * The destructured names and the setters' signatures are IDENTICAL to the
   * `useState` pairs they replaced (`scope`/`setScope` renamed to `tab`/`setTab`
   * here only to avoid colliding with `useRole()`'s own `scope`, a different
   * concept), so every call site below is unchanged and persistence is
   * invisible at the point of use.
   *
   * ⚠️ `tab` IS NOT PERSISTED ACROSS MOUNTS despite living in the same store —
   * `useIssueListView` re-seeds it from `initialScope` (the third argument)
   * inside the store's own initialiser on every mount, exactly as the old local
   * `useState` initializer did. A stale tab restored from a previous visit
   * could seat someone in a scope their current role would not have picked;
   * Vue's store excludes it from persistence for the same reason and says so at
   * length. The two DRAFTS below are excluded for an unrelated reason: they are
   * seeded from the applied state when a drawer opens, so they have nothing of
   * their own to restore.
   */
  const { view, scope: tab, setScope: setTab, setQ, setFlt, setCols, setSort, setPage, setPageSize } = useIssueListView(
    DEFAULT_VIEW,
    ALL_COLUMN_KEYS,
    scope === 'own' ? 'my' : 'all',
  )
  const { q, flt, cols, sort, page, pageSize } = view

  /*
   * ─── THE SEARCH BOX TYPES AT FULL SPEED; THE TABLE CATCHES UP ───────────────
   *
   * `q` is the input's own value and updates on every keystroke — a controlled
   * input MUST, or typing feels broken. `searchTerm` is the same value 250ms
   * after the user stops, and it is what the filter memo reads.
   *
   * Before this, one keystroke re-ran the whole predicate over every issue, then
   * the sort, then re-rendered the table, then wrote the persisted view to
   * sessionStorage. Typing "charge port" did that eleven times to show a result
   * that only mattered once. It is survivable at 35 seeded rows and is not at a
   * real register — and this is the screen that will hold one.
   *
   * ⚠️ DEBOUNCE THE DERIVATION, NEVER THE INPUT. Debouncing `setQ` would make
   * the field itself lag behind the keyboard, which is the one thing worse than
   * a slow table. See `@/shared/useDebouncedCallback` for the split.
   */
  const searchTerm = useDebouncedValue(q, 250)

  const [drawer, setDrawer] = useState<'' | 'filter' | 'cols'>('')
  const [linkedModalFor, setLinkedModalFor] = useState<string | null>(null)
  const [secOpen, setSecOpen] = useState({ vehicle: true, classification: true, issue: true })
  // The drawers' working drafts. Seeded from the applied state on open, so they
  // start from what is on screen rather than from empty.
  const [draft, setDraft] = useState<FilterDraft>(flt)
  const [colsDraft, setColsDraft] = useState<string[]>(cols)
  const [selected, setSelected] = useState<Array<string | number>>([])
  const [bulkTarget, setBulkTarget] = useState('')
  const [bulkReason, setBulkReason] = useState('')
  const [bulkModalOpen, setBulkModalOpen] = useState(false)

  // "My Issues" = currently ASSIGNED to me, not "ever owned by me" — an issue
  // Arpita reported but handed off to Park Soo-jin no longer belongs in her
  // queue. Matches the Owner column's own display precedence (`assignee ?? owner`)
  // and api/issues.ts's `scope: 'own'` semantics, kept in sync deliberately.
  const myIssues = useMemo(() => issues.filter((i) => i.assignee === user.name), [issues, user.name])
  const scoped = tab === 'my' ? myIssues : issues

  // Option lists for the Filters drawer, derived from the dataset.
  const opts = useMemo(() => {
    const uniq = (vals: (string | undefined)[]) => Array.from(new Set(vals.filter(Boolean) as string[])).sort()
    return {
      modelCodes: uniq(issues.flatMap((i) => i.modelCodes ?? [i.modelCode])),
      modelYears: uniq(issues.map((i) => String(i.modelYear))),
      systems: uniq(issues.map((i) => (i.system ?? '').split('/')[0].trim())),
      subSystems: uniq(issues.map((i) => i.subSystem)),
      components: uniq(issues.map((i) => i.component)),
      symptoms: uniq(issues.map((i) => i.symptom)),
      owners: uniq(issues.map((i) => i.assignee ?? i.owner)),
    }
  }, [issues])

  const filtered = useMemo(() => {
    const list = scoped.filter((i) => {
      const codes = i.modelCodes ?? [i.modelCode]
      const linkCount = i.linkedIssueIds?.length ?? 0
      const days = daysOpen(i.reportedDate, i.closedAt)
      if (flt.modelCode && !codes.includes(flt.modelCode)) return false
      if (flt.modelYear && String(i.modelYear) !== flt.modelYear) return false
      if (flt.system && (i.system ?? '').split('/')[0].trim() !== flt.system) return false
      if (flt.subSystem && i.subSystem !== flt.subSystem) return false
      if (flt.component && i.component !== flt.component) return false
      if (flt.symptom && i.symptom !== flt.symptom) return false
      if (flt.status && i.status !== flt.status) return false
      if (flt.source && i.source !== flt.source) return false
      if (flt.owner && (i.assignee ?? i.owner) !== flt.owner) return false
      if (flt.grouping === 'grouped' && linkCount === 0) return false
      if (flt.grouping === 'ungrouped' && linkCount > 0) return false
      if (flt.dateFrom && i.reportedDate < flt.dateFrom) return false
      if (flt.dateTo && i.reportedDate > flt.dateTo) return false
      if (flt.days === '0-7' && days > 7) return false
      if (flt.days === '8-21' && (days < 8 || days > 21)) return false
      if (flt.days === '22' && days < 22) return false
      if (flt.linked === 'yes' && linkCount === 0) return false
      if (flt.linked === 'no' && linkCount > 0) return false
      if (flt.ews === 'yes' && !i.isEws) return false
      if (flt.ews === 'no' && i.isEws) return false
      // `searchTerm`, NOT `q` — see the memo's dependency list below.
      if (searchTerm) {
        const hay = `${i.id} ${i.title} ${i.model} ${i.modelCode} ${i.system ?? ''} ${i.owner} ${i.assignee ?? ''}`.toLowerCase()
        if (!hay.includes(searchTerm.toLowerCase())) return false
      }
      return true
    })
    // Neither 'id' nor 'title' is a case here: neither column is `sortable` (see
    // IssueColumns.tsx), and ALL_COLUMN_KEYS — the allow-list the persisted
    // view's sort key is validated against — excludes both, so `sort.key` can
    // never legitimately hold either value.
    const val = (i: Issue): string | number => {
      switch (sort.key) {
        case 'modelCode': return i.modelCode || i.model
        case 'status': return STATUS_KEYS.indexOf(i.status)
        case 'owner': return (i.assignee ?? i.owner).toLowerCase()
        case 'days': return daysOpen(i.reportedDate, i.closedAt)
        default: return i.reportedDate
      }
    }
    return [...list].sort((a, b) => {
      const av = val(a), bv = val(b)
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [scoped, flt, searchTerm, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageClamped = Math.min(page, pageCount)
  const pageRows = filtered.slice((pageClamped - 1) * pageSize, pageClamped * pageSize)

  const pct = (n: number) => (scoped.length ? `${Math.round((n / scoped.length) * 100)}%` : '0%')
  const setStatusFilter = (s: string) => setFlt((f) => ({ ...f, status: s }))
  // KPI strip per the prototype's kpiDefs: My/All Issues · Open · Investigating · QIR · Top Issue · Closed.
  // `selected` mirrors whether THIS card's own filter is the one currently applied, so the
  // KPI strip stays in visual sync with `flt.status` regardless of how it was set (a card
  // click, or the Filter drawer).
  const kpiStatus = (k: StatusKey, icon: LucideIcon) => {
    const n = scoped.filter((i) => i.status === k).length
    return { label: STATUS[k].label, count: n, tone: STATUS[k].color, tint: STATUS[k].tint, icon, pct: pct(n), selected: flt.status === k, apply: () => setStatusFilter(k) }
  }
  const kpiDefs: { label: string; count: number; tone: string; tint: string; icon: LucideIcon; pct?: string; selected: boolean; apply: () => void }[] = [
    // Clears any active status filter and stays on whichever tab (My/All) is already
    // selected — this card represents "everything in the current section," not a tab switch.
    // Never `selected`: it is a CLEAR action, not a filter — highlighting it whenever no
    // status filter is applied (its own resting state, immediately after being clicked)
    // reads as "a filter is active" when the opposite is true.
    { label: tab === 'my' ? 'My Issues' : 'All Issues', count: scoped.length, tone: 'var(--text-primary)', tint: 'var(--accent-50)', icon: Layers, selected: false, apply: () => setStatusFilter('') },
    kpiStatus('open', FolderOpen),
    kpiStatus('review', Search),
    kpiStatus('escalated', TriangleAlert),
    kpiStatus('topissue', Flame),
    kpiStatus('closed', CircleCheck),
  ]

  // How many filter fields are currently applied — shown as a badge on the
  // Filter button so the toolbar itself signals when the list is narrowed,
  // without having to open the drawer to find out.
  const activeFilterCount = Object.values(flt).filter(Boolean).length

  const columns = buildIssueColumns({ cols, nav: (path) => nav(path), onOpenLinked: setLinkedModalFor })

  const onToggleAll = (e: ChangeEvent<HTMLInputElement>) => setSelected(e.target.checked ? pageRows.map((r) => r.id) : [])
  const onToggleRow = (id: string | number) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const onSort = (key: string) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))
  const onToggleFilterSection = (key: 'vehicle' | 'classification' | 'issue') => setSecOpen((s) => ({ ...s, [key]: !s[key] }))

  const applyBulk = () => {
    if (!bulkTarget || !bulkReason.trim()) return
    bulkStatus(selected.map(String), bulkTarget as StatusKey, bulkReason.trim(), { name: user.name, role: user.role })
    setSelected([]); setBulkTarget(''); setBulkReason(''); setBulkModalOpen(false)
  }
  // Clearing filters also restores the default sort, which is what the prototype intends.
  // Its own clearFilters() assigns sortKey twice — 'registered' then 'priority' — so the
  // last write silently re-sorts by priority. That is a bug, not a spec: fixed here rather
  // than ported. Decision recorded in the UX memlog (2026-08-24).
  const clearFilters = () => { setQ(''); setFlt(EMPTY_FILTERS); setDraft(EMPTY_FILTERS); setSort(DEFAULT_SORT) }

  return (
    <PageContainer wide>
      <PageCrumb backTo="/dashboard" trail={[{ label: 'Issue Management', to: '/issues' }, { label: 'Issue List' }]} />

      <PageHeading
        title={t('title')}
        subtitle={t('subtitle')}
        secondaryAction={{ label: t('export'), icon: Download, disabled: filtered.length === 0, onClick: () => downloadIssuesCsv(filtered, exportFilename()) }}
        primaryAction={{ label: t('newIssue'), icon: Plus, onClick: () => nav('/issues/new') }}
      />

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        {kpiDefs.map((k) => (
          <Card key={k.label} label={k.label} count={k.count} icon={k.icon} tone={k.tone} tint={k.tint} pct={k.pct} selected={k.selected} onClick={k.apply} />
        ))}
      </div>

      {/* Tabs + search + filter/columns */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <Tabs
          tabs={[{ key: 'my', label: 'My Issues', count: myIssues.length }, { key: 'all', label: 'All Issues', count: issues.length }]}
          activeKey={tab}
          onChange={(k) => { setTab(k as 'my' | 'all'); setPage(1) }}
        />
        <span style={{ flex: 1 }} />
        <div style={{ width: 300 }}>
          <SearchField value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search by keyword..." />
        </div>
        <Button
          variant="secondary"
          iconLeft={<Icon icon={SlidersHorizontal} size={15} />}
          iconRight={activeFilterCount > 0 ? <CountBadge>{activeFilterCount}</CountBadge> : undefined}
          onClick={() => { setDraft(flt); setDrawer('filter') }}
        >
          {t('filter')}
        </Button>
        <Button variant="secondary" iconLeft={<Icon icon={Columns3} size={15} />} onClick={() => { setColsDraft(cols); setDrawer('cols') }}>{t('columns')}</Button>
      </div>

      {/* Bulk-action bar */}
      <BulkActionBar
        count={selected.length}
        label={t('bulkSelected', { count: selected.length })}
        actions={[
          { key: 'status', label: t('bulkChangeStatus'), icon: RefreshCw, onClick: () => setBulkModalOpen(true) },
          {
            // The bulk export is the SELECTION, not the view — that is the whole
            // point of having selected rows.
            key: 'export',
            label: t('bulkExport'),
            icon: FileOutput,
            onClick: () => {
              const chosen = new Set(selected.map(String))
              downloadIssuesCsv(filtered.filter((i) => chosen.has(i.id)), exportFilename('issues-selected'))
            },
          },
        ]}
        onClear={() => setSelected([])}
      />

      <BulkChangeStatusModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        count={selected.length}
        target={bulkTarget}
        onTargetChange={setBulkTarget}
        reason={bulkReason}
        onReasonChange={setBulkReason}
        onSubmit={applyBulk}
        submitDisabled={!bulkTarget || !bulkReason.trim()}
      />

      {/* Table card */}
      <SectionCard pad={false}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderBottom: 'var(--border-width) solid var(--border-subtle)' }}>
          <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)', color: 'var(--text-secondary)' }}>
            <Trans t={t} i18nKey="resultsCount" values={{ shown: filtered.length, total: tab === 'my' ? myIssues.length : issues.length }} components={{ b: <b style={{ color: 'var(--text-primary)' }} /> }} />
          </span>
          <span style={{ font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)' }}>{t('bulkHint')}</span>
        </div>
        {pageRows.length === 0 ? (
          <div style={{ padding: 'var(--space-6)' }}>
            <EmptyState title={t('emptyTitle')} message={t('emptyBody')} action={<Button variant="secondary" size="sm" onClick={clearFilters}>{t('clearFilters')}</Button>} />
          </div>
        ) : (
          // Scoped to just the table + its footer: a bad row shape reaching one of
          // IssueColumns' cell renderers must not blank the KPI strip, search,
          // filters or export above it. resetKey covers every input that decides
          // what renders here, so a cause that goes away (new sort, a narrower
          // filter, a different page) clears the fallback instead of it lingering
          // on data that no longer applies.
          <ErrorBoundary source="issue-list:table" resetKey={`${tab}:${JSON.stringify(view)}`}>
            <DataTable<Issue>
              columns={columns}
              rows={pageRows}
              rowKey="id"
              selectable
              selectedIds={selected}
              onToggleRow={onToggleRow}
              onToggleAll={onToggleAll}
              sort={sort}
              onSort={onSort}
            />
            <Footer
              rangeText={
                <Trans
                  t={t}
                  i18nKey="resultsRange"
                  values={{ from: (pageClamped - 1) * pageSize + 1, to: Math.min(pageClamped * pageSize, filtered.length), total: filtered.length }}
                  components={{ b: <b style={{ color: 'var(--text-primary)' }} /> }}
                />
              }
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZES}
              pageSizeLabel={t('resultsRows')}
              onPageSizeChange={(n) => { setPageSize(n); setPage(1) }}
              pagination={<Pagination page={pageClamped} pageCount={pageCount} onChange={setPage} />}
            />
          </ErrorBoundary>
        )}
      </SectionCard>

      {/* ---- Filters drawer (right-side overlay, per the prototype) ---- */}
      {drawer === 'filter' && (
        <FilterDrawer
          icon={SlidersHorizontal}
          title="Filters"
          subtitle="Refine the issue list"
          onClose={() => setDrawer('')}
          onApply={() => { setFlt(draft); setPage(1); setDrawer('') }}
          onReset={() => setDraft(EMPTY_FILTERS)}
          resetLabel={t('filterReset')}
          applyLabel={t('filterApply')}
        >
          <IssueFilterFields draft={draft} onDraftChange={setDraft} opts={opts} secOpen={secOpen} onToggleSection={onToggleFilterSection} />
        </FilterDrawer>
      )}

      {/* ---- Columns drawer (right-side overlay, per the prototype) ---- */}
      {drawer === 'cols' && (
        <ColumnDrawer
          icon={Columns3}
          title="Columns"
          subtitle="Show or hide columns in this list"
          onClose={() => setDrawer('')}
          defaultSectionLabel={t('columnsDefault')}
          defaultSectionColumns={[{ key: '_id', label: 'Issue ID', required: true }, { key: '_title', label: 'Issue Title', required: true }, ...DEFAULT_COLS.map((c) => ({ ...c, required: false }))]}
          optionalSectionLabel={t('columnsOptional')}
          optionalColumns={[...OPTIONAL_COLS]}
          selectAllLabel={t('columnsSelectAll')}
          requiredBadgeLabel={t('columnsRequired')}
          visible={colsDraft}
          onVisibleChange={setColsDraft}
          restoreDefaultLabel={t('columnsRestoreDefault')}
          onRestoreDefault={() => setColsDraft(DEFAULT_VISIBLE)}
          applyLabel={t('columnsApply')}
          onApply={() => { setCols(colsDraft); setDrawer('') }}
        />
      )}
      {linkedModalFor && (
        <LinkedIssuesModal open issueId={linkedModalFor} onClose={() => setLinkedModalFor(null)} />
      )}
    </PageContainer>
  )
}
