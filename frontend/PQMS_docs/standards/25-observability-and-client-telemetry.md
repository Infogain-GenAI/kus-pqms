# 25 — Observability and Client Telemetry
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
What the running application reports about itself, to where, and which
business measures depend on it. `21` owns log levels and shape; this file
owns the sink, the metrics and the errors.

## Why this file exists
`13-security-standards.md` inventories `VITE_MONITORING_DSN` —
"error-monitoring sink; unset = console-only" — and nothing else in the
corpus mentions it. BRD `NFR-O-001…005` commit to correlation-ID
propagation, per-event metrics, health signals and alerting. BRD `BO-01` and
`BO-08` state success measures — "median elapsed time from registration to
first investigation activity reduced ≥30%", "median time-to-first-action
reduced ≥40%" — that **cannot be measured without client instrumentation
nobody has specified.**

## The sink
| Rule | Detail |
|---|---|
| O-01 | One monitoring client, initialised once at boot from `VITE_MONITORING_DSN`. **Unset means console-only** and that is a supported mode, not a broken one — local development runs that way. |
| O-02 | The client is behind an interface in `src/shared/monitoring/`, so the vendor can change without touching call sites. Same seam discipline `08` applies to auth and `05` to the token getter. |
| O-03 | **[PLACEHOLDER — which vendor.** `08`'s out-of-scope list defers "Monitoring/observability integration (App Insights/Sentry/OTel)" as an ADR-0001 deferral. The interface can be built without the answer; the client cannot. **Trigger:** before go-live; the `NFR-O-004` alerting requirement has no other home. **Owner:** Architect + Ops.**]** |
| O-04 | Every event carries: the correlation ID if one is in scope, the route, the release version, and the user's **role** — never their name or email (`21`). |

## What is reported
| Category | Reported | Requirement |
|---|---|---|
| Unhandled errors | Every uncaught exception and unhandled rejection | `NFR-O-004` |
| Boundary catches | Every error a route or component boundary catches, with which boundary caught it | `03` |
| Chunk-load failures | Separately from other errors — a spike means a deploy went wrong, not that the app is broken | `03` |
| Failed requests | Status, Appendix E code, endpoint (path only, never the query string) | `21` |
| Web Vitals | LCP, INP, CLS, reported per route | `12` |
| Business events | Registration submitted / succeeded / failed; status change; correlation panel shown, previewed, accepted, dismissed; export requested | `BO-01`, `BO-03`, `BO-08` |
| Session | Sign-in, sign-out, session expiry, re-authentication | `FR-SEC-008` |

**The business-event row is the one that will be forgotten.** It is not
error monitoring and it is not analytics for its own sake — three of the
BRD's ten business objectives state numeric success measures, and those
numbers come from here. `BO-03` in particular ("≥60% of registrations with a
true duplicate surface it before submit") requires the correlation-panel
events above, and there is no other way to obtain it.

## What is never reported
Every prohibition in `21`'s "What never appears in a log line" applies
identically. A monitoring sink is a third party; the bar is higher, not
lower.

## Release identification
Every report carries a release identifier derived at build time from the
commit SHA. Without it, "this error started happening" is unanswerable.
Injected as a `VITE_`-prefixed build-time value, which per `13` means it is
**public** — acceptable, a commit SHA is not a secret, but it must be
declared in `env.d.ts` like every other.

## The interface, concretely
This file specifies "the sink behind an interface". The prior repository ships
that interface, it is small, and it is worth adopting close to verbatim:

```ts
export interface LoggerTransport {
  error: (err: unknown, context?: LogContext) => void;
  warn:  (message: string, context?: LogContext) => void;
  info:  (message: string, context?: LogContext) => void;
}
```

with a factory that **wraps** a base transport rather than replacing it. Four
properties of that design, each of which is a rule here:

- **Only `error` forwards.** `warn` and `info` stay local. A sink that receives
  every info line is a sink nobody reads and a bill nobody expected.
- **The sink call is wrapped in try/catch, and a failure is logged through the
  base transport.** **A throwing sink must never break logging** — a monitoring
  outage that takes the console with it turns a small incident into an
  undiagnosable one.
- **It composes rather than switches.** The console transport stays underneath
  in every environment, so a developer with monitoring enabled still sees
  everything locally.
- **The vendor is one function.** Swapping a beacon for a vendor SDK replaces
  the `report` callback and nothing else — no call site changes, no import
  changes.

## Dormant unless configured
The prior implementation enables reporting **only when a DSN environment
variable is set**, and otherwise leaves the console transport untouched. That is
the correct default: no accidental reporting from a developer's machine, from a
test run, or from a preview build, and no code path that behaves differently
because a network call quietly failed.

13-security-standards.md owns the variable; it is one entry in the
`ImportMetaEnv` inventory, and its absence is a valid state rather than a
misconfiguration.

## Delivery: beacon first
Prefer the browser's beacon API, falling back to a keep-alive fetch. The reason
is specific and not obvious: **a report raised during page unload is exactly the
report a normal fetch loses**, and unload is when navigation-triggered errors
and unhandled rejections surface. Getting this wrong produces a monitoring
dashboard that is systematically blind to one class of failure.

Payload shape stays flat and serialisable — message, stack, the structured
context, a timestamp — and 21-logging-formatting-and-client-diagnostics.md's
prohibition list applies to it **unchanged**. That file records one concrete
violation in the prior implementation and the open decision it raises.

## Installed once, at bootstrap
One call during application start-up, before the router and before the first
render, so an error thrown during bootstrap is reported rather than lost. It is
also the only place the DSN is read.
