import { useMemo, useState } from 'react'
import { Link2, Link2Off, Search } from 'lucide-react'
import { Button, SearchField, StatusBadge } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { CardHead, SectionCard } from '@/app/chrome'
import { useStore } from '@/data/store'
import { IssueExistingPreviewModal } from './IssueExistingPreviewModal'
import { LinkJustifyBox, applyJustification } from './linking/LinkJustifyBox'

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
  /**
   * Both callbacks now carry the audited justification the change was made with.
   * The section captures it inline and does not call through until it is valid,
   * so a caller cannot receive an unjustified mutation.
   */
  onLink: (id: string, justification: string) => void
  onUnlink: (id: string, justification: string) => void
  /** The issue currently being created/edited — never offer to link it to itself. */
  excludeId?: string
}) {
  const { issues, getIssue } = useStore()
  const [query, setQuery] = useState('')
  /** The issue open in the preview modal, by id. Null when closed. */
  const [previewId, setPreviewId] = useState<string | null>(null)
  /**
   * The one change awaiting its justification, or null.
   *
   * ⚠️ SINGLE, NOT A MAP. This surface commits immediately per action, so there
   * is never more than one pending change — unlike the two draft/commit modals,
   * which hold a pending justification per row. Starting a second change
   * REPLACES the first rather than queuing it, and the abandoned text is
   * discarded: a half-typed reason for a change the user walked away from must
   * not be able to attach itself to the next one.
   */
  const [pending, setPending] = useState<{ id: string; kind: 'link' | 'unlink'; text: string; err: string } | null>(null)
  const start = (id: string, kind: 'link' | 'unlink') => setPending({ id, kind, text: '', err: '' })
  const applyPending = () => {
    if (!pending) return
    const err = applyJustification(pending.text)
    if (err) { setPending({ ...pending, err }); return }
    const why = pending.text.trim()
    if (pending.kind === 'link') { onLink(pending.id, why); setQuery('') } else { onUnlink(pending.id, why) }
    setPending(null)
  }
  const justifyFor = (id: string, kind: 'link' | 'unlink') =>
    pending && pending.id === id && pending.kind === kind ? (
      <LinkJustifyBox
        text={pending.text}
        error={pending.err}
        onText={(next) => setPending({ ...pending, text: next, err: '' })}
        onApply={applyPending}
        onCancel={() => setPending(null)}
        applyLabel={kind === 'link' ? 'Confirm link' : 'Confirm unlink'}
        label={`Justification for ${kind === 'link' ? 'linking' : 'unlinking'} ${id}`}
        inputLabel={`Justification for ${kind === 'link' ? 'linking' : 'unlinking'} ${id}`}
      />
    ) : null

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
              <div key={i.id} style={{ borderTop: ix === 0 ? 'none' : 'var(--border-width) solid var(--border-subtle)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
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
                <Button variant="secondary" size="sm" iconLeft={<Icon icon={Link2} size={13} />} onClick={() => start(i.id, 'link')}>
                  Link
                </Button>
              </div>
              <div style={{ padding: '0 var(--space-3) var(--space-3)' }}>{justifyFor(i.id, 'link')}</div>
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
                  background: 'var(--selected-bg)',
                  border: 'var(--border-width) solid var(--accent-100)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3)',
                }}
              >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
                <Button variant="ghost" size="sm" iconLeft={<Icon icon={Link2Off} size={13} />} onClick={() => start(id, 'unlink')}>
                  Unlink
                </Button>
              </div>
              {justifyFor(id, 'unlink')}
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
        /* Closes the modal and starts the SAME inline flow the rows use, so the
           popup cannot commit a link the row buttons would have gated. */
        onLink={(id) => { setPreviewId(null); start(id, 'link') }}
        onUnlink={(id) => { setPreviewId(null); start(id, 'unlink') }}
      />
    </SectionCard>
  )
}
