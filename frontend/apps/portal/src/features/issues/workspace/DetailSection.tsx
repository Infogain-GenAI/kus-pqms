import { Suspense, lazy, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'lucide-react'
import { Button, Icon, Spinner, StatusBadge } from '@pqms/ui-library'
import { SectionCard, ULabel } from '@/app/chrome'
import { useRole } from '@/data/roles'
import { resolveSourceChannels, type SourceChannel } from '@/data/sourceChannels'
import { useStore } from '@/data/store'
import { ExistingIssueModal } from '../ExistingIssueModal'
import { NS as EXISTING_NS } from '../ExistingIssueModal.i18n'
import { NS as JUSTIFY_NS } from '../linking/LinkJustify.i18n'
import { useTranslation } from 'react-i18next'
import { LinkJustifyBox, applyJustification } from '../linking/LinkJustifyBox'
import { IssueDetailTab } from './IssueDetails/tabs/IssueDetailTab/IssueDetailTab'
import { useWorkspace } from './context'
import styles from './DetailSection.module.css'

// Route target for /issues/:id/detail.
//
// WHAT THIS FILE IS NOW. It was the whole tab — four cards and a rail, inline.
// The cards moved to IssueDetails/, ported from the Vue implementation, and this
// file kept the two things that are genuinely the section's own: the right rail,
// and the choice between read mode and the full-page edit form.
//
// EDIT IS A MODE HERE, NOT A MODAL. `openModal('edit')` used to raise a
// three-field dialog; the form is now five sections and replaces the tab body,
// with the rail suppressed while it is open. The shell's "Edit issue" button
// still drives it — see IssueWorkspaceScreen, which routes that click here
// instead of to the modal.
//
// THE EDIT FORM IS CODE-SPLIT, and that is not premature. It pulls in the model-
// code picker, the link search and the whole source-channel editor — a large
// subtree that READING an issue never touches, and most visits to this section
// only read. Loading it eagerly measurably slowed the section's cold load: the
// workspace characterisation test, which waits 1s for first paint, began timing
// out at 1121ms the moment this file imported the form directly. Splitting it
// put that back under the threshold, so the number below is a real budget rather
// than a guess.
const IssueEditForm = lazy(() =>
  import('./IssueDetails/IssueEditForm/IssueEditForm').then((m) => ({ default: m.IssueEditForm })),
)

export function DetailSection() {
  const { issue, canEditIssue: canEdit, lock, openModal, editing, onEditingChange } = useWorkspace()
  const nav = useNavigate()
  const store = useStore()
  const { user } = useRole()
  const actor = { name: user.name, role: user.role }
  const linked = issue.linkedIssueIds ?? []
  /** The linked issue open in the popup, by id. Null when closed. */
  const [inspecting, setInspecting] = useState<string | null>(null)

  /**
   * Derived, not stored: an issue that has never been through the sources form
   * has no `sourceChannels`, so this folds its `source`/`sources`/`sourceEvidence`
   * into the channel shape. Every issue in the seed renders through this path.
   */
  const channels = useMemo(() => resolveSourceChannels(issue), [issue])

  const saveChannels = (next: SourceChannel[]) => {
    store.updateIssue(
      issue.id,
      { sourceChannels: next, sources: next.map((c) => c.channel), source: next[0]?.channel ?? issue.source },
      actor,
    )
  }

  if (editing) {
    return (
      <div className={styles.layoutEditing}>
        <Suspense
          fallback={
            <SectionCard>
              <Spinner />
            </SectionCard>
          }
        >
          <IssueEditForm
            issue={issue}
            channels={channels}
            disabled={!canEdit}
            onCancel={() => onEditingChange(false)}
            onSave={(payload) => {
              store.updateIssue(
                issue.id,
                {
                  title: payload.title,
                  description: payload.description,
                  dtcCodes: payload.dtcCodes.length ? payload.dtcCodes : undefined,
                  modelCodes: payload.modelCodes,
                  modelYear: payload.modelYear,
                  system: payload.system,
                  subSystem: payload.subSystem,
                  component: payload.component,
                  symptom: payload.symptom,
                  sourceChannels: payload.channels,
                  sources: payload.channels.map((c) => c.channel),
                  source: payload.channels[0]?.channel ?? issue.source,
                },
                actor,
              )
              onEditingChange(false)
            }}
          />
        </Suspense>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <IssueDetailTab issue={issue} channels={channels} canEdit={canEdit} onSaveSources={saveChannels} />

      {/* Right rail — this app's own, kept as-is. Vue's Issue Detail tab has no
          equivalent, and it is the only view showing linked issues with their
          titles and statuses. */}
      <SectionCard>
        <div className={styles.railHead}>
          <ULabel style={{ marginBottom: 0 }}>Related linked issue</ULabel>
          <span className={styles.count}>{linked.length}</span>
        </div>
        {/* Linking is a mutating control, so it takes the lock — Vue gates the
            equivalent panel action the same way. It is NOT covered by `canEdit`
            above: that gate is about the edit FORM, and this button sits outside
            it in the rail, reachable without entering edit mode. */}
        <button className={styles.manage} disabled={!lock.isEditable} onClick={() => openModal('links')}>
          Manage Related Issues
        </button>
        {linked.length === 0 ? (
          <div className={styles.railEmpty}>
            <Icon icon={Link} size={14} /> No related issues linked
          </div>
        ) : (
          <div className={styles.railList}>
            {linked.map((lid) => {
              const li = store.getIssue(lid)
              return (
                /*
                  ⚠️ OPENS THE POPUP; IT USED TO NAVIGATE AWAY.
                  Leaving the workspace to look at a linked issue loses whatever
                  the user had open — the same reason Issue Entry's preview is a
                  modal. `ExistingIssueModal` is the design's `wsExistingModal`,
                  and "View Issue" inside it still offers the navigation for
                  anyone who actually wants it.
                */
                <button
                  key={lid}
                  className={styles.railItem}
                  /*
                   * ⚠️ FALLS BACK TO NAVIGATION FOR AN UNRESOLVABLE ID, and that
                   * is not defensive padding — EVERY `linkedIssueIds` entry in
                   * the current seed names an issue that is not seeded. The
                   * popup renders nothing for a null issue, so opening it
                   * unconditionally turned every row in this rail into a DEAD
                   * CLICK. Navigating at least reaches the not-found screen,
                   * which tells the user the record is gone — the behaviour this
                   * row had before the popup existed.
                   */
                  onClick={() => (li ? setInspecting(lid) : nav(`/issues/${lid}`))}
                >
                  <span className={styles.railId}>{lid}</span>
                  {li && <span className={styles.railTitle}>{li.title}</span>}
                  {li && <StatusBadge status={li.status} size="sm" />}
                </button>
              )
            })}
          </div>
        )}
      </SectionCard>

      {/*
        ⚠️ THIS IS WHAT `unlinkSlot` WAS BUILT FOR, and until now nothing passed
        it. On Issue Entry unlink is immediate: the issue does not exist yet, so
        removing a link discards a draft decision with nothing to audit. HERE it
        undoes a recorded relationship between two live issues, so it is gated
        behind a mandatory justification — the asymmetry the modal's own header
        documents.
      */}
      <ExistingIssueModal
        issue={inspecting ? (store.getIssue(inspecting) ?? null) : null}
        linked={!!inspecting && linked.includes(inspecting)}
        onClose={() => setInspecting(null)}
        // Already linked whenever it is reachable from this list, so linking is
        // not an action this surface offers.
        onLink={() => {}}
        onUnlink={() => {}}
        onOpenIssue={(id) => nav(`/issues/${id}`)}
        unlinkSlot={
          inspecting ? (
            <WorkspaceUnlinkSlot
              onConfirm={(why) => {
                store.unlinkIssue(issue.id, inspecting, why, actor)
                setInspecting(null)
              }}
            />
          ) : undefined
        }
      />
    </div>
  )
}

/**
 * The workspace's gated unlink, rendered in `ExistingIssueModal`'s footer slot.
 *
 * Two states rather than a modal-on-a-modal: the button reveals the justification
 * box in place, which is the design's shape ("shown inline, no secondary modal").
 * Reuses `LinkJustifyBox` — the same control the draft/commit surfaces use, in
 * immediate mode, exactly as `LinkIssuesSection` already uses it.
 */
function WorkspaceUnlinkSlot({ onConfirm }: { onConfirm: (justification: string) => void }) {
  // REUSES `ExistingIssueModal`'s own `unlink` key rather than declaring a
  // second one with identical English — this control sits in that modal's footer
  // and names the same action.
  const { t } = useTranslation(EXISTING_NS)
  const { t: tj } = useTranslation(JUSTIFY_NS)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [err, setErr] = useState('')

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => { setOpen(true); setText(''); setErr('') }}>
        {t('unlink')}
      </Button>
    )
  }
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <LinkJustifyBox
        text={text}
        error={err}
        onText={(next) => { setText(next); setErr('') }}
        onApply={() => {
          const problem = applyJustification(text)
          if (problem) { setErr(problem); return }
          onConfirm(text.trim())
        }}
        onCancel={() => setOpen(false)}
        applyLabel={tj('confirmUnlink')}
        label="Justification for unlinking"
        inputLabel="Justification for unlinking"
      />
    </div>
  )
}
