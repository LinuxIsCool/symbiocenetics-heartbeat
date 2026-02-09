@README.md

This skill references the yearly template directory at `templates/yearly/` and pulls configuration from settings.json, including default template paths and digest output locations. When invoked, it reads monthly digests from the target year, loads the template, gathers supplementary data from MCPs, and writes the finished rollup digest to the appropriate location in `content/digests/`.
