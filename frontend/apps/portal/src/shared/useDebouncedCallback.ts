import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * DEBOUNCING — ported from `composables/useDebouncedCallback.ts`.
 *
 * Hand-rolled, no lodash: the Vue original notes the same minimal-dependency
 * posture, and this is nine lines of logic.
 *
 * 300ms is the Vue app's stated convention and is kept.
 */
const DEFAULT_WAIT = 300

/**
 * Defers a callback until `wait` ms after the last call.
 *
 * ⚠️ THE CALLBACK IS READ THROUGH A REF, NOT CAPTURED. A component re-renders on
 * every keystroke, so a debounced function that closed over the callback would
 * fire the version from whenever the timer was last reset — reading state that
 * is one render stale. The ref is updated every render, so the timer always
 * invokes the CURRENT callback while the returned function itself stays
 * referentially stable.
 *
 * That stability is not cosmetic: an unstable function here would be a changing
 * dependency of any effect or memo that used it, re-running the work this hook
 * exists to defer.
 *
 * Cleanup cancels the pending timer, so a callback cannot fire against an
 * unmounted component.
 */
export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  wait: number = DEFAULT_WAIT,
): (...args: A) => void {
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const latest = useRef(callback)

  // Every render, so the timer never invokes a stale closure.
  useEffect(() => {
    latest.current = callback
  })

  useEffect(() => () => clearTimeout(timer.current), [])

  return useMemo(
    () =>
      (...args: A) => {
        clearTimeout(timer.current)
        timer.current = setTimeout(() => latest.current(...args), wait)
      },
    [wait],
  )
}

/**
 * The VALUE form: returns `value`, but only after it has stopped changing for
 * `wait` ms.
 *
 * ─── WHY BOTH FORMS EXIST, AND WHICH ONE A SEARCH BOX NEEDS ──────────────────
 *
 * A controlled `<input>` must re-render on EVERY keystroke or typing feels
 * broken — characters appear late, the caret jumps. So debouncing the input's
 * own `onChange` is the wrong move: it makes the field itself laggy while doing
 * nothing about the expensive work.
 *
 * What should be deferred is the DERIVATION — the filter, the sort, the
 * re-render of a 35-row table. This hook is that split: the input keeps the
 * immediate value, and the expensive memo depends on the deferred one.
 *
 * Vue only has the callback form because a Vue `v-model` input is not
 * re-rendering the subtree on each keystroke the way a controlled React input
 * is. The value form is the React-shaped answer to the same problem, built on
 * the ported hook rather than beside it.
 */
export function useDebouncedValue<T>(value: T, wait: number = DEFAULT_WAIT): T {
  const [settled, setSettled] = useState(value)
  const commit = useDebouncedCallback((next: T) => setSettled(next), wait)

  useEffect(() => {
    // Passing through unchanged when the value already matches avoids scheduling
    // a timer that would set state to what it already holds.
    if (Object.is(value, settled)) return
    commit(value)
  }, [value, settled, commit])

  return settled
}
