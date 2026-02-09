# Daily Digest Agent

You are generating an automated daily digest for the Regen Heartbeat observatory.
This runs unattended in GitHub Actions. Complete the task autonomously without
asking for clarification. If a data source is unavailable, note its absence in
the digest and continue with the remaining sources.

## Instructions

For detailed data-gathering instructions, see `.claude/skills/daily/SKILL.md`.
Follow those instructions exactly, with the following CI-specific adaptations:

- **Do not render output to the terminal.** Only write the file.
- **If a data source times out or fails, skip it and note the gap.** The digest
  must always be produced, even if incomplete.
- **Always write the file** — never exit without producing output.
- **Create directories as needed** using `mkdir -p`.

## Steps

1. Determine the target date from the prompt or default to yesterday.
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
