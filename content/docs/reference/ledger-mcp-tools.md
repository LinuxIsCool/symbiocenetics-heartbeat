---
title: Ledger MCP Tool Reference
description: Complete reference for all Regen Network Ledger MCP tools
category: Reference
tags: [mcp, ledger, tools, blockchain, api]
---

# Ledger MCP Tool Reference

This document provides an exhaustive reference for every tool available through the Ledger MCP (Model Context Protocol) server. The Ledger MCP connects to the Regen Network blockchain — a Cosmos SDK-based chain specializing in ecological credits and regenerative finance.

Each tool is documented with its purpose, parameters, return values, and practical usage guidance for digest generation.


## Bank Module

The Bank module manages token balances, transfers, and denomination metadata across the Regen Network blockchain. These tools provide access to account information, token supplies, and holder data.

### list_accounts

List all accounts on Regen Network with pagination support.

**Parameters:**
- `page` (int, default: 1) — Page number for pagination
- `limit` (int, default: 100) — Number of results per page
- `count_total` (bool, default: true) — Return total count
- `reverse` (bool, default: false) — Descending order

**Returns:** Dictionary with accounts list and pagination metadata

**When to use in digests:**
Use when generating ecosystem-level statistics about the number of active accounts or when analyzing network growth over time. Rarely needed for daily digests, more appropriate for monthly or yearly summaries.


### get_account

Get detailed information for a specific account.

**Parameters:**
- `address` (string, required) — Cosmos account address (e.g., `regen1...`)

**Returns:** Dictionary with account type, sequence number, and account details

**When to use in digests:**
Use when profiling specific actors in the ecosystem (project developers, major credit holders, governance participants). Helpful for "spotlight" sections in weekly or monthly digests.


### get_balance

Get balance of a specific token for an address.

**Parameters:**
- `address` (string, required) — Cosmos account address (e.g., `regen1...`)
- `denom` (string, required) — Token denomination (e.g., `uregen`, `ibc/...`)

**Returns:** Dictionary with balance amount and denomination

**When to use in digests:**
Use when tracking specific wallets or treasury balances. Good for monitoring community pool holdings or validator commission balances in weekly updates.


### get_all_balances

Get all token balances for an address with pagination.

**Parameters:**
- `address` (string, required) — Cosmos account address
- `limit` (int, optional, default: 100) — Page size (max 200)
- `page` (int, optional, default: 1) — Page number (1-based)
- `count_total` (bool, optional, default: true) — Return total count
- `reverse` (bool, optional, default: false) — Descending order

**Returns:** Dictionary with all balances and pagination info

**When to use in digests:**
Use for portfolio analysis of major ecosystem participants. Helpful in monthly digests when profiling top credit holders or analyzing wallet diversification.


### get_spendable_balances

Get spendable (unlocked, not staked) balances for an address.

**Parameters:**
- `address` (string, required) — Cosmos account address
- `limit` (int, optional, default: 100) — Page size
- `page` (int, optional, default: 1) — Page number
- `count_total` (bool, optional, default: true) — Return total count
- `reverse` (bool, optional, default: false) — Descending order

**Returns:** Dictionary with spendable balances and pagination

**When to use in digests:**
Use when analyzing available liquidity in the ecosystem. Relevant for market health assessments in weekly or monthly digests.


### get_total_supply

Get total supply of all coin denominations on the network.

**Parameters:**
- `limit` (int, optional, default: 100) — Page size
- `page` (int, optional, default: 1) — Page number
- `count_total` (bool, optional, default: true) — Return total count
- `reverse` (bool, optional, default: false) — Descending order

**Returns:** Dictionary with total supply data for all denominations

**When to use in digests:**
Use for high-level tokenomics summaries. Essential for monthly and yearly digests covering REGEN token inflation, total value locked, and ecosystem growth metrics.


### get_supply_of

Get total supply of a specific denomination.

**Parameters:**
- `denom` (string, required) — Token denomination (e.g., `uregen`, `ibc/...`)

**Returns:** Dictionary with supply amount and metadata

**When to use in digests:**
Use when tracking REGEN token supply specifically, or when analyzing the supply of basket tokens (NCT, NBO). Helpful for monthly tokenomics sections.


### get_bank_params

Get bank module parameters (send enabled, default send enabled).

**Parameters:** None

**Returns:** Dictionary with bank module configuration

**When to use in digests:**
Rarely needed unless there's been a governance change to bank module parameters. Include in governance update sections when parameters change.


### get_denoms_metadata

Get metadata for all token denominations.

**Parameters:**
- `page` (int, default: 1) — Page number
- `limit` (int, default: 100) — Results per page
- `count_total` (bool, default: true) — Return total count
- `reverse` (bool, default: false) — Descending order

**Returns:** Dictionary with denomination metadata (display names, decimals, symbols)

**When to use in digests:**
Use when new denominations are registered or when explaining token types to new community members. Good for educational sections in weekly or monthly digests.


### get_denom_metadata

Get metadata for a specific token denomination.

**Parameters:**
- `denom` (string, required) — Token denomination

**Returns:** Dictionary with denomination metadata

**When to use in digests:**
Use when explaining a specific token in depth, such as a new basket token or IBC token. Helpful for feature stories in weekly digests.


### get_denom_owners

Get all holders of a specific token.

**Parameters:**
- `denom` (string, required) — Token denomination
- `page` (int, default: 1) — Page number
- `limit` (int, default: 100) — Results per page
- `count_total` (bool, default: true) — Return total count
- `reverse` (bool, default: false) — Descending order

**Returns:** Dictionary with list of token holders and balances

**When to use in digests:**
Use for holder distribution analysis. Excellent for monthly digests covering token concentration, decentralization metrics, or analyzing who holds specific credit batches.


## Distribution Module

The Distribution module handles staking rewards, validator commissions, and the community pool. These tools provide insight into validator economics and delegator rewards.

### get_distribution_params

Get distribution module parameters (community tax, base proposer reward, bonus proposer reward, withdraw address enabled).

**Parameters:** None

**Returns:** Dictionary with distribution parameters

**When to use in digests:**
Include when governance proposals change distribution parameters. Relevant for governance-focused sections in weekly or monthly digests.


### get_validator_outstanding_rewards

Get outstanding (unclaimed) rewards for a validator.

**Parameters:**
- `validator_address` (string, required) — Validator operator address (starts with `regenvaloper`)

**Returns:** Dictionary with outstanding rewards

**When to use in digests:**
Use when profiling validator economics. Helpful for validator spotlight sections in monthly digests or when analyzing validator sustainability.


### get_validator_commission

Get accumulated commission for a validator.

**Parameters:**
- `validator_address` (string, required) — Validator operator address

**Returns:** Dictionary with validator commission

**When to use in digests:**
Similar to outstanding rewards — use for validator economic analysis. Particularly relevant when discussing validator incentives and profitability.


### get_validator_slashes

Get slashing events for a validator within a block height range.

**Parameters:**
- `validator_address` (string, required) — Validator operator address
- `starting_height` (int, optional) — Starting block height
- `ending_height` (int, optional) — Ending block height
- `page` (int, default: 1) — Page number
- `limit` (int, default: 100) — Results per page

**Returns:** Dictionary with slashing events

**When to use in digests:**
Use when slashing events occur. Critical for network security sections in daily or weekly digests when validators are penalized for downtime or double-signing.


### get_delegation_rewards

Get rewards for a specific delegator-validator pair.

**Parameters:**
- `delegator_address` (string, required) — Delegator account address
- `validator_address` (string, required) — Validator operator address

**Returns:** Dictionary with delegation rewards

**When to use in digests:**
Use when profiling specific delegator-validator relationships. Helpful for case studies in monthly digests.


### get_delegation_total_rewards

Get total delegation rewards across all validators for a delegator.

**Parameters:**
- `delegator_address` (string, required) — Delegator account address

**Returns:** Dictionary with total rewards and breakdown by validator

**When to use in digests:**
Use when analyzing delegator returns or when profiling major staking participants. Good for staking APR analysis in monthly digests.


### get_delegator_validators

Get list of validators that a delegator has bonded to.

**Parameters:**
- `delegator_address` (string, required) — Delegator account address

**Returns:** Dictionary with list of validators

**When to use in digests:**
Use for delegator diversification analysis. Helpful when examining staking patterns in monthly ecosystem reports.


### get_delegator_withdraw_address

Get the withdraw address configured for a delegator (where rewards are sent).

**Parameters:**
- `delegator_address` (string, required) — Delegator account address

**Returns:** Dictionary with withdraw address

**When to use in digests:**
Rarely needed for digests unless there's a specific security or tax-planning story about reward withdrawal patterns.


### get_community_pool

Get current community pool balance.

**Parameters:** None

**Returns:** Dictionary with community pool token balances

**When to use in digests:**
Use in every monthly digest and yearly summary. The community pool balance is a key metric for ecosystem treasury health and governance capacity.


## Governance Module

The Governance module manages on-chain proposals, voting, deposits, and tally results. These tools are essential for tracking governance activity.

### get_governance_proposal

Get details for a specific governance proposal.

**Parameters:**
- `proposal_id` (string or int, required) — Proposal ID

**Returns:** Dictionary with proposal details (title, description, status, voting end time, tally)

**When to use in digests:**
Use in daily and weekly digests when proposals are active. Essential for governance sections covering proposal status and voting outcomes.


### list_governance_proposals

List governance proposals with optional filters.

**Parameters:**
- `page` (int, default: 1) — Page number
- `limit` (int, default: 100) — Results per page
- `proposal_status` (string, optional) — Filter by status (e.g., `PROPOSAL_STATUS_VOTING_PERIOD`)
- `voter` (string, optional) — Filter by voter address
- `depositor` (string, optional) — Filter by depositor address

**Returns:** Dictionary with list of proposals and pagination

**When to use in digests:**
Use in every weekly digest to summarize active and recently concluded proposals. Filter by status to show only active proposals in daily digests.


### get_governance_vote

Get a specific vote on a proposal.

**Parameters:**
- `proposal_id` (string or int, required) — Proposal ID
- `voter` (string, required) — Voter account address

**Returns:** Dictionary with vote details (option, weight)

**When to use in digests:**
Use when profiling how specific actors voted on important proposals. Good for governance transparency sections in weekly or monthly digests.


### list_governance_votes

List all votes for a specific proposal.

**Parameters:**
- `proposal_id` (string or int, required) — Proposal ID
- `page` (int, default: 1) — Page number
- `limit` (int, default: 100) — Results per page

**Returns:** Dictionary with list of votes and pagination

**When to use in digests:**
Use to analyze voting patterns and participation rates. Essential for post-vote analysis in weekly digests covering governance outcomes.


### list_governance_deposits

List all deposits for a specific proposal.

**Parameters:**
- `proposal_id` (string or int, required) — Proposal ID
- `page` (int, default: 1) — Page number
- `limit` (int, default: 100) — Results per page

**Returns:** Dictionary with list of deposits and pagination

**When to use in digests:**
Use when proposals are in deposit period or when analyzing who supports proposals financially. Helpful for early-stage proposal coverage in daily digests.


### get_governance_params

Get governance parameters for a specific parameter type.

**Parameters:**
- `params_type` (string, required) — Type of parameters: `voting`, `deposit`, or `tally`

**Returns:** Dictionary with governance parameters

**When to use in digests:**
Include when governance parameters change via proposals. Important for governance update sections explaining new voting periods, deposit requirements, or quorum thresholds.


### get_governance_deposit

Get a specific deposit for a proposal.

**Parameters:**
- `proposal_id` (string or int, required) — Proposal ID
- `depositor` (string, required) — Depositor account address

**Returns:** Dictionary with deposit details

**When to use in digests:**
Use when profiling deposit activity for specific proposals. Helpful for stories about community support or lack thereof.


### get_governance_tally_result

Get vote tally for a proposal.

**Parameters:**
- `proposal_id` (string or int, required) — Proposal ID

**Returns:** Dictionary with tally counts (yes, no, abstain, no_with_veto)

**When to use in digests:**
Essential for every governance digest. Use to show current vote counts for active proposals and final tallies for concluded votes.


## Ecocredit Module

The Ecocredit module is the heart of Regen Network's ecological asset infrastructure. These tools provide access to credit types, classes, projects, and batches.

### list_credit_types

List all enabled credit types on Regen Network.

**Parameters:** None

**Returns:** Dictionary with credit types (abbreviation, name, unit, precision)

**When to use in digests:**
Use when new credit types are added via governance. Good for explaining the ecosystem's diversity in monthly or yearly digests.

**Example output:**
```json
{
  "credit_types": [
    {"abbreviation": "C", "name": "carbon", "unit": "metric ton CO2 equivalent", "precision": 6},
    {"abbreviation": "BIO", "name": "biodiversity", "unit": "biodiversity unit", "precision": 6}
  ]
}
```


### list_classes

List all credit classes (methodologies).

**Parameters:**
- `limit` (int, default: 100, max: 1000) — Number of classes to return
- `offset` (int, default: 0) — Number to skip for pagination
- `count_total` (bool, default: true) — Return total count
- `reverse` (bool, default: false) — Reverse order

**Returns:** Dictionary with credit classes including resolved names from metadata

**When to use in digests:**
Use in monthly digests to show methodology diversity. Essential when new methodologies are registered or when explaining the difference between credit classes (e.g., C01 vs C02).

**Example:**
List all carbon credit methodologies currently available on-chain.


### list_projects

List all registered projects on Regen Network.

**Parameters:**
- `limit` (int, default: 100, max: 1000) — Number of projects to return
- `offset` (int, default: 0) — Number to skip
- `count_total` (bool, default: true) — Return total count
- `reverse` (bool, default: false) — Reverse order

**Returns:** Dictionary with projects (id, admin, class_id, jurisdiction, metadata, reference_id)

**When to use in digests:**
Use in weekly and monthly digests to track new project registrations. Essential for "new projects" sections and geographic diversity analysis.

**Example:**
Show how many new projects were registered this month and where they're located.


### list_credit_batches

List all issued credit batches.

**Parameters:**
- `limit` (int, default: 100, max: 1000) — Number of batches to return
- `offset` (int, default: 0) — Number to skip
- `count_total` (bool, default: true) — Return total count
- `reverse` (bool, default: false) — Reverse order

**Returns:** Dictionary with credit batches (issuer, project_id, denom, metadata, start_date, end_date, issuance_date, open)

**When to use in digests:**
Use in every weekly digest to show new credit issuances. Critical for tracking total credits issued, vintage years, and issuance velocity.

**Example:**
List all batches issued in the last 7 days with their vintage periods and quantities.


## Marketplace Module

The Marketplace module facilitates peer-to-peer trading of ecocredits. These tools provide access to sell orders and market pricing.

### get_sell_order

Get details for a specific sell order.

**Parameters:**
- `sell_order_id` (string or int, required) — Unique sell order identifier

**Returns:** Dictionary with sell order (id, seller, batch_denom, quantity, ask_denom, ask_amount, disable_auto_retire, expiration, market_id)

**When to use in digests:**
Use when profiling specific large or notable sell orders. Helpful for market analysis in weekly digests.


### list_sell_orders

List all active sell orders on the marketplace.

**Parameters:**
- `limit` (int, default: 100, max: 1000) — Number of orders to return
- `offset` (int, default: 0) — Number to skip
- `count_total` (bool, default: true) — Return total count
- `reverse` (bool, default: false) — Reverse order
- `key` (string, optional) — Pagination key for next page

**Returns:** Dictionary with sell orders and pagination

**When to use in digests:**
Use in every weekly digest to analyze market liquidity and pricing trends. Essential for understanding market depth and available inventory.

**Example:**
Show current ask prices for different credit classes and analyze price distribution.


### list_sell_orders_by_batch

List all sell orders for a specific credit batch.

**Parameters:**
- `batch_denom` (string, required) — Batch denomination to filter by
- `limit` (int, default: 100, max: 1000) — Number of orders to return
- `offset` (int, default: 0) — Number to skip
- `count_total` (bool, default: true) — Return total count
- `reverse` (bool, default: false) — Reverse order
- `key` (string, optional) — Pagination key

**Returns:** Dictionary with sell orders for specified batch

**When to use in digests:**
Use when analyzing pricing and liquidity for specific batches. Good for batch-level market analysis in monthly digests.


### list_sell_orders_by_seller

List all sell orders created by a specific seller.

**Parameters:**
- `seller` (string, required) — Seller address to filter by
- `limit` (int, default: 100, max: 1000) — Number of orders to return
- `offset` (int, default: 0) — Number to skip
- `count_total` (bool, default: true) — Return total count
- `reverse` (bool, default: false) — Reverse order
- `key` (string, optional) — Pagination key

**Returns:** Dictionary with sell orders for specified seller

**When to use in digests:**
Use when profiling major market participants. Helpful for "seller spotlight" sections in monthly digests.


### list_allowed_denoms

List all denominations approved for marketplace payments.

**Parameters:**
- `limit` (int, default: 100, max: 1000) — Number of denoms to return
- `offset` (int, default: 0) — Number to skip
- `count_total` (bool, default: true) — Return total count
- `reverse` (bool, default: false) — Reverse order
- `key` (string, optional) — Pagination key

**Returns:** Dictionary with allowed denoms (bank_denom, display_denom, exponent)

**When to use in digests:**
Use when new payment tokens are approved via governance. Relevant for marketplace infrastructure updates in monthly digests.


## Basket Module

Baskets are fungible pools of ecocredits meeting specific criteria. These tools provide access to basket information and composition.

### list_baskets

List all active ecocredit baskets.

**Parameters:**
- `limit` (int, default: 100, max: 1000) — Number of baskets to return
- `offset` (int, default: 0) — Number to skip
- `count_total` (bool, default: true) — Return total count
- `reverse` (bool, default: false) — Reverse order

**Returns:** Dictionary with baskets (basket_denom, name, disable_auto_retire, credit_type_abbrev, date_criteria, exponent, curator)

**When to use in digests:**
Use in monthly digests to show all available baskets and their characteristics. Essential when new baskets are created or when explaining basket functionality.

**Example baskets:**
- NCT (Nature Carbon Tonne)
- NBO (Nature Biodiversity Offset)


### get_basket

Get detailed information about a specific basket.

**Parameters:**
- `basket_denom` (string, required) — Basket denomination (e.g., `eco.uC.NCT`)

**Returns:** Dictionary with basket information

**When to use in digests:**
Use when profiling a specific basket or when explaining basket mechanics. Good for educational sections in weekly digests.


### list_basket_balances

List all credit batches held in a specific basket.

**Parameters:**
- `basket_denom` (string, required) — Basket denomination
- `limit` (int, default: 100, max: 1000) — Number of balances to return
- `offset` (int, default: 0) — Number to skip
- `count_total` (bool, default: true) — Return total count
- `reverse` (bool, default: false) — Reverse order

**Returns:** Dictionary with basket balances (basket_denom, batch_denom, balance)

**When to use in digests:**
Use to analyze basket composition and diversity. Essential for monthly basket health reports showing which batches are in each basket and in what quantities.


### get_basket_balance

Get balance of a specific credit batch within a basket.

**Parameters:**
- `basket_denom` (string, required) — Basket denomination
- `batch_denom` (string, required) — Credit batch denomination

**Returns:** Dictionary with balance

**When to use in digests:**
Use when analyzing specific batch contributions to baskets. Helpful for detailed basket composition analysis.


### get_basket_fee

Get current fee required to create a new basket.

**Parameters:** None

**Returns:** Dictionary with basket creation fee

**When to use in digests:**
Include when governance changes basket fees. Relevant for governance update sections in weekly or monthly digests.


## Analytics Module

Advanced analytical tools for portfolio impact assessment, market trend analysis, and methodology comparison. These tools synthesize on-chain data into higher-level insights.

### analyze_portfolio_impact

Analyze the ecological impact of a portfolio with advanced metrics.

**Parameters:**
- `address` (string, required) — Regen Network address (e.g., `regen1...`)
- `analysis_type` (string, default: `full`) — Type of analysis: `full`, `carbon`, `biodiversity`, or `diversification`

**Returns:** Dictionary with comprehensive impact analysis including:
- Ecological impact scores and metrics
- Portfolio composition breakdown
- Diversification metrics
- Optimization recommendations
- Risk assessment

**When to use in digests:**
Use in monthly digests to profile major ecosystem participants or community treasury. Excellent for "portfolio spotlight" sections showing impact metrics and diversification.

**Example:**
Analyze the Regen Foundation treasury to show total ecological impact, credit type diversity, and geographic distribution.


### analyze_market_trends

Analyze market trends across credit types with pricing and volume analysis.

**Parameters:**
- `time_period` (string, default: `30d`) — Time period: `7d`, `30d`, `90d`, or `1y`
- `credit_types` (list of strings, optional) — Credit types to analyze (e.g., `["C", "BIO"]`). If None, analyzes all types.

**Returns:** Dictionary with market trend analysis including:
- Price trends and volatility
- Volume trends and market activity
- Market sentiment indicators
- Projection insights

**When to use in digests:**
Use in every weekly digest to show market health and trends. Essential for understanding pricing dynamics, market depth, and trading activity across different credit types.

**Example:**
Show 30-day price trends for carbon credits (type C) and highlight market liquidity changes.


### compare_credit_methodologies

Compare different credit class methodologies for impact efficiency.

**Parameters:**
- `class_ids` (list of strings, required) — Credit class IDs to compare (minimum 2)

**Returns:** Dictionary with methodology comparison including:
- Methodology scores (additionality, measurability, permanence, co-benefits, scalability)
- Market performance metrics
- Investment recommendation scores
- Comparative analysis matrix

**When to use in digests:**
Use in monthly digests when explaining methodology differences or when helping stakeholders understand which credit classes to prioritize. Excellent for educational content comparing VCS, GHG Protocol, or other methodologies.

**Example:**
Compare C01, C02, and C03 to show which methodology has the highest impact scores and best market performance.


## Usage Patterns for Digest Generation

### Daily Digests
- **Governance:** `list_governance_proposals` (filter by active status)
- **Market:** `list_sell_orders` (new orders in last 24 hours)
- **Credits:** `list_credit_batches` (new issuances in last 24 hours)

### Weekly Digests
- **Governance:** `list_governance_proposals`, `get_governance_tally_result`, `list_governance_votes`
- **Market:** `list_sell_orders`, `analyze_market_trends` (7d period)
- **Credits:** `list_credit_batches` (week's issuances), `list_projects` (new projects)
- **Treasury:** `get_community_pool`

### Monthly Digests
- **Governance:** Full governance summary with all proposals, votes, and outcomes
- **Market:** `analyze_market_trends` (30d period), `list_sell_orders_by_seller` (top sellers)
- **Credits:** `list_classes` (new methodologies), `list_projects` (geographic breakdown), `list_credit_batches` (monthly totals)
- **Baskets:** `list_baskets`, `list_basket_balances` (composition analysis)
- **Treasury:** `get_community_pool`, `get_total_supply` (tokenomics)
- **Analytics:** `analyze_portfolio_impact` (treasury or major holders), `compare_credit_methodologies`

### Yearly Digests
- **All modules:** Comprehensive year-over-year analysis
- **Key metrics:** Total credits issued, total value locked, governance participation rate, market volume
- **Analytics:** `analyze_market_trends` (1y period), portfolio impact for all major stakeholders
- **Growth:** Account growth via `list_accounts`, project growth via `list_projects`


## Common Patterns

### Pagination Best Practices

Most list endpoints support pagination. For digest generation, you typically want complete data sets:

```python
# Get all proposals (not just first page)
page = 1
all_proposals = []
while True:
    result = await list_governance_proposals(page=page, limit=100)
    proposals = result.get("proposals", [])
    all_proposals.extend(proposals)

    pagination = result.get("pagination", {})
    if not pagination.get("next_key"):
        break
    page += 1
```

### Filtering Recent Activity

For daily and weekly digests, filter by date fields:

```python
# Get batches issued in the last 7 days
from datetime import datetime, timedelta

batches = await list_credit_batches(limit=1000)
recent_batches = [
    batch for batch in batches.get("batches", [])
    if batch.get("issuance_date") and
       datetime.fromisoformat(batch["issuance_date"]) > datetime.now() - timedelta(days=7)
]
```

### Cross-Module Queries

Many insights require combining data from multiple modules:

```python
# Get governance proposal with current tally
proposal = await get_governance_proposal(proposal_id=123)
tally = await get_governance_tally_result(proposal_id=123)
votes = await list_governance_votes(proposal_id=123, limit=1000)

# Combine for complete governance story
governance_summary = {
    "proposal": proposal,
    "tally": tally,
    "total_votes": len(votes.get("votes", [])),
    "participation_rate": calculate_participation(votes, total_staked)
}
```


## Error Handling

All tools return error dictionaries when requests fail:

```json
{
  "error": "Query failed: Not found",
  "retryable": false
}
```

When building digests, always check for errors and handle gracefully:

```python
result = await get_governance_proposal(proposal_id=999)
if "error" in result:
    # Log error, skip this item, or show placeholder
    logger.warning(f"Failed to fetch proposal 999: {result['error']}")
else:
    # Process successful result
    process_proposal(result)
```


## Rate Limiting and Performance

The Ledger MCP includes automatic retry logic with exponential backoff for transient errors (5xx, 429, timeouts). When generating digests:

- **Batch requests** when possible (use pagination efficiently)
- **Cache results** for expensive queries (especially analytics tools)
- **Parallelize** independent queries using `asyncio.gather()`
- **Use summary modes** when available (e.g., batch supply summaries)


## Conclusion

This reference covers all 45+ tools available through the Ledger MCP. Each tool is designed to provide specific blockchain data, and together they enable comprehensive ecosystem analysis.

For digest generation, the most commonly used tools are:
1. **Governance:** `list_governance_proposals`, `get_governance_tally_result`
2. **Credits:** `list_credit_batches`, `list_projects`, `list_classes`
3. **Market:** `list_sell_orders`, `analyze_market_trends`
4. **Treasury:** `get_community_pool`, `get_total_supply`
5. **Analytics:** `analyze_portfolio_impact`, `compare_credit_methodologies`

Combine these tools strategically to tell compelling stories about the Regen Network ecosystem's growth, governance, and ecological impact.
