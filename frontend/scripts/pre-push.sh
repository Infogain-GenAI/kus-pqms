#!/bin/sh
# frontend pre-push checks. Run by the root .githooks/pre-push router, which has
# already resolved the push range, filtered to top-level folders with changes, and
# cd'd into frontend/.
#
# THE SPLIT WITH pre-commit.sh IS DELIBERATE.
# pre-commit holds the millisecond checks (token manifest, generated-file drift,
# css-var names). This file holds the ones that take seconds: the TypeScript
# programs, the adherence ratchets, the test suite and the coverage ratchet.
# Push is the last point before work leaves the machine.
#
# NOT THE UNIT SUITE — that rule is now obsolete and the reason is recorded:
# 23 specifies type-check and lint on push and explicitly not the unit suite,
# written against an ~80-second suite. This one is ~19 s for EVERYTHING, so the
# suite is in.
#
# ---------------------------------------------------------------------------
# WALL-CLOCK, MEASURED END TO END 2026-08-26:
#
#     before   ~39 s   seven checks, sequential, each via `pnpm run` / `npx`
#     after    ~19 s   ten checks, concurrent, invoked directly
#     now      ~51 s   same ten, but the suite grew to 105 tests and the coverage
#                      denominator to ~50 files (531 -> 3,992 statements)
#
# **Faster with three MORE checks than it had before** (css-vars and tokens:drift
# joined, and typecheck split per package so the three run in parallel).
#
# Two things bought that, in order of size:
#   1. CONCURRENCY. The checks are independent, so the cost is the slowest one
#      (~18.6 s, the test suite) rather than their sum. Run serially the same ten
#      total ~111 s — the runner prints both numbers on every run so the gap
#      stays visible.
#   2. DIRECT INVOCATION. `npx` and `pnpm run` resolve a package graph before
#      executing anything. scripts/run-checks.mjs resolves each tool's JS
#      entrypoint and runs it with node, paying node startup once.
#
# **Nothing was removed to get here.** 23's rule is that a slow hook gets
# bypassed; the usual response is to drop a check, and that is the LAST lever.
#
# A CORRECTION, because a wrong number was recorded here: this hook was once
# measured at 89 s and that figure was written into three documents. It was a
# single cold sample taken while the machine was busy. Three consecutive runs of
# the same script give 39.8 / 38.7 / 38.5 s. **Measure more than once before
# recording a number that drives a decision.**
#
# ---------------------------------------------------------------------------
# ⚠️ THIS HOOK EXCEEDS 23'S GUIDANCE, DELIBERATELY. RECORDED PER 14.
#
# 23 says a hook slow enough to be resented gets bypassed with --no-verify, and
# it was written against an ~80-second suite. At ~51 s this is past the spirit of
# that guidance, and it STAYS ANYWAY. Not because the number is fine — because
# the alternative is worse:
#
#   **pre-push is currently the ONLY enforcement point in this project.**
#   There is no CI. A check moved to "build" is a check that runs when someone
#   remembers, and for a ratchet that means it silently stops ratcheting — the
#   floor stops moving and nobody notices, which is the exact failure the
#   ratchet exists to prevent.
#
# The trade: a slower hook that always runs, versus a faster one that enforces
# nothing on the pushes that matter. Until CI exists the first is correct, and
# the cost is accepted with open eyes rather than by not looking.
#
# WHAT MOVES THE COVERAGE RUN OUT:  CI EXISTING.
#   Not a time threshold and not a judgement call — that specific event. When a
#   pipeline runs these checks on every push or merge request, the test suite and
#   the coverage ratchet move there and this hook drops back to ~19 s.
#   The CI platform is an open placeholder in 00-core-rules.md.
#   OWNER: Frontend Lead, jointly with whoever owns the CI decision.
#
# AND DO NOT RE-OPTIMISE THE PLUMBING — IT IS ALREADY DONE.
#   The ten checks run CONCURRENTLY from one node process, each tool's JS
#   entrypoint resolved directly rather than through a package-manager wrapper.
#   Serial, the same ten cost ~111 s. THE FLOOR IS THE SLOWEST SINGLE CHECK,
#   which is the test suite — slow because it grew from 47 to 105 tests over a
#   coverage denominator that went from 531 to 3,992 statements. That growth is
#   the point of the work, not a defect to tune away.
#   The runner prints wall-clock, the slowest check and the serial estimate on
#   every run, so this does not need re-deriving.
#
# EXIT CODES ARE THE WHOLE CONTRACT (23). A hook that ends in `echo`, or pipes
# its real work to `tee`, returns THAT command's status and silently always
# passes. `exit "$STATUS"` is the last statement in this file.

STATUS=0

# One process, ten checks, concurrent. It prints its own per-check timings and
# exits non-zero if any fails.
if node scripts/run-checks.mjs; then
  :
else
  STATUS=1
fi

if [ "$STATUS" -ne 0 ]; then
  echo ""
  echo "   Push blocked by frontend pre-push checks."
  echo "   Fix the above, or bypass with --no-verify and say why."
fi

exit "$STATUS"
