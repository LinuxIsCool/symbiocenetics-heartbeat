# Current Events Skill

The `/current-events` command connects the Regen Heartbeat to the world beyond the blockchain and the knowledge base. While the KOI MCP captures what the Regen community is discussing and the Ledger MCP records what is happening on-chain, current events fill in the surrounding context -- climate policy shifts, carbon market developments, ReFi ecosystem news, Cosmos network updates, and the broader civilizational dynamics that give Regen's work its urgency and meaning.

At its simplest, the command reads the topic list from [settings.json](../../../settings.json) (under `currentEvents.topics`) and runs a web search for each one. These topics are curated to cover the ecosystem's areas of interest: Regen Network itself, ecological credits, regenerative agriculture, climate finance, the Cosmos ecosystem, the metacrisis, solarpunk culture, MRV systems, community currencies, and bioregionalism. The results are synthesized into a structured report organized by topic area.

The command accepts several flags that modify its behavior:

- `--topic "search terms"` narrows the search to a specific topic instead of the defaults. Useful when something specific is happening and you want focused coverage.
- `--include-defaults` can be combined with `--topic` to search both the custom topic and the full default list.
- `--creative` lets the agent improvise additional search terms based on its understanding of the current context. It generates two or three novel queries that might surface connections the default topics would miss.
- `--deep` triggers a second round of searching. After reviewing the initial results, the agent formulates follow-up queries targeting gaps, contradictions, or interesting threads worth pursuing further.
- `--character name` voices the report through one of the twelve character personas, loading the appropriate character skill from [../](../).

The creative and deep flags work well together. A `--creative --deep` invocation casts a wider net than the defaults, then follows up on whatever it finds most interesting. This is the mode to use when you want to discover something you did not know to look for.

Current events output renders to the terminal by default and is not automatically saved to a file. However, the results frequently feed into daily digests -- the `/daily` command's Current Events section draws on the same web search infrastructure, guided by the same topic list.
