/**
 * THE SANCTIONED HTTP ENTRY POINT.
 *
 * Ported from `shared/http/apiClient.ts` in the Vue app. Exports the primary
 * `apiClient` (Issue Management / Master Data) and `notificationApiClient`
 * (`pqms-notification-service` — a genuinely different base path, not just a
 * different port). Every `api/*.ts` and `services/*.service.ts` module must use
 * one of these two, or the helpers below; NO COMPONENT EVER CONSTRUCTS ITS OWN.
 *
 * That rule is the whole point. The moment a component calls `fetch` directly it
 * bypasses the correlation ID, the auth token, the timeout and — worst — the
 * error normalisation, so its failures arrive in a shape nothing else in the app
 * knows how to handle.
 *
 * ─── ⚠️ BUILT ON `fetch`, NOT axios. READ THIS BEFORE "FIXING" IT. ───────────
 *
 * The Vue original is axios. This is not, and that is a deliberate decision
 * rather than an oversight:
 *
 *   1. AXIOS IS NOT A DEPENDENCY OF THIS REPO, and adding one is governed by
 *      `14-heavy-dependency-*`. The repo's stated minimal-dependency posture is
 *      why there is no lodash here either — the Vue debounce composable records
 *      the same reasoning.
 *   2. NOTHING IN THE CONTRACT NEEDS IT. Interceptors, timeout and JSON
 *      unwrapping are what axios was used for; `AbortController` and ~100 lines
 *      cover all three.
 *
 * WHAT IS PRESERVED IS THE PUBLIC CONTRACT, EXACTLY: the same two clients, the
 * same `registerAccessTokenGetter` / `registerUnauthorizedHandler` seams, the
 * same `ApiError` shape and `isApiError` guard, and the same helper set
 * (`get`/`post`/`put`/`patch`/`del`/`getBlob`/`postBlob`/`postForm`). Every
 * call site is identical to the Vue one, so swapping the transport back to axios
 * later is a change to THIS FILE ONLY.
 *
 * ─── AUTH IS NOT WIRED HERE, ON PURPOSE ──────────────────────────────────────
 *
 * Token attachment and 401 handling are registerable hooks, so the auth layer
 * plugs in WITHOUT editing this file. Until something registers them, the
 * getter returns null and the 401 handler is a no-op beyond rejecting.
 */

/* -------------------------------------------------------------------------- */
/* Pluggable seams for the future auth layer                                  */
/* -------------------------------------------------------------------------- */

type AccessTokenGetter = () => string | null | undefined

/** No-op until the auth layer registers a real token source. */
let getAccessToken: AccessTokenGetter = () => null

/** Called by the auth layer to supply the current access token per request. */
export function registerAccessTokenGetter(getter: AccessTokenGetter): void {
  getAccessToken = getter
}

type UnauthorizedHandler = () => void

let onUnauthorized: UnauthorizedHandler | null = null

/**
 * Called by the auth layer to react to a 401 (refresh / redirect). No token
 * refresh exists yet — this is the seam it will attach to.
 */
export function registerUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler
}

/** Test-only reset, so a spec that registers a seam cannot leak into the next. */
export function __resetHttpSeams(): void {
  getAccessToken = () => null
  onUnauthorized = null
}

/* -------------------------------------------------------------------------- */
/* Correlation id                                                             */
/* -------------------------------------------------------------------------- */

/**
 * One id per request, echoed in the normalised error so a user can quote it to
 * support and have the server-side log found. Without it a report is "it failed
 * this morning".
 */
function correlationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Older jsdom and non-secure contexts have no randomUUID.
  return `cid-${Date.now().toString(36)}-${Math.round(Math.random() * 1e9).toString(36)}`
}

/* -------------------------------------------------------------------------- */
/* The normalised error shape                                                 */
/* -------------------------------------------------------------------------- */

/** One field-level validation failure from the backend's `details[]`. */
export interface ApiErrorDetail {
  field: string
  message: string
}

/**
 * EVERY rejection from this module is this shape — 404, 409, timeout, network
 * failure and a thrown non-Error alike. Callers handle one type, and can always
 * surface the correlation id.
 */
export interface ApiError {
  status: number | null
  code: string
  message: string
  correlationId: string
  /**
   * Field-level failures, when the backend supplies them — a 400 answering
   * `details: [{ field: "newStatus", message: "…" }]` is what lets a form show
   * the error against the offending control instead of as a generic toast.
   *
   * Optional, and absent rather than empty, so callers branch on presence
   * without also checking length.
   */
  details?: ApiErrorDetail[]
}

export function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'correlationId' in err && 'code' in err
}

const NETWORK_ERROR_MESSAGE = 'Network error — check your connection.'
const TIMEOUT_MESSAGE = 'The request timed out. Please try again.'
const DEFAULT_TIMEOUT_MS = 30_000

/* -------------------------------------------------------------------------- */
/* The client                                                                 */
/* -------------------------------------------------------------------------- */

export interface RequestConfig {
  /** Query parameters. `undefined` and `null` values are omitted, not sent as "undefined". */
  params?: Record<string, unknown>
  headers?: Record<string, string | undefined>
  signal?: AbortSignal
  /** Overrides the 30s default. */
  timeoutMs?: number
}

export interface HttpClient {
  readonly baseUrl: string
  request: <T>(method: string, url: string, body?: unknown, config?: RequestConfig) => Promise<T>
  requestBlob: (method: string, url: string, body?: unknown, config?: RequestConfig) => Promise<BlobDownload>
}

/**
 * Builds a query string, omitting empty values.
 *
 * ARRAYS REPEAT THE KEY (`?status=open&status=review`) rather than joining with
 * commas — that is what Spring's binder expects, and a comma-joined value
 * arrives as one string containing a comma, which matches no enum.
 */
function toQuery(params: Record<string, unknown> | undefined): string {
  if (!params) return ''
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      for (const v of value) if (v !== undefined && v !== null && v !== '') usp.append(key, String(v))
    } else {
      usp.append(key, String(value))
    }
  }
  const q = usp.toString()
  return q ? `?${q}` : ''
}

/** Extracts `filename` from Content-Disposition (RFC 5987 `filename*` or plain). */
function parseContentDispositionFilename(header: string | null): string | undefined {
  if (!header) return undefined
  const encoded = /filename\*=(?:UTF-8'')?"?([^";]+)"?/i.exec(header)
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1])
    } catch {
      return encoded[1]
    }
  }
  return /filename="?([^";]+)"?/i.exec(header)?.[1]
}

/** A streamed binary download plus the filename parsed from Content-Disposition. */
export interface BlobDownload {
  blob: Blob
  filename?: string
}

/**
 * Recovers the backend's message from an error body.
 *
 * ⚠️ HANDLES A `Blob` BODY. When a request asked for binary (an export), an
 * ERROR response also arrives as a Blob, so the usual `data.message` access sees
 * nothing and the user gets axios/fetch's generic message instead of the real
 * reason. Reading the blob back as text and parsing it is what fixes that, and
 * it benefits every future binary endpoint, not just export.
 */
async function readErrorBody(response: Response): Promise<{ message?: string; details?: ApiErrorDetail[] }> {
  try {
    const text = await response.text()
    if (!text) return {}
    const parsed = JSON.parse(text) as { message?: string; details?: unknown }
    const details = Array.isArray(parsed.details)
      ? parsed.details.filter(
          (d): d is ApiErrorDetail =>
            typeof (d as ApiErrorDetail)?.field === 'string' && typeof (d as ApiErrorDetail)?.message === 'string',
        )
      : []
    return {
      message: typeof parsed.message === 'string' ? parsed.message : undefined,
      details: details.length > 0 ? details : undefined,
    }
  } catch {
    // A non-JSON error body (an HTML 502 page from a proxy) is not a reason to
    // lose the status — the caller still gets a normalised ApiError.
    return {}
  }
}

function createHttpClient(baseUrl: string, envVarName: string): HttpClient {
  /*
   * Tripwire: refuse to boot a production build against a non-HTTPS API.
   * Carried over from the Vue original — it closes a security to-do that would
   * otherwise depend on infra-level enforcement nobody has set up yet.
   */
  if (import.meta.env.PROD && !baseUrl.startsWith('https://')) {
    throw new Error(`${envVarName} must be HTTPS in production: ${baseUrl}`)
  }

  const send = async (method: string, url: string, body: unknown, config: RequestConfig | undefined, asBlob: boolean) => {
    const cid = correlationId()
    const isForm = body instanceof FormData

    const headers: Record<string, string> = {
      'X-Correlation-ID': cid,
      ...Object.fromEntries(Object.entries(config?.headers ?? {}).filter(([, v]) => v !== undefined) as [string, string][]),
    }

    /*
     * ⚠️ NEVER SET Content-Type FOR FormData. A multipart body is not
     * self-describing — the server needs a `boundary` token to find each part,
     * and only whatever assembles the body can produce it. Setting the header
     * yourself (even to the correct "multipart/form-data") suppresses the
     * generated boundary and causes a server-side parse failure that surfaces as
     * an opaque 400 on a request that looks perfectly correct in devtools. The
     * Vue original documents the same trap. Do not "tidy" this.
     */
    if (!isForm && body !== undefined && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`

    /*
     * Timeout via AbortController — this is what axios' `timeout` option did.
     * The caller's own signal is honoured too: whichever aborts first wins.
     */
    const controller = new AbortController()
    const timeoutMs = config?.timeoutMs ?? DEFAULT_TIMEOUT_MS
    const timer = setTimeout(() => controller.abort(new DOMException('timeout', 'TimeoutError')), timeoutMs)
    const onExternalAbort = () => controller.abort(config?.signal?.reason)
    config?.signal?.addEventListener('abort', onExternalAbort)

    let response: Response
    try {
      response = await fetch(`${baseUrl}${url}${toQuery(config?.params)}`, {
        method,
        headers,
        body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
        signal: controller.signal,
      })
    } catch (err) {
      // Distinguish a timeout from a genuine network failure — they need
      // different words in front of a user ("try again" vs "check your
      // connection"), and lumping them together hides an overloaded backend.
      const timedOut = err instanceof DOMException && (err.name === 'TimeoutError' || err.name === 'AbortError')
      throw {
        status: null,
        code: timedOut ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: timedOut ? TIMEOUT_MESSAGE : NETWORK_ERROR_MESSAGE,
        correlationId: cid,
      } satisfies ApiError
    } finally {
      clearTimeout(timer)
      config?.signal?.removeEventListener('abort', onExternalAbort)
    }

    if (!response.ok) {
      // Hand off to the auth layer before rejecting, so it can refresh/redirect.
      if (response.status === 401) onUnauthorized?.()

      const { message, details } = await readErrorBody(response)
      throw {
        status: response.status,
        code: String(response.status),
        message: message ?? `${response.status} ${response.statusText}`.trim(),
        correlationId: cid,
        ...(details ? { details } : {}),
      } satisfies ApiError
    }

    if (asBlob) {
      return {
        blob: await response.blob(),
        filename: parseContentDispositionFilename(response.headers.get('content-disposition')),
      }
    }

    // 204 and an empty 200 both have no body; parsing them would throw.
    if (response.status === 204) return undefined
    const text = await response.text()
    return text ? JSON.parse(text) : undefined
  }

  return {
    baseUrl,
    request: <T>(method: string, url: string, body?: unknown, config?: RequestConfig) =>
      send(method, url, body, config, false) as Promise<T>,
    requestBlob: (method: string, url: string, body?: unknown, config?: RequestConfig) =>
      send(method, url, body, config, true) as Promise<BlobDownload>,
  }
}

/** Issue Management / Master Data. */
export const apiClient: HttpClient = createHttpClient(
  import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  'VITE_API_BASE_URL',
)

/**
 * `pqms-notification-service`. A SECOND CLIENT, not a path on the first: it
 * lives on a genuinely different base path, and giving it its own instance is
 * what lets it get its own base URL, and later its own auth, without either
 * duplicating the interceptor logic above.
 */
export const notificationApiClient: HttpClient = createHttpClient(
  import.meta.env.VITE_NOTIFICATION_API_BASE_URL ?? '/api/notification/v1',
  'VITE_NOTIFICATION_API_BASE_URL',
)

/* -------------------------------------------------------------------------- */
/* Helpers, so api/*.ts modules do not repeat unwrapping                      */
/* -------------------------------------------------------------------------- */
//
// Each takes an optional trailing `client`, defaulting to the primary one, so a
// notification-service module passes `notificationApiClient` explicitly and
// nothing else has to change.

export const get = <T>(url: string, config?: RequestConfig, client: HttpClient = apiClient): Promise<T> =>
  client.request<T>('GET', url, undefined, config)

export const post = <T>(url: string, body?: unknown, config?: RequestConfig, client: HttpClient = apiClient): Promise<T> =>
  client.request<T>('POST', url, body, config)

export const put = <T>(url: string, body?: unknown, config?: RequestConfig, client: HttpClient = apiClient): Promise<T> =>
  client.request<T>('PUT', url, body, config)

export const patch = <T>(url: string, body?: unknown, config?: RequestConfig, client: HttpClient = apiClient): Promise<T> =>
  client.request<T>('PATCH', url, body, config)

export const del = <T>(url: string, config?: RequestConfig, client: HttpClient = apiClient): Promise<T> =>
  client.request<T>('DELETE', url, undefined, config)

/** GET a binary body plus its Content-Disposition filename (e.g. a streamed export). */
export const getBlob = (url: string, config?: RequestConfig, client: HttpClient = apiClient): Promise<BlobDownload> =>
  client.requestBlob('GET', url, undefined, config)

/** The `getBlob` counterpart for endpoints that take a request body. */
export const postBlob = (url: string, body?: unknown, config?: RequestConfig, client: HttpClient = apiClient): Promise<BlobDownload> =>
  client.requestBlob('POST', url, body, config)

/** POST a `multipart/form-data` body — see the Content-Type note in `send`. */
export const postForm = <T>(url: string, form: FormData, config?: RequestConfig, client: HttpClient = apiClient): Promise<T> =>
  client.request<T>('POST', url, form, config)
