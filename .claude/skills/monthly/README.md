# Monthly Digest Skill

The `/monthly` command operates at the scale where individual events fade and structural shifts come into focus. A governance proposal that dominated daily digests for two weeks becomes a single line in the monthly summary — what matters now is whether it passed, what it changed, and what it signals about the direction of the network. Ecocredit projects that registered in week one and issued their first batch in week three become a complete arc. The monthly cadence is where the ecosystem's structural metabolism becomes visible.

The command accepts three flags:

- `--month YYYY-MM` specifies which month to generate for. Defaults to the current month.
- `--template name` selects which template to use from [templates/monthly/](../../../templates/monthly/). Defaults to whatever is configured in [settings.json](../../../settings.json) under `defaults.template.monthly`.
- `--character name` voices the digest through a character persona, loading the appropriate skill and output style.

When invoked, the skill reads all weekly digests within the target month from the archive. These weeklies are the primary input — the monthly digest distills weekly patterns into monthly trajectories. The skill also runs fresh queries against the KOI and Ledger MCPs to supplement the rollup data and catch anything the weekly digests may have missed or that only becomes significant in retrospect.

The template's `rollup.source_cadence: weekly` tells the skill to read weekly digests as primary input. The `comparison.period: previous month` directs month-over-month comparison. Each section serves a distinct analytical function: **Month in Review** synthesizes the month's trajectory. **Governance Arc** traces proposals from introduction to resolution. **Credit Market Evolution** identifies market movements across the full month. **Community Health** reads the pulse of the ecosystem's human layer. **Strategic Questions** carries forward the living thread of open questions — which were answered, which deepened, which are new.

The finished digest is written to `content/digests/YYYY/MM/monthly/monthly.md` with frontmatter recording which weekly digests were consumed. This provenance metadata is essential for the yearly cadence, which reads monthly digests to construct its annual narrative.

The monthly cadence runs on the 1st and 15th of each month — a rhythm that divides the month into two natural halves and aligns well with governance cycles and project milestones.
