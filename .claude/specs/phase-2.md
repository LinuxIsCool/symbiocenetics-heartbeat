# Phase 2 — Temporal Hierarchy & Automation

This document specifies everything that must be built in Phase 2. It is detailed
enough that any Claude instance can read it and implement without ambiguity. For
architectural context and definitions, see `@.claude/specs/regen-heartbeat.md`.
For the project roadmap, see `@.claude/specs/roadmap.md`.

---

## 1. Objective

Phase 2 delivers four capabilities that transform Regen Heartbeat from a manually
invoked tool into an autonomous observatory:

1. **Temporal rollup commands** — `/weekly`, `/monthly`, and `/yearly` commands
   that distill lower-cadence digests into progressively denser narratives.
2. **GitHub Actions automation** — Cron-triggered workflows that generate, commit,
   and deploy digests at all four cadences without human intervention.
3. **The agent file pattern** — A bridge between Claude Code's interactive skill
   system and GitHub Actions' headless execution, using markdown instruction files
   that work identically in both contexts.
4. **Enhanced templates** — Rollup-aware templates with comparison directives,
   period-over-period analysis, and character variant support.

When Phase 2 is complete, the heartbeat beats on its own. Daily digests appear in
the repository every morning. Weekly rollups crystallize patterns from the daily
record. Monthly digests identify structural shifts. Yearly reflections capture
transformation. All of this happens automatically, with the option to trigger any
digest manually for a specific date or period.

---

## 2. Architecture Decision — Automation

### The Question

The `/daily` skill works when a human invokes it in Claude Code. But a heartbeat
needs to beat on its own. How does this system generate digests automatically?

### Options Evaluated

Four architectures were researched, with ten parallel research agents exploring
real-world examples, SDK capabilities, and MCP integration patterns. The findings
are documented in full in `.claude/local/journal/2026-02-03-automation-research.md`.

#### Architecture A: Python + REST + Anthropic API

Modernize the proof-of-concept at `.claude/local/specs/poc/regen-memory/`. Define
`@beta_tool` functions that call REST endpoints directly. Let the Anthropic SDK
handle the agentic loop. Write output to the temporal hierarchy. Commit and push.

```python
from anthropic import beta_tool

@beta_tool
def search_koi(query: str, limit: int = 10) -> str:
    """Search the Regen KOI knowledge base."""
    r = requests.post("https://regen.gaiaai.xyz/api/koi/query",
                      json={"query": query, "limit": limit})
    return r.text

runner = client.beta.messages.tool_runner(
    model="claude-sonnet-4-5",
    tools=[search_koi, get_governance_proposals],
    messages=[{"role": "user", "content": "Generate daily digest..."}]
)
final = runner.until_done()
```

- **Cost**: ~$0.50–1.00/run with Sonnet.
- **Complexity**: Medium. Must maintain tool definitions and REST mappings.
- **Reliability**: High. Direct HTTP calls, no MCP layer.
- **Quality ceiling**: Lower. No CLAUDE.md, no project conventions, no full
  tool access.

#### Architecture B: `claude-code-action` + MCP (The Uniswap Pattern)

Create `.claude/agents/daily-digest.md` with the full skill instructions. Create
`/tmp/mcp-config.json` with KOI + Ledger MCP servers injected from secrets. Use
`anthropics/claude-code-action@v1` with `--mcp-config`,
`--dangerously-skip-permissions`, and `--max-turns`.

- **Cost**: ~$1–3/run with Sonnet. ~$3–8/run with Opus.
- **Complexity**: Low. Mostly YAML configuration.
- **Reliability**: Medium. Depends on MCP server startup and API availability.
- **Quality ceiling**: Highest. The action reads CLAUDE.md, respects project
  conventions, has full tool access.

#### Architecture C: Claude Agent SDK Script

A Python script using `claude-agent-sdk` (v0.1.27+) that runs as a GitHub Action
step. Similar to B but gives programmatic control over the generation process.

```python
from claude_agent_sdk import query, ClaudeAgentOptions

options = ClaudeAgentOptions(
    mcp_servers={"regen-koi": {...}},
    allowed_tools=["mcp__regen-koi__*", "Read", "Write"],
    max_turns=30,
    max_budget_usd=3.00,
)
async for message in query(prompt="Generate daily digest...", options=options):
    ...
```

- **Cost**: Similar to B.
- **Complexity**: Medium. Python script + SDK installation.
- **Use case**: When programmatic control is needed (custom retries, error
  handling, post-processing).

#### Architecture D: Anthropic API + Native MCP Connector

Uses the beta `mcp-client-2025-11-20` feature to pass MCP servers directly to the
API. Requires the KOI API to expose a Streamable HTTP MCP endpoint. The simplest
possible code, but not available today — the existing API is REST, not MCP.

- **Status**: Future option. Requires server-side work on the KOI API.

### Decision: Architecture B → Revised to Architecture E

Architecture B (the Uniswap pattern) was the initial recommendation. It remains
the reference architecture for GitHub Actions execution and serves as a fallback.
However, the primary automation path has been revised to **Architecture E: Local
Cron + Max Plan**, which eliminates all API costs by running Claude Code in
headless mode on a local server authenticated via Max plan subscription. See
`@.claude/specs/phase-2-local-automation.md` for the full supplement.

Architecture B's strengths remain relevant as a fallback:

1. **It works today.** No new code beyond the agent file and workflow YAML.
2. **The agent file pattern solves the skill gap.** `.claude/agents/daily-digest.md`
   contains everything the `/daily` skill does, readable in both interactive and
   headless contexts.
3. **CLAUDE.md is respected.** The action loads project conventions automatically.
4. **MCP tools work identically.** `--mcp-config` with stdio servers is proven
   by multiple production repositories.
5. **Cost is manageable.** ~$30–90/month for daily Sonnet runs. Cost guardrails
   via `--max-turns` and `timeout-minutes`.
6. **Manual dispatch.** `workflow_dispatch` allows generating specific dates.
7. **Model selection.** Input parameter allows upgrading to Opus for special
   occasions (weekly, monthly rollups).

### Evidence

The decision is grounded in real-world production examples:

| Repository | Cadence | Purpose | Max Turns |
|------------|---------|---------|-----------|
| [Uniswap/ai-toolkit](https://github.com/Uniswap/ai-toolkit) | Weekly Mon 9am EST | AI newsletter via MCP (Notion + Slack) | 150 |
| ex-takashima/claude-auto-agent | Daily 22:00 UTC | News crawl + commit + Discord | — |
| jeremedia/rails-8-claude-guide | Daily 9:00 UTC | Research + commit + issue | 15 |
| kfsky/kfsky | Daily midnight UTC | Personalized news + issue | 30 |
| magarcia/magarcia.io | Weekly | Code improvement + PR | 50 |
| ChrisWiles/claude-code-showcase | Monthly | Docs sync | 30 |

The Uniswap newsletter workflow is the most directly analogous: weekly content
generation via cron, with MCP servers (Notion + Slack), writing to files, and
publishing. Every pattern we need is demonstrated there.

### Known Bug: OIDC Authentication Fails on Cron

[Issue #814](https://github.com/anthropics/claude-code-action/issues/814)
documents that cron-triggered workflows fail with OIDC authentication
(`claude_code_oauth_token`). The token exchange returns "User does not have
write access" during scheduled runs. This is labeled `p1`.

**Requirement: Use `anthropic_api_key` (not OIDC) for all scheduled workflows.**

### MCP-to-REST Endpoint Map (Architecture A Fallback)

If Architecture B proves unreliable or cost-prohibitive, Architecture A can use
direct REST calls. The complete endpoint mapping:

**KOI API** (base: `https://regen.gaiaai.xyz/api/koi`):

| MCP Tool | Method | Endpoint |
|----------|--------|----------|
| `search` | POST | `/query` |
| `generate_weekly_digest` | GET | `/weekly-digest` |
| `get_stats` | GET | `/stats` |
| `resolve_entity` | GET | `/entity/resolve` |
| `get_entity_neighborhood` | GET | `/entity/neighborhood` |
| `get_entity_documents` | GET | `/entity/documents` |
| `get_full_document` | GET | `/document/full` |
| `resolve_metadata_iri` | POST | `/metadata/resolve` |

**Ledger API** (standard Cosmos SDK REST):

| MCP Tool | Endpoint |
|----------|----------|
| `get_total_supply` | `/cosmos/bank/v1beta1/supply` |
| `get_community_pool` | `/cosmos/distribution/v1beta1/community_pool` |
| `list_governance_proposals` | `/cosmos/gov/v1/proposals` |
| `get_governance_tally_result` | `/cosmos/gov/v1/proposals/{id}/tally` |
| `list_classes` | `/regen/ecocredit/v1/classes` |
| `list_projects` | `/regen/ecocredit/v1/projects` |
| `list_credit_batches` | `/regen/ecocredit/v1/batches` |
| `list_sell_orders` | `/regen/ecocredit/marketplace/v1/sell-orders` |

---

## 3. The Agent File Pattern

The agent file is the key architectural insight that bridges interactive and
headless execution. It solves the "skill gap" — the fact that Claude Code skills
(`.claude/skills/`) only work in interactive sessions, not in CI.

### How It Works

```
Interactive                          CI (GitHub Actions)
────────────                         ───────────────────
User types /daily                    Cron triggers workflow
  → Skill loads SKILL.md               → Action loads CLAUDE.md
  → Claude reads template               → Prompt says: read agents/daily-digest.md
  → Claude queries MCPs                  → Claude reads agents/daily-digest.md
  → Claude writes digest                 → Claude reads template
  → Output to terminal + file            → Claude queries MCPs
                                         → Claude writes digest
                                         → Post-step commits and pushes
```

The agent file contains the same instructions as the skill. The difference is the
delivery mechanism: skills are loaded by Claude Code's skill system; agent files
are loaded by the prompt in a GitHub Action step.

### File Location

```
.claude/agents/daily-digest.md
.claude/agents/weekly-digest.md
.claude/agents/monthly-digest.md
.claude/agents/yearly-digest.md
```

### Agent File Structure

Each agent file is a markdown document with no frontmatter (agent files are not
skills — they don't need the skill metadata). The content should include:

1. **Identity and context.** What this agent is, what cadence it serves, and
   a reminder that it is running autonomously in CI.
2. **Data gathering instructions.** The same section-by-section MCP tool
   instructions as the corresponding skill, adapted for autonomous execution.
   Include fallback behavior: what to do when a data source is unavailable.
3. **Template reference.** Which template to load and how to interpret the
   `<!-- source: -->` annotations.
4. **Output conventions.** The exact file path pattern, YAML frontmatter schema,
   and directory creation requirements.
5. **Quality guidance.** Reference to the ethos (`.claude/rules/ethos.md`) and
   instructions for maintaining the project's voice.
6. **Rollup logic** (for weekly/monthly/yearly). How to read lower-cadence
   digests, what to extract, and how to synthesize upward.

### Example: `.claude/agents/daily-digest.md`

```markdown
# Daily Digest Agent

You are generating an automated daily digest for the Regen Heartbeat observatory.
This runs unattended in GitHub Actions. Complete the task autonomously without
asking for clarification. If a data source is unavailable, note its absence in
the digest and continue with the remaining sources.

## Instructions

1. Determine the target date from the environment or default to yesterday.
2. Load the template at `templates/daily/default.md`.
3. Read the template's section structure and `<!-- source: -->` annotations.
4. For each section, query the appropriate data sources:

   **Governance Pulse:**
   - `ledger: list_governance_proposals`
   - `ledger: get_governance_tally_result` for active proposals
   - `koi: search(query="governance proposal")`

   **Ecocredit Activity:**
   - `ledger: list_credit_batches`
   - `ledger: list_classes`
   - `ledger: list_projects`
   - `ledger: list_sell_orders`
   - `ledger: analyze_market_trends`

   **Chain Health:**
   - `ledger: get_total_supply`
   - `ledger: get_community_pool`

   **Ecosystem Intelligence:**
   - `koi: generate_weekly_digest`
   - `koi: search` for notable developments
   - `koi: get_entity_neighborhood` for key entities

   **Current Events:**
   - Web search using topics from `settings.json`

   **Reflection:**
   - Read previous daily digests from `content/digests/`
   - Compare with the most recent 3–5 days

5. Synthesize into a coherent digest following the template structure.
6. Write YAML frontmatter:
   ```yaml
   ---
   title: "Daily Heartbeat — {date}"
   date: {YYYY-MM-DD}
   template: default
   character: null
   cadence: daily
   sources:
     koi: true
     ledger: true
     web: true
     historic: {true if previous digests exist}
   ---
   ```
7. Write to `content/digests/YYYY/MM/DD/daily.md`.
8. Follow the voice and quality standards in `.claude/rules/ethos.md`.
```

### Relationship to Skills

The agent file and the skill are siblings, not replacements. The skill
(`.claude/skills/daily/SKILL.md`) remains the interactive entry point. The agent
file (`.claude/agents/daily-digest.md`) is the CI entry point. When the skill's
instructions change, the agent file should be updated to match, and vice versa.

In practice, the agent file can reference the skill:

```markdown
For detailed data-gathering instructions, see `.claude/skills/daily/SKILL.md`.
Follow those instructions exactly, with the following CI-specific adaptations:
- Do not render output to the terminal.
- If a data source times out, skip it and note the gap.
- Always write the file — never exit without producing output.
```

This keeps the two in sync while allowing CI-specific overrides.

---

## 4. GitHub Actions Workflows

### 4.1 Staggered Schedule

Workflows run at staggered times to prevent overlapping commits and ensure
lower-cadence digests are available before higher-cadence rollups run.

| Cadence | Schedule | Cron Expression | Notes |
|---------|----------|-----------------|-------|
| Daily | Every day at 08:00 UTC | `0 8 * * *` | Runs first each day |
| Weekly | Mon, Wed, Fri at 10:00 UTC | `0 10 * * 1,3,5` | After daily completes |
| Monthly | 1st and 15th at 12:00 UTC | `0 12 1,15 * *` | After weekly (if same day) |
| Yearly | Manual dispatch | — | Solstices, equinoxes, New Year |

The two-hour gaps between cadences ensure each step has time to complete, commit,
and push before the next cadence pulls from the updated archive.

### 4.2 Daily Workflow: `.github/workflows/daily.yml`

```yaml
name: Daily Heartbeat

on:
  schedule:
    - cron: '0 8 * * *'
  workflow_dispatch:
    inputs:
      date:
        description: 'Target date YYYY-MM-DD (default: yesterday)'
        required: false
      model:
        description: 'Claude model to use'
        required: false
        type: choice
        options:
          - claude-sonnet-4-5-20250929
          - claude-opus-4-5-20251101
        default: claude-sonnet-4-5-20250929

jobs:
  digest:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Calculate target date
        id: date
        run: |
          if [ -n "${{ github.event.inputs.date }}" ]; then
            echo "target=${{ github.event.inputs.date }}" >> "$GITHUB_OUTPUT"
          else
            echo "target=$(date -u -d yesterday +%Y-%m-%d)" >> "$GITHUB_OUTPUT"
          fi

      - name: Create MCP configuration
        env:
          KOI_API_ENDPOINT: ${{ secrets.KOI_API_ENDPOINT }}
        run: |
          cat > /tmp/mcp-config.json << 'MCPEOF'
          {
            "mcpServers": {
              "regen-koi": {
                "command": "npx",
                "args": ["-y", "regen-koi-mcp@latest"],
                "env": {
                  "KOI_API_ENDPOINT": "${{ secrets.KOI_API_ENDPOINT }}"
                }
              }
            }
          }
          MCPEOF

      - name: Generate daily digest
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Generate a daily digest for the Regen ecosystem.
            Read and follow ALL instructions in: .claude/agents/daily-digest.md
            Target date: ${{ steps.date.outputs.target }}
            IMPORTANT: This is an automated workflow running in GitHub Actions.
            Complete the task autonomously without asking for clarification.
            Write the digest to the correct path in content/digests/.
          claude_args: |
            --model ${{ github.event.inputs.model || 'claude-sonnet-4-5-20250929' }}
            --max-turns 50
            --mcp-config /tmp/mcp-config.json
            --dangerously-skip-permissions

      - name: Commit and push
        run: |
          git config user.name "regen-heartbeat[bot]"
          git config user.email "heartbeat@regen.network"
          git add content/digests/
          git diff --cached --quiet || \
            (git commit -m "daily: ${{ steps.date.outputs.target }}" && git push)
```

### 4.3 Weekly Workflow: `.github/workflows/weekly.yml`

The weekly workflow follows the same pattern but with a different agent file and
additional context about the rollup period.

```yaml
name: Weekly Heartbeat

on:
  schedule:
    - cron: '0 10 * * 1,3,5'
  workflow_dispatch:
    inputs:
      week:
        description: 'ISO week YYYY-WNN (default: current week)'
        required: false
      model:
        description: 'Claude model to use'
        required: false
        type: choice
        options:
          - claude-sonnet-4-5-20250929
          - claude-opus-4-5-20251101
        default: claude-sonnet-4-5-20250929

jobs:
  digest:
    runs-on: ubuntu-latest
    timeout-minutes: 45
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Calculate week identifier
        id: week
        run: |
          if [ -n "${{ github.event.inputs.week }}" ]; then
            echo "target=${{ github.event.inputs.week }}" >> "$GITHUB_OUTPUT"
          else
            echo "target=$(date -u +%Y-W%V)" >> "$GITHUB_OUTPUT"
          fi

      - name: Create MCP configuration
        env:
          KOI_API_ENDPOINT: ${{ secrets.KOI_API_ENDPOINT }}
        run: |
          cat > /tmp/mcp-config.json << 'MCPEOF'
          {
            "mcpServers": {
              "regen-koi": {
                "command": "npx",
                "args": ["-y", "regen-koi-mcp@latest"],
                "env": {
                  "KOI_API_ENDPOINT": "${{ secrets.KOI_API_ENDPOINT }}"
                }
              }
            }
          }
          MCPEOF

      - name: Generate weekly digest
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Generate a weekly digest for the Regen ecosystem.
            Read and follow ALL instructions in: .claude/agents/weekly-digest.md
            Target week: ${{ steps.week.outputs.target }}
            IMPORTANT: This is an automated workflow running in GitHub Actions.
            Complete the task autonomously without asking for clarification.
          claude_args: |
            --model ${{ github.event.inputs.model || 'claude-sonnet-4-5-20250929' }}
            --max-turns 75
            --mcp-config /tmp/mcp-config.json
            --dangerously-skip-permissions

      - name: Commit and push
        run: |
          git config user.name "regen-heartbeat[bot]"
          git config user.email "heartbeat@regen.network"
          git add content/digests/
          git diff --cached --quiet || \
            (git commit -m "weekly: ${{ steps.week.outputs.target }}" && git push)
```

### 4.4 Monthly Workflow: `.github/workflows/monthly.yml`

```yaml
name: Monthly Heartbeat

on:
  schedule:
    - cron: '0 12 1,15 * *'
  workflow_dispatch:
    inputs:
      month:
        description: 'Target month YYYY-MM (default: previous month)'
        required: false
      model:
        description: 'Claude model to use'
        required: false
        type: choice
        options:
          - claude-sonnet-4-5-20250929
          - claude-opus-4-5-20251101
        default: claude-opus-4-5-20251101

jobs:
  digest:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Calculate target month
        id: month
        run: |
          if [ -n "${{ github.event.inputs.month }}" ]; then
            echo "target=${{ github.event.inputs.month }}" >> "$GITHUB_OUTPUT"
          else
            echo "target=$(date -u -d 'last month' +%Y-%m)" >> "$GITHUB_OUTPUT"
          fi

      - name: Create MCP configuration
        env:
          KOI_API_ENDPOINT: ${{ secrets.KOI_API_ENDPOINT }}
        run: |
          cat > /tmp/mcp-config.json << 'MCPEOF'
          {
            "mcpServers": {
              "regen-koi": {
                "command": "npx",
                "args": ["-y", "regen-koi-mcp@latest"],
                "env": {
                  "KOI_API_ENDPOINT": "${{ secrets.KOI_API_ENDPOINT }}"
                }
              }
            }
          }
          MCPEOF

      - name: Generate monthly digest
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Generate a monthly digest for the Regen ecosystem.
            Read and follow ALL instructions in: .claude/agents/monthly-digest.md
            Target month: ${{ steps.month.outputs.target }}
            IMPORTANT: This is an automated workflow running in GitHub Actions.
            Complete the task autonomously without asking for clarification.
          claude_args: |
            --model ${{ github.event.inputs.model || 'claude-opus-4-5-20251101' }}
            --max-turns 100
            --mcp-config /tmp/mcp-config.json
            --dangerously-skip-permissions

      - name: Commit and push
        run: |
          git config user.name "regen-heartbeat[bot]"
          git config user.email "heartbeat@regen.network"
          git add content/digests/
          git diff --cached --quiet || \
            (git commit -m "monthly: ${{ steps.month.outputs.target }}" && git push)
```

### 4.5 Yearly Workflow

Yearly digests are triggered manually via `workflow_dispatch` on solstices,
equinoxes, and New Year. The workflow follows the same pattern as monthly but
with `--max-turns 150` and `timeout-minutes: 90`. The agent file is
`.claude/agents/yearly-digest.md`. The default model is Opus.

---

## 5. MCP Configuration in CI

### The Problem

MCP servers in Claude Code are normally configured in `.claude/settings.json`,
which references locally installed packages. In CI, there is no persistent local
environment. MCP servers must be configured on the fly.

### The Solution

Create a temporary MCP configuration file with secrets injected from GitHub
environment variables. Pass it to Claude Code via the `--mcp-config` flag.

```yaml
- name: Create MCP configuration
  env:
    KOI_API_ENDPOINT: ${{ secrets.KOI_API_ENDPOINT }}
  run: |
    cat > /tmp/mcp-config.json << 'MCPEOF'
    {
      "mcpServers": {
        "regen-koi": {
          "command": "npx",
          "args": ["-y", "regen-koi-mcp@latest"],
          "env": {
            "KOI_API_ENDPOINT": "${{ secrets.KOI_API_ENDPOINT }}"
          }
        }
      }
    }
    MCPEOF
```

### Required GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `ANTHROPIC_API_KEY` | Claude API authentication. Required. |
| `KOI_API_ENDPOINT` | KOI MCP server endpoint. Default: `https://regen.gaiaai.xyz/api/koi` |

### MCP Servers in CI

**KOI MCP** — Included in the MCP config. Provides knowledge base search, weekly
digests, entity resolution, and GitHub documentation search. Installed via npx
at runtime.

**Ledger MCP** — The Ledger MCP queries public Cosmos SDK REST endpoints and
requires no authentication. It can be included in the MCP config the same way as
KOI, or its data can be gathered through the KOI MCP's existing chain-querying
capabilities. The exact inclusion depends on whether the Ledger MCP npm package
is publicly available at implementation time. If it is:

```json
{
  "mcpServers": {
    "regen-koi": { "..." },
    "regen-ledger": {
      "command": "npx",
      "args": ["-y", "regen-ledger-mcp@latest"],
      "env": {}
    }
  }
}
```

### Flags

| Flag | Purpose |
|------|---------|
| `--mcp-config /tmp/mcp-config.json` | Points Claude Code to the CI MCP config |
| `--dangerously-skip-permissions` | Required in CI — no human to approve tool use |
| `--max-turns N` | Limits API round-trips to control cost and prevent runaway loops |
| `--model MODEL_ID` | Selects the Claude model |

---

## 6. Rollup Commands

### 6.1 `/weekly`

**Skill file:** `.claude/skills/weekly/SKILL.md`
**Agent file:** `.claude/agents/weekly-digest.md`

**Arguments:**
- `--week YYYY-WNN` — ISO week to generate for. Defaults to current week.
- `--template name` — Template to use. Defaults to `settings.json` value.
- `--character name` — Voice the digest through a character persona.

**Behavior:**

1. Determine the target week and its date range (Monday through Sunday).
2. Load the template from `templates/weekly/{name}.md`.
3. Read all daily digests within the target week from `content/digests/`.
4. For each section in the template:

   **Week in Review** (primary rollup section):
   - Read all daily digests for the week in chronological order.
   - Identify recurring themes, escalating developments, and resolved questions.
   - Distill the week's daily record into a narrative arc — not a list of what
     happened each day, but what happened across the days.

   **Governance Summary:**
   - `ledger: list_governance_proposals` — current state (supplements dailies).
   - `ledger: get_governance_tally_result` — tallies for proposals active this week.
   - Extract governance threads from daily digests.
   - Narrative: proposals that entered/exited voting, contentious votes, outcomes.

   **Ecocredit Trends:**
   - `ledger: list_credit_batches` — fresh query for the latest state.
   - `ledger: analyze_market_trends` — trend analysis across the week.
   - Extract ecocredit activity from daily digests.
   - Narrative: weekly delta in credit supply, marketplace volume, new projects.

   **Ecosystem Narrative:**
   - `koi: generate_weekly_digest` — the KOI system's own weekly summary.
   - `koi: search` — topics that emerged during the week.
   - Extract ecosystem intelligence from daily digests.
   - Narrative: what the community built, discussed, and decided.

   **Forward Look:**
   - Identify open threads and upcoming events.
   - Note proposals entering voting period.
   - Flag patterns that merit attention in the coming week.

5. Synthesize into a coherent weekly digest.
6. If `--character` is specified, voice the digest through that character.
7. Write YAML frontmatter:

   ```yaml
   ---
   title: "Weekly Heartbeat — {YYYY-WNN}"
   date: {YYYY-MM-DD}  # Monday of the week
   week: {YYYY-WNN}
   template: {template-name}
   character: {character-name or null}
   cadence: weekly
   dailies_consumed: [list of daily digest paths]
   sources:
     koi: true
     ledger: true
     web: true
     historic: true
   ---
   ```

8. Write to `content/digests/YYYY/MM/weekly/YYYY-WNN.md`.

### 6.2 `/monthly`

**Skill file:** `.claude/skills/monthly/SKILL.md`
**Agent file:** `.claude/agents/monthly-digest.md`

**Arguments:**
- `--month YYYY-MM` — Month to generate for. Defaults to current month.
- `--template name` — Template to use.
- `--character name` — Voice the digest through a character persona.

**Behavior:**

1. Determine the target month.
2. Load the template from `templates/monthly/{name}.md`.
3. Read all weekly digests within the target month from `content/digests/`.
4. For each section in the template:

   **Month in Review:**
   - Read weekly digests in chronological order.
   - Identify structural shifts that only become visible at the monthly scale.
   - Not a summary of weeklies — a synthesis of what changed this month.

   **Governance Arc:**
   - `ledger: list_governance_proposals` — fresh state.
   - Trace governance proposals from introduction to resolution.
   - Identify governance patterns: participation trends, contentious topics.

   **Credit Market Evolution:**
   - `ledger: analyze_market_trends` — month-long trend analysis.
   - `ledger: list_credit_batches` — full month's issuances.
   - Narrative: how the credit market moved this month, new entrants, volume.

   **Community Health:**
   - `koi: search` — community activity, forum engagement, GitHub contributions.
   - Extract community signals from weekly digests.
   - Narrative: is the community growing, contracting, shifting focus?

   **Strategic Questions:**
   - Synthesize open questions from weekly Forward Look sections.
   - Compare with previous month's strategic questions — which were answered?
   - Pose new questions that emerged from this month's data.

5. Synthesize into a monthly digest.
6. Write to `content/digests/YYYY/MM/monthly/monthly.md`.

### 6.3 `/yearly`

**Skill file:** `.claude/skills/yearly/SKILL.md`
**Agent file:** `.claude/agents/yearly-digest.md`

**Arguments:**
- `--year YYYY` — Year to generate for. Defaults to current year.
- `--template name` — Template to use.
- `--character name` — Voice the digest through a character persona.

**Behavior:**

1. Determine the target year.
2. Load the template from `templates/yearly/{name}.md`.
3. Read all monthly digests within the target year.
4. For each section in the template:

   **Annual Narrative:**
   - Read monthly digests in chronological order.
   - Identify the year's defining story — the arc that connects January to December.

   **Key Milestones:**
   - Extract the most significant events from monthly digests.
   - Rank by impact and significance.

   **Quantitative Retrospective:**
   - `ledger: get_total_supply` — year-end vs year-start supply.
   - `ledger: list_classes` — credit classes added this year.
   - `ledger: list_projects` — projects registered this year.
   - Aggregate metrics from monthly digests.

   **Governance Evolution:**
   - Trace the year's governance arc: how many proposals, what categories,
     what passed, what failed, what changed about how the network governs itself.

   **Ecocredit Market Annual Review:**
   - Year-over-year credit issuance, retirement, and marketplace trends.

   **Ecosystem Growth:**
   - Community size, activity, and engagement over the year.
   - New partnerships, projects, and initiatives.

   **Year-Ahead Outlook:**
   - Extrapolate trends. Identify opportunities and risks.
   - Pose the questions that will define the next year.

5. Synthesize into a yearly digest.
6. Write to `content/digests/YYYY/yearly/yearly.md`.

---

## 7. Enhanced Templates

Phase 2 promotes the placeholder templates to full specifications.

### 7.1 Weekly Template: `templates/weekly/default.md`

```markdown
---
name: default
cadence: weekly
description: Weekly digest synthesizing dailies into higher-level analysis
sources:
  - koi
  - ledger
  - web
  - historic
rollup:
  source_cadence: daily
  lookback: 7 days
comparison:
  period: previous week
---

# {week} — Weekly Heartbeat

## Week in Review
<!-- source: historic.daily -->
Synthesize all daily digests from this week into a coherent narrative. Do not
list what happened each day. Identify the threads that ran through the week:
recurring themes, developments that accelerated, questions that were answered or
that deepened. This section transforms daily observation into weekly pattern.

## Governance Summary
<!-- source: ledger.governance, koi.governance, historic.daily -->
Trace governance activity across the week. Which proposals advanced? What was
debated? How did voting patterns shift? Connect individual daily governance notes
into a governance narrative. Supplement with fresh Ledger MCP queries for current
state.

## Ecocredit Trends
<!-- source: ledger.ecocredit, ledger.marketplace, historic.daily -->
Aggregate ecocredit activity from the week's dailies. Identify trends in
issuance, retirement, and marketplace activity. Query Ledger MCP for current
credit class and batch counts. Note any week-over-week changes in credit supply.

## Ecosystem Narrative
<!-- source: koi.search, koi.weekly_digest, historic.daily -->
What is the community building, discussing, and deciding? Pull from KOI's weekly
digest and supplement with daily ecosystem intelligence sections. Identify the
conversations that mattered this week.

## Forward Look
<!-- source: web, historic -->
What is coming? Open governance proposals entering voting. Upcoming events.
Trends to watch. Questions from dailies that remain unanswered. Connections to
broader ecosystem developments from web search.
```

### 7.2 Monthly Template: `templates/monthly/default.md`

```markdown
---
name: default
cadence: monthly
description: Monthly digest distilling weeklies into trend analysis and narrative arcs
sources:
  - koi
  - ledger
  - web
  - historic
rollup:
  source_cadence: weekly
  lookback: 1 month
comparison:
  period: previous month
---

# {month} — Monthly Heartbeat

## Month in Review
<!-- source: historic.weekly -->
Distill the month's weekly digests into structural observations. What changed
this month that did not change before? What accelerated, decelerated, emerged,
or faded? This is not a summary of weeklies — it is a synthesis of the month's
trajectory.

## Governance Arc
<!-- source: ledger.governance, historic.weekly -->
Trace the month's governance narrative from beginning to end. Proposals that
were introduced, debated, voted on, and resolved. Changes in governance
participation or patterns. Query Ledger MCP for definitive outcomes.

## Credit Market Evolution
<!-- source: ledger.ecocredit, ledger.marketplace, historic.weekly -->
How did the ecocredit market move this month? New credit classes or projects.
Issuance and retirement volume. Marketplace trends. Compare with previous
month's metrics. Query Ledger MCP for current totals.

## Community Health
<!-- source: koi.search, historic.weekly -->
Is the community growing, contracting, or shifting focus? Forum engagement,
GitHub contributions, new participants, and notable departures. Extract from
weekly ecosystem narratives and supplement with KOI searches.

## Strategic Questions
<!-- source: historic, web -->
Which of last month's strategic questions were answered? Which remain open?
What new questions emerged this month? What external developments (from web
search) change the strategic context? Pose 3-5 questions for the month ahead.
```

### 7.3 Yearly Template: `templates/yearly/default.md`

```markdown
---
name: default
cadence: yearly
description: Yearly digest identifying annual transformations and milestones
sources:
  - koi
  - ledger
  - web
  - historic
rollup:
  source_cadence: monthly
  lookback: 1 year
comparison:
  period: previous year
---

# {year} — Yearly Heartbeat

## Annual Narrative
<!-- source: historic.monthly -->
What is the story of this year? Read all monthly digests and identify the arc
that connects January to December. What was the defining theme? What
transformed? What endured? Write this as a narrative, not a chronological
summary.

## Key Milestones
<!-- source: historic.monthly -->
Identify the 5-10 most significant events or achievements of the year. Rank
by impact on the ecosystem. For each milestone, note which month it occurred
and why it mattered.

## Quantitative Retrospective
<!-- source: ledger, historic.monthly -->
Hard numbers. Year-end vs year-start: token supply, credit classes, registered
projects, marketplace volume, governance proposals, community pool balance.
Query Ledger MCP for definitive year-end figures.

## Governance Evolution
<!-- source: ledger.governance, historic.monthly -->
How did governance change this year? Total proposals, passage rate, voter
participation trends, contentious topics, and structural governance changes.
What does the year's governance record reveal about the network's decision-making
maturity?

## Ecocredit Market Annual Review
<!-- source: ledger.ecocredit, ledger.marketplace, historic.monthly -->
Year-over-year credit market analysis. Total issuance, retirement, active
marketplace listings, price trends (if available), new credit types, geographic
distribution of projects.

## Ecosystem Growth
<!-- source: koi.search, historic.monthly -->
Community trajectory over the year. New partnerships, integrations, and
collaborations. Developer activity. Documentation growth. Geographic and
thematic expansion of the ecosystem.

## Year-Ahead Outlook
<!-- source: web, historic -->
Looking forward. What trends from this year will define the next? What risks
are emerging? What opportunities are opening? Pose the 5-7 questions that will
matter most in the coming year. Connect to broader developments in climate
finance, crypto governance, and regenerative economics.
```

### 7.4 Rollup Frontmatter

The `rollup` and `comparison` fields in template frontmatter are instructions to
Claude, not executable directives. They tell the generating agent:

- **`source_cadence`**: Which lower-cadence digests to read as primary input.
- **`lookback`**: How far back to collect source digests.
- **`comparison.period`**: What to compare against (previous week, month, year).

### 7.5 Character Variants

Any template can be combined with any character via the `--character` flag. Phase 2
does not introduce character-specific template files. The character system (output
styles + character skills) is orthogonal to the template system — the template
defines what to include, the character defines how to voice it.

If a particular character-template combination proves valuable enough to warrant
its own template (e.g., a governance-heavy weekly template for the Governor
character), it can be added as `templates/weekly/governor.md`. But this is
optional, not required for Phase 2.

---

## 8. Cost Analysis

### Per-Run Estimates

| Cadence | Model | Estimated Turns | Estimated Cost | Frequency | Monthly Cost |
|---------|-------|-----------------|----------------|-----------|-------------|
| Daily | Sonnet | 30–50 | $1–3 | 30/month | $30–90 |
| Weekly | Sonnet | 50–75 | $2–4 | 12/month | $24–48 |
| Monthly | Opus | 75–100 | $5–10 | 2/month | $10–20 |
| Yearly | Opus | 100–150 | $10–20 | 4/year | $3–7/month avg |

**Total estimated monthly cost: $67–165**

### Cost Controls

1. **`--max-turns N`** — The primary cost limiter. Set conservatively for each
   cadence (50 daily, 75 weekly, 100 monthly). Increase only if output quality
   requires it.

2. **`timeout-minutes`** — Job-level timeout. Prevents runaway workflows.
   Set to 30 minutes for daily, 45 for weekly, 60 for monthly.

3. **Model selection** — Sonnet for daily and weekly. Opus for monthly and yearly.
   The `workflow_dispatch` input allows per-run model overrides.

4. **Monitoring** — Review GitHub Actions usage dashboard weekly. Set up billing
   alerts on the Anthropic account. Track cost-per-digest over time.

### Cost Optimization Path

If costs exceed projections, the fallback path is:

1. Reduce `--max-turns` (may reduce output quality).
2. Switch weekly from Sonnet to Haiku (significant cost reduction, moderate
   quality reduction).
3. Fall back to Architecture A (Python + REST) for daily runs, keeping
   Architecture B for weekly/monthly/yearly where quality matters most.

---

## 9. Build Sequence

The build proceeds in this order. Each step depends on the ones before it.

### Step 1: Agent Files

Create the `.claude/agents/` directory with README.md and CLAUDE.md. Write the
four agent files:

- `.claude/agents/daily-digest.md`
- `.claude/agents/weekly-digest.md`
- `.claude/agents/monthly-digest.md`
- `.claude/agents/yearly-digest.md`

The daily agent file should be written first and tested interactively by
referencing it directly in a Claude Code session before proceeding.

### Step 2: Rollup Command Skills

Create the three new command skills:

- `.claude/skills/weekly/SKILL.md`
- `.claude/skills/monthly/SKILL.md`
- `.claude/skills/yearly/SKILL.md`

Each skill follows the same structure as the existing `/daily` skill, adapted for
its cadence. Include the rollup logic, data source instructions, and output path
conventions.

### Step 3: Enhanced Templates

Promote the placeholder templates to their full specifications:

- `templates/weekly/default.md` — full weekly template with rollup directives
- `templates/monthly/default.md` — full monthly template with trend analysis
- `templates/yearly/default.md` — full yearly template with retrospective lens

Remove the `status: placeholder` field from frontmatter.

### Step 4: GitHub Actions — Daily Workflow

Create `.github/workflows/daily.yml` with the full workflow specification from
Section 4.2. Configure the required GitHub secrets (`ANTHROPIC_API_KEY`,
`KOI_API_ENDPOINT`).

Test the workflow:
1. Trigger via `workflow_dispatch` with a specific date.
2. Verify the digest is generated and committed.
3. Verify the Quartz deployment workflow triggers on the new content.

### Step 5: GitHub Actions — Weekly and Monthly Workflows

Create `.github/workflows/weekly.yml` and `.github/workflows/monthly.yml`.
Test each via `workflow_dispatch` before enabling the cron schedule.

### Step 6: Historic Cross-Referencing

Enhance the Reflection/Forward Look sections across all templates to include:

- Comparison with the same period in previous cycles (week-over-week,
  month-over-month).
- Identification of cyclical patterns.
- Tracking of long-running threads across digests.

### Step 7: Documentation Updates

Update the following documentation files:

- `docs/tutorials/getting-started.md` — add sections on automated generation
  and rollup commands.
- `docs/reference/` — add agent file reference if warranted.
- `README.md` — update command list to include `/weekly`, `/monthly`, `/yearly`.
- `CLAUDE.md` — add reference to agent files.

### Step 8: Update Root Files

- Update `settings.json` if any new configuration fields are needed.
- Update `README.md` with new commands and automation information.
- Ensure `.gitignore` covers any new temporary or build artifacts.

---

## 10. Verification Checklist

When Phase 2 is complete, verify:

**Agent Files:**
- [ ] `.claude/agents/` directory exists with README.md and CLAUDE.md
- [ ] `daily-digest.md` agent file exists with complete instructions
- [ ] `weekly-digest.md` agent file exists with rollup logic
- [ ] `monthly-digest.md` agent file exists with rollup logic
- [ ] `yearly-digest.md` agent file exists with rollup logic
- [ ] Agent files reference skills and templates correctly

**Rollup Commands:**
- [ ] `/weekly` skill exists and documents all flags
- [ ] `/monthly` skill exists and documents all flags
- [ ] `/yearly` skill exists and documents all flags
- [ ] Running `/weekly` produces a digest that synthesizes dailies
- [ ] Running `/monthly` produces a digest that synthesizes weeklies
- [ ] Running `/yearly` produces a digest that synthesizes monthlies

**Enhanced Templates:**
- [ ] `templates/weekly/default.md` is fully specified (not a placeholder)
- [ ] `templates/monthly/default.md` is fully specified (not a placeholder)
- [ ] `templates/yearly/default.md` is fully specified (not a placeholder)
- [ ] All templates include `rollup` and `comparison` frontmatter
- [ ] Template section annotations are detailed and actionable

**GitHub Actions:**
- [ ] `.github/workflows/daily.yml` exists with claude-code-action step
- [ ] `.github/workflows/weekly.yml` exists with claude-code-action step
- [ ] `.github/workflows/monthly.yml` exists with claude-code-action step
- [ ] All workflows use `anthropic_api_key` (not OIDC)
- [ ] All workflows include `workflow_dispatch` with appropriate inputs
- [ ] MCP configuration is injected from secrets
- [ ] `--dangerously-skip-permissions` is set
- [ ] `--max-turns` is configured per cadence
- [ ] Commit step uses `regen-heartbeat[bot]` identity
- [ ] Triggering daily `workflow_dispatch` produces a committed digest
- [ ] The Quartz deploy workflow triggers on new content

**Documentation:**
- [ ] README.md lists `/weekly`, `/monthly`, `/yearly` commands
- [ ] Getting started tutorial mentions automated generation
- [ ] Roadmap references this spec document

**Cost:**
- [ ] Monthly cost projections are within the $67–165 range
- [ ] Anthropic billing alerts are configured
- [ ] Cost-per-digest is being tracked
