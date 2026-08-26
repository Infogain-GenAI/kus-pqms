// Static token-equivalence check — proves value preservation WITHOUT rendering.
//
// WHAT IT PROVES, AND WHY THAT IS ENOUGH FOR MOST OF STEP 8
// Step 8 replaces a raw literal with a token reference:
//     padding: '16px'   ->   padding: 'var(--space-4)'
// The change is safe **iff the token's declared value is exactly the literal it
// replaces**. That is a statement about two strings in a manifest, not about
// rendering, so it can be settled with no browser, no layout and no pixels.
//
// For the exact-match tranche — the 4px grid, --header-height, --control-*,
// --icon-*, the type scale — this is a COMPLETE proof of value preservation.
// Nothing that passes it can change a pixel, because the computed value the
// browser resolves is character-for-character what it resolved before.
//
// steps-for-new-repo.md previously asserted that tranche was "byte-identical at
// render time, so zero fidelity risk". That was an assertion. This makes it a
// check.
//
// WHAT IT CANNOT PROVE
// - A literal with NO exact token (#DDE3E9, 11.5px, the 186px label column).
//   Out of scope by construction: there is no equivalence to assert.
// - A near-match. --radius-xl is 12px and a 13px literal is NOT equivalent;
//   this reports it as unmatched rather than "close enough".
// - Anything about *where* a value is used. Swapping a correct value onto the
//   wrong property is a different error and this check is blind to it — that is
//   what the computed-style gate covers.
//
// Modes:
//   node scripts/check-token-equivalence.mjs
//       Coverage report over the live raw-value warnings.
//   node scripts/check-token-equivalence.mjs --assert '16px=--space-4' [...]
//       Assert specific substitutions. Exit 1 if any is not an exact match.
//       This is the mode Step 8 runs per conversion.
import { ESLint } from 'eslint'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const MANIFEST = join(root, 'packages/design-tokens/design-system-manifest.json')

// --- the manifest, with aliases resolved -----------------------------------
// 22 of 156 tokens are aliases (`--bg-app: var(--neutral-25)`). An alias is
// equivalent to whatever it ultimately resolves to, so a literal may legitimately
// be replaced by either the primitive or the alias. Resolve transitively, with a
// depth cap so a malformed manifest cannot hang this.
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'))
const declared = new Map((manifest.tokens ?? []).map((t) => [t.name, String(t.value).trim()]))

const resolve = (name, depth = 0) => {
  const v = declared.get(name)
  if (v === undefined) return undefined
  const m = /^var\(\s*(--[\w-]+)\s*\)$/.exec(v)
  if (!m) return v
  if (depth > 10) return undefined
  return resolve(m[1], depth + 1)
}

// Hex is normalised to 6 digits before comparison. DEFECT FIXED 2026-08-26:
// exact string matching meant '#fff' never matched the manifest's '#FFFFFF', so
// 24 convertible warnings were reported as unmatched — a tooling defect that
// looked like a design-system gap.
const expandHex = (v) => {
  const m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(v)
  return m ? '#' + m[1] + m[1] + m[2] + m[2] + m[3] + m[3] : v
}
const norm = (v) => expandHex(String(v).trim().replace(/^['"]|['"]$/g, '').toLowerCase())

// value -> [token names], including aliases pointing at the same primitive
const byValue = new Map()
for (const name of declared.keys()) {
  const r = resolve(name)
  if (r === undefined) continue
  const k = norm(r)
  if (!byValue.has(k)) byValue.set(k, [])
  byValue.get(k).push(name)
}

// --- assert mode ------------------------------------------------------------
const assertIdx = process.argv.indexOf('--assert')
if (assertIdx !== -1) {
  const pairs = process.argv.slice(assertIdx + 1).filter((a) => a.includes('='))
  if (pairs.length === 0) {
    console.error("x token-equivalence: --assert needs at least one '<literal>=<--token>' pair")
    process.exit(2)
  }
  let bad = 0
  for (const pair of pairs) {
    const i = pair.lastIndexOf('=--')
    const literal = pair.slice(0, i)
    const token = pair.slice(i + 1)
    const actual = resolve(token)
    if (actual === undefined) {
      console.error(`x ${literal} -> ${token}  : token not in the manifest`)
      bad++
    } else if (norm(actual) !== norm(literal)) {
      console.error(`x ${literal} -> ${token}  : token is ${actual}, NOT ${literal} — this substitution CHANGES the value`)
      bad++
    } else {
      console.log(`v ${literal} -> ${token}  : exact match (${actual})`)
    }
  }
  if (bad > 0) {
    console.error(`\nx token-equivalence: ${bad} of ${pairs.length} substitution(s) are not value-preserving.`)
    process.exit(1)
  }
  console.log(`\nv token-equivalence: all ${pairs.length} substitution(s) preserve the value exactly.`)
  process.exit(0)
}

// --- coverage mode ----------------------------------------------------------
// Reads the LIVE raw-value warnings rather than a hand-written list, so the
// coverage number cannot drift from what the gate actually reports.
const eslint = new ESLint({ cwd: root, overrideConfigFile: join(root, 'eslint.adherence.config.mjs') })
const results = await eslint.lintFiles(['apps', 'packages'])
if (results.length === 0) {
  console.error('x token-equivalence: ESLint matched zero files — the globs are broken, not the codebase clean.')
  process.exit(1)
}

const srcCache = new Map()
const readSrc = (p) => {
  if (!srcCache.has(p)) srcCache.set(p, readFileSync(p, 'utf8').split(/\r?\n/))
  return srcCache.get(p)
}

/** Pull the literal text a message points at, using its reported range. */
const literalAt = (filePath, m) => {
  const lines = readSrc(filePath)
  if (m.line !== m.endLine) return null // multi-line literal: out of scope
  const line = lines[m.line - 1] ?? ''
  return line.slice(m.column - 1, (m.endColumn ?? m.column) - 1)
}

/**
 * The CSS-in-JS property this literal is assigned to.
 *
 * DEFECT FIXED 2026-08-26. The original only matched `prop:` IMMEDIATELY before
 * the literal, so 55 values were unclassifiable — 39 of them inside ternary
 * branches, where the property sits before the `?`:
 *     boxShadow: isActive ? 'inset 0 -2px 0 0 var(--accent-500)' : 'none'
 *
 * Two forms are now resolved, and ONLY two. Anything else still returns null:
 * the rule is convert what resolves unambiguously, never what has to be guessed.
 */
const propertyAt = (filePath, m) => {
  const line = readSrc(filePath)[m.line - 1] ?? ''
  const before = line.slice(0, m.column - 1)

  // Form 1 — directly assigned:  padding: '16px'
  const direct = /([A-Za-z][A-Za-z0-9]*)\s*:\s*$/.exec(before)
  if (direct) return direct[1]

  // Form 2 — a ternary branch:  prop: <cond> ? 'x' : 'y'
  // Accepted only when the text between the property and the literal contains
  // NO further `{`/`}`/`;`/`,` — i.e. we have not crossed into a nested object
  // or a sibling property, which is where a wrong attribution would come from.
  const ternary = /([A-Za-z][A-Za-z0-9]*)\s*:\s*([^{};,]*\?[^{};]*)$/.exec(before)
  if (ternary) {
    const between = ternary[2]
    // A second `:` inside the gap means we are in the ELSE branch of the ternary,
    // which is still the same property — but a second `?` means nested ternaries
    // and the property can no longer be attributed with confidence.
    if ((between.match(/\?/g) || []).length === 1) return ternary[1]
  }
  return null
}

// --- semantic fitness -------------------------------------------------------
// Value preservation is necessary and NOT sufficient. `padding: '14px 16px'`
// value-matches --fs-body-md and --fs-body-lg, which are FONT SIZE tokens; the
// substitution would preserve every pixel and be nonsense to read, and it would
// break the moment the type scale moves independently of the spacing scale.
//
// So each token family is mapped to the properties it is *about*. A match that
// preserves the value but lands outside that set is reported separately — safe to
// render, wrong to write.
const FAMILY = [
  { re: /^--space-/, props: /^(padding|margin|gap|rowGap|columnGap|top|right|bottom|left|inset)/i },
  { re: /^--radius-/, props: /^border.*Radius$|^borderRadius$/i },
  { re: /^--fs-/, props: /^fontSize$/i },
  { re: /^--lh-/, props: /^lineHeight$/i },
  { re: /^--ls-/, props: /^letterSpacing$/i },
  { re: /^--fw-/, props: /^fontWeight$/i },
  { re: /^--icon-/, props: /^(width|height|minWidth|minHeight|size)$/i },
  { re: /^--control-/, props: /^(height|minHeight|maxHeight)$/i },
  { re: /^--(header-height|row-height-|sidenav-|container-)/, props: /^(width|height|minWidth|maxWidth|minHeight|maxHeight|flexBasis)$/i },
  { re: /^--border-width$/, props: /^(border|borderWidth|borderTop|borderRight|borderBottom|borderLeft|outline|outlineWidth)/i },
  { re: /^--shadow-/, props: /^(boxShadow|textShadow)$/i },
  { re: /^--z-/, props: /^zIndex$/i },
]
// Colour tokens have no numeric family prefix; they are identified by value shape.
const COLOUR_PROPS = /color|background|border|outline|fill|stroke|shadow/i

const fitsProperty = (token, prop, value) => {
  if (!prop) return null // unknown property — cannot judge, do not claim safety
  if (/^#/.test(value)) return COLOUR_PROPS.test(prop)
  const fam = FAMILY.find((f) => f.re.test(token))
  if (!fam) return null
  return fam.props.test(prop)
}

const px = [], hex = [], other = []
for (const r of results) {
  for (const m of r.messages) {
    if (m.ruleId !== 'no-restricted-syntax') continue
    if (!/^Raw /.test(m.message)) continue
    const raw = literalAt(r.filePath, m)
    if (raw === null) continue
    const rec = { file: relative(root, r.filePath).split(/[\\/]/).join('/'), line: m.line, raw, value: norm(raw), prop: propertyAt(r.filePath, m) }
    if (/^Raw px/.test(m.message)) px.push(rec)
    else if (/^Raw hex/.test(m.message)) hex.push(rec)
    else other.push(rec)
  }
}

// A CSS shorthand is still statically provable if EVERY substitutable part has an
// exact token. `'0 12px'` -> `0 var(--space-3)` is as safe as a bare match: each
// part is replaced by a value character-for-character identical to itself.
// So the useful question is not "is the whole literal a token" but "does every
// part that needs one have an exact match".
//
// Parts needing no token: zero (unitless or `0px`), values already written as
// `var(--x)`, and CSS keywords (`solid`, `inset`, `auto`, …).
const NEEDS_TOKEN = /^(#[0-9a-f]{3,8}|\d+(\.\d+)?px)$/i
const IS_ZERO = /^0(px)?$/i

const splitParts = (v) =>
  v
    .replace(/var\(\s*--[\w-]+\s*\)/gi, ' TOKENREF ') // protect existing tokens
    .split(/[\s/,]+/)
    .map((p) => p.trim())
    .filter(Boolean)

const classify = (rec) => {
  const parts = splitParts(rec.value)
  const substitutable = parts.filter((p) => NEEDS_TOKEN.test(p) && !IS_ZERO.test(p))

  // Nothing to substitute: every numeric part is already a token or a zero.
  // The warning is then a false alarm from the vendored regex, not a conversion.
  if (substitutable.length === 0) return { kind: 'already-tokenised', parts }

  const matched = substitutable.map((p) => ({ part: p, tokens: byValue.get(norm(p)) }))
  const missing = matched.filter((m) => !m.tokens || !m.tokens.length)

  if (missing.length > 0) return { kind: 'unmatched', missing: missing.map((m) => m.part) }

  // Every part has a value-preserving token. Now the second question: is any of
  // those tokens the RIGHT one for this property? Prefer a family-appropriate
  // token; if none of the candidates fits, the substitution is value-safe but
  // semantically wrong and is bucketed separately.
  const withFit = matched.map((m) => {
    const fitting = m.tokens.filter((t) => fitsProperty(t, rec.prop, m.part) === true)
    return { ...m, fitting, verdict: rec.prop === null ? 'unknown-prop' : fitting.length ? 'fits' : 'wrong-family' }
  })
  const anyWrong = withFit.some((m) => m.verdict === 'wrong-family')
  const anyUnknown = withFit.some((m) => m.verdict === 'unknown-prop')
  const kind = anyWrong ? 'value-only' : anyUnknown ? 'unknown-prop' : parts.length === 1 ? 'exact' : 'decomposable'
  return { kind, matched: withFit, tokens: withFit[0]?.fitting?.length ? withFit[0].fitting : withFit[0]?.tokens }
}

const buckets = { exact: [], decomposable: [], 'already-tokenised': [], 'value-only': [], 'unknown-prop': [], unmatched: [] }
for (const rec of [...px, ...hex, ...other]) {
  const c = classify(rec)
  buckets[c.kind].push({ ...rec, ...c })
}

const total = px.length + hex.length + other.length
const pct = (n) => ((100 * n) / (total || 1)).toFixed(1) + '%'

console.log(`Static token-equivalence coverage over ${total} raw-value warnings`)
console.log(`  (px ${px.length} | hex ${hex.length} | other ${other.length})`)
console.log('')
const tranche1 = buckets.exact.length + buckets.decomposable.length + buckets['already-tokenised'].length
console.log(`  exact match         ${String(buckets.exact.length).padStart(4)}  ${pct(buckets.exact.length).padStart(6)}  one literal, one token, right family`)
console.log(`  decomposable        ${String(buckets.decomposable.length).padStart(4)}  ${pct(buckets.decomposable.length).padStart(6)}  shorthand, every part matched, right family`)
console.log(`  already tokenised   ${String(buckets['already-tokenised'].length).padStart(4)}  ${pct(buckets['already-tokenised'].length).padStart(6)}  only zeros/keywords/var() left — nothing to convert`)
console.log(`  ${'-'.repeat(64)}`)
console.log(`  TRANCHE 1           ${String(tranche1).padStart(4)}  ${pct(tranche1).padStart(6)}  <- statically provable, no browser needed`)
console.log('')
console.log(`  value-only match    ${String(buckets['value-only'].length).padStart(4)}  ${pct(buckets['value-only'].length).padStart(6)}  value preserved but WRONG TOKEN FAMILY — do not apply mechanically`)
console.log(`  unknown property    ${String(buckets['unknown-prop'].length).padStart(4)}  ${pct(buckets['unknown-prop'].length).padStart(6)}  property not on the same line — needs a human read`)
console.log(`  unmatched           ${String(buckets.unmatched.length).padStart(4)}  ${pct(buckets.unmatched.length).padStart(6)}  at least one part has no token — needs the computed-style gate`)
console.log('')

const group = (recs, key = (r) => r.value) => {
  const g = new Map()
  for (const r of recs) {
    const k = key(r)
    if (!g.has(k)) g.set(k, { n: 0, rec: r })
    g.get(k).n++
  }
  return [...g.entries()].sort((a, b) => b[1].n - a[1].n)
}

console.log('Exact-match values (literal -> token):')
for (const [v, { n, rec }] of group(buckets.exact).slice(0, 12)) {
  console.log(`  ${String(n).padStart(4)}x  ${v.padEnd(12)} -> ${(rec.tokens || []).join(' | ')}`)
}
console.log('')
console.log('Decomposable shorthands (every part matches):')
for (const [v, { n, rec }] of group(buckets.decomposable).slice(0, 12)) {
  const map = (rec.matched || []).map((m) => `${m.part}->${(m.fitting && m.fitting[0]) || m.tokens[0]}`).join(', ')
  console.log(`  ${String(n).padStart(4)}x  ${v.padEnd(34)} ${map}`)
}
console.log('')
console.log('Unmatched — the values with NO token, by the part that blocks them:')
const blockers = new Map()
for (const r of buckets.unmatched) for (const p of r.missing) blockers.set(p, (blockers.get(p) || 0) + 1)
for (const [p, n] of [...blockers.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18)) {
  console.log(`  ${String(n).padStart(4)}x  ${p}`)
}
