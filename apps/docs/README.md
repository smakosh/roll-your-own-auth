# Roll Your Own Auth — Docs

The documentation site for [roll-your-own-auth](https://github.com/smakosh/roll-your-own-auth), built with [Fumadocs](https://fumadocs.dev) on Next.js (static export).

## Development

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

Content lives in `content/docs` as MDX. Sidebar structure and titles come from each folder's `meta.json` and the pages' frontmatter.

## Build

```bash
pnpm build
```

The site is exported statically to `out/`. `llms.txt`, `llms-full.txt`, per-page markdown (`/llms.mdx/.../content.md`) and a static search index (`/api/search`) are generated at build time.
