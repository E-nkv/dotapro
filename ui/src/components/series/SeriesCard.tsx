import type { Series } from "@/api"
import { cn, formatRelativeTime } from "@/lib"
import { Link } from "@tanstack/react-router"
import { Eye, Swords } from "lucide-react"
import * as React from "react"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "bg-background-card/80 text-card-foreground relative overflow-hidden rounded-xl shadow-xl backdrop-blur-sm transition-all duration-300",
            className,
        )}
        {...props}
    >
        <div className="relative z-10 flex h-full flex-col">{props.children}</div>
    </div>
))
Card.displayName = "Card"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
)
CardContent.displayName = "CardContent"

export function SeriesCard({
    series,
    style,
    className,
}: {
    series: Series
    style?: React.CSSProperties
    className?: string
}) {
    return (
        <Card
            role="article"
            aria-label={`Match: ${series.team_a.name} vs ${series.team_b.name}`}
            style={style}
            className={className}
        >
            <CardContent className="flex flex-1 flex-col p-4">
                {/* Teams and Score */}
                <div className="border-border mb-3 flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    {/* Team A */}
                    <div className="flex min-w-0 flex-1 items-center justify-center sm:justify-start">
                        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                            {series.team_a.logo_url && (
                                <img
                                    src={series.team_a.logo_url}
                                    alt={`${series.team_a.name} logo`}
                                    className="h-6 w-auto max-w-8 shrink-0 rounded transition-all duration-300 select-none hover:brightness-125 hover:saturate-150 sm:h-7 sm:max-w-11"
                                />
                            )}
                            <span className="text-foreground sm:text-md font-shantell truncate text-center text-sm font-bold sm:text-left">
                                {series.team_a.name}
                            </span>
                            <span className="text-foreground-muted text-xs font-bold sm:hidden">
                                ({series.team_a_score})
                            </span>
                        </div>
                    </div>

                    {/* VS Icon (mobile) / Score (desktop) */}
                    <div className="flex shrink-0 items-center justify-center py-0.5 select-none sm:px-2 sm:py-0">
                        <Swords className="text-foreground-muted h-4 w-4 sm:hidden" />
                        <div className="hidden items-center sm:flex">
                            <span className="text-foreground-muted text-xs font-bold">{series.team_a_score}</span>
                            <span className="mx-2 text-gray-400">{"-"}</span>
                            <span className="text-foreground-muted text-xs font-bold">{series.team_b_score}</span>
                        </div>
                    </div>

                    {/* Team B */}
                    <div className="flex min-w-0 flex-1 items-center justify-center sm:justify-end">
                        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                            {series.team_b.logo_url && (
                                <img
                                    src={series.team_b.logo_url}
                                    alt={`${series.team_b.name} logo`}
                                    className="h-6 w-auto max-w-8 shrink-0 rounded transition-all duration-300 select-none hover:brightness-125 hover:saturate-150 sm:h-7 sm:max-w-11"
                                />
                            )}
                            <span className="text-foreground sm:text-md font-shantell truncate text-center text-sm font-bold sm:text-right">
                                {series.team_b.name}
                            </span>
                            <span className="text-foreground-muted text-xs font-bold sm:hidden">
                                ({series.team_b_score})
                            </span>
                        </div>
                    </div>
                </div>

                {/* League and Date */}
                <div className="text-foreground-muted flex flex-1 flex-col text-xs">
                    <span>{series.league.name}</span>
                    <span>~{formatRelativeTime(series.start_time)} ago</span>
                </div>
                <div className="mt-auto flex items-center justify-end px-1 sm:px-2">
                    <Link
                        to="/series/$id"
                        params={{ id: String(series.series_id) }}
                        className="border-border/50 bg-inherit group/btn inline-flex cursor-pointer items-center justify-end gap-2 whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium shadow-sm transition-all duration-200 hover:border-primary-500 hover:text-white hover:bg-linear-to-r hover:from-primary-500 hover:to-primary-950"
                        aria-label={`View details for ${series.team_a.name} vs ${series.team_b.name}`}
                    >
                        View series
                        <div className="flex h-4 w-5 items-center justify-center sm:w-6">
                            <Eye className="size-3 transition-all duration-300 group-hover/btn:size-5" />
                        </div>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
