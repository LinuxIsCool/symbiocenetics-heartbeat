# Phase 1 — Implementation Notes

This document records every decision made during Phase 1 implementation that
deviates from, clarifies, or augments the original specifications in
`regen-heartbeat.md` and `phase-1.md`. The original specs are unchanged and
remain the canonical design intent. This document is the record of what actually
shipped and why.

---

## 1. Documentation Directory: `docs/` → `content/docs/`

**Spec says:** Documentation lives in a top-level `docs/` directory.

**Implementation:** Documentation lives in `content/docs/`.

**Why:** Quartz renders everything inside `content/` and nothing outside it. A
top-level `docs/` directory would be invisible to the static site. Moving docs
into `content/docs/` means tutorials, guides, references, and explanations are
all rendered as first-class pages on the Quartz site, navigable alongside
digests. This was identified during architecture review before any code was
written.

**Impact:** All spec references to `docs/tutorials/`, `docs/guides/`, etc.
should be read as `content/docs/tutorials/`, `content/docs/guides/`, and so on.
The directory structure inside docs is otherwise identical to the spec.


## 2. Theme: Regen Green → GAIA AI Palette

**Spec says:** Theme colors derive from a Regen green palette:
- Primary: `#4A8C5C`
- Secondary: `#2D5A3D`
- Background: `#FAFAF8` (warm off-white)
- Text: `#2C3E2D` (dark green-gray)

**Implementation:** Theme uses the GAIA AI dark palette, inspired by
[paragraph.com/@gaiaai](https://paragraph.com/@gaiaai):

| Role | Light Mode | Dark Mode |
|------|-----------|-----------|
| Background | `#F0F2F0` | `#0A0A0A` |
| Light gray | `#D8DCD8` | `#1A1A1A` |
| Gray | `#8A9A8A` | `#4A4A4A` |
| Dark gray | `#2A3A2A` | `#A3A3AF` |
| Text | `#0F1A0F` | `#ECECEC` |
| Secondary | `#1A9A4A` | `#22C55E` |
| Tertiary | `#22C55E` | `#16A34A` |
| Highlight | `rgba(34, 197, 94, 0.08)` | `rgba(34, 197, 94, 0.10)` |
| Text highlight | `rgba(34, 197, 94, 0.15)` | `rgba(34, 197, 94, 0.18)` |

**Why:** The GAIA AI brand aesthetic — electric green on near-black — is more
distinctive and more aligned with the project's identity than the original
muted Regen green. The dark-first design also reads better for a technical
observatory site.

**`settings.json` updated to match:**
```json
"theme": {
  "primary": "#22C55E",
  "secondary": "#16A34A",
  "background": "#0A0A0A",
  "text": "#ECECEC"
}
```


## 3. Typography

**Spec says:** Schibsted Grotesk / Source Sans Pro / IBM Plex Mono.

**Implementation:** Space Mono / DM Sans / JetBrains Mono.

**Why:** Space Mono gives headers a distinctive monospaced character that
suits an observatory/data project. DM Sans is clean and highly legible for
body text. JetBrains Mono is a well-regarded code font with ligatures. The
combination has more personality than the spec's choices while remaining
highly readable.


## 4. CLAUDE.md Filtered from Quartz

**Spec says:** `ignorePatterns` includes `"private"`, `"templates"`,
`".claude"`, `"node_modules"`.

**Implementation:** Added `"**/CLAUDE.md"` to `ignorePatterns`.

**Why:** CLAUDE.md files exist in every directory inside `content/` (they are
part of the README.md + CLAUDE.md convention). Without this filter, Quartz
would render them as pages. They contain Claude-specific context (`@README.md`
tags and operational notes) that is not meaningful to human site visitors.
Filtering them keeps the site clean without removing the files from the repo.


## 5. Wikilinks for the Force-Directed Graph

**Spec says:** Nothing about inter-document linking.

**Implementation:** All content-directory README.md files and `index.md` use
Quartz-compatible wikilinks (`[[page|label]]` syntax) to create connections
between pages.

**Link topology:**
- `index.md` (homepage) links to digests, docs, references, and explanations
- `docs/README.md` links to all four Diataxis subcategories
- Each subcategory README links to its children and its sibling categories
- `digests/README.md` links to references and the ecosystem explanation
- Cross-links between tutorials ↔ guides ↔ reference ↔ explanations

**Why:** Quartz has a built-in force-directed graph that visualizes page
connections. Without wikilinks, every page is an isolated node. The links
create a navigable knowledge graph that makes the relationships between
documentation pages visible and browseable. This also serves the educational
purpose — it demonstrates how Quartz's ObsidianFlavoredMarkdown plugin
resolves wikilinks into both hyperlinks and graph edges.


## 6. README Quality and Frontmatter

**Spec says:** Each README should be "3-8 sentences."

**Implementation:** Content-directory READMEs are multi-paragraph documents
(typically 4-8 paragraphs) with YAML frontmatter containing a `title:` field.
Non-content READMEs (templates, .claude directories) are 3-4 substantive
paragraphs.

**Why:** The original constraint was too tight for pages that serve as section
landing pages on the Quartz site. A README for the Documentation hub, for
instance, needs to explain the Diataxis framework, describe each quadrant,
and link to child pages — that cannot be done well in 3-8 sentences. The
YAML frontmatter is required by Quartz for proper page titles; without it,
Quartz falls back to the filename.


## 7. Syntax Highlighting Configuration

**Spec says:** `Plugin.SyntaxHighlighting()` with no options.

**Implementation:**
```typescript
Plugin.SyntaxHighlighting({
  theme: {
    light: "github-light",
    dark: "vitesse-dark",
  },
  keepBackground: false,
})
```

**Why:** The default Shiki themes clash with the GAIA AI dark palette.
`vitesse-dark` has green-tinted accents that complement the site theme.
`keepBackground: false` lets syntax blocks inherit the page background
rather than painting their own, keeping the visual language consistent.


## 8. Additional Quartz Plugin Options

**Spec says:** Bare plugin invocations with defaults.

**Implementation:** Several plugins received explicit configuration:

| Plugin | Option | Value | Why |
|--------|--------|-------|-----|
| ObsidianFlavoredMarkdown | `enableInHtmlEmbed` | `false` | Prevents parsing issues in HTML blocks |
| CrawlLinks | `markdownLinkResolution` | `"shortest"` | Resolves ambiguous links by shortest path |
| ContentIndex | `enableSiteMap` | `true` | SEO and discoverability |
| ContentIndex | `enableRSS` | `true` | Enables RSS feed for digest subscribers |
| Favicon | (added) | default | Spec omitted this; added for completeness |

**Why:** These are quality-of-life improvements discovered during build
testing. The RSS feed is particularly relevant — it lets users subscribe to
new digests without visiting the site.


## 9. Quartz Installation Method

**Spec says:** Nothing specific about how Quartz is installed.

**Implementation:** Quartz was installed by cloning the
[jackyzha0/quartz](https://github.com/jackyzha0/quartz) repository into a
temporary directory, copying the framework files (quartz/, package.json,
tsconfig.json, etc.) into the project, and running `npm install`. The
`quartz/` directory contains the full Quartz framework source.

**Why:** Quartz is not distributed as an npm package. It is designed to be
cloned and customized. The standard installation method is `npx quartz create`,
but that requires an interactive terminal. Cloning and copying achieves the
same result in an automated context.


## 10. Quartz Layout Customization

**Spec says:** `quartz.layout.ts` exists for layout customization, no details.

**Implementation:** Footer links were customized:
```typescript
footer: Component.Footer({
  links: {
    "Regen Network": "https://regen.network",
    GitHub: "https://github.com/gaiaaiagent/regen-heartbeat",
    "KOI Knowledge Base": "https://regen.gaiaai.xyz",
  },
}),
```

**Why:** The default Quartz footer links to Quartz's own documentation. The
customized footer points to project-relevant resources instead.


---

## Summary of Deviations

| # | Area | Spec | Implementation | Severity |
|---|------|------|---------------|----------|
| 1 | Docs path | `docs/` | `content/docs/` | Structural (required by Quartz) |
| 2 | Theme colors | Regen green on off-white | GAIA AI green on black | Visual (user-requested) |
| 3 | Typography | Schibsted/SourceSans/IBMPlex | SpaceMono/DMSans/JetBrains | Visual (user-requested) |
| 4 | CLAUDE.md filter | Not specified | `**/CLAUDE.md` in ignorePatterns | Additive (user-requested) |
| 5 | Wikilinks | Not specified | Added throughout content | Additive (user-requested) |
| 6 | README quality | 3-8 sentences | Multi-paragraph with frontmatter | Enhancement (user-requested) |
| 7 | Syntax theme | Default | github-light / vitesse-dark | Visual (follows theme change) |
| 8 | Plugin options | Defaults | Explicit configuration | Additive |
| 9 | Installation | Not specified | Clone and copy | Procedural |
| 10 | Footer links | Not specified | Regen-specific links | Additive |

Most deviations fall into two categories: things required by Quartz's
architecture (items 1, 9) and things requested by the user during review
(items 2-6). None contradict the spec's intent — they refine it.
