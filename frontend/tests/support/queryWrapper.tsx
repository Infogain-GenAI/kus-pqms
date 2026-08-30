import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * A FRESH QUERY CLIENT PER TEST.
 *
 * ⚠️ NEVER IMPORT `app/queryClient` INTO A TEST. That one is a module-level
 * singleton, so its cache would survive from one test into the next: test B
 * would read data test A fetched, pass for the wrong reason, and then fail in
 * isolation or when the file order changes. That class of failure is
 * order-dependent and extremely hard to attribute, so the rule is absolute.
 *
 * ─── THE TEST-ONLY DEFAULTS, AND WHY THEY DIFFER FROM PRODUCTION ─────────────
 *
 * `retry: false` — the production client retries once. In a test asserting the
 * error path, a retry means the failure arrives after a backoff delay and the
 * assertion times out instead of failing usefully. Tests want the first
 * rejection.
 *
 * `gcTime: Infinity` — stops the cache being garbage-collected mid-test by a
 * timer, which otherwise produces an intermittent "data disappeared" failure
 * that reproduces roughly never.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  })
}

/** A wrapper for `renderHook`/`render`, with its own client. */
export function withQueryClient(client: QueryClient = createTestQueryClient()) {
  return function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}
