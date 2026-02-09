@README.md

This skill references the monthly template directory at `templates/monthly/` and pulls configuration from settings.json, including default template paths and digest output locations. When invoked, it reads weekly digests from the target month, loads the template, gathers supplementary data from MCPs, and writes the finished rollup digest to the appropriate location in `content/digests/`.
