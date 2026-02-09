---
name: weekly
description: Generate a weekly digest rolling up dailies into higher-level pattern analysis
---

Generate a structured weekly digest that synthesizes daily digests and fresh MCP data
into a mid-range view of the Regen ecosystem for a given ISO week.

## Behavior

1. Parse arguments:
   - `--week YYYY-WNN` — ISO week to generate for (defaults to current week)
   - `--template name` — use a specific template (defaults to the value in
     `settings.json` at `defaults.template.weekly`)
   - `--character name` — voice the digest through a character persona
2. Determine the target week's date range (Monday through Sunday)
3. Load the template from `templates/weekly/{name}.md`
4. Read the template's `rollup` and `comparison` frontmatter to understand the
   synthesis directives
5. Read all daily digests within the target week from `content/digests/`
6. For each section, query data sources and synthesize from dailies:

   **Week in Review:**
   - Read all daily digests for the week in chronological order
   - Identify recurring themes, escalating developments, and resolved questions
   - Distill the week's daily record into a narrative arc — not a list of what
     happened each day, but what happened across the days

   **Governance Summary:**
   - `ledger: list_governance_proposals` — current state (supplements dailies)
   - `ledger: get_governance_tally_result` — tallies for proposals active this week
   - Extract governance threads from daily digests
   - Narrative: proposals that entered/exited voting, contentious votes, outcomes

   **Ecocredit Trends:**
   - `ledger: list_credit_batches` — fresh query for the latest state
   - `ledger: analyze_market_trends` — trend analysis across the week
   - Extract ecocredit activity from daily digests
   - Narrative: weekly delta in credit supply, marketplace volume, new projects

   **Ecosystem Narrative:**
   - `koi: generate_weekly_digest` — the KOI system's own weekly summary
   - `koi: search` — topics that emerged during the week
   - Extract ecosystem intelligence from daily digests
   - Narrative: what the community built, discussed, and decided

   **Forward Look:**
   - Identify open threads and upcoming events
   - Note proposals entering voting period
   - Flag patterns that merit attention in the coming week
   - Web search for relevant upcoming developments

7. Synthesize into a coherent weekly digest that reads as authored narrative, not
   a summarized list
8. If `--character` is specified, load the character skill and voice the digest
9. Write YAML frontmatter:

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

10. Write to `content/digests/YYYY/MM/weekly/YYYY-WNN.md` (create directories as needed)
11. Also render the full digest to the terminal

## Example Invocations

```
/weekly
/weekly --week 2026-W06
/weekly --character narrator
/weekly --template default --character governor
```

## Data Sources

- **Historic dailies** — primary input, read from `content/digests/YYYY/MM/DD/daily.md`
- **KOI MCP** — weekly digest, search, entity relationships
- **Ledger MCP** — on-chain governance, ecocredits, supply, marketplace
- **WebSearch** — current events for the Forward Look section
- **Template** — section structure from `templates/weekly/`

## Output

A markdown file at `content/digests/YYYY/MM/weekly/YYYY-WNN.md` with frontmatter,
plus terminal output of the same content.
