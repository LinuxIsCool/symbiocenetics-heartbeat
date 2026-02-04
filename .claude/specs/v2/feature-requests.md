# Phase 2 — Feature Requests

A living document. Ideas captured here are candidates for Phase 2 and beyond.
Each entry describes the intent, the composable commands involved, and how
it connects to the rest of the system. Nothing here is committed to the
roadmap until it gets promoted to a spec.

---

## 1. Meta-Reports: System Self-Reflection

**Intent:** Every time a digest is generated, the system should also produce a
meta-report — a reflection on how the digestion process itself went. This is
not about the Regen ecosystem; it is about the observatory. How are the MCP
tools performing? Did any queries return empty or unexpected results? Were
there gaps in coverage? What worked well? What felt brittle?

The first daily digest (`2026/02/02/daily.md`) was accompanied by a case study
(`case-study-phase-1.md`) that served exactly this function: it documented what
happened during the generation process, what the MCP tools returned, what the
data quality looked like, and what the system learned about itself. That case
study was manual. This feature makes it automatic.

**What a meta-report covers:**

- **Data source health.** Which MCP tools were called, what they returned, and
  whether the responses were useful. Empty results, timeouts, or unexpected
  shapes get flagged. Over time this builds a record of MCP reliability.
- **Coverage assessment.** Did the template sections get adequate data? Were
  any sections thin? Did the agent have to improvise or work around missing
  information?
- **Quality signals.** How fresh was the KOI data? Were governance proposals
  current? Did web search return relevant results or noise?
- **Process observations.** What was interesting about the generation process
  itself — surprising connections the agent made, data that contradicted
  expectations, or patterns that only become visible when you pull all the
  sources together.
- **Improvement suggestions.** Concrete recommendations: a new search topic
  for settings.json, a template section that should be restructured, a doc
  that needs updating, an MCP tool that should be used differently.

**Output:** `content/digests/YYYY/MM/DD/meta.md` (sibling to the digest file).
Same temporal hierarchy as digests. Published on the Quartz site — the system's
health is public, not hidden.

**Command:** `/meta` — can be run standalone or invoked automatically as part
of `/daily`, `/weekly`, etc. When run standalone, it reflects on the most
recent digest at the specified cadence. When integrated, it runs immediately
after digest generation while the context is fresh.

**Composability:**
```
/daily → generates digest → /meta → generates meta-report
/daily --skip-meta → generates digest only
/meta --cadence daily → reflects on most recent daily
/meta --date 2026-02-02 → reflects on a specific digest
```


## 2. Opportunistic Doc Improvement

**Intent:** Each digest generation cycle is a learning event. The agent queries
MCP tools, reads templates, navigates the knowledge base, and synthesizes
data — in the process, it develops fresh insight into how the system works,
where the docs are inaccurate, and what a newcomer would struggle with. This
feature harnesses that learning by selecting 2-3 documents to improve after
each digest cycle.

The selection is not random. It is motivated by what the agent just learned:

- If a template section was hard to fill, the corresponding guide or reference
  might need better examples.
- If an MCP tool returned data in an unexpected shape, the reference doc for
  that tool should be updated.
- If the meta-report flagged a coverage gap, the relevant tutorial might need
  a new section.
- If the digest synthesis revealed a connection between concepts that is not
  documented, an explanation page could be enriched.

This creates a virtuous cycle: digests improve docs, better docs improve
future digests.

**Scope per cycle:** 2-3 documents maximum. Small, focused improvements —
not rewrites. A corrected parameter description. A new example query. An
updated tool response shape. A clarified explanation. The kind of incremental
refinement that compounds over weeks and months.

**Command:** `/improve-docs` — selects documents and improves them. Can be
run standalone or invoked as part of the post-digest pipeline.

**Composability:**
```
/daily → /meta → /improve-docs
/improve-docs --count 3 → improve 3 docs based on most recent digest
/improve-docs --focus reference → only consider reference docs
/improve-docs --dry-run → show what would be improved without editing
```

**Selection logic:**

1. Read the most recent digest and meta-report
2. Identify friction points, gaps, or newly-learned information
3. Score candidate documents by relevance to those findings
4. Select the top 2-3 candidates
5. Make targeted improvements (not rewrites)
6. Log what was changed and why in the meta-report or a changelog

**What gets logged:** Each improvement is recorded — which doc, what changed,
and what motivated the change. Over time this creates a record of how the
documentation evolves in response to operational experience.


## 3. Composable Post-Digest Pipeline

**Intent:** The features above — meta-reports and doc improvement — are
instances of a more general pattern: things the system should do after
generating a digest. Rather than hardcoding a specific sequence, we should
design a composable pipeline that can be configured and extended.

The pipeline runs after any digest generation command:

```
/daily → [digest] → /meta → [meta-report] → /improve-docs → [doc updates]
```

Each step is an independent command that can run standalone. The pipeline
is the default, but any step can be skipped or run separately.

**Configuration in settings.json:**

```json
{
  "pipeline": {
    "daily": ["meta", "improve-docs"],
    "weekly": ["meta", "improve-docs"],
    "monthly": ["meta"],
    "yearly": ["meta"]
  }
}
```

This keeps the commands simple and composable:

- `/daily` does one thing well: generate a daily digest
- `/meta` does one thing well: reflect on the generation process
- `/improve-docs` does one thing well: find and fix documentation
- The pipeline chains them together

Each command reads from the artifacts of the previous step. `/meta` reads
the digest. `/improve-docs` reads both the digest and the meta-report. New
pipeline steps can be added without modifying existing commands.

**Future pipeline steps (not yet specified):**

- `/commit-digest` — auto-commit and push digest, meta-report, and doc
  updates as a single atomic commit
- `/notify` — post a summary to Discord, Telegram, or a webhook
- `/index` — update the Quartz site index and tag pages
- `/compare` — compare with the same period in previous cycles


---

## Design Principles

These features share a philosophy:

1. **Simple commands that compose.** Each command does one thing. Pipelines
   chain them. Configuration determines which steps run.

2. **Learning from doing.** The system improves itself through operational
   experience, not through manual maintenance cycles.

3. **Transparency.** Meta-reports are public. Doc improvement logs are
   visible. The system's self-assessment is part of the published record.

4. **Incrementalism.** 2-3 docs per cycle. One meta-report per digest. Small
   improvements that compound. No grand rewrites.

5. **Motivated change.** Nothing changes without a reason. Every doc
   improvement traces to a specific operational observation. Every meta-report
   captures concrete findings, not abstract self-congratulation.
