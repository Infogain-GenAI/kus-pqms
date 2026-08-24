// Parse the V4-V5 export's .dc.html SOURCE for the issues dataset (every d(...) call)
// so seed labels/values match the author's own data exactly.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const SRC = resolve(
  here,
  '../../_bmad-output/planning-artifacts/ux/design-source/exports/kia-npqms-v4-v5/ISM + QIR SE Role - P-C.dc.html',
)
const OUT = resolve(here, '../.fidelity/dc-source-data.json')

const s = readFileSync(SRC, 'utf8')
const out = []
const re = /\.\.\.d\(/g
let m
while ((m = re.exec(s))) {
  let i = m.index + m[0].length
  let depth = 1
  let inStr = null
  let j = i
  for (; j < s.length && depth > 0; j++) {
    const c = s[j]
    if (inStr) {
      if (c === '\\') j++
      else if (c === inStr) inStr = null
      continue
    }
    if (c === "'" || c === '"' || c === '`') inStr = c
    else if (c === '(') depth++
    else if (c === ')') depth--
  }
  const args = s.slice(i, j - 1)
  try {
    out.push(new Function('return [' + args + ']')())
  } catch {
    out.push(['PARSE_FAIL', args.slice(0, 100)])
  }
}
const rows = out
  .filter((a) => a[0] !== 'PARSE_FAIL')
  .map(([id, source, title, model, year, cls, _score, status, owner, role, dateLabel, age, nextAction, description]) => ({
    id, source, title, model, year, cls, status, owner, role, dateLabel, age, nextAction, description,
  }))
writeFileSync(OUT, JSON.stringify(rows, null, 1))
console.log('parsed:', rows.length, '(fails:', out.length - rows.length + ')')
for (const r of rows) console.log([r.id, r.source, r.status, `${r.owner} (${r.role})`, r.model, r.year, r.cls].join(' | '))
