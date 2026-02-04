---
title: Querying Chain Data
description: Practical guide for Ledger MCP queries in digest generation
---

# Querying Chain Data

*This guide will cover practical patterns for querying the Regen blockchain.*

## Overview

The Ledger MCP provides direct access to on-chain state without running a full node. For digest generation, we regularly query governance proposals, ecocredit activity, token supply, and marketplace orders. This guide covers the query patterns and interpretation techniques that make those digests accurate and insightful.

## Topics Covered

- Understanding on-chain vs. off-chain data boundaries
- Pagination patterns for large datasets
- Common query sequences for each digest section
- Interpreting results: denominations, amounts, and addresses
- Cross-referencing chain data with KOI knowledge base findings
- Handling missing or empty results gracefully

*Detailed guide coming soon. See the [Ledger MCP Tool Reference](/docs/reference/ledger-mcp-tools) for tool parameters.*
