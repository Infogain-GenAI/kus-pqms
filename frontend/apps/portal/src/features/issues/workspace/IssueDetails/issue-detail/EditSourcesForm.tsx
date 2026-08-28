import { forwardRef, useImperativeHandle, useState } from 'react'
import { Check } from 'lucide-react'
import { Icon, Input, Select, SOURCE, SOURCE_KEYS, Textarea, type SourceKey } from '@pqms/ui-library'
import {
  SOURCE_ATTACH_LABEL,
  SOURCE_CHANNEL_CODES,
  SOURCE_CHANNEL_DESCRIPTOR,
  SOURCE_CHANNEL_PANEL_HEADING,
  blankChannel,
  type SourceChannel,
  type SourceChannelField,
} from '@/data/sourceChannels'
import { SourceFieldAttachments } from './SourceFieldAttachments'
import styles from './EditSourcesForm.module.css'

/**
 * The in-place editor for a issue's source channels — a channel picker plus one
 * evidence panel per selected channel.
 *
 * Ported from `EditSourcesForm.vue`. It renders inside the Issue source section
 * (and, in the full-page edit form, inside that form), so it owns no overlay, no
 * focus trap and no dismissal of its own: Cancel and Save belong to whichever
 * surface mounts it.
 *
 * TWO THINGS THE PARENT DRIVES, VIA THE REF — same contract as Vue's
 * `defineExpose({ getDraft, validate })`:
 *   - `validate()` marks every empty required field on the currently selected
 *     channels and returns false, leaving "Required." showing beneath each. The
 *     parent must call it BEFORE reading the draft, or a blank required field
 *     saves silently.
 *   - `getDraft()` returns the working copy. There is no onChange firehose:
 *     the parent commits on Save and discards by unmounting, so intermediate
 *     keystrokes never leave this component.
 *
 * PANELS RENDER IN CHANNEL ORDER, NOT SELECTION ORDER, so adding a channel
 * never reshuffles the panels already on screen.
 */

export interface EditSourcesHandle {
  getDraft: () => SourceChannel[]
  validate: () => boolean
}

export const EditSourcesForm = forwardRef<EditSourcesHandle, {
  channels: SourceChannel[]
  disabled?: boolean
}>(function EditSourcesForm({ channels, disabled = false }, ref) {
  // Working copy — deep enough that editing a field never writes through to the
  // committed channels the parent still holds.
  const [draft, setDraft] = useState<SourceChannel[]>(() =>
    channels.map((c) => ({ channel: c.channel, fields: c.fields.map((f) => ({ ...f })) })),
  )
  /**
   * Set only once a save has been attempted, so an untouched form never shows
   * errors on first render. Validity is then derived from the field's own value,
   * so fixing a field clears its message immediately with no per-field clearing.
   */
  const [attempted, setAttempted] = useState(false)

  const isSelected = (k: SourceKey) => draft.some((c) => c.channel === k)
  const isInvalid = (f: SourceChannelField) => attempted && f.required && f.value.trim() === ''

  useImperativeHandle(ref, () => ({
    getDraft: () => draft,
    validate: () => {
      setAttempted(true)
      return draft.every((c) => c.fields.every((f) => !(f.required && f.value.trim() === '')))
    },
  }), [draft])

  const toggleChannel = (k: SourceKey) => {
    if (disabled) return
    setDraft((d) => (d.some((c) => c.channel === k) ? d.filter((c) => c.channel !== k) : [...d, blankChannel(k)]))
  }

  const setField = (channel: SourceKey, label: string, value: string) => {
    setDraft((d) =>
      d.map((c) =>
        c.channel === channel ? { ...c, fields: c.fields.map((f) => (f.label === label ? { ...f, value } : f)) } : c,
      ),
    )
  }

  const setAttachments = (channel: SourceKey, label: string, next: SourceChannelField['attachments']) => {
    setDraft((d) =>
      d.map((c) =>
        c.channel === channel ? { ...c, fields: c.fields.map((f) => (f.label === label ? { ...f, attachments: next } : f)) } : c,
      ),
    )
  }

  const panels = SOURCE_KEYS.map((k) => draft.find((c) => c.channel === k)).filter((c): c is SourceChannel => c != null)

  return (
    <div className={styles.root} data-testid="edit-sources-form">
      <fieldset className={styles.tiles} disabled={disabled}>
        <legend className={styles.legend}>Source channels</legend>
        {SOURCE_KEYS.map((k) => {
          const selected = isSelected(k)
          return (
            <button
              key={k}
              type="button"
              className={selected ? `${styles.tile} ${styles.tileSelected}` : styles.tile}
              aria-pressed={selected}
              data-testid="source-channel-tile"
              data-channel={k}
              data-selected={selected}
              onClick={() => toggleChannel(k)}
            >
              <span className={styles.tileIcon} aria-hidden>
                <Icon icon={SOURCE[k].icon} size={17} />
              </span>
              <span className={styles.tileText}>
                <span className={styles.tileName}>{SOURCE[k].label}</span>
                <span className={styles.tileDesc}>{SOURCE_CHANNEL_DESCRIPTOR[k]}</span>
              </span>
              <span className={styles.tileCheck} aria-hidden>
                {selected && <Icon icon={Check} size={15} strokeWidth={4} />}
              </span>
            </button>
          )
        })}
      </fieldset>

      {panels.length === 0 ? (
        <p className={styles.empty} data-testid="edit-sources-empty">
          Select a source above to reveal channel-specific fields.
        </p>
      ) : (
        panels.map((panel) => {
          const code = SOURCE_CHANNEL_CODES[panel.channel]
          return (
            <div key={panel.channel} className={styles.panel} data-testid="source-evidence-panel" data-channel={panel.channel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelHeadingGroup}>
                  <span className={styles.panelIcon} aria-hidden>
                    <Icon icon={SOURCE[panel.channel].icon} size={13} />
                  </span>
                  <h4 className={styles.panelTitle}>{SOURCE_CHANNEL_PANEL_HEADING[panel.channel]}</h4>
                </span>
                {code && <span className={styles.panelCode}>{code}</span>}
              </div>

              <div className={styles.fields}>
                {panel.fields.map((field) => {
                  const invalid = isInvalid(field)
                  const locked = disabled || field.readOnly
                  const onValue = (v: string) => setField(panel.channel, field.label, v)
                  return (
                    <div
                      key={field.label}
                      className={field.type === 'textarea' ? `${styles.field} ${styles.fieldFull}` : styles.field}
                      data-testid="source-field"
                      data-field={field.label}
                    >
                      <span className={styles.fieldLabel}>
                        {field.label}
                        {field.required ? (
                          <span className={styles.fieldRequired} aria-hidden> *</span>
                        ) : (
                          <span className={styles.fieldMeta}> {field.metaSuffix ?? '· optional'}</span>
                        )}
                      </span>

                      {field.type === 'text' && (
                        <Input
                          value={field.value}
                          placeholder={field.placeholder}
                          aria-label={field.label}
                          required={field.required}
                          disabled={locked}
                          error={invalid ? 'Required.' : undefined}
                          onChange={(e) => onValue(e.target.value)}
                        />
                      )}

                      {field.type === 'textarea' && (
                        <Textarea
                          rows={3}
                          value={field.value}
                          placeholder={field.placeholder}
                          aria-label={field.label}
                          required={field.required}
                          disabled={locked}
                          error={invalid ? 'Required.' : undefined}
                          onChange={(e) => onValue(e.target.value)}
                        />
                      )}

                      {field.type === 'select' && (
                        <Select
                          value={field.value}
                          options={field.options ?? []}
                          placeholder={field.placeholder}
                          aria-label={field.label}
                          disabled={locked}
                          error={invalid ? 'Required.' : undefined}
                          onChange={(e) => onValue(e.target.value)}
                        />
                      )}

                      {field.type === 'date' && (
                        <>
                          <input
                            type="date"
                            className={invalid ? `${styles.dateInput} ${styles.dateInputError}` : styles.dateInput}
                            value={field.value}
                            aria-label={field.label}
                            required={field.required}
                            disabled={locked}
                            onChange={(e) => onValue(e.target.value)}
                          />
                          {/* The native date input has no error slot of its own. */}
                          {invalid && <p className={styles.fieldError}>Required.</p>}
                        </>
                      )}

                      {field.attachable && (
                        <SourceFieldAttachments
                          documents={field.attachments ?? []}
                          label={SOURCE_ATTACH_LABEL[panel.channel] ?? 'Attach file'}
                          disabled={disabled}
                          onAdd={(added) => setAttachments(panel.channel, field.label, [...(field.attachments ?? []), ...added])}
                          onRemove={(id) => setAttachments(panel.channel, field.label, (field.attachments ?? []).filter((d) => d.id !== id))}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
})
