import { Component, type ErrorInfo, type ReactNode } from 'react'
import { isApiError } from '@/shared/http'
import { logger } from '@/shared/logger'
import { ErrorFallback } from './ErrorFallback'

/**
 * RENDER-ERROR BOUNDARY FOR A ROUTE SUBTREE — recoverable, and reported.
 *
 * Ported from `components/ErrorBoundary.vue`.
 *
 * ─── HOW THIS DIFFERS FROM `RouteErrorBoundary` ─────────────────────────────
 *
 * They are complementary, not duplicates, and the difference is not cosmetic:
 *
 *   RouteErrorBoundary is a ROUTER error element (`ErrorBoundary:` on a
 *   route object). React Router hands it loader failures and — critically —
 *   failures of the `lazy()` import itself, which a component boundary can never
 *   see, because a component that failed to load never rendered. It cannot be
 *   RESET: the router owns that state, so recovery means navigating away.
 *
 *   THIS is an ordinary React boundary wrapping the rendered subtree. It sees
 *   only render/lifecycle errors, and because it owns its own state it can offer
 *   a retry that re-renders in place. That is the capability Vue's boundary has
 *   and this app did not: the existing fallback is a dead end that tells the user
 *   to "navigate elsewhere and try again".
 *
 * A transient render error — a bad response shape, a race that left a field
 * undefined for one pass — is common enough that forcing a navigation to escape
 * it is a real cost. Retry is one click and costs nothing when it does not help.
 *
 * ─── IT LIVES IN THE APP, NOT IN ui-library ──────────────────────────────────
 *
 * Because it depends on the app's logger. Vue's file says the same, and it is
 * the right line: a presentation library must not acquire a dependency on a
 * business-logic seam.
 *
 * ─── WHY A CLASS ─────────────────────────────────────────────────────────────
 *
 * There is no hook equivalent. `getDerivedStateFromError` and `componentDidCatch`
 * are class-only APIs and React has never shipped a replacement, so this is one
 * of the two or three places a class component is still the correct answer
 * rather than a legacy one.
 */

interface Props {
  children?: ReactNode
  /**
   * Changing this clears a captured error.
   *
   * ⚠️ LOAD-BEARING, AND EASY TO OMIT. React reuses a component instance when
   * the same element type stays in the same position, so navigating from a
   * broken route to a healthy sibling KEEPS this boundary mounted with its error
   * state intact — the user would navigate away and still see the fallback, with
   * no way out but a reload. Callers pass the pathname, so a route change resets
   * it. See the layouts.
   */
  resetKey?: string
  /** Names the failing region in the log, e.g. `route:/issues/:id`. */
  source?: string
}

interface State {
  error: Error | null
  /** Quoted in the fallback so a user can reference the log entry. */
  correlationId: string | null
}

/**
 * A short reference tying what the user saw to what was logged.
 *
 * Not `crypto.randomUUID()`: a 36-character UUID is not something anyone reads
 * over the phone or types into a ticket accurately. Eight characters is enough
 * to find one entry in a day's logs.
 */
function newIncidentId(): string {
  return `E-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, correlationId: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  /**
   * Clears the error when `resetKey` changes.
   *
   * Done in `getDerivedStateFromProps` rather than an effect because a class
   * boundary has no effects, and doing it in `componentDidUpdate` would render
   * the fallback for one frame after the navigation had already happened.
   */
  static getDerivedStateFromProps(props: Props, state: State & { lastKey?: string }): Partial<State & { lastKey?: string }> | null {
    if (props.resetKey !== state.lastKey) {
      return { lastKey: props.resetKey, error: null, correlationId: null }
    }
    return null
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    /*
     * An `ApiError` already carries a correlation id from the HTTP client, and
     * reusing it is what lets a support conversation join the UI failure to the
     * server-side request that caused it. Minting a fresh one here would break
     * that link for the errors most worth tracing.
     */
    const correlationId = isApiError(error) ? error.correlationId : newIncidentId()
    this.setState({ correlationId })

    logger.error(error, {
      source: this.props.source ?? 'ErrorBoundary',
      correlationId,
      // The React tree that failed. It is the single most useful field in this
      // record and is not present on the error itself.
      componentStack: info.componentStack,
    })
  }

  private reset = () => {
    this.setState({ error: null, correlationId: null })
  }

  render() {
    const { error, correlationId } = this.state
    if (!error) return this.props.children

    return (
      <ErrorFallback
        correlationId={correlationId}
        action={
          /*
            A plain <button>, not the ui-library `Button`. This renders precisely
            when something in the tree below has already failed, so it must
            depend on as little as possible — importing a styled component here
            means a fault in the design system takes the error screen down with
            it, and the user gets a blank page instead of a way out.
          */
          <button type="button" onClick={this.reset} data-testid="error-boundary-retry">
            Try again
          </button>
        }
      />
    )
  }
}
