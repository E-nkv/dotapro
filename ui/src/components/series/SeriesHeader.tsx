import type { SeriesDetail } from "@/api"
import { BackLink } from "@/components/ui/BackLink"
import { formatRelativeTime } from "@/lib"
import { Swords } from "lucide-react"

interface SeriesHeaderProps {
    series: SeriesDetail
}

export function SeriesHeader({ series }: SeriesHeaderProps) {
    const { team_a, team_b, league, team_a_score, team_b_score, start_time } = series

    return (
        <div className="rounded-xl pb-2" role="region" aria-label="Series header">
            <BackLink to="/series" />

            {/* Mobile Layout */}
            <div className="flex flex-col gap-4 px-2 md:hidden">
                {/* Team A */}
                <div className="flex min-w-0 items-center justify-center">
                    <div className="flex min-w-0 items-center gap-2">
                        {team_a.logo_url && (
                            <img
                                src={team_a.logo_url}
                                alt={`${team_a.name} logo`}
                                className="h-8 w-auto shrink-0 rounded-lg object-contain"
                            />
                        )}
                        <span className="font-shantell truncate text-center text-lg font-bold sm:text-xl">
                            {team_a.name}
                        </span>
                        <span className="text-foreground-muted text-sm font-bold">({team_a_score})</span>
                    </div>
                </div>

                {/* VS Icon */}
                <div className="flex items-center justify-center">
                    <Swords className="text-foreground-muted h-6 w-6" />
                </div>

                {/* Team B */}
                <div className="flex min-w-0 items-center justify-center">
                    <div className="flex min-w-0 items-center gap-2">
                        {team_b.logo_url && (
                            <img
                                src={team_b.logo_url}
                                alt={`${team_b.name} logo`}
                                className="h-8 w-auto shrink-0 rounded-lg object-contain"
                            />
                        )}
                        <span className="font-shantell truncate text-center text-lg font-bold sm:text-xl">
                            {team_b.name}
                        </span>
                        <span className="text-foreground-muted text-sm font-bold">({team_b_score})</span>
                    </div>
                </div>

                {/* League and Time (mobile - simplified) */}
                <div className="text-foreground-muted flex flex-col text-sm">
                    <span className="font-medium">{league.name}</span>
                    <span>~{formatRelativeTime(start_time)} ago</span>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden flex-col md:flex">
                {/* Teams and Score */}
                <div className="flex flex-row items-center gap-25">
                    {/* Team A */}
                    <div className="flex min-w-0 items-center gap-1">
                        {team_a.logo_url && (
                            <img
                                src={team_a.logo_url}
                                alt={`${team_a.name} logo`}
                                className="h-16 w-auto shrink-0 rounded-lg object-contain md:h-24 lg:h-20"
                            />
                        )}
                        <span className="font-shantell min-w-0 text-xl font-bold md:text-3xl">{team_a.name}</span>
                    </div>

                    {/* Score */}
                    <div className="font-teko text-foreground shrink-0 text-4xl font-bold md:text-5xl">
                        {team_a_score} - {team_b_score}
                    </div>

                    {/* Team B */}
                    <div className="flex min-w-0 items-center gap-1">
                        <span className="font-shantell min-w-0 text-xl font-bold md:text-3xl">{team_b.name}</span>
                        {team_b.logo_url && (
                            <img
                                src={team_b.logo_url}
                                alt={`${team_b.name} logo`}
                                className="h-16 w-auto shrink-0 rounded-lg object-contain md:h-24 lg:h-20"
                            />
                        )}
                    </div>
                </div>

                {/* League and Time */}
                <div className="text-foreground-muted mt-4 text-sm">
                    <span className="font-medium">{league.name}</span>
                    <span className="mx-2">•</span>
                    <span className="bg-secondary/20 inline-block rounded px-2 py-0.5 text-xs">{league.tier}</span>
                    <span className="mx-2">•</span>
                    <span>~{formatRelativeTime(start_time)} ago</span>
                </div>
            </div>
        </div>
    )
}
