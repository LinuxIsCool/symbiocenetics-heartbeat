---
title: Why These MCPs?
description: The architectural reasoning behind KOI MCP and Ledger MCP
---

# Why These MCPs?

Regen Heartbeat depends on two Model Context Protocol servers to do its work. This document explains why they exist, what problems they solve, and how they complement each other.

## The Knowledge Problem

Regen Network's knowledge is scattered across dozens of platforms. Forum discussions live on Discourse. Technical documentation lives on GitHub across multiple repositories. Strategy documents live in Notion. Community conversations happen on Telegram, Discord, and Twitter. Podcast transcripts, Medium articles, and Substack posts add further depth.

No single search engine covers all of these. A developer asking "what's the status of the Registry Agent?" would need to check GitHub issues, Discourse threads, Notion pages, and possibly Telegram messages to get a complete picture. This fragmentation makes it hard for anyone — human or AI — to synthesize a coherent view of what's happening.

KOI solves this by indexing all of these sources into a single searchable knowledge base. Its hybrid search combines vector similarity (finding semantically related content), graph relationships (understanding how entities connect), and keyword matching (finding exact terms). The result is a unified interface to Regen's entire knowledge commons.

## The State Problem

Knowledge tells you what people are discussing and planning. But to understand what has actually happened on-chain, you need to query the blockchain directly. How many ecocredits were issued this week? What governance proposals are active? What's the current token supply?

The Regen blockchain is a Cosmos SDK chain with specialized modules for ecological credits, marketplace operations, and governance. Querying it normally requires running a full node or knowing the right REST endpoints. The Ledger MCP abstracts this into simple function calls that Claude can invoke directly.

## How They Complement Each Other

KOI and the Ledger MCP serve fundamentally different purposes that together create a complete picture:

**KOI provides context.** It knows what people are saying about a governance proposal, what the historical discussion around a credit methodology looks like, and what the community sentiment is. It operates in the realm of knowledge, opinion, and narrative.

**The Ledger provides facts.** It knows exactly how many votes a proposal has received, what the current token supply is, and how many credits exist in a given batch. It operates in the realm of verified on-chain state.

A daily digest needs both. The Governance Pulse section, for example, uses the Ledger MCP to get the exact vote tally on a proposal and KOI to surface the forum discussion around it. The Ecocredit Activity section uses the Ledger to count new batches and KOI to find related registry discussions.

## The Citation Imperative

One principle runs through both systems: no metric without a source. When a digest reports that "42 new ecocredits were issued," that number should trace back to a specific Ledger MCP query. When it says "the community expressed concern about validator centralization," that claim should trace to specific forum threads surfaced by KOI.

The `<!-- source: -->` annotations in digest templates exist to enforce this discipline. Each section declares which MCP tools should feed it data, creating an auditable chain from claim to source.

## Why Not Just Web Search?

Web search is valuable for current events and broader context, but it can't replace either MCP. It doesn't have access to private Notion documents, can't query on-chain state, doesn't index Telegram messages, and can't resolve entities in Regen's knowledge graph. Web search supplements the MCPs — it doesn't replace them.
