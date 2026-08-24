# 21 — Logging, Formatting and Client Diagnostics
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
What the browser logs, at what level, in what shape, and what must never
appear in a log line. Also the formatting utilities every screen needs and
no file currently owns: date, time, timezone, number and unit.

## Why this file exists
`05-api-integration-and-data-fetching.md` names a `logger` seam in passing.
`13-security-standards.md` inventories `VITE_MONITORING_DSN` as one of seven
environment variables and nothing consumes it. BRD `NFR-O-001` requires a
correlation ID propagated from the browser; `NFR-O-005` states that no log
may contain a credential, token or unredacted personal data. **Three files
depend on logging and none owns it.**

Provenance: `kus-pqms` had a logger and a monitoring seam, and
`frontend/docs/engineering/coding-guidelines.md` carried a Logging section.
Neither is carried forward, so this is a specification rather than a
description.

## Levels — four, and what each means
| Level | Use for | Ships to |
|---|---|---|
| `error` | A failure the user experienced: an unhandled rejection, a `5xx`, a chunk-load failure, a render error caught by a boundary | Console **and** the monitoring sink when configured |
| `warn` | A degradation the user did not experience: a stale-cache fallback, a retried request that eventually succeeded, a schema field that was lenient per one of `05`'s three named exceptions | Console; sink only in production |
| `info` | A business-significant event worth counting — see `25`'s metric list | Sink only |
| `debug` | Development diagnosis | Console in development only; **never** shipped |

**`console.log` is not a level.** It is banned in committed code; use
`debug`. Enforce with the `no-console` ESLint rule allowing `warn` and
`error` only, in 14's position-4 override block.

## Shape
Every log entry is a structured object, never an interpolated string:

```ts
logger.error("issueRegistrationFailed", {
  correlationId,        // from the ApiError, per 05
  code,                 // the Appendix E code, per 22
  route,                // the current route path, never the full URL
});
```

**A log message is a stable key, not a sentence.**
`"issueRegistrationFailed"`, not `` `Failed to register issue ${id}` ``. The
reason is aggregation: an interpolated string produces one distinct message
per occurrence and cannot be counted.

## What never appears in a log line
Stated as prohibitions because each has a real path into a log:

- **Any token or credential.** Includes the whole `Authorization` header,
  MSAL's cache contents, and any object that might contain them — never log
  a raw request or response object.
- **VIN.** BRD `§18.4` classifies it as indirectly identifying and requires
  it redacted from logs specifically.
- **User name or email.** The user id is sufficient for correlation.
- **Issue description or comment text.** BRD `§18.4` records that these may
  contain customer personal data entered as free text, and that this is
  controlled by policy rather than technology — so logging them defeats the
  only control.
- **A full URL with query parameters.** Filter state is URL-encoded per
  `NAV-01`, so a URL can carry a search term.

**A CI check, not a convention.** Add a log-scanning test to the `quality`
job asserting that no committed source file passes any of the prohibited
field names into a logger call. BRD `NFR-O-005` is a gated NFR; a convention
does not gate.

## Correlation ID
`05`'s request interceptor already attaches `X-Correlation-ID` on every
request. Two additions:

- The same value is attached to every log entry raised while that request is
  in flight.
- When an `ApiError` surfaces to the user, its `correlationId` is shown in
  the error UI (`22`) so a support ticket carries it. Provenance: `05`
  records that `kus-pqms` appended `correlationId` to toasts for exactly
  this reason.

## Formatting utilities — `src/shared/format/`
One module per concern, all pure functions, all named exports per `14`.

| Module | Owns | Rule |
|---|---|---|
| `date.ts` | Absolute dates, date-times, relative times ("8 min ago") | **Every timestamp is stored in UTC and rendered in the viewer's local timezone with the timezone shown** (BRD `BR-A06`). "Shown" is literal — a rendered time carries its zone abbreviation or offset. |
| `number.ts` | Counts, decimals, percentages | Locale-aware via `Intl.NumberFormat`. Numeric table columns are right-aligned (BRD `§8.4`). |
| `unit.ts` | Days-open (`Nd`), file sizes, currency | **Units are always shown** (BRD `§8.4`). Never a bare number where a unit applies. |
| `id.ts` | Issue ID display | Monospace rendering is a presentation concern, but the format is validated here against `{SYS}-{YY}{NNNN}`. |

**[PLACEHOLDER — the date library.** `Intl` covers formatting; it does not
cover timezone-aware arithmetic or parsing. Candidates: none (Intl only),
`date-fns` + `date-fns-tz`, or `Temporal` once its browser support clears
the `NFR-U-009` matrix. Decide against a real requirement — the first screen
needing date arithmetic is Issue List's date-range filter. **Trigger:** W2-3
or the first date-range filter. **Owner:** Frontend Lead.**]**

**Never format inline in a component.** A `toLocaleDateString()` call inside
JSX is the failure mode this module exists to prevent: it produces one
format per call site and no way to change them together.

## A conflict the prior implementation makes concrete
The prohibition list above forbids full URLs. The prior repository's error
serializer attaches `url: window.location.href` to **every** report.

This is not a small violation. A PQMS URL carries the issue identifier in its
path, so the location of an error report is a record of which issue a named user
was looking at, shipped to a third-party sink.

**The React implementation must not carry the line forward unexamined.** The
options are to drop the field, or to send a sanitised route pattern
(`/issues/:id`, from the matched route rather than the resolved path) which is
what a triager actually needs — they want the *screen*, not the row.

**[PLACEHOLDER — whether the error report carries a sanitised route pattern or
no location at all. Trigger: when the monitoring transport is written. Owner:
Frontend Lead, with security review.]** It is a decision either way; it is not
an implementation detail of the serializer.

## The transport swap is also the test seam
25-observability-and-client-telemetry.md owns the sink. One consequence belongs
here, because it is what makes the rules in this file testable at all: the
logger exposes **set** and **reset** functions for its transport, documented as
test-only.

That is how a spec asserts the rules above — that an error was logged with the
right stable message key, that a token never appeared in a context object, that
a correlation ID was attached. Without the seam, the only way to test a log line
is to spy on the console, which couples every such test to the default
transport.

**Reset in `afterEach`.** A leaked transport turns one failing test into a
confusing cascade in unrelated files.

## `src/shared/format/` — one more module than listed
Add **file size** to the date, number, unit and identifier formatters above. It
is small, it appears wherever attachments and evidence do, and the prior
repository has it as a standalone tested module for exactly that reason. Byte
formatting hand-rolled at three call sites produces three different rounding
conventions.
