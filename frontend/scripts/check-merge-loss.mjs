// DID ANYTHING OF OURS DISAPPEAR IN THE MERGE?
//
// ─── THE FAILURE THIS EXISTS FOR ─────────────────────────────────────────────
//
// Merge 7970a52 silently deleted a shipped feature. `bulkAssignRole` — the store
// function, its wired control, its audit action and a dedicated test suite —
// existed on our branch and does not exist after the merge. Main never had it;
// main's Issue List rewrite won at that file's path and took our feature with it.
// Nothing conflicted, nothing failed, and two reviewers missed it.
//
// ⚠️ THE VERIFICATION WE WERE DOING COULD NOT HAVE CAUGHT IT. Both previous
// merges were checked by re-reading the files WE had changed, to confirm our
// edits survived. This loss was in a file main REPLACED. A "did my changes
// survive" check reads a list of files you remember touching; it is blind to
// everything you are not already thinking about. This walks the diff instead.
//
// ─── WHY NOT JUST CHECK EXPORTS ──────────────────────────────────────────────
//
// Because that would have missed this one. `bulkAssignRole` was never exported:
// it was a property on the `StoreValue` interface and a `const` inside a
// component. So declarations are collected broadly — including interface members
// — and identifier-level presence is what gets compared.
//
// ─── ⚠️ WHAT THIS CANNOT SEE. READ BEFORE TRUSTING A CLEAN RUN ───────────────
//
// A clean run means "no DECLARED IDENTIFIER vanished". It does not mean nothing
// was lost. Five gaps, in rough order of how likely they are to bite:
//
//   1. A FEATURE GUTTED WHILE KEEPING ITS NAME. The function survives, nothing
//      calls it; the export survives, no screen renders it. This compares
//      presence, never wiring — and a merge that replaces a file is far more
//      likely to orphan a feature than to delete its identifier. This is
//      probably the more common casualty, and it is invisible here.
//
//   2. DELETED TEST CASES. An `it()` title is not an identifier, so a whole
//      suite can disappear and this reports nothing. The merge that motivated
//      this script took a dedicated bulk-assign suite with the feature. Losing
//      tests silently is how something stays "covered" on paper while nothing
//      exercises it — and the coverage ratchet will not notice either, because
//      the code went too, so the percentage holds.
//
//   3. DECLARATION-LEVEL HOMONYMS. Survival is judged by whether HEAD DECLARES
//      the name (see the note further down), which defeats the ordinary
//      name-collision case. It does NOT defeat a collision where the coincidental
//      name at HEAD is itself a declaration — a lost `const parseRow` masked by
//      an unrelated `interface parseRow` member elsewhere. Rarer, still possible,
//      still silent.
//
//   4. RE-EXPORTS, IN BOTH DIRECTIONS. `export { X } from './y'` — and its
//      aliasing form `export { Y as X } from './y'` — match no declaration
//      keyword, so this scan does not see them as declarations. That misreads a
//      symbol's presence in two opposite ways, and which one you get depends on
//      WHICH REF the re-export sits in:
//
//        · re-export at the BASE  → a FALSE NEGATIVE. `X` was never entered into
//          evidence, so it cannot be reported lost even if HEAD really did drop
//          it. Silent.
//        · re-export at HEAD      → a FALSE POSITIVE. `X` was a declaration at
//          the base and is not one at HEAD, so it is listed as no longer
//          declared while being perfectly alive.
//
//      ⚠️ NO LONGER HYPOTHETICAL — this said "zero uses in this tree today" and
//      that stopped being true when main replaced the group editor. `modals.tsx`
//      now ends with `export { ManageRelatedIssuesModal as ManageLinksModal }`,
//      kept as a compatibility alias because the shell and two test files import
//      the old name. The very next run listed `ManageLinksModal` as no longer
//      declared, and reading that as an API break — which it is not — was one
//      escalation away from wasting someone's afternoon.
//
//      The tell is in the output already: this prints "(no longer DECLARED, but
//      still mentioned at HEAD)" for exactly this case. Treat that suffix as
//      "look for a re-export or an alias before believing the loss".
//
//   5. NON-IDENTIFIER CONTENT: copy strings, CSS rules, seed rows, taxonomy
//      entries, and any name under 6 characters.
//
// ⚠️ THE INVERSE CASE, worth keeping because it is why this works at the
// identifier level at all: the audit string 'Bulk role assignment' STILL EXISTS
// in `history.catalogue.ts`, so a STRING-level check would have reported the lost
// feature alive and well. Identifiers caught it; strings would not have.
//
// So: use it on every merge, and do not read a clean result as an all-clear.
// Limits 1 and 2 are the ones that will bite. Limit 4 is now LIVE rather than
// latent, and has already produced one false positive; 3 remains latent.
//
// ─── IT IS A REVIEW LIST, NOT A GATE ─────────────────────────────────────────
//
// A name can legitimately vanish: renamed, deliberately removed, superseded. So
// this exits 0 and prints. Wiring it into the pre-push hook would mean either a
// suppression file or people learning to ignore it, and both are worse than a
// list someone reads once per merge.
//
// Usage:  node scripts/check-merge-loss.mjs [base-ref]
//         defaults to HEAD^1 — our side of the most recent merge commit.

import { execFileSync } from 'node:child_process'

const repo = new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', maxBuffer: 1 << 28 })

const base = process.argv[2] ?? 'HEAD^1'

/** Every .ts/.tsx path under frontend/ at a ref. */
const filesAt = (ref) =>
  git('ls-tree', '-r', '--name-only', ref, '--', 'frontend')
    .split('\n')
    .filter((p) => /\.tsx?$/.test(p) && !p.includes('/dist/'))

/** All of a ref's source concatenated, for cheap membership tests. */
function textAt(ref, paths) {
  const chunks = []
  for (const p of paths) {
    try {
      chunks.push(git('show', `${ref}:${p}`))
    } catch {
      /* deleted between listing and read; ignore */
    }
  }
  return chunks.join('\n')
}

/*
 * Declarations, deliberately broad.
 *
 *   1. const / let / function / class / interface / type / enum
 *   2. interface + object-type MEMBERS (`  name: (…) => …`, `  name?: T`) — the
 *      shape `bulkAssignRole` had, and the reason an exports-only scan fails.
 */
const DECL = /^\s*(?:export\s+)?(?:declare\s+)?(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm
/*
 * Members of interfaces and object types.
 *
 * ⚠️ `[A-Za-z_$]`, NOT `[a-z]`. The first version was lowercase-only, so a member
 * whose name began with a capital was never collected at all — invisible from the
 * start rather than reported with low confidence. A defect, not a scope choice.
 */
const MEMBER = /^\s{2,}([A-Za-z_$][\w$]*)\??\s*:/gm
/*
 * Second and later declarators on one line: `const a = 1, b = 2` used to register
 * only `a`, because DECL captures a single identifier per line-start match. Also
 * a regex defect rather than a decision.
 */
const EXTRA_DECLARATOR = /,\s*([A-Za-z_$][\w$]*)\s*(?==)/g

function declarationsAt(ref, paths) {
  const found = new Map() // name -> first file it was declared in
  for (const p of paths) {
    let src
    try {
      src = git('show', `${ref}:${p}`)
    } catch {
      continue
    }
    const add = (name) => {
      /*
       * A CHOSEN limit, unlike the two regex defects above — worth distinguishing,
       * because a reader trusts a deliberate scope decision differently from an
       * accidental gap. Short names collide with everything and produce noise
       * that would get the whole list ignored.
       */
      if (name.length < 6) return
      if (!found.has(name)) found.set(name, p)
    }

    for (const re of [DECL, MEMBER]) {
      re.lastIndex = 0
      for (const m of src.matchAll(re)) add(m[1])
    }

    // Extra declarators, but only on lines that actually declare something —
    // otherwise every `{ a: 1, b = … }` in the file would register.
    for (const line of src.split('\n')) {
      if (!/^\s*(?:export\s+)?(?:declare\s+)?(?:const|let|var)\s/.test(line)) continue
      EXTRA_DECLARATOR.lastIndex = 0
      for (const m of line.matchAll(EXTRA_DECLARATOR)) add(m[1])
    }
  }
  return found
}

const basePaths = filesAt(base)
const headPaths = filesAt('HEAD')
const baseDecls = declarationsAt(base, basePaths)
const headDecls = declarationsAt('HEAD', headPaths)
const headText = textAt('HEAD', headPaths)

/*
 * ─── ⚠️ COMPARED AT THE DECLARATION LEVEL, NOT BY TEXT PRESENCE ──────────────
 *
 * The first version asked "does this identifier appear ANYWHERE at HEAD", which
 * NAME-COLLISION MASKING defeats: delete a declaration at base, have anything
 * unrelated at HEAD happen to share the identifier — not a rename, a HOMONYM —
 * and the tool calls it alive with no signal whatsoever. Across 266 files that
 * needs no bad luck. It is the same shape as the hole that let `bulkAssignRole`
 * past the original "did my changes survive" check, one layer removed.
 *
 * So a name survives only if HEAD DECLARES it. A homonym must now itself be a
 * declaration to mask a loss, which is much rarer. When a name is gone as a
 * declaration but still present as TEXT, that is reported as well — it is the
 * dead-trace / homonym case, and it wants a human's eye for opposite reasons.
 */
const gone = []
for (const [name, file] of baseDecls) {
  if (headDecls.has(name)) continue
  gone.push({ name, file, lingering: new RegExp(`\\b${name}\\b`).test(headText) })
}

console.log(`merge-loss: comparing ${base} -> HEAD`)
console.log(`  ${basePaths.length} source files at ${base}, ${headPaths.length} at HEAD`)
console.log(`  ${baseDecls.size} declared identifiers examined`)

if (gone.length === 0) {
  console.log('  nothing declared at the base is missing at HEAD.')
} else {
  console.log('')
  console.log(`⚠️  ${gone.length} identifier(s) declared at ${base} are no longer DECLARED at HEAD:`)
  console.log('   Each is a rename, a deliberate removal, or a silently lost feature.')
  console.log('   Decide which — that is the whole job of this list.')
  console.log('')
  const byFile = new Map()
  for (const g of gone) {
    if (!byFile.has(g.file)) byFile.set(g.file, [])
    byFile.get(g.file).push(g.name)
  }
  for (const [file, names] of [...byFile].sort()) {
    console.log(`   ${file}`)
    for (const n of names.sort()) {
      const g = gone.find((x) => x.name === n)
      console.log(`     · ${n}${g?.lingering ? '   (no longer DECLARED, but still mentioned at HEAD)' : ''}`)
    }
  }
}

// Always 0 — see the header. This informs a human; it does not gate.
process.exit(0)
