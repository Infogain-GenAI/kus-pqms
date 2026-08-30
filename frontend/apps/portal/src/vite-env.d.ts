/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Fixture-backed data (the default). Set to the exact string `"false"` to opt
   * into the real API instead; ANY other value, or unset, keeps fixtures.
   *
   * That asymmetry is deliberate and matches the Vue app's contract exactly:
   * the value comes from an untracked `.env` that differs per machine, so the
   * safe path has to be the one you get by default and by accident.
   *
   * Read only through `config/data-source.ts` — never `import.meta.env` at a
   * call site, or the contract above ends up re-implemented per consumer.
   */
  readonly VITE_USE_FIXTURES?: string

  /**
   * Base URL for the real API. Only meaningful once `VITE_USE_FIXTURES=false`.
   * Example: `/api/v1` in dev (routed through a Vite proxy, since the backend
   * sends no CORS headers), a real HTTPS origin in production.
   */
  readonly VITE_API_BASE_URL?: string

  /**
   * Base URL for `pqms-notification-service`. A genuinely DIFFERENT BASE PATH
   * (`/api/notification/v1`), not just a different port — which is why
   * `shared/http` exposes a second client rather than a second path on the first.
   */
  readonly VITE_NOTIFICATION_API_BASE_URL?: string

  /**
   * Where runtime errors are reported. UNSET BY DEFAULT, AND THAT IS THE SAFE
   * STATE: with no DSN, `shared/monitoring.ts` installs nothing, makes no
   * network call, and the logger keeps writing to the console exactly as before.
   *
   * Setting it turns the sink on — so this must not be set casually in a shared
   * `.env`; every handled error in the session then leaves the browser.
   */
  readonly VITE_MONITORING_DSN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
