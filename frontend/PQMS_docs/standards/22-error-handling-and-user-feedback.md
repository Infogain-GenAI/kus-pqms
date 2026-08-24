# 22 — Error Handling and User Feedback
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
What the user sees when something fails, is loading, or is empty. The
mapping from the BRD's error codes to copy. The toast contract. Where each
belongs.

## Why this file exists, and the boundary against 03
`03-react-component-patterns-and-naming.md` owns **error boundaries** —
where they are declared, what they catch, how `throwOnError` interacts with
them — and it does that well. It then states that "inline error UI driven by
`useQuery`'s own `error` state" is the default and never says what inline
error UI *is*. It also states that mutation errors "surface at the
form/toast level" and there is no toast.

**03 owns the mechanism. This file owns what the user sees.** Neither
restates the other.

## The three failure surfaces
| Surface | When | Where it renders |
|---|---|---|
| **Field error** | A validation rule in the BRD's §14 table fails | Inline, beneath the field, with `aria-invalid` on the control and `aria-describedby` pointing at the message (`11`) |
| **Region error** | A query for one part of a screen fails | In place of that region only, with a retry action. The rest of the screen stays alive and interactive |
| **Route error** | The route is meaningless without the data (`03`'s `throwOnError: true` case), or a render threw | The route's `ErrorBoundary`, which replaces the page and keeps the app chrome |

**A mutation failure is never a route error.** `03` states this and it is
worth repeating as a user-facing rule: a failed save must never blank the
screen the user was typing into.

## Toasts
A toast reports the **outcome of an action the user just took**. It is never
used for a passive event, a validation error, or anything the user must read
to proceed.

| Rule | Detail |
|---|---|
| T-01 | A toast states the outcome **with the record ID**: "Issue EE-260001 registered." (`06`'s content voice.) |
| T-02 | Success toasts auto-dismiss after 5 seconds. **Error toasts do not auto-dismiss** — they are dismissed by the user. |
| T-03 | An error toast carries the `correlationId` when the failure came from an `ApiError` (`21`). |
| T-04 | One toast per action. A bulk action produces one toast summarising the batch, never one per item. |
| T-05 | A toast is announced to assistive technology via a polite live region. An error toast uses an assertive one. |
| T-06 | A toast is never the only record of something the user needs. If it matters after dismissal, it belongs in the record. |

**Placement.** The toast host is mounted once, at the root, above every
layout. Not per screen. Provenance: `kus-pqms` had a `BaseToast`; the host
was not specified, and per-screen hosts are how two toasts end up
overlapping.

## Empty, loading and error states — screen level
`component-specs/TEMPLATE.md` requires each component to declare these. This
is the **screen**-level contract, which that table does not cover.

| State | Rule |
|---|---|
| Loading | **Skeletons matching the shape of the content**, never a spinner over stale data. A list skeleton has the configured column count; a card skeleton has the card's shape. |
| Loading, subsequent | A refetch of already-displayed data does **not** replace it with a skeleton. Show the stale data with a subtle busy indicator. |
| Empty — no data at all | States what the screen is for and offers the action that creates the first record. |
| Empty — no data **matching a filter** | A different state, and the distinction is not cosmetic. It names the filter and offers to clear it, and states the unfiltered total: "No issues match these filters. Clear filters to see all {total} issues in the queue." (BRD `FR-LST-027`.) |
| Error | Names what failed, offers retry, and **preserves the user's state** — filters are not lost by a failed load (BRD `FR-LST-028`). |
| Stale | When cached data is served because a source is unavailable, a visible staleness indicator says so (BRD `FR-MST-003`). This is a fourth state and it is easy to forget. |

## Error-code to copy
BRD Appendix E defines 18 stable machine-readable codes. Every one maps to a
user-facing message.

| Rule | Detail |
|---|---|
| E-01 | The mapping lives in **one** module, `src/shared/errors/errorMessages.ts`, keyed by the Appendix E code. |
| E-02 | The messages are **i18n keys**, per `09`. They live in a single namespace, `ApiError`, registered by that module — the one deliberate exception to `09`'s per-component convention, because these strings belong to no component. |
| E-03 | An unmapped code renders a generic message **plus the code itself**, so a support ticket is actionable. Never a bare "Something went wrong." |
| E-04 | Four codes have specific UI behaviour beyond a message, and it is not optional: `ISM-CC-001` (concurrency) renders the Reload/Compare affordance of BRD `EF-02`; `ISM-AUTH-001` triggers the re-authentication redirect of `08`; `ISM-AUTH-002` renders the 403 route of `NAV-05`; `ISM-RATE-001` disables the triggering control until the retry window passes. |
| E-05 | A validation failure (`ISM-VAL-001`) is **never** shown as a toast. Its per-field `errors` array is mapped onto the fields it names. |

## Copy rules
Inherited from `06`'s content voice; restated here because these are the
strings most likely to be written badly:

- Name the field **and the fix**. "Enter a part number. Search the part
  master first." — not "Invalid input."
- Never blame the user, and never apologise.
- No exclamation marks, no emoji.
- Never expose an internal identifier other than the correlation ID and the
  error code.
