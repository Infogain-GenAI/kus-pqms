import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

/**
 * THE SANCTIONED HTTP ENTRY POINT.
 *
 * Built to `05-api-integration-and-data-fetching.md`'s five-property
 * specification, at the exact path 05 names. Every `api/*.ts` and
 * `services/*.service.ts` module must use this client or the helpers below;
 * NO COMPONENT EVER CONSTRUCTS ITS OWN. A component calling `fetch` directly
 * bypasses the correlation ID, the auth token, the timeout and — worst — the
 * error normalisation, so its failures arrive in a shape nothing else knows how
 * to handle.
 *
 * ─── ⚠️ THIS WAS BUILT ON `fetch` AND WAS WRONG ──────────────────────────────
 *
 * The first version of this file used `fetch` + `AbortController`, justified as
 * a minimal-dependency choice. That reasoning was never checked against 05,
 * which says in its first clause: "One **Axios** setup at
 * `apps/portal/src/shared/http/apiClient.ts` … Treat the list below as a
 * specification rather than a summary."
 *
 * Unlike the state-library question — where 04 carries an explicit "a decision
 * the client owns" clause and an open placeholder — 05 has NO adoption gate on
 * the library itself. Axios is simply specified. Converted 2026-08-31.
 *
 * ─── ⚠️ AND IT HAD TWO INSTANCES, WHICH THE CORPUS FORBIDS ───────────────────
 *
 * It exported `apiClient` AND `notificationApiClient`, carried over from the Vue
 * app's microservices topology. That topology is replaced: BRD `AR-01`/`DEC-08`
 * commit to a single backend deployable behind one `/api/v1/**` surface, and the
 * corpus is explicit — *"Delete the second instance; do not port it."* A second
 * instance under a monolith is, in 05's words, "a distinction with nothing
 * behind it".
 *
 * THE FACTORY STAYS. 05 requires it precisely because the origin count is not
 * this file's to assume: "Build the factory regardless; instantiate against
 * however many origins the answer produces. **Do not hard-code two.**" One
 * origin today; adding a second is one `createHttpClient` call, not a rewrite.
 */

/* -------------------------------------------------------------------------- */
/* Pluggable seams for the auth layer                                         */
/* -------------------------------------------------------------------------- */
//
// 05: "This file owns the SEAMS; the Azure AD OIDC+PKCE token source that fills
// them is 08's. Build the seams even before there is a token source to register
// — an unregistered seam is the correct intermediate state, not a gap."

type AccessTokenGetter = () => string | null | undefined

let getAccessToken: AccessTokenGetter = () => null

/** Called by the auth layer to supply the current access token per request. */
export function registerAccessTokenGetter(getter: AccessTokenGetter): void {
  getAccessToken = getter
}

type UnauthorizedHandler = () => void

let onUnauthorized: UnauthorizedHandler | null = null

/** Called by the auth layer to react to a 401 (refresh / redirect). */
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
 * One id per request, echoed in the normalised error so a user can quote it and
 * have the server-side log found. Without it a report is "it failed this
 * morning".
 */
function correlationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // 05 requires a manual fallback: older jsdom and non-secure contexts have no
  // `randomUUID`, and a request with no id is worse than a non-UUID one.
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
   * the error against the offending control instead of a generic toast.
   *
   * Absent rather than empty, so callers branch on presence alone.
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
/* The factory                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Recovers the backend's message from an error body.
 *
 * ⚠️ HANDLES A `Blob` BODY — 05 names this special case explicitly. When a
 * request asked for binary (an export), an ERROR response also arrives as a
 * Blob, so the usual `data.message` access sees nothing and the user gets
 * axios's generic message instead of the real reason.
 */
async function extractResponseMessage(response: AxiosResponse): Promise<string | undefined> {
  const data: unknown = response.data
  if (data instanceof Blob) {
    try {
      return (JSON.parse(await data.text()) as { message?: string })?.message
    } catch {
      return undefined
    }
  }
  return (data as { message?: string } | undefined)?.message
}

/** Field-level failures, or `undefined` when there are none worth reporting. */
function extractResponseDetails(response: AxiosResponse): ApiErrorDetail[] | undefined {
  const details = (response.data as { details?: unknown } | undefined)?.details
  if (!Array.isArray(details) || details.length === 0) return undefined

  const usable = details.filter(
    (d): d is ApiErrorDetail =>
      typeof (d as ApiErrorDetail)?.field === 'string' && typeof (d as ApiErrorDetail)?.message === 'string',
  )
  return usable.length > 0 ? usable : undefined
}

/**
 * Builds one instance with the shared interceptors attached.
 *
 * `envVarName` is carried only so the HTTPS tripwire can name the variable that
 * is wrong. A message saying "the base URL must be HTTPS" sends someone reading
 * code; one naming `VITE_API_BASE_URL` sends them to their environment.
 */
export function createHttpClient(baseURL: string | undefined, envVarName: string): AxiosInstance {
  /*
   * Production HTTPS tripwire. 05: "throw at boot if a production build's base
   * URL is not HTTPS. Cheap, and it catches a misconfigured environment at
   * startup rather than on the first request."
   */
  if (import.meta.env.PROD && !baseURL?.startsWith('https://')) {
    throw new Error(`${envVarName} must be HTTPS in production: ${baseURL}`)
  }

  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: DEFAULT_TIMEOUT_MS,
  })

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Attached ONLY IF a token exists — an unregistered seam must send no
    // Authorization header at all, not `Bearer null`.
    const token = getAccessToken()
    if (token) config.headers.set('Authorization', `Bearer ${token}`)
    config.headers.set('X-Correlation-ID', correlationId())
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      // Hand off to the auth layer before rejecting, so it can refresh/redirect.
      if (axios.isAxiosError(error) && error.response?.status === 401) onUnauthorized?.()

      if (!axios.isAxiosError(error)) {
        return Promise.reject({
          status: null,
          code: 'UNKNOWN_ERROR',
          message: 'Something went wrong.',
          correlationId: 'unknown',
        } satisfies ApiError)
      }

      const cid = error.config?.headers?.get?.('X-Correlation-ID')?.toString() ?? 'unknown'

      let code: string
      let message: string
      let details: ApiErrorDetail[] | undefined

      if (error.code === 'ECONNABORTED') {
        // A timeout and a dropped connection need different words in front of a
        // user, and lumping them together hides an overloaded backend behind
        // "check your connection".
        code = 'TIMEOUT'
        message = TIMEOUT_MESSAGE
      } else if (!error.response) {
        code = 'NETWORK_ERROR'
        message = NETWORK_ERROR_MESSAGE
      } else {
        code = String(error.response.status)
        message = (await extractResponseMessage(error.response)) ?? error.message
        details = extractResponseDetails(error.response)
      }

      return Promise.reject({
        status: error.response?.status ?? null,
        code,
        message,
        correlationId: cid,
        ...(details ? { details } : {}),
      } satisfies ApiError)
    },
  )

  return client
}

/**
 * THE ONE ORIGIN.
 *
 * `DEC-08` commits to a single backend deployable behind one `/api/v1/**`
 * surface, so there is one instance. A second is added by calling
 * `createHttpClient` again — the factory exists so that is a line, not a
 * refactor — but only once a real second origin exists to point it at.
 */
export const apiClient: AxiosInstance = createHttpClient(
  import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  'VITE_API_BASE_URL',
)

/* -------------------------------------------------------------------------- */
/* Helpers, so api/*.ts modules do not repeat `.data` unwrapping              */
/* -------------------------------------------------------------------------- */
//
// Each takes an optional trailing `client`, defaulting to the one instance. The
// parameter is kept even at one origin: it is what makes a second instance a
// call-site argument rather than a change to every helper.

export async function get<T>(url: string, config?: AxiosRequestConfig, client: AxiosInstance = apiClient): Promise<T> {
  const { data } = await client.get<T>(url, config)
  return data
}

export async function post<T>(url: string, body?: unknown, config?: AxiosRequestConfig, client: AxiosInstance = apiClient): Promise<T> {
  const { data } = await client.post<T>(url, body, config)
  return data
}

export async function put<T>(url: string, body?: unknown, config?: AxiosRequestConfig, client: AxiosInstance = apiClient): Promise<T> {
  const { data } = await client.put<T>(url, body, config)
  return data
}

export async function patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig, client: AxiosInstance = apiClient): Promise<T> {
  const { data } = await client.patch<T>(url, body, config)
  return data
}

export async function del<T>(url: string, config?: AxiosRequestConfig, client: AxiosInstance = apiClient): Promise<T> {
  const { data } = await client.delete<T>(url, config)
  return data
}

/** A streamed binary download plus the filename parsed from Content-Disposition. */
export interface BlobDownload {
  blob: Blob
  filename?: string
}

/** Extracts `filename` from Content-Disposition (RFC 5987 `filename*` or plain). */
function parseContentDispositionFilename(header: string | undefined): string | undefined {
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

/**
 * GET a binary body as a `Blob`.
 *
 * Unlike `get<T>()` this needs the response HEADERS to recover the download
 * filename, so it does not use that unwrapping helper. Errors still flow through
 * the shared `ApiError` interceptor, which reads Blob error bodies.
 */
export async function getBlob(url: string, config?: AxiosRequestConfig, client: AxiosInstance = apiClient): Promise<BlobDownload> {
  const response = await client.get<Blob>(url, { ...config, responseType: 'blob' })
  return {
    blob: response.data,
    filename: parseContentDispositionFilename(response.headers?.['content-disposition'] as string | undefined),
  }
}

/** The `getBlob` counterpart for endpoints that take a request body. */
export async function postBlob(url: string, body?: unknown, config?: AxiosRequestConfig, client: AxiosInstance = apiClient): Promise<BlobDownload> {
  const response = await client.post<Blob>(url, body, { ...config, responseType: 'blob' })
  return {
    blob: response.data,
    filename: parseContentDispositionFilename(response.headers?.['content-disposition'] as string | undefined),
  }
}

/**
 * POST a `multipart/form-data` body.
 *
 * ⚠️ `Content-Type` IS SET TO `undefined`, NOT TO `"multipart/form-data"`. A
 * multipart body is not self-describing — the server needs a `boundary` token to
 * find each part, and only whatever assembles the body can produce it. Axios
 * generates the boundary, and the full header, ONLY when no Content-Type is
 * already set. Both this instance's `application/json` default and a hardcoded
 * boundary-less `"multipart/form-data"` suppress that, causing a server-side
 * parse failure that surfaces as an opaque 400 on a request which looks correct
 * in devtools. Do not "tidy" it into a literal string.
 */
export async function postForm<T>(url: string, form: FormData, config?: AxiosRequestConfig, client: AxiosInstance = apiClient): Promise<T> {
  const { data } = await client.post<T>(url, form, {
    ...config,
    headers: { ...config?.headers, 'Content-Type': undefined },
  })
  return data
}
