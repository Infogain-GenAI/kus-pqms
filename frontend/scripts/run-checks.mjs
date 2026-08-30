// Concurrent check runner for the pre-push hook.
//
// WHY THIS EXISTS
// The hook ran seven checks sequentially, each spawned through a package-manager
// wrapper (`pnpm run`, `npx`). Two costs, and the second was the surprise:
//
//   1. WALL-CLOCK IS THE SUM. The checks are independent — typecheck, the three
//      adherence ratchets, the import-rule self-test, the test suite and the
//      coverage ratchet share no state and no ordering requirement. Run
//      sequentially the hook costs their total; run concurrently it costs the
//      slowest one.
//   2. STARTUP IS PAID PER CHECK. `npx` and `pnpm run` each resolve a package
//      graph before executing anything. Measured, that overhead was roughly a
//      third of the hook, and it is pure tax — it does nothing.
//
// So: spawn every check from ONE node process, concurrently, resolving each tool's
// JS entrypoint directly rather than through a wrapper.
//
// **NOTHING IS REMOVED.** 23's rule is that a slow hook gets bypassed with
// --no-verify, and the usual response is to drop a check. Dropping a check is
// the last lever, not the first — the first is to stop paying for the same thing
// eight times.
//
// OUTPUT IS DETERMINISTIC DESPITE THE CONCURRENCY. Each child's output is
// buffered and printed in declaration order once everything finishes, so a
// failure reads the same way every time. Interleaved live output would be
// unreadable and would make the hook feel broken.
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const require_ = createRequire(root + '/')
/**
 * Resolve a tool's JS ENTRYPOINT and run it with node.
 *
 * NOT node_modules/.bin — those are .cmd shims on Windows, and Node 20+ refuses
 * to spawn a .cmd without a shell (EINVAL). Using a shell would work and
 * would reintroduce a per-check cmd.exe startup, which is the tax this file
 * exists to remove. Resolving the real .js/.mjs and running it with
 * process.execPath is both portable and free.
 */
const js = (spec) => require_.resolve(spec)

// Declaration order is report order. Cost is the SLOWEST of these, not the sum.
const CHECKS = [
  { name: 'typecheck', cmd: process.execPath, args: [js('typescript/bin/tsc'), '--noEmit', '-p', 'apps/portal/tsconfig.json'] },
  { name: 'typecheck:ui-library', cmd: process.execPath, args: [js('typescript/bin/tsc'), '--noEmit', '-p', 'packages/ui-library/tsconfig.json'] },
  { name: 'typecheck:design-tokens', cmd: process.execPath, args: [js('typescript/bin/tsc'), '--noEmit', '-p', 'packages/design-tokens/tsconfig.json'] },
  { name: 'lint:ds:values', cmd: process.execPath, args: ['scripts/ds-gate.mjs', 'values'] },
  { name: 'lint:ds:numeric', cmd: process.execPath, args: ['scripts/ds-gate.mjs', 'numeric'] },
  { name: 'lint:ds:imports', cmd: process.execPath, args: ['scripts/ds-gate.mjs', 'imports'] },
  { name: 'lint:ds:selftest', cmd: process.execPath, args: ['scripts/check-import-rule.mjs'] },
  { name: 'css-vars', cmd: process.execPath, args: ['scripts/check-css-vars.mjs'] },
  // Hard zero, not a ratchet — see the script's header for why it is not a
  // ds-gate family. It self-tests, so a pattern that stops matching fails loudly
  // rather than reporting a clean codebase.
  { name: 'role-gate', cmd: process.execPath, args: ['scripts/check-role-gate.mjs'] },
  { name: 'tokens:drift', cmd: process.execPath, args: ['scripts/check-tokens-drift.mjs'] },
  // The suite writes the coverage summary the ratchet reads, so these two are the
  // ONE ordered pair here. They run as a single sequential unit alongside the rest.
  {
    name: 'test + coverage ratchet',
    cmd: process.execPath,
    args: [js('vitest/vitest.mjs'), 'run', '--coverage'],
    then: { cmd: process.execPath, args: ['scripts/coverage-gate.mjs'] },
  },
]

const run = (cmd, args) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: root, shell: false })
    let out = ''
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (out += d))
    child.on('error', (e) => resolve({ code: 1, out: out + `\n${e.message}` }))
    child.on('close', (code) => resolve({ code: code ?? 1, out }))
  })

const started = Date.now()
const results = await Promise.all(
  CHECKS.map(async (c) => {
    const t0 = Date.now()
    let r = await run(c.cmd, c.args)
    if (r.code === 0 && c.then) {
      const r2 = await run(c.then.cmd, c.then.args)
      r = { code: r2.code, out: r.out + r2.out }
    }
    return { ...c, ...r, ms: Date.now() - t0 }
  }),
)
const elapsed = Date.now() - started

let failed = 0
for (const r of results) {
  const mark = r.code === 0 ? 'v' : 'x'
  console.log(`${mark}  ${r.name.padEnd(26)} ${String(r.ms).padStart(6)}ms`)
  if (r.code !== 0) {
    failed++
    console.log(r.out.trimEnd().split('\n').map((l) => `      ${l}`).join('\n'))
  }
}

const slowest = results.reduce((a, b) => (a.ms > b.ms ? a : b))
const serial = results.reduce((s, r) => s + r.ms, 0)
console.log('')
console.log(`   wall-clock ${elapsed}ms  |  slowest check "${slowest.name}" ${slowest.ms}ms  |  if serial ~${serial}ms`)

if (failed > 0) {
  console.error('')
  console.error(`x  ${failed} check(s) failed.`)
  process.exit(1)
}
process.exit(0)
