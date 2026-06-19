import { runExplorer } from "@/lib/opendota/client"
import {
    groupMatchesIntoSeries,
    mapLeagueSearchRow,
    mapMatchDetailRow,
    mapMatchSummaryRow,
    mapSeriesDetailRows,
    mapTeamSearchRow,
    paginateByCursor,
    type MatchDetailRow,
    type MatchListRow,
    type SeriesSourceRow,
} from "@/lib/opendota/mappers"
import {
    buildLeagueNameQuery,
    buildMatchDetailQuery,
    buildMatchesListQuery,
    buildPlayerNameQuery,
    buildRecentLeaguesQuery,
    buildSearchLeaguesQuery,
    buildSearchPlayersQuery,
    buildSearchTeamsQuery,
    buildSeriesDetailQuery,
    buildSeriesSourceMatchesQuery,
    buildTeamNameQuery,
} from "@/lib/opendota/sql"
import type {
    Filters,
    GetMatchesResponse,
    GetSeriesResponse,
    LeagueSearchResult,
    MatchDetail,
    MatchFilters,
    SeriesDetail,
    TeamSearchResult,
} from "@/types"

// Player search result type
export type PlayerSearchResult = {
    player_id: number
    name: string
}

// Re-export types for backward compatibility
export type {
    Filters,
    GetMatchesResponse,
    GetSeriesResponse,
    LeagueInfo,
    LeagueSearchResult,
    MatchDetail,
    MatchFilters,
    MatchSummary,
    Pagination,
    Params,
    PlayerData,
    Series,
    SeriesDetail,
    SeriesMatchDetail,
    TeamInfo,
    TeamSearchResult
} from "@/types"

const DEFAULT_LIMIT = 20

export async function getMatches(params: MatchFilters, signal: AbortSignal): Promise<GetMatchesResponse> {
    const rows = await runExplorer<MatchListRow>(buildMatchesListQuery(params), signal, "Failed to fetch matches")
    const { items, pagination } = paginateByCursor(
        rows.map(mapMatchSummaryRow),
        params.limit ?? DEFAULT_LIMIT,
        m => m.match_id,
    )
    return { matches: items, pagination }
}

export async function getMatchById(id: number, signal: AbortSignal): Promise<MatchDetail> {
    const rows = await runExplorer<MatchDetailRow>(buildMatchDetailQuery(id), signal, "Failed to fetch match details")
    if (rows.length === 0) {
        throw new Error("Failed to fetch match details: 404 Not Found")
    }
    return mapMatchDetailRow(rows[0])
}

export async function getSeries(params: Filters, signal: AbortSignal): Promise<GetSeriesResponse> {
    const limit = params.limit ?? DEFAULT_LIMIT
    const batchSize = Math.min(Math.max(limit * 5, 100), 150)

    const rows = await runExplorer<SeriesSourceRow>(
        buildSeriesSourceMatchesQuery(params, batchSize),
        signal,
        "Failed to fetch series",
    )

    const series = groupMatchesIntoSeries(rows).sort((a, b) =>
        params.sort === "oldest" ? a.series_id - b.series_id : b.series_id - a.series_id,
    )

    const { items, pagination } = paginateByCursor(series, limit, s => s.series_id)
    const hasMore = pagination.has_more || rows.length === batchSize

    return {
        series: items,
        pagination: {
            nc: pagination.nc,
            has_more: hasMore,
        },
    }
}

export async function getSeriesById(id: number, signal: AbortSignal): Promise<SeriesDetail> {
    const rows = await runExplorer<MatchDetailRow>(buildSeriesDetailQuery(id), signal, "Failed to fetch series details")
    if (rows.length === 0) {
        throw new Error("Failed to fetch series details: 404 Not Found")
    }
    return mapSeriesDetailRows(rows)
}

export async function searchTeams(query: string, signal: AbortSignal): Promise<TeamSearchResult[]> {
    if (!query.trim()) {
        return []
    }
    const rows = await runExplorer<{ team_id: number; name: string; logo_url: string | null }>(
        buildSearchTeamsQuery(query),
        signal,
        "Failed to search teams",
    )
    return rows.map(mapTeamSearchRow)
}

export async function searchLeagues(query: string, signal: AbortSignal): Promise<LeagueSearchResult[]> {
    if (!query.trim()) {
        return []
    }
    const rows = await runExplorer<LeagueSearchResult>(buildSearchLeaguesQuery(query), signal, "Failed to search leagues")
    return rows.map(mapLeagueSearchRow)
}

export async function searchPlayers(query: string, signal: AbortSignal): Promise<PlayerSearchResult[]> {
    if (!query.trim()) {
        return []
    }
    return runExplorer<PlayerSearchResult>(buildSearchPlayersQuery(query), signal, "Failed to search players")
}

export async function getRecentLeagues(signal: AbortSignal): Promise<LeagueSearchResult[]> {
    return runExplorer<LeagueSearchResult>(buildRecentLeaguesQuery(), signal, "Failed to fetch recent leagues")
}

export async function getTeamName(id: number, signal: AbortSignal): Promise<{ name: string }> {
    const rows = await runExplorer<{ name: string }>(buildTeamNameQuery(id), signal, "Failed to fetch team name")
    if (rows.length === 0 || !rows[0].name) {
        throw new Error("Failed to fetch team name: 404 Not Found")
    }
    return { name: rows[0].name }
}

export async function getLeagueName(id: number, signal: AbortSignal): Promise<{ name: string }> {
    const rows = await runExplorer<{ name: string }>(buildLeagueNameQuery(id), signal, "Failed to fetch league name")
    if (rows.length === 0 || !rows[0].name) {
        throw new Error("Failed to fetch league name: 404 Not Found")
    }
    return { name: rows[0].name }
}

export async function getPlayerName(id: number, signal: AbortSignal): Promise<{ name: string }> {
    const rows = await runExplorer<{ name: string }>(buildPlayerNameQuery(id), signal, "Failed to fetch player name")
    if (rows.length === 0 || !rows[0].name) {
        throw new Error("Failed to fetch player name: 404 Not Found")
    }
    return { name: rows[0].name }
}
