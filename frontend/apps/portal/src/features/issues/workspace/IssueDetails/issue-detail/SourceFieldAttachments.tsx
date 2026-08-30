import { useRef, useState } from 'react'
import { Paperclip, X } from 'lucide-react'
import { Icon } from '@pqms/ui-library'
import { newId } from '@/data/util'
import { formatFileSize } from '@/shared/format/fileSize'
import type { SourceFieldAttachment } from '@/data/sourceChannels'
import styles from './SourceFieldAttachments.module.css'

/**
 * Attachment control for the two attachable source fields — Weibull's "Analysis
 * report reference" and FPQR's "Defect count in field".
 *
 * Ported from `SourceFieldAttachments.vue`.
 *
 * WHAT DIFFERS, AND WHY. The Vue component uploads to a real endpoint and holds
 * server-assigned document ids: a file is persisted the moment it uploads,
 * independently of the form's own Save. This app has no backend — the store is
 * an in-memory seed — so a picked file is recorded as `{id, fileName,
 * sizeBytes}` on the field and travels with the draft to Save, like every other
 * value in this form.
 *
 * That is a real behavioural difference and it is deliberate rather than
 * overlooked: faking an upload round trip against a store that cannot persist
 * one would produce an "attached" file that silently vanishes on reload. The
 * metadata shape is the same one Vue keeps, so wiring this to an endpoint later
 * changes where the id comes from and nothing else.
 *
 * `label` is the caller's, not this component's: the prototype gives each of the
 * two call sites its own button text rather than one generic string.
 */
export function SourceFieldAttachments({
  documents,
  label,
  disabled = false,
  onAdd,
  onRemove,
}: {
  documents: SourceFieldAttachment[]
  label: string
  disabled?: boolean
  onAdd: (added: SourceFieldAttachment[]) => void
  onRemove: (id: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const pick = (files: FileList | File[] | null) => {
    if (disabled || !files) return
    const list = Array.from(files)
    if (list.length === 0) return
    onAdd(list.map((f) => ({ id: newId('doc'), fileName: f.name, sizeBytes: f.size })))
  }

  const zoneClass = [styles.zone, dragActive && styles.zoneActive, disabled && styles.zoneDisabled]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.root}>
      {/*
        The drop target is not itself interactive, matching the Vue component's
        own reasoning: the browse button below is a real, keyboard-reachable
        control backing every drag-drop action, so drag and drop is an
        enhancement rather than the only path to the capability.
      */}
      <div
        className={zoneClass}
        data-testid="source-field-attachments-dropzone"
        data-drag-active={dragActive ? 'true' : 'false'}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); pick(e.dataTransfer?.files ?? null) }}
      >
        <button
          type="button"
          className={styles.browse}
          disabled={disabled}
          data-testid="source-field-attachments-browse"
          onClick={() => inputRef.current?.click()}
        >
          <Icon icon={Paperclip} size={15} />
          {label}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className={styles.input}
          disabled={disabled}
          aria-label={label}
          data-testid="source-field-attachments-input"
          onChange={(e) => {
            pick(e.target.files)
            // Reset so re-picking the same file fires `change` again.
            e.target.value = ''
          }}
        />
      </div>

      {documents.length > 0 && (
        <ul className={styles.files} data-testid="source-field-attachments-files">
          {documents.map((doc) => (
            <li key={doc.id} className={styles.file}>
              <span className={styles.name}>{doc.fileName}</span>
              <span className={styles.size}>{formatFileSize(doc.sizeBytes)}</span>
              <button
                type="button"
                className={styles.remove}
                disabled={disabled}
                aria-label={`Remove ${doc.fileName}`}
                onClick={() => onRemove(doc.id)}
              >
                <Icon icon={X} size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

