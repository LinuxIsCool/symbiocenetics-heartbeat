---
name: yearly
description: Generate a yearly digest synthesizing monthlies into an annual narrative and retrospective
---

Generate a long-form yearly digest that synthesizes monthly digests and fresh MCP data
into an annual narrative of the Regen ecosystem's transformation.

## Behavior

1. Parse arguments:
   - `--year YYYY` — year to generate for (defaults to current year)
   - `--template name` — use a specific template (defaults to the value in
     `settings.json` at `defaults.template.yearly`)
   - `--character name` — voice the digest through a character persona
2. Determine the target year
3. Load the template from `templates/yearly/{name}.md`
4. Read the template's `rollup` and `comparison` frontmatter
5. Read all monthly digests within the target year from `content/digests/`
6. For each section, query data sources and synthesize from monthlies:

   **Annual Narrative:**
   - Read monthly digests in chronological order
   - Identify the year's defining story — the arc that connects January to December

   **Key Milestones:**
   - Extract the most significant events from monthly digests
   - Rank by impact and significance
   - Note which month each milestone occurred and why it mattered

   **Quantitative Retrospective:**
   - `ledger: get_total_supply` — year-end vs year-start supply
   - `ledger: list_classes` — credit classes added this year
   - `ledger: list_projects` — projects registered this year
   - Aggregate metrics from monthly digests

   **Governance Evolution:**
   - Trace the year's governance arc: how many proposals, what categories,
     what passed, what failed, what changed about how the network governs itself

   **Ecocredit Market Annual Review:**
   - Year-over-year credit issuance, retirement, and marketplace trends
   - `ledger: analyze_market_trends` — annual trend data
   - `ledger: list_credit_batches` — full year's issuances

   **Ecosystem Growth:**
   - Community size, activity, and engagement over the year
   - `koi: search` — new partnerships, projects, and initiatives
   - New partnerships, projects, and initiatives

   **Year-Ahead Outlook:**
   - Extrapolate trends. Identify opportunities and risks
   - Web search for emerging developments in climate finance, crypto governance,
     and regenerative economics
   - Pose the 5-7 questions that will define the next year

7. Synthesize into a yearly digest that reads as a definitive annual narrative
8. If `--character` is specified, load the character skill and voice the digest
9. Write YAML frontmatter:

   ```yaml
   ---
   title: "Yearly Heartbeat — {YYYY}"
   date: {YYYY-MM-DD}  # date of generation
   year: {YYYY}
   template: {template-name}
   character: {character-name or null}
   cadence: yearly
   monthlies_consumed: [list of monthly digest paths]
   sources:
     koi: true
     ledger: true
     web: true
     historic: true
   ---
   ```

10. Write to `content/digests/YYYY/yearly/yearly.md` (create directories as needed)
11. Also render the full digest to the terminal

## Example Invocations

```
/yearly
/yearly --year 2025
/yearly --character gaia
/yearly --template default --character narrator
```

## Data Sources

- **Historic monthlies** — primary input, read from `content/digests/YYYY/MM/monthly/`
- **KOI MCP** — search, entity relationships, ecosystem activity
- **Ledger MCP** — on-chain governance, ecocredits, supply, marketplace
- **WebSearch** — forward-looking context for the Year-Ahead Outlook
- **Template** — section structure from `templates/yearly/`

## Output

A markdown file at `content/digests/YYYY/yearly/yearly.md` with frontmatter,
plus terminal output of the same content.
