# Phase 2 Supplement — Local Server Automation

This document supplements `@.claude/specs/phase-2.md` with a revised automation
architecture. Rather than running digest generation in GitHub Actions with a paid
API key (Architecture B), we run it on a local server using the Claude Code CLI
in headless mode, authenticated via Max plan subscription. The agent file pattern,
rollup commands, and enhanced templates from the parent spec are unchanged — only
the execution environment and its surrounding infrastructure change.

**Why this revision exists:** The operator already pays for a Claude Max plan for
interactive development. A once-daily digest consumes a negligible fraction of the
Max plan's weekly allocation. Running the automation locally eliminates the
$67–165/month in API costs that Architecture B would incur, at the expense of
managing a persistent server environment.

---

## 1. Architecture E: Local Cron + Max Plan

### How It Works

```
Server (always-on)
──────────────────
1. crontab fires at scheduled time
2. Shell script pulls latest from origin
3. claude -p reads the agent file
4. Claude Code queries MCP tools (KOI, Ledger, Web)
5. Claude Code writes digest to content/digests/
6. Shell script commits and pushes to origin
7. GitHub Actions deploy.yml triggers on push → Quartz builds → Pages deploys
```

The critical insight: GitHub Actions still handles *deployment* (the existing
`deploy.yml` workflow triggers on push to `content/**`). What moves to the local
server is only the *generation* step. This is a clean separation of concerns:
the server generates content, GitHub renders and hosts it.

### Comparison with Architecture B

| Aspect | B: GitHub Actions + API Key | E: Local Cron + Max Plan |
|--------|----------------------------|--------------------------|
| **Additional cost** | $67–165/month (API) | $0 (included in Max subscription) |
| **Execution environment** | GitHub-hosted runner | Your server |
| **Authentication** | `ANTHROPIC_API_KEY` | `claude login` (Max subscription OAuth) |
| **MCP configuration** | `/tmp/mcp-config.json` injected at runtime | `.claude/settings.json` (already configured) |
| **Reliability** | High (managed infrastructure) | Medium (depends on server uptime, token freshness) |
| **Manual trigger** | `workflow_dispatch` in GitHub UI | SSH + run script, or `workflow_dispatch` fallback |
| **Context window** | Full API context | 200K (Max plan limit) |
| **CLAUDE.md respected** | Yes | Yes |
| **MCP tools available** | Yes (via `--mcp-config`) | Yes (via project `.claude/settings.json`) |

### Why This Works for Our Use Case

A daily digest is a lightweight, once-per-day task. The Max 20x plan provides
240–480 Sonnet hours per week. A single digest generation uses roughly 10–30
minutes of active model processing time. That is less than 2% of the weekly
allocation, leaving the vast majority of the subscription available for
interactive work.

The rate limit crackdown (August 2025) targeted users running Claude Code
"continuously in the background, 24/7." A once-daily cron job that runs for
30 minutes and then stops is categorically different from continuous background
processing.

---

## 2. Server Requirements

### Minimum Environment

- A Linux server (physical, VPS, or home machine) that stays powered on
- Claude Code CLI installed (`curl -fsSL https://claude.ai/install.sh | bash`)
- Node.js 18+ (for MCP servers that use npx)
- Git with SSH key configured for push access to the repository
- An active Claude Max plan subscription, authenticated via `claude login`
- Network access to: `api.claude.ai`, the KOI API, Cosmos SDK REST endpoints

### Authentication Setup

```bash
# One-time interactive login on the server
claude login
# This opens a browser for OAuth — use SSH tunneling or a desktop session

# Verify authentication
claude -p "Say hello" --output-format text
```

The OAuth token is stored in the system keychain or
`~/.claude/.credentials.json`. It persists across reboots but may expire
after approximately 24 hours. See Section 5 (Token Management) for the
mitigation strategy.

### Repository Setup

```bash
# Clone the repository
git clone git@github.com:gaiaaiagent/regen-heartbeat.git
cd regen-heartbeat

# Verify MCP tools are accessible
claude -p "Use the koi search tool to search for 'governance'" \
  --dangerously-skip-permissions --max-turns 3
```

The server uses the project's `.claude/settings.json` for MCP configuration
directly — no need to create a temporary config file as in Architecture B. The
MCP servers are already defined there from the interactive development setup.

---

## 3. The Runner Script

A shell script at `scripts/run-digest.sh` orchestrates each generation cycle.
This is the entry point that cron calls.

```bash
#!/usr/bin/env bash
set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CADENCE="${1:-daily}"
DATE_ARG="${2:-}"
LOG_DIR="${REPO_DIR}/.claude/local/logs"
BOT_NAME="regen-heartbeat[bot]"
BOT_EMAIL="heartbeat@regen.network"

mkdir -p "$LOG_DIR"
LOG_FILE="${LOG_DIR}/${CADENCE}-$(date -u +%Y%m%d-%H%M%S).log"

# ─── Functions ───────────────────────────────────────────────────
log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"; }

die() { log "FATAL: $*"; exit 1; }

check_auth() {
  # Verify Claude Code can authenticate before starting a long run
  if ! claude -p "echo ok" --max-turns 1 --dangerously-skip-permissions \
       --output-format text > /dev/null 2>&1; then
    die "Claude Code authentication failed. Run 'claude login' to refresh."
  fi
}

# ─── Pre-flight ──────────────────────────────────────────────────
log "Starting ${CADENCE} digest generation"
cd "$REPO_DIR"

# Pull latest to ensure we have recent digests for rollups
git pull --ff-only origin main || die "Git pull failed"

# Verify auth before committing to a long run
check_auth

# ─── Determine target and agent file ────────────────────────────
AGENT_FILE=".claude/agents/${CADENCE}-digest.md"
[ -f "$AGENT_FILE" ] || die "Agent file not found: $AGENT_FILE"

case "$CADENCE" in
  daily)
    TARGET="${DATE_ARG:-$(date -u -d yesterday +%Y-%m-%d)}"
    MAX_TURNS=50
    PROMPT="Generate a daily digest for the Regen ecosystem.
Read and follow ALL instructions in: ${AGENT_FILE}
Target date: ${TARGET}
IMPORTANT: This is an automated run. Complete autonomously.
Write the digest to the correct path in content/digests/."
    ;;
  weekly)
    TARGET="${DATE_ARG:-$(date -u +%Y-W%V)}"
    MAX_TURNS=75
    PROMPT="Generate a weekly digest for the Regen ecosystem.
Read and follow ALL instructions in: ${AGENT_FILE}
Target week: ${TARGET}
IMPORTANT: This is an automated run. Complete autonomously."
    ;;
  monthly)
    TARGET="${DATE_ARG:-$(date -u -d 'last month' +%Y-%m)}"
    MAX_TURNS=100
    PROMPT="Generate a monthly digest for the Regen ecosystem.
Read and follow ALL instructions in: ${AGENT_FILE}
Target month: ${TARGET}
IMPORTANT: This is an automated run. Complete autonomously."
    ;;
  yearly)
    TARGET="${DATE_ARG:-$(date -u +%Y)}"
    MAX_TURNS=150
    PROMPT="Generate a yearly digest for the Regen ecosystem.
Read and follow ALL instructions in: ${AGENT_FILE}
Target year: ${TARGET}
IMPORTANT: This is an automated run. Complete autonomously."
    ;;
  *)
    die "Unknown cadence: $CADENCE"
    ;;
esac

log "Cadence: ${CADENCE}, Target: ${TARGET}, Max turns: ${MAX_TURNS}"

# ─── Generate ────────────────────────────────────────────────────
log "Running Claude Code in headless mode"

# Ensure we do NOT accidentally use an API key
unset ANTHROPIC_API_KEY 2>/dev/null || true

claude -p "$PROMPT" \
  --dangerously-skip-permissions \
  --max-turns "$MAX_TURNS" \
  --output-format text \
  >> "$LOG_FILE" 2>&1

CLAUDE_EXIT=$?

if [ $CLAUDE_EXIT -ne 0 ]; then
  log "Claude Code exited with code $CLAUDE_EXIT"
  # Don't die — there may still be partial output worth committing
fi

# ─── Commit and push ────────────────────────────────────────────
if git diff --quiet content/digests/ && \
   git diff --cached --quiet content/digests/; then
  log "No changes to commit"
else
  git config user.name "$BOT_NAME"
  git config user.email "$BOT_EMAIL"
  git add content/digests/
  git commit -m "${CADENCE}: ${TARGET}"
  git push origin main
  log "Committed and pushed: ${CADENCE}: ${TARGET}"
fi

log "Done"
```

### Usage

```bash
# Daily digest for yesterday
./scripts/run-digest.sh daily

# Daily digest for a specific date
./scripts/run-digest.sh daily 2026-02-03

# Weekly rollup
./scripts/run-digest.sh weekly

# Monthly rollup for a specific month
./scripts/run-digest.sh monthly 2026-01
```

---

## 4. Cron Schedule

The staggered schedule from the parent spec applies, translated to crontab
entries on the server.

```crontab
# Regen Heartbeat — digest generation
# Staggered to ensure lower cadences complete before higher cadences run

# Daily: every day at 08:00 UTC
0 8 * * *     /path/to/regen-heartbeat/scripts/run-digest.sh daily     >> /dev/null 2>&1

# Weekly: Monday, Wednesday, Friday at 10:00 UTC
0 10 * * 1,3,5  /path/to/regen-heartbeat/scripts/run-digest.sh weekly  >> /dev/null 2>&1

# Monthly: 1st and 15th at 12:00 UTC
0 12 1,15 * *   /path/to/regen-heartbeat/scripts/run-digest.sh monthly >> /dev/null 2>&1

# Yearly: manual only (run-digest.sh yearly 2026)
```

Output is logged to `.claude/local/logs/` (gitignored). The `>> /dev/null`
suppresses cron mail — the script's own logging captures everything.

---

## 5. Token Management

OAuth token expiration is the primary reliability risk. Max plan tokens expire
approximately every 24 hours, and there is no automatic refresh mechanism for
headless mode ([Issue #10334](https://github.com/anthropics/claude-code/issues/10334),
[Issue #18444](https://github.com/anthropics/claude-code/issues/18444)).

### Mitigation Strategy

**Pre-flight auth check.** The runner script calls `check_auth()` before
starting a long generation run. If auth fails, the script exits with a clear
error message instead of burning turns on a doomed session.

**Scheduled re-authentication.** A lightweight cron job runs before the daily
digest to verify the token is fresh. If it has expired, the job logs the failure
and sends a notification. The operator re-authenticates manually via
`claude login`.

```crontab
# Token health check — 15 minutes before daily digest
45 7 * * *    /path/to/regen-heartbeat/scripts/check-auth.sh >> /dev/null 2>&1
```

```bash
#!/usr/bin/env bash
# scripts/check-auth.sh — verify Claude Code auth is healthy
set -euo pipefail

unset ANTHROPIC_API_KEY 2>/dev/null || true

if claude -p "echo ok" --max-turns 1 --dangerously-skip-permissions \
     --output-format text > /dev/null 2>&1; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Auth OK"
else
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] AUTH FAILED — run 'claude login'"
  # Optional: send notification via webhook, email, or push notification
  # curl -X POST "https://your-webhook-url" -d '{"text":"Claude auth expired"}'
fi
```

**Monitoring.** If the daily digest fails to appear in the repository by 09:00
UTC, something went wrong. A simple GitHub Actions workflow can check for this:

```yaml
name: Heartbeat Monitor
on:
  schedule:
    - cron: '0 9 * * *'
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Verify daily digest exists
        run: |
          YESTERDAY=$(date -u -d yesterday +%Y/%m/%d)
          if [ ! -f "content/digests/${YESTERDAY}/daily.md" ]; then
            echo "::warning::Daily digest missing for ${YESTERDAY}"
            # Could create an issue, send webhook, etc.
          fi
```

### Future Resolution

Anthropic has open feature requests for long-lived tokens
([Issue #727](https://github.com/anthropics/claude-code-action/issues/727)) and
documented headless authentication
([Issue #7100](https://github.com/anthropics/claude-code/issues/7100)). When
these are resolved, the token management problem disappears and this architecture
becomes fully hands-off.

---

## 6. MCP Configuration

Unlike Architecture B, which creates a temporary MCP config at runtime, the
local server uses the project's existing `.claude/settings.json`. The MCP servers
defined there for interactive development are the same ones used for automated
generation.

This means:
- No secrets injection step is needed.
- No `/tmp/mcp-config.json` is created.
- MCP tool behavior in automation is identical to interactive use.
- Any MCP configuration changes made during development are automatically
  picked up by the next automated run.

The server must have the MCP server dependencies available. For npx-based
servers, this means Node.js 18+ and network access to the npm registry on first
run (packages are cached after that).

---

## 7. Fallback to Architecture B

Architecture E is the primary path, but Architecture B (GitHub Actions + API key)
remains available as a fallback. The fallback is useful when:

- The server is offline for maintenance.
- Token expiration cannot be resolved promptly.
- A specific digest needs to be regenerated from a clean environment.
- Reliability is more important than cost for a particular run.

The `workflow_dispatch` inputs defined in the parent spec's workflow YAML allow
manual triggering of any cadence at any time. To enable the fallback, configure
`ANTHROPIC_API_KEY` as a GitHub repository secret and deploy the workflow files
from Section 4 of the parent spec.

The two architectures can coexist. The local server handles the routine daily
generation at zero additional cost. GitHub Actions handles edge cases, manual
re-runs, and serves as a safety net. The git commit flow is identical — both
produce a push to main that triggers the Quartz deploy.

---

## 8. Cost Analysis (Revised)

| Component | Architecture B | Architecture E |
|-----------|---------------|----------------|
| Max plan subscription | $100–200/month (existing) | $100–200/month (existing) |
| API costs (daily, Sonnet) | $30–90/month | $0 |
| API costs (weekly, Sonnet) | $24–48/month | $0 |
| API costs (monthly, Opus) | $10–20/month | $0 |
| API costs (yearly, Opus) | $3–7/month avg | $0 |
| Server costs | $0 | $0 (existing hardware) |
| **Total additional cost** | **$67–165/month** | **$0** |

Annual savings: **$804–1,980** compared to Architecture B.

The only ongoing cost is the Max plan subscription, which is already being paid
for interactive development. Digest automation rides on top of that subscription
at no marginal cost.

---

## 9. Build Sequence (Revised)

Steps 1–3 from the parent spec (agent files, rollup command skills, enhanced
templates) are unchanged. The remaining steps adapt to the local execution model.

### Step 4: Runner Script

Create `scripts/run-digest.sh` and `scripts/check-auth.sh` with the
implementations from Sections 3 and 5 of this document.

### Step 5: Server Setup

1. Install Claude Code CLI on the server.
2. Authenticate with `claude login` using the Max plan account.
3. Clone the repository and verify MCP tool access.
4. Test the runner script manually: `./scripts/run-digest.sh daily`
5. Verify the digest is generated, committed, and pushed.
6. Verify the Quartz deploy workflow triggers on the new content.

### Step 6: Crontab Configuration

Install the crontab entries from Section 4. Start with daily only. Add weekly
and monthly after verifying daily runs reliably for a week.

### Step 7: Monitoring

Deploy the heartbeat monitor workflow (Section 5) to detect missed digests.
Configure a notification channel for auth failures.

### Step 8: Fallback Workflows (Optional)

If desired, deploy the GitHub Actions workflows from the parent spec as a
backup. Configure `ANTHROPIC_API_KEY` as a repository secret. These workflows
are dormant by default (triggered only via `workflow_dispatch`, not cron) to
avoid duplicate generation.

---

## 10. Verification Checklist (Supplement)

In addition to the parent spec's checklist, verify:

- [ ] Claude Code CLI is installed on the server
- [ ] `claude login` succeeds with the Max plan account
- [ ] `claude -p` works with subscription auth (no API key in environment)
- [ ] MCP tools (KOI, Ledger) are accessible from the server
- [ ] `scripts/run-digest.sh daily` generates, commits, and pushes a digest
- [ ] The Quartz deploy workflow triggers on the pushed content
- [ ] `scripts/check-auth.sh` correctly detects auth status
- [ ] Crontab entries are installed with the staggered schedule
- [ ] `.claude/local/logs/` captures generation logs
- [ ] A missed digest triggers the monitoring workflow
- [ ] Fallback `workflow_dispatch` works when `ANTHROPIC_API_KEY` is configured
- [ ] `unset ANTHROPIC_API_KEY` is effective (no accidental API billing)
