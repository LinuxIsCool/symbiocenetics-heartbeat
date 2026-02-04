---
title: KOI MCP Tool Reference
description: Complete reference for all tools in the Regen KOI MCP server
---

# KOI MCP Tool Reference

The Regen KOI (Knowledge Organization Infrastructure) MCP server provides twenty-three tools for accessing Regen Network's comprehensive knowledge base. These tools span search capabilities, code graph queries, entity resolution, repository exploration, metadata operations, and system utilities.

KOI indexes knowledge from twelve active sensors monitoring platforms including GitHub, GitLab, Discourse forums, Medium, Telegram, Discord, Twitter, podcasts, Notion, and the Regen blockchain itself. The system maintains 48,000+ documents, 26,768 code entities, and 614,000+ entity-chunk associations in a unified knowledge graph.

This reference documents each tool with its parameters, return format, usage examples, and role in digest generation workflows.

---

## Search & Discovery

### search

The primary search tool for the Regen Network knowledge base. Uses the backend's Hybrid RAG system which automatically combines vector search (semantic similarity via BGE embeddings), entity search (entity-chunk links with 614K+ associations), and keyword search (lexical matching). Results are ranked using Weighted Average Fusion with entity boosting.

This is the most powerful and flexible search tool — it understands natural language queries, recognizes entity names, respects date filters, and automatically optimizes the search strategy based on query content.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | **required** | Natural language search query (1-500 characters) |
| `intent` | enum | `general` | Query intent for optimized retrieval: `general`, `person_activity`, `person_bio`, `technical_howto`, `concept_explain` |
| `source` | string | — | Filter by data source (e.g., `notion`, `github`, `discourse`). Supports prefix matching. |
| `sort_by` | enum | `relevance` | Sort order: `relevance`, `date_desc` (newest first), `date_asc` (oldest first) |
| `limit` | number | 10 | Maximum results to return (1-50) |
| `published_from` | string | — | Filter: published on/after this date (YYYY-MM-DD) |
| `published_to` | string | — | Filter: published on/before this date (YYYY-MM-DD) |
| `include_undated` | boolean | false | Include documents with no publication date when using date filters |

**Intent Types:**

The `intent` parameter enables intent-aware retrieval for better results on specific query types:

- **`general`**: Standard hybrid search (default)
- **`person_activity`**: "What is X working on?" queries — triggers author search to find docs **authored by** the person
- **`person_bio`**: "Who is X?" queries — prioritizes biographical content
- **`technical_howto`**: "How do I...?" implementation questions — prioritizes code and technical docs
- **`concept_explain`**: "What is X?" conceptual questions — prioritizes explanatory content

**Return Shape:**

Returns markdown-formatted results with document snippets, similarity scores, sources, and URLs. Each result includes the document title, content preview, publication date, and source platform.

**Example:**

```
search(
  query="governance proposal voting procedures",
  intent="technical_howto",
  source="github",
  limit=10
)
```

**Digest Usage:**

The `search` tool is the workhorse of digest generation. Use it to:

- Find recent activity by date range: `search(query="...", published_from="2026-01-27", published_to="2026-02-03")`
- Discover what people are working on: `search(query="Gregory Landua", intent="person_activity")`
- Retrieve conceptual explanations: `search(query="credit retirement", intent="concept_explain")`
- Filter to specific platforms: `search(query="governance", source="discourse")`

For weekly digests, combine date filtering with source filtering to segment activity by platform. For personalized summaries, use `intent="person_activity"` to find contributions from specific people.

---

### search_github_docs

Search Regen Network GitHub repositories for documentation, README files, configuration files, and technical content. Searches `regen-ledger` (blockchain), `regen-web` (frontend), `regen-data-standards` (schemas), and `regenie-corpus` (documentation corpus).

This tool is specialized for code documentation and repository-level technical content. For semantic search across all knowledge sources, use the `search` tool instead.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | **required** | Search query (1-300 characters) |
| `repository` | enum | all repos | Filter by specific repo: `regen-ledger`, `regen-web`, `regen-data-standards`, `regenie-corpus` |
| `limit` | number | 10 | Maximum results (1-20) |

**Return Shape:**

Returns markdown-formatted list of matching documents with file paths, repository names, and content previews.

**Example:**

```
search_github_docs(
  query="ecocredit module architecture",
  repository="regen-ledger",
  limit=5
)
```

**Digest Usage:**

Use this tool when generating digests that focus on code changes, technical documentation updates, or repository-specific activity. Ideal for developer-focused digests where you need to highlight changes to specs, README files, or architectural documentation.

---

### generate_weekly_digest

Generate a markdown digest of Regen Network activity and discussions for a specified time period. This tool aggregates data from multiple sources including Discourse forum discussions, GitHub activity (commits, PRs, issues), on-chain governance proposals and votes, credit issuance/retirement metrics, and community channels.

The output is a curated markdown brief with executive summary, governance analysis, community discussions, and on-chain metrics. This is a condensed overview — use `get_notebooklm_export` for full content with complete forum posts and Notion pages.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `start_date` | string | 7 days ago | Start of date range (YYYY-MM-DD) |
| `end_date` | string | today | End of date range (YYYY-MM-DD) |
| `save_to_file` | boolean | false | Save to file on disk |
| `output_path` | string | auto | Custom file path (if `save_to_file=true`). Defaults to `weekly_digest_YYYY-MM-DD.md` |
| `format` | enum | `markdown` | Output format: `markdown` (human-readable report) or `json` (structured data) |

**Return Shape:**

Returns a markdown digest with sections for highlights, activity by module, governance updates, community discussions, and on-chain metrics. If `save_to_file=true`, also saves to disk and returns the file path.

**Example:**

```
generate_weekly_digest(
  start_date="2026-01-27",
  end_date="2026-02-03",
  save_to_file=true,
  output_path="/tmp/weekly.md"
)
```

**Digest Usage:**

This tool can serve as a template or starting point for custom digest generation. Examine its output structure to understand what sections are useful, then build your own digest workflows using the lower-level search tools for more control.

---

### get_notebooklm_export

Get the full NotebookLM export with complete content including full forum thread posts, complete Notion page content (all chunks), enriched URLs, and detailed source material. Automatically saves to a local file to avoid bloating LLM context. Returns the file path and summary stats.

This is the comprehensive version of digest content — use this when you need the full text of everything, not summaries.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `output_path` | string | auto | Custom file path for saving. Defaults to `notebooklm_export_YYYY-MM-DD.md` |

**Return Shape:**

Returns the file path and summary statistics (total word count, document count, sources). The actual content is written to the file, not returned inline.

**Example:**

```
get_notebooklm_export(output_path="/tmp/export.md")
```

**Digest Usage:**

Use this tool when you need to archive a full snapshot of the knowledge base for external processing (like NotebookLM for podcast generation), or when you want to perform deep analysis on complete documents rather than summaries.

---

### get_full_document

Retrieve the complete content of a document by its RID (Resource Identifier) and save it to a local file. Useful for getting full text of documents found via search without bloating the LLM context window.

Supports chunk RID resolution (automatically resolves chunk references to parent documents), privacy filtering (respects authentication), and chunk reassembly fallback (reconstructs documents from chunks if needed).

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `rid` | string | **required** | Document RID to retrieve (can be base doc or chunk RID) |
| `output_path` | string | `document_<hash>.md` | Custom file path for saving |
| `include_metadata_header` | boolean | true | Include YAML frontmatter with rid, title, url, source, published_at |

**Return Shape:**

Returns a summary with file path, file size, word count, source platform, and content source strategy (direct, chunks, or legacy_chunks). The document content is written to the file.

**Example:**

```
get_full_document(
  rid="orn:notion.page:regen/2f725b77-eda1-807d-a63e-c43e6145f7f1",
  output_path="/tmp/meeting-notes.md",
  include_metadata_header=true
)
```

**Digest Usage:**

Use this tool after running `search` to retrieve the complete text of high-value documents identified in search results. This is particularly useful for deep dives on specific topics or for including full source citations in premium digests.

---

## Graph & Entities

### query_code_graph

Search the code knowledge graph with supported query types for exploring entities, relationships, modules, concepts, and call graphs. This tool queries the Apache AGE graph database directly, providing precise access to code structure and relationships.

Use this for impact analysis, understanding code relationships, finding documentation for specific code entities, and tracing dependencies.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query_type` | enum | **Yes** | Type of graph query to execute (see Query Types below) |
| `entity_name` | string | Conditional | Name of entity to search for |
| `entity_type` | string | Conditional | Type of entity (Function, Struct, Interface, Handler, Keeper, etc.) |
| `doc_path` | string | No | Reserved (doc→entity queries not currently supported via `/graph`) |
| `repo_name` | string | No | Filter by repository name |
| `module_name` | string | Conditional | Name of module/package |
| `from_entity` | string | Conditional | Starting entity name for trace_call_chain |
| `to_entity` | string | Conditional | Target entity name for trace_call_chain |
| `limit` | number | 50 | Maximum number of results (1-200) |
| `offset` | number | 0 | Number of results to skip for pagination |
| `max_depth` | number | 4 | Maximum depth for call chain tracing (1-8) |

**Query Types:**

| query_type | Description | Required Params |
|------------|-------------|-----------------|
| `list_repos` | List all indexed repositories | None |
| `find_by_type` | Find all entities of a specific type | `entity_type` |
| `search_entities` | Search for entities by name | `entity_name` |
| `keeper_for_msg` | Find keeper that handles a message | `entity_name` |
| `msgs_for_keeper` | Find messages handled by keeper | `entity_name` |
| `related_entities` | Find related entities | `entity_name` |
| `list_entity_types` | List all entity types with counts | None |
| `get_entity_stats` | Get comprehensive statistics | None |
| `list_concepts` | List available high-level concepts | None |
| `explain_concept` | Explain a concept | `entity_name` |
| `find_concept_for_query` | Find relevant concepts for a query | `entity_name` |
| `find_callers` | Find all functions that call this entity | `entity_name` |
| `find_callees` | Find all functions called by this entity | `entity_name` |
| `find_call_graph` | Get local call graph (callers + callees) | `entity_name` |
| `list_modules` | List all modules in a repo | `repo_name` (optional) |
| `get_module` | Get details for a specific module | `module_name` |
| `search_modules` | Search modules by keyword | `entity_name` |
| `module_entities` | Get entities in a module | `module_name` |
| `module_for_entity` | Find module containing entity | `entity_name` |
| `trace_call_chain` | Find path from from_entity to to_entity | `from_entity`, `to_entity` |
| `find_orphaned_code` | Find code without callers | None |

**Return Shape:**

Returns markdown-formatted results with entity names, types, file paths, line numbers, signatures, and relationships. The format varies by query type but always includes actionable information like file locations and code structure.

**Example:**

```
query_code_graph(query_type="find_callers", entity_name="CreateBatch")
```

**Digest Usage:**

Use this tool for technical digests that highlight code changes, architectural decisions, or dependency impacts. For example:

- Find all handlers in a module: `query_type="find_by_type", entity_type="Handler"`
- Trace impact of a change: `query_type="find_callers", entity_name="CreateBatch"`
- Show module structure: `query_type="get_module", module_name="x/ecocredit"`

---

### resolve_entity

Resolve an ambiguous label to a canonical KOI entity. Returns ranked matches with URIs, types, and confidence scores. Use this when you have a label (like "ethereum" or "regen commons") and need to find the exact entity in the knowledge graph.

This is the first step in working with the entity graph — disambiguate the label, get the canonical URI, then use that URI for neighborhood queries and document lookups.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `label` | string | **required** | The label to resolve (e.g., "ethereum", "notion", "regen commons") |
| `type_hint` | string | — | Optional type hint to narrow results (e.g., "TECHNOLOGY", "ORGANIZATION", "PERSON") |
| `limit` | number | 5 | Maximum number of candidates to return (1-20) |

**Return Shape:**

Returns a ranked list of entity candidates with URIs, labels, types, and confidence scores. Each candidate includes enough information to determine which entity the label refers to.

**Example:**

```
resolve_entity(label="ethereum", type_hint="TECHNOLOGY")
```

**Digest Usage:**

Use this tool to disambiguate entity names before querying relationships or documents. Useful when building entity-centric digests or when you need to verify that a search query is referring to the correct conceptual entity.

---

### get_entity_neighborhood

Get the graph neighborhood of an entity — its direct relationships and connected entities. Returns edges with predicates (like "mentions", "relates_to") and neighboring nodes. Useful for understanding context and connections.

This tool reveals the web of relationships around a concept, showing what it's connected to and how. It's the graph equivalent of "tell me everything you know about X."

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `label` | string | conditional | Entity label to look up (will be resolved if ambiguous) |
| `uri` | string | conditional | Entity URI (preferred if known, e.g., from resolve_entity) |
| `type_hint` | string | — | Optional type hint for disambiguation when using label |
| `direction` | enum | `both` | Edge direction: `out` (entity→neighbors), `in` (neighbors→entity), or `both` |
| `limit` | number | 20 | Maximum number of edges to return (1-100) |

**Note:** Either `label` or `uri` is required.

**Return Shape:**

Returns a list of edges with predicates and neighboring entities. Each edge shows the relationship type and the connected entity with its label and type.

**Example:**

```
get_entity_neighborhood(label="regen network", limit=50)
```

**Digest Usage:**

Use this tool to explore conceptual relationships when building thematic digests. For example, to understand the ecosystem around "credit retirement," query its neighborhood to find related concepts, technologies, and organizations. This reveals connections that might not be obvious from document search alone.

---

### get_entity_documents

Get documents associated with an entity. Returns document references (chunks) that mention or relate to the entity. Respects privacy: unauthenticated requests only see public documents.

This is the bridge from concepts to source material — given an entity, find all the documents that discuss it.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `label` | string | conditional | Entity label to look up |
| `uri` | string | conditional | Entity URI (preferred if known) |
| `type_hint` | string | — | Optional type hint for disambiguation |
| `limit` | number | 10 | Maximum number of documents to return (1-50) |

**Note:** Either `label` or `uri` is required.

**Privacy:**

- Without authentication: returns public documents only
- With `regen_koi_authenticate`: includes private Notion workspace content

**Return Shape:**

Returns a list of document chunks that mention the entity, with RIDs, content previews, sources, and publication dates.

**Example:**

```
get_entity_documents(label="ethereum", limit=20)
```

**Digest Usage:**

Use this tool to find source material for entity-centric digests. For example, to write a section on "what's happening with blockchain integrations," resolve the "blockchain" entity, get its documents, and summarize recent activity.

---

### sparql_query

Execute raw SPARQL queries against the Regen Knowledge Graph (Apache Jena). Power tool for advanced graph investigations. Use for complex queries not covered by other tools. Prefer `/api/koi/graph` for simple entity lookups or `/api/koi/entity` for resolving labels.

This is the escape hatch for expert users who need direct access to the RDF triple store.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | **required** | The SPARQL query to execute (must be a valid SELECT query) |
| `format` | enum | `json` | Output format: `json` (structured data) or `table` (human-readable rendering) |
| `limit` | number | 100 | Maximum result rows to return (1-1000). Overrides LIMIT in query if lower. |
| `timeout_ms` | number | 30000 | Query timeout in milliseconds (1000-60000) |

**Return Shape:**

Returns SPARQL results in the requested format. JSON format returns structured bindings. Table format returns a human-readable ASCII table.

**Example:**

```
sparql_query(
  query="SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10",
  format="table"
)
```

**Digest Usage:**

Advanced use only. Use this when you need to construct custom graph queries that aren't covered by the standard tools. For example, to find all entities of a custom type or to trace complex multi-hop relationships.

---

## RID Operations

### parse_rid

Parse a KOI Resource Identifier (RID) into its components per the rid-lib specification. Stateless — no backend call. Returns: valid (boolean), error (string if invalid), scheme, namespace (null for URI schemes), context (scheme:namespace for ORN/URN, or just scheme for URI schemes like https), reference, rid_type (best-effort heuristic - may be null), uri_components (for HTTP/HTTPS), source_inferred (e.g., "github", "notion" - heuristic).

This tool helps you understand RID structure and validate RID format before using RIDs in other tools.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `rid` | string | The RID string to parse (e.g., "orn:regen.document:notion/page-abc123", "orn:slack.message:TEAM/CHANNEL/TS", "https://github.com/regen-network/regen-ledger") |

**Return Shape:**

Returns a parsed RID object with `valid`, `scheme`, `namespace`, `context`, `reference`, `rid_type`, and `source_inferred` fields. If invalid, includes an `error` field with the reason.

**Example:**

```
parse_rid(rid="orn:notion.page:regen/2f725b77-eda1-807d-a63e-c43e6145f7f1")
```

**Digest Usage:**

Use this tool to validate RIDs before passing them to `get_full_document` or other RID-based tools. Useful when programmatically constructing RIDs from search results.

---

### kb_rid_lookup

Look up what the Regen KB knows about an RID. Searches indexed documents via `/query` by RID string match. Optionally queries `/entity/neighborhood` for graph edges (best-effort, may return empty). Does NOT implement KOI-net dereference or `/bundles/fetch` — this is a KB convenience tool. Use `parse_rid` first to validate format.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `rid` | string | **required** | The RID to look up in the knowledge base |
| `include` | array | `["documents"]` | What to include: `documents` (indexed doc records), `relationships` (graph edges), `chunks` (text chunks) |
| `limit` | number | 10 | Maximum items per category to return (1-50) |

**Return Shape:**

Returns documents, relationships, and/or chunks associated with the RID, depending on the `include` parameter.

**Example:**

```
kb_rid_lookup(
  rid="orn:notion.page:regen/abc123",
  include=["documents", "relationships"],
  limit=20
)
```

**Digest Usage:**

Use this tool to enrich digest content with metadata about documents. For example, after finding a document via search, use this to get its RID-based metadata, relationships, and associated chunks.

---

### kb_list_rids

List RIDs indexed in the Regen KB. Filter by context pattern, source, or date range. Returns aggregation counts. This is a KB discovery tool, NOT KOI-net /rids/fetch (which lists RIDs by type from a node).

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `context` | string | — | Filter by RID context pattern (e.g., "orn:regen.document", "https"). Partial match. |
| `source` | enum | — | Filter by data source: `notion`, `discourse`, `github`, `slack`, `telegram`, `twitter`, `substack`, `youtube`, `medium` |
| `indexed_after` | string | — | Only RIDs indexed after this date (YYYY-MM-DD) |
| `indexed_before` | string | — | Only RIDs indexed before this date (YYYY-MM-DD) |
| `limit` | number | 50 | Maximum RIDs to return (1-200) |
| `offset` | number | 0 | Pagination offset |

**Return Shape:**

Returns a list of RIDs matching the filters, along with aggregation counts by context and source.

**Example:**

```
kb_list_rids(
  context="orn:regen.document",
  source="notion",
  indexed_after="2026-01-01",
  limit=100
)
```

**Digest Usage:**

Use this tool to discover what's been indexed recently. For example, to find all Notion pages added in the last week, filter by source and date. This helps identify new content to highlight in digests.

---

## Repository

### get_repo_overview

Get a structured overview of a repository including description, key files (README, CONTRIBUTING, etc.), and links to documentation. Returns a curated summary of the repository's structure and purpose.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `repository` | enum | **required** — one of: `regen-ledger`, `regen-web`, `regen-data-standards`, `regenie-corpus` |

**Return Shape:**

Returns markdown-formatted repository overview with README content, file structure, documentation links, and key metadata.

**Example:**

```
get_repo_overview(repository="regen-ledger")
```

**Digest Usage:**

Use this tool when writing onboarding content or repository-focused digests. Provides context for developers who need to understand a repo's purpose and structure.

---

### get_tech_stack

Get technical stack information for Regen Network repositories including languages, frameworks, dependencies, build tools, and infrastructure. Can show all repos or filter to a specific one.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `repository` | enum | Optional — one of: `regen-ledger`, `regen-web`, `regen-data-standards`, `regenie-corpus`. Omit to show all repos. |

**Return Shape:**

Returns markdown-formatted tech stack with languages (with file counts), frameworks, key dependencies, and build tools.

**Example:**

```
get_tech_stack(repository="regen-ledger")
```

**Digest Usage:**

Use this tool when writing technical summaries or when you need to understand technology choices. Useful for developer-focused digests that highlight stack evolution or dependency updates.

---

## Metadata & Analytics

### get_stats

Get database and index statistics including document counts by source and type. Use this to understand what's in the knowledge base and to discover available sources for filtering.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `detailed` | boolean | false | Include detailed breakdown by source/type |

**Return Shape:**

Basic stats include total entities, documents, repositories, and last updated timestamp. Detailed stats add breakdowns by repository, entity type, and data source.

**Example:**

```
get_stats(detailed=true)
```

**Digest Usage:**

Use this tool to understand data coverage and to discover what sources are available. Useful for diagnostic purposes or for understanding the scope of the knowledge base. Include stats in meta-digests that report on the digest system itself.

---

### resolve_metadata_iri

Resolve a Regen metadata IRI via the allowlisted resolver (api.regen.network). Caches results for efficient repeated lookups. Returns resolution details including content hash for integrity verification. Use this to verify metadata exists before deriving metrics.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `iri` | string | **required** | The Regen metadata IRI to resolve (e.g., "regen:13toVfvfM5B7yuJqq8h3iVRHp3PKUJ4ABxHyvn4MeUMwwv1pWQGL295.rdf") |
| `force_refresh` | boolean | false | If true, bypass cache and fetch fresh from resolver |

**Return Shape:**

Returns resolution status, content hash, and metadata URL. If resolution fails, includes error details.

**Example:**

```
resolve_metadata_iri(iri="regen:13toVfvfM5B7yuJqq8h3iVRHp3PKUJ4ABxHyvn4MeUMwwv1pWQGL295.rdf")
```

**Digest Usage:**

Use this tool when working with on-chain project metadata. For example, when generating digests about ecocredit projects, resolve project metadata IRIs to verify they're accessible and to extract content hashes for citation.

---

### derive_offchain_hectares

Derive project hectares from a Regen metadata IRI with full citation and derivation provenance. Enforces "no citation, no metric" policy — returns `blocked=true` if derivation is not possible. Only returns hectares when a valid citation can be constructed. Use this for accurate, citeable project size metrics.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `iri` | string | **required** | The Regen metadata IRI to derive hectares from |
| `force_refresh` | boolean | false | If true, bypass cache and re-derive from fresh metadata |

**Return Shape:**

Returns hectares value with full citation, derivation method, confidence level, and warnings. If derivation is blocked, includes explanation of why metrics cannot be extracted.

**Example:**

```
derive_offchain_hectares(iri="regen:13toVfvfM5B7yuJqq8h3iVRHp3PKUJ4ABxHyvn4MeUMwwv1pWQGL295.rdf")
```

**Digest Usage:**

Use this tool when generating digests about ecocredit projects that need to include project size metrics. The citation and provenance information ensures transparency about where numbers come from.

---

### analyze_market_trends

Analyze market trends across credit types with historical data analysis. Provides insights into credit issuance, retirement, and marketplace activity over time.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `time_period` | string | `30d` | Time period for analysis (e.g., "30d", "90d", "1y") |
| `credit_types` | array | null | Optional array of credit type names to analyze. Omit for all types. |

**Return Shape:**

Returns markdown-formatted analysis with trends, comparisons, and insights about credit marketplace activity.

**Example:**

```
analyze_market_trends(time_period="90d", credit_types=["C01", "C02"])
```

**Digest Usage:**

Use this tool for market-focused digests that highlight trends in credit issuance, retirement, and trading. Provides quantitative insights to complement qualitative community updates.

---

### compare_credit_methodologies

Compare different credit class methodologies for impact efficiency analysis. Evaluates and contrasts the approaches, standards, and verification mechanisms across credit classes.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `class_ids` | array | **required** — array of credit class IDs to compare |

**Return Shape:**

Returns markdown-formatted comparison with methodology descriptions, verification approaches, and impact metrics.

**Example:**

```
compare_credit_methodologies(class_ids=["C01", "C02", "C03"])
```

**Digest Usage:**

Use this tool for deep-dive digests that explore credit class design decisions and methodology trade-offs. Useful for educational content or strategic analysis.

---

## System

### get_mcp_metrics

Get MCP server performance metrics, cache statistics, and health status. Useful for monitoring and debugging. Returns uptime, tool latencies, cache hit rates, error counts, and circuit breaker status.

**Parameters:**

None (no parameters required).

**Return Shape:**

Returns markdown-formatted metrics report with uptime, cache statistics (hit rate, hits, misses), API call statistics (total calls, error rate, latency percentiles), and per-tool metrics (query count, success rate, latency distribution).

**Example:**

```
get_mcp_metrics()
```

**Digest Usage:**

Include metrics in meta-digests that report on digest system health. Use to diagnose slow queries or to understand which tools are most heavily used. Useful for operational transparency.

---

### submit_feedback

Submit feedback about your experience using KOI MCP tools. Helps improve the system. All feedback is stored anonymously with session context.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `rating` | number | **required** | Rating from 1 (poor) to 5 (excellent) |
| `category` | enum | **required** | Type of feedback: `success`, `partial`, `bug`, `suggestion`, `question`, `other` |
| `notes` | string | **required** | Detailed feedback, observations, or suggestions (1-5000 characters) |
| `task_description` | string | — | Brief description of what you were trying to do |
| `include_session_context` | boolean | true | Include recent tool calls for debugging context |

**Return Shape:**

Returns confirmation with feedback ID.

**Example:**

```
submit_feedback(
  rating=5,
  category="success",
  notes="Found exactly what I needed about basket tokens",
  task_description="Researching basket token implementation"
)
```

**Digest Usage:**

Not directly used in digest generation. However, feedback about digest quality could be submitted via this tool to improve future digest workflows.

---

### regen_koi_authenticate

Authenticate with your @regen.network email to access internal Regen Network documentation in addition to public sources. Opens a browser window for secure OAuth login. Authentication token is saved on the server and persists across sessions. Only needs to be done once.

**Parameters:**

None (opens browser for OAuth flow).

**Return Shape:**

Returns authentication status with session token information.

**Example:**

```
regen_koi_authenticate()
```

**Digest Usage:**

Run this tool once at the beginning of a session if you need access to private Notion workspace content for internal digests. Public digests do not require authentication.

---

### setup_claude_config

Fetch and display Regen Network CLAUDE.md configuration from the HTTP Config endpoint. This tool retrieves the official configuration for working with Regen Network projects in Claude Code.

The configuration includes project context and conventions, MCP server setup instructions, domain-specific knowledge (ecocredits, governance, etc.), and available skills and contexts based on your access tier.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `show_available` | boolean | false | If true, show what resources are available at your tier instead of fetching CLAUDE.md content |

**Return Shape:**

When `show_available=false` (default), returns the full CLAUDE.md content with installation instructions. When `show_available=true`, returns tier information and available resources.

**Example:**

```
setup_claude_config(show_available=true)
```

**Digest Usage:**

Not directly used in digest generation. This tool is for setting up the Regen Claude configuration in new projects or updating to the latest configuration.

---

## Profile

### get_my_profile

Get your user profile for personalized responses based on your experience level. Returns your profile including experience level (junior, mid, senior, staff, or principal), role (frontend, backend, full-stack, etc.), preferences (response customization), and relationships (who you manage, projects you work on).

If you haven't set a profile, returns sensible defaults (mid-level with balanced verbosity).

**Parameters:**

None (retrieves profile for authenticated user).

**Return Shape:**

Returns user profile object with experience level, role, preferences, and relationships.

**Example:**

```
get_my_profile()
```

**Digest Usage:**

Not directly used in digest generation. However, profile information could be used to customize digest content based on user preferences (e.g., adjust verbosity, include/exclude certain sections).

---

### update_my_profile

Update your user profile to customize how responses are tailored to you. Experience levels affect response verbosity and detail: junior (detailed explanations), mid (balanced), senior (concise), staff/principal (very concise).

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `experience_level` | enum | Your experience level: `junior`, `mid`, `senior`, `staff`, `principal` |
| `role` | string | Your technical role (e.g., frontend, backend, full-stack, devops, data) |
| `managed_by` | string | Email of your manager (stored in Jena for team queries) |
| `preferences` | object | Custom preferences: `explain_before_code`, `verbosity`, `show_examples` |

**Return Shape:**

Returns confirmation of profile update.

**Example:**

```
update_my_profile(
  experience_level="senior",
  role="backend",
  preferences={"verbosity": "concise"}
)
```

**Digest Usage:**

Not directly used in digest generation. However, team profiles could be used to customize digest distribution (e.g., send technical digests to backend engineers, community digests to everyone).

---

## Performance & Caching

The KOI MCP server implements multi-tier caching to optimize performance:

- **Static data** (1 hour): `list_repos`, `get_tech_stack`, `get_repo_overview`
- **Semi-static** (10 minutes): `find_by_type`, module queries
- **Dynamic** (5 minutes): `search`, graph traversal
- **Volatile** (1 minute): `get_stats`, `generate_weekly_digest`
- **Not cached**: `get_mcp_metrics`, `submit_feedback`, `regen_koi_authenticate`

First queries experience cache misses (slower), while subsequent identical queries hit the cache (faster). Check `get_mcp_metrics` to monitor cache hit rates and query latencies.

**Typical Latencies:**

| Tool | Typical Latency | Cached Latency |
|------|----------------|----------------|
| `query_code_graph` | 50-200ms | <10ms |
| `search` | 100-300ms | <10ms |
| `search_github_docs` | 100-200ms | <10ms |
| `get_repo_overview` | 50-100ms | <10ms |
| `get_tech_stack` | 50-100ms | <10ms |
| `get_stats` | 50-100ms | 50-100ms (1min cache) |
| `generate_weekly_digest` | 200-500ms | 200-500ms (1min cache) |
| `get_mcp_metrics` | <10ms | Not cached |

**Good Health Indicators:**

- Error rate < 5%
- Cache hit rate > 50%
- p95 latency < 200ms
- Circuit breaker: closed

---

## Error Handling

All tools use consistent error formatting. Common errors include:

| Error | Cause | Solution |
|-------|-------|----------|
| "Validation failed" | Invalid parameters | Check parameter types and formats |
| "Circuit breaker is open" | Backend service down | Wait 60s and retry |
| "Timeout after 30000ms" | Query too complex | Narrow your query |
| "Invalid characters" | SQL/Cypher injection detected | Use only alphanumeric + `_-. ` |
| "Required parameter missing" | Missing required param | Add required parameter |
| "Unknown tool" | Tool name typo | Check tool name spelling |
| 401 UNAUTHORIZED | Missing internal API key | Check `KOI_INTERNAL_API_KEY` env var |
| 403 ACCESS_DENIED | Private doc without auth | Use `regen_koi_authenticate` first |
| 404 DOCUMENT_NOT_FOUND | RID doesn't exist or is private | Verify RID is correct |

---

## Additional Resources

- **User Guide**: [regen-koi-mcp/docs/USER_GUIDE.md](https://github.com/gaiaaiagent/regen-koi-mcp/blob/main/docs/USER_GUIDE.md)
- **API Reference**: [regen-koi-mcp/docs/API_REFERENCE.md](https://github.com/gaiaaiagent/regen-koi-mcp/blob/main/docs/API_REFERENCE.md)
- **Deployment Guide**: [regen-koi-mcp/docs/DEPLOYMENT.md](https://github.com/gaiaaiagent/regen-koi-mcp/blob/main/docs/DEPLOYMENT.md)
- **Tool Routing Guide**: [regen-koi-mcp/TOOL_ROUTING.md](https://github.com/gaiaaiagent/regen-koi-mcp/blob/main/TOOL_ROUTING.md)
- **GitHub Repository**: https://github.com/gaiaaiagent/regen-koi-mcp
- **Issues**: https://github.com/gaiaaiagent/regen-koi-mcp/issues
- **Discord**: https://discord.gg/regen-network
