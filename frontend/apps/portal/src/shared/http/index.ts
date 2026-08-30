/**
 * The barrel every consumer imports from.
 *
 * ⚠️ IMPORT FROM `@/shared/http`, NEVER FROM `./apiClient` DIRECTLY. The Vue
 * original records why: this is the interim, app-level home for the client and
 * its target is a shared `packages/api-client`. Keeping every call site on the
 * barrel means that extraction touches this file and nothing else.
 */
export * from './apiClient'
