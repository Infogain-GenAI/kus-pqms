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
// was lost. Four gaps, in rough order of how likely they are to bite:
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
//   3. PRESENCE ANYWHERE COUNTS AS ALIVE, including in a comment or a dead
//      trace. Had `bulkAssignRole` survived in one comment, this would have
//      missed it. ⚠️ AND NOTE THE INVERSE, which is the reason this works at the
//      identifier level at all: the audit string 'Bulk role assignment' DOES
//      still exist in `history.catalogue.ts`, so a STRING-level check would have
//      reported the feature alive and well. That the identifier level caught it
//      is partly luck, not a property of the design.
//
//   4. NON-IDENTIFIER CONTENT: copy strings, CSS rules, seed rows, i18n keys
//      whose names are short, taxonomy entries. And names under 6 characters are
//      skipped outright for noise control.
//
// So: use it on every merge, and do not read a clean result as an all-clear.
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
const MEMBER = /^\s{2,}([a-z][\w$]*)\??\s*:/gm

function declarationsAt(ref, paths) {
  const found = new Map() // name -> first file it was declared in
  for (const p of paths) {
    let src
    try {
      src = git('show', `${ref}:${p}`)
    } catch {
      continue
    }
    for (const re of [DECL, MEMBER]) {
      re.lastIndex = 0
      for (const m of src.matchAll(re)) {
        const name = m[1]
        // Short names collide with everything and generate pure noise.
        if (name.length < 6) continue
        if (!found.has(name)) found.set(name, p)
      }
    }
  }
  return found
}

const basePaths = filesAt(base)
const headPaths = filesAt('HEAD')
const baseDecls = declarationsAt(base, basePaths)
const headText = textAt('HEAD', headPaths)

const gone = []
for (const [name, file] of baseDecls) {
  // Word-boundary membership: the identifier appears NOWHERE at HEAD.
  if (!new RegExp(`\\b${name}\\b`).test(headText)) gone.push({ name, file })
}

console.log(`merge-loss: comparing ${base} -> HEAD`)
console.log(`  ${basePaths.length} source files at ${base}, ${headPaths.length} at HEAD`)
console.log(`  ${baseDecls.size} declared identifiers examined`)

if (gone.length === 0) {
  console.log('  nothing declared at the base is missing at HEAD.')
} else {
  console.log('')
  console.log(`⚠️  ${gone.length} identifier(s) declared at ${base} appear NOWHERE at HEAD:`)
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
    for (const n of names.sort()) console.log(`     · ${n}`)
  }
}

// Always 0 — see the header. This informs a human; it does not gate.
process.exit(0)
