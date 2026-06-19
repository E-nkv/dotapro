import { LIMIT_OPTIONS } from "@/constants"
import type { MatchFilters } from "@/types"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import {
    ActiveFiltersBar,
    HeroSelector,
    LeagueSelector,
    PlayerSelector,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    TeamSelector,
} from ".."

const SORT_OPTIONS = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
]

export function MatchFilters() {
    const search = useSearch({ strict: false }) as MatchFilters
    const navigate = useNavigate({ from: "/matches/" })
    const [hasSetMobileDefault, setHasSetMobileDefault] = useState(false)

    // Set default limit to 10 on mobile (for better performance)
    // Using useEffect since we're not measuring layout
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!hasSetMobileDefault && search.limit === undefined && window.innerWidth < 1024) {
            navigate({
                to: ".",
                search: { ...search, limit: 10 },
                replace: true,
            })
            setHasSetMobileDefault(true)
        }
    }, [search, navigate, hasSetMobileDefault])
    /* eslint-enable react-hooks/set-state-in-effect */

    const updateFilters = (newFilters: Partial<MatchFilters>) => {
        navigate({
            to: ".",
            search: { ...search, ...newFilters },
            replace: true,
        })
    }

    // Handler for removing individual filter
    const handleRemoveFilter = (key: "league" | "team" | "hero" | "player" | "limit") => {
        updateFilters({ [key]: undefined })
    }

    return (
        <div className="bg-background-accent mb-6 rounded-lg p-4">
            {/* Active Filters Bar */}
            <ActiveFiltersBar filters={search} onRemove={handleRemoveFilter} />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <LeagueSelector initialValue={search.league} onSelect={league => updateFilters({ league })} />

                <TeamSelector initialValue={search.team} onSelect={team => updateFilters({ team })} />

                <HeroSelector initialValue={search.hero} onSelect={hero => updateFilters({ hero, c: undefined })} />

                <PlayerSelector
                    initialValue={search.player}
                    onSelect={player => updateFilters({ player, c: undefined })}
                />

                <Select value={search.sort || "newest"} onValueChange={sort => updateFilters({ sort })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={search.limit?.toString() || (window.innerWidth < 1024 ? "10" : "20")}
                    onValueChange={limit => updateFilters({ limit: parseInt(limit) })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={window.innerWidth < 1024 ? "10" : "20"} />
                    </SelectTrigger>
                    <SelectContent>
                        {LIMIT_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label.replace("Series", "Matches")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
