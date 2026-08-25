#!/bin/sh
# frontend pre-push checks. Run by the root .githooks/pre-push router, which has
# already resolved the push range, filtered to top-level folders with changes, and
# cd'd into frontend/.
#
# THE SPLIT WITH pre-commit.sh IS DELIBERATE.
# pre-commit holds the millisecond checks (token manifest, generated-file drift,
# css-var names). This file holds the ones that take seconds: the TypeScript
# program and the three adherence ratchets. Push is the last point before the work
# leaves the machine, and it is infrequent enough to afford them.
#
# NOT THE UNIT SUITE — and not only because there isn't one. A hook slow enough to
# be resented is bypassed with --no-verify, and a bypassed gate is worse than an
# absent one because it still looks present. 23-git-workflow-hooks-and-commits.md
# specifies type-check and lint on push, explicitly not the unit suite.
# (RESTRUCTURE-BASELINE.md: zero tests, no runner, no coverage. When a suite
# exists it belongs in CI, which this repository also does not have yet.)
#
# EXIT CODES ARE THE WHOLE CONTRACT (23). A hook that ends in `echo`, or pipes its
# real work to `tee`, returns THAT command's status and silently always passes —
# the most common defect in hand-written hooks, invisible until something should
# have failed. So nothing here is piped, every check records into STATUS, and
# `exit "$STATUS"` is the last statement in the file. Both paths are tested.

STATUS=0

run() {
  _label=$1
  shift
  echo "   frontend: $_label"
  if "$@"; then
    :
  else
    echo "x  frontend: $_label failed"
    STATUS=1
  fi
}

# Types first: it is the check most likely to fail and the one whose failure makes
# the others meaningless.
run "typecheck" npx tsc --noEmit

# The three adherence ratchets. Each has its own ceiling in .ds-ceilings.json.
# A drop rewrites that file — if it does, commit it; the push is not blocked.
run "lint:ds:values" node scripts/ds-gate.mjs values
run "lint:ds:numeric" node scripts/ds-gate.mjs numeric
run "lint:ds:imports" node scripts/ds-gate.mjs imports

if [ "$STATUS" -ne 0 ]; then
  echo "   Push blocked by frontend pre-push checks."
  echo "   Fix the above, or bypass with --no-verify and say why."
fi

exit "$STATUS"
