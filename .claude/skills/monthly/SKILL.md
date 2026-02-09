---
name: monthly
description: Generate a monthly digest distilling weeklies into trend analysis and narrative arcs
---

Generate a structured monthly digest that synthesizes weekly digests and fresh MCP data
into a structural analysis of the Regen ecosystem for a given month.

## Behavior

1. Parse arguments:
   - `--month YYYY-MM` — month to generate for (defaults to current month)
   - `--template name` — use a specific template (defaults to the value in
     `settings.json` at `defaults.template.monthly`)
   - `--character name` — voice the digest through a character persona
2. Determine the target month
3. Load the template from `templates/monthly/{name}.md`
4. Read the template's `rollup` and `comparison` frontmatter
5. Read all weekly digests within the target month from `content/digests/`
6. For each section, query data sources and synthesize from weeklies:

   **Month in Review:**
   - Read weekly digests in chronological order
   - Identify structural shifts that only become visible at the monthly scale
   - Not a summary of weeklies — a synthesis of what changed this month

   **Governance Arc:**
   - `ledger: list_governance_proposals` — fresh state
   - Trace governance proposals from introduction to resolution
   - Identify governance patterns: participation trends, contentious topics

   **Credit Market Evolution:**
   - `ledger: analyze_market_trends` — month-long trend analysis
   - `ledger: list_credit_batches` — full month's issuances
   - Narrative: how the credit market moved this month, new entrants, volume

   **Community Health:**
   - `koi: search` — community activity, forum engagement, GitHub contributions
   - Extract community signals from weekly digests
   - Narrative: is the community growing, contracting, shifting focus?

   **Strategic Questions:**
   - Synthesize open questions from weekly Forward Look sections
   - Compare with previous month's strategic questions — which were answered?
   - Pose new questions that emerged from this month's data

7. Synthesize into a monthly digest that identifies structural shifts, not just events
8. If `--character` is specified, load the character skill and voice the digest
9. Write YAML frontmatter:

   ```yaml
   ---
   title: "Monthly Heartbeat — {YYYY-MM}"
   date: {YYYY-MM-DD}  # first day of the month
   month: {YYYY-MM}
   template: {template-name}
   character: {character-name or null}
   cadence: monthly
   weeklies_consumed: [list of weekly digest paths]
   sources:
     koi: true
     ledger: true
     web: true
     historic: true
   ---
   ```

10. Write to `content/digests/YYYY/MM/monthly/monthly.md` (create directories as needed)
11. Also render the full digest to the terminal

## Example Invocations

```
/monthly
/monthly --month 2026-02
/monthly --character gaia
/monthly --template default --character narrator
```

## Data Sources

- **Historic weeklies** — primary input, read from `content/digests/YYYY/MM/weekly/`
- **KOI MCP** — search, entity relationships, community activity
- **Ledger MCP** — on-chain governance, ecocredits, supply, marketplace trends
- **WebSearch** — strategic context from the broader ecosystem
- **Template** — section structure from `templates/monthly/`

## Output

A markdown file at `content/digests/YYYY/MM/monthly/monthly.md` with frontmatter,
plus terminal output of the same content.
