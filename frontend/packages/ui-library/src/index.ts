// Public entry for @pqms/ui-library.
//
// ./components/index.ts is the vendored component barrel and is re-exported
// verbatim. Icon is re-exported here too because it is the ONLY sanctioned icon
// path (00-core-rules.md) and consumers previously reached it at '@/icons/Icon',
// which no longer exists outside this package.
//
// The import-restriction rule in eslint.adherence.config.mjs exists to keep
// consumers on THIS entry rather than reaching into component internals.
export * from './components'
export { Icon } from './icons/Icon'
export type { IconProps } from './icons/Icon'

/**
 * ─── HEAVY-DEPENDENCY EXCLUSION: `MarkdownEditor` ────────────────────────────
 *
 * Its TYPES are exported here; its VALUE deliberately is NOT. The component
 * pulls in TipTap and its bundled ProseMirror engine, and this barrel is
 * imported by every screen — so re-exporting the value would ship a rich-text
 * editor to the issue list, the dashboard and the admin screens, none of which
 * render one.
 *
 * The value lives at the `@pqms/ui-library/markdown-editor` subpath instead.
 * Types are erased at build time and cost a consumer nothing, so they stay here
 * and callers can name a prop without importing the subpath.
 *
 * Stated at the omission site on purpose: an absent export looks like an
 * oversight otherwise, and the next person 'fixes' it. This is the standard
 * approach for ANY future component with a similarly heavy dependency, not a
 * one-off — see 14-code-style-and-linting.md.
 */
export type { MarkdownEditorProps } from './components/forms/MarkdownEditor'
