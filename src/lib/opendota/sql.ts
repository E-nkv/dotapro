import type { Filters, MatchFilters } from "@/types"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
const SEARCH_LIMIT = 10
const RECENT_LEAGUES_LIMIT = 5
const HERO_PLAYER_LOOKBACK_DAYS = 90

export function intLiteral(value: number): string {
    if (!Number.isFinite(value) || !Number.isInteger(value)) {
        throw new Error(`invalid integer literal: ${value}`)
    }
    return String(value)
}

export function textLiteral(value: string, maxLen = 100): string {
    const trimmed = value.trim().slice(0, maxLen)
    return `'${trimmed.replace(/'/g, "''")}'`
}

function resolveLimit(limit?: number): number {
    if (limit === undefined || limit <= 0) {
        return DEFAULT_LIMIT
    }
    return Math.min(limit, MAX_LIMIT)
}

function proMatchWhere(): string {
    return `${tierWhere("l")}
  AND m.radiant_team_id IS NOT NULL
  AND m.dire_team_id IS NOT NULL
  AND rt.name IS NOT NULL AND rt.name != ''
  AND dt.name IS NOT NULL AND dt.name != ''`
}

function tierWhere(alias = "l"): string {
    return `${alias}.tier IN ('premium', 'professional')`
}

function buildMatchFilters(filters: MatchFilters | Filters, alias = "m"): string {
    const clauses: string[] = []

    if (filters.league !== undefined) {
        clauses.push(`${alias}.leagueid = ${intLiteral(filters.league)}`)
    }
    if (filters.team !== undefined) {
        const teamId = intLiteral(filters.team)
        clauses.push(`(${alias}.radiant_team_id = ${teamId} OR ${alias}.dire_team_id = ${teamId})`)
    }
    if ("hero" in filters && filters.hero !== undefined) {
        clauses.push(
            `EXISTS (SELECT 1 FROM player_matches pm WHERE pm.match_id = ${alias}.match_id AND pm.hero_id = ${intLiteral(filters.hero)})`,
        )
        clauses.push(
            `${alias}.start_time > extract(epoch from now()) - ${intLiteral(HERO_PLAYER_LOOKBACK_DAYS)} * 86400`,
        )
    }
    if ("player" in filters && filters.player !== undefined) {
        clauses.push(
            `EXISTS (SELECT 1 FROM player_matches pm WHERE pm.match_id = ${alias}.match_id AND pm.account_id = ${intLiteral(filters.player)})`,
        )
        clauses.push(
            `${alias}.start_time > extract(epoch from now()) - ${intLiteral(HERO_PLAYER_LOOKBACK_DAYS)} * 86400`,
        )
    }

    return clauses.length > 0 ? clauses.join("\n  AND ") : ""
}

function buildCursorClause(filters: MatchFilters | Filters, alias = "m"): string {
    if (filters.c === undefined) {
        return ""
    }
    const cursor = intLiteral(filters.c)
    if (filters.sort === "oldest") {
        return `AND ${alias}.match_id > ${cursor}`
    }
    return `AND ${alias}.match_id < ${cursor}`
}

function buildSeriesCursorClause(filters: Filters, alias = "m"): string {
    if (filters.c === undefined) {
        return ""
    }
    const cursor = intLiteral(filters.c)
    if (filters.sort === "oldest") {
        return `AND ${alias}.series_id > ${cursor}`
    }
    return `AND ${alias}.series_id < ${cursor}`
}

const PLAYERS_JSON_AGG = `
(
    SELECT JSON_AGG(
        JSON_BUILD_OBJECT(
            'hero_id', pm.hero_id,
            'player_id', pm.account_id,
            'player_slot', pm.player_slot,
            'kills', pm.kills,
            'deaths', pm.deaths,
            'assists', pm.assists,
            'gold_per_min', pm.gold_per_min,
            'xp_per_min', pm.xp_per_min,
            'last_hits', pm.last_hits,
            'denies', pm.denies,
            'level', pm.level,
            'item_0', pm.item_0,
            'item_1', pm.item_1,
            'item_2', pm.item_2,
            'item_3', pm.item_3,
            'item_4', pm.item_4,
            'item_5', pm.item_5,
            'item_neutral', pm.item_neutral,
            'backpack_0', pm.backpack_0,
            'backpack_1', pm.backpack_1,
            'backpack_2', pm.backpack_2,
            'net_worth', pm.net_worth,
            'is_radiant', (pm.player_slot < 128),
            'name', np.name,
            'facet', pm.hero_variant
        )
        ORDER BY pm.player_slot
    )
    FROM player_matches pm
    LEFT JOIN notable_players np ON np.account_id = pm.account_id
    WHERE pm.match_id = m.match_id
) AS players`

const PICKS_BANS_JSON_AGG = `
(
    SELECT JSON_AGG(
        JSON_BUILD_OBJECT(
            'hero_id', pb.hero_id,
            'is_pick', pb.is_pick,
            'order', pb.ord,
            'team', pb.team
        )
        ORDER BY pb.ord
    )
    FROM picks_bans pb
    WHERE pb.match_id = m.match_id
) AS picks_bans`

export function buildMatchesListQuery(filters: MatchFilters): string {
    const limit = resolveLimit(filters.limit) + 1
    const extraFilters = buildMatchFilters(filters)
    const cursor = buildCursorClause(filters)
    const order = filters.sort === "oldest" ? "ASC" : "DESC"

    return `
SELECT
    m.match_id,
    m.start_time,
    m.duration,
    m.radiant_win,
    m.series_id,
    m.radiant_team_id,
    m.dire_team_id,
    m.leagueid,
    rt.name AS radiant_name,
    rt.tag AS radiant_tag,
    rt.logo_url AS radiant_logo,
    dt.name AS dire_name,
    dt.tag AS dire_tag,
    dt.logo_url AS dire_logo,
    l.name AS league_name,
    l.tier AS league_tier,
    (
        SELECT json_agg(pm.hero_id ORDER BY pm.player_slot)
        FROM player_matches pm
        WHERE pm.match_id = m.match_id AND pm.player_slot < 128
    ) AS radiant_heroes,
    (
        SELECT json_agg(pm.hero_id ORDER BY pm.player_slot)
        FROM player_matches pm
        WHERE pm.match_id = m.match_id AND pm.player_slot >= 128
    ) AS dire_heroes
FROM matches m
JOIN leagues l ON m.leagueid = l.leagueid
JOIN teams rt ON m.radiant_team_id = rt.team_id
JOIN teams dt ON m.dire_team_id = dt.team_id
WHERE ${proMatchWhere()}
  ${extraFilters ? `AND ${extraFilters}` : ""}
  ${cursor}
ORDER BY m.match_id ${order}
LIMIT ${intLiteral(limit)};
`.trim()
}

export function buildSeriesSourceMatchesQuery(filters: Filters, batchSize: number): string {
    const extraFilters = buildMatchFilters(filters)
    const cursor = buildSeriesCursorClause(filters)
    const order = filters.sort === "oldest" ? "ASC" : "DESC"

    return `
SELECT
    m.match_id,
    m.start_time,
    m.radiant_win,
    m.series_id,
    m.radiant_team_id,
    m.dire_team_id,
    m.leagueid,
    rt.name AS radiant_name,
    rt.tag AS radiant_tag,
    rt.logo_url AS radiant_logo,
    dt.name AS dire_name,
    dt.tag AS dire_tag,
    dt.logo_url AS dire_logo,
    l.name AS league_name,
    l.tier AS league_tier
FROM matches m
JOIN leagues l ON m.leagueid = l.leagueid
JOIN teams rt ON m.radiant_team_id = rt.team_id
JOIN teams dt ON m.dire_team_id = dt.team_id
WHERE ${proMatchWhere()}
  AND m.series_id IS NOT NULL
  AND m.series_id <> 0
  ${extraFilters ? `AND ${extraFilters}` : ""}
  ${cursor}
ORDER BY m.match_id ${order}
LIMIT ${intLiteral(batchSize)};
`.trim()
}

export function buildMatchDetailQuery(matchId: number): string {
    return `
SELECT
    m.match_id,
    m.radiant_win,
    m.start_time,
    m.duration,
    m.version,
    mp.patch,
    m.radiant_score,
    m.dire_score,
    m.radiant_captain,
    m.dire_captain,
    m.radiant_gold_adv,
    m.radiant_xp_adv,
    m.series_id,
    m.radiant_team_id,
    m.dire_team_id,
    m.leagueid,
    rt.name AS radiant_name,
    rt.tag AS radiant_tag,
    rt.logo_url AS radiant_logo,
    dt.name AS dire_name,
    dt.tag AS dire_tag,
    dt.logo_url AS dire_logo,
    l.name AS league_name,
    l.tier AS league_tier,
    ${PLAYERS_JSON_AGG},
    ${PICKS_BANS_JSON_AGG}
FROM matches m
LEFT JOIN leagues l ON m.leagueid = l.leagueid
LEFT JOIN teams rt ON m.radiant_team_id = rt.team_id
LEFT JOIN teams dt ON m.dire_team_id = dt.team_id
LEFT JOIN match_patch mp ON m.match_id = mp.match_id
WHERE m.match_id = ${intLiteral(matchId)};
`.trim()
}

export function buildSeriesDetailQuery(seriesId: number): string {
    return `
SELECT
    m.match_id,
    m.duration,
    m.radiant_win,
    m.start_time,
    m.radiant_score,
    m.dire_score,
    m.radiant_captain,
    m.dire_captain,
    m.radiant_gold_adv,
    m.radiant_xp_adv,
    m.series_id,
    m.radiant_team_id,
    m.dire_team_id,
    m.leagueid,
    rt.name AS radiant_name,
    rt.tag AS radiant_tag,
    rt.logo_url AS radiant_logo,
    dt.name AS dire_name,
    dt.tag AS dire_tag,
    dt.logo_url AS dire_logo,
    l.name AS league_name,
    l.tier AS league_tier,
    ${PLAYERS_JSON_AGG},
    ${PICKS_BANS_JSON_AGG}
FROM matches m
LEFT JOIN leagues l ON m.leagueid = l.leagueid
LEFT JOIN teams rt ON m.radiant_team_id = rt.team_id
LEFT JOIN teams dt ON m.dire_team_id = dt.team_id
WHERE m.series_id = ${intLiteral(seriesId)}
ORDER BY m.match_id ASC;
`.trim()
}

export function buildSearchTeamsQuery(query: string): string {
    const q = textLiteral(query)
    return `
SELECT team_id, name, logo_url
FROM teams
WHERE name ILIKE ${q} || '%' OR name ILIKE '%' || ${q} || '%'
ORDER BY (name ILIKE ${q} || '%') DESC, length(name) ASC
LIMIT ${intLiteral(SEARCH_LIMIT)};
`.trim()
}

export function buildSearchLeaguesQuery(query: string): string {
    const q = textLiteral(query)
    return `
SELECT leagueid AS league_id, name
FROM leagues
WHERE name ILIKE ${q} || '%' OR name ILIKE '%' || ${q} || '%'
ORDER BY (name ILIKE ${q} || '%') DESC, length(name) ASC
LIMIT ${intLiteral(SEARCH_LIMIT)};
`.trim()
}

export function buildSearchPlayersQuery(query: string): string {
    const q = textLiteral(query)
    return `
SELECT account_id AS player_id, name
FROM notable_players
WHERE name ILIKE ${q} || '%' OR name ILIKE '%' || ${q} || '%'
ORDER BY (name ILIKE ${q} || '%') DESC, length(name) ASC
LIMIT ${intLiteral(SEARCH_LIMIT)};
`.trim()
}

export function buildRecentLeaguesQuery(): string {
    return `
SELECT DISTINCT l.leagueid AS league_id, l.name
FROM matches m
JOIN leagues l ON m.leagueid = l.leagueid
WHERE m.start_time > extract(epoch from now()) - 30 * 86400
  AND ${tierWhere("l")}
  AND m.radiant_team_id IS NOT NULL
  AND m.dire_team_id IS NOT NULL
ORDER BY l.leagueid DESC
LIMIT ${intLiteral(RECENT_LEAGUES_LIMIT)};
`.trim()
}

export function buildLeagueNameQuery(leagueId: number): string {
    return `SELECT name FROM leagues WHERE leagueid = ${intLiteral(leagueId)};`
}

export function buildPlayerNameQuery(playerId: number): string {
    return `SELECT name FROM notable_players WHERE account_id = ${intLiteral(playerId)};`
}

export function buildTeamNameQuery(teamId: number): string {
    return `SELECT name FROM teams WHERE team_id = ${intLiteral(teamId)};`
}
