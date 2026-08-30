import type { ReactNode } from 'react'
import styles from './ErrorBoundary.module.css'

/**
 * The screen a user sees when something below has failed. Presentational only —
 * it catches nothing and decides nothing.
 *
 * SHARED BY BOTH BOUNDARIES ON PURPOSE. `ErrorBoundary` (render errors under a
 * layout) and `RouteErrorBoundary` (errors the router caught) are two different
 * mechanisms that must produce ONE experience; a user cannot tell which one
 * fired and should not be shown two different error screens depending on an
 * implementation detail of where the throw happened.
 *
 * The two differ only in what recovery they can offer, which is why the action
 * is a slot rather than built in: a component boundary can re-render in place,
 * a router error can only be escaped by navigating or reloading.
 */
export function ErrorFallback({
  action,
  correlationId,
}: {
  /** The recovery control. See the note above on why this is a slot. */
  action?: ReactNode
  /** Shown so a user can quote it; omitted when there is nothing to quote. */
  correlationId?: string | null
}) {
  return (
    <div role="alert" className={styles.fallback} data-testid="error-boundary-fallback">
      <div className={styles.title}>Something went wrong displaying this section.</div>
      <div className={styles.body}>
        The rest of the application is still usable. Try again, or navigate elsewhere and come back.
      </div>
      {action && <div className={styles.actions}>{action}</div>}
      {correlationId && <div className={styles.correlation}>Reference: {correlationId}</div>}
    </div>
  )
}
