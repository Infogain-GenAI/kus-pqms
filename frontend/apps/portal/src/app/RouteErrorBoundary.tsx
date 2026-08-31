import { useEffect } from 'react'
import { useRouteError } from 'react-router-dom'
import { isApiError } from '@/shared/http'
import { logger } from '@/shared/logger'
import { ErrorFallback } from './ErrorFallback'

/**
 * THE ROUTE-LEVEL ERROR ELEMENT. Attached as `ErrorBoundary:` on every route.
 *
 * ─── ⚠️ IT REPLACES `ChunkLoadErrorBoundary`, WHICH DID NOT WORK ─────────────
 *
 * That component was a React class boundary. React Router does NOT use the
 * `ErrorBoundary` route property as a wrapper around the element — it renders it
 * IN PLACE OF the element, with no children and no error prop, and expects it to
 * read the error from `useRouteError()`.
 *
 * So the class was mounted with `props.children === undefined` and
 * `state.error === null`, and its `render()` returned `this.props.children`.
 * The measured result, in a probe against the real router:
 *
 *     RENDERED HTML >>> ""
 *
 * TWO CONSEQUENCES, BOTH LIVE UNTIL NOW:
 *
 *   1. ANY render error in ANY routed screen produced a BLANK CONTENT AREA — no
 *      message, no reference, no way to tell a failure from an empty page.
 *   2. THE CHUNK-RELOAD NEVER RAN. Detection lived in `componentDidCatch`, which
 *      React Router never calls, so the stale-bundle-after-deploy recovery the
 *      file exists for had never once executed.
 *
 * The chunk knowledge below is carried over verbatim, because it is correct and
 * hard-won; only the mechanism it hangs off is fixed.
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
 * module loader — do not attribute it to Vite; grepping the bundler's source for
 * it is a dead end and sends the next reader debugging in the wrong repository.
 *
 * WHY ALL THREE AND NOT JUST CHROMIUM'S: an earlier revision of 03 specified only
 * the V8 string, so a boundary matching it recovered Chromium users only —
 * Firefox and Safari fell through to the log-and-render path, meaning a user
 * holding a stale bundle after a deploy got a dead end instead of the reload this
 * exists to trigger.
 *
 * WIDENING CARRIES NO SPURIOUS-RELOAD RISK: all three strings denote the same
 * failure class — a module script that could not be fetched or parsed — so
 * nothing newly matches that was not already a chunk-load failure.
 *
 * CASE-INSENSITIVE DELIBERATELY. The three do not agree on capitalisation, and
 * none is a stable API — they are human-readable engine diagnostics a browser
 * release can recase or reword.
 */
const CHUNK_LOAD_FAILURE =
  /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed/i

/** `useRouteError()` returns `unknown` — anything can be thrown. */
function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null && 'message' in error) return String((error as { message: unknown }).message)
  return 'Unknown error'
}

export function RouteErrorBoundary() {
  const error = useRouteError()
  const isChunkFailure = CHUNK_LOAD_FAILURE.test(messageOf(error))

  /*
   * ⚠️ EFFECT, NOT RENDER. Reloading or logging during render would fire twice
   * under StrictMode and, for the reload, could loop. An effect runs after
   * commit, once per mount.
   */
  useEffect(() => {
    if (isChunkFailure) {
      // A stale document against a new deployment. `reload()` re-requests
      // index.html, so the next attempt fetches the manifest that actually
      // matches the chunks on the server.
      window.location.reload()
      return
    }
    // Not a chunk failure: log, do NOT reload. Reloading on a bug either masks
    // it or loops forever.
    logger.error(error, {
      source: 'RouteErrorBoundary',
      correlationId: isApiError(error) ? error.correlationId : undefined,
    })
  }, [error, isChunkFailure])

  // A reload is already in flight, so this renders for a frame at most. Render
  // nothing rather than flashing a message about to be replaced by a fresh
  // document.
  if (isChunkFailure) return null

  return (
    <ErrorFallback
      correlationId={isApiError(error) ? error.correlationId : null}
      action={
        /*
          RELOAD, NOT "TRY AGAIN". A router error is owned by the router: React
          Router keeps the error state until the next navigation, so there is
          nothing this component can reset. Offering a "Try again" that quietly
          did nothing would be worse than offering the action that does work.
          `ErrorBoundary` — the component-level one under each layout — is the one
          that can genuinely retry in place.
        */
        <button type="button" onClick={() => window.location.reload()} data-testid="route-error-reload">
          Reload the page
        </button>
      }
    />
  )
}
