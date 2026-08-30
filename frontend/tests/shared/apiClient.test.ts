// Tests for the centralised HTTP client.
//
// ─── WHAT IS ACTUALLY WORTH PINNING HERE ─────────────────────────────────────
//
// Not "fetch was called". The value of this module is that EVERY failure arrives
// in one shape — a 404, a timeout, a dropped connection and a non-JSON 502 page
// all become the same `ApiError` with a correlation id. A caller written against
// that guarantee breaks the moment one path leaks a raw `TypeError`, and the
// only place to catch that is here.
//
// The seams matter too: they are the whole reason auth can be added later
// without editing the client, and a seam nobody has exercised is a seam that
// does not work.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  __resetHttpSeams,
  apiClient,
  del,
  get,
  getBlob,
  isApiError,
  notificationApiClient,
  post,
  postForm,
  registerAccessTokenGetter,
  registerUnauthorizedHandler,
  type ApiError,
} from '@/shared/http'

/**
 * A fetch stub answering with the given response.
 *
 * ⚠️ BUILDS A FRESH `Response` PER CALL. A `Response` body is a stream that can
 * be read exactly once, so a stub returning one shared instance throws "Body has
 * already been read" on the second request — which is precisely the multi-call
 * tests below.
 */
const respondWith = (init: { status?: number; body?: unknown; headers?: Record<string, string> }) =>
  vi.fn(async () =>
    new Response(
      init.body === undefined ? null : typeof init.body === 'string' ? init.body : JSON.stringify(init.body),
      { status: init.status ?? 200, headers: init.headers },
    ),
  )

let fetchSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  __resetHttpSeams()
})

afterEach(() => {
  fetchSpy?.mockRestore()
  __resetHttpSeams()
})

const stub = (impl: unknown) => {
  fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(impl as typeof fetch)
  return fetchSpy
}

/** The Request/RequestInit pair the client passed to fetch. */
const lastCall = () => fetchSpy.mock.calls[0] as unknown as [string, RequestInit]

describe('two clients, two base paths', () => {
  it('they are separate instances on different base URLs', () => {
    // The notification service is a different base path, not a route on the
    // first — a single client would send its calls to Issue Management.
    expect(apiClient).not.toBe(notificationApiClient)
    expect(apiClient.baseUrl).not.toBe(notificationApiClient.baseUrl)
  })

  it('a helper sends to the client it was given, not the default', () => {
    stub(respondWith({ body: {} }))
    void get('/thing', undefined, notificationApiClient)
    expect(lastCall()[0]).toContain(notificationApiClient.baseUrl)
  })
})

describe('every request carries a correlation id', () => {
  it('sets X-Correlation-ID', async () => {
    stub(respondWith({ body: { ok: true } }))
    await get('/issues')
    const headers = lastCall()[1].headers as Record<string, string>
    expect(headers['X-Correlation-ID']).toBeTruthy()
  })

  it('uses a DIFFERENT id per request', async () => {
    // A shared id would make two concurrent failures indistinguishable in a log,
    // which is the one thing the id exists to prevent.
    stub(respondWith({ body: {} }))
    await get('/a')
    await get('/b')
    const first = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<string, string>
    const second = (fetchSpy.mock.calls[1][1] as RequestInit).headers as Record<string, string>
    expect(first['X-Correlation-ID']).not.toBe(second['X-Correlation-ID'])
  })
})

describe('the auth seams', () => {
  it('sends no Authorization header until a token source is registered', async () => {
    stub(respondWith({ body: {} }))
    await get('/issues')
    expect((lastCall()[1].headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('attaches a Bearer token once one is registered', async () => {
    registerAccessTokenGetter(() => 'tok-123')
    stub(respondWith({ body: {} }))
    await get('/issues')
    expect((lastCall()[1].headers as Record<string, string>).Authorization).toBe('Bearer tok-123')
  })

  it('reads the token PER REQUEST, so a refresh is picked up', async () => {
    // Capturing it once would send a stale token for the life of the session —
    // the exact bug a refresh flow is meant to fix.
    let token = 'first'
    registerAccessTokenGetter(() => token)
    stub(respondWith({ body: {} }))
    await get('/a')
    token = 'second'
    await get('/b')
    const second = (fetchSpy.mock.calls[1][1] as RequestInit).headers as Record<string, string>
    expect(second.Authorization).toBe('Bearer second')
  })

  it('calls the unauthorized handler on a 401 — and still rejects', async () => {
    const onUnauthorized = vi.fn()
    registerUnauthorizedHandler(onUnauthorized)
    stub(respondWith({ status: 401, body: { message: 'nope' } }))

    await expect(get('/issues')).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('does not call it on other statuses', async () => {
    const onUnauthorized = vi.fn()
    registerUnauthorizedHandler(onUnauthorized)
    stub(respondWith({ status: 403, body: {} }))

    await expect(get('/issues')).rejects.toBeDefined()
    expect(onUnauthorized).not.toHaveBeenCalled()
  })
})

describe('EVERY failure normalises to one ApiError shape', () => {
  it('a 404 with a message body', async () => {
    stub(respondWith({ status: 404, body: { message: 'Issue not found' } }))
    const err = await get('/issues/x').catch((e: unknown) => e)

    expect(isApiError(err)).toBe(true)
    expect(err).toMatchObject({ status: 404, code: '404', message: 'Issue not found' })
    expect((err as ApiError).correlationId).toBeTruthy()
  })

  it('a 400 keeps field-level details for the form to render', async () => {
    // Without these a validation failure can only be shown as a generic toast,
    // with no way to point at the offending control.
    stub(respondWith({ status: 400, body: { message: 'Invalid', details: [{ field: 'newStatus', message: 'not allowed' }] } }))
    const err = (await get('/issues').catch((e: unknown) => e)) as ApiError

    expect(err.details).toEqual([{ field: 'newStatus', message: 'not allowed' }])
  })

  it('drops malformed details rather than passing junk to a form', async () => {
    stub(respondWith({ status: 400, body: { message: 'Invalid', details: [{ nope: 1 }] } }))
    const err = (await get('/issues').catch((e: unknown) => e)) as ApiError
    expect(err.details).toBeUndefined()
  })

  it('a non-JSON error body still yields an ApiError, not a parse crash', async () => {
    // A proxy returning an HTML 502 page is the realistic case.
    stub(respondWith({ status: 502, body: '<html>Bad Gateway</html>' }))
    const err = (await get('/issues').catch((e: unknown) => e)) as ApiError

    expect(isApiError(err)).toBe(true)
    expect(err.status).toBe(502)
  })

  it('a dropped connection becomes NETWORK_ERROR, not a raw TypeError', async () => {
    stub(() => Promise.reject(new TypeError('Failed to fetch')))
    const err = (await get('/issues').catch((e: unknown) => e)) as ApiError

    expect(isApiError(err)).toBe(true)
    expect(err.code).toBe('NETWORK_ERROR')
    expect(err.status).toBeNull()
  })

  it('a timeout is distinguished from a network failure', async () => {
    // They need different words in front of a user, and lumping them together
    // hides an overloaded backend behind "check your connection".
    stub(() => Promise.reject(new DOMException('timeout', 'TimeoutError')))
    const err = (await get('/issues').catch((e: unknown) => e)) as ApiError

    expect(err.code).toBe('TIMEOUT')
    expect(err.message).toMatch(/timed out/i)
  })

  it('aborts the request once the timeout elapses', async () => {
    stub((_url: string, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
      }),
    )
    const err = (await get('/slow', { timeoutMs: 10 }).catch((e: unknown) => e)) as ApiError
    expect(err.code).toBe('TIMEOUT')
  })
})

describe('request bodies and query strings', () => {
  it('sends JSON with a Content-Type', async () => {
    stub(respondWith({ body: {} }))
    await post('/issues', { title: 'x' })
    const [, init] = lastCall()

    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
    expect(init.body).toBe(JSON.stringify({ title: 'x' }))
  })

  it('NEVER sets Content-Type for FormData', async () => {
    // A multipart body needs a generated `boundary`; setting the header
    // suppresses it and the server fails to parse a request that looks correct
    // in devtools. This is the trap the client's own comment documents.
    stub(respondWith({ body: {} }))
    const form = new FormData()
    form.append('file', new Blob(['x']), 'x.txt')
    await postForm('/upload', form)

    expect((lastCall()[1].headers as Record<string, string>)['Content-Type']).toBeUndefined()
  })

  it('omits empty params instead of sending "undefined"', async () => {
    stub(respondWith({ body: {} }))
    await get('/issues', { params: { page: 0, size: 20, search: '', owner: undefined, flag: null } })

    const url = lastCall()[0]
    expect(url).toContain('page=0')
    expect(url).toContain('size=20')
    expect(url).not.toContain('search=')
    expect(url).not.toContain('owner')
    expect(url).not.toContain('undefined')
  })

  it('repeats the key for an array rather than comma-joining', async () => {
    // Spring binds repeated keys; a comma-joined value arrives as one string
    // containing a comma and matches no enum.
    stub(respondWith({ body: {} }))
    await get('/issues', { params: { status: ['OPEN', 'CLOSED'] } })

    const url = lastCall()[0]
    expect(url).toContain('status=OPEN')
    expect(url).toContain('status=CLOSED')
    expect(url).not.toContain('OPEN%2CCLOSED')
  })
})

describe('responses', () => {
  it('unwraps the JSON body', async () => {
    stub(respondWith({ body: { id: 'EE-1' } }))
    await expect(get<{ id: string }>('/issues/EE-1')).resolves.toEqual({ id: 'EE-1' })
  })

  it('returns undefined for a 204, rather than failing to parse an empty body', async () => {
    stub(respondWith({ status: 204 }))
    await expect(del('/issues/EE-1')).resolves.toBeUndefined()
  })

  it('getBlob returns the bytes AND the Content-Disposition filename', async () => {
    stub(respondWith({ body: 'col1,col2', headers: { 'content-disposition': 'attachment; filename="export.csv"' } }))
    const out = await getBlob('/issues/export')

    expect(out.filename).toBe('export.csv')
    expect(await out.blob.text()).toBe('col1,col2')
  })

  it('parses an RFC 5987 encoded filename', async () => {
    stub(respondWith({ body: 'x', headers: { 'content-disposition': "attachment; filename*=UTF-8''r%C3%A9sum%C3%A9.csv" } }))
    expect((await getBlob('/x')).filename).toBe('résumé.csv')
  })

  it('leaves the filename undefined when the header is absent', async () => {
    stub(respondWith({ body: 'x' }))
    expect((await getBlob('/x')).filename).toBeUndefined()
  })
})
