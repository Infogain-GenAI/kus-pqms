// Tests for the centralised HTTP client.
//
// ─── WHAT IS ACTUALLY WORTH PINNING HERE ─────────────────────────────────────
//
// Not "a request was made". The value of this module is that EVERY failure
// arrives in one shape — a 404, a timeout, a dropped connection and a non-JSON
// 502 page all become the same `ApiError` with a correlation id. A caller
// written against that guarantee breaks the moment one path leaks a raw axios
// error, and the only place to catch that is here.
//
// The seams matter too: they are the whole reason auth can be added later
// without editing the client, and a seam nobody has exercised is a seam that
// does not work.
//
// ─── ⚠️ THE HARNESS STUBS THE AXIOS ADAPTER, NOT `fetch` ─────────────────────
//
// An earlier version of this file stubbed `globalThis.fetch`, because the client
// was built on fetch. `05-api-integration-and-data-fetching.md` specifies Axios,
// and axios does not use `fetch` in this environment — it uses XHR or the Node
// http adapter. A fetch stub against an axios client does not intercept
// anything; the tests would hit the network or hang.
//
// Stubbing `defaults.adapter` is the correct seam: it replaces only the
// transport, so the request and response INTERCEPTORS still run — and the
// interceptors are the entire subject of this file.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import {
  __resetHttpSeams,
  apiClient,
  createHttpClient,
  del,
  get,
  getBlob,
  isApiError,
  post,
  patch,
  postBlob,
  postForm,
  put,
  registerAccessTokenGetter,
  registerUnauthorizedHandler,
  type ApiError,
} from '@/shared/http'

/** Requests the stubbed adapter saw, in order. */
let seen: InternalAxiosRequestConfig[] = []
const realAdapter = apiClient.defaults.adapter

beforeEach(() => {
  seen = []
  __resetHttpSeams()
})

afterEach(() => {
  apiClient.defaults.adapter = realAdapter
  __resetHttpSeams()
})

/** Installs an adapter and records every config it receives. */
function stub(adapter: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>) {
  apiClient.defaults.adapter = ((config: InternalAxiosRequestConfig) => {
    seen.push(config)
    return adapter(config)
  }) as AxiosAdapter
}

/** A successful response. */
const respondWith = (init: { status?: number; data?: unknown; headers?: Record<string, string> } = {}) =>
  stub(async (config) => ({
    data: init.data,
    status: init.status ?? 200,
    statusText: 'OK',
    headers: init.headers ?? {},
    config,
  }))

/** An HTTP error response, as axios delivers one. */
const failWith = (status: number, data: unknown) =>
  stub(async (config) => {
    throw new AxiosError('Request failed', String(status), config, null, {
      data,
      status,
      statusText: 'Error',
      headers: new AxiosHeaders(),
      config,
    })
  })

const lastUrl = () => `${seen[0].baseURL ?? ''}${seen[0].url ?? ''}`
const header = (i: number, name: string) => seen[i].headers?.get?.(name)?.toString()

describe('one origin, built by a factory', () => {
  it('exposes exactly one instance', () => {
    // ⚠️ THIS FILE USED TO ASSERT TWO. `DEC-08` commits to a single backend
    // deployable behind one `/api/v1/**` surface, and the corpus is explicit —
    // "Delete the second instance; do not port it." A second under a monolith is
    // "a distinction with nothing behind it".
    expect(apiClient).toBeDefined()
    expect((apiClient.defaults.baseURL ?? '')).toContain('/api/v1')
  })

  it('the factory is still exported, so a real second origin is one line', () => {
    // 05: "Build the factory regardless; instantiate against however many
    // origins the answer produces. Do not hard-code two."
    const second = createHttpClient('/api/other/v1', 'VITE_OTHER_BASE_URL')
    expect(second).not.toBe(apiClient)
    expect(second.defaults.baseURL).toBe('/api/other/v1')
  })
})

describe('every request carries a correlation id', () => {
  it('sets X-Correlation-ID', async () => {
    respondWith({ data: { ok: true } })
    await get('/issues')
    expect(header(0, 'X-Correlation-ID')).toBeTruthy()
  })

  it('uses a DIFFERENT id per request', async () => {
    // A shared id would make two concurrent failures indistinguishable in a log,
    // which is the one thing the id exists to prevent.
    respondWith({ data: {} })
    await get('/a')
    await get('/b')
    expect(header(0, 'X-Correlation-ID')).not.toBe(header(1, 'X-Correlation-ID'))
  })
})

describe('the auth seams', () => {
  it('sends no Authorization header until a token source is registered', async () => {
    // An unregistered seam must send NO header, not `Bearer null`.
    respondWith({ data: {} })
    await get('/issues')
    expect(header(0, 'Authorization')).toBeUndefined()
  })

  it('attaches a Bearer token once one is registered', async () => {
    registerAccessTokenGetter(() => 'tok-123')
    respondWith({ data: {} })
    await get('/issues')
    expect(header(0, 'Authorization')).toBe('Bearer tok-123')
  })

  it('reads the token PER REQUEST, so a refresh is picked up', async () => {
    // Capturing it once would send a stale token for the life of the session —
    // the exact bug a refresh flow exists to fix.
    let token = 'first'
    registerAccessTokenGetter(() => token)
    respondWith({ data: {} })
    await get('/a')
    token = 'second'
    await get('/b')
    expect(header(1, 'Authorization')).toBe('Bearer second')
  })

  it('calls the unauthorized handler on a 401 — and still rejects', async () => {
    const onUnauthorized = vi.fn()
    registerUnauthorizedHandler(onUnauthorized)
    failWith(401, { message: 'nope' })

    await expect(get('/issues')).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('does not call it on other statuses', async () => {
    const onUnauthorized = vi.fn()
    registerUnauthorizedHandler(onUnauthorized)
    failWith(403, {})

    await expect(get('/issues')).rejects.toBeDefined()
    expect(onUnauthorized).not.toHaveBeenCalled()
  })
})

describe('EVERY failure normalises to one ApiError shape', () => {
  it('a 404 with a message body', async () => {
    failWith(404, { message: 'Issue not found' })
    const err = await get('/issues/x').catch((e: unknown) => e)

    expect(isApiError(err)).toBe(true)
    expect(err).toMatchObject({ status: 404, code: '404', message: 'Issue not found' })
    expect((err as ApiError).correlationId).toBeTruthy()
  })

  it('a 400 keeps field-level details for the form to render', async () => {
    // Without these a validation failure can only be shown as a generic toast,
    // with no way to point at the offending control.
    failWith(400, { message: 'Invalid', details: [{ field: 'newStatus', message: 'not allowed' }] })
    const err = (await get('/issues').catch((e: unknown) => e)) as ApiError

    expect(err.details).toEqual([{ field: 'newStatus', message: 'not allowed' }])
  })

  it('drops malformed details rather than passing junk to a form', async () => {
    failWith(400, { message: 'Invalid', details: [{ nope: 1 }] })
    const err = (await get('/issues').catch((e: unknown) => e)) as ApiError
    expect(err.details).toBeUndefined()
  })

  it('reads a Blob error body — the case 05 names explicitly', async () => {
    // When a request asked for binary, an ERROR response also arrives as a Blob,
    // so `data.message` sees nothing and the user gets axios's generic message
    // instead of the real reason.
    failWith(500, new Blob([JSON.stringify({ message: 'Export failed upstream' })]))
    const err = (await getBlob('/issues/export').catch((e: unknown) => e)) as ApiError

    expect(err.message).toBe('Export failed upstream')
  })

  it('a dropped connection becomes NETWORK_ERROR', async () => {
    stub(async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config, {})
    })
    const err = (await get('/issues').catch((e: unknown) => e)) as ApiError

    expect(isApiError(err)).toBe(true)
    expect(err.code).toBe('NETWORK_ERROR')
    expect(err.status).toBeNull()
  })

  it('a timeout is distinguished from a network failure', async () => {
    // They need different words in front of a user, and lumping them together
    // hides an overloaded backend behind "check your connection".
    stub(async (config) => {
      throw new AxiosError('timeout exceeded', 'ECONNABORTED', config, {})
    })
    const err = (await get('/issues').catch((e: unknown) => e)) as ApiError

    expect(err.code).toBe('TIMEOUT')
    expect(err.message).toMatch(/timed out/i)
  })

  it('a thrown NON-axios value still normalises', async () => {
    // The interceptor's last resort. Anything can be thrown, and a caller
    // written against ApiError must not receive a bare string.
    stub(async () => {
      throw 'something odd'
    })
    const err = (await get('/issues').catch((e: unknown) => e)) as ApiError

    expect(isApiError(err)).toBe(true)
    expect(err.code).toBe('UNKNOWN_ERROR')
  })
})

describe('request bodies and query strings', () => {
  it('sends JSON with a Content-Type', async () => {
    respondWith({ data: {} })
    await post('/issues', { title: 'x' })

    expect(header(0, 'Content-Type')).toBe('application/json')
    expect(seen[0].data).toBe(JSON.stringify({ title: 'x' }))
  })

  it('NEVER sets Content-Type for FormData', async () => {
    /*
     * A multipart body needs a generated `boundary`; setting the header
     * suppresses it and the server fails to parse a request that looks correct
     * in devtools.
     *
     * ⚠️ ASSERTED ON A REQUEST INTERCEPTOR, NOT ON THE ADAPTER, and the reason
     * is a real environment limitation. Axios's `transformRequest` runs AFTER
     * interceptors, and in jsdom it does not recognise jsdom's own `FormData` —
     * so by the time the adapter sees the config, axios has relabelled the body
     * `application/x-www-form-urlencoded`. That is a jsdom artifact; in a
     * browser axios detects FormData and lets the platform set the boundary.
     *
     * Asserting at the adapter would therefore pin the artifact rather than this
     * client's behaviour. The interceptor sees exactly what `postForm` set,
     * which is the thing under test.
     */
    let sentContentType: unknown = 'not captured'
    const id = apiClient.interceptors.request.use((config) => {
      sentContentType = config.headers?.get?.('Content-Type')
      return config
    })
    respondWith({ data: {} })
    const form = new FormData()
    form.append('file', new Blob(['x']), 'x.txt')

    try {
      await postForm('/upload', form)
    } finally {
      apiClient.interceptors.request.eject(id)
    }

    expect(sentContentType).toBeUndefined()
  })

  it('never sends a boundary-less multipart/form-data', async () => {
    // The regression that matters, and the one a well-meaning "tidy up" of the
    // `undefined` above would introduce.
    respondWith({ data: {} })
    const form = new FormData()
    form.append('file', new Blob(['x']), 'x.txt')
    await postForm('/upload', form)

    expect(header(0, 'Content-Type')).not.toBe('multipart/form-data')
  })

  it('passes params through for axios to serialise', async () => {
    respondWith({ data: {} })
    await get('/issues', { params: { page: 0, size: 20, status: ['OPEN', 'CLOSED'] } })

    expect(seen[0].params).toEqual({ page: 0, size: 20, status: ['OPEN', 'CLOSED'] })
  })

  it('addresses the one origin', async () => {
    respondWith({ data: {} })
    await get('/issues')
    expect(lastUrl()).toBe('/api/v1/issues')
  })
})

describe('responses', () => {
  it('unwraps the body', async () => {
    respondWith({ data: { id: 'EE-1' } })
    await expect(get<{ id: string }>('/issues/EE-1')).resolves.toEqual({ id: 'EE-1' })
  })

  it('returns undefined for a 204', async () => {
    respondWith({ status: 204 })
    await expect(del('/issues/EE-1')).resolves.toBeUndefined()
  })

  it('getBlob returns the bytes AND the Content-Disposition filename', async () => {
    respondWith({ data: new Blob(['col1,col2']), headers: { 'content-disposition': 'attachment; filename="export.csv"' } })
    const out = await getBlob('/issues/export')

    expect(out.filename).toBe('export.csv')
    expect(await out.blob.text()).toBe('col1,col2')
  })

  it('parses an RFC 5987 encoded filename', async () => {
    respondWith({ data: new Blob(['x']), headers: { 'content-disposition': "attachment; filename*=UTF-8''r%C3%A9sum%C3%A9.csv" } })
    expect((await getBlob('/x')).filename).toBe('résumé.csv')
  })

  it('leaves the filename undefined when the header is absent', async () => {
    respondWith({ data: new Blob(['x']) })
    expect((await getBlob('/x')).filename).toBeUndefined()
  })
})

describe('the full verb set', () => {
  // `put`, `patch` and `postBlob` exist because 05's services layer needs them,
  // and an unexercised helper is one nobody has proved unwraps its response.
  it.each([
    ['put', () => put<{ ok: boolean }>('/issues/EE-1', { title: 'x' })],
    ['patch', () => patch<{ ok: boolean }>('/issues/EE-1', { title: 'x' })],
  ])('%s sends its body and unwraps the response', async (verb, call) => {
    respondWith({ data: { ok: true } })
    await expect(call()).resolves.toEqual({ ok: true })
    expect(seen[0].method).toBe(verb)
    expect(seen[0].data).toBe(JSON.stringify({ title: 'x' }))
  })

  it('postBlob returns the bytes and the filename, like getBlob', async () => {
    respondWith({
      data: new Blob(['a,b']),
      headers: { 'content-disposition': 'attachment; filename="selected.csv"' },
    })
    const out = await postBlob('/issues/export-selected', { ids: ['EE-1'] })

    expect(out.filename).toBe('selected.csv')
    expect(await out.blob.text()).toBe('a,b')
    expect(seen[0].responseType).toBe('blob')
  })
})

describe('the production HTTPS tripwire', () => {
  // 05: "throw at boot if a production build's base URL is not HTTPS. Cheap, and
  // it catches a misconfigured environment at startup rather than on the first
  // request." Asserted through the factory because the module-level instance is
  // already constructed by the time a test runs.
  it('does NOT throw in a dev build, whatever the scheme', () => {
    expect(() => createHttpClient('/api/v1', 'VITE_API_BASE_URL')).not.toThrow()
  })

  it('throws in a production build on a non-HTTPS base URL, naming the variable', () => {
    vi.stubEnv('PROD', true)
    try {
      expect(() => createHttpClient('http://api.internal/v1', 'VITE_API_BASE_URL')).toThrow(
        /VITE_API_BASE_URL must be HTTPS/,
      )
      // An undefined base URL is the likelier misconfiguration and must fail too.
      expect(() => createHttpClient(undefined, 'VITE_API_BASE_URL')).toThrow(/must be HTTPS/)
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it('allows HTTPS in a production build', () => {
    vi.stubEnv('PROD', true)
    try {
      expect(() => createHttpClient('https://api.example.com/v1', 'VITE_API_BASE_URL')).not.toThrow()
    } finally {
      vi.unstubAllEnvs()
    }
  })
})

describe('malformed responses do not become a second failure', () => {
  // Both paths below are `catch` fallbacks. They exist because the thing being
  // parsed comes from a server having a bad day — an error body that is not JSON,
  // a filename header that is not valid percent-encoding — and a throw inside the
  // ERROR HANDLER replaces a diagnosable failure with an opaque one.

  it('a non-JSON Blob error body falls back to axios\u2019s own message', async () => {
    // A proxy returning an HTML 502 page, requested as a blob.
    failWith(502, new Blob(['<html>Bad Gateway</html>']))
    const err = (await getBlob('/issues/export').catch((e: unknown) => e)) as ApiError

    expect(isApiError(err)).toBe(true)
    expect(err.status).toBe(502)
    expect(err.message).toBeTruthy()
  })

  it('an undecodable RFC 5987 filename falls back to the raw value', async () => {
    // `%E0%A4%A` is a truncated escape — `decodeURIComponent` throws on it.
    // Losing the download because its NAME was malformed would be the wrong
    // trade; the bytes are still good.
    respondWith({
      data: new Blob(['x']),
      headers: { 'content-disposition': "attachment; filename*=UTF-8''bad%E0%A4%A" },
    })
    const out = await getBlob('/x')

    expect(out.filename).toBe('bad%E0%A4%A')
    expect(await out.blob.text()).toBe('x')
  })
})
