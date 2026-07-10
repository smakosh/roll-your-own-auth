---
"ryo-auth": minor
---

Complete the CLI: registry-driven `init` prompts that can no longer dead-end (including the NestJS + Postgres JWT combo), a new `list` command, `--server-dir`/`--client-dir`/`--force` options for `init`, dependency install hints after `add`, portable file operations (no more shelling out to `rm`/`mv`/`find`), safe temp directories, `--version`/`--help` output, and upgraded dependencies (commander 15, @inquirer/prompts 8, chalk 5.6, tsup 8, TypeScript 5.9). `init` now refuses to overwrite non-empty directories unless `--force` is passed.
