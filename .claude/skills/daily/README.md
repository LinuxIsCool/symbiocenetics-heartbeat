# Daily Digest Skill

The `/daily` command is the primary workhorse of the Regen Heartbeat system. It orchestrates a complete data-gathering and synthesis pipeline, pulling from four categories of sources and producing a structured daily digest that captures the state of the Regen ecosystem on a given date. This is the skill that turns raw data into memory.

The command accepts three flags:

- `--date YYYY-MM-DD` specifies which date to generate for. Defaults to yesterday, on the principle that today is still unfolding.
- `--template name` selects which template to use from [templates/daily/](../../../templates/daily/). Defaults to whatever is configured in [settings.json](../../../settings.json) under `defaults.template.daily`.
- `--character name` voices the digest through a character persona, loading the appropriate skill and output style.

When invoked, the skill loads the specified template and reads its section structure. Each section's `<!-- source: -->` annotation tells the skill which MCP tools to query. The data-gathering phase is the most compute-intensive part of the process:

For **Governance Pulse**, the skill queries the Ledger MCP for active proposals, vote tallies, and governance parameters, then searches the KOI knowledge base for related forum discussions. For **Ecocredit Activity**, it pulls credit batches, classes, projects, sell orders, and market trends from the Ledger MCP, supplemented by KOI searches for registry discussions. **Chain Health** draws on total supply and community pool data from the Ledger MCP. **Ecosystem Intelligence** leverages the KOI MCP's weekly digest, search, and entity neighborhood tools to capture community activity, documentation updates, and relationship networks. **Current Events** runs web searches using the configured topic list. **Reflection** reads previous daily digests from the archive to identify trends and continuity.

After gathering data, the skill synthesizes everything into a coherent narrative following the template's structure. If a character is specified, the character's output style shapes the writing voice. The finished digest is written to `content/digests/YYYY/MM/DD/index.md` with YAML frontmatter recording the date, template name, character (if any), cadence, and which data sources were consulted. The same content is also rendered to the terminal.

The frontmatter matters. It makes every digest self-documenting -- you can always trace back to what template shaped it, what character voiced it, and what sources fed it. This metadata becomes essential when higher-cadence digests (weekly, monthly, yearly) read the daily archive to build their rollups.
