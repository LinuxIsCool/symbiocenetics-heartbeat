# Regen Heartbeat — Three-Phase Roadmap

This document describes the three phases of the Regen Heartbeat project. Each phase
builds on the previous one, delivering working functionality at every stage. For full
architectural context, see `@.claude/specs/regen-heartbeat.md`.

---

## Phase 1 — Skeleton & Daily Heartbeat

**Goal:** Build the core infrastructure and deliver a working daily digest.

**What gets built:**

- Complete directory structure with README.md and CLAUDE.md in every directory
- `settings.json` at the repository root with template defaults, current events
  topics, and site configuration
- The full character pipeline: 12 output styles derived from character JSONs,
  12 character skills that load those output styles, and the routing logic that
  connects `--character` flags to the appropriate skill
- `/current-events` command with `--topic`, `--include-defaults`, `--creative`,
  `--deep`, and `--character` flags
- `/daily` command with `--date`, `--template`, and `--character` flags
- Default daily template with section structure and MCP source annotations
- Placeholder templates for weekly, monthly, and yearly cadences
- 9 documentation files following the Diataxis framework: tutorials for KOI MCP,
  Ledger MCP, and getting started; guides for searching the knowledge base and
  querying chain data; references for all KOI and Ledger MCP tools; explanations
  for the MCP architecture and the Regen ecosystem
- Quartz configuration with Regen green theme
- GitHub Actions deploy workflow for GitHub Pages
- Updated CLAUDE.md and README.md

**What works when it's done:**

A user clones the repo, runs `/current-events`, and gets a live synthesis of
Regen-relevant news from the web. They run `/daily`, and a structured daily digest
is written to `content/digests/YYYY/MM/DD/daily.md` with data from KOI, Ledger,
and web search. They add `--character narrator` and get the same digest voiced through
the Narrator persona. They push the content and GitHub Pages deploys a Quartz site
where anyone can browse the digests.

**Full specification:** `@.claude/specs/phase-1.md`

---

## Phase 2 — Temporal Hierarchy & Automation

**Goal:** Build the temporal rollup system and automate generation via GitHub Actions.

**Architecture decision:** Phase 2 uses `anthropics/claude-code-action@v1` (the
Uniswap pattern) for all automated workflows. This was chosen over three alternatives
(Python + REST, Claude Agent SDK, native MCP connector) based on research into
six production repositories. The action reads CLAUDE.md, respects project conventions,
and provides full MCP tool access. Authentication uses `anthropic_api_key` (not OIDC)
due to a known cron bug ([Issue #814](https://github.com/anthropics/claude-code-action/issues/814)).

**Key architectural pattern:** `.claude/agents/` files bridge interactive skills and
headless CI execution. The agent file contains the same instructions as the skill;
the delivery mechanism changes, not the intelligence.

**Full specification:** `@.claude/specs/phase-2.md`

**What gets built:**

### Commands

- **`/weekly`** — Generates a weekly digest. Reads all daily digests since the last
  weekly, synthesizes them into a higher-level summary, and supplements with fresh MCP
  queries for anything the dailies may have missed. Arguments: `--week YYYY-WNN`
  (ISO week, defaults to current), `--template`, `--character`. Output:
  `content/digests/YYYY/MM/weekly/YYYY-WNN.md`. Generated on Monday, Wednesday,
  and Friday.

- **`/monthly`** — Generates a monthly digest. Reads all weekly digests since the last
  monthly, synthesizes them with fresh MCP data. Arguments: `--month YYYY-MM`
  (defaults to current), `--template`, `--character`. Output:
  `content/digests/YYYY/MM/monthly/monthly.md`. Generated on the 1st and 15th.

- **`/yearly`** — Generates a yearly digest. Reads all monthly digests since the last
  yearly, synthesizes them with fresh MCP data and a retrospective lens. Arguments:
  `--year YYYY` (defaults to current), `--template`, `--character`. Output:
  `content/digests/YYYY/yearly/yearly.md`. Generated on solstices, equinoxes, and
  New Year.

### Agent Files

Agent files are the CI-compatible equivalent of skills:

| Agent File | Skill Equivalent | Purpose |
|------------|------------------|---------|
| `.claude/agents/daily-digest.md` | `.claude/skills/daily/SKILL.md` | Daily generation |
| `.claude/agents/weekly-digest.md` | `.claude/skills/weekly/SKILL.md` | Weekly rollup |
| `.claude/agents/monthly-digest.md` | `.claude/skills/monthly/SKILL.md` | Monthly rollup |
| `.claude/agents/yearly-digest.md` | `.claude/skills/yearly/SKILL.md` | Yearly rollup |

### Rollup Logic

Each higher cadence reads lower cadences as primary input:

```
daily → weekly → monthly → yearly
```

The rollup process:
1. Collect all lower-cadence digests since the last digest at this cadence
2. Read them in chronological order
3. Identify recurring themes, escalating trends, and resolved questions
4. Query MCPs for fresh data to supplement or update what the lower cadences captured
5. Synthesize into a narrative that is denser and more analytical than any individual
   lower-cadence digest

This means a monthly digest doesn't repeat what the weeklies said — it distills them.
A yearly digest doesn't list what each month covered — it identifies the arcs, the
turning points, the transformations.

### Templates

- Full weekly template with rollup-specific sections (Week in Review,
  Governance Summary, Ecocredit Trends, Ecosystem Narrative, Forward Look)
- Full monthly template with trend analysis, governance arc, credit market
  evolution, community health, and strategic questions
- Full yearly template with annual narrative, key milestones, quantitative
  retrospective, governance evolution, ecocredit market annual review,
  ecosystem growth, and year-ahead outlook
- Templates gain `rollup` and `comparison` fields in frontmatter for rollup-aware
  generation

### GitHub Actions Automation

Cron workflows using `anthropics/claude-code-action@v1` with `--mcp-config`,
`--dangerously-skip-permissions`, and `anthropic_api_key`:

| Cadence | Schedule | Cron Expression | Model | Max Turns |
|---------|----------|-----------------|-------|-----------|
| Daily | Every day at 08:00 UTC | `0 8 * * *` | Sonnet | 50 |
| Weekly | Mon, Wed, Fri at 10:00 UTC | `0 10 * * 1,3,5` | Sonnet | 75 |
| Monthly | 1st and 15th at 12:00 UTC | `0 12 1,15 * *` | Opus | 100 |
| Yearly | Manual dispatch | — | Opus | 150 |

Each workflow:
1. Checks out the repository
2. Creates `/tmp/mcp-config.json` with secrets injected from GitHub environment
3. Runs `claude-code-action@v1` with the agent file prompt and `--mcp-config`
4. Commits the generated digest as `regen-heartbeat[bot]`
5. Pushes to main (triggers Quartz deploy)

Estimated monthly cost: $67–165.

### Historic Cross-Referencing

The Reflection section in every template becomes more sophisticated:
- Compare with the same day/week/month in previous years
- Identify cyclical patterns (seasonal governance activity, annual credit trends)
- Track long-running threads across digests (e.g., a governance proposal that was
  first discussed in a daily, voted on in a weekly, and resolved in a monthly)

---

## Phase 3 — Living Planning System

**Goal:** Extend the digest system into a full planning and project management tool for
the Regen ecosystem.

**What gets built:**

### New Commands

- **`/plans`** — Display and manage active plans across Regen Commons, Regen Network,
  and RegenAI. Plans are living documents that reference digests, decisions, and
  roadmap items.

- **`/roadmap`** — Display and manage per-group roadmaps. Each group (Regen Commons,
  Regen Network, RegenAI) maintains its own roadmap document with milestones, timelines,
  and dependencies.

- **`/goals`** — Display and manage goals at various time horizons (quarterly, annual,
  multi-year). Goals link to plans and track progress through digest-derived metrics.

- **`/decisions`** — Track open and closed decisions. Every significant decision is
  recorded with context, options considered, rationale, and outcome. Open decisions
  surface in relevant digests.

- **`/backlog`** — Manage a prioritized backlog of work items across all groups.
  Items link to goals, plans, and roadmaps.

- **`/projects`** — Display and manage active projects. Projects aggregate tasks,
  decisions, and progress toward specific deliverables.

### Directory Structure

```
content/
├── digests/          # existing digest hierarchy
├── plans/
│   ├── regen-commons/
│   ├── regen-network/
│   └── regenai/
├── roadmaps/
│   ├── regen-commons.md
│   ├── regen-network.md
│   └── regenai.md
├── goals/
│   ├── 2026-Q1.md
│   ├── 2026-Q2.md
│   └── ...
├── decisions/
│   ├── open/
│   └── closed/
└── projects/
    ├── active/
    └── completed/
```

### Community Governance Integration

- Governance proposals from the Ledger MCP are automatically linked to relevant
  decisions and plans
- Forum discussions from KOI are surfaced in the context of active plans and open
  decisions
- Voting outcomes update decision records and plan status
- Community sentiment (derived from Discourse analysis) informs goal tracking

### Planning Documents

- Monthly planning documents are generated 12 months ahead, providing a rolling
  horizon of anticipated work, open questions, and strategic priorities
- Yearly planning documents are generated for the current and next year
- Planning documents are living — they are updated by each digest cycle as new
  information arrives

### Cross-Referencing

The planning system creates a web of relationships:

```
goals ←→ plans ←→ projects ←→ decisions
  ↕         ↕         ↕           ↕
roadmaps  digests   digests    digests
```

Every digest can reference and update planning documents. Every planning document
can reference digests as evidence. Decisions reference the digests that informed them
and the plans they affect.

### Per-Group Roadmaps

Each group maintains its own roadmap with:
- Current quarter focus areas
- Milestone tracking with status indicators
- Dependencies between groups
- Risk register
- Resource allocation

Roadmaps are updated by monthly digests and can be manually edited between cycles.

---

## Phase Dependencies

```
Phase 1                    Phase 2                     Phase 3
────────                   ────────                    ────────
Directory structure   →    Rollup logic           →    Planning directories
Settings              →    Enhanced templates     →    Planning commands
Character pipeline    →    Character variants     →    Governance integration
/current-events       →    GitHub Actions         →    Cross-referencing
/daily                →    /weekly                →    /plans
Template system       →    /monthly               →    /roadmap
MCP documentation     →    /yearly                →    /goals, /decisions
Quartz deployment     →    Historic comparison    →    /backlog, /projects
                           Cron automation        →    12-month planning horizon
```

Each phase is independently useful. Phase 1 delivers a working daily digest system.
Phase 2 adds temporal depth and automation. Phase 3 transforms it into a planning
tool. There is no reason to rush — each phase should be solid before the next begins.
