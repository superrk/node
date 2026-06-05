# AGENTS.md — Node Docs Wiki

## What this is

A VitePress documentation site (personal wiki/notes). Content is in Chinese.  
Deployed via GitHub Actions to `https://<user>.github.io/node/`.

## Commands

```bash
npm run docs:dev      # dev server with HMR
npm run docs:build    # production build → docs/.vitepress/dist
npm run docs:preview  # preview production build locally
```

No test, lint, or typecheck scripts exist. Build errors surface during `docs:build`.

## Structure

- `docs/2025/`, `docs/2026/` — content organized by year
- `docs/.vitepress/config.mts` — custom sidebar auto-generated from frontmatter `order` field
- `.github/workflows/deploy.yml` — CI: `npm ci` → `npm run docs:build` (Node 22, ubuntu-latest)

## Layout & conventions

- Each `.md` page under a year directory should include frontmatter: `title`, `order`
- Sidebar is ordered by the `order` field (lower = first)
- `index.md` at root of a year directory is the section landing page
- Base URL is `/node/` — links in VitePress config must account for this

## CI

- Pushes to `main` trigger automatic deploy to GitHub Pages
- Build artifact path: `docs/.vitepress/dist`
