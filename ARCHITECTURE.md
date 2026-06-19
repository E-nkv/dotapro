# Dotapro Architecture

## Overview

Static React SPA for professional Dota 2 match analytics. Data is fetched at runtime from the OpenDota SQL explorer API. There is no custom backend.

## Infrastructure

| Service          | Purpose            |
| ---------------- | ------------------ |
| Cloudflare Pages | Static SPA hosting |
| OpenDota API     | Match/series data  |

## Directory Structure

```
src/
  api/           - Public data-fetching API (routes import from here)
  lib/opendota/  - Explorer client, SQL builders, response mappers
  constants/     - Pagination limits
  components/    - UI components
  routes/        - TanStack Router pages
  assets/static_data/  - Heroes, items, neutrals (bundled JSON)
public/          - Static assets, _headers (CSP)
dist/            - Production build output
```

## Data Flow

```
User → React UI → OpenDota explorer API → JSON rows → mappers → components
```

## Pro Match Filter

Match queries filter to premium/professional tier leagues with both teams registered and named. Users can further narrow by team, league, hero, or player via URL filters.

## API Layer (client-side)

`src/api/index.tsx` exposes `getMatches`, `getMatchById`, `getSeries`, `getSeriesById`, search helpers, and name lookups — all backed by OpenDota SQL via `src/lib/opendota/`.

## Series List Strategy

Series are derived client-side by grouping match rows on `series_id` (avoids slow SQL aggregation on OpenDota).

## Deployment

```bash
pnpm build
```

Deploy `dist/` to Cloudflare Pages. CSP in `public/_headers` allows `connect-src` to `https://api.opendota.com`.
