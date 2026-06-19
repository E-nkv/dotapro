/**
 * Centralized type definitions for the dotapro application
 */

// ============================================================================
// API Types
// ============================================================================

export type Filters = {
    league?: number
    team?: number
    hero?: number
    player?: number
    sort?: string
    limit?: number
    c?: number
}

export type Params = Filters

export type TeamInfo = {
    id: number
    name: string
    tag?: string
    logo_url?: string
}

export type LeagueInfo = {
    id: number
    name: string
    tier: string
}

export type LeagueSearchResult = {
    league_id: number
    name: string
}

export type Series = {
    series_id: number
    start_time: string
    team_a: TeamInfo
    team_b: TeamInfo
    league: LeagueInfo
    team_a_score: number
    team_b_score: number
}

export type PlayerData = {
    name: string | null
    facet: number
    kills: number
    level: number
    deaths: number
    denies: number
    item_0: number
    item_1: number
    item_2: number
    item_3: number
    item_4: number
    item_5: number
    assists: number
    hero_id: number
    last_hits: number
    net_worth: number
    player_id: number
    backpack_0: number
    backpack_1: number
    backpack_2: number
    is_radiant: boolean
    xp_per_min: number
    player_slot: number
    gold_per_min: number
    item_neutral: number
}

export type SeriesMatchDetail = {
    match_id: number
    duration: number
    radiant_win: boolean
    picks_bans: unknown
    players_data: PlayerData[]
    radiant_gold_adv: number[]
    radiant_xp_adv: number[]
    radiant_score: number
    dire_score: number
    radiant_captain: number | null
    dire_captain: number | null
}

export type SeriesDetail = {
    series_id: number
    start_time: string
    team_a: TeamInfo
    team_b: TeamInfo
    league: LeagueInfo
    team_a_score: number
    team_b_score: number
    matches: SeriesMatchDetail[]
}

export type Pagination = {
    nc?: number
    has_more: boolean
}

export type GetSeriesResponse = {
    series: Series[]
    pagination: Pagination
}

export type MatchSummary = {
    match_id: number
    start_time: string
    duration: number
    radiant_win: boolean
    radiant_team: TeamInfo
    dire_team: TeamInfo
    league: LeagueInfo
    series_id: number
    radiant_heroes: number[]
    dire_heroes: number[]
}

export type MatchDetail = {
    match_id: number
    start_time: string
    duration: number
    radiant_win: boolean
    patch: string
    version: number
    radiant_team: TeamInfo & { score: number; captain: number | null }
    dire_team: TeamInfo & { score: number; captain: number | null }
    league: LeagueInfo
    series_id: number
    picks_bans: unknown[]
    players_data: PlayerData[]
    radiant_gold_adv: number[]
    radiant_xp_adv: number[]
}

export type GetMatchesResponse = {
    matches: MatchSummary[]
    pagination: Pagination
}

export type MatchFilters = {
    league?: number
    team?: number
    player?: number
    hero?: number
    sort?: string
    limit?: number
    c?: number
}

export type TeamSearchResult = {
    team_id: number
    name: string
    logo_url?: string
}

// ============================================================================
// Component Props Types
// ============================================================================

export type SizeVariant = "sm" | "md" | "lg" | "xl"

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "cool-outline"

export type SkeletonVariant = "default" | "card" | "text" | "button"

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export type WithChildren<T = Record<string, never>> = T & { children?: React.ReactNode }

export type ClassNameProps = {
    className?: string
}

// ============================================================================
// Navigation Types
// ============================================================================

export type NavLink = {
    to: string
    label: string
    ariaLabel?: string
}

// ============================================================================
// Form/Input Types
// ============================================================================

export type SelectOption<T = string> = {
    value: T
    label: string
    disabled?: boolean
}

export type InputProps = {
    id?: string
    name?: string
    value?: string
    defaultValue?: string
    placeholder?: string
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    autoComplete?: string
    "aria-label"?: string
    "aria-describedby"?: string
}

// ============================================================================
// Loading States
// ============================================================================

export type LoadingState = "idle" | "loading" | "success" | "error"

export interface AsyncState<T> {
    data: T | null
    isLoading: boolean
    error: Error | null
}

// ============================================================================
// Error Types
// ============================================================================

export type ApiError = {
    message: string
    status?: number
    code?: string
}

export type ErrorWithMessage = Error & { message: string }

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as Record<string, unknown>).message === "string"
    )
}

export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (isErrorWithMessage(maybeError)) {
        return maybeError
    }

    try {
        return new Error(JSON.stringify(maybeError))
    } catch {
        return new Error(String(maybeError))
    }
}
