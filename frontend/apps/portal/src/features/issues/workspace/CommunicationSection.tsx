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
// Communication needs". The editor here is still the prototype's static toolbar
// over a plain <textarea> — no editor library is installed yet — so there is no
// weight to defer TODAY. The route boundary is what makes that deferral automatic
// when a real editor lands, which is the point of putting it here now.
//
// The Internal/External switch stays a ToggleGroup: it selects the KIND of
// message being composed, which is state, not a place.

export function CommunicationSection() {
  const { issueId, comments } = useWorkspace()
  const store = useStore()
  const { user } = useRole()
  const actor = { name: user.name, role: user.role }
  const onPost = (t: CommEntryType, b: string) => store.addComment(issueId, t, b, actor)
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
              disabled={!body.trim()}
              iconLeft={<Icon icon={Send} size={14} />}
              onClick={() => {
                // Attachment NAMES ride along on the body so the reference is not
                // lost — there is no file store to put the files themselves in,
                // and the composer says so before the user posts.
                const suffix = attachments.length ? `\n\nAttached: ${attachments.join(', ')}` : ''
                onPost(type, body.trim() + suffix)
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
              {c.body}
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
