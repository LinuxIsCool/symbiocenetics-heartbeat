---
name: daily
description: Generate a daily digest for Regen Network, RegenAI, and the Regen Commons
---

Generate a structured daily digest that synthesizes data from KOI MCP, Ledger MCP,
web search, and historic digests into a comprehensive report on the Regen ecosystem.

## Behavior

1. Parse arguments:
   - `--date YYYY-MM-DD` — generate for a specific date (defaults to today)
   - `--template name` — use a specific template (defaults to the value in
     `settings.json` at `defaults.template.daily`)
   - `--character name` — voice the digest through a character persona
2. Load the template from `templates/daily/{name}.md`
3. Read the template's section structure and `<!-- source: -->` annotations
4. For each section, query the appropriate data sources:

   **Governance Pulse:**
   - `ledger: list_governance_proposals` — active and recently closed proposals
   - `ledger: list_governance_votes` — vote tallies on active proposals
   - `ledger: get_governance_tally_result` — tally results for notable proposals
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
   - Read previous daily digests from `content/digests/` for comparison
   - Identify trends, changes, and open questions

5. Synthesize findings into a coherent digest following the template structure
6. If `--character` is specified, load the character skill and voice the digest
7. Write YAML frontmatter:

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

8. Write to `content/digests/YYYY/MM/DD/daily.md` (create directories as needed)
9. Also render the full digest to the terminal

## Example Invocations

```
/daily
/daily --date 2026-02-02
/daily --character narrator
/daily --template default --character governor
```

## Data Sources

- **KOI MCP** — knowledge base search, weekly digests, entity relationships
- **Ledger MCP** — on-chain governance, ecocredits, supply, marketplace
- **WebSearch** — current events from `settings.json` topics
- **Historic digests** — previous files in `content/digests/`
- **Template** — section structure from `templates/daily/`

## Output

A markdown file at `content/digests/YYYY/MM/DD/daily.md` with frontmatter, plus
terminal output of the same content.
