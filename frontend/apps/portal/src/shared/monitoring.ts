import { createMonitoringTransport, logger, setLoggerTransport, type LogContext } from './logger'

/**
 * REMOTE ERROR MONITORING — dormant unless configured.
 *
 * Ported from `shared/monitoring.ts` in the Vue app.
 *
 * ─── IT DOES NOTHING UNTIL `VITE_MONITORING_DSN` IS SET ──────────────────────
 *
 * No DSN, no transport swap, no network call, no behaviour change. That is the
 * point: this lands the seam and the payload shape now, so that turning on a
 * real sink later is a configuration change rather than a code change threaded
 * through every catch block in the app.
 *
 * ─── VENDOR-NEUTRAL BY CONSTRUCTION ──────────────────────────────────────────
 *
 * It POSTs a JSON payload to whatever URL the DSN names. To use Sentry or
 * OpenTelemetry instead, replace the `report` function below with the vendor SDK
 * call — `createMonitoringTransport` and every `logger.error` call site stay
 * exactly as they are. Committing to an SDK here would put a vendor in the
 * dependency tree before anyone has chosen one.
 */

export interface ErrorReportPayload {
  message: string
  stack?: string
  context?: LogContext
  /** Where it happened. An error with no page is nearly unactionable. */
  url: string
  timestamp: string
}

/**
 * Normalises any thrown value into something serialisable. PURE, and exported,
 * so the payload shape can be tested without a network.
 *
 * ⚠️ `throw` ACCEPTS ANY VALUE, NOT JUST `Error`. A string, a number, a plain
 * object and `undefined` are all legal to throw, and a reporter that assumes
 * `err.message` turns a real error into a second, more confusing one inside the
 * error handler. Every branch here produces a string message.
 */
export function serializeError(err: unknown, context?: LogContext): ErrorReportPayload {
  const meta = {
    context,
    url: typeof window !== 'undefined' ? window.location.href : '',
    timestamp: new Date().toISOString(),
  }

  if (err instanceof Error) {
    return { message: err.message, stack: err.stack, ...meta }
  }
  if (typeof err === 'string') {
    return { message: err, ...meta }
  }
  try {
    return { message: JSON.stringify(err) ?? String(err), ...meta }
  } catch {
    // Circular structures, and objects with a throwing `toJSON`, both land here.
    // Reporting the type is worth more than losing the report entirely.
    return { message: `Unserialisable thrown value of type ${typeof err}`, ...meta }
  }
}

/**
 * Sends one payload, preferring `sendBeacon`.
 *
 * `sendBeacon` SURVIVES PAGE UNLOAD; a normal `fetch` is cancelled when the
 * document goes away. That matters because the errors most worth capturing are
 * often the ones immediately followed by the user closing the tab. `fetch` with
 * `keepalive` is the fallback where `sendBeacon` is unavailable.
 */
function postReport(dsn: string, payload: ErrorReportPayload): void {
  const body = JSON.stringify(payload)

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    navigator.sendBeacon(dsn, new Blob([body], { type: 'application/json' }))
    return
  }

  void fetch(dsn, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  })
}

/**
 * Installs the monitoring transport when a DSN is configured. Call once, at app
 * bootstrap. Safe to call with no DSN — it returns having changed nothing.
 */
export function initMonitoring(): void {
  const dsn = import.meta.env.VITE_MONITORING_DSN
  if (!dsn) return

  setLoggerTransport(
    createMonitoringTransport({
      report: (err, context) => postReport(dsn, serializeError(err, context)),
    }),
  )
  logger.info('Remote error monitoring enabled')
}
