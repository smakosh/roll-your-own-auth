# ryo-auth

Add copy-paste auth code to your project — shadcn style. Part of [Roll your own Auth](https://github.com/smakosh/roll-your-own-auth).

Instead of installing an auth SDK, `ryo-auth` copies real, editable source files straight into your project. You own the code.

## Usage

```sh
# list available components
npx ryo-auth@latest list

# add a component
npx ryo-auth@latest add session-express-prisma
```

### `add`

```
ryo-auth add [components...]

Options:
  -c, --cwd <cwd>      the working directory (default: current dir)
  -p, --path <path>    directory to write files into, relative to cwd
  -o, --overwrite      overwrite existing files
  -y, --yes            skip prompts; skip existing files instead of overwriting
```

Files are written to their registry-defined targets (e.g. `src/features/auth/...`). Existing files trigger an overwrite prompt unless `--overwrite` or `--yes` is passed. After writing, the CLI prints the exact install command for your detected package manager (npm/pnpm/yarn/bun).

## Registry

Components live in [`registry/`](./registry). Each is a JSON file listing its `files` (with `target` paths + `content`) and its runtime/dev `dependencies`. `index.json` is the catalogue.

By default the CLI reads the registry bundled with the package. Point it at a hosted or local registry with:

```sh
RYO_AUTH_REGISTRY_URL=https://example.com/registry npx ryo-auth add session-express-prisma
```

## Development

```sh
pnpm install
pnpm build      # bundle to dist/ via tsup
pnpm typecheck
node dist/index.js list
```
