import type { Filters } from "@/api"
import { PAGINATION_LIMITS } from "@/constants"
import { useNavigate } from "@tanstack/react-router"
import { Funnel } from "lucide-react"
import { useEffect, useState } from "react"
import {
    ActiveFiltersBar,
    Button,
    CustomSelect,
    CustomSelectItem,
    HeroSelector,
    LeagueSelector,
    PlayerSelector,
    TeamSelector,
} from ".."

interface SeriesFiltersProps {
    filters: Filters
    isMobileOpen?: boolean
    onMobileClose?: () => void
    itemType?: "series" | "matches"
}

export function SeriesFilters({ filters, isMobileOpen, onMobileClose, itemType = "series" }: SeriesFiltersProps) {
    const navigate = useNavigate()
    const [hasSetMobileDefault, setHasSetMobileDefault] = useState(false)

    // Set default limit to 10 on mobile (for better performance)
    // Using useEffect since we're not measuring layout
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!hasSetMobileDefault && filters.limit === undefined && window.innerWidth < 1024) {
            navigate({
                to: ".",
                search: { ...filters, limit: 10 },
                replace: true,
            })
            setHasSetMobileDefault(true)
        }
    }, [filters, navigate, hasSetMobileDefault])
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleLeagueChange = (leagueId: number | undefined) => {
        navigate({
            to: ".",
            search: { ...filters, league: leagueId, c: undefined },
        })
    }

    const handleTeamChange = (teamId: number | undefined) => {
        navigate({
            to: ".",
            search: { ...filters, team: teamId, c: undefined },
        })
    }

    const handleHeroChange = (heroId: number | undefined) => {
        navigate({
            to: ".",
            search: { ...filters, hero: heroId, c: undefined },
        })
    }

    const handlePlayerChange = (playerId: number | undefined) => {
        navigate({
            to: ".",
            search: { ...filters, player: playerId, c: undefined },
        })
    }

    const handleSortChange = (sort: string) => {
        navigate({
            to: ".",
            search: { ...filters, sort: sort === "newest" ? undefined : sort, c: undefined },
        })
    }

    const handleLimitChange = (limit: string) => {
        navigate({
            to: ".",
            search: { ...filters, limit: limit === "20" ? undefined : Number(limit), c: undefined },
        })
    }

    const handleRemoveFilter = (key: "league" | "team" | "hero" | "player" | "limit") => {
        const newFilters = { ...filters }
        delete newFilters[key]
        navigate({
            to: ".",
            search: newFilters,
        })
    }

    return (
        <>
            {/* Backdrop overlay for mobile/tablet */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 cursor-pointer bg-black/60 lg:hidden"
                    onClick={onMobileClose}
                    aria-hidden="true"
                    role="presentation"
                />
            )}

            <aside
                className={`fixed z-50 ${isMobileOpen ? "translate-y-0" : "translate-y-full"} bg-background border-border right-0 bottom-0 left-0 h-[90vh] rounded-t-2xl border-t shadow-2xl transition-transform duration-300 ease-in-out lg:fixed lg:top-16 lg:left-0 lg:h-[calc(100vh-4rem)] lg:w-72 lg:translate-x-0 lg:translate-y-0 lg:rounded-none lg:border-r`}
                role="complementary"
                aria-label="Filters"
            >
                <div className="h-full overflow-y-auto p-6">
                    {/* Mobile close button */}
                    <div className="mb-6 flex items-center justify-between lg:hidden">
                        <div className="flex items-center gap-2">
                            <Funnel className="text-foreground h-5 w-5" />
                            <h2 className="text-foreground text-lg font-semibold">Filters</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onMobileClose}
                            aria-label="Close filters"
                            className="h-12 w-12"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </Button>
                    </div>

                    {/* Desktop title */}
                    <div className="mb-6 hidden items-center gap-2 lg:flex">
                        <Funnel className="text-foreground h-5 w-5" />
                        <h2 className="text-foreground text-lg font-semibold">Filters</h2>
                    </div>

                    {/* Active Filters Bar */}
                    <ActiveFiltersBar filters={filters} onRemove={handleRemoveFilter} />

                    <div className="space-y-12">
                        {/* League Filter */}
                        <div>
                            <label htmlFor="league-select" className="text-foreground mb-2 block text-sm font-medium">
                                League
                            </label>
                            <LeagueSelector
                                id="league-select"
                                onSelect={handleLeagueChange}
                                initialValue={filters.league}
                                aria-label="League filter"
                                inputClassName="text-sm"
                            />
                        </div>

                        {/* Team Filter */}
                        <div>
                            <label htmlFor="team-select" className="text-foreground mb-2 block text-sm font-medium">
                                Team
                            </label>
                            <TeamSelector
                                id="team-select"
                                onSelect={handleTeamChange}
                                initialValue={filters.team}
                                aria-label="Team filter"
                                inputClassName="text-sm"
                            />
                        </div>

                        {/* Hero Filter - Only for matches */}
                        {itemType === "matches" && (
                            <div>
                                <label htmlFor="hero-select" className="text-foreground mb-2 block text-sm font-medium">
                                    Hero
                                </label>
                                <HeroSelector
                                    id="hero-select"
                                    onSelect={handleHeroChange}
                                    initialValue={filters.hero}
                                    aria-label="Hero filter"
                                />
                            </div>
                        )}

                        {/* Player Filter - Only for matches */}
                        {itemType === "matches" && (
                            <div>
                                <label
                                    htmlFor="player-select"
                                    className="text-foreground mb-2 block text-sm font-medium"
                                >
                                    Player
                                </label>
                                <PlayerSelector
                                    id="player-select"
                                    onSelect={handlePlayerChange}
                                    initialValue={filters.player}
                                    aria-label="Player filter"
                                    inputClassName="text-sm"
                                />
                            </div>
                        )}

                        {/* Sort By Filter */}
                        <div>
                            <label htmlFor="sort-by" className="text-foreground mb-2 block text-sm font-medium">
                                Sort by
                            </label>
                            <CustomSelect
                                id="sort-by"
                                value={filters.sort || "newest"}
                                onValueChange={handleSortChange}
                                aria-label="Sort by filter"
                                className="text-sm"
                                placeholder="Newest"
                            >
                                <CustomSelectItem value="newest">Newest</CustomSelectItem>
                                <CustomSelectItem value="oldest">Oldest</CustomSelectItem>
                            </CustomSelect>
                        </div>

                        {/* Limit Filter */}
                        <div>
                            <label htmlFor="limit" className="text-foreground mb-2 block text-sm font-medium">
                                {itemType === "matches" ? "Matches per page" : "Series per page"}
                            </label>
                            <CustomSelect
                                id="limit"
                                value={String(filters.limit || (window.innerWidth < 1024 ? 10 : 20))}
                                onValueChange={handleLimitChange}
                                aria-label="Results per page filter"
                                className="text-sm"
                                placeholder={window.innerWidth < 1024 ? "10" : "20"}
                            >
                                {PAGINATION_LIMITS.map(limit => (
                                    <CustomSelectItem key={limit} value={limit.toString()}>
                                        {limit}
                                    </CustomSelectItem>
                                ))}
                            </CustomSelect>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-1">
                            <Button
                                onClick={onMobileClose}
                                variant="primary"
                                size="sm"
                                className="text-sm lg:hidden"
                                aria-label="Close filters"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
