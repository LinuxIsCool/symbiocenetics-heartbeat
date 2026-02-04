#!/usr/bin/env bash
# Stop hook: show git status after each Claude response
#
# Uses both output channels:
#   systemMessage    → visible to the user in the terminal
#   additionalContext → visible to Claude in the next turn

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
    'systemMessage': msg,
    'hookSpecificOutput': {
        'hookEventName': 'Stop',
        'additionalContext': msg
    }
}))
" <<< "$MSG"
