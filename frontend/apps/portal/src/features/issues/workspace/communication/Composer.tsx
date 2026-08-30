import { useMemo, useRef, useState } from 'react'
import { Paperclip, TriangleAlert, X } from 'lucide-react'
import { Icon } from '@pqms/ui-library'
import { TEAM_DIRECTORY } from '@/data/investigation'
import { LazyMarkdownEditor } from './LazyMarkdownEditor'
import styles from './composer.module.css'

/**
 * The comment composer: a real rich-text editor, @mention autocomplete and
 * staged attachments.
 *
 * ─── THE EDITOR NOW ACTUALLY FORMATS ─────────────────────────────────────────
 *
 * Two versions preceded this and both were wrong in different ways.
 *
 * First: a plain `<textarea>` under a row of `<span>`s holding icons. The
 * toolbar was DECORATION — not buttons, no handlers, not keyboard reachable.
 *
 * Then: the same textarea, but the buttons wrapped the selection in markdown
 * (`**bold**`). Honest, and better than nothing, but the text never RENDERED —
 * pressing Bold produced asterisks, not bold text, and the posted comment showed
 * the asterisks too. Formatting you can only read as source is not formatting.
 *
 * Now: TipTap, so Bold produces bold, and ordered and unordered lists produce
 * real `<ol>` and `<ul>` with correct markers and indentation. The toolbar also
 * reports what the caret is INSIDE — a user can see bold is on without typing a
 * character to find out.
 *
 * ─── THE MENTION MENU STAYS ON A SEPARATE INPUT, DELIBERATELY ────────────────
 *
 * TipTap has a first-party Mention extension. It is NOT used here, because it
 * stores mentions as schema nodes — which changes what a comment IS, and this
 * app stores comments as a plain body string that the notification code scans
 * with a regex. Adopting mention nodes would mean migrating that, and doing it
 * as a side effect of "make bold work" is the wrong shape of change.
 *
 * So mentions are inserted as plain text into the editor, exactly as the regex
 * expects. When the comment model gains structure, the extension is the right
 * answer and this note is the pointer to it.
 */
export function Composer({
  value,
  onChange,
  attachments,
  onAttachmentsChange,
  onSubmitReady,
  placeholder,
  disabled = false,
}: {
  /** HTML from the editor. Stored verbatim; the editor's schema owns its shape. */
  value: string
  onChange: (next: string) => void
  attachments: string[]
  onAttachmentsChange: (next: string[]) => void
  onSubmitReady?: React.ReactNode
  placeholder?: string
  disabled?: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [highlight, setHighlight] = useState(0)

  const mentions = useMemo(() => {
    const q = mentionQuery.trim().toLowerCase()
    return TEAM_DIRECTORY.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 6)
  }, [mentionQuery])

  /**
   * Appends `@Name` to the document.
   *
   * Appends rather than replacing an in-progress `@word`: the editor owns its
   * own selection, and reaching in to rewrite a range from outside is how a
   * controlled-contenteditable ends up fighting the user's caret. The trade is
   * that the mention lands at the end rather than where they were typing —
   * accepted, and the reason the first-party extension is the real fix.
   */
  const insertMention = (name: string) => {
    const mention = `<p>@${name}</p>`
    onChange(value ? value + mention : mention)
    setMentionOpen(false)
    setMentionQuery('')
  }

  const attachButton = (
    <>
      <button
        type="button"
        className={styles.toolBtn}
        aria-label="Mention a teammate"
        title="Mention a teammate"
        disabled={disabled}
        onMouseDown={(e) => { e.preventDefault(); setMentionOpen((o) => !o); setHighlight(0) }}
      >
        @
      </button>
      <button
        type="button"
        className={styles.toolBtn}
        aria-label="Attach files"
        title="Attach files"
        disabled={disabled}
        onClick={() => fileRef.current?.click()}
      >
        <Icon icon={Paperclip} size={14} />
      </button>
    </>
  )

  return (
    <div>
      <div className={styles.mentionWrap}>
        <LazyMarkdownEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Add a comment"
          toolbarExtras={attachButton}
        />

        {mentionOpen && mentions.length > 0 && (
          <div className={styles.mentionMenu} role="listbox" aria-label="Teammates">
            <input
              autoFocus
              className={styles.mentionSearch}
              value={mentionQuery}
              placeholder="Search teammates…"
              aria-label="Search teammates"
              onChange={(e) => { setMentionQuery(e.target.value); setHighlight(0) }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => (h + 1) % mentions.length) }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => (h - 1 + mentions.length) % mentions.length) }
                else if (e.key === 'Enter') { e.preventDefault(); insertMention(mentions[highlight]!.name) }
                else if (e.key === 'Escape') { setMentionOpen(false); setMentionQuery('') }
              }}
            />
            {mentions.map((m, i) => (
              <button
                key={m.id}
                type="button"
                role="option"
                aria-selected={i === highlight}
                className={i === highlight ? `${styles.mentionItem} ${styles.mentionActive}` : styles.mentionItem}
                onMouseDown={(e) => { e.preventDefault(); insertMention(m.name) }}
              >
                {m.name}
                <span className={styles.mentionRole}>{m.role} · {m.company}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        className={styles.hidden}
        aria-label="Attach files"
        onChange={(e) => {
          const names = Array.from(e.target.files ?? []).map((f) => f.name)
          if (names.length) onAttachmentsChange([...new Set([...attachments, ...names])])
          e.target.value = ''
        }}
      />

      {attachments.length > 0 && (
        <div className={styles.attachments}>
          {attachments.map((name) => (
            <span key={name} className={styles.attachment}>
              <Icon icon={Paperclip} size={12} />
              {name}
              <button
                type="button"
                className={styles.attachmentRemove}
                aria-label={`Remove attachment ${name}`}
                onClick={() => onAttachmentsChange(attachments.filter((n) => n !== name))}
              >
                <Icon icon={X} size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Said BEFORE posting, not after: this app has no file storage, and a
          user who finds out afterwards has lost the file and the trust. */}
      {attachments.length > 0 && (
        <p className={styles.attachmentNote}>
          <Icon icon={TriangleAlert} size={14} />
          <span>
            Attachments can&apos;t be saved yet — this comment will post without them. Their names
            are kept on the message so the reference is not lost.
          </span>
        </p>
      )}

      {onSubmitReady}
    </div>
  )
}
