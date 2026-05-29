import type {
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
    TeamSearchResult,
} from "@/types"

// Player search result type
export type PlayerSearchResult = {
    player_id: number
    name: string
}

// Re-export types for backward compatibility
export type {
    Filters, GetMatchesResponse, GetSeriesResponse, LeagueInfo,
    LeagueSearchResult, MatchDetail, MatchFilters, MatchSummary, Pagination, Params, PlayerData, Series, SeriesDetail, SeriesMatchDetail, TeamInfo, TeamSearchResult
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

function buildUrl(path: string, params: Record<string, string | number | undefined>): URL {
    const url = new URL(`${API_BASE_URL}${path}`)
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            url.searchParams.set(key, String(value))
        }
    })
    return url
}

async function fetchApi<T>(url: URL, signal: AbortSignal, errorMessage: string): Promise<T> {
    const res = await fetch(url.toString(), { signal })
    if (!res.ok) {
        throw new Error(`${errorMessage}: ${res.status} ${res.statusText}`)
    }
    return res.json()
}

export async function getSeries(params: Filters, signal: AbortSignal): Promise<GetSeriesResponse> {
    const url = buildUrl("/series", params)
    return fetchApi(url, signal, "Failed to fetch series")
}

export async function getSeriesById(id: number, signal: AbortSignal): Promise<SeriesDetail> {
    const url = new URL(`${API_BASE_URL}/series/${id}`)
    return fetchApi(url, signal, "Failed to fetch series details")
}

export async function searchLeagues(query: string, signal: AbortSignal): Promise<LeagueSearchResult[]> {
    const url = buildUrl("/filtersmetadata/leagues", { q: query })
    return fetchApi(url, signal, "Failed to search leagues")
}

export async function getRecentLeagues(signal: AbortSignal): Promise<LeagueSearchResult[]> {
    const url = new URL(`${API_BASE_URL}/filtersmetadata/leagues/recent`)
    return fetchApi(url, signal, "Failed to fetch recent leagues")
}

export async function searchTeams(query: string, signal: AbortSignal): Promise<TeamSearchResult[]> {
    const url = buildUrl("/filtersmetadata/teams", { q: query })
    return fetchApi(url, signal, "Failed to search teams")
}

export async function getMatches(params: MatchFilters, signal: AbortSignal): Promise<GetMatchesResponse> {
    const url = buildUrl("/matches", params)
    return fetchApi(url, signal, "Failed to fetch matches")
}

export async function getMatchById(id: number, signal: AbortSignal): Promise<MatchDetail> {
    const url = new URL(`${API_BASE_URL}/matches/${id}`)
    return fetchApi(url, signal, "Failed to fetch match details")
}

export async function getTeamName(id: number, signal: AbortSignal): Promise<{ name: string }> {
    const url = buildUrl("/filtersmetadata/team", { id })
    return fetchApi(url, signal, "Failed to fetch team name")
}

export async function getLeagueName(id: number, signal: AbortSignal): Promise<{ name: string }> {
    const url = buildUrl("/filtersmetadata/league", { id })
    return fetchApi(url, signal, "Failed to fetch league name")
}

export async function searchPlayers(query: string, signal: AbortSignal): Promise<PlayerSearchResult[]> {
    const url = buildUrl("/filtersmetadata/players", { q: query })
    return fetchApi(url, signal, "Failed to search players")
}

export async function getPlayerName(id: number, signal: AbortSignal): Promise<{ name: string }> {
    const url = buildUrl("/filtersmetadata/player", { id })
    return fetchApi(url, signal, "Failed to fetch player name")
}
