// Tests for the route-subtree error boundary.
//
// Ported from Vue's `tests/components/ErrorBoundary.spec.ts` — its two cases
// (healthy children pass through; a throwing child renders the fallback and
// logs once) are the first block below, in React's idiom.
//
// ─── THE REST ARE REACT-SPECIFIC AND NOT OPTIONAL ────────────────────────────
//
// Vue's boundary resets by unmounting with the route. React reuses a component
// instance when the same element type stays in the same position, so a boundary
// that captured an error on one route STAYS BROKEN after navigating to a healthy
// one unless something clears it. That failure has no Vue counterpart, cannot be
// seen by reading the component, and traps the user with no way out but a
// reload — so it gets the most coverage here.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { MemoryRouter, Route, Routes, Link, RouterProvider, createMemoryRouter } from 'react-router'
import { RouteErrorBoundary } from '@/app/RouteErrorBoundary'
import { ErrorBoundary } from '@/app/ErrorBoundary'
import { RoutedOutlet } from '@/app/RoutedOutlet'
import { resetLoggerTransport, setLoggerTransport, type LoggerTransport } from '@/shared/logger'

/** Records what the boundary reported instead of printing it. */
function recorder() {
  const errors: { err: unknown; context?: Record<string, unknown> }[] = []
  const t: LoggerTransport = {
    error: (err, context) => errors.push({ err, context }),
    warn: () => {},
    info: () => {},
  }
  return { errors, t }
}

let restoreConsole: () => void

beforeEach(() => {
  /*
   * React logs every caught error to console.error itself, in addition to
   * calling componentDidCatch. That is React's own output, not the app's, and
   * silencing it keeps a deliberate throw from looking like a suite failure.
   */
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  restoreConsole = () => spy.mockRestore()
})

afterEach(() => {
  restoreConsole()
  resetLoggerTransport()
})

/** Throws on render when `explode` is true. */
function Boom({ explode = true, message = 'boom' }: { explode?: boolean; message?: string }) {
  if (explode) throw new Error(message)
  return <div>healthy content</div>
}

const fallback = () => screen.queryByTestId('error-boundary-fallback')
const retry = () => screen.getByTestId('error-boundary-retry')

describe('the two cases Vue pins', () => {
  it('renders its children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <div>healthy content</div>
      </ErrorBoundary>,
    )
    expect(screen.getByText('healthy content')).toBeTruthy()
    expect(fallback()).toBeNull()
  })

  it('renders the fallback and logs ONCE when a child throws', () => {
    const { errors, t } = recorder()
    setLoggerTransport(t)

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )

    const alert = screen.getByRole('alert')
    expect(alert.textContent).toContain('Something went wrong')
    expect(retry()).toBeTruthy()
    expect(errors).toHaveLength(1)
  })
})

describe('what gets reported', () => {
  it('reports the error itself, not a stringified copy of it', () => {
    // A stringified error loses the stack, which is the only part worth having.
    const { errors, t } = recorder()
    setLoggerTransport(t)
    render(<ErrorBoundary><Boom message="the real cause" /></ErrorBoundary>)

    expect(errors[0].err).toBeInstanceOf(Error)
    expect((errors[0].err as Error).message).toBe('the real cause')
  })

  it('attaches the component stack — the field the error itself does not carry', () => {
    const { errors, t } = recorder()
    setLoggerTransport(t)
    render(<ErrorBoundary><Boom /></ErrorBoundary>)

    expect(errors[0].context?.componentStack).toBeTruthy()
  })

  it('names the source, so a log entry says WHERE it failed', () => {
    const { errors, t } = recorder()
    setLoggerTransport(t)
    render(<ErrorBoundary source="route:/issues"><Boom /></ErrorBoundary>)

    expect(errors[0].context?.source).toBe('route:/issues')
  })

  it('shows a reference the user can quote, and logs the same one', () => {
    const { errors, t } = recorder()
    setLoggerTransport(t)
    render(<ErrorBoundary><Boom /></ErrorBoundary>)

    const shown = screen.getByText(/^Reference: /).textContent?.replace('Reference: ', '')
    expect(shown).toBeTruthy()
    // The pair is the point: a reference the user reads out has to find the log
    // entry, or it is decoration.
    expect(errors[0].context?.correlationId).toBe(shown)
  })

  it('REUSES an ApiError correlation id rather than minting a new one', () => {
    // That id already ties the failure to a specific server-side request.
    // Minting a fresh one here would break the link for the errors most worth
    // tracing.
    const { errors, t } = recorder()
    setLoggerTransport(t)

    function ThrowApiError(): never {
      throw Object.assign(new Error('404'), { status: 404, code: '404', correlationId: 'cid-from-server' })
    }
    render(<ErrorBoundary><ThrowApiError /></ErrorBoundary>)

    expect(errors[0].context?.correlationId).toBe('cid-from-server')
    expect(screen.getByText(/cid-from-server/)).toBeTruthy()
  })
})

describe('recovery — the capability the existing chunk boundary lacks', () => {
  it('Try again clears the error and re-renders the children', () => {
    // The existing fallback is a dead end telling the user to navigate away. A
    // transient render error should cost one click, not a navigation.
    function Flaky() {
      const [broken, setBroken] = useState(true)
      return (
        <>
          <button onClick={() => setBroken(false)}>fix it</button>
          <ErrorBoundary>
            <Boom explode={broken} />
          </ErrorBoundary>
        </>
      )
    }
    render(<Flaky />)
    expect(fallback()).toBeTruthy()

    fireEvent.click(screen.getByText('fix it'))
    fireEvent.click(retry())

    expect(fallback()).toBeNull()
    expect(screen.getByText('healthy content')).toBeTruthy()
  })

  it('re-catches when the cause has not gone away', () => {
    // Retry must not clear the fallback permanently on a still-broken subtree —
    // that would show a blank region instead of an error.
    render(<ErrorBoundary><Boom /></ErrorBoundary>)
    fireEvent.click(retry())
    expect(fallback()).toBeTruthy()
  })
})

describe('REGRESSION — a captured error must not survive navigation', () => {
  it('clears when resetKey changes', () => {
    const { rerender } = render(
      <ErrorBoundary resetKey="/a">
        <Boom />
      </ErrorBoundary>,
    )
    expect(fallback()).toBeTruthy()

    rerender(
      <ErrorBoundary resetKey="/b">
        <div>healthy content</div>
      </ErrorBoundary>,
    )
    expect(fallback()).toBeNull()
    expect(screen.getByText('healthy content')).toBeTruthy()
  })

  it('keeps the fallback while the key is unchanged', () => {
    const { rerender } = render(<ErrorBoundary resetKey="/a"><Boom /></ErrorBoundary>)
    rerender(<ErrorBoundary resetKey="/a"><Boom /></ErrorBoundary>)
    expect(fallback()).toBeTruthy()
  })
})

describe('RoutedOutlet — the boundary every layout mounts', () => {
  const Harness = () => (
    <MemoryRouter initialEntries={['/broken']}>
      <div>
        <Link to="/healthy">go healthy</Link>
        <Routes>
          <Route element={<RoutedOutlet />}>
            <Route path="/broken" element={<Boom />} />
            <Route path="/healthy" element={<div>healthy content</div>} />
          </Route>
        </Routes>
      </div>
    </MemoryRouter>
  )

  it('catches a routed screen render error', () => {
    render(<Harness />)
    expect(fallback()).toBeTruthy()
  })

  it('leaves the surrounding chrome interactive, so the user can leave', () => {
    // The reason the boundary sits INSIDE the layout rather than above it. A
    // boundary wrapping the whole page would take the navigation down with the
    // screen and leave no way out but a reload.
    render(<Harness />)
    expect(screen.getByText('go healthy')).toBeTruthy()
  })

  it('recovers on navigation — the failure case the resetKey exists for', () => {
    // Without the key React keeps this boundary instance mounted across the
    // route change, and the user sees the fallback on a route that renders fine.
    render(<Harness />)
    expect(fallback()).toBeTruthy()

    fireEvent.click(screen.getByText('go healthy'))

    expect(fallback()).toBeNull()
    expect(screen.getByText('healthy content')).toBeTruthy()
  })

  it('names the failing route in the log', () => {
    const { errors, t } = recorder()
    setLoggerTransport(t)
    render(<Harness />)
    expect(errors[0].context?.source).toBe('route:/broken')
  })
})

// ─── The route-level boundary ─────────────────────────────────────────────────

describe('REGRESSION — the route ErrorBoundary rendered a blank screen', () => {
  // `ChunkLoadErrorBoundary` was a React CLASS boundary attached as a route's
  // `ErrorBoundary`. React Router renders that property IN PLACE OF the element,
  // with no children and no error prop — so the class rendered
  // `props.children` (undefined) and produced empty HTML for every route error,
  // while its chunk-reload, living in componentDidCatch, never ran at all.
  const routerWith = (Screen: () => JSX.Element) =>
    createMemoryRouter([{ path: '/', Component: Screen, ErrorBoundary: RouteErrorBoundary }], {
      initialEntries: ['/'],
    })

  it('renders a visible fallback, not empty HTML', () => {
    const { container } = render(<RouterProvider router={routerWith(Boom)} />)
    expect(container.innerHTML).not.toBe('')
    expect(fallback()).toBeTruthy()
  })

  it('offers a way out', () => {
    render(<RouterProvider router={routerWith(Boom)} />)
    expect(screen.getByTestId('route-error-reload')).toBeTruthy()
  })

  it('reports the error through the logger', () => {
    const { errors, t } = recorder()
    setLoggerTransport(t)
    render(<RouterProvider router={routerWith(Boom)} />)

    expect(errors).toHaveLength(1)
    expect(errors[0].context?.source).toBe('RouteErrorBoundary')
  })

  it('renders the healthy screen when nothing throws', () => {
    render(<RouterProvider router={routerWith(() => <div>healthy content</div>)} />)
    expect(screen.getByText('healthy content')).toBeTruthy()
    expect(fallback()).toBeNull()
  })

  it('surfaces an ApiError correlation id for support to quote', () => {
    function ThrowApiError(): never {
      throw Object.assign(new Error('500'), { status: 500, code: '500', correlationId: 'cid-abc' })
    }
    render(<RouterProvider router={routerWith(ThrowApiError)} />)
    expect(screen.getByText(/cid-abc/)).toBeTruthy()
  })
})

describe('REGRESSION — a chunk-load failure never triggered its reload', () => {
  // Detection lived in componentDidCatch, which React Router never calls for a
  // route ErrorBoundary. The stale-bundle-after-deploy recovery the code exists
  // for had therefore never executed once.
  const chunkRouter = (message: string) =>
    createMemoryRouter(
      [{ path: '/', Component: (): never => { throw new Error(message) }, ErrorBoundary: RouteErrorBoundary }],
      { initialEntries: ['/'] },
    )

  const withReloadSpy = (fn: (reload: ReturnType<typeof vi.fn>) => void) => {
    const reload = vi.fn()
    const original = window.location
    Object.defineProperty(window, 'location', { configurable: true, value: { ...original, reload } })
    try {
      fn(reload)
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: original })
    }
  }

  it.each([
    ['Chromium', 'Failed to fetch dynamically imported module: /assets/x.js'],
    ['Firefox', 'error loading dynamically imported module'],
    ['Safari', 'Importing a module script failed.'],
  ])('reloads on the %s message', (_engine, message) => {
    withReloadSpy((reload) => {
      render(<RouterProvider router={chunkRouter(message)} />)
      expect(reload).toHaveBeenCalledOnce()
    })
  })

  it('renders NOTHING while that reload is in flight', () => {
    // Flashing an error message that a fresh document is about to replace reads
    // as a broken app rather than a recovering one.
    withReloadSpy(() => {
      render(<RouterProvider router={chunkRouter('Failed to fetch dynamically imported module')} />)
      expect(fallback()).toBeNull()
    })
  })

  it('does NOT reload for an ordinary bug — that would mask it or loop', () => {
    withReloadSpy((reload) => {
      render(<RouterProvider router={chunkRouter('cannot read properties of undefined')} />)
      expect(reload).not.toHaveBeenCalled()
      expect(fallback()).toBeTruthy()
    })
  })
})
