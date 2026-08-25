#!/bin/sh
# frontend pre-commit checks. Run by the root .githooks/pre-commit router, which
# has already cd'd into frontend/ and only invokes this when frontend/ has staged
# changes.
#
# KEEP THEM FAST — this file's original TODO said so, and it is the right rule: a
# slow pre-commit hook is a hook people disable with --no-verify, and a bypassed
# gate is worth less than no gate because it still looks present. Both checks here
# read one JSON manifest and a handful of small CSS files; they are milliseconds.
# The expensive checks (tsc, the adherence ratchets) live in pre-push.sh.
#
# EXIT CODES ARE THE WHOLE CONTRACT (23-git-workflow-hooks-and-commits.md).
# A hook that ends in `echo`, or pipes its real work to `tee`, returns THAT
# command's status and silently always passes. So: every check records into
# STATUS, nothing is piped, and `exit "$STATUS"` is the last statement in the file.
# Verified by deliberately breaking a gate and confirming the commit is refused.

STATUS=0

run() {
  _label=$1
  shift
  if "$@"; then
    :
  else
    echo "x  frontend: $_label failed"
    STATUS=1
  fi
}

# The vendored token CSS still matches the design-system manifest.
run "tokens:check" node scripts/check-tokens.mjs

# src/tokens/tokens.generated.ts still matches what the manifest generates.
# tokens:check cannot see this file at all, so without this a stale or
# hand-edited generated map passes every other gate.
run "tokens:drift" node scripts/check-tokens-drift.mjs

# Every var(--x) under src/ names a property that actually exists. A fabricated
# name is valid CSS that compiles, ships and renders nothing, and no other gate
# in this project sees it.
run "css-vars" node scripts/check-css-vars.mjs

if [ "$STATUS" -ne 0 ]; then
  echo "   Commit blocked by frontend pre-commit checks."
  echo "   Fix the above, or bypass with --no-verify and say why in the message."
fi

exit "$STATUS"
