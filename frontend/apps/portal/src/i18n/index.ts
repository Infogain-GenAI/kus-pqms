import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

/**
 * The app's i18n instance. It owns the ACTIVE LOCALE AND THE FALLBACK — and no
 * strings at all.
 *
 * Per `09-i18n-and-localization.md`, and carried forward from the Vue app's
 * `i18n/index.ts` (a dated team decision, 2026-07-21): messages are NOT
 * centralised. Every component owns a sibling `ComponentName.i18n.ts` which
 * registers its own namespace as a side effect of being imported.
 *
 *     ComponentName.tsx
 *     ComponentName.i18n.ts
 *
 * ─── ⚠️ THE NAMESPACE STRING IS A SILENT JOIN ────────────────────────────────
 *
 * `addResourceBundle(locale, 'X', …)` in the `.i18n.ts` and `useTranslation('X')`
 * in the component must be IDENTICAL. A mismatch does not throw — i18next falls
 * back and renders the key, so the screen shows `someKey` where a sentence
 * should be. 09 names this as a manual-discipline risk with no lint rule yet.
 *
 * Two defences are in place instead:
 *   · Each `.i18n.ts` writes the namespace literal exactly ONCE, and exports it,
 *     so the component imports the constant rather than retyping the string.
 *   · `scripts/check-i18n-namespaces.mjs` fails the build on a mismatch.
 *
 * ─── NO WRAPPER HOOK ─────────────────────────────────────────────────────────
 *
 * 09 is explicit: do not introduce an app-specific i18n hook. Components call
 * react-i18next's own `useTranslation(namespace)` directly, matching the Vue
 * app, which called `useI18n({ useScope: 'local', messages })` with no wrapper.
 *
 * ─── `en` ONLY, AND NO EMPTY `ko` SCAFFOLD ───────────────────────────────────
 *
 * 09 forbids scaffolding empty locale keys in advance: an empty-string locale
 * renders BLANK UI if `SUPPORTED_LOCALES` is ever extended before real content
 * exists, which is worse than an untranslated English string. Adding Korean
 * means adding `ko` WITH content, at that time.
 */

export const SUPPORTED_LOCALES = ['en'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: AppLocale = 'en'

/** Shape of a per-component i18n file: locale → key → text. */
export type ComponentI18nMessages = Record<string, Record<string, string>>

void i18next.use(initReactI18next).init({
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  // Intentionally empty — every namespace arrives via `addResourceBundle` from a
  // component's own `.i18n.ts`.
  resources: {},
  /*
   * ⚠️ ESCAPING OFF. i18next escapes interpolated values for template engines
   * that inject raw HTML; React already escapes everything it renders, so
   * leaving this on double-escapes and turns an apostrophe in an issue title
   * into `&#39;` on screen.
   */
  interpolation: { escapeValue: false },
  /*
   * A missing key renders the KEY, not an empty string. That is deliberate:
   * `issueList.title` on screen is an obvious defect someone reports, whereas a
   * blank heading looks like a loading state and ships.
   */
  parseMissingKeyHandler: (key) => key,
})

export const i18n = i18next

/** Switch the active UI locale. Every namespace follows it. */
export function setLocale(locale: AppLocale): void {
  void i18next.changeLanguage(locale)
}

/**
 * Registers one component's messages under its own namespace.
 *
 * A THIN HELPER, NOT A WRAPPER. 09 permits exactly this one exception to
 * "no app-specific i18n code" — namespace registration — because vue-i18n's
 * local-scope option has no react-i18next equivalent. It adds no behaviour over
 * `addResourceBundle`; it exists so the namespace literal and the messages
 * object cannot be passed in the wrong order, and so every `.i18n.ts` has an
 * identical last line.
 */
export function registerMessages(namespace: string, messages: ComponentI18nMessages): void {
  for (const locale of Object.keys(messages)) {
    i18next.addResourceBundle(locale, namespace, messages[locale], true, true)
  }
}
