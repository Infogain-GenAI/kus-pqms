// Git hooks bootstrap.
//
// THE HOLE THIS FILLS
// The repository's gates live in /.githooks and are wired with `core.hooksPath`.
// That setting lives in .git/config, which is LOCAL and DOES NOT CLONE. So every
// gate in this project — the commit-message rules, the token checks, the
// adherence ratchets — is invisible to a fresh clone until someone runs one
// command nobody documented. RESTRUCTURE-BASELINE.md records that there is also
// no CI anywhere, so an unbootstrapped clone has ZERO enforcement of any kind.
// 23-git-workflow-hooks-and-commits.md names this first among the three things
// to verify before trusting hooks: "a hooks directory nobody has enabled is a
// directory of inert files."
//
// A NOTE ON SCOPE, BECAUSE THIS FILE CROSSES A BOUNDARY
// `core.hooksPath` is a single REPOSITORY-level value. It cannot be scoped to a
// directory, so this script — which lives in frontend/ — necessarily configures
// hooks for backend/, automation/ and infrastructure/ as well.
// 33-polyglot-monorepo-integration.md's rule is that a component's configuration
// must not reach another component's code. This does not reach their code; it
// enables the shared router that already dispatches to each component's own
// scripts. But it IS repo-wide, and that is a real tension rather than a
// technicality, so it is stated here rather than buried.
//
// It also means this bootstrap is INCOMPLETE BY CONSTRUCTION: it only runs when
// someone installs dependencies in frontend/. A developer who only ever works in
// backend/ never triggers it and never gets hooks. Closing that needs something
// at the repository root, which is the repo owner's to decide — see
// frontend/README.md and the report accompanying this change.
//
// Usage:
//   node scripts/setup-hooks.mjs           configure (idempotent); never fails install
//   node scripts/setup-hooks.mjs --check   verify only, exit 1 if not configured
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const CHECK_ONLY = process.argv.includes('--check')
const EXPECTED = '.githooks'
const HOOKS = ['commit-msg', 'pre-commit', 'pre-push']

const git = (args, opts = {}) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim()

/**
 * `prepare` runs during `pnpm install`. If this script throws, the install
 * fails — so every non-git situation (a tarball, a vendored copy, no git on
 * PATH) must exit 0. A LOUD warning, never a broken install.
 * `--check` is the strict counterpart for when a caller wants an exit code.
 */
const bail = (msg) => {
  console.warn(`!  setup-hooks: ${msg}`)
  process.exit(CHECK_ONLY ? 1 : 0)
}

let root
try {
  root = git(['rev-parse', '--show-toplevel'])
} catch {
  bail('not a git repository (or git is not on PATH) — hooks not configured.')
}

// Every git call below runs FROM THE REPOSITORY ROOT. `git ls-files` resolves its
// pathspec relative to the current directory, and this script runs from frontend/
// (as a `prepare` script), where `.githooks/` does not exist — which silently
// returns an empty listing and makes every hook look untracked.
const rgit = (args) => git(args, { cwd: root })

if (!existsSync(join(root, EXPECTED))) {
  bail(`${root}/${EXPECTED} does not exist — the repository layout changed. Hooks not configured.`)
}

// --- core.hooksPath ---------------------------------------------------------
let current = null
try {
  current = rgit(['config', '--get', 'core.hooksPath'])
} catch {
  // `git config --get` exits 1 when the key is unset. That is the normal
  // first-clone state, not an error.
}

if (current === EXPECTED) {
  console.log(`v setup-hooks: core.hooksPath already ${EXPECTED}`)
} else if (current) {
  // Do NOT silently overwrite. A different value is more likely a deliberate
  // local choice than a mistake, and clobbering someone's tooling from an
  // install script is exactly the kind of surprise that gets hooks distrusted.
  console.warn(`!  setup-hooks: core.hooksPath is ${JSON.stringify(current)}, not ${JSON.stringify(EXPECTED)}.`)
  console.warn(`   Left unchanged — this looks deliberate. If it is not, run:`)
  console.warn(`       git config core.hooksPath ${EXPECTED}`)
  if (CHECK_ONLY) process.exit(1)
} else if (CHECK_ONLY) {
  console.error(`x setup-hooks: core.hooksPath is not set. This clone has NO hooks and there is no CI.`)
  console.error(`   Run:  node frontend/scripts/setup-hooks.mjs`)
  process.exit(1)
} else {
  rgit(['config', 'core.hooksPath', EXPECTED])
  console.log(`v setup-hooks: core.hooksPath set to ${EXPECTED}`)
}

// --- executability ----------------------------------------------------------
// 23's second verification: "The scripts are executable (git update-index
// --chmod=+x). A non-executable hook is skipped silently on Unix."
//
// The INDEX mode is what matters, not the working-tree mode: core.filemode is
// false on Windows so the local bit is ignored, and the index mode is what every
// other clone receives. A hook committed 100644 is inert for every Linux and
// macOS developer while looking fine on the machine that added it.
let notExecutable = []
let missingHooks = []
let modesRead = false
try {
  const listing = rgit(['ls-files', '-s', `${EXPECTED}/`])
  const modes = new Map(
    listing
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [meta, path] = line.split('\t')
        return [path.replace(`${EXPECTED}/`, ''), meta.split(' ')[0]]
      }),
  )
  modesRead = true
  notExecutable = HOOKS.filter((h) => modes.has(h) && modes.get(h) !== '100755')
  missingHooks = HOOKS.filter((h) => !modes.has(h))
  if (missingHooks.length) {
    console.error(`x setup-hooks: hook(s) not tracked in ${EXPECTED}/: ${missingHooks.join(', ')}`)
    console.error(`   A hook that is not committed does not reach anyone else's clone.`)
  }
} catch {
  console.warn('!  setup-hooks: could not read hook file modes from the index.')
}

if (notExecutable.length) {
  console.error(`x setup-hooks: hook(s) not executable in the index: ${notExecutable.join(', ')}`)
  console.error(`   They are skipped silently on Unix. Fix and commit:`)
  for (const h of notExecutable) console.error(`       git update-index --chmod=+x ${EXPECTED}/${h}`)
  // Not auto-fixed: --chmod=+x stages an index change, and an install script
  // must not quietly stage things into someone's commit.
  process.exit(1)
}

if (missingHooks.length) {
  process.exit(CHECK_ONLY ? 1 : 0)
}

if (modesRead) {
  console.log(`v setup-hooks: ${HOOKS.length} hooks present and executable (100755 in the index).`)
}
if (!CHECK_ONLY) {
  console.log('   Note: this covers THIS clone only, and only because you installed in frontend/.')
}
