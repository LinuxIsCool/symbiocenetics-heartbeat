# Agent Files

Agent files bridge Claude Code's interactive skill system and GitHub Actions' headless execution. They solve the "skill gap" — the fact that skills (`.claude/skills/`) only work in interactive sessions, not in CI.

In an interactive session, a human types `/daily` and the skill system loads the SKILL.md file. In CI, a GitHub Actions workflow tells Claude to "read and follow the instructions in `.claude/agents/daily-digest.md`." The agent file contains the same instructions as the skill, adapted for autonomous execution.

## How Agent Files Work

```
Interactive                          CI (GitHub Actions)
────────────                         ───────────────────
User types /daily                    Cron triggers workflow
  → Skill loads SKILL.md               → Action loads CLAUDE.md
  → Claude reads template               → Prompt says: read agents/daily-digest.md
  → Claude queries MCPs                  → Claude reads agents/daily-digest.md
  → Claude writes digest                 → Claude reads template
  → Output to terminal + file            → Claude queries MCPs
                                         → Claude writes digest
                                         → Post-step commits and pushes
```

## Agent File Structure

Each agent file is a markdown document (no frontmatter — agent files are not skills). The content includes:

1. **Identity and context** — what this agent is, what cadence it serves, and a reminder that it is running autonomously in CI.
2. **Skill reference** — a pointer to the corresponding skill for detailed data-gathering instructions.
3. **CI-specific adaptations** — what to do differently in headless mode: no terminal output, graceful degradation when data sources are unavailable, always produce a file.
4. **Template reference** — which template to load and how to interpret the `<!-- source: -->` annotations.
5. **Output conventions** — the exact file path pattern, YAML frontmatter schema, and directory creation requirements.
6. **Quality guidance** — reference to the ethos and voice standards.

## Files

| Agent File | Cadence | Corresponding Skill | Schedule |
|------------|---------|-------------------|----------|
| `daily-digest.md` | Daily | `.claude/skills/daily/SKILL.md` | Every day at 08:00 UTC |
| `weekly-digest.md` | Weekly | `.claude/skills/weekly/SKILL.md` | Mon, Wed, Fri at 10:00 UTC |
| `monthly-digest.md` | Monthly | `.claude/skills/monthly/SKILL.md` | 1st and 15th at 12:00 UTC |
| `yearly-digest.md` | Yearly | `.claude/skills/yearly/SKILL.md` | Manual (solstices, equinoxes, New Year) |

## Relationship to Skills

The agent file and the skill are siblings, not replacements. The skill is the interactive entry point. The agent file is the CI entry point. When one changes, the other should be updated to match.

Agent files reference their corresponding skills to keep instructions DRY. They add only the CI-specific layer: no terminal output, graceful degradation, always write file.
