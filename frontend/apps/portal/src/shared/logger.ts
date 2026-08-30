/**
 * STRUCTURED LOGGING, BEHIND A SWAPPABLE TRANSPORT.
 *
 * Ported from `shared/logger.ts` in the Vue app.
 *
 * ─── WHY AN INTERFACE RATHER THAN CALLING `console` DIRECTLY ─────────────────
 *
 * `console.error` is a dead end: it writes to a place nobody is watching in
 * production, it cannot carry structured context, and it cannot be asserted on
 * in a test. The seam here is one indirection — every call goes through
 * `logger`, and what `logger` DOES is a single swappable object.
 *
 * That buys three things this app cannot get from `console`:
 *
 *   1. A REAL DESTINATION. `shared/monitoring.ts` swaps in a transport that also
 *      forwards errors to a remote sink, without any call site changing.
 *   2. STRUCTURED CONTEXT. `logger.error(err, { issueId, action })` keeps the
 *      metadata attached to the error instead of stringified into a message.
 *   3. TESTABILITY. `setLoggerTransport` lets a test assert that a failure path
 *      actually reported, which is the part of error handling that silently rots.
 *
 * ─── THE DEFAULT IS STILL THE CONSOLE, AND THAT IS DELIBERATE ────────────────
 *
 * Nothing is enabled by installing this. Until a DSN is configured the behaviour
 * is exactly what it was. This is a seam, not a vendor decision — see
 * `monitoring.ts` for how a real sink attaches.
 */

export type LogContext = Record<string, unknown>

export interface LoggerTransport {
  error: (err: unknown, context?: LogContext) => void
  warn: (message: string, context?: LogContext) => void
  info: (message: string, context?: LogContext) => void
}

const consoleTransport: LoggerTransport = {
  error: (err, context) => console.error(err, context),
  warn: (message, context) => console.warn(message, context),
  info: (message, context) => console.info(message, context),
}

let transport: LoggerTransport = consoleTransport

/**
 * The app's logger. A stable object, not the transport itself — call sites hold
 * a reference to this and must keep working across a transport swap, which they
 * would not if they captured the transport directly.
 */
export const logger = {
  error(err: unknown, context?: LogContext) {
    transport.error(err, context)
  },
  warn(message: string, context?: LogContext) {
    transport.warn(message, context)
  },
  info(message: string, context?: LogContext) {
    transport.info(message, context)
  },
}

/** Swaps the transport. Used by `initMonitoring`, and by tests to assert on calls. */
export function setLoggerTransport(next: LoggerTransport): void {
  transport = next
}

/** Restores the console transport. A test that swaps MUST reset, or it leaks. */
export function resetLoggerTransport(): void {
  transport = consoleTransport
}

/**
 * Wraps a base transport so errors ALSO reach an external sink.
 *
 * Vendor-agnostic on purpose: `report` can call Sentry, OpenTelemetry, or a
 * plain HTTP beacon. Only `error` is forwarded — `warn` and `info` stay local,
 * because shipping every info line to a remote sink is how a monitoring budget
 * gets spent on noise.
 *
 * ⚠️ A THROWING SINK MUST NOT BREAK LOGGING. If `report` throws — a misconfigured
 * DSN, an SDK that is not initialised — the base transport has already been
 * called, so the error is not lost, and the sink's own failure is logged rather
 * than propagated. Monitoring that can take down the code path it is monitoring
 * is worse than no monitoring.
 */
export function createMonitoringTransport(options: {
  report: (err: unknown, context?: LogContext) => void
  base?: LoggerTransport
}): LoggerTransport {
  const base = options.base ?? consoleTransport
  return {
    error: (err, context) => {
      // Base FIRST, so a throwing sink cannot swallow the original error.
      base.error(err, context)
      try {
        options.report(err, context)
      } catch (reportErr) {
        base.error(reportErr, { source: 'monitoring.report' })
      }
    },
    warn: base.warn,
    info: base.info,
  }
}
