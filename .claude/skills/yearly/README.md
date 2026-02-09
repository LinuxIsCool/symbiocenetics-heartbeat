# Yearly Digest Skill

The `/yearly` command operates at the deepest register of the temporal hierarchy. A year is long enough for transformation. Projects that began as proposals become operational. Governance frameworks that were contentious become settled. New credit classes mature from experimental to established. Yearly digests exist to capture these arcs — not the daily noise, not the weekly patterns, not even the monthly trends, but the fundamental changes in what the Regen ecosystem is and where it is going.

The command accepts three flags:

- `--year YYYY` specifies which year to generate for. Defaults to the current year.
- `--template name` selects which template to use from [templates/yearly/](../../../templates/yearly/). Defaults to whatever is configured in [settings.json](../../../settings.json) under `defaults.template.yearly`.
- `--character name` voices the digest through a character persona, loading the appropriate skill and output style.

When invoked, the skill reads all monthly digests within the target year from the archive. These monthlies are the primary input — the yearly digest synthesizes monthly trajectories into an annual narrative. Fresh queries to the KOI and Ledger MCPs provide definitive year-end figures and catch anything the monthly digests may have missed.

The template's `rollup.source_cadence: monthly` directs the skill to read monthly digests as primary input. The `comparison.period: previous year` enables year-over-year analysis when previous yearly digests exist. Each section serves a distinct retrospective function: **Annual Narrative** identifies the year's defining story. **Key Milestones** ranks the most impactful events. **Quantitative Retrospective** provides hard numbers. **Governance Evolution** traces how decision-making matured. **Ecocredit Market Annual Review** analyzes the credit economy's trajectory. **Ecosystem Growth** maps the community's expansion. **Year-Ahead Outlook** extrapolates trends and poses the questions that will matter next year.

The finished digest is written to `content/digests/YYYY/yearly/yearly.md` with frontmatter recording which monthly digests were consumed.

The yearly cadence is aligned with the calendar's natural turning points — solstices, equinoxes, and New Year. These dates carry cultural weight, mark seasonal transitions, and invite the kind of reflective, integrative thinking that yearly digests embody. Yearly digests are triggered manually via `workflow_dispatch`, not on a cron schedule.
