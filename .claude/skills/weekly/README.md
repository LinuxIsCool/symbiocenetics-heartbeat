# Weekly Digest Skill

The `/weekly` command sits at the critical inflection point in the temporal hierarchy. Daily digests capture everything. Weekly digests are where raw signal first crystallizes into pattern. The job is not to repeat what happened each day but to notice what happened across days — the proposal that gained momentum Tuesday through Thursday, the ecocredit batch that completed a trend started last week, the forum discussion that shifted from curiosity to consensus.

The command accepts three flags:

- `--week YYYY-WNN` specifies which ISO week to generate for. Defaults to the current week.
- `--template name` selects which template to use from [templates/weekly/](../../../templates/weekly/). Defaults to whatever is configured in [settings.json](../../../settings.json) under `defaults.template.weekly`.
- `--character name` voices the digest through a character persona, loading the appropriate skill and output style.

When invoked, the skill first determines the date range for the target week (Monday through Sunday) and reads all daily digests within that range from the archive. These dailies are the primary input — the weekly digest is fundamentally a rollup, distilling multiple daily observations into a higher-level analysis. But the skill also runs fresh queries against the KOI and Ledger MCPs, because some things become visible only when you ask the question at a different temporal scale.

The template's `rollup` and `comparison` frontmatter fields guide the synthesis. The `rollup.source_cadence: daily` tells the skill to read daily digests as primary input. The `comparison.period: previous week` directs it to compare this week's observations against the previous week's weekly digest, if one exists. These are instructions to Claude, not executable configuration — they shape how the generating agent thinks about the data.

Each section in the weekly template serves a distinct synthesis function. **Week in Review** transforms daily observations into weekly narrative. **Governance Summary** traces governance threads across the week's dailies and supplements with fresh chain data. **Ecocredit Trends** aggregates credit activity into weekly deltas. **Ecosystem Narrative** pulls from KOI's own weekly digest and the daily ecosystem intelligence sections. **Forward Look** identifies open threads and connects them to upcoming events.

The finished digest is written to `content/digests/YYYY/MM/weekly/YYYY-WNN.md` with frontmatter that records which daily digests were consumed in the rollup. This metadata is essential for the monthly cadence, which will read weekly digests and need to understand their provenance.

The weekly cadence runs on Monday, Wednesday, and Friday — frequent enough to stay current, sparse enough to allow patterns to emerge between issues.
