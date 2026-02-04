# Regen Heartbeat: Case Study Report

## Building an Automated Ecosystem Observatory with Claude Code and Live MCP Data

*February 3, 2026 — First Production Run*

---

## 1. What Was Built

Regen Heartbeat is an automated digest engine that pulls live data from the Regen
Network blockchain, the KOI knowledge commons, and the broader web, then synthesizes
it into structured reports published as a static site via Quartz on GitHub Pages. It
also functions as a teaching repository for Claude Code — every structural choice is
designed to be studied and learned from.

Today, the system generated its first daily digest. The report covered on-chain
governance (Proposal #62, the v7.0 upgrade), ecocredit activity (13 credit classes,
78 batches, 58 projects), chain health (224.76M REGEN supply, 21 validators),
ecosystem intelligence (Tokenomics WG, Anti-Krisis framework, Regen AI launch), and
current events (carbon market restructuring, USDA $700M regenerative ag commitment,
IBC Eureka expanding to Ethereum). The full digest was written to
`content/digests/2026/02/02/daily.md`.

The repository contains 257 files across the Phase 1 commit, including 12 character
personas with output styles and skills, 2 command skills (`/current-events` and
`/daily`), a template system with 4 cadence-level templates, 9 MCP documentation
files following the Diataxis framework, a fully configured Quartz static site, and a
GitHub Actions deployment workflow.


## 2. The Process: From Transcripts to Production

### Git History

The git history tells a compressed but honest story:

```
af950bb  [system] init: project configuration
76f6c7d  Create specs.
baeaca1  Implement Phase 1: skeleton, character pipeline, Quartz site, and documentation
```

Three commits. The first established the foundation: 12 character JSONs (carried over
from the GAIA AI project), rule files (ethos, workflow, coding), and the Claude
configuration. The second created the specification documents — the system spec, the
phase-1 spec, and the three-phase roadmap. The third implemented everything specified.

This is a deliberate pattern. The gap between commit 2 and commit 3 is where the real
work happened, but it happened *within the constraints of a written spec*, not as
improvisation. The spec was the contract. Implementation followed it, and the 10
documented deviations in `phase-1-implementation-notes.md` prove the discipline was
real — when the implementation diverged from the spec, the divergence was recorded and
justified.


### The Methodology: Transcript → POC → Spec → Roadmap → Phase → Build

The project's lineage is visible in `.claude/local/specs/transcripts/` and
`.claude/local/specs/poc/`. Two transcripts — a RegenAI standup and a Regen
Tokenomics call — provided the raw material. The standup transcript specifically
mentioned automated digests, KOI MCP integration, `year/month/day/` directory
structures, and GitHub Actions triggers. A POC tarball (`regen-memory.tar.gz`)
contained an earlier proof of concept.

These artifacts were synthesized into three specification documents:

1. **`regen-heartbeat.md`** — The system specification. 8 sections covering
   architecture, data sources, character pipeline, template system, commands, MCP
   integration, documentation structure, and principles. This is the canonical design
   document.

2. **`phase-1.md`** — The implementation specification. An 8-step build sequence
   detailed enough that any Claude instance could execute it without ambiguity.
   Verification checklist at the bottom.

3. **`roadmap.md`** — Three-phase plan with dependency graph. Phase 1 (skeleton +
   daily), Phase 2 (temporal hierarchy + automation), Phase 3 (living planning
   system).

This methodology — grounding specifications in real conversations and working
prototypes rather than abstract requirements — is worth emphasizing. The specs read
like they were written by someone who had already tried to build the thing and learned
from the attempt. That is because they were.


### The feature-dev Approach

The build session (session `68077bd9`) followed the feature-dev pattern: worktree
isolation on a `phase-1` branch, subagent-driven research phase, then implementation.
The session transcript shows 7 subagents launched for parallel exploration:

- One explored the existing repository structure
- One explored the KOI MCP tools (reading source code from cloned resources)
- One explored Quartz configuration patterns (reading from cloned resources)
- Several handled README rewriting and verification tasks

The main agent orchestrated these while staying focused on the build sequence. After
initial implementation, the user provided feedback (rename memories→digests, improve
READMEs, add wikilinks, fix theme colors, filter CLAUDE.md from Quartz), which was
addressed in a single iteration before the commit. The implementation notes document
was then written to record deviations.


## 3. The Resources Directory

The `.claude/local/resources/` directory is perhaps the most underappreciated piece of
this architecture. It contains cloned repositories:

- **`regen-koi-mcp/`** — The KOI MCP server source code (tools.ts, API docs, user
  guide, tool routing)
- **`regen-python-mcp/`** — The Ledger MCP server source code
- **`koi-processor/`** — The knowledge indexing pipeline
- **`koi-sensors/`** — Data collection sensors
- **`quartz/`** — The Quartz static site generator source

These local clones served two critical functions. First, they allowed subagents to
write accurate MCP documentation by reading the actual source code — `tools.ts` for
parameter schemas, `API_REFERENCE.md` for return formats, `TOOL_ROUTING.md` for usage
patterns. The KOI reference doc (935 lines) and Ledger reference doc (875 lines) were
produced from this source material, not from memory or hallucination. Second, the
Quartz clone provided the framework files that were copied into the project and the
configuration patterns that informed `quartz.config.ts`.

This approach — cloning source repos into a gitignored local directory so that
subagents can read primary sources — is a pattern worth formalizing. It converts
"write documentation for these tools" from a knowledge-dependent task into a
source-dependent task, which is categorically more reliable.


## 4. Reflections on MCP Tool Usage

### How the Tools Were Used

For the first daily digest, 15 parallel tool calls were fired across three MCP servers
and web search:

**Ledger MCP (7 calls):**
- `list_governance_proposals` — returned all 61 proposals (20 per page). Historically
  complete but noisy — only one active proposal among 60 passed/rejected ones.
- `get_governance_proposal(62)` and `get_governance_tally_result(62)` — targeted
  follow-ups on the active proposal. These were the most valuable Ledger calls.
- `list_credit_batches`, `list_classes`, `list_projects` — inventory queries. Returned
  78 batches, 13 classes, 58 projects. Good for totals but the data is point-in-time,
  not change-over-time.
- `list_sell_orders` — only 1 order returned on the first page (of 23 total).
  Pagination limit.
- `get_community_pool` — clean, single-value response. ~3.36M REGEN.
- `get_total_supply` — failed with a Pydantic validation error (`count_total` and
  `reverse` expected boolean but received None). This is a bug in the Ledger MCP
  server.
- `analyze_market_trends` — returned mostly empty data. The "simulated trends"
  methodology limitation means this tool is not yet useful for real analysis.

**KOI MCP (3 calls):**
- `generate_weekly_digest` — the single most information-dense response. 1,177 words
  covering governance, community forum analysis, marketplace metrics, and technical
  developments. This tool alone provided more narrative context than all the Ledger
  queries combined.
- `search("governance proposal voting")` — returned 10 results with confidence
  scores. Most were reference documentation rather than recent activity. The hybrid
  search (vector + graph + keyword) worked, but the results were more
  historical/structural than current.
- `search("ecocredit registry credit class batch")` — similar pattern. Good for
  understanding the system, less useful for "what happened today."

**Web Search (4 calls):**
- Regen Network news, carbon/biodiversity markets, regenerative agriculture, Cosmos
  ecosystem. The web search results were surprisingly rich — the carbon market
  restructuring data, the USDA $700M announcement, and the IBC Eureka launch all came
  from web search, not from Regen-specific MCPs.


### Observations on the Tools

**`generate_weekly_digest` is the star.** It does the most synthesis work, returns the
most context, and directly maps to what a digest needs. The daily skill should
probably call this first and use it to guide subsequent targeted queries.

**`get_total_supply` has a bug.** The Pydantic validation error on `count_total` and
`reverse` parameters is a server-side issue that should be reported to the Ledger MCP
maintainers. The workaround is calling `get_supply_of("uregen")` instead.

**`analyze_market_trends` is not production-ready.** The tool's own metadata says
`"analysis_type": "cross_sectional_with_simulated_trends"` and `"limitations":
"Historical data simulation - real trends would require time-series data"`. It
returned zero orders analyzed and empty credit type arrays. This tool needs
time-series data infrastructure to be useful.

**`list_governance_proposals` returns too much history.** All 61 proposals since 2021,
paginated. For a daily digest, only proposals from the last 30 days or proposals
currently in voting period are needed. There is no date filter or status filter
exposed as a parameter (though `proposal_status` exists on the KOI
`list_governance_proposals` wrapper). The Ledger MCP should support filtering by
status.

**KOI search is better for concepts than for events.** The hybrid search excels at
finding documents about governance, ecocredits, or registry structure. It is less
useful for finding "what happened this week" — that is what `generate_weekly_digest`
is for.

**Web search provided the most surprising and valuable external context.** The carbon
market premium data (ARR projects with co-benefit scores jumping from $19 to $30+),
the USDA $700M commitment, and the IBC Eureka Ethereum expansion were all discoveries
from web search that enriched the digest significantly. The `settings.json` topic list
performed well as a search strategy.


## 5. Results Assessment

### What Worked

The digest reads well. The prose is coherent, the data is sourced, the sections follow
the template structure, and the analysis draws genuine connections between on-chain
state and broader trends. The Reflection section — written without historical
comparison since this is the first digest — still managed to identify the central
tension (sophisticated infrastructure, thin marketplace activity) and pose a
meaningful forward-looking question.

The parallel data-gathering strategy was efficient. Fifteen simultaneous API calls
returned in a few seconds, and the synthesis step had everything it needed to write
all six sections.

The character pipeline exists but was not exercised in this run (no `--character`
flag). That is fine for a baseline test. The voicing system should be tested next.


### What Was Surprising

The Regen chain is quieter than expected. Twenty-three sell orders, zero buy orders.
Only one governance proposal in active voting. The validator set operating at a loss.
The KOI weekly digest flagged the same supply-demand imbalance. The data consistently
tells a story of a well-architected system with low transactional volume — the rails
are built, but the trains are not yet running. Whether this is a "waiting for v7.0"
phenomenon or something deeper is worth tracking across future digests.

The depth of the KOI knowledge base was also surprising — 6,500+ documents with entity
resolution, SPARQL queries, and a code knowledge graph. The tools available are far
more sophisticated than what a daily digest needs. The full power of `sparql_query`,
`query_code_graph`, `get_entity_neighborhood`, and `resolve_entity` was not exercised
here. There is a clear opportunity for deeper analytical digests that use these graph
tools to map relationships and trace chains of causation through the ecosystem.


### Errors and Issues

1. **`get_total_supply` Pydantic validation error.** Server-side bug. Workaround
   exists (`get_supply_of`), but this should be fixed.

2. **`analyze_market_trends` returns empty data.** The tool's simulated trend
   methodology does not produce actionable results. It should either be improved with
   real time-series data or clearly marked as experimental in the documentation.

3. **Governance proposal pagination.** The Ledger MCP returned proposals from 2021
   onward. For daily digests, a date or status filter would dramatically reduce noise.

4. **Sell order pagination.** `list_sell_orders` with limit=20 only returned 1 of 23
   orders. The pagination offset is not obvious from the API response.

5. **The digest date says February 2 but it was generated on February 3.** This was
   an off-by-one in the original default (since corrected — the skill now defaults
   to today). The frontmatter should perhaps include a `generated_at` timestamp
   alongside the `date` field to make provenance explicit.


### Disappointments

The **guides and tutorials** in the documentation are stubs. The Phase 1 spec called
for 9 documentation files, and while the two reference documents (KOI and Ledger tool
references) are thorough (935 and 875 lines respectively), the 5 tutorial/guide files
are placeholder outlines. A newcomer cloning this repo would find rich reference
material but thin onboarding.

The **template system** works but is conceptually underspecified. The
`<!-- source: -->` annotations are instructions to Claude, not executable directives.
This means the template's influence on digest structure is indirect — it shapes what
Claude *intends* to do, not what it *must* do. A more rigorous approach might parse
the template programmatically and validate that each section actually received data
from its declared sources.

The **character pipeline** was built but not exercised. The 12 output styles and 12
skills exist, but invoking `/daily --character narrator` has not been verified to
produce a meaningfully different digest. The pipeline's architecture is sound, but its
output quality is unproven.


## 6. Limitations of the Approach

**No programmatic validation.** The system has no tests, no schema validation, no CI
checks on digest quality. The template's source annotations are natural language
instructions, not code contracts. If the daily skill fails to query the Ledger MCP for
governance data, nothing catches it — the digest just has a thin Governance Pulse
section. Phase 2 should introduce at least minimal validation: did each section
receive data from its declared sources?

**No change detection.** The Ledger MCP provides current state, not change-over-time.
The system can report there are 78 credit batches today, but not whether that is 2
more than yesterday. Without historical baselines (from previous digests or cached
snapshots), the system cannot identify what is new. This becomes critical for the
Reflection section, which currently has to invent context rather than compute it.

**Single-session generation.** The digest is generated in a single Claude session —
one shot, no iteration. If a data source fails or returns unexpected results, there is
no retry mechanism. The skill should probably have a verification step that reads the
generated digest and checks for completeness before writing it to disk.

**Token cost is non-trivial.** This digest consumed substantial context: 61 governance
proposals (most of them historical), the full KOI weekly digest (1,177 words), 10
search results per KOI query, and 4 web search result sets. Future runs should be more
selective — filter proposals by status, use the KOI digest as the primary source
rather than supplementing it with redundant searches.

**The character system is untested at generation time.** The pipeline was built but the
output has not been verified. The risk is that character voicing amounts to a thin
style overlay rather than a genuinely different perspective on the data.


## 7. Next Steps and Future Work

### Immediate (This Week)

- Fix the `get_total_supply` bug report to Ledger MCP maintainers
- Test `/daily --character narrator` and at least 2 other characters to validate the
  voicing pipeline
- Generate 3-5 daily digests to start building the historical baseline the Reflection
  section needs
- Complete the tutorial and guide stubs in `content/docs/`
- Deploy to GitHub Pages and verify the Quartz site renders correctly


### Phase 2 (Temporal Hierarchy)

- Implement `/weekly`, `/monthly`, `/yearly` commands with rollup logic
- Build GitHub Actions cron jobs for automated generation
- Add `generated_at` and `sources_queried` metadata to frontmatter for audit trail
- Implement change detection by caching previous day's key metrics
- Add validation: did each template section receive data from its declared sources?


### Phase 3 (Living Planning System)

- `/plans`, `/roadmap`, `/goals`, `/decisions` commands
- Cross-referencing between digests and planning documents
- Governance proposal lifecycle tracking across digests
- Community sentiment analysis from Discourse integration


## 8. The Roadmap

The three-phase roadmap is well-structured and each phase is independently useful —
this is its greatest strength. Phase 1 delivers a working daily digest. Phase 2 adds
temporal depth and automation. Phase 3 transforms it into a planning tool.

The dependency graph is clear:

```
Phase 1 (infrastructure) → Phase 2 (temporal hierarchy) → Phase 3 (planning)
```

The risk is scope creep in Phase 3. Commands like `/backlog`, `/projects`, and
`/decisions` imply a project management system layered on top of a digest engine. This
is a significant architectural expansion. The roadmap wisely says "there is no reason
to rush — each phase should be solid before the next begins," and that should be
underscored. Phase 2's rollup logic and cron automation are the natural next step.
Phase 3 should be re-evaluated once Phase 2 is running in production.


## 9. What Could Have Been Done Better

**The spec-to-implementation cycle was too compressed.** Spec creation and
implementation happened in the same day, in the same session lineage. Ideally, the
spec would be written, reviewed by the team, and then implemented in a separate
session. The feedback loop (rename memories→digests, improve theme, add wikilinks)
shows that the spec had unresolved aesthetic questions that could have been caught
earlier.

**Resource cloning should be formalized.** The `.claude/local/resources/` pattern
works, but it is ad hoc. A `Makefile` or setup script that clones the required
repositories into the expected locations would make onboarding reproducible. Right now,
a new contributor would not know which repos to clone or where to put them.

**The documentation quality gradient is too steep.** Two reference docs at 900+ lines,
five guides/tutorials at 25 lines each. The Phase 1 spec called for "all 9
documentation files," and technically they exist, but the quality difference between
reference and tutorial is a factor of 30x. The tutorials should have been written with
the same thoroughness as the references, even if that meant fewer references.

**The daily template's source annotations should be more precise.**
`<!-- source: ledger.governance, koi.governance -->` is legible but vague. Something
like `<!-- tools: list_governance_proposals(status=VOTING_PERIOD),
get_governance_tally_result($proposal_id),
search(query="governance", published_from=$date-7d) -->` would give future Claude
instances (or automation) much more specific instructions.


## 10. Requests to the Team

1. **Fix the `get_total_supply` bug in the Ledger MCP.** The Pydantic validation
   error on `count_total` and `reverse` is blocking the most natural way to query
   total token supply.

2. **Add status filtering to `list_governance_proposals`.** Returning all 61
   historical proposals when only active ones are needed wastes tokens and context.

3. **Consider a `get_chain_snapshot` tool** that returns a compact summary of key
   metrics (supply, bonded, community pool, active proposals, recent batches) in a
   single call. This would replace 4-5 separate Ledger queries for daily digests.

4. **Improve `analyze_market_trends`** with real time-series data, or clearly document
   that it is currently simulated.

5. **Add a `published_from` filter to KOI search results** that actually narrows
   results to recent activity. The current search is better at finding conceptual
   matches than temporal ones.


## 11. General Thoughts

This project demonstrates something genuinely interesting about Claude Code as a
platform: the system that was built today is not a traditional software application.
There is no `src/` directory. There is no runtime. The "application" is a set of
specifications, templates, skills, and character definitions that instruct Claude how
to gather data, synthesize it, and write about it. The code is in the configuration.
The infrastructure is in the markdown.

This is both the project's strength and its fragility. Its strength because it means
the entire system can be understood by reading it — there is no hidden logic, no
compiled binaries, no opaque dependencies. A newcomer reads the specs, the templates,
the skills, and the rules, and they understand the whole thing. Its fragility because
there is no enforcement layer. The template says "query ledger.governance" but nothing
guarantees that governance was actually queried. The skill says "write to
content/digests/YYYY/MM/DD/daily.md" but nothing verifies the path is correct.

The MCP tools themselves are impressive in scope — between KOI and Ledger, there are
60+ tools covering knowledge search, blockchain queries, graph analytics, and market
analysis. The daily digest exercises maybe 15 of them. The untapped tools (SPARQL
queries, code graph traversal, entity neighborhood mapping, metadata IRI resolution,
hectare derivation) suggest much deeper analytical possibilities for specialized
digests or thematic reports.

The character system is the most architecturally interesting component. Twelve
personas, each with a JSON identity, a prose output style, and a skill loader. The
pipeline is clean: `character.json → output-style.md → SKILL.md →
/daily --character name`. But its real value will only become apparent when the
characters start diverging — when the Governor writes a governance-heavy digest that
the Narrator would have told as a story and TerraNova would have grounded in soil
science. That divergence is the whole point, and it has not been tested yet.

The first digest itself reads well, but it reads like one voice. The analytical
default. The real test of this system's promise comes when the same data is processed
through different lenses and the results are genuinely distinct. If the characters
produce meaningfully different digests — different emphases, different framings,
different conclusions from the same data — then the character pipeline is more than a
style overlay. It is a tool for multiplying perspectives on complex systems. And
multiplying perspectives on complex systems is what regeneration requires.
