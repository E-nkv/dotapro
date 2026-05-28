# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Stack
- **UI**: React 19 + TypeScript, Vite, Tailwind CSS v4, TanStack Router/Query
- **API**: Go 1.25, Chi router, Bun ORM, SQLite with FTS5
- **Scraper**: Go 1.25, reads OpenDota API, writes to SQLite
- **Database**: SQLite with golang-migrate (WAL mode, FTS5 trigram tokenizer)

## Commands

### Root
- `make build` - Build both binaries for Linux AMD64 (`.build/api`, `.build/scraper`)
- `make run-api` - Run API locally on `:8080` (auto-runs migrations on first boot)
- `make run-scraper` - Run scraper as a one-shot (writes to same DB as API)
- `make run-ui` - Run UI dev server
- `make app-tidy` - Run `go mod tidy` in `app/`

### App (`app/`)
All Go code lives in `app/` as a single Go module with two entry points:
- `app/cmd/api/main.go` - HTTP API server
- `app/cmd/scraper/main.go` - OpenDota scraper (one-shot, triggered by systemd timer)
- Shared packages: `app/types/`, `app/db/`, `app/config/`, `app/constants/`, `app/utils/`

### UI (`ui/`)
- `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm format`
- Tests not configured yet

## Code Style

### Go
- Linter: golangci-lint with errcheck, goconst, govet, revive, staticcheck, unused
- Staticcheck excludes ST1000, ST1005 (no requirement for package comments or doc for exported vars)
- Logs use zerolog

### React/TypeScript
- 4-space indent, 120 char line width
- Prettier handles formatting, ESLint handles quality
- Tailwind CSS v4 (uses `@tailwindcss/vite` plugin, not PostCSS)

## Project Architecture

- **API** (`app/cmd/api`): Chi HTTP server, serves `/matches`, `/series`, `/filtersmetadata/*`, `/allowedteams`
- **Scraper** (`app/cmd/scraper`): One-shot, triggered every 5 min by systemd timer, reads from OpenDota explorer API
- **DB**: Single SQLite file (`/opt/dotapro/data/dotapro.db` on prod), WAL mode, FTS5 trigram search
- **Deploy**: Binaries rsynced to DO droplet, systemd services (`dotapro-api.service`, `dotapro-scraper.service` + timer), Caddy reverse proxy
- **UI**: SPA on Cloudflare Pages, `VITE_API_URL` env var points to API

## Go Patterns (Non-Obvious)
- Use `*int64` only for nullable DB fields (captains), otherwise use zero values
- Prefix OpenDota types with `OD` to distinguish them
- Always pass `context.Context`, check errors early
- zerolog for logging, minimal comments

## React Patterns (Non-Obvious)
- Use `filtersRef` for non-rerendering filter state
- Use `router.navigate({ replace: true })` for URL updates without rerender

## Database (Non-Obvious)
- Migrations auto-run on API startup (via `//go:embed` + golang-migrate iofs)
- FTS5 virtual tables (`teams_fts`, `leagues_fts`, `players_fts`) with trigram tokenizer synced via triggers
- JSON array columns (radiant_heroes, dire_heroes, etc.) queried via SQLite `json_each`
- `scraper_metadata` table holds `last_fetched_match_id` for resume on restart

## Scraper (Non-Obvious)
- `MAX_BATCHES` default 50, `BATCH_SIZE` default 200 to stay below OpenDota 60 rpm ratelimit
- Retry logic: 3 attempts with exponential backoff and HTTP connection pooling
- Scrapes professional and premium tier leagues only (configurable team filter via `allowed_teams` table)

## Gotchas
- Go builds target `linux/amd64` (DO droplet), not your native OS/arch
- Single `app/go.mod` module — run `go mod tidy` from `app/`, not from subdirectories
- Database migrations are forward-only (no rollback migrations)
- API and scraper share the same SQLite DB (WAL mode allows concurrent reads during scraper writes)
- `make run-api` and `make run-scraper` export env vars from Makefile — no need for `.env` files locally
- On prod, API reads `DATABASE_URL`, `ADDR`, `LOG_LEVEL` from `/opt/dotapro/.env` (systemd EnvironmentFile)
