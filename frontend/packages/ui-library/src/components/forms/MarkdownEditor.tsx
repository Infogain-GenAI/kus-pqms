import { useEffect, useState } from 'react'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Link2, Link2Off, List, ListOrdered, Quote, Redo2, Strikethrough, Undo2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from '../../icons/Icon'
import styles from './MarkdownEditor.module.css'

/**
 * Rich-text editor — TipTap over its bundled ProseMirror engine.
 *
 * ─── WHY TIPTAP, AND WHY THAT IS NOT A FREE CHOICE ───────────────────────────
 *
 * `12-performance-guidelines.md` names TipTap by name as this corpus's editor,
 * `14-code-style-and-linting.md` owns how it is exported, and
 * `13-security-standards.md` owns the security claim that rests on it. The
 * predecessor app shipped the same engine. Picking a different library would
 * contradict three standards files at once.
 *
 * ─── THE SECURITY PROPERTY, STATED SO IT IS NOT LOST ─────────────────────────
 *
 * Safety here is SCHEMA-BASED, not escape-based. TipTap's extensions ARE
 * ProseMirror schema definitions, and the schema constrains which node and mark
 * types can exist in the document at all — so markup that is not in the schema
 * cannot be represented, let alone rendered. Nothing is HTML-escaped on the way
 * out because nothing unsafe can get in.
 *
 * That guarantee belongs to the EDITOR LIBRARY, not to a transitive ProseMirror
 * version. Swapping TipTap for an editor without a constraining schema — a
 * `contenteditable` with `execCommand`, say — removes the guarantee entirely,
 * silently, while looking like a like-for-like replacement. It is also why
 * `dangerouslySetInnerHTML` appears nowhere in this component.
 *
 * ─── EXPORT RULE ─────────────────────────────────────────────────────────────
 *
 * This component's VALUE export is deliberately absent from the package's main
 * barrel and lives only at the `@pqms/ui-library/markdown-editor` subpath. Its
 * TYPES stay in the main entry, because types are erased at build time and cost
 * nothing. Re-exporting the value from the barrel would put the whole editor in
 * every consumer's bundle — including the issue list, which never renders one.
 * See `src/index.ts` for the exclusion and 14 for the general convention.
 */

export interface MarkdownEditorProps {
  /** HTML document value. TipTap owns the shape; the caller stores it verbatim. */
  value: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  /** Rendered at the right of the toolbar — attachment buttons and the like. */
  toolbarExtras?: React.ReactNode
  'aria-label'?: string
}

interface Tool {
  icon: LucideIcon
  label: string
  /** Key into the subscribed active-state map. Absent for non-modes like Undo. */
  activeKey?: ActiveKey
  run: (e: Editor) => void
}

type ActiveKey = 'bold' | 'italic' | 'strike' | 'bulletList' | 'orderedList' | 'blockquote' | 'link'

const TOOLS: (Tool | 'divider' | 'link')[] = [
  { icon: Bold, label: 'Bold', activeKey: 'bold', run: (e) => e.chain().focus().toggleBold().run() },
  { icon: Italic, label: 'Italic', activeKey: 'italic', run: (e) => e.chain().focus().toggleItalic().run() },
  { icon: Strikethrough, label: 'Strikethrough', activeKey: 'strike', run: (e) => e.chain().focus().toggleStrike().run() },
  'divider',
  { icon: List, label: 'Bullet list', activeKey: 'bulletList', run: (e) => e.chain().focus().toggleBulletList().run() },
  { icon: ListOrdered, label: 'Numbered list', activeKey: 'orderedList', run: (e) => e.chain().focus().toggleOrderedList().run() },
  { icon: Quote, label: 'Quote', activeKey: 'blockquote', run: (e) => e.chain().focus().toggleBlockquote().run() },
  'divider',
  // Link is NOT in this list: it needs a URL, so it opens a prompt rather than
  // toggling. It is rendered beside these, in the toolbar below.
  'link',
  'divider',
  { icon: Undo2, label: 'Undo', run: (e) => e.chain().focus().undo().run() },
  { icon: Redo2, label: 'Redo', run: (e) => e.chain().focus().redo().run() },
]

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  disabled = false,
  toolbarExtras,
  'aria-label': ariaLabel,
}: MarkdownEditorProps) {
  // The link prompt is component state, not editor state: it is chrome around
  // the editor, and putting it in the document would make an open prompt part of
  // the comment.
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Headings are out of scope for a comment composer: a comment is not a
        // document, and offering H1–H6 invites people to fake emphasis with
        // size. Bold, italic, lists and quote cover what the design shows.
        heading: false,

        /**
         * ─── LINK: THE ONE MARK THAT CAN CARRY AN ATTACK ────────────────────
         *
         * Every other mark in this schema is inert — `<strong>` cannot do
         * anything. A link carries a URL, and `javascript:alert(1)` in an href
         * is a working XSS vector in any renderer that trusts it.
         *
         * So the allow-list is stated EXPLICITLY rather than left to the
         * extension's defaults. It is short on purpose: http and https for the
         * web, mailto for addressing a person. Anything else — `javascript:`,
         * `data:`, `file:`, `vbscript:` — cannot be represented in the document
         * at all, so it never reaches storage and never reaches a renderer.
         *
         * This is the schema guarantee 13-security-standards.md rests on,
         * applied at the one place in this editor where it actually has work to
         * do. It is also why the URL prompt does not need its own validation:
         * the schema is the check, and a check at the input is a convenience.
         */
        link: {
          protocols: ['http', 'https', 'mailto'],
          // A user types "example.com"; without this it is not a valid URI and
          // the link is silently dropped.
          defaultProtocol: 'https',
          // In an EDITOR a click means "put my caret here", not "navigate away".
          // Following the link mid-sentence would lose unsaved work.
          openOnClick: false,
          // Typing a bare URL turns it into a link, which is what people expect
          // from every other composer they use.
          autolink: true,
        },
      }),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: '',
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  })

  /*
   * Re-sync ONLY when the caller's value genuinely diverges — a clear-on-post,
   * or a draft loaded in. Setting content on every render would fight the user's
   * typing and reset the caret to the start on each keystroke, which is the
   * classic controlled-contenteditable bug.
   */
  useEffect(() => {
    if (!editor) return
    const current = editor.isEmpty ? '' : editor.getHTML()
    if (value !== current) editor.commands.setContent(value, { emitUpdate: false })
  }, [value, editor])

  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [disabled, editor])

  /**
   * ⚠️ THIS SUBSCRIPTION IS REQUIRED, NOT AN OPTIMISATION.
   *
   * TipTap v3's `useEditor` does NOT re-render its component on every editor
   * transaction — that changed from v2, deliberately, because most editors do
   * not need it and re-rendering per keystroke is expensive.
   *
   * The consequence here is specific and was caught by a test rather than by
   * eye: the toolbar reads `editor.isActive('bold')` to decide its pressed
   * state, and with no subscription that value is read once and then never
   * again. The buttons WORK — bold really is applied — but they never light up,
   * so the toolbar silently stops reporting what the caret is inside, which is
   * half of what a formatting toolbar is for.
   *
   * `useEditorState` re-renders only when one of these flags actually changes,
   * which is the narrow subscription this needs — not `shouldRerenderOnTransaction`,
   * which would re-render on every keypress to keep six booleans current.
   */
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            strike: e.isActive('strike'),
            bulletList: e.isActive('bulletList'),
            orderedList: e.isActive('orderedList'),
            blockquote: e.isActive('blockquote'),
            link: e.isActive('link'),
          }
        : null,
  })

  /**
   * Applies the prompt's URL to the current selection.
   *
   * An EMPTY value unsets the link rather than writing `href=""`. Clearing the
   * box and pressing Enter is what a user does when they mean "not a link any
   * more", and an empty href renders as a clickable element that navigates to
   * the current page — a broken link that looks like a working one.
   *
   * A BARE DOMAIN IS COMPLETED, NOT REJECTED. People type `example.com`, and
   * the extension's own `defaultProtocol` does NOT cover this path — it applies
   * to autolink detection while typing, not to `setLink`. Without the prefix
   * below, `setLink({ href: 'example.com' })` fails the protocol allow-list and
   * the link is dropped in silence: the text stays selected, nothing appears to
   * happen, and the user has no idea why. That was a real defect here, caught by
   * a test rather than by eye.
   *
   * This is COMPLETION, not validation. The schema's allow-list remains the only
   * check on what may become a link, and it cannot be bypassed from here — a
   * `javascript:` URL already has a scheme, so it is passed through untouched
   * and the schema refuses it. Re-implementing that check at the input would
   * give two rules to keep in step, and the input's copy is the one that drifts.
   */
  const applyLink = () => {
    const raw = linkUrl.trim()
    if (!raw) {
      editor?.chain().focus().unsetLink().run()
      setLinkOpen(false)
      return
    }
    // Anything already carrying a scheme (or a protocol-relative `//host`) is
    // left exactly as typed, so the allow-list still judges it.
    const href = /^[a-z][a-z0-9+.-]*:|^\/\//i.test(raw) ? raw : `https://${raw}`
    editor?.chain().focus().setLink({ href }).run()
    setLinkOpen(false)
  }

  if (!editor) return null

  return (
    <div className={editor.isFocused ? `${styles.root} ${styles.rootFocused}` : styles.root}>
      <div className={styles.toolbar} role="toolbar" aria-label="Formatting">
        {TOOLS.map((t, i) =>
          t === 'divider' ? (
            <span key={`d${i}`} className={styles.divider} aria-hidden />
          ) : t === 'link' ? (
            <span key="link" className={styles.linkGroup}>
              <button
                type="button"
                aria-label={active?.link ? 'Edit link' : 'Insert link'}
                title={active?.link ? 'Edit link' : 'Insert link'}
                aria-pressed={active?.link ?? false}
                aria-expanded={linkOpen}
                className={active?.link ? `${styles.btn} ${styles.btnActive}` : styles.btn}
                disabled={disabled}
                onMouseDown={(e) => {
                  e.preventDefault()
                  // Seeded with the existing href when the caret is already in a
                  // link, so "edit" means edit rather than retype.
                  setLinkUrl(editor.getAttributes('link').href ?? '')
                  setLinkOpen((o) => !o)
                }}
              >
                <Icon icon={Link2} size={14} />
              </button>

              {/* Unlink appears only when there IS a link. A permanently
                  visible remove button that does nothing most of the time is
                  noise in a seven-control toolbar. */}
              {active?.link && (
                <button
                  type="button"
                  aria-label="Remove link"
                  title="Remove link"
                  className={styles.btn}
                  disabled={disabled}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    editor.chain().focus().unsetLink().run()
                    setLinkOpen(false)
                  }}
                >
                  <Icon icon={Link2Off} size={14} />
                </button>
              )}

              {linkOpen && (
                <div className={styles.linkPrompt}>
                  <input
                    autoFocus
                    className={styles.linkInput}
                    value={linkUrl}
                    placeholder="example.com"
                    aria-label="Link URL"
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); applyLink() }
                      if (e.key === 'Escape') { e.preventDefault(); setLinkOpen(false) }
                    }}
                  />
                  <button type="button" className={styles.linkApply} onMouseDown={(e) => { e.preventDefault(); applyLink() }}>
                    Apply
                  </button>
                </div>
              )}
            </span>
          ) : (
            <button
              key={t.label}
              type="button"
              aria-label={t.label}
              title={t.label}
              // Reports what the caret is INSIDE, not just what a click does.
              aria-pressed={t.activeKey ? (active?.[t.activeKey] ?? false) : undefined}
              className={t.activeKey && active?.[t.activeKey] ? `${styles.btn} ${styles.btnActive}` : styles.btn}
              disabled={disabled}
              // mousedown + preventDefault: a click fires after blur, by which
              // point the selection has collapsed and the command would apply
              // to nothing.
              onMouseDown={(e) => { e.preventDefault(); t.run(editor) }}
            >
              <Icon icon={t.icon} size={14} />
            </button>
          ),
        )}
        {toolbarExtras && <span className={styles.spacer} />}
        {toolbarExtras}
      </div>

      <EditorContent editor={editor} className={styles.content} />
    </div>
  )
}
