/**
 * `@pqms/ui-library/markdown-editor` — the editor's VALUE export, and the only
 * place it is reachable from.
 *
 * ─── WHY A SUBPATH RATHER THAN THE MAIN BARREL ───────────────────────────────
 *
 * `MarkdownEditor` pulls in TipTap and its bundled ProseMirror engine. The main
 * barrel is imported by every screen in the app, so re-exporting the editor's
 * value from it would put that weight into the issue list, the dashboard and the
 * admin screens — none of which render a rich-text editor.
 *
 * The exclusion is deliberate and looks like an oversight if it is not said out
 * loud, which is why it is said here and again at the omission site in
 * `src/index.ts`. `14-code-style-and-linting.md` sets this as the standard
 * approach for ANY component with a similarly heavy dependency — not a one-off
 * for this one.
 *
 * TYPES ARE DIFFERENT and stay in the main entry: they are erased at build time,
 * so re-exporting them costs a consumer nothing and saves it from importing the
 * subpath just to name a prop.
 */
export { MarkdownEditor } from './components/forms/MarkdownEditor'
