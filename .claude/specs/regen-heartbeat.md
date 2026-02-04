# Regen Heartbeat — System Specification

This document is the single source of truth for the Regen Heartbeat project. Every
implementation decision traces back here. If something isn't in the spec, it isn't in
scope. If something in the spec is ambiguous, resolve it here before building.

---

## 1. What This Is

Regen Heartbeat is a dual-purpose system.

**First**, it is an automated digest engine. It generates structured reports about
Regen Network, RegenAI, and the Regen Commons at daily, weekly, monthly, and yearly
cadences. These digests are published as markdown files in a GitHub repository and
served as a static site via Quartz on GitHub Pages.

**Second**, it is an educational template. It demonstrates how to work with Claude Code
effectively — commands, skills, agents, MCPs, plugins, hooks, output styles, and
character systems. Every structural choice should be exemplary. A newcomer should be
able to clone this repository, read its organization, and understand both what it does
and how Claude Code works.

These two purposes reinforce each other. The digest engine provides a real, working
system to study. The educational structure makes the digest engine legible and
extensible.


## 2. Data Sources

The system draws from five categories of data:

1. **KOI MCP** — The Regen Knowledge of Interest system. Provides weekly digests,
   semantic search across 6,500+ documents (Notion pages, GitHub docs, Discourse
   threads, governance proposals), entity resolution, knowledge graph queries, and
   GitHub repository documentation. This is the primary source for Regen-specific
   knowledge.

2. **Ledger MCP** — Direct on-chain queries to the Regen Network blockchain. Provides
   governance proposals and votes, ecocredit classes/batches/projects, marketplace sell
   orders, basket balances, token supply and distribution, validator information,
   staking rewards, and community pool data.

3. **Web Search** — Current events, broader ecosystem context, climate news, metacrisis
   updates, and cross-referencing of Regen activities with the wider world.

4. **Historic Digests** — Previously generated digests at all cadences. Higher-cadence
   digests (daily) feed into lower-cadence rollups (weekly, monthly, yearly). Past
   digests provide comparison baselines, trend detection, and narrative continuity.

5. **Character Personas** — A library of character definitions that voice the digests
   with distinct perspectives, styles, and areas of expertise. Characters transform raw
   data synthesis into authored, opinionated writing.


## 3. Deployment

**Repository**: GitHub-hosted, public.

**Static Site**: Quartz generates a static site from the repository's markdown content.
The site is deployed to GitHub Pages at the organization's github.io domain. No custom
domain is required.

**Automation**: GitHub Actions cron jobs trigger digest generation at each cadence.
Phase 1 uses manual generation; Phase 2 introduces automation.


## 4. Architecture

### 4.1 Directory Structure

Every directory contains a `README.md` and a `CLAUDE.md`. The `CLAUDE.md` uses an `@`
tag to reference its sibling `README.md`, keeping context DRY.

```
regen-heartbeat/
├── .claude/
│   ├── CLAUDE.md
│   ├── settings.json
│   ├── characters/
│   │   ├── regen/
│   │   │   ├── narrator.character.json
│   │   │   ├── regenai.character.json
│   │   │   ├── governor.character.json
│   │   │   ├── facilitator.character.json
│   │   │   ├── advocate.character.json
│   │   │   └── voiceofnature.character.json
│   │   ├── gaia/
│   │   │   ├── gaia.character.json
│   │   │   ├── terranova.character.json
│   │   │   ├── genesis.character.json
│   │   │   ├── astraea.json
│   │   │   └── aquarius.json
│   │   └── bioregion/
│   │       └── cascadia.character.json
│   ├── output-styles/
│   │   └── {character-name}.md          # one per character
│   ├── skills/
│   │   ├── current-events/
│   │   │   └── SKILL.md
│   │   ├── daily/
│   │   │   └── SKILL.md
│   │   └── {character-name}/
│   │       └── SKILL.md                 # one per character
│   ├── specs/
│   │   ├── regen-heartbeat.md           # this file
│   │   ├── phase-1.md
│   │   └── roadmap.md
│   ├── hooks/
│   │   └── git-status.sh
│   ├── rules/
│   │   ├── ethos.md
│   │   ├── workflow.md
│   │   └── coding.md
│   └── local/                           # gitignored, machine-local
│       └── specs/
├── content/
│   └── memories/
│       └── YYYY/
│           └── MM/
│               ├── DD/
│               │   └── index.md         # daily digest
│               ├── weekly/
│               │   └── YYYY-WNN.md      # weekly digest (ISO week)
│               └── monthly/
│                   └── index.md         # monthly digest
├── templates/
│   ├── daily/
│   │   └── default.md
│   ├── weekly/
│   │   └── default.md
│   ├── monthly/
│   │   └── default.md
│   └── yearly/
│       └── default.md
├── docs/
│   ├── tutorials/
│   │   ├── getting-started.md
│   │   ├── koi-mcp.md
│   │   └── ledger-mcp.md
│   ├── guides/
│   │   ├── searching-knowledge-base.md
│   │   └── querying-chain-data.md
│   ├── reference/
│   │   ├── koi-mcp-tools.md
│   │   └── ledger-mcp-tools.md
│   └── explanations/
│       ├── why-these-mcps.md
│       └── regen-ecosystem.md
├── quartz.config.ts
├── quartz.layout.ts
├── settings.json
├── CLAUDE.md
├── README.md
└── .github/
    └── workflows/
        └── deploy.yml
```


### 4.2 System Settings

A `settings.json` file at the repository root configures system behavior. This is a
plain JSON file — no build step, no schema validation at runtime. Claude reads it
directly when executing commands.

```json
{
  "defaults": {
    "template": {
      "daily": "default",
      "weekly": "default",
      "monthly": "default",
      "yearly": "default"
    },
    "character": null
  },
  "currentEvents": {
    "topics": [
      "Regen Network",
      "ecological credits carbon biodiversity",
      "regenerative agriculture",
      "climate finance ReFi",
      "Cosmos ecosystem IBC",
      "metacrisis polycrisis",
      "solarpunk regeneration",
      "MRV ecological monitoring",
      "community currencies mutual credit",
      "bioregionalism watershed governance"
    ]
  },
  "site": {
    "title": "Regen Heartbeat",
    "description": "Automated digests for Regen Network, RegenAI, and the Regen Commons",
    "baseUrl": "https://gaiaaiagent.github.io/regen-heartbeat/",
    "theme": {
      "primary": "#4A8C5C",
      "secondary": "#2D5A3D",
      "background": "#FAFAF8",
      "text": "#2C3E2D"
    }
  }
}
```

**`defaults.template`** — Names of templates to use when no `--template` flag is given.
Each name corresponds to a file in `templates/{cadence}/{name}.md`.

**`defaults.character`** — The default character for voiced output. When `null`, output
is unvoiced (plain analytical style). Can be overridden per-command with `--character`.

**`currentEvents.topics`** — A hardcoded list of search terms used by `/current-events`.
Each string becomes a separate web search query. These are curated to cover the Regen
ecosystem's areas of interest.

**`site`** — Configuration for the Quartz static site: title, description, base URL,
and color theme.


### 4.3 The Character Pipeline

Characters are the voice system. They transform raw digest content from analytical
summaries into authored, opinionated writing with distinct perspectives. The pipeline
has four layers:

```
character.json
    ↓
.claude/output-styles/{name}.md
    ↓
.claude/skills/{name}/SKILL.md  (reads output style)
    ↓
agent definition (loads character skill)
    ↓
command --character=name  →  routes to agent
```

**Layer 1: Character Definition** (`.claude/characters/{group}/{name}.character.json`)

The source-of-truth identity file. These are ElizaOS-format character JSONs containing
name, system prompt, bio, message examples, style directives, topics, and adjectives.
They were created for the GAIA AI project and are reused here as persona definitions.

The existing characters, organized by group:

| Group | Character | Role |
|-------|-----------|------|
| regen | Narrator | Storytelling, communication bridge |
| regen | RegenAI | Technical lead, systems orchestrator |
| regen | Governor | Governance facilitator, consensus builder |
| regen | Facilitator | Partnership orchestrator, development lead |
| regen | Advocate | Educational specialist, community mobilizer |
| regen | VoiceOfNature | Philosophical voice, wisdom traditions |
| gaia | Gaia | Ecohyperstition, planetary intelligence |
| gaia | TerraNova | Soil carbon, ecosystem dynamics |
| gaia | Genesis | Autopoietic architect, AI engineering |
| gaia | Astraea | Legal architect, regenerative law |
| gaia | Aquarius | Water systems, hydrological dynamics |
| bioregion | Cascadia | Cascadia bioregion voice |

**Layer 2: Output Style** (`.claude/output-styles/{name}.md`)

A Claude Code output style file derived from the character JSON. This is a concise
markdown document that instructs Claude on tone, vocabulary, perspective, and
formatting when writing as this character. It extracts the relevant style directives
from the character JSON and renders them as prose instructions.

Output style files follow this structure:

```markdown
# {Character Name}

## Voice
{Prose description of tone, register, and personality}

## Perspective
{What this character cares about, their lens on the world}

## Style
{Specific writing directives: sentence structure, metaphor use, etc.}

## Formatting
{How the character structures documents: headers, lists, prose balance}
```

**Layer 3: Character Skill** (`.claude/skills/{name}/SKILL.md`)

A Claude Code skill that loads the output style and provides the character as a
reusable capability. The skill's frontmatter references the output style, and its
body contains instructions for how to use the character in digest generation.

**Layer 4: Agent Definition & Command Routing**

When a command is invoked with `--character=name`, the system loads the corresponding
character skill, which activates the output style. The agent then generates content
through that character's lens.

If no character is specified, output is generated in the default analytical voice
defined by the repository's ethos rules.


### 4.4 The Template System

Templates define the structure and content of digests at each cadence. They are
markdown files that specify which sections to include, what data sources to query for
each section, and how to format the output.

Templates live in `templates/{cadence}/{name}.md`. The default template for each
cadence is specified in `settings.json`. Commands accept a `--template` flag to
override the default.

A template is a markdown document with YAML frontmatter and section blocks:

```markdown
---
name: default
cadence: daily
description: Standard daily digest covering governance, ecocredits, and ecosystem news
sources:
  - koi
  - ledger
  - web
  - historic
---

# {date} — Daily Heartbeat

## Governance Pulse
<!-- source: ledger.governance, koi.governance -->
Active proposals, recent votes, and governance discussions.

## Ecocredit Activity
<!-- source: ledger.ecocredit, koi.registry -->
New credit classes, batch issuances, retirements, and marketplace activity.

## Chain Health
<!-- source: ledger.staking, ledger.supply -->
Validator set, staking metrics, supply changes.

## Ecosystem Intelligence
<!-- source: koi.search, koi.weekly_digest -->
Notable discussions, documentation updates, and community activity from KOI.

## Current Events
<!-- source: web -->
Relevant news from the broader regenerative, climate, and crypto ecosystem.

## Reflection
<!-- source: historic -->
Comparison with previous periods. Emerging trends. Open questions.
```

The `<!-- source: -->` comments are instructions to Claude, not executable directives.
They tell the generating agent which MCP tools and data sources to consult for each
section. Claude reads the template, understands the intent, and executes accordingly.


### 4.5 Commands

Commands are Claude Code skills invoked with `/` syntax. Each command is defined in
`.claude/skills/{command-name}/SKILL.md`.

Phase 1 commands:

#### `/current-events`

Searches the web for current events relevant to the Regen ecosystem.

**Arguments:**
- `--topic "search terms"` — Search for a specific topic instead of defaults
- `--include-defaults` — When used with `--topic`, also search default topics
- `--creative` — Let the agent improvise additional search terms based on its judgment
- `--deep` — Perform a follow-up search round based on insights from initial results
- `--character name` — Voice the output through a character persona

**Behavior:**
1. If no `--topic` is given, read `settings.json` and search each topic in
   `currentEvents.topics`
2. If `--topic` is given without `--include-defaults`, search only that topic
3. If `--topic` is given with `--include-defaults`, search both
4. If `--creative` is set, the agent adds its own search terms based on recent context
5. If `--deep` is set, after the first search round, the agent reviews results and
   formulates follow-up queries to fill gaps or pursue interesting threads
6. Synthesize results into a structured current events report
7. If `--character` is set, voice the report through that character

**Output:** Rendered to the terminal. Not persisted to a file unless the user
explicitly requests it.


#### `/daily`

Generates a daily digest for a given date.

**Arguments:**
- `--date YYYY-MM-DD` — The date to generate for. Defaults to yesterday.
- `--template name` — Template to use. Defaults to `settings.json` value.
- `--character name` — Voice the output through a character persona.

**Behavior:**
1. Determine the target date
2. Load the template from `templates/daily/{name}.md`
3. For each section in the template, query the appropriate data sources:
   - **KOI MCP**: `generate_weekly_digest`, `search`, `get_entity_neighborhood`,
     `search_github_docs`
   - **Ledger MCP**: `list_governance_proposals`, `list_credit_batches`,
     `list_sell_orders`, `get_total_supply`, `get_community_pool`,
     `analyze_market_trends`
   - **Web Search**: Current events relevant to the date
   - **Historic Digests**: Read previous daily digests for comparison
4. Synthesize findings into a coherent digest following the template structure
5. If `--character` is set, voice the digest through that character
6. Write the output to `content/memories/YYYY/MM/DD/index.md`
7. Add appropriate YAML frontmatter (date, template, character, sources consulted)

**Output:** Written to file at `content/memories/YYYY/MM/DD/index.md`. Also rendered
to the terminal.


### 4.6 MCP Integration

The system uses two MCP servers, configured in `.claude/settings.json`:

**KOI MCP** (`koi@regen-ai`) — Regen Knowledge of Interest. Key tools:

| Tool | Purpose in Digests |
|------|-------------------|
| `search` | Find documents about specific topics, people, or projects |
| `generate_weekly_digest` | Get a curated summary of recent Regen activity |
| `get_entity_neighborhood` | Explore relationships around a concept or person |
| `resolve_entity` | Disambiguate names to canonical knowledge graph entities |
| `search_github_docs` | Find technical documentation across Regen repos |
| `get_stats` | Knowledge base coverage and health |
| `sparql_query` | Advanced graph queries for complex relationships |
| `query_code_graph` | Find code entities and their relationships |

**Ledger MCP** (`ledger@regen-ai`) — Regen Network blockchain. Key tools:

| Tool | Purpose in Digests |
|------|-------------------|
| `list_governance_proposals` | Active and recent governance proposals |
| `get_governance_tally_result` | Vote tallies on proposals |
| `list_credit_batches` | Recent ecocredit batch issuances |
| `list_classes` | Credit class overview |
| `list_projects` | Registered ecological projects |
| `list_sell_orders` | Marketplace activity |
| `get_total_supply` | Token supply metrics |
| `get_community_pool` | Community pool balance |
| `analyze_market_trends` | Market trend analysis |
| `analyze_portfolio_impact` | Ecological impact metrics for addresses |


### 4.7 Documentation Structure

Documentation follows the Diataxis framework (tutorials, guides, reference,
explanations) and lives in `docs/`.

**Tutorials** teach newcomers by walking them through a complete task:
- Getting started with Regen Heartbeat
- Using the KOI MCP for knowledge queries
- Using the Ledger MCP for chain data

**Guides** solve specific problems for users who already understand the basics:
- Searching the knowledge base effectively
- Querying chain data for digest sections

**Reference** provides exhaustive, accurate descriptions:
- Complete KOI MCP tool reference with parameters and examples
- Complete Ledger MCP tool reference with parameters and examples

**Explanations** provide context and understanding:
- Why these MCPs exist and how they fit the Regen ecosystem
- The Regen ecosystem overview for newcomers


### 4.8 Quartz Static Site

The repository is configured as a Quartz site with:

- `quartz.config.ts` — Site configuration with Regen green theme
- `quartz.layout.ts` — Layout customization
- `.github/workflows/deploy.yml` — GitHub Actions workflow deploying to GitHub Pages

Theme colors derive from `settings.json`:
- Primary: `#4A8C5C` (Regen green)
- Secondary: `#2D5A3D` (deep forest)
- Background: `#FAFAF8` (warm off-white)
- Text: `#2C3E2D` (dark green-gray)

Standard Quartz plugins: FrontMatter, TableOfContents, SyntaxHighlighting,
ObsidianFlavoredMarkdown, GitHubFlavoredMarkdown, CreatedModifiedDate.

Content folder points to `content/` so that digests are automatically rendered.
The `docs/` folder is also included in the content path for documentation pages.


## 5. Cadences

Digests are generated at four temporal scales:

| Cadence | Frequency | Rollup Source |
|---------|-----------|---------------|
| Daily | Every day | MCPs + web + historic dailies |
| Weekly | Monday, Wednesday, Friday | Dailies since last weekly + MCPs |
| Monthly | 1st and 15th | Weeklies since last monthly + MCPs |
| Yearly | Solstices, equinoxes, New Year | Monthlies since last yearly + MCPs |

Each higher cadence reads the outputs of lower cadences as a primary source, then
supplements with fresh MCP queries and web search for anything the lower cadences may
have missed. This creates a hierarchical distillation where signal concentrates as you
move up in temporal scale.

Phase 1 implements daily only. Phase 2 adds weekly, monthly, yearly with rollup logic.


## 6. Educational Purpose

This repository teaches regens how to use Claude Code by example. It demonstrates:

| Concept | Where to Look |
|---------|---------------|
| CLAUDE.md structure | `CLAUDE.md`, `.claude/CLAUDE.md` |
| Rules and ethos | `.claude/rules/` |
| Skills (commands) | `.claude/skills/` |
| Output styles | `.claude/output-styles/` |
| Character systems | `.claude/characters/`, character pipeline |
| MCP integration | `settings.json`, `docs/reference/` |
| Plugins | `.claude/settings.json` |
| Hooks | `.claude/hooks/` |
| Specs and planning | `.claude/specs/` |
| Template systems | `templates/` |
| Documentation (Diataxis) | `docs/` |
| GitHub Actions | `.github/workflows/` |

Every structural choice is made with two audiences in mind: Claude (who needs to
understand what to do) and humans (who need to understand how it works).


## 7. Phased Roadmap

The project is built in three phases. Each phase is self-contained and delivers
working functionality.

**Phase 1 — Skeleton & Daily Heartbeat**: Core infrastructure, character pipeline,
`/current-events`, `/daily`, Quartz deployment, template system, MCP documentation.
See `@.claude/specs/phase-1.md` for full details.

**Phase 2 — Temporal Hierarchy & Automation**: `/weekly`, `/monthly`, `/yearly` with
rollup logic. GitHub Actions cron jobs for all cadences. Historic digest
cross-referencing. Enhanced templates.

**Phase 3 — Living Planning System**: `/plans`, `/roadmap`, `/goals`, `/decisions`,
`/backlog`, `/projects`. Project management directories. Community governance
integration. Open/closed decision tracking. Planning documents 12 months ahead.
Per-group roadmaps (Regen Commons, Regen Network, RegenAI).

See `@.claude/specs/roadmap.md` for the full three-phase breakdown.


## 8. Principles

These are inherited from `.claude/rules/ethos.md` and govern all implementation:

1. **Aesthetics** — How it looks, reads, and feels. Beautiful systems invite
   understanding.
2. **Elegance** — The right abstraction at the right level. Parsimony with purpose.
3. **Clarity** — If someone can't understand what you've done and why, you haven't
   finished yet.

Write in prose. Be personable. Have good taste. Move slowly. Work on one thing at a
time.
