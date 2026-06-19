# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Stack

- **Frontend**: React 19 + TypeScript, Vite, Tailwind CSS v4, TanStack Router/Query
- **Data**: OpenDota SQL explorer API (`https://api.opendota.com/api/explorer`), queried directly from the browser
- **Deploy**: Static SPA on Cloudflare Pages (`dist/`)

## Commands

### Root

- `make dev` / `pnpm dev` — Dev server
- `make build` / `pnpm build` — Production build (`dist/`)
- `make lint` / `pnpm lint` — ESLint
- `make format` / `pnpm format` — Prettier
- `node src/scripts/generate-constants.js` — Refresh heroes/items static JSON from dotaconstants

## Code Style

- 4-space indent, 120 char line width
- Prettier handles formatting, ESLint handles quality
- Tailwind CSS v4 (uses `@tailwindcss/vite` plugin, not PostCSS)

## Project Architecture

- **SPA** (`src/`): All match/series data fetched at runtime from OpenDota explorer
- **API layer** (`src/api/index.tsx`): Public seam for routes/hooks; implemented via `src/lib/opendota/*`
- **Static data** (`src/assets/static_data/`): Heroes, items, neutrals, popular shortcuts bundled at build time

## React Patterns (Non-Obvious)

- Use `router.navigate({ replace: true })` for URL filter updates without rerender

## OpenDota (Non-Obvious)

- Explorer queries must stay under ~10s or OpenDota drops the request
- Match list/detail queries are fast (~0.2s); series list is built client-side by grouping match rows
- Match queries filter to premium/professional leagues with registered teams (no team allowlist)
- Rate limit: ~60 req/min per IP; TanStack Query caching reduces repeat calls
- CSP `connect-src` in `public/_headers` must include `https://api.opendota.com`

## Gotchas

- No backend — do not add `VITE_API_URL` or server-side API code
- `match_id` values are safe as JS numbers (below `Number.MAX_SAFE_INTEGER`)
