# 09 — i18n and Localization
**Tier:** 1
**Status:** APPROVED — REVISION 2

## Purpose
Internationalization conventions for this React app.

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Library: react-i18next
Use **react-i18next**, wrapping the i18next core. Do not write a custom
i18n implementation or an app-specific wrapper around the library — see
"Runtime consumption" below for the one exception (namespace
registration).

Provenance: the prior Vue implementation of this product (repo
`kus-pqms`, `frontend/apps/pqms-portal/src/i18n/index.ts`) used a thin
wrapper around vue-i18n rather than anything bespoke; react-i18next is
the direct equivalent and the same thin-wrapper posture carries
forward.

## Co-located per-component message files
**One `.i18n.ts` file per component**, holding that component's own
message keys, imported directly by the component:

  ComponentName.tsx
  ComponentName.i18n.ts

**Do not centralize into a single global locale bundle.** Each component
owns its own keys.

Provenance: this was a deliberate, dated team decision in `kus-pqms`
(recorded at `frontend/apps/pqms-portal/src/i18n/index.ts:6` as "team
decision, 2026-07-21", and in `frontend/CLAUDE.md`) — not an accident
or a gap someone failed to centralize. It carries forward as a decision,
not as inertia.

## Pluralization: library ICU variants, never hand-rolled key pairs
Use react-i18next's built-in plural handling — **one key with
count-based variant suffixes** (`_one`, `_other`, and so on) — and pass
the count. The library selects the variant.

  issuesLinkedToast_one: "1 issue linked — linked to this new issue.",
  issuesLinkedToast_other: "{{count}} issues linked — linked to this new issue.",

**Never write separate singular/plural keys by hand.** Provenance:
`kus-pqms` did exactly that (`issuesLinkedToastSingular` /
`issuesLinkedToastPlural`), which is the shape this rule exists to
prevent recreating. The example above is that same message expressed
correctly.

This also matters for the locale that does not exist yet: Korean's
plural rules do not map onto English's singular/plural split, so a
hand-rolled key pair would need Korean-specific branching logic that
the library's variant selection handles for free.

## Interpolation: double-brace placeholders
react-i18next uses **double-brace** placeholders — `{{issueId}}`, not
`{issueId}`. Single braces do not interpolate; they render literally.

Worth stating because it is the most likely defect when transcribing
copy from the prototype or from `kus-pqms`, where vue-i18n's
single-brace syntax was used throughout. A single-brace placeholder
produces a string with visible braces in the UI rather than an error.

## Locale scaffolding
`en` only. **`SUPPORTED_LOCALES` stays `['en']`** and no `ko` key exists
in any messages object until real Korean translation content is ready.

**Do not scaffold empty `ko` keys or objects in advance.** An
empty-string locale risks silently rendering blank UI if
`SUPPORTED_LOCALES` is ever extended before real content exists. Adding
Korean means adding the `ko` key *with* real content at that time, not
filling in a pre-existing placeholder.

## Type shape
`Record<string, Record<string, string>>` — a generic locale→key→string
shape, not a per-component type.

**Settled against the first real component rather than invented.**
`AppHeader.i18n.ts` declares a plain object literal, registers it, and
exports it as default:

```ts
import i18n from "../../i18n";

const messages = {
  en: {
    navOverview: "Overview",
    notificationsNewBadge_one: "{{count}} new",
    notificationsNewBadge_other: "{{count}} new",
  },
};

i18n.addResourceBundle("en", "AppHeader", messages.en);

export default messages;
```

Three things that shape is doing, each of which matters:

- **The namespace string appears exactly once**, in the
  `addResourceBundle` call. The component's `useTranslation("AppHeader")`
  must match it, and a mismatch fails silently — so keeping it to one
  literal per file is the only defence available.
- **Registration is a side effect of import.** Nothing else imports the
  messages; the component imports the file for its side effect and calls
  `useTranslation`. That is why 26-test-data-fixtures-and-test-scope.md
  requires every component test to import the real component module.
- **The default export exists for tests**, not for the component. A test
  asserting on user-facing text asserts against `messages.en.someKey`
  rather than a hardcoded string, so a copy change breaks one place.

Provenance: the generic shape is carried forward from `kus-pqms`
(`frontend/apps/pqms-portal/src/i18n/index.ts`); the registration
mechanism is new here, because vue-i18n's local-scope option had no
equivalent and 09 replaced it with explicit namespace registration.

## Runtime consumption
One named call shape, not an alternative:

- **`useTranslation(componentNamespaceKey)` — ALWAYS called with an
  explicit namespace argument, never bare.** Bare `useTranslation()`
  reads from a shared default namespace, which breaks the
  per-component message isolation this file commits to.
- **Namespace registration**: each `ComponentName.i18n.ts`
  self-registers its namespace as a side effect of being imported, via
  `i18n.addResourceBundle(locale, 'ComponentName', messages[locale])`.
  No separate build-time registry file — consistent with the
  static-import, no-central-bundle convention above.
- **Hard rule**: the namespace string passed to `addResourceBundle` and
  the string passed to `useTranslation()` must be identical — use the
  component's own name exactly (e.g. `'IssueEntry'`, `'BaseButton'`). A
  mismatch **fails silently**, falling back rather than throwing. This
  is a manual-discipline risk worth a lint rule or a thin wrapper
  helper later; it is not solved now.

### One namespace is not per-component, and it is deliberate
**`ApiError` is a shared namespace**, owned by the single error-message
module that 22-error-handling-and-user-feedback.md requires. It is the
one exception to the per-component rule above.

The reason is that its strings belong to no component: an Appendix E
error code can surface in a toast, in an inline field error, on a 403
route, or in a retry panel, and the message must be the same in all four.
A per-component copy would produce four wordings of one error, which is
precisely the drift the per-component convention exists to prevent
everywhere else.

**Do not generalise from this.** A second shared namespace requires the
same argument — that the strings are genuinely owned by no component —
and "several components use similar words" is not that argument.

Beyond that namespace-registration mechanism, **do not introduce an
app-specific i18n hook** unless a real cross-cutting need emerges that
the library does not already handle. Provenance: `kus-pqms` had no
app-authored i18n hook at all — components called vue-i18n's own
`useI18n({ useScope: 'local', messages })` directly — and that
no-custom-wrapper posture is deliberate.

## Fallback locale
A global fallback to the default locale (`en`). Provenance: carried
forward from `kus-pqms`'s `fallbackLocale: DEFAULT_LOCALE` setup.

## Testing
**26-test-data-fixtures-and-test-scope.md owns the i18n test rules**, and
they exist because this file's registration mechanism has a silent
failure mode. Not restated here; the two that matter most:

- Every component test imports the **real** component module, so its
  `.i18n.ts` side effect runs. A mocked component gets fallback text and
  the test passes for the wrong reason.
- A test asserting on user-facing text asserts against the `en` value in
  that component's own `.i18n.ts`, never a hardcoded string.

## Lazy loading
**None.** Every `.i18n.ts` is statically imported by its sibling
component. Do not introduce lazy-loading complexity speculatively;
revisit only if bundle-size analysis (per
12-performance-guidelines.md) shows a real need. Provenance:
`kus-pqms` had no i18n lazy loading either, and no evidence it needed
any.
