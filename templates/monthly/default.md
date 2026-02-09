---
name: default
cadence: monthly
description: Monthly digest distilling weeklies into trend analysis and narrative arcs
sources:
  - koi
  - ledger
  - web
  - historic
rollup:
  source_cadence: weekly
  lookback: 1 month
comparison:
  period: previous month
---

# {month} — Monthly Heartbeat

## Month in Review
<!-- source: historic.weekly -->
Distill the month's weekly digests into structural observations. What changed
this month that did not change before? What accelerated, decelerated, emerged,
or faded? This is not a summary of weeklies — it is a synthesis of the month's
trajectory.

## Governance Arc
<!-- source: ledger.governance, historic.weekly -->
Trace the month's governance narrative from beginning to end. Proposals that
were introduced, debated, voted on, and resolved. Changes in governance
participation or patterns. Query Ledger MCP for definitive outcomes.

## Credit Market Evolution
<!-- source: ledger.ecocredit, ledger.marketplace, historic.weekly -->
How did the ecocredit market move this month? New credit classes or projects.
Issuance and retirement volume. Marketplace trends. Compare with previous
month's metrics. Query Ledger MCP for current totals.

## Community Health
<!-- source: koi.search, historic.weekly -->
Is the community growing, contracting, or shifting focus? Forum engagement,
GitHub contributions, new participants, and notable departures. Extract from
weekly ecosystem narratives and supplement with KOI searches.

## Strategic Questions
<!-- source: historic, web -->
Which of last month's strategic questions were answered? Which remain open?
What new questions emerged this month? What external developments (from web
search) change the strategic context? Pose 3-5 questions for the month ahead.
