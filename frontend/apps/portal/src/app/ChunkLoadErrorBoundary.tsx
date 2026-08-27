import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * The one shared chunk-load-failure boundary, per
 * 03-react-component-patterns-and-naming.md's "Chunk-load-failure detection".
 *
 * IT MUST BE REFERENCED STATICALLY FROM THE ROUTE OBJECT — never exported from
 * inside the module a route lazily imports. A lazily-exported boundary was never
 * obtained when the module failed to load, so that failure bubbles to a PARENT
 * route's boundary instead and the boundary meant to catch it never runs. (03
 * cites React Router issues 10194 / 10201, where exactly this was reported and
 * fixed.) See routes.tsx: every route carrying `lazy` also carries
 * `ErrorBoundary: ChunkLoadErrorBoundary` on the same object.
 *
 * BEHAVIOUR IS DELIBERATELY ASYMMETRIC, and the asymmetry is the whole point:
 * a chunk-load failure means the user is holding a stale index against a
 * redeployed bundle, which a reload genuinely fixes. Any other error is a bug,
 * and reloading on a bug either masks it or loops forever. So only the first
 * class reloads; everything else is logged and rendered as a dead end.
 */

/**
 * ALL THREE ENGINES' dynamic-import failure messages, per
 * 03-react-component-patterns-and-naming.md's "Chunk-load-failure detection",
 * which requires matching "the dynamic-import failure message **of every browser
 * this app runs in**":
 *
 *   | V8 / Chromium           | Failed to fetch dynamically imported module |
 *   | SpiderMonkey / Firefox  | error loading dynamically imported module   |
 *   | JavaScriptCore / Safari | Importing a module script failed            |
 *
 * THE MESSAGE IS THE BROWSER'S, NOT THE BUNDLER'S. It comes from the engine's
 * module loader — **do not attribute it to Vite**; grepping the bundler's source
 * for it is a dead end and sends the next reader debugging in the wrong
 * repository. (This comment previously said "Vite's own message". It was wrong,
 * and 03 now records the mistake explicitly because it was caught only by an
 * independent review grepping Vite's `dist` and finding nothing.)
 *
 * WHY ALL THREE AND NOT JUST CHROMIUM'S: an earlier revision of 03 specified only
 * the V8 string, so a boundary matching it recovered Chromium users only — Firefox
 * and Safari fell through to the log-and-render path, meaning a user holding a
 * stale bundle after a deploy got a dead end instead of the reload this boundary
 * exists to trigger. That is precisely the case it was written for. 03 was amended
 * to require all three, so matching them is now the standard rather than a
 * divergence from it.
 *
 * WIDENING CARRIES NO SPURIOUS-RELOAD RISK, per 03: all three strings denote the
 * same failure class — a module script that could not be fetched or parsed — so
 * nothing newly matches that was not already a chunk-load failure.
 *
 * CASE-INSENSITIVE DELIBERATELY. The three strings do not agree on
 * capitalisation ("Failed…", "error…", "Importing…"), and none of them is a
 * stable API — they are human-readable engine diagnostics that can be recased or
 * reworded by a browser release. Matching defensively costs nothing here, since
 * no non-chunk-load message resembles these.
 *
 * Related open item, recorded in 03 rather than here: this app declares no
 * browser support target — no `browserslist`, no Vite build `target` — which is
 * why all three engines are matched rather than a chosen subset.
 */
const CHUNK_LOAD_FAILURE =
  /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed/i

interface Props {
  children?: ReactNode
}

interface State {
  error: Error | null
}

export class ChunkLoadErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (CHUNK_LOAD_FAILURE.test(error.message)) {
      // A stale document against a new deployment. Reload, and do it once —
      // reload() re-requests index.html, so the next attempt fetches the
      // manifest that actually matches the chunks on the server.
      window.location.reload()
      return
    }
    // Not a chunk failure: log, do not reload. Per 03, reloading here "risks
    // masking a real bug or looping".
    //
    // ON `console.error` SPECIFICALLY — this is an INTERIM SEAM, chosen because
    // there is nothing else to call yet, and named so the next reader does not
    // mistake it for the intended end state.
    // 21-logging-formatting-and-client-diagnostics.md specifies a structured
    // logger (`logger.error("someEvent", { ... })`) and bans console.log as a
    // level. NO SUCH LOGGER EXISTS IN THIS REPO — verified across
    // apps/portal/src and packages/*/src. Building it is well outside a routing
    // pass, so this is the stopgap until 21's logger lands; when it does, this
    // call is one of its first migration sites. It is also currently the only
    // console.* call in the application, which is why it is worth a comment
    // rather than being left to read as a habit.
    console.error('Unhandled error in route subtree:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    // A reload is already in flight for the chunk case, so this renders for a
    // frame at most. Render nothing rather than flashing an error message that
    // is about to be replaced by a fresh document.
    if (CHUNK_LOAD_FAILURE.test(error.message)) return null

    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 'var(--space-8) var(--space-6)',
        }}
      >
        <div style={{ font: 'var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)', color: 'var(--text-primary)' }}>
          Something went wrong on this screen
        </div>
        {/* No max-width here: a numeric dimension would add to ds-gate's
            `numeric` ceiling, which is at zero headroom (207/207). The
            surrounding layout already constrains the width. */}
        <div
          style={{
            marginTop: 'var(--space-1)',
            font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-body)',
            color: 'var(--text-muted)',
          }}
        >
          The rest of the application is still usable — navigate elsewhere and try again.
        </div>
      </div>
    )
  }
}
