# Phase 2 Research — Claude GitHub Integration Paths

A research supplement to `@.claude/specs/phase-2.md` and
`@.claude/specs/phase-2-local-automation.md`. This document evaluates whether
any of the three Claude-on-GitHub integration paths could replace the local
server automation (Architecture E) and eliminate API costs. The conclusion is
that none of them can today, but the landscape is shifting and worth monitoring.

Research conducted 2026-02-04 using parallel subagents across Claude Code
documentation, GitHub changelogs, Anthropic community forums, and the
`claude-code-action` issue tracker.

---

## Three Integration Paths

There are three distinct ways to run Claude against a GitHub repository. They
are frequently conflated in documentation and discussion, but they are
architecturally different systems with different billing models.

### Path A: `claude-code-action` (GitHub Action)

**What it is.** A GitHub Actions step that runs Claude Code headlessly inside
a GitHub-hosted runner. You define a workflow YAML, the action spins up Claude
Code, and Claude executes against your repository. This is Anthropic's official
offering for CI/CD integration.

- **Repository**: [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action)
- **Marketplace**: [Claude Code Action Official](https://github.com/marketplace/actions/claude-code-action-official)
- **Runs on**: GitHub-hosted runner (`ubuntu-latest`)
- **Triggers**: PR events, issue comments, `@claude` mentions, `workflow_dispatch`, `schedule` (cron)
- **MCP support**: Full, via `--mcp-config`
- **CLAUDE.md support**: Yes — reads project conventions, skills, output styles
- **Billing**: Anthropic API credits (per-token)

This is the Architecture B described in the Phase 2 spec. It is the most
capable path but requires an `ANTHROPIC_API_KEY` for reliable automation.

### Path B: The Claude GitHub App (`/install-github-app`)

**What it is.** A guided setup command in Claude Code that installs the
[Claude GitHub App](https://github.com/apps/claude) on your repository and
configures `claude-code-action`. Running `/install-github-app` automates
three manual steps:

1. Install the GitHub App (grants repository permissions for contents,
   issues, and pull requests)
2. Generate an `ANTHROPIC_API_KEY` at console.anthropic.com
3. Store the key as a GitHub repository secret

**Path B is not a separate product.** It is a convenience wrapper around
Path A. The GitHub App itself only provides the repository-level permissions
that `claude-code-action` needs. The actual intelligence runs inside the
GitHub Action, billing against the same API key. Installing the app does not
connect your Max plan subscription to GitHub.

- **Billing**: Anthropic API credits (identical to Path A)
- **Max plan support**: No

### Path C: Claude as a GitHub Copilot Coding Agent

**What it is.** A completely separate integration announced on 2026-02-04 via
[GitHub's changelog](https://github.blog/changelog/2026-02-04-claude-and-codex-are-now-available-in-public-preview-on-github/).
Claude Sonnet 4.5 is available as a coding agent within GitHub Copilot,
alongside Copilot's own agent and OpenAI Codex. This is GitHub's system, not
Anthropic's.

- **Access**: Requires GitHub Copilot Pro+ ($39/month) or Copilot Enterprise
- **Runs on**: GitHub's infrastructure (Actions-powered sandbox)
- **Trigger**: Assign an issue to Claude via the Assignees dropdown, or
  programmatically via GraphQL API
- **Output**: Generates a draft pull request
- **MCP support**: Yes, with limitations (no OAuth-authenticated servers,
  tools only — no resources or prompts, configured via GitHub UI not code)
- **CLAUDE.md support**: No. Reads `.github/copilot-instructions.md` and
  `AGENTS.md` instead.
- **Billing**: GitHub Copilot premium requests (not Anthropic API)

---

## Billing Summary

| Path | Billing Mechanism | Uses Max Plan? | Monthly Cost for Daily Digests |
|------|-------------------|----------------|-------------------------------|
| A: `claude-code-action` | Anthropic API credits | No | $30–90 (Sonnet) |
| B: `/install-github-app` | Anthropic API credits | No | $30–90 (same as A) |
| C: Copilot Coding Agent | GitHub premium requests | No | ~$0–5 (within Copilot Pro+ allowance) |
| E: Local cron + Max plan | Max subscription | Yes | $0 |

Path C deserves a closer look. It bills through GitHub, not Anthropic, so the
per-run cost is measured in premium requests rather than API tokens. With
Copilot Pro+ ($39/month, 1,500 premium requests included), daily digest
generation might fit within the allowance. But the limitations are severe
enough to disqualify it for our use case.

---

## Why Path C (Copilot Coding Agent) Doesn't Work for Us

Despite its appealing billing model, Path C fails on five requirements:

### 1. No CLAUDE.md Ecosystem

The Copilot coding agent reads `.github/copilot-instructions.md` and
`AGENTS.md`, not CLAUDE.md. It has no concept of `.claude/` directories,
output styles, character skills, or the agent file pattern. The entire
character pipeline — the defining feature of Regen Heartbeat — would need to
be rebuilt in a different instruction format.

### 2. Limited MCP Integration

MCP servers are configured through the GitHub repository settings UI, not
through code. OAuth-authenticated remote servers are not supported. Only tools
are available — no MCP resources or prompts. The KOI MCP server could
potentially work as a stdio server, but the configuration is not version-
controlled and harder to reproduce.

### 3. Unreliable Programmatic Triggering

Assigning issues to Claude via the REST API reportedly produces 422 errors
([Discussion #164267](https://github.com/orgs/community/discussions/164267)).
The GraphQL path works but requires three separate queries with special
headers:

1. Fetch the issue node ID
2. Query `suggestedActors` for Copilot's actor ID
3. Execute `replaceActorsForAssignable` mutation with
   `GraphQL-Features: issues_copilot_assignment_api_support`

This is fragile infrastructure for a daily automation pipeline.

### 4. Output Format Mismatch

The Copilot coding agent generates draft pull requests. Our pipeline needs
a commit directly to main (triggering the Quartz deploy). Converting from
draft PRs to direct commits adds unnecessary complexity and a manual merge
step that defeats the purpose of automation.

### 5. Public Preview Status

The integration was announced today (2026-02-04). It is in public preview.
Building production automation on a preview feature is premature.

---

## The OAuth Token Path (Max Plan in GitHub Actions)

There is a fourth possibility that sits between Paths A/B and Architecture E:
using `CLAUDE_CODE_OAUTH_TOKEN` in `claude-code-action` to bill against your
Max plan subscription in GitHub Actions. This would give us the reliability of
managed infrastructure with the cost benefit of the Max plan.

Anthropic has added official support for this path. You generate a token with
`claude setup-token` and store it as a GitHub secret:

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
```

**However, three P1 bugs make this path unusable for scheduled automation:**

| Bug | Issue | Impact |
|-----|-------|--------|
| Token expires in ~1 day | [#727](https://github.com/anthropics/claude-code-action/issues/727) | Must regenerate daily — defeats automation |
| Token cleared between action phases | [#676](https://github.com/anthropics/claude-code-action/issues/676) | Auth works in prepare step, fails in execute step |
| SDK crashes with AJV validation error | [#872](https://github.com/anthropics/claude-code-action/issues/872) | Immediate crash, no output |

Community demand for this to work is high ([Issue #4](https://github.com/anthropics/claude-code-action/issues/4)
has 77+ upvotes, and Anthropic's response received 65 downvotes). But the bugs
are unresolved.

**When these bugs are fixed, this path becomes the ideal architecture** — it
combines the managed reliability of GitHub Actions with the zero marginal cost
of the Max plan. It should be monitored and adopted when stable.

---

## Recommendation

The analysis reinforces the existing Phase 2 architecture decisions:

| Role | Architecture | Reason |
|------|-------------|--------|
| **Primary automation** | E: Local cron + Max plan | $0 additional cost, full MCP/CLAUDE.md support |
| **Fallback** | B: `claude-code-action` + API key | Managed infrastructure, reliable auth |
| **Future primary** | B + OAuth token | When [#727](https://github.com/anthropics/claude-code-action/issues/727), [#676](https://github.com/anthropics/claude-code-action/issues/676), [#872](https://github.com/anthropics/claude-code-action/issues/872) are resolved |
| **Not suitable** | C: Copilot Coding Agent | No CLAUDE.md, limited MCP, unreliable trigger |
| **Not useful** | `/install-github-app` | Convenience wrapper for Path A, requires API key |

### Issues to Monitor

| Issue | What Changes If Resolved |
|-------|--------------------------|
| [#727](https://github.com/anthropics/claude-code-action/issues/727) — Refresh tokens for Max | OAuth tokens stop expiring, enabling Max plan in GitHub Actions |
| [#676](https://github.com/anthropics/claude-code-action/issues/676) — Token cleared between phases | OAuth auth works end-to-end in the action |
| [#872](https://github.com/anthropics/claude-code-action/issues/872) — SDK AJV crash | OAuth path stops crashing |
| [#10334](https://github.com/anthropics/claude-code/issues/10334) — Headless token refresh | Local cron (`claude -p`) stops needing manual re-auth |
| [#7100](https://github.com/anthropics/claude-code/issues/7100) — Document headless auth | Official guidance on subscription auth in automation |

When the first three are resolved, Architecture B with OAuth becomes the
recommended path and Architecture E becomes the fallback. When the fourth is
resolved, Architecture E becomes fully hands-off.

---

## Sources

- [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action) — Official GitHub Action
- [Claude GitHub App](https://github.com/apps/claude) — Repository permissions app
- [Issue #4: Max subscription support](https://github.com/anthropics/claude-code-action/issues/4) — 77+ upvotes
- [Issue #727: Refresh tokens](https://github.com/anthropics/claude-code-action/issues/727) — Token expiry
- [Issue #676: Token cleared](https://github.com/anthropics/claude-code-action/issues/676) — Auth phase bug
- [Issue #872: SDK crash](https://github.com/anthropics/claude-code-action/issues/872) — AJV error
- [Issue #814: OIDC cron bug](https://github.com/anthropics/claude-code-action/issues/814) — Cron auth failure
- [Issue #10334: Headless token refresh](https://github.com/anthropics/claude-code/issues/10334) — Local auth expiry
- [Issue #7100: Document headless auth](https://github.com/anthropics/claude-code/issues/7100) — Missing docs
- [Claude and Codex on GitHub (2026-02-04)](https://github.blog/changelog/2026-02-04-claude-and-codex-are-now-available-in-public-preview-on-github/) — Copilot agent announcement
- [MCP and Copilot Coding Agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/mcp-and-coding-agent) — MCP limitations
- [Copilot Coding Agent docs](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent) — Capabilities
- [Copilot Plans and Pricing](https://github.com/features/copilot/plans) — Premium request costs
- [Discussion #164267: REST API assignment](https://github.com/orgs/community/discussions/164267) — 422 errors
- [Discussion #167564: Automated PR via agent](https://github.com/orgs/community/discussions/167564) — Unresolved
- [Using Claude Code with Pro/Max](https://support.claude.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan) — Subscription auth
- [TechCrunch: Rate limit crackdown](https://techcrunch.com/2025/07/28/anthropic-unveils-new-rate-limits-to-curb-claude-code-power-users/) — Background usage limits
