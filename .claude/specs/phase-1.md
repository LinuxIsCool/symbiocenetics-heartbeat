# Phase 1 — Skeleton & Daily Heartbeat

This document specifies everything that must be built in Phase 1. It is detailed
enough that any Claude instance can read it and implement without ambiguity. For
architectural context and definitions, see `@.claude/specs/regen-heartbeat.md`.

---

## Objective

Deliver a working daily digest system with character voicing, a template engine,
two functional commands (`/current-events` and `/daily`), MCP documentation, and a
Quartz-powered static site deployed to GitHub Pages.

When Phase 1 is complete, a user should be able to:

1. Clone the repo and run `/current-events` to get a live synthesis of Regen-relevant news
2. Run `/daily` to generate a structured daily digest written to `content/memories/`
3. Run `/daily --character narrator` to get the same digest voiced through a character
4. Visit the GitHub Pages site and browse published digests
5. Read the docs and understand how to use the KOI and Ledger MCPs
6. Study the repository structure and learn how Claude Code skills, output styles,
   templates, and characters work together

---

## Build Sequence

The build proceeds in this order. Each step depends on the ones before it.

### Step 1: Directory Scaffolding

Create the full directory structure with README.md and CLAUDE.md files in every
directory. The CLAUDE.md in each directory should contain `@README.md` plus any
context specific to that directory's purpose.

**Directories to create:**

```
content/
content/memories/
templates/
templates/daily/
templates/weekly/        # empty for now, structure ready for Phase 2
templates/monthly/       # empty for now
templates/yearly/        # empty for now
docs/
docs/tutorials/
docs/guides/
docs/reference/
docs/explanations/
.claude/output-styles/
.claude/skills/current-events/
.claude/skills/daily/
```

**README.md content for each directory:**

Each README should be a brief (3-8 sentences) prose description of what the directory
contains, why it exists, and how its contents are used. Write in the voice established
by `.claude/rules/ethos.md` — personable, clear, never robotic.

**CLAUDE.md content for each directory:**

```markdown
@README.md
```

Plus any additional context Claude needs when operating within that directory. For
example, `.claude/skills/current-events/CLAUDE.md` might include a reference to the
settings.json topic list.


### Step 2: System Settings

Create `settings.json` at the repository root with the following schema:

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

This file is read by Claude at command execution time. It has no build step, no schema
validation, and no runtime dependencies. It is just a JSON file that Claude reads.


### Step 3: Character Pipeline

For each character in `.claude/characters/`, produce two files:

#### 3a. Output Styles

Create `.claude/output-styles/{name}.md` for each character. The name should be
lowercase, matching the character's name field: `narrator.md`, `regenai.md`,
`governor.md`, `facilitator.md`, `advocate.md`, `voiceofnature.md`, `gaia.md`,
`terranova.md`, `genesis.md`, `astraea.md`, `aquarius.md`, `cascadia.md`.

Each output style file should be derived from its character JSON by extracting and
condensing:

- The `system` field → Voice and Perspective sections
- The `style.all` array → Style section
- The `style.chat` and `style.post` arrays → additional Style directives
- The `adjectives` array → tonal keywords
- The `topics` array → domain focus

The output style should be written in prose, not bullet points. It is an instruction
document for Claude, telling it how to write when embodying this character. Keep each
file to 20-40 lines — enough to capture the essence without overwhelming context.

Structure:

```markdown
# {Character Name}

## Voice
{2-3 sentences describing tone, register, personality}

## Perspective
{2-3 sentences describing what this character cares about, their worldview}

## Style
{3-5 sentences with specific writing directives}

## Formatting
{2-3 sentences on document structure preferences}
```

#### 3b. Character Skills

Create `.claude/skills/{name}/SKILL.md` for each character. This skill activates the
character's output style and provides instructions for using it in digest generation.

Frontmatter:

```yaml
---
name: {name}
description: Write as {Character Name} — {one-line role description}
output-style: ../../output-styles/{name}.md
---
```

Body:

```markdown
You are writing as {Character Name}.

Load and follow the output style at `@.claude/output-styles/{name}.md`.

When generating digest content through this character:
1. Maintain the character's voice consistently throughout
2. Apply the character's perspective to interpret data and events
3. Let the character's expertise shape which details are emphasized
4. Stay grounded in facts — the character voices the truth, not fiction

The character definition is at `@.claude/characters/{group}/{filename}`.
```


### Step 4: Command Skills

#### 4a. `/current-events`

Create `.claude/skills/current-events/SKILL.md`:

```yaml
---
name: current-events
description: Search the web for current events relevant to the Regen ecosystem
---
```

Body should specify the complete behavior:

1. Read `settings.json` to get the default topic list
2. Parse arguments: `--topic`, `--include-defaults`, `--creative`, `--deep`,
   `--character`
3. Execute web searches for each applicable topic
4. If `--creative`, generate 2-3 additional search terms based on the agent's
   understanding of current Regen context
5. If `--deep`, review first-round results and generate 2-3 follow-up queries
   targeting gaps or interesting threads
6. Synthesize all results into a structured report with sections per topic area
7. If `--character` is specified, load the character skill and voice the report
8. Render to terminal (not persisted to file unless user requests it)

The skill should include example invocations:

```
/current-events
/current-events --topic "ETHDenver 2026"
/current-events --topic "carbon markets" --include-defaults
/current-events --creative --deep
/current-events --character narrator
```

#### 4b. `/daily`

Create `.claude/skills/daily/SKILL.md`:

```yaml
---
name: daily
description: Generate a daily digest for Regen Network, RegenAI, and the Regen Commons
---
```

Body should specify the complete behavior:

1. Parse arguments: `--date`, `--template`, `--character`
2. Default date to yesterday if not specified
3. Load the template from `templates/daily/{name}.md`
4. Read the template's section structure and source annotations
5. For each section, query the appropriate data sources:

   **Governance Pulse:**
   - `ledger: list_governance_proposals` — active and recently closed proposals
   - `ledger: list_governance_votes` — vote tallies on active proposals
   - `koi: search(query="governance proposal")` — forum discussions about governance

   **Ecocredit Activity:**
   - `ledger: list_credit_batches` — recent batch issuances
   - `ledger: list_classes` — credit class overview
   - `ledger: list_projects` — registered projects
   - `ledger: list_sell_orders` — marketplace activity
   - `ledger: analyze_market_trends` — credit market trends
   - `koi: search(query="ecocredit registry")` — related discussions

   **Chain Health:**
   - `ledger: get_total_supply` — token supply metrics
   - `ledger: get_community_pool` — community pool balance

   **Ecosystem Intelligence:**
   - `koi: generate_weekly_digest` — curated summary of recent activity
   - `koi: search` — topic-specific searches for notable developments
   - `koi: get_entity_neighborhood` — relationship mapping for key entities

   **Current Events:**
   - Web search using topics from `settings.json`

   **Reflection:**
   - Read previous daily digests from `content/memories/` for comparison
   - Identify trends, changes, and open questions

6. Synthesize findings into a coherent digest following the template structure
7. If `--character` is specified, voice the digest through that character
8. Write YAML frontmatter:

```yaml
---
title: "Daily Heartbeat — {date}"
date: {YYYY-MM-DD}
template: {template-name}
character: {character-name or null}
cadence: daily
sources:
  koi: true
  ledger: true
  web: true
  historic: {true if previous digests exist}
---
```

9. Write to `content/memories/YYYY/MM/DD/index.md`
10. Also render to terminal

The skill should include example invocations:

```
/daily
/daily --date 2026-02-02
/daily --character narrator
/daily --template default --character governor
```


### Step 5: Default Daily Template

Create `templates/daily/default.md`:

```markdown
---
name: default
cadence: daily
description: Standard daily digest covering governance, ecocredits, chain health, ecosystem intelligence, and current events
sources:
  - koi
  - ledger
  - web
  - historic
---

# {date} — Daily Heartbeat

## Governance Pulse
<!-- source: ledger.governance, koi.governance -->
Active proposals, recent votes, tally results, and governance discussions from the
forum. Note any proposals entering or exiting voting period. Flag contentious votes
or unusual participation patterns.

## Ecocredit Activity
<!-- source: ledger.ecocredit, koi.registry -->
New credit classes, batch issuances, retirements, and marketplace sell orders.
Changes in credit supply. Notable project registrations. Registry discussions.

## Chain Health
<!-- source: ledger.staking, ledger.supply -->
Total supply, community pool balance, notable validator changes. Any significant
on-chain events.

## Ecosystem Intelligence
<!-- source: koi.search, koi.weekly_digest, koi.entity -->
Notable discussions from Discourse, documentation updates, GitHub activity, community
initiatives. What are people talking about? What's being built?

## Current Events
<!-- source: web -->
Relevant developments from the broader regenerative, climate finance, and crypto
ecosystem. Connections between external events and Regen's work.

## Reflection
<!-- source: historic -->
How does today compare to recent days? What trends are emerging? What questions remain
open? What deserves deeper investigation?
```

Also create placeholder templates for Phase 2 cadences:

- `templates/weekly/default.md` — Same structure as daily but sections summarize
  the week's dailies, with additional depth on governance and ecocredit trends
- `templates/monthly/default.md` — Broader analysis, trend identification,
  narrative arc across weeks
- `templates/yearly/default.md` — Major themes, annual metrics, retrospective

These placeholders should contain the frontmatter and section headers but note that
they are Phase 2 deliverables.


### Step 6: MCP Documentation

Create four documentation files following the Diataxis framework:

#### 6a. `docs/tutorials/koi-mcp.md` — Getting Started with KOI MCP

Walk a newcomer through their first KOI queries:
1. What KOI is and why it exists
2. How to search the knowledge base with `search`
3. How to explore entity relationships with `resolve_entity` and
   `get_entity_neighborhood`
4. How to get a weekly digest with `generate_weekly_digest`
5. Example queries and expected output shapes

#### 6b. `docs/tutorials/ledger-mcp.md` — Getting Started with Ledger MCP

Walk a newcomer through their first chain queries:
1. What the Ledger MCP is and what it connects to
2. How to check governance proposals
3. How to view ecocredit batches and projects
4. How to query token supply and community pool
5. Example queries and expected output shapes

#### 6c. `docs/reference/koi-mcp-tools.md` — KOI MCP Tool Reference

Exhaustive reference for every KOI MCP tool. For each tool:
- Name and description
- Parameters with types, defaults, and valid values
- Return shape
- Example usage
- When to use it in digest generation

Tools to document: `search`, `generate_weekly_digest`, `get_notebooklm_export`,
`search_github_docs`, `get_repo_overview`, `get_tech_stack`, `resolve_entity`,
`get_entity_neighborhood`, `get_entity_documents`, `sparql_query`,
`query_code_graph`, `get_stats`, `resolve_metadata_iri`,
`derive_offchain_hectares`, `analyze_market_trends`,
`compare_credit_methodologies`, `get_full_document`, `kb_rid_lookup`,
`kb_list_rids`, `parse_rid`, `get_mcp_metrics`, `submit_feedback`.

#### 6d. `docs/reference/ledger-mcp-tools.md` — Ledger MCP Tool Reference

Exhaustive reference for every Ledger MCP tool. Organize by module:

**Bank module:** `get_all_balances`, `get_balance`, `get_spendable_balances`,
`get_total_supply`, `get_supply_of`, `get_bank_params`, `get_denoms_metadata`,
`get_denom_metadata`, `get_denom_owners`

**Distribution module:** `get_distribution_params`,
`get_validator_outstanding_rewards`, `get_validator_commission`,
`get_validator_slashes`, `get_delegation_rewards`,
`get_delegation_total_rewards`, `get_delegator_validators`,
`get_delegator_withdraw_address`, `get_community_pool`

**Governance module:** `get_governance_proposal`, `list_governance_proposals`,
`get_governance_vote`, `list_governance_votes`, `list_governance_deposits`,
`get_governance_params`, `get_governance_deposit`, `get_governance_tally_result`

**Ecocredit module:** `list_credit_types`, `list_classes`, `list_projects`,
`list_credit_batches`, `list_baskets`, `get_basket`, `list_basket_balances`,
`get_basket_balance`, `get_basket_fee`

**Marketplace module:** `get_sell_order`, `list_sell_orders`,
`list_sell_orders_by_batch`, `list_sell_orders_by_seller`, `list_allowed_denoms`

**Analytics:** `analyze_portfolio_impact`, `analyze_market_trends`,
`compare_credit_methodologies`

#### 6e. `docs/guides/searching-knowledge-base.md`

Practical guide for effective KOI searches:
- How hybrid search works (vector + graph + keyword)
- Using intent parameters for better results
- Date filtering and source filtering
- Pagination and result limits
- Tips for formulating good queries
- Common search patterns for digest generation

#### 6f. `docs/guides/querying-chain-data.md`

Practical guide for Ledger MCP queries:
- Understanding on-chain vs off-chain data
- Pagination patterns
- Common query sequences for digest sections
- Interpreting results (denominations, amounts, addresses)
- Cross-referencing chain data with KOI knowledge

#### 6g. `docs/explanations/why-these-mcps.md`

Explains the architectural choice:
- Why KOI exists: 6,500+ documents from multiple sources need unified search
- Why Ledger MCP exists: direct blockchain queries without running a node
- How they complement each other: KOI for knowledge, Ledger for state
- How they fit the Regen ecosystem's data architecture
- The citation imperative: no metric without a source

#### 6h. `docs/explanations/regen-ecosystem.md`

Newcomer-friendly overview:
- What Regen Network is
- What ecocredits are and how they work
- The governance system
- The marketplace
- KOI and the knowledge commons
- The Regen Commons and RegenAI
- How Regen Heartbeat fits into this ecosystem

#### 6i. `docs/tutorials/getting-started.md`

Getting started with Regen Heartbeat itself:
- Cloning the repo
- Understanding the directory structure
- Running your first `/current-events`
- Running your first `/daily`
- Browsing the generated output
- Understanding the character system
- Customizing templates


### Step 7: Quartz Configuration

#### 7a. `quartz.config.ts`

Standard Quartz configuration file. Key settings:

```typescript
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Regen Heartbeat",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "en-US",
    baseUrl: "gaiaaiagent.github.io/regen-heartbeat",
    ignorePatterns: [
      "private",
      "templates",
      ".claude",
      "node_modules",
    ],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#FAFAF8",
          lightgray: "#E8E8E4",
          gray: "#B0B0A8",
          darkgray: "#4A4A44",
          dark: "#2C3E2D",
          secondary: "#4A8C5C",
          tertiary: "#6BAF7E",
          highlight: "rgba(74, 140, 92, 0.12)",
          textHighlight: "rgba(74, 140, 92, 0.2)",
        },
        darkMode: {
          light: "#1A1E1A",
          lightgray: "#2A302A",
          gray: "#5A6A5A",
          darkgray: "#B0C0B0",
          dark: "#E0EAE0",
          secondary: "#6BAF7E",
          tertiary: "#4A8C5C",
          highlight: "rgba(107, 175, 126, 0.12)",
          textHighlight: "rgba(107, 175, 126, 0.2)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({ priority: ["frontmatter", "git"] }),
      Plugin.SyntaxHighlighting(),
      Plugin.ObsidianFlavoredMarkdown(),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks(),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex(),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}
```

#### 7b. `.github/workflows/deploy.yml`

GitHub Actions workflow that:
1. Triggers on push to `main` branch (paths: `content/**`, `docs/**`)
2. Sets up Node.js
3. Installs Quartz
4. Builds the site
5. Deploys to GitHub Pages

Standard Quartz deploy workflow with the repository's specific configuration.


### Step 8: Update Root Files

#### 8a. Update `CLAUDE.md`

Add references to the new directories, settings, and specs. Keep the existing `@README.md`
reference and add:

```markdown
@README.md
@settings.json
@.claude/specs/regen-heartbeat.md
```

#### 8b. Update `README.md`

Expand the README with:
- A brief project description (what Regen Heartbeat is)
- The command list with brief descriptions
- A note about the educational purpose
- Links to documentation
- How to get started (clone, run commands)

#### 8c. Update `.gitignore`

Ensure these are ignored:
- `.claude/local/`
- `node_modules/`
- `.quartz-cache/`
- `public/` (Quartz build output)


---

## Verification Checklist

When Phase 1 is complete, verify:

- [ ] Every directory has README.md and CLAUDE.md
- [ ] `settings.json` exists at repo root with valid JSON
- [ ] Output styles exist for all 12 characters
- [ ] Character skills exist for all 12 characters
- [ ] `/current-events` skill exists and documents all flags
- [ ] `/daily` skill exists and documents all flags
- [ ] Default daily template exists with section structure and source annotations
- [ ] Placeholder templates exist for weekly, monthly, yearly
- [ ] All 9 documentation files exist in `docs/`
- [ ] `quartz.config.ts` exists with Regen green theme
- [ ] `.github/workflows/deploy.yml` exists
- [ ] `CLAUDE.md` references settings and specs
- [ ] `README.md` is updated with project description and commands
- [ ] `.gitignore` covers local files, node_modules, and build output
- [ ] Running `/current-events` produces a synthesis of Regen-relevant news
- [ ] Running `/daily` produces a digest written to `content/memories/`
- [ ] Running `/daily --character narrator` produces a voiced digest
- [ ] The character pipeline (JSON -> output style -> skill -> command) is complete
- [ ] Documentation reads clearly and covers the KOI and Ledger MCPs
- [ ] A newcomer could clone the repo and understand the structure
