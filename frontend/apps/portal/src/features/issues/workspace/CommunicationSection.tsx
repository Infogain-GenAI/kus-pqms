import { useState } from 'react'
import { Globe, Lock, Mail, Send, ShieldCheck } from 'lucide-react'
import { Badge, Button, CommentCard } from '@pqms/ui-library'
import { Icon } from '@pqms/ui-library'
import { SectionCard, ToggleGroup } from '@/app/chrome'
import { useRole } from '@/data/roles'
import { useStore } from '@/data/store'
import { fmtHM, fmtMDY } from '@/data/util'
import type { CommEntryType } from '@/data/types'
import { useWorkspace } from './context'
import { Composer } from './communication/Composer'

// Moved verbatim from IssueWorkspaceScreen.tsx's `CommunicationTab` (2026-08-27).
// Route path: /issues/:id/communication.
//
// WHY THIS SECTION IS THE ONE 12-performance-guidelines.md CARES ABOUT: 07's
// second reason for child routes is that each section gets its own lazy chunk,
// "so opening an issue does not download the markdown editor that only
// Communication needs".
//
// UPDATED 2026-08-30 — THE EDITOR NOW EXISTS. This note used to end "no editor
// library is installed yet — so there is no weight to defer TODAY". TipTap is
// installed, and 12 requires the boundary one level tighter than the route:
// the editor loads when this TAB opens, not when the workspace route does. See
// `communication/LazyMarkdownEditor.tsx`, which owns that boundary and the
// chunk-load failure case 12 attaches to it.
//
// The Internal/External switch stays a ToggleGroup: it selects the KIND of
// message being composed, which is state, not a place.

/**
 * A posted comment's body.
 *
 * ─── WHY THIS RENDERS HTML, AND WHY THAT IS SAFE HERE ────────────────────────
 *
 * Bodies written through the composer are HTML produced by TipTap. Its
 * extensions ARE ProseMirror schema definitions, and a schema constrains which
 * node and mark types can exist in the document AT ALL — so a `<script>`, an
 * `onerror` attribute or a `javascript:` href cannot be represented, let alone
 * serialised. The safety is structural, not an escape-on-render step. That is
 * the exact property `13-security-standards.md` attributes to TipTap.
 *
 * ⚠️ THE GUARANTEE IS ABOUT WHERE THE STRING CAME FROM, NOT ABOUT THIS FUNCTION.
 * It holds while every body originates from this editor or from the seed. The
 * day comment bodies arrive over HTTP — from another client, or a migration —
 * this needs a real sanitiser BEFORE it renders them, because a server will
 * happily return a string TipTap never produced. Do not read the comment above
 * as "HTML from anywhere is fine here".
 *
 * A body with no tags is seed or legacy plain text and is rendered as text, so
 * nothing pre-existing has to be migrated to display correctly.
 */
function CommentBody({ body }: { body: string }) {
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(body)
  if (!looksLikeHtml) return <>{body}</>
  return <div dangerouslySetInnerHTML={{ __html: body }} />
}

export function CommunicationSection() {
  const { issueId, comments } = useWorkspace()
  const store = useStore()
  const { user } = useRole()
  const actor = { name: user.name, role: user.role }
  const onPost = (t: CommEntryType, b: string) => store.addComment(issueId, t, b, actor)

  /**
   * The editor's value is an HTML document, so emptiness is NOT `!value.trim()`
   * — an untouched editor holds `<p></p>`, which is a non-empty string and would
   * leave Post enabled over a blank comment. Strip tags and non-breaking spaces
   * first, then test what is actually left.
   */
  const isBlank = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() === ''
  const [type, setType] = useState<CommEntryType>('Internal')
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  return (
    <SectionCard>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <ToggleGroup variant="dark" size="sm" options={[{ key: 'Internal', label: 'Internal' }, { key: 'External', label: 'External' }]} value={type} onChange={(k) => setType(k as CommEntryType)} />
        <span style={{ font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)' }}>
          {type === 'Internal' ? 'Visible only to internal PQMS users.' : 'Visible to external partners on this issue.'}
        </span>
      </div>
      <Composer
        value={body}
        onChange={setBody}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        placeholder="Write a message — use @ to notify a teammate…"
        onSubmitReady={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon icon={ShieldCheck} size={13} style={{ color: 'var(--text-muted)' }} />
            <span style={{ font: 'var(--fw-regular) var(--fs-caption)/1 var(--font-body)', color: 'var(--text-muted)' }}>Messages are immutable once posted.</span>
            <span style={{ flex: 1 }} />
            <Button
              disabled={isBlank(body)}
              iconLeft={<Icon icon={Send} size={14} />}
              onClick={() => {
                // Attachment NAMES ride along on the body so the reference is not
                // lost — there is no file store to put the files themselves in,
                // and the composer says so before the user posts.
                //
                // Appended as a PARAGRAPH, not `\n\n`: the body is an HTML
                // document now, and a newline inside HTML collapses to a space,
                // so the note would run straight on from the last sentence.
                const suffix = attachments.length
                  ? `<p><em>Attached: ${attachments.join(', ')}</em></p>`
                  : ''
                onPost(type, body + suffix)
                setBody('')
                setAttachments([])
              }}
            >
              Post
            </Button>
          </div>
        }
      />
      {comments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          {[...comments].reverse().map((c) => (
            <CommentCard key={c.id} author={c.author} role={c.authorRole} time={`${fmtMDY(c.createdAt)} ${fmtHM(c.createdAt)}`} internal={c.type === 'Internal'}>
              <CommentBody body={c.body} />
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
