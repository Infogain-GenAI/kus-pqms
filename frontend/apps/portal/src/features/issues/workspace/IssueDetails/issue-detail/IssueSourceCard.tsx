import { Suspense, lazy, useRef, useState } from 'react'
import { Check, ChevronDown, ChevronUp, FileText, PenSquare, Radio } from 'lucide-react'
import { Button, Icon, SOURCE, Spinner } from '@pqms/ui-library'
import { MetaChip, ULabel } from '@/app/chrome'
import type { SourceChannel } from '@/data/sourceChannels'
import type { Issue } from '@/data/types'
import { IssueDetailSection } from './IssueDetailSection'
import type { EditSourcesHandle } from './EditSourcesForm'
import fieldStyles from './fields.module.css'
import styles from './IssueSourceCard.module.css'

/**
 * Code-split for the same reason the full-page edit form is: the sources EDITOR
 * — seven channel tiles, forty-odd typed fields and the attachment control — is
 * never touched by a reader, and this card sits on the default section of the
 * workspace, so its cost is paid on every visit. The type import above is
 * erased at build time, so the handle stays typed without pulling the module in.
 */
const EditSourcesForm = lazy(() =>
  import('./EditSourcesForm').then((m) => ({ default: m.EditSourcesForm })),
)

/**
 * The Issue source section: a per-channel read view, and an in-place editor.
 *
 * Ported from `IssueSourceCard.vue`.
 *
 * EDIT MODE EXPANDS IN PLACE — there is no modal, so `editing` is a plain mode
 * flag rather than an overlay's open state, and Cancel simply unmounts the form,
 * which discards its draft. Save validates first: a blank required field leaves
 * the form open with "Required." showing rather than committing silently.
 *
 * CHANNELS START EXPANDED. Only COLLAPSED keys are tracked, so a channel added
 * later is expanded by default instead of inheriting a stale collapsed state
 * from a set it was never in.
 *
 * BLANK FIELDS ARE HIDDEN IN THE READ VIEW. A sparse channel — one where only
 * two of six fields were ever captured, or one of the three deliberately-blank
 * system-populated fields — renders as a short card rather than a full-size one
 * full of empty cells. The Vue file is explicit that no prototype code path does
 * this: it is a considered fix for real data, applied uniformly with no
 * special-casing, and a read-only field hides exactly like any other when blank.
 */
export function IssueSourceCard({
  issue,
  channels,
  canEdit,
  onSave,
}: {
  issue: Issue
  channels: SourceChannel[]
  canEdit: boolean
  onSave: (channels: SourceChannel[]) => void
}) {
  const [editing, setEditing] = useState(false)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const formRef = useRef<EditSourcesHandle>(null)

  const toggle = (channel: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(channel)) next.delete(channel)
      else next.add(channel)
      return next
    })

  const save = () => {
    if (!canEdit) return
    if (formRef.current?.validate() === false) return
    const draft = formRef.current?.getDraft()
    if (draft) onSave(draft)
    setEditing(false)
  }

  const action = editing ? (
    <>
      <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
      <Button size="sm" disabled={!canEdit} iconLeft={<Icon icon={Check} size={14} />} onClick={save}>
        Save sources
      </Button>
    </>
  ) : (
    <Button
      variant="secondary"
      size="sm"
      disabled={!canEdit}
      iconLeft={<Icon icon={PenSquare} size={14} />}
      onClick={() => setEditing(true)}
    >
      Add / edit sources
    </Button>
  )

  return (
    <IssueDetailSection
      name="issue-source"
      title="Issue source"
      subtitle="Origin signals for this issue — add or edit source channels and evidence"
      icon={Radio}
      action={action}
    >
      {editing ? (
        <Suspense fallback={<Spinner />}>
          <EditSourcesForm ref={formRef} channels={channels} disabled={!canEdit} />
        </Suspense>
      ) : channels.length === 0 ? (
        // Retained from the card this replaces — it names the primary channel
        // and puts the call to action inline, which the Vue empty state does not.
        //
        // ⚠️ TWO DIFFERENT EMPTY STATES REACH THIS BRANCH, and conflating them
        // is what made it crash. An issue can have zero channels because its
        // source is known but carries no evidence rows, OR because it has no
        // source at all — the latter is now normal, since Issue Entry does not
        // capture one and the design attributes origin later. `SOURCE[undefined]`
        // is `undefined`, so reading `.icon` off it threw; and the route in is
        // exactly `resolveSourceChannels` degrading a sourceless issue to zero
        // channels, which is why "it does not throw" was never sufficient.
        <div className={styles.emptyRow}>
          {issue.source ? (
            <MetaChip icon={SOURCE[issue.source].icon}>{SOURCE[issue.source].label}</MetaChip>
          ) : (
            <MetaChip icon={FileText}>No source assigned</MetaChip>
          )}
          <span className={styles.empty}>
            No source channels recorded for this issue yet. Select{' '}
            <b className={styles.emptyCta}>Add / edit sources</b> to capture where it originated.
          </span>
        </div>
      ) : (
        <div className={styles.list} data-testid="issue-source-list">
          {channels.map((ch) => {
            const open = !collapsed.has(ch.channel)
            const visible = ch.fields.filter((f) => f.value.trim().length > 0)
            return (
              <div key={ch.channel} className={styles.channel}>
                <button
                  type="button"
                  className={styles.channelHeader}
                  aria-expanded={open}
                  data-testid="issue-source-channel-toggle"
                  onClick={() => toggle(ch.channel)}
                >
                  <span className={styles.channelNameGroup}>
                    <span className={styles.channelIcon} aria-hidden>
                      <Icon icon={SOURCE[ch.channel].icon} size={15} />
                    </span>
                    <span className={styles.channelName} data-testid="issue-source-channel-name">
                      {SOURCE[ch.channel].label}
                    </span>
                  </span>
                  <Icon icon={open ? ChevronUp : ChevronDown} size={18} className={styles.chevron} />
                </button>

                {open && (
                  <div className={styles.channelBody} data-testid="issue-source-channel-fields">
                    {visible.length === 0 ? (
                      <p className={styles.channelEmpty}>No evidence captured for this channel yet.</p>
                    ) : (
                      <div className={fieldStyles.grid4}>
                        {visible.map((f) => (
                          <div key={f.label}>
                            <ULabel>{f.label}</ULabel>
                            <div className={fieldStyles.value}>{f.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </IssueDetailSection>
  )
}
