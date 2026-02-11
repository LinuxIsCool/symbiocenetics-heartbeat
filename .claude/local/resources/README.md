# Resources

Local resource library organized by GitHub owner. Each resource is a cloned
repository. The actual repos live here but are not pushed to GitHub — only the
`registry.yaml` is tracked by git, serving as the manifest of what should be
cloned.

DVC is also initialized in this project for tracking non-repo resources (large
files, datasets, etc.) if needed later.


## Restoring resources on a new machine

```bash
./scripts/restore-resources.sh
```

This reads `registry.yaml` and clones any repos that aren't already on disk.


## Adding a new resource

1. Add an entry to `registry.yaml` under the appropriate owner
2. Run `./scripts/restore-resources.sh` to clone it
3. Commit the updated `registry.yaml`


## Layout

```
resources/
├── registry.yaml          Git-tracked manifest of all repos
├── linuxiscool/
│   ├── agentnet/          Cloned repo (gitignored)
│   ├── mothership-bridge/ Cloned repo (gitignored)
│   └── ...
└── another-user/
    └── some-repo/         Cloned repo (gitignored)
```
