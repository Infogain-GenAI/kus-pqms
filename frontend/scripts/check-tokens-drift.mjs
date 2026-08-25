// Generated-file drift gate.
//
// tokens:check proves the vendored token CSS matches design-system-manifest.json.
// It says NOTHING about src/tokens/tokens.generated.ts, which is generated from
// the same manifest and committed. So the typed token map could be hand-edited,
// or left stale after a manifest bump, and every existing gate would still pass.
//
// This closes that: regenerate from the current manifest into a temp directory and
// diff against the committed file. It never writes into src/ — Phase 1's acceptance
// is zero files under frontend/src in the diff, and a gate that dirties the tree it
// is checking cannot be run from a pre-commit hook.
//
// Comparison is LF-normalised. frontend/.gitattributes now pins eol=lf, but a
// working tree checked out before that lands can still hold CRLF, and a gate that
// fails on line endings alone would be noise rather than signal.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const COMMITTED = join(root, 'src/tokens/tokens.generated.ts')

const tmp = mkdtempSync(join(tmpdir(), 'pqms-tokens-'))
try {
  execFileSync(process.execPath, [join(root, 'scripts/gen-tokens.mjs'), '--out', tmp], { stdio: 'pipe' })

  const norm = (s) => s.replace(/\r\n/g, '\n')
  const fresh = norm(readFileSync(join(tmp, 'tokens.generated.ts'), 'utf8'))
  const committed = norm(readFileSync(COMMITTED, 'utf8'))

  if (fresh === committed) {
    console.log('v tokens:drift — src/tokens/tokens.generated.ts matches the manifest.')
    process.exit(0)
  }

  console.error('x tokens:drift — src/tokens/tokens.generated.ts does NOT match design-system-manifest.json.')
  console.error('   Either the manifest changed and the file was not regenerated, or the file was hand-edited.')
  console.error('   It is generated output: run `pnpm run tokens:gen` and commit the result. Never edit it directly.')

  const a = fresh.split('\n')
  const b = committed.split('\n')
  let shown = 0
  for (let i = 0; i < Math.max(a.length, b.length) && shown < 8; i++) {
    if (a[i] !== b[i]) {
      console.error(`   line ${i + 1}:`)
      console.error(`     regenerated: ${JSON.stringify(a[i] ?? null)}`)
      console.error(`     committed:   ${JSON.stringify(b[i] ?? null)}`)
      shown++
    }
  }
  process.exit(1)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
