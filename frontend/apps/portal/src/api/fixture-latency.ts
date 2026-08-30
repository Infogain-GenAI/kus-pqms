/**
 * Shared simulated latency for the fixture-backed `api/*` modules.
 *
 * Ported from Vue's `api/fixture-latency.ts`. Deliberately trivial and
 * option-free: each fixture module is slated for outright replacement when its
 * real backend lands, on its own timeline, so this stays something a single
 * consumer can inline back without dragging the others with it.
 *
 * ─── WHY SIMULATE LATENCY AT ALL ─────────────────────────────────────────────
 *
 * Because the fixture path must be ASYNC in the same way the real one is. A
 * synchronous fixture lets a component be written against data that is always
 * already there — no loading state, no race, no empty first render — and every
 * one of those omissions becomes a bug on the day the real API is switched on.
 * 15ms is enough to make the promise real without slowing the suite.
 */
export function simulateLatency(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 15))
}
