// Coverage ratchet — the same mechanism as scripts/ds-gate.mjs, applied to
// coverage. Coverage is not the exception to 15's rule.
//
// WHY A RATCHET AND NOT A STATIC THRESHOLD
// A hand-written threshold is a budget, and a budget only ever moves one way.
// 10-testing-standards.md records the prior repository's version of exactly this:
// split floors of 85/78/80/85 let branch and function coverage drift downward for
// months until a PR finally failed at 79.82% functions. The gate was green the
// whole time.
//
// So the two directions are asymmetric, identically to the adherence ceilings:
//   - RISING is automatic. Coverage improves -> this rewrites .coverage-floors.json
//     and exits 0. The gain is captured the moment it happens.
//   - FALLING fails. Lowering a floor means editing a tracked file by hand, which
//     appears in review as a deliberate act with a name attached.
//
// AND THE FLOOR IS THE MEASUREMENT, NOT A ROUND NUMBER BELOW IT. Seeding at 75
// when the measurement is 76.83 donates 1.83 points of future regression for
// nothing. The ratchet exists precisely so the floor can sit flush against the
// actual.
//
// SCOPE: see vitest.config.ts. The denominator is apps/portal/src/data/** only —
// a DATA-LAYER figure, not a project figure. Widening it will fail this gate, and
// the fix is to re-measure and re-seed in the same change.
//
// Usage:
//   node scripts/coverage-gate.mjs           check against the floors
//   node scripts/coverage-gate.mjs --seed    write the current numbers as floors
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const FLOORS = join(root, '.coverage-floors.json')
const SUMMARY = join(root, '.coverage/coverage-summary.json')
const SEED = process.argv.includes('--seed')

if (!existsSync(SUMMARY)) {
  console.error('x coverage-gate: no coverage summary. Run `pnpm run test:coverage` first.')
  console.error(`   expected: ${SUMMARY}`)
  process.exit(1)
}

const total = JSON.parse(readFileSync(SUMMARY, 'utf8')).total
const METRICS = ['statements', 'branches', 'functions', 'lines']

// A summary that reports zero covered statements is a broken run, not a clean
// one — the same shape as ds-gate's zero-file guard. Fail rather than seeding a
// floor of 0, which would silently disable the gate forever.
if (!total || total.statements?.total === 0) {
  console.error('x coverage-gate: the summary reports ZERO statements in scope.')
  console.error('   That is a broken measurement, not a clean result. Check the `include` glob.')
  process.exit(1)
}

const current = Object.fromEntries(METRICS.map((m) => [m, Number(total[m].pct)]))

if (SEED) {
  writeFileSync(FLOORS, JSON.stringify(current, null, 2) + '\n')
  console.log('v coverage-gate: floors seeded at the measured values —')
  for (const m of METRICS) console.log(`     ${m.padEnd(11)} ${current[m].toFixed(2)}%`)
  process.exit(0)
}

if (!existsSync(FLOORS)) {
  console.error('x coverage-gate: no .coverage-floors.json. Seed it with --seed.')
  process.exit(1)
}

const floors = JSON.parse(readFileSync(FLOORS, 'utf8'))
const below = []
const risen = []
for (const m of METRICS) {
  const floor = Number(floors[m])
  if (!Number.isFinite(floor)) {
    console.error(`x coverage-gate: no floor recorded for ${m}`)
    process.exit(1)
  }
  // Two-decimal comparison: v8 reports to 2dp, and a float compare on the same
  // number can otherwise fail on the last bit.
  const c = Math.round(current[m] * 100)
  const f = Math.round(floor * 100)
  if (c < f) below.push({ m, current: current[m], floor })
  else if (c > f) risen.push({ m, current: current[m], floor })
}

if (below.length) {
  console.error('x coverage-gate: coverage FELL below the floor.')
  for (const b of below) {
    console.error(`     ${b.m.padEnd(11)} ${b.current.toFixed(2)}%  <  floor ${b.floor.toFixed(2)}%`)
  }
  console.error('')
  console.error('   Add tests, or lower the floor BY HAND in .coverage-floors.json and say')
  console.error('   in the commit message why it went down. Never lower it to make a build pass.')
  console.error('   If you widened the coverage `include` glob, re-seed instead: --seed.')
  process.exit(1)
}

if (risen.length) {
  writeFileSync(FLOORS, JSON.stringify(current, null, 2) + '\n')
  console.log('v coverage-gate: coverage ROSE — floors ratcheted up.')
  for (const r of risen) console.log(`     ${r.m.padEnd(11)} ${r.floor.toFixed(2)}% -> ${r.current.toFixed(2)}%`)
  console.log('   .coverage-floors.json was rewritten; commit it with your change.')
  process.exit(0)
}

console.log('v coverage-gate: at the floor —')
for (const m of METRICS) console.log(`     ${m.padEnd(11)} ${current[m].toFixed(2)}%`)
process.exit(0)
