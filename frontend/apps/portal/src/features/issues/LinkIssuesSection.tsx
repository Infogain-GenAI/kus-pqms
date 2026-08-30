import { useMemo, useState } from 'react'
import { Link2, Link2Off, Search } from 'lucide-react'
import { Button, SearchField, StatusBadge } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { CardHead, SectionCard } from '@/app/chrome'
import { useStore } from '@/data/store'
import { IssueExistingPreviewModal } from './IssueExistingPreviewModal'

/**
 * Search & link issue — the V4-V5 Issue Entry linking section, also reused by Issue
 * Detail's in-tab edit mode.
 *
 * Linking is idempotent (`linkExisting` in the prototype is a no-op when already linked),
 * so a repeat click cannot produce a duplicate. Results exclude both the issue being
 * edited and anything already linked, because offering an action that would do nothing is
 * worse than not offering it.
 */
export function LinkIssuesSection({
  linkedIds,
  onLink,
  onUnlink,
  excludeId,
}: {
  linkedIds: string[]
  onLink: (id: string) => void
  onUnlink: (id: string) => void
  /** The issue currently being created/edited — never offer to link it to itself. */
  excludeId?: string
}) {
  const { issues, getIssue } = useStore()
  const [query, setQuery] = useState('')
  /** The issue open in the preview modal, by id. Null when closed. */
  const [previewId, setPreviewId] = useState<string | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return issues
      .filter((i) => i.id !== excludeId && !linkedIds.includes(i.id))
      .filter((i) => `${i.id} ${i.title} ${i.model} ${i.symptom ?? ''}`.toLowerCase().includes(q))
      .slice(0, 8)
  }, [issues, query, linkedIds, excludeId])

  const linked = linkedIds.map((id) => ({ id, issue: getIssue(id) }))

  return (
    <SectionCard>
      <CardHead
        icon={Link2}
        title="Search &amp; link issue"
        subtitle="Link a related issue so investigation and resolution stay connected."
        right={
          linkedIds.length > 0 ? (
            <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-secondary)' }}>
              {linkedIds.length} linked
            </span>
          ) : undefined
        }
      />

      <SearchField
        aria-label="Search issues to link"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by issue ID, title, model or symptom…"
      />

      {/* Results — only while searching. */}
      {query.trim().length > 0 && (
        <div
          style={{
            marginTop: 'var(--space-2)',
            border: 'var(--border-width) solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {results.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', color: 'var(--text-muted)', fontSize: 'var(--fs-body-sm)' }}>
              <Icon icon={Search} size={14} />
              No unlinked issue matches “{query.trim()}”.
            </div>
          ) : (
            results.map((i, ix) => (
              <div
                key={i.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  borderTop: ix === 0 ? 'none' : 'var(--border-width) solid var(--border-subtle)',
                }}
              >
                <span className="ism-mono" style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, flex: 'none' }}>{i.id}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 'var(--fs-body-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {i.title}
                </span>
                <StatusBadge status={i.status} size="sm" />
                {/* Preview before committing. This section is rendered inside
                    Issue Entry AND inside the workspace's edit form, both of
                    which hold unsaved state — so the preview is a modal here for
                    the same reason it is one there. */}
                <Button variant="link" size="sm" data-testid={`link-preview-${i.id}`} onClick={() => setPreviewId(i.id)}>
                  Preview
                </Button>
                <Button variant="secondary" size="sm" iconLeft={<Icon icon={Link2} size={13} />} onClick={() => { onLink(i.id); setQuery('') }}>
                  Link
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Linked list */}
      {linked.length > 0 && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {linked.map(({ id, issue }) => (
              <div
                key={id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  background: 'var(--selected-bg)',
                  border: 'var(--border-width) solid var(--accent-100)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <span className="ism-mono" style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, flex: 'none' }}>{id}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 'var(--fs-body-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {/* A linked id can outlive its issue in mock data — say so rather than render blank. */}
                  {issue ? issue.title : <em style={{ color: 'var(--text-muted)' }}>Issue not found</em>}
                </span>
                {issue && <StatusBadge status={issue.status} size="sm" />}
                {/* Only when the issue still resolves — there is nothing to
                    preview for an id whose record has gone. */}
                {issue && (
                  <Button variant="link" size="sm" data-testid={`link-preview-${id}`} onClick={() => setPreviewId(id)}>
                    Preview
                  </Button>
                )}
                <Button variant="ghost" size="sm" iconLeft={<Icon icon={Link2Off} size={13} />} onClick={() => onUnlink(id)}>
                  Unlink
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {linked.length === 0 && query.trim().length === 0 && (
        <p style={{ margin: 'var(--space-3) 0 0', fontSize: 'var(--fs-body-sm)', color: 'var(--text-muted)' }}>
          No issues linked yet.
        </p>
      )}

      {/*
        Link and Unlink from inside the modal call the SAME `onLink`/`onUnlink`
        this section was given, so the modal and the row buttons cannot end up
        disagreeing about what is linked.
      */}
      <IssueExistingPreviewModal
        issue={previewId ? (getIssue(previewId) ?? null) : null}
        linked={!!previewId && linkedIds.includes(previewId)}
        onClose={() => setPreviewId(null)}
        onLink={(id) => { onLink(id); setQuery('') }}
        onUnlink={onUnlink}
      />
    </SectionCard>
  )
}
