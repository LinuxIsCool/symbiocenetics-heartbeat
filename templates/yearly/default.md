---
name: default
cadence: yearly
description: Yearly digest identifying annual transformations and milestones
sources:
  - koi
  - ledger
  - web
  - historic
rollup:
  source_cadence: monthly
  lookback: 1 year
comparison:
  period: previous year
---

# {year} — Yearly Heartbeat

## Annual Narrative
<!-- source: historic.monthly -->
What is the story of this year? Read all monthly digests and identify the arc
that connects January to December. What was the defining theme? What
transformed? What endured? Write this as a narrative, not a chronological
summary.

## Key Milestones
<!-- source: historic.monthly -->
Identify the 5-10 most significant events or achievements of the year. Rank
by impact on the ecosystem. For each milestone, note which month it occurred
and why it mattered.

## Quantitative Retrospective
<!-- source: ledger, historic.monthly -->
Hard numbers. Year-end vs year-start: token supply, credit classes, registered
projects, marketplace volume, governance proposals, community pool balance.
Query Ledger MCP for definitive year-end figures.

## Governance Evolution
<!-- source: ledger.governance, historic.monthly -->
How did governance change this year? Total proposals, passage rate, voter
participation trends, contentious topics, and structural governance changes.
What does the year's governance record reveal about the network's decision-making
maturity?

## Ecocredit Market Annual Review
<!-- source: ledger.ecocredit, ledger.marketplace, historic.monthly -->
Year-over-year credit market analysis. Total issuance, retirement, active
marketplace listings, price trends (if available), new credit types, geographic
distribution of projects.

## Ecosystem Growth
<!-- source: koi.search, historic.monthly -->
Community trajectory over the year. New partnerships, integrations, and
collaborations. Developer activity. Documentation growth. Geographic and
thematic expansion of the ecosystem.

## Year-Ahead Outlook
<!-- source: web, historic -->
Looking forward. What trends from this year will define the next? What risks
are emerging? What opportunities are opening? Pose the 5-7 questions that will
matter most in the coming year. Connect to broader developments in climate
finance, crypto governance, and regenerative economics.
