import type {
    LeagueInfo,
    LeagueSearchResult,
    MatchDetail,
    MatchSummary,
    Pagination,
    PlayerData,
    Series,
    SeriesDetail,
    SeriesMatchDetail,
    TeamInfo,
    TeamSearchResult,
} from "@/types"

type MatchListRow = {
    match_id: number
    start_time: number
    duration: number
    radiant_win: boolean
    series_id: number | null
    radiant_team_id: number
    dire_team_id: number
    leagueid: number
    radiant_name: string
    radiant_tag: string | null
    radiant_logo: string | null
    dire_name: string
    dire_tag: string | null
    dire_logo: string | null
    league_name: string
    league_tier: string
    radiant_heroes: number[] | null
    dire_heroes: number[] | null
}

type SeriesSourceRow = Omit<MatchListRow, "radiant_heroes" | "dire_heroes" | "duration">

type MatchDetailRow = {
    match_id: number
    radiant_win: boolean
    start_time: number
    duration: number
    version: number | null
    patch: string | null
    radiant_score: number
    dire_score: number
    radiant_captain: number | null
    dire_captain: number | null
    radiant_gold_adv: number[] | null
    radiant_xp_adv: number[] | null
    series_id: number | null
    radiant_team_id: number
    dire_team_id: number
    leagueid: number
    radiant_name: string | null
    radiant_tag: string | null
    radiant_logo: string | null
    dire_name: string | null
    dire_tag: string | null
    dire_logo: string | null
    league_name: string | null
    league_tier: string | null
    players: PlayerData[] | null
    picks_bans: unknown[] | null
}

export function unixToISO(unixSeconds: number): string {
    return new Date(unixSeconds * 1000).toISOString()
}

function optionalStr(value: string | null | undefined): string | undefined {
    return value && value.length > 0 ? value : undefined
}

function mapLeague(row: { leagueid: number; league_name: string; league_tier: string }): LeagueInfo {
    return {
        id: row.leagueid,
        name: row.league_name,
        tier: row.league_tier,
    }
}

function mapTeam(
    id: number,
    name: string | null | undefined,
    tag: string | null | undefined,
    logo: string | null | undefined,
): TeamInfo {
    return {
        id,
        name: name ?? "Unknown",
        tag: optionalStr(tag ?? undefined),
        logo_url: optionalStr(logo ?? undefined),
    }
}

function mapTeamWithScore(
    id: number,
    name: string | null | undefined,
    tag: string | null | undefined,
    logo: string | null | undefined,
    score: number,
    captain: number | null,
): TeamInfo & { score: number; captain: number | null } {
    return {
        ...mapTeam(id, name, tag, logo),
        score,
        captain,
    }
}

export function mapMatchSummaryRow(row: MatchListRow): MatchSummary {
    return {
        match_id: row.match_id,
        start_time: unixToISO(row.start_time),
        duration: row.duration,
        radiant_win: row.radiant_win,
        series_id: row.series_id ?? 0,
        radiant_team: mapTeam(row.radiant_team_id, row.radiant_name, row.radiant_tag, row.radiant_logo),
        dire_team: mapTeam(row.dire_team_id, row.dire_name, row.dire_tag, row.dire_logo),
        league: mapLeague(row),
        radiant_heroes: row.radiant_heroes ?? [],
        dire_heroes: row.dire_heroes ?? [],
    }
}

export function paginateByCursor<T>(items: T[], limit: number, getCursor: (item: T) => number): { items: T[]; pagination: Pagination } {
    const hasMore = items.length > limit
    const page = hasMore ? items.slice(0, limit) : items
    const last = page[page.length - 1]

    return {
        items: page,
        pagination: {
            has_more: hasMore,
            nc: hasMore && last !== undefined ? getCursor(last) : undefined,
        },
    }
}

export function groupMatchesIntoSeries(rows: SeriesSourceRow[]): Series[] {
    const bySeries = new Map<number, SeriesSourceRow[]>()

    for (const row of rows) {
        if (!row.series_id) {
            continue
        }
        const group = bySeries.get(row.series_id) ?? []
        group.push(row)
        bySeries.set(row.series_id, group)
    }

    const seriesList: Series[] = []

    for (const [seriesId, matches] of bySeries) {
        matches.sort((a, b) => a.match_id - b.match_id)
        const first = matches[0]
        const teamAId = first.radiant_team_id
        const teamBId = first.dire_team_id

        let teamAScore = 0
        let teamBScore = 0
        let minStart = matches[0].start_time

        for (const match of matches) {
            const winnerId = match.radiant_win ? match.radiant_team_id : match.dire_team_id
            if (winnerId === teamAId) {
                teamAScore++
            } else if (winnerId === teamBId) {
                teamBScore++
            }
            minStart = Math.min(minStart, match.start_time)
        }

        seriesList.push({
            series_id: seriesId,
            start_time: unixToISO(minStart),
            team_a: mapTeam(teamAId, first.radiant_name, first.radiant_tag, first.radiant_logo),
            team_b: mapTeam(teamBId, first.dire_name, first.dire_tag, first.dire_logo),
            league: mapLeague(first),
            team_a_score: teamAScore,
            team_b_score: teamBScore,
        })
    }

    return seriesList
}

export function mapMatchDetailRow(row: MatchDetailRow): MatchDetail {
    return {
        match_id: row.match_id,
        start_time: unixToISO(row.start_time),
        duration: row.duration,
        radiant_win: row.radiant_win,
        patch: row.patch ?? "",
        version: row.version ?? 0,
        series_id: row.series_id ?? 0,
        radiant_team: mapTeamWithScore(
            row.radiant_team_id,
            row.radiant_name,
            row.radiant_tag,
            row.radiant_logo,
            row.radiant_score,
            row.radiant_captain,
        ),
        dire_team: mapTeamWithScore(
            row.dire_team_id,
            row.dire_name,
            row.dire_tag,
            row.dire_logo,
            row.dire_score,
            row.dire_captain,
        ),
        league: mapLeague({
            leagueid: row.leagueid,
            league_name: row.league_name ?? "",
            league_tier: row.league_tier ?? "",
        }),
        picks_bans: row.picks_bans ?? [],
        players_data: row.players ?? [],
        radiant_gold_adv: row.radiant_gold_adv ?? [],
        radiant_xp_adv: row.radiant_xp_adv ?? [],
    }
}

export function mapSeriesMatchDetailRow(row: MatchDetailRow): SeriesMatchDetail {
    return {
        match_id: row.match_id,
        duration: row.duration,
        radiant_win: row.radiant_win,
        picks_bans: row.picks_bans ?? [],
        players_data: row.players ?? [],
        radiant_gold_adv: row.radiant_gold_adv ?? [],
        radiant_xp_adv: row.radiant_xp_adv ?? [],
        radiant_score: row.radiant_score,
        dire_score: row.dire_score,
        radiant_captain: row.radiant_captain,
        dire_captain: row.dire_captain,
    }
}

export function mapSeriesDetailRows(rows: MatchDetailRow[]): SeriesDetail {
    if (rows.length === 0) {
        throw new Error("series not found")
    }

    const first = rows[0]
    const teamAId = first.radiant_team_id
    const teamBId = first.dire_team_id

    let teamAScore = 0
    let teamBScore = 0

    for (const match of rows) {
        const winnerId = match.radiant_win ? match.radiant_team_id : match.dire_team_id
        if (winnerId === teamAId) {
            teamAScore++
        } else if (winnerId === teamBId) {
            teamBScore++
        }
    }

    return {
        series_id: first.series_id ?? 0,
        start_time: unixToISO(first.start_time),
        team_a: mapTeam(teamAId, first.radiant_name, first.radiant_tag, first.radiant_logo),
        team_b: mapTeam(teamBId, first.dire_name, first.dire_tag, first.dire_logo),
        league: mapLeague({
            leagueid: first.leagueid,
            league_name: first.league_name ?? "",
            league_tier: first.league_tier ?? "",
        }),
        team_a_score: teamAScore,
        team_b_score: teamBScore,
        matches: rows.map(mapSeriesMatchDetailRow),
    }
}

export function mapTeamSearchRow(row: { team_id: number; name: string; logo_url: string | null }): TeamSearchResult {
    return {
        team_id: row.team_id,
        name: row.name,
        logo_url: optionalStr(row.logo_url ?? undefined),
    }
}

export function mapLeagueSearchRow(row: LeagueSearchResult): LeagueSearchResult {
    return row
}

export type { MatchDetailRow, MatchListRow, SeriesSourceRow }

