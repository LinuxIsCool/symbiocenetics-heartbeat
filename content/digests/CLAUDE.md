@README.md

The temporal hierarchy is strict: daily digests go to `YYYY/MM/DD/daily.md`, weekly digests to `YYYY/MM/weekly/YYYY-WNN.md`, monthly digests to `YYYY/MM/monthly/index.md`, and yearly digests to `YYYY/yearly/index.md`. Daily files are named `daily.md` rather than `index.md` to avoid colliding with Quartz's FolderPage emitter, which generates its own `index.html` for every directory. This structure lets us navigate time at different granularities and makes it easy to reference historical context when generating new digests.
