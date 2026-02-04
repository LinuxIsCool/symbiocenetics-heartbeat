#!/usr/bin/env bash
# UserPromptSubmit hook: inject git status into Claude's context
#
# Outputs hookSpecificOutput.additionalContext so Claude sees the
# current branch and working tree state at the start of each turn.

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0

STATUS=$(git status --short 2>/dev/null)
BRANCH=$(git branch --show-current 2>/dev/null)

if [ -z "$STATUS" ]; then
  MSG="[git] ${BRANCH} — clean"
else
  MSG=$(printf '[git] %s\n%s' "$BRANCH" "$STATUS")
fi

python3 -c "
import json, sys
msg = sys.stdin.read().rstrip()
print(json.dumps({
    'hookSpecificOutput': {
        'hookEventName': 'UserPromptSubmit',
        'additionalContext': msg
    }
}))
" <<< "$MSG"
