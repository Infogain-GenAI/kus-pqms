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
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
