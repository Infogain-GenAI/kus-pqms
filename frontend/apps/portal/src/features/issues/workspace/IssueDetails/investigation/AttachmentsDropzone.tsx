import { useRef, useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { Icon } from '@pqms/ui-library'
import { FieldLabel } from './primitives'
import styles from './AttachmentsDropzone.module.css'

/**
 * Drag-and-drop + browse attachment picker, ported from `AttachmentsDropzone.vue`.
 *
 * WHAT THIS ADDS over the block it replaces: the previous Add-activity form drew
 * the dashed panel and the "Drag & drop, or browse" line, but nothing was
 * wired — there was no input, no drop handler, and no list. It looked like a
 * working control and was decoration. This one actually accepts files.
 *
 * NAMES ONLY, and that is deliberate. There is no upload endpoint here, so the
 * component records `File.name` and hands it to the store rather than holding a
 * `File` or minting an object URL. Vue keeps the file itself because it has a
 * real endpoint to post to; keeping one here would mean an "attached" file that
 * silently disappears on reload.
 *
 * The zone itself is not interactive — the browse button is a real,
 * keyboard-reachable control behind every drag action, so drag-and-drop is an
 * enhancement rather than the only path.
 */
export function AttachmentsDropzone({
  value,
  onChange,
  disabled = false,
  label = 'Attachments',
}: {
  value: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const add = (files: FileList | File[] | null) => {
    if (disabled || !files) return
    const names = Array.from(files).map((f) => f.name)
    if (names.length === 0) return
    // Deduped: re-picking the same file is a slip, not an instruction to list it twice.
    onChange([...new Set([...value, ...names])])
  }

  const zoneClass = [styles.zone, dragActive && styles.zoneActive, disabled && styles.zoneDisabled]
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      <FieldLabel text={label} optional="— optional" />
      <div
        className={zoneClass}
        data-testid="attachments-dropzone"
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); add(e.dataTransfer?.files ?? null) }}
      >
        <Icon icon={UploadCloud} size={20} className={styles.icon} />
        <div className={styles.hint}>
          Drag &amp; drop, or{' '}
          <button type="button" className={styles.browse} disabled={disabled} onClick={() => inputRef.current?.click()}>
            browse
          </button>
          <span className={styles.constraints}>PDF/CSV/JPEG/PNG · ≤25 MB · ≤10 files</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className={styles.input}
          disabled={disabled}
          aria-label={label}
          onChange={(e) => { add(e.target.files); e.target.value = '' }}
        />
      </div>

      {value.length > 0 && (
        <ul className={styles.files}>
          {value.map((name) => (
            <li key={name} className={styles.file}>
              <span className={styles.fileName}>{name}</span>
              <button
                type="button"
                className={styles.remove}
                disabled={disabled}
                aria-label={`Remove attachment ${name}`}
                onClick={() => onChange(value.filter((n) => n !== name))}
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
