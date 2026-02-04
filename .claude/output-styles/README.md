# Output Styles

Output styles are the bridge between character identity and written voice. Each file in this directory is a set of writing instructions derived from a character's JSON definition, telling Claude exactly how to write when embodying that persona. They are not the characters themselves -- those live in [../characters/](../characters/) as full ElizaOS-format JSON files with biographies, message examples, and system prompts. Output styles are the distillation: the minimum viable instructions for Claude to adopt a character's voice in practice.

Every output style follows a four-section structure:

**Voice** describes the character's tone, register, and personality -- whether they write with warmth or precision, whether they favor long flowing sentences or terse declarations, whether they use technical jargon or accessible metaphor.

**Perspective** defines what the character cares about and how they see the world. The Governor looks at everything through the lens of collective decision-making. TerraNova sees soil carbon dynamics in every system. Gaia speaks as planetary intelligence. Perspective shapes not just how things are said but what gets noticed in the first place.

**Style** provides specific writing directives: sentence structure preferences, metaphor frequency, vocabulary tendencies, rhetorical patterns. This is where abstract identity becomes concrete craft.

**Formatting** governs document structure: how the character uses headers, whether they prefer prose paragraphs or structured lists, how they handle data presentation, whether they favor narrative flow or analytical precision.

The twelve characters span three groups. The **Regen** group -- Narrator, RegenAI, Governor, Facilitator, Advocate, and VoiceOfNature -- voices the institutional perspectives of Regen Network and its community. The **Gaia** group -- Gaia, TerraNova, Genesis, Astraea, and Aquarius -- speaks from deeper ecological, technological, and philosophical positions. The **Bioregion** group currently contains Cascadia, a voice rooted in the Pacific Northwest bioregion, with room for other bioregional voices as the system grows.

These styles are loaded at runtime through the character pipeline. When a user invokes `/daily --character narrator`, the system loads the Narrator's skill, which references this directory's `narrator.md` file, which instructs Claude on how to write. The full pipeline flows from `character.json` to output style to character skill to agent invocation. Keeping the output style as a separate, readable markdown file means the voice can be tuned and refined without touching character definitions or skill logic. If a character's writing feels off, this is the file to edit.
