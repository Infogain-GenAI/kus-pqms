// Tests for the logging seam, the monitoring sink and the debounce hook.
//
// The property worth pinning across all three is the same one: THEY MUST NOT
// MAKE THINGS WORSE. A logger that throws, a monitoring sink that takes down the
// path it monitors, or a debounced callback that fires after unmount are each a
// bug introduced by the thing meant to catch bugs.
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { useState } from 'react'
import {
  createMonitoringTransport,
  logger,
  resetLoggerTransport,
  setLoggerTransport,
  type LoggerTransport,
} from '@/shared/logger'
import { serializeError } from '@/shared/monitoring'
import { useDebouncedCallback, useDebouncedValue } from '@/shared/useDebouncedCallback'

/** A transport that records instead of printing. */
function recorder() {
  const calls: { level: string; arg: unknown; context?: unknown }[] = []
  const t: LoggerTransport = {
    error: (err, context) => calls.push({ level: 'error', arg: err, context }),
    warn: (m, context) => calls.push({ level: 'warn', arg: m, context }),
    info: (m, context) => calls.push({ level: 'info', arg: m, context }),
  }
  return { calls, t }
}

describe('the logger is a swappable seam', () => {
  it('routes every level through the installed transport, with context', () => {
    const { calls, t } = recorder()
    setLoggerTransport(t)
    try {
      logger.error(new Error('boom'), { issueId: 'EE-1' })
      logger.warn('careful')
      logger.info('fyi')
    } finally {
      resetLoggerTransport()
    }

    expect(calls.map((c) => c.level)).toEqual(['error', 'warn', 'info'])
    // Structured context survives — the reason this exists rather than `console`.
    expect(calls[0].context).toEqual({ issueId: 'EE-1' })
  })

  it('keeps working after the transport is reset', () => {
    const { calls, t } = recorder()
    setLoggerTransport(t)
    resetLoggerTransport()
    // Back on console; the recorder must not see this.
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    logger.info('after reset')
    spy.mockRestore()
    expect(calls).toHaveLength(0)
  })
})

describe('the monitoring transport forwards errors without owning them', () => {
  it('calls the base transport AND the remote sink', () => {
    const { calls, t } = recorder()
    const reported: unknown[] = []
    const wrapped = createMonitoringTransport({ report: (e) => reported.push(e), base: t })

    const err = new Error('boom')
    wrapped.error(err, { at: 'save' })

    expect(calls[0].arg).toBe(err)
    expect(reported).toEqual([err])
  })

  it('does NOT forward warn or info — a remote budget is not for noise', () => {
    const { t } = recorder()
    const reported: unknown[] = []
    const wrapped = createMonitoringTransport({ report: (e) => reported.push(e), base: t })

    wrapped.warn('careful')
    wrapped.info('fyi')
    expect(reported).toHaveLength(0)
  })

  it('survives a throwing sink, and still logs the original error first', () => {
    // THE IMPORTANT ONE. A misconfigured DSN must not turn a logged error into
    // an unhandled throw inside someone's catch block.
    const { calls, t } = recorder()
    const wrapped = createMonitoringTransport({
      report: () => { throw new Error('sink is down') },
      base: t,
    })

    const original = new Error('the real problem')
    expect(() => wrapped.error(original)).not.toThrow()

    // The original was logged BEFORE the sink was tried, so it is not lost…
    expect(calls[0].arg).toBe(original)
    // …and the sink's own failure is reported rather than swallowed.
    expect((calls[1].context as { source?: string })?.source).toBe('monitoring.report')
  })
})

describe('serializeError copes with anything that can be thrown', () => {
  // `throw` accepts any value. A reporter that assumes `err.message` turns one
  // error into two.
  it('keeps message and stack from a real Error', () => {
    const out = serializeError(new Error('boom'), { a: 1 })
    expect(out.message).toBe('boom')
    expect(out.stack).toBeTruthy()
    expect(out.context).toEqual({ a: 1 })
    expect(out.timestamp).toBeTruthy()
  })

  it.each([
    ['a string', 'plain failure', 'plain failure'],
    ['a number', 42, '42'],
    ['null', null, 'null'],
  ])('handles %s', (_label, thrown, expected) => {
    expect(serializeError(thrown).message).toBe(expected)
  })

  it('does not throw on a circular object', () => {
    const circular: Record<string, unknown> = { a: 1 }
    circular.self = circular
    const out = serializeError(circular)
    expect(out.message).toContain('Unserialisable')
  })

  it('records the page the error happened on', () => {
    expect(serializeError(new Error('x')).url).toBe(window.location.href)
  })
})

// ─── Debounce ─────────────────────────────────────────────────────────────────

describe('useDebouncedCallback', () => {
  function Harness({ onFire, wait = 50 }: { onFire: (v: string) => void; wait?: number }) {
    const debounced = useDebouncedCallback(onFire, wait)
    const [v, setV] = useState('')
    return (
      <input
        aria-label="field"
        value={v}
        onChange={(e) => { setV(e.target.value); debounced(e.target.value) }}
      />
    )
  }

  it('fires once for a burst of calls, with the LAST value', async () => {
    const fired: string[] = []
    render(<Harness onFire={(v) => fired.push(v)} />)
    const input = screen.getByLabelText('field')

    for (const v of ['c', 'ch', 'cha', 'char']) fireEvent.change(input, { target: { value: v } })

    await waitFor(() => expect(fired).toHaveLength(1))
    expect(fired[0]).toBe('char')
  })

  it('does not fire at all if the wait never elapses between calls', () => {
    const fired: string[] = []
    render(<Harness onFire={(v) => fired.push(v)} wait={10_000} />)
    fireEvent.change(screen.getByLabelText('field'), { target: { value: 'x' } })
    expect(fired).toHaveLength(0)
  })

  it('does not fire after unmount', async () => {
    // A callback firing into an unmounted tree is the classic debounce leak.
    const fired: string[] = []
    const { unmount } = render(<Harness onFire={(v) => fired.push(v)} />)
    fireEvent.change(screen.getByLabelText('field'), { target: { value: 'x' } })
    unmount()

    await act(async () => { await new Promise((r) => setTimeout(r, 120)) })
    expect(fired).toHaveLength(0)
  })

  it('invokes the CURRENT callback, not the one captured when the timer started', async () => {
    // The stale-closure trap: the component re-renders on every keystroke, so a
    // captured callback would read state one render behind.
    const seen: string[] = []
    function Stale() {
      const [n, setN] = useState(0)
      const debounced = useDebouncedCallback(() => seen.push(`n=${n}`), 30)
      return (
        <>
          <button onClick={() => setN((x) => x + 1)}>bump</button>
          <button onClick={() => debounced()}>go</button>
        </>
      )
    }
    render(<Stale />)

    fireEvent.click(screen.getByText('go'))
    fireEvent.click(screen.getByText('bump'))
    fireEvent.click(screen.getByText('bump'))

    await waitFor(() => expect(seen).toHaveLength(1))
    // 2, not 0 — it read the latest render's value.
    expect(seen[0]).toBe('n=2')
  })
})

describe('useDebouncedValue', () => {
  function ValueHarness() {
    const [v, setV] = useState('')
    const settled = useDebouncedValue(v, 40)
    return (
      <>
        <input aria-label="field" value={v} onChange={(e) => setV(e.target.value)} />
        <span data-testid="live">{v}</span>
        <span data-testid="settled">{settled}</span>
      </>
    )
  }

  it('updates the live value immediately and the settled value late', async () => {
    // THE SPLIT THAT MATTERS: a controlled input must never lag the keyboard, so
    // only the derived value is deferred.
    render(<ValueHarness />)
    fireEvent.change(screen.getByLabelText('field'), { target: { value: 'charge' } })

    expect(screen.getByTestId('live').textContent).toBe('charge')
    expect(screen.getByTestId('settled').textContent).toBe('')

    await waitFor(() => expect(screen.getByTestId('settled').textContent).toBe('charge'))
  })

  it('settles only once for a burst', async () => {
    render(<ValueHarness />)
    const input = screen.getByLabelText('field')
    for (const v of ['c', 'ch', 'cha']) fireEvent.change(input, { target: { value: v } })

    await waitFor(() => expect(screen.getByTestId('settled').textContent).toBe('cha'))
  })
})

describe('the monitoring sink actually sends something', () => {
  // These cover the transport path itself. Without them `postReport` and
  // `initMonitoring` are code nobody has ever run — and the first time they run
  // would be in production, on an error, which is the worst place to find out.
  const withBeacon = (impl: (url: string, data?: BodyInit | null) => boolean) => {
    const real = navigator.sendBeacon
    Object.defineProperty(navigator, 'sendBeacon', { configurable: true, writable: true, value: impl })
    return () => {
      if (real) Object.defineProperty(navigator, 'sendBeacon', { configurable: true, writable: true, value: real })
      else delete (navigator as unknown as Record<string, unknown>).sendBeacon
    }
  }

  it('stays dormant with no DSN — no transport swap, no request', async () => {
    // THE DEFAULT, and the one that must never regress: installing this module
    // changes nothing until someone configures it.
    const sent: string[] = []
    const restore = withBeacon((url) => { sent.push(url); return true })
    vi.stubEnv('VITE_MONITORING_DSN', '')
    try {
      const { initMonitoring } = await import('@/shared/monitoring')
      initMonitoring()
      logger.error(new Error('boom'))
      expect(sent).toHaveLength(0)
    } finally {
      restore()
      vi.unstubAllEnvs()
      resetLoggerTransport()
    }
  })

  it('with a DSN, beacons the serialized error to it', async () => {
    const sent: { url: string; body: BodyInit | null | undefined }[] = []
    const restore = withBeacon((url, data) => { sent.push({ url, body: data }); return true })
    vi.stubEnv('VITE_MONITORING_DSN', 'https://sink.example/report')
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const { initMonitoring } = await import('@/shared/monitoring')
      initMonitoring()
      logger.error(new Error('boom'), { issueId: 'EE-1' })

      expect(sent).toHaveLength(1)
      expect(sent[0].url).toBe('https://sink.example/report')
      const text = await (sent[0].body as Blob).text()
      const payload = JSON.parse(text)
      expect(payload.message).toBe('boom')
      expect(payload.context).toEqual({ issueId: 'EE-1' })
    } finally {
      consoleErr.mockRestore()
      restore()
      vi.unstubAllEnvs()
      resetLoggerTransport()
    }
  })

  it('falls back to keepalive fetch where sendBeacon is unavailable', async () => {
    // sendBeacon survives page unload, which is why it is preferred; but it is
    // not universal, and losing the report entirely is not an acceptable
    // fallback.
    const real = navigator.sendBeacon
    delete (navigator as unknown as Record<string, unknown>).sendBeacon
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubEnv('VITE_MONITORING_DSN', 'https://sink.example/report')
    try {
      const { initMonitoring } = await import('@/shared/monitoring')
      initMonitoring()
      logger.error(new Error('boom'))

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('https://sink.example/report')
      expect((init as RequestInit).keepalive).toBe(true)
    } finally {
      consoleErr.mockRestore()
      fetchSpy.mockRestore()
      if (real) Object.defineProperty(navigator, 'sendBeacon', { configurable: true, writable: true, value: real })
      vi.unstubAllEnvs()
      resetLoggerTransport()
    }
  })
})
