#!/usr/bin/env node
/**
 * Generate kus-pqms-Frontend-Development-Standards-v2.0.md from the source
 * files in pqms_standard_doc/.
 *
 *   node scripts/build-standards-doc-v2.mjs           # write the document
 *   node scripts/build-standards-doc-v2.mjs --check   # verify it is up to date
 *
 * Required by 00-core-rules.md's Precedence rule and by 40's amended version:
 * the numbered source files are the only authority, the single-file
 * distribution document is generated, and the generated file is never
 * hand-edited.
 *
 * Part structure (40's reading order is stated in the front matter; sections
 * are emitted in numeric order within each part so the document is
 * predictable to navigate):
 *
 *   Part I   — Building this project        40-46   (new in v2.0)
 *   Part II  — The standards                00-33   (carried forward verbatim)
 *   Part III — Specifications and registers 34-39   (carried forward verbatim)
 *
 * No dependencies. Node ESM only, so it runs on the version in .nvmrc with
 * nothing installed.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SRC_DIR = join(ROOT, "pqms_standard_doc");
const FRONT_MATTER = join(SRC_DIR, "_frontmatter-v2.md");
const OUT_FILE = join(SRC_DIR, "kus-pqms-Frontend-Development-Standards-v2.0.md");

const CHECK = process.argv.includes("--check");

const PARTS = [
  {
    title: "Part I — Building this project",
    range: [40, 46],
    blurb:
      "New in v2.0. Scope, closed decisions, the scaffold, the first build, the errata layer, " +
      "the base-wave specifications, the token mechanism, and the residue ledger. " +
      "**Read this part first, in order.**",
  },
  {
    title: "Part II — The standards",
    range: [0, 33],
    blurb:
      "Carried forward from v1.0 **verbatim**. No rule, number, date or piece of reasoning was " +
      "summarised, reordered or dropped. Every correction is in § 43.",
  },
  {
    title: "Part III — Specifications, registers and reference",
    range: [34, 39],
    blurb:
      "Carried forward verbatim. § 34's inventory is a planning instrument, not a build source — " +
      "see § 43 C-11. § 36 is reference and authorises nothing.",
  },
];

const fail = (msg) => {
  console.error(`build-standards-doc-v2: ${msg}`);
  process.exit(1);
};

/* ------------------------------------------------------------------ */
/* collect sources                                                     */
/* ------------------------------------------------------------------ */

if (!existsSync(FRONT_MATTER)) fail(`missing front matter: ${FRONT_MATTER}`);

const entries = readdirSync(SRC_DIR)
  .filter((n) => /^\d{2}-.*\.md$/.test(n))
  .map((name) => ({ name, num: Number(name.slice(0, 2)) }))
  .sort((a, b) => a.num - b.num);

if (entries.length === 0) fail(`no numbered source files found in ${SRC_DIR}`);

// Contiguity is checked per part rather than globally: a gap inside a declared
// range is a genuine problem (a file was deleted), whereas a gap between parts
// would just be an unused number.
for (const part of PARTS) {
  const [lo, hi] = part.range;
  for (let n = lo; n <= hi; n++) {
    if (!entries.some((e) => e.num === n)) {
      fail(`${part.title}: no source file for section ${String(n).padStart(2, "0")}`);
    }
  }
}

const claimed = new Set(PARTS.flatMap((p) => {
  const [lo, hi] = p.range;
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
}));
for (const e of entries) {
  if (!claimed.has(e.num)) {
    fail(`${e.name} is not covered by any part range. Add it to PARTS deliberately.`);
  }
}

/* ------------------------------------------------------------------ */
/* per-file parse                                                      */
/* ------------------------------------------------------------------ */

const anomalies = [];

/** Demote every ATX heading by one level. Fence-aware: never touches a line
 *  inside a ``` block, so a `#` comment in a code sample is left alone. */
function demoteHeadings(body, fileName) {
  const out = [];
  let fence = null;
  for (const line of body.split("\n")) {
    const f = /^\s*(```+|~~~+)/.exec(line);
    if (f) {
      if (fence === null) fence = f[1][0];
      else if (line.trimStart().startsWith(fence)) fence = null;
      out.push(line);
      continue;
    }
    if (fence === null && /^#{1,5}(\s|$)/.test(line)) {
      out.push("#" + line);
      continue;
    }
    out.push(line);
  }
  if (fence !== null) anomalies.push(`${fileName}: unclosed code fence`);
  return out.join("\n");
}

/** GitHub-flavoured heading anchor. */
function slug(text) {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const files = entries.map(({ name, num }) => {
  const raw = readFileSync(join(SRC_DIR, name), "utf8").replace(/\r\n/g, "\n").trimEnd();
  const lines = raw.split("\n");

  const h1 = lines[0].startsWith("# ") ? lines[0].slice(2).trim() : null;
  if (!h1) anomalies.push(`${name}: first line is not an H1`);

  const pick = (label) => {
    const l = lines.slice(0, 10).find((x) => x.startsWith(`**${label}:**`));
    return l ? l.replace(new RegExp(`^\\*\\*${label}:\\*\\*\\s*`), "").replace(/\*\*/g, "").trim() : null;
  };

  const status = pick("Status") ?? "(no status line)";
  if (status === "(no status line)") anomalies.push(`${name}: no **Status:** line in the first 10 lines`);

  const title = h1 ?? name;
  return {
    name,
    num,
    title,
    tier: pick("Tier") ?? "—",
    // The Contents table gets the short form; a full status sentence belongs in
    // the section, not in a table cell that then wraps across three lines.
    status: status.split("—")[0].trim().split("(")[0].trim() || status,
    anchor: slug(title),
    body: demoteHeadings(raw, name),
  };
});

const byNum = new Map(files.map((f) => [f.num, f]));

/* ------------------------------------------------------------------ */
/* assemble                                                            */
/* ------------------------------------------------------------------ */

const contents = [];
for (const part of PARTS) {
  const [lo, hi] = part.range;
  contents.push(`### ${part.title}`, "", part.blurb, "");
  contents.push("| § | Section | Tier | Status |", "| --- | --- | --- | --- |");
  for (let n = lo; n <= hi; n++) {
    const f = byNum.get(n);
    const id = String(n).padStart(2, "0");
    contents.push(`| ${id} | [${f.title}](#${f.anchor}) | ${f.tier} | ${f.status} |`);
  }
  contents.push("");
}

const frontMatter = readFileSync(FRONT_MATTER, "utf8").replace(/\r\n/g, "\n").trimEnd();
if (!frontMatter.includes("<!-- CONTENTS -->")) {
  fail("front matter has no <!-- CONTENTS --> marker");
}

const sections = [];
for (const part of PARTS) {
  const [lo, hi] = part.range;
  sections.push("---", "", `# ${part.title}`, "", part.blurb, "");
  for (let n = lo; n <= hi; n++) {
    sections.push("---", "", byNum.get(n).body, "");
  }
}

const doc =
  frontMatter.replace("<!-- CONTENTS -->", contents.join("\n")) +
  "\n\n" +
  sections.join("\n") +
  "\n";

/* ------------------------------------------------------------------ */
/* emit                                                                */
/* ------------------------------------------------------------------ */

if (anomalies.length) {
  console.error("build-standards-doc-v2: source anomalies");
  for (const a of anomalies) console.error(`  - ${a}`);
  fail(`${anomalies.length} anomaly/anomalies; fix the source files`);
}

if (CHECK) {
  if (!existsSync(OUT_FILE)) fail(`${OUT_FILE} does not exist — run without --check`);
  const current = readFileSync(OUT_FILE, "utf8").replace(/\r\n/g, "\n");
  if (current !== doc) {
    fail(
      "the generated document is out of date with its sources. " +
        "Run `pnpm docs:standards` and commit the result. Never hand-edit the output."
    );
  }
  console.log(`build-standards-doc-v2: up to date (${files.length} sections)`);
  process.exit(0);
}

writeFileSync(OUT_FILE, doc, "utf8");

const kb = (Buffer.byteLength(doc, "utf8") / 1024).toFixed(0);
console.log(
  `build-standards-doc-v2: wrote ${OUT_FILE}\n` +
    `  ${files.length} sections, ${doc.split("\n").length} lines, ${kb} KB`
);
