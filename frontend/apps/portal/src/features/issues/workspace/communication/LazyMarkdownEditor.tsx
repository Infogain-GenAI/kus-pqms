import { Component, Suspense, lazy, useState, type ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Button, Icon, Spinner, type MarkdownEditorProps } from '@pqms/ui-library'
import styles from './composer.module.css'

/**
 * The editor, deferred to the moment this tab opens.
 *
 * ─── WHY THE BOUNDARY IS HERE AND NOT AT THE ROUTE ───────────────────────────
 *
 * `12-performance-guidelines.md` is explicit: "the editor loads when its tab
 * opens, not when its route does." Route-level lazy loading defers it only as
 * far as "the Issue Workspace was opened" — a user who reads an issue and never
 * visits Communication would still pay for a rich-text editor they never see.
 * This boundary means they pay nothing.
 *
 * Imported from the SUBPATH, not the barrel. Reaching it through
 * `@pqms/ui-library` would pull TipTap into the main bundle and undo the whole
 * arrangement, which is why the import here looks inconsistent with every other
 * one in this feature.
 *
 * ─── THE FAILURE CASE IS REQUIRED, NOT DEFENSIVE ─────────────────────────────
 *
 * 12 names this as a constraint rather than an option: the editor sits inside a
 * form, so the chunk is requested at a moment when the user may already have
 * typed elsewhere on the screen. A failed chunk load must NOT take the
 * surrounding form down with it — 03's chunk-load design reloads the page, which
 * here would discard unsaved input.
 *
 * So the failure is contained to this component: an inline notice with a retry,
 * and the rest of the section keeps working. Retry remounts the boundary, which
 * re-requests the chunk — the usual cause is a stale manifest after a deploy,
 * and that resolves on a second attempt without a reload.
 */
const MarkdownEditor = lazy(() =>
  import('@pqms/ui-library/markdown-editor').then((m) => ({ default: m.MarkdownEditor })),
)

class EditorChunkBoundary extends Component<
  { children: ReactNode; onRetry: () => void },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className={styles.editorFailed} role="alert">
        <Icon icon={TriangleAlert} size={16} />
        <span>
          The editor didn&apos;t load. Nothing you&apos;ve typed elsewhere on this screen has been lost.
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            this.setState({ failed: false })
            this.props.onRetry()
          }}
        >
          Retry
        </Button>
      </div>
    )
  }
}

export function LazyMarkdownEditor(props: MarkdownEditorProps) {
  // Bumped on retry so the boundary and its children remount, re-requesting the
  // chunk rather than replaying the cached rejection.
  const [attempt, setAttempt] = useState(0)
  return (
    <EditorChunkBoundary key={attempt} onRetry={() => setAttempt((n) => n + 1)}>
      <Suspense fallback={<div className={styles.editorLoading}><Spinner /></div>}>
        <MarkdownEditor {...props} />
      </Suspense>
    </EditorChunkBoundary>
  )
}
