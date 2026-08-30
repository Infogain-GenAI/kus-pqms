import { useMemo, useRef, useState } from 'react'
import { Bold, Italic, Link2, List, ListOrdered, Paperclip, TriangleAlert, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from '@pqms/ui-library'
import { TEAM_DIRECTORY } from '@/data/investigation'
import styles from './composer.module.css'

/**
 * The comment composer: a working formatting toolbar, @mention autocomplete and
 * staged attachments.
 *
 * Ported from `CommunicationTab.vue`.
 *
 * ─── WHAT WAS HERE BEFORE ────────────────────────────────────────────────────
 *
 * A plain `<textarea>` under a row of `<span>`s holding icons. The toolbar was
 * DECORATION — not buttons, no handlers, no keyboard reachability — and the
 * placeholder said "use @ to notify a teammate" while nothing implemented `@`.
 * Both promised a capability that did not exist.
 *
 * ─── THE TOOLBAR EDITS THE TEXT, IT DOES NOT RENDER IT ───────────────────────
 *
 * There is no rich-text editor installed, and adding one is a dependency
 * decision this change is not the place to make. So the buttons wrap the
 * SELECTION in markdown — `**bold**`, `_italic_`, `- ` list prefixes, `[text](url)`.
 * That is honest: the stored body is the text the user can see in the box, and
 * it stays readable if a real editor never arrives. It also means selection is
 * preserved and the caret lands somewhere sensible, which is the part people
 * notice when it is wrong.
 */

const TOOLS: { icon: LucideIcon; label: string; wrap: [string, string] | null; prefix?: string }[] = [
  { icon: Bold, label: 'Bold', wrap: ['**', '**'] },
  { icon: Italic, label: 'Italic', wrap: ['_', '_'] },
  { icon: List, label: 'Bullet list', wrap: null, prefix: '- ' },
  { icon: ListOrdered, label: 'Numbered list', wrap: null, prefix: '1. ' },
  { icon: Link2, label: 'Insert link', wrap: ['[', '](url)'] },
]

export function Composer({
  value,
  onChange,
  attachments,
  onAttachmentsChange,
  onSubmitReady,
  placeholder,
  disabled = false,
}: {
  value: string
  onChange: (next: string) => void
  attachments: string[]
  onAttachmentsChange: (next: string[]) => void
  /** Rendered beneath the box — the post button and its sibling copy. */
  onSubmitReady?: React.ReactNode
  placeholder?: string
  disabled?: boolean
}) {
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [highlight, setHighlight] = useState(0)

  /** Applies a tool to the current selection, then restores focus and caret. */
  const apply = (tool: (typeof TOOLS)[number]) => {
    const el = areaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)

    let next: string
    let caret: number
    if (tool.prefix) {
      // Line tools act on whole lines, so they anchor to the line start rather
      // than the selection start — prefixing mid-word produces nothing useful.
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      next = value.slice(0, lineStart) + tool.prefix + value.slice(lineStart)
      caret = start + tool.prefix.length
    } else if (tool.wrap) {
      const [open, close] = tool.wrap
      next = value.slice(0, start) + open + selected + close + value.slice(end)
      // With no selection the caret lands BETWEEN the markers, ready to type;
      // with one it lands after, ready to continue.
      caret = selected ? end + open.length + close.length : start + open.length
    } else {
      return
    }
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(caret, caret)
    })
  }

  const mentions = useMemo(() => {
    if (mentionQuery === null) return []
    const q = mentionQuery.toLowerCase()
    return TEAM_DIRECTORY.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 6)
  }, [mentionQuery])

  /** Detects an in-progress `@word` immediately before the caret. */
  const syncMention = (text: string, caret: number) => {
    const upto = text.slice(0, caret)
    // Anchored to a word boundary so an email address does not open the menu.
    const m = /(?:^|\s)@([\w-]*)$/.exec(upto)
    setMentionQuery(m ? m[1]! : null)
    setHighlight(0)
  }

  const insertMention = (name: string) => {
    const el = areaRef.current
    if (!el) return
    const caret = el.selectionStart
    const upto = value.slice(0, caret)
    const m = /(?:^|\s)@([\w-]*)$/.exec(upto)
    if (!m) return
    const at = upto.length - m[1]!.length - 1
    const next = `${value.slice(0, at)}@${name} ${value.slice(caret)}`
    onChange(next)
    setMentionQuery(null)
    const pos = at + name.length + 2
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(pos, pos) })
  }

  return (
    <div>
      <div style={{ border: 'var(--border-width) solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 10 }}>
        <div className={styles.toolbar}>
          {TOOLS.map((t) => (
            <button
              key={t.label}
              type="button"
              className={styles.toolBtn}
              aria-label={t.label}
              title={t.label}
              disabled={disabled}
              // mousedown, not click: click fires after blur, by which time the
              // textarea's selection has already collapsed and the tool would
              // wrap nothing.
              onMouseDown={(e) => { e.preventDefault(); apply(t) }}
            >
              <Icon icon={t.icon} size={14} />
            </button>
          ))}
          <span className={styles.spacer} />
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
        </div>

        <div className={styles.mentionWrap}>
          <textarea
            ref={areaRef}
            rows={4}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => { onChange(e.target.value); syncMention(e.target.value, e.target.selectionStart) }}
            onClick={(e) => syncMention(value, e.currentTarget.selectionStart)}
            onBlur={() => setMentionQuery(null)}
            onKeyDown={(e) => {
              if (mentions.length === 0) return
              if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => (h + 1) % mentions.length) }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => (h - 1 + mentions.length) % mentions.length) }
              else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentions[highlight]!.name) }
              else if (e.key === 'Escape') setMentionQuery(null)
            }}
            style={{ display: 'block', width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', resize: 'vertical', padding: '12px 14px', font: 'var(--fw-regular) var(--fs-body-md)/1.5 var(--font-body)', color: 'var(--text-primary)', background: 'var(--surface-card)' }}
          />

          {mentions.length > 0 && (
            <div className={styles.mentionMenu} role="listbox" aria-label="Teammates">
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
      </div>

      {/*
        Said out loud BEFORE posting, not after. This app has no comment
        endpoint and no file storage, so an attached file cannot survive the
        post — and a user who discovers that afterwards has lost the file and
        the trust. The Vue implementation carries the same warning for the same
        reason, and it at least has a comment endpoint to post to.
      */}
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
