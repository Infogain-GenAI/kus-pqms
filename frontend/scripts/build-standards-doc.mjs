#!/usr/bin/env node
/**
 * Generate the concatenated frontend standards distribution document
 * from the tier files in PQMS_docs/standards/.
 *
 *   node scripts/build-standards-doc.mjs           # write the document
 *   node scripts/build-standards-doc.mjs --check   # verify it is up to date
 *
 * Required by 00-core-rules.md's Precedence rule: the tier files are the
 * source, the distribution document is generated, and the generated file is
 * never hand-edited.
 *
 * No dependencies. Node ESM only, so it runs on the version in .nvmrc with
 * nothing installed.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SRC_DIR = join(ROOT, "PQMS_docs", "standards");
const OUT_FILE = join(ROOT, "PQMS_docs", "Frontend-Development-Standards-v1.0.md");

const EXPECTED_COUNT = 34; // 00 through 33, contiguous
const CHECK = process.argv.includes("--check");

/* ------------------------------------------------------------------ */
/* collect sources                                                     */
/* ------------------------------------------------------------------ */

const fail = (msg) => {
  console.error(`build-standards-doc: ${msg}`);
  process.exit(1);
};

const entries = readdirSync(SRC_DIR)
  .filter((n) => /^\d{2}-.*\.md$/.test(n))
  .map((name) => ({ name, num: Number(name.slice(0, 2)) }))
  .sort((a, b) => a.num - b.num);

if (entries.length !== EXPECTED_COUNT) {
  fail(
    `expected ${EXPECTED_COUNT} tier files in ${SRC_DIR}, found ${entries.length}. ` +
      `Update EXPECTED_COUNT deliberately if a tier file was added or removed.`
  );
}
entries.forEach((e, i) => {
  if (e.num !== i) fail(`tier files are not contiguous: expected ${String(i).padStart(2, "0")}-*, got ${e.name}`);
});

/* ------------------------------------------------------------------ */
/* per-file parse: title, status, heading demotion                     */
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
    if (fence === null && /^#/.test(line) && !/^#{1,6}\s/.test(line)) {
      anomalies.push(`${fileName}: line starts with '#' but is not a heading: ${line.slice(0, 48)}`);
    }
    out.push(line);
  }
  if (fence !== null) anomalies.push(`${fileName}: unclosed code fence`);
  return out.join("\n");
}

const files = entries.map(({ name, num }) => {
  const raw = readFileSync(join(SRC_DIR, name), "utf8").replace(/\r\n/g, "\n");
  const lines = raw.split("\n");

  const h1 = lines[0].startsWith("# ") ? lines[0].slice(2).trim() : null;
  if (!h1) anomalies.push(`${name}: first line is not an H1`);

  const statusLine = lines.slice(0, 8).find((l) => l.startsWith("**Status:**"));
  const status = statusLine
    ? statusLine.replace(/^\*\*Status:\*\*\s*/, "").replace(/\*\*/g, "").split("(")[0].trim()
    : "(no status line)";
  if (!statusLine) anomalies.push(`${name}: no **Status:** line in the first 8 lines`);

  const tierLine = lines.slice(0, 8).find((l) => l.startsWith("**Tier:**"));
  const tier = tierLine ? tierLine.replace(/^\*\*Tier:\*\*\s*/, "").trim() : "?";

  const trimmed = raw.trimEnd();
  return {
    name,
    num,
    title: h1 ?? name,
    status,
    tier,
    rawBody: trimmed,
    body: demoteHeadings(trimmed, name),
    // Wrap-tolerant search text — see `flatten()` below for why this exists
    // and what it does. Every derived-index computation searches THIS, not
    // `rawBody`, so a hard-wrapped identifier or attribution is never
    // invisible to it.
    flat: flatten(trimmed),
  };
});

/** This corpus hard-wraps prose at ~72-80 chars. A long hyphenated token —
 *  a tier-file reference (`08-authentication-and-authorization.md`), a
 *  glossary term — can have its wrap point land INSIDE the token, splitting
 *  it with a literal newline: `08-authentication-and-\nauthorization.md`.
 *  A regex or `.includes()` check against the raw text then finds nothing,
 *  because the token is no longer contiguous in the source string — this is
 *  exactly how 20's `(used in:)` list survived a sweep meant to remove it
 *  (OIDC, IdP) and how the inbound-reference count silently lost real
 *  citations (08←03, 14←15): the reference was there, split by a wrap the
 *  search never accounted for.
 *
 *  Fix: join a hyphen-then-newline wrap back into a plain hyphen (the
 *  hyphen survives the wrap; only the newline and the next line's leading
 *  indentation need removing), then collapse every remaining run of
 *  whitespace — including any newline that wrapped ordinary prose, not a
 *  token — to a single space. After this, no literal `\n` can sit inside
 *  what was a single word in the source, and every regex below can use an
 *  ordinary `\s+` (or no whitespace handling at all, having already been
 *  normalized away) instead of needing bespoke newline-awareness. */
function flatten(s) {
  return s.replace(/-\n[ \t]*/g, "-").replace(/\s+/g, " ");
}

/* ------------------------------------------------------------------ */
/* derived cross-reference index                                       */
/*                                                                      */
/* Three facts about the corpus that are NOT rules — they are reports  */
/* on the current state of files that change independently of them     */
/* — and that were previously hand-maintained inside tier files (20's  */
/* `(used in: ...)` glossary attributions, 18's inbound-citation count, */
/* 01/18's `Base*`-mention counts). All three were wrong when checked:  */
/* 14 of 20's 25 attributions, 18's count (claimed 4, actual 7), and    */
/* every one of the three component-mention counts. A fact re-derived  */
/* by hand on every revision drifts the moment any of the files it     */
/* depends on changes; a fact computed here cannot go stale, because it */
/* is recomputed from the same files every time this script runs.       */
/* ------------------------------------------------------------------ */

const FILEREF = /\b(\d{2})-[a-z][a-z0-9-]*\.md\b/g;
// Requires a lowercase letter immediately after the leading capital, so a
// bare placeholder like `BaseX` (no real word following `Base`) never
// matches — it isn't a component name, it's a metasyntactic stand-in (see
// 00's "A component spec titled `BaseX.md`" example).
const BASESTAR = /\bBase[A-Z][a-z][A-Za-z]*\b/g;

// A `Base<Component><Suffix>` identifier names a TYPE or a props interface,
// not a component — `BaseButtonVariant` is `BaseButton`'s variant union,
// `BaseButtonProps` is its props interface. Suffix vocabulary is not
// guessed: Variant/State/Size/Mode/Type come from 06's own documented
// `Pqms*` shared-type vocabulary (`PqmsButtonVariant`, `PqmsIconSize`,
// `PqmsDateSelectorMode`, `PqmsInputType`, `PqmsValidationState`); Props is
// the standard React props-interface suffix this corpus itself uses
// throughout (`BaseButtonProps` in 14's own barrel-export example).
const TYPE_SUFFIXES = ["Variant", "Props", "State", "Size", "Mode", "Type"];
function isComponentIdentifier(name) {
  return !TYPE_SUFFIXES.some((suf) => name.endsWith(suf) && name.length > 4 + suf.length);
}

const byNum = new Map(files.map((f) => [String(f.num).padStart(2, "0"), f]));

// --- glossary term usage: terms come from 20's own "Technical /
// Engineering Glossary" section (hand-authored definitions); which other
// files mention each term is computed, not read from 20's text. ---
const glossaryFile = files.find((f) => f.num === 20);
const glossarySection = glossaryFile
  ? (glossaryFile.flat.match(/## Technical \/ Engineering Glossary (.*?) ## /) ?? [])[1] ?? ""
  : "";
const terms = [...glossarySection.matchAll(/- \*\*(.+?)\*\*/g)].map((m) => m[1]);

function termVariants(term) {
  return term
    .split("/")
    .map((t) => t.trim().replace(/^`|`$/g, ""))
    .filter((t) => t.length >= 2);
}

const termRows = terms.map((term) => {
  const variants = termVariants(term);
  const usedIn = files
    .filter((f) => f.num !== 20 && variants.some((v) => f.flat.includes(v)))
    .map((f) => String(f.num).padStart(2, "0"));
  return { term, usedIn };
});

// --- inbound references: for every tier file, which other files cite its
// filename, computed by scanning every tier file for the `NN-name.md` pattern. ---
const inbound = new Map([...byNum.keys()].map((n) => [n, new Set()]));
for (const f of files) {
  const selfNum = String(f.num).padStart(2, "0");
  for (const m of f.flat.matchAll(FILEREF)) {
    const target = m[1];
    if (target !== selfNum && byNum.has(target)) inbound.get(target).add(selfNum);
  }
}
const inboundRows = [...byNum.keys()].map((n) => ({
  num: n,
  citedBy: [...inbound.get(n)].sort(),
}));

// --- `Base*` component-name mentions, per file. Type/props compounds
// (`BaseButtonVariant`, `BaseButtonProps`) are filtered out — see
// `isComponentIdentifier` above. ---
const baseStarRows = files
  .map((f) => {
    const names = [
      ...new Set([...f.flat.matchAll(BASESTAR)].map((m) => m[0]).filter(isComponentIdentifier)),
    ].sort();
    return { num: String(f.num).padStart(2, "0"), names };
  })
  .filter((r) => r.names.length > 0);

const appendixBody = [
  "## Appendix: Derived Cross-Reference Index",
  "",
  `**Computed directly from the ${files.length} tier files above by this script — not`,
  "sourced from, or owned by, any single one of them.** Everything in this",
  "section is a report on the corpus's current state, regenerated fresh",
  "every run. If a rule needs changing, it is not here: this appendix has",
  "no rules, only counts and lists derived from the files that do.",
  "",
  "### Glossary term usage (per 20's term list)",
  "",
  "Which files use each term 20 defines. The definitions are authored in",
  "20; this list is not — see 20's glossary note for why.",
  "",
  "| Term | Used in | Count |",
  "| --- | --- | --- |",
  ...termRows.map((r) => `| ${r.term} | ${r.usedIn.join(", ") || "—"} | ${r.usedIn.length} |`),
  "",
  "### Inbound references per tier file",
  "",
  "For each file, which other files cite its filename at least once.",
  "",
  "| File | Cited by | Count |",
  "| --- | --- | --- |",
  ...inboundRows.map(
    (r) => `| ${r.num} | ${r.citedBy.join(", ") || "—"} | ${r.citedBy.length} |`
  ),
  "",
  "### `Base*` component-name mentions per file",
  "",
  "Distinct `Base*` identifiers mentioned in each file, incidentally, as",
  "examples of some other rule. **Not a component inventory** — see 01's",
  "\"This file does not enumerate the components\" section for why these",
  "mentions must not be assembled into one.",
  "",
  "| File | Names | Count |",
  "| --- | --- | --- |",
  ...baseStarRows.map((r) => `| ${r.num} | ${r.names.join(", ")} | ${r.names.length} |`),
].join("\n");

/* ------------------------------------------------------------------ */
/* assemble                                                            */
/* ------------------------------------------------------------------ */

const srcRel = relative(ROOT, SRC_DIR).replace(/\\/g, "/");
const outRel = relative(ROOT, OUT_FILE).replace(/\\/g, "/");

const header = [
  "# PQMS Frontend Standards — distribution document",
  "",
  "> **GENERATED FILE — DO NOT EDIT.**",
  ">",
  "> Generated from the tier files in `" + srcRel + "/` by",
  "> `scripts/build-standards-doc.mjs`. Every edit goes to the tier file that",
  "> owns the rule; this document is then regenerated with",
  "> `pnpm docs:standards`. An edit made here is lost on the next",
  "> regeneration and, worse, is invisible to anyone reading the source.",
  "",
  "**No generation timestamp, deliberately.** A timestamp would make every",
  "regeneration a diff even when no rule changed, and it answers the wrong",
  "question: what matters is whether this file matches its sources, which",
  "`pnpm docs:standards:check` answers exactly. When it was generated is",
  "already recorded, more reliably, by git.",
  "",
  "**Cross-references are left exactly as the tier files write them.** A",
  "reference reading `see 08-authentication-and-authorization.md` still names a",
  "file rather than a section of this document. That is intentional: the",
  "filename is where an edit has to be made, so a reader following a reference",
  "lands on the editable source rather than on read-only output.",
  "",
  "**Headings are demoted one level** so this document has a single H1 — its",
  "own — and each tier file becomes an H2. Nothing else about the sources is",
  "altered.",
  "",
  "**One section at the end is not a tier file: the Appendix.** Everything",
  "above it is a concatenation of a source file, one-to-one. The appendix is",
  `computed by this script directly from all ${files.length} files — cross-reference`,
  "counts that were previously hand-maintained inside tier files and found",
  "to be wrong. It has no source file of its own for the same reason the",
  "Contents table below doesn't: both are reports on the sources, not one of",
  "them.",
  "",
  "## Contents",
  "",
  "| # | File | Tier | Status |",
  "| --- | --- | --- | --- |",
  ...files.map(
    (f) =>
      `| ${String(f.num).padStart(2, "0")} | [${f.title}](#${slug(f.title)}) | ${f.tier} | ${f.status} |`
  ),
  `| — | [Appendix: Derived Cross-Reference Index](#${slug("Appendix: Derived Cross-Reference Index")}) | — | computed |`,
].join("\n");

/** GitHub's heading-anchor rule: lowercase, drop everything that is not a
 *  letter, digit, space or hyphen, then spaces become hyphens. Runs of
 *  hyphens are NOT collapsed — `00 — Core Rules` anchors as `00--core-rules`,
 *  because the em dash is removed and its two surrounding spaces each become
 *  a hyphen. Collapsing them here would produce a TOC of dead links. */
function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/ /g, "-");
}

const SEP = "\n\n---\n\n";
const doc = [header, ...files.map((f) => f.body), appendixBody].join(SEP) + "\n";

/* ------------------------------------------------------------------ */
/* emit or verify                                                      */
/* ------------------------------------------------------------------ */

for (const a of anomalies) console.error(`build-standards-doc: WARNING ${a}`);

if (CHECK) {
  let current = null;
  try {
    current = readFileSync(OUT_FILE, "utf8").replace(/\r\n/g, "\n");
  } catch {
    fail(`${outRel} does not exist. Run: pnpm docs:standards`);
  }
  if (current !== doc) {
    fail(
      `${outRel} is out of date or was hand-edited.\n` +
        `  on disk:   ${current.length} bytes\n` +
        `  generated: ${doc.length} bytes\n` +
        `  Fix by regenerating, never by editing the output: pnpm docs:standards`
    );
  }
  console.log(`build-standards-doc: ${outRel} is up to date (${files.length} tier files).`);
  process.exit(0);
}

writeFileSync(OUT_FILE, doc, "utf8");
console.log(
  `build-standards-doc: wrote ${outRel} — ${files.length} tier files, ${doc.length} bytes.`
);
