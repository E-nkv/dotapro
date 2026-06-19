# Changelog

All notable project changes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Changed
- **Serverless architecture** — Removed Go API, scraper, SQLite, and VPS deploy config. The UI queries OpenDota directly.
- **Flattened repo layout** — Moved frontend from `ui/` to project root.

### Removed
- `app/` (API + scraper), `database/`, `deploy/`, `ui/` subdirectory, `.golangci.yml`, `scripts.sh`

---

## 2026-04-06 - UI Enhancements Batch

### Added
- **ActiveFiltersBar component** - New component displaying active filter chips with individual dismiss buttons
- **MatchCardSkeleton component** - Full layout skeleton matching MatchCard design
- **Active badge variant** - New `active` variant in Badge component for filter chips
- **Route transition animations** - `page-enter` class for fade-in content transitions
- **Loading bar animation** - Top loading bar for route changes

### Changed
- **Homepage CTA** - Replaced "About dotapro" with "View Matches" button, route to `/matches`
- **Card entrance animations** - Added staggered fadeInUp animation (50ms delay, capped at 500ms)
- **Card hover effects** - Added lift effect (`translateY(-4px) scale(1.01)`) with enhanced shadow
- **Team logo hover** - Added brightness/saturation boost on hover
- **Skeleton animations** - Replaced `animate-pulse` with shimmer gradient sweep animation
- **Hero section** - Added gradient mesh background, scanline sweep effect, hero float animation

### Fixed
- SeriesCardSkeleton `text-gray-400` → `text-foreground-muted` for theme consistency

### Dependencies
- Visual effects (Plan 3) depends on Plan 2 for `@keyframes float`
- Loading states (Plan 5) depends on Plan 2 for `@keyframes shimmer`

---

## [Template for future entries]

Copy this template when adding new entries:

```
## YYYY-MM-DD - [Brief Description]

### Added
-

### Changed
-

### Fixed
-

### Removed
-
```

---

## Guidelines

1. **One entry per change set** - Group related changes into a single dated entry
2. **Use imperative mood** - "Add feature" not "Added feature"
3. **Be specific** - Include file names and line numbers when helpful
4. **Link to issues/PRs** - When applicable, include references
5. **Breaking changes** - Mark with `### Breaking` under the entry

## Backtracking

When debugging issues, search this file for:
1. The date when behavior changed
2. The specific component/file that was modified
3. Cross-reference with git blame for line-level changes

## Related Documentation

- [UI-ENHANCEMENTS_SUMMARY.md](UI-ENHANCEMENTS_SUMMARY.md) - Detailed summary of the 2026-04-06 UI batch
- [AGENTS.md](AGENTS.md) - Project conventions and patterns
