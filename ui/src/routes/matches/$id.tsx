import { BackLink, Button, ErrorState, PlayersTable, SEO, Skeleton } from "@/components"
import { useMatch } from "@/hooks/useMatches"
import { copyToClipboard, formatDuration, formatRelativeTime } from "@/lib"
import type { MatchDetail, SeriesMatchDetail } from "@/types"
import { createFileRoute } from "@tanstack/react-router"
import { Check, Clock, Copy, ExternalLink, Swords } from "lucide-react"
import * as React from "react"

export const Route = createFileRoute("/matches/$id")({
    component: MatchDetails,
})

function MatchDetails() {
    const { id } = Route.useParams()
    const matchId = parseInt(id)
    const { data: match, isLoading, error } = useMatch(matchId)

    if (isLoading) {
        return <MatchDetailsSkeleton />
    }

    if (error) {
        return <ErrorState error="Failed to load match details" />
    }

    if (!match) {
        return <ErrorState error="Match not found" />
    }

    return (
        <>
            <SEO
                title={`${match.radiant_team.name} vs ${match.dire_team.name}`}
                description={`Match details for ${match.radiant_team.name} vs ${match.dire_team.name} in ${match.league.name}`}
            />
            <div className="mx-auto max-w-7xl px-2 py-6">
                <MatchHeader match={match} />
                <PlayersTable
                    match={
                        {
                            match_id: match.match_id,
                            duration: match.duration,
                            radiant_win: match.radiant_win,
                            picks_bans: match.picks_bans,
                            players_data: match.players_data,
                            radiant_gold_adv: match.radiant_gold_adv,
                            radiant_xp_adv: match.radiant_xp_adv,
                            radiant_score: match.radiant_team.score,
                            dire_score: match.dire_team.score,
                            radiant_captain: match.radiant_team.captain,
                            dire_captain: match.dire_team.captain,
                        } as SeriesMatchDetail
                    }
                    radiantTeam={match.radiant_team}
                    direTeam={match.dire_team}
                />
            </div>
        </>
    )
}

function MatchHeader({ match }: { match: MatchDetail }) {
    const { radiant_team, dire_team, league, start_time, duration, match_id } = match
    const [copied, setCopied] = React.useState(false)

    const handleCopyId = async () => {
        const success = await copyToClipboard(match_id.toString())
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="rounded-xl pb-2" role="region" aria-label="Match header">
            <BackLink to="/matches" />

            {/* Mobile Layout */}
            <div className="flex flex-col gap-4 px-2 md:hidden">
                {/* Radiant Team */}
                <div className="flex min-w-0 items-center justify-center">
                    <div className="flex min-w-0 items-center gap-2">
                        {radiant_team.logo_url && (
                            <img
                                src={radiant_team.logo_url}
                                alt={`${radiant_team.name} logo`}
                                className="h-8 w-auto shrink-0 rounded-lg object-contain"
                            />
                        )}
                        <span className="font-shantell text-center text-lg font-bold sm:text-xl">
                            {radiant_team.name}
                        </span>
                    </div>
                </div>

                {/* VS Icon */}
                <div className="flex items-center justify-center">
                    <Swords className="text-foreground-muted h-6 w-6" />
                </div>

                {/* Dire Team */}
                <div className="flex min-w-0 items-center justify-center">
                    <div className="flex min-w-0 items-center gap-2">
                        {dire_team.logo_url && (
                            <img
                                src={dire_team.logo_url}
                                alt={`${dire_team.name} logo`}
                                className="h-8 w-auto shrink-0 rounded-lg object-contain"
                            />
                        )}
                        <span className="font-shantell text-center text-lg font-bold sm:text-xl">{dire_team.name}</span>
                    </div>
                </div>

                {/* League, Time, and Duration (mobile - simplified) */}
                <div className="text-foreground-muted flex flex-col text-sm">
                    <span className="font-medium">{league.name}</span>
                    <span>~{formatRelativeTime(start_time)} ago</span>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden flex-col md:flex">
                {/* Teams and VS Icon */}
                <div className="flex flex-row items-center gap-25">
                    {/* Radiant Team */}
                    <div className="flex min-w-0 items-center gap-1">
                        {radiant_team.logo_url && (
                            <img
                                src={radiant_team.logo_url}
                                alt={`${radiant_team.name} logo`}
                                className="h-16 w-auto shrink-0 rounded-lg object-contain md:h-24 lg:h-20"
                            />
                        )}
                        <span className="font-shantell min-w-0 text-xl font-bold md:text-3xl">{radiant_team.name}</span>
                    </div>

                    {/* VS Icon */}
                    <div className="flex items-center">
                        <Swords className="text-foreground-muted h-6 w-6" />
                    </div>

                    {/* Dire Team */}
                    <div className="flex min-w-0 items-center gap-1">
                        <span className="font-shantell min-w-0 text-xl font-bold md:text-3xl">{dire_team.name}</span>
                        {dire_team.logo_url && (
                            <img
                                src={dire_team.logo_url}
                                alt={`${dire_team.name} logo`}
                                className="h-16 w-auto shrink-0 rounded-lg object-contain md:h-24 lg:h-20"
                            />
                        )}
                    </div>
                </div>

                {/* League, Time, and Duration */}
                <div className="text-foreground-muted mt-4 text-sm">
                    <span className="font-medium">{league.name}</span>
                    <span className="mx-2">•</span>
                    <span className="bg-secondary/20 inline-block rounded px-2 py-0.5 text-xs">{league.tier}</span>
                    <span className="mx-2">•</span>
                    <span>~{formatRelativeTime(start_time)} ago</span>
                </div>
            </div>

            {/* Match ID and Duration Header */}
            <div
                className="bg-background-card mt-4 overflow-hidden rounded-xl border border-white/10 focus:outline-none"
                role="region"
                aria-label="Match information"
            >
                <div className="p-6">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h3 className="text-md" id={`match-${match_id}`}>
                                Match ID: {match_id}
                            </h3>
                            <p className="text-foreground-muted flex items-center gap-1 text-sm select-none">
                                <Clock size={15} aria-hidden="true" />{" "}
                                <span aria-label={`Duration: ${formatDuration(duration)}`}>
                                    {formatDuration(duration)}
                                </span>
                            </p>
                        </div>
                        {/* Mobile: Icon-only buttons */}
                        <div className="flex justify-center gap-2 sm:hidden">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyId}
                                className="p-2"
                                aria-label="Copy ID"
                            >
                                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            </Button>

                            <Button variant="outline" size="sm" asChild className="p-2" aria-label="View on OpenDota">
                                <a
                                    href={`https://opendota.com/matches/${match_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1"
                                >
                                    OD
                                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                </a>
                            </Button>

                            <Button variant="outline" size="sm" asChild className="p-2" aria-label="View on Stratz">
                                <a
                                    href={`https://stratz.com/matches/${match_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1"
                                >
                                    Stratz
                                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                </a>
                            </Button>
                        </div>
                        {/* Desktop: Full text buttons */}
                        <div className="hidden gap-2 sm:flex">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyId}
                                className="gap-2 leading-relaxed"
                            >
                                {copied ? "Copied!" : "Copy ID"}
                                {!copied ? <Copy className="h-4 w-4" /> : <Check className="h-4 w-4 text-green-600" />}
                            </Button>

                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={`https://opendota.com/matches/${match_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 leading-relaxed"
                                    aria-label="View match on OpenDota"
                                >
                                    <p>OpenDota</p>
                                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={`https://stratz.com/matches/${match_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 leading-relaxed"
                                    aria-label="View match on Stratz"
                                >
                                    <p>Stratz</p>
                                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MatchDetailsSkeleton() {
    return (
        <div className="mx-auto max-w-7xl px-2 py-6">
            <div className="rounded-xl pb-2">
                <Skeleton className="mb-4 h-6 w-24" />
                <div className="flex flex-col gap-4 px-2 md:hidden">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="mx-auto h-6 w-6" />
                    <Skeleton className="h-8 w-3/4" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </div>
                <div className="hidden flex-col md:flex">
                    <div className="flex flex-row items-center gap-25">
                        <Skeleton className="h-16 w-16" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="mx-auto h-6 w-6" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-16 w-16" />
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </div>
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    )
}
