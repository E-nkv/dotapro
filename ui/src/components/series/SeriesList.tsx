import { useNavigate, useSearch } from "@tanstack/react-router"
import { AlertCircle } from "lucide-react"
import { Button, EmptyState, ErrorState, SeriesCardSkeleton } from ".."
import type { Pagination, Series } from "../../api"
import { SeriesCard } from "./SeriesCard"

interface SeriesListProps {
    series: Series[]
    isLoading?: boolean
    error?: Error | null
    pagination?: Pagination
    limit?: number
}

export function SeriesList({ series, isLoading, error, pagination, limit }: SeriesListProps) {
    const navigate = useNavigate()
    const search = useSearch({ strict: false })
    const skeletonCount = limit || 20

    const handleLoadMore = () => {
        if (pagination?.nc) {
            navigate({
                to: ".",
                search: { ...search, c: pagination.nc },
            })
        }
    }

    const handlePrevious = () => {
        // Strip cursor param then navigate to base list URL
        const searchWithoutCursor = { ...search }
        delete (searchWithoutCursor as { c?: string }).c
        navigate({ to: "/series", search: searchWithoutCursor, replace: true })
    }

    if (error) {
        return <ErrorState error={error} title="Error loading series" />
    }

    if (isLoading) {
        return (
            <div className="w-full px-2">
                {/* Skeleton cards matching the grid layout */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(450px,1fr))] sm:gap-6">
                    {Array.from({ length: skeletonCount }).map((_, i) => (
                        <SeriesCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        )
    }

    if (!series || series.length === 0) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <EmptyState
                    icon={<AlertCircle className="h-6 w-6" />}
                    title="No series found"
                    description="Try adjusting your filters to find what you're looking for."
                />
            </div>
        )
    }

    return (
        <div className="w-full px-2 md:px-12">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(450px,1fr))] sm:gap-6">
                {series.map((s, index) => (
                    <SeriesCard
                        key={s.series_id}
                        series={s}
                        style={
                            {
                                animationDelay: `${Math.min(index, 10) * 50}ms`,
                            } as React.CSSProperties
                        }
                        className="card-entrance"
                    />
                ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-3 sm:mt-6 sm:gap-4">
                <Button onClick={handlePrevious} variant="cool-outline" size="sm" disabled={isLoading || !search.c}>
                    Previous
                </Button>
                <Button
                    onClick={handleLoadMore}
                    variant="cool-outline"
                    size="sm"
                    disabled={isLoading || !pagination?.nc || !pagination?.has_more}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
