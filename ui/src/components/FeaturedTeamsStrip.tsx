import { cn, getPopularData } from "@/lib"
import { Link } from "@tanstack/react-router"

type FeaturedTeamsStripProps = {
    limit?: number
    showAndMore?: boolean
    logoClassName?: string
    className?: string
}

export function FeaturedTeamsStrip({
    limit = 7,
    showAndMore = true,
    logoClassName = "h-10 w-10",
    className,
}: FeaturedTeamsStripProps) {
    const teams = getPopularData().popular_teams.slice(0, limit)

    return (
        <div className={cn("flex flex-wrap items-center justify-center gap-4", className)}>
            {teams.map(team => (
                <Link
                    key={team.id}
                    to="/series"
                    search={{ team: team.id }}
                    title={team.name}
                    className="opacity-70 transition-opacity hover:opacity-100"
                >
                    {team.logo_url ? (
                        <img
                            src={team.logo_url}
                            alt={team.name}
                            className={cn("object-contain", logoClassName)}
                        />
                    ) : (
                        <span className="text-foreground-muted text-sm">{team.name}</span>
                    )}
                </Link>
            ))}
            {showAndMore && (
                <Link
                    to="/about"
                    hash="tracked-teams"
                    className="text-foreground-muted hover:text-foreground text-sm transition-colors"
                >
                    and more
                </Link>
            )}
        </div>
    )
}
