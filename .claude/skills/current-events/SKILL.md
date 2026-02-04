---
name: current-events
description: Search the web for current events relevant to the Regen ecosystem
---

Search the web for current events relevant to the Regen ecosystem and synthesize
findings into a structured report.

## Behavior

1. Read `settings.json` to get the default topic list from `currentEvents.topics`
2. Parse arguments:
   - `--topic "custom topic"` — search for a specific topic instead of defaults
   - `--include-defaults` — when used with `--topic`, also search the default topics
   - `--creative` — generate 2-3 additional search terms based on your understanding
     of the current Regen context and what might surface interesting connections
   - `--deep` — after the first round of results, generate 2-3 follow-up queries
     targeting gaps, contradictions, or interesting threads in the initial findings
   - `--character name` — voice the report through a character persona (loads the
     character skill at `.claude/skills/{name}/SKILL.md`)
3. Execute web searches using the `WebSearch` tool for each applicable topic
4. If `--creative` is set, generate novel search terms and search those too
5. If `--deep` is set, review all results so far and generate follow-up queries
6. Synthesize all results into a structured report organized by topic area
7. If `--character` is specified, load the character skill and voice the entire report
8. Render the report to the terminal — do not save to file unless the user requests it

## Example Invocations

```
/current-events
/current-events --topic "ETHDenver 2026"
/current-events --topic "carbon markets" --include-defaults
/current-events --creative --deep
/current-events --character narrator
/current-events --creative --deep --character voiceofnature
```

## Data Sources

- **WebSearch** tool — primary source for current events
- `settings.json` — default topic list at `currentEvents.topics`

## Output Format

The report should have:
- A brief introduction stating what was searched and when
- A section for each topic area with key findings
- Connections between topics where relevant
- A closing section noting what deserves further investigation
