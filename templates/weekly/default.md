---
name: default
cadence: weekly
description: Weekly digest synthesizing dailies into higher-level analysis
sources:
  - koi
  - ledger
  - web
  - historic
rollup:
  source_cadence: daily
  lookback: 7 days
comparison:
  period: previous week
---

# {week} — Weekly Heartbeat

## Week in Review
<!-- source: historic.daily -->
Synthesize all daily digests from this week into a coherent narrative. Do not
list what happened each day. Identify the threads that ran through the week:
recurring themes, developments that accelerated, questions that were answered or
that deepened. This section transforms daily observation into weekly pattern.

## Governance Summary
<!-- source: ledger.governance, koi.governance, historic.daily -->
Trace governance activity across the week. Which proposals advanced? What was
debated? How did voting patterns shift? Connect individual daily governance notes
into a governance narrative. Supplement with fresh Ledger MCP queries for current
state.

## Ecocredit Trends
<!-- source: ledger.ecocredit, ledger.marketplace, historic.daily -->
Aggregate ecocredit activity from the week's dailies. Identify trends in
issuance, retirement, and marketplace activity. Query Ledger MCP for current
credit class and batch counts. Note any week-over-week changes in credit supply.

## Ecosystem Narrative
<!-- source: koi.search, koi.weekly_digest, historic.daily -->
What is the community building, discussing, and deciding? Pull from KOI's weekly
digest and supplement with daily ecosystem intelligence sections. Identify the
conversations that mattered this week.

## Forward Look
<!-- source: web, historic -->
What is coming? Open governance proposals entering voting. Upcoming events.
Trends to watch. Questions from dailies that remain unanswered. Connections to
broader ecosystem developments from web search.
