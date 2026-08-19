#!/bin/sh
# One-time developer setup. Run this once per clone, on every machine.
#
# core.hooksPath lives in .git/config, which NEVER travels with a clone.
# Until this runs, no hooks fire at all -- silently. Commits are not validated
# and nothing warns you.
set -e

git config core.hooksPath .githooks
echo "OK  hooks enabled (core.hooksPath = .githooks)"

# Install dependencies only for components that actually have a package.json
# yet. Skipped silently for components that have not been scaffolded.
for c in frontend automation; do
  if [ -f "$c/package.json" ]; then
    echo "--> installing $c dependencies"
    ( cd "$c" && npm install )
  fi
done

echo "OK  setup complete"
echo
echo "Reminder: hooks are fast feedback, not enforcement."
echo "  --no-verify bypasses them. CI is the real gate."
