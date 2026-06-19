import { getSeriesById, type SeriesDetail } from "@/api"
import {
    ErrorState,
    GameTabContent,
    SEO,
    SeriesHeader,
    Spinner,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useParams } from "@tanstack/react-router"

export const Route = createFileRoute("/series/$id")({
    component: SeriesDetailPage,
})

function SeriesDetailPage() {
    const { id } = useParams({ strict: false })
    const seriesId = Number(id)

    const { data, isLoading, error } = useQuery({
        queryKey: ["series", seriesId],
        queryFn: async ({ signal }): Promise<SeriesDetail> => {
            return getSeriesById(seriesId, signal)
        },
        retry: 2,
    })

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <Spinner />
            </div>
        )
    }

    if (error) {
        const errorMessage = (error as Error).message
        const isNotFound = errorMessage.includes("404")
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <ErrorState
                    title={isNotFound ? "Series Not Found" : "Error Loading Series"}
                    error={isNotFound ? `Series with ID ${seriesId} could not be found.` : errorMessage}
                />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <ErrorState title="Series Not Found" error={`Series with ID ${seriesId} could not be found.`} />
            </div>
        )
    }

    return (
        <>
            <SEO
                title={`${data.team_a.name} vs ${data.team_b.name}`}
                description={`View match details for ${data.team_a.name} vs ${data.team_b.name}. `}
            />
            <div className="mx-auto max-w-7xl px-2 py-6">
                <SeriesHeader series={data} />

                {data.matches.length > 0 ? (
                    <Tabs defaultValue="game-1">
                        <TabsList className="mb-4 max-w-full overflow-x-auto overflow-y-hidden">
                            {data.matches.map((_, i) => (
                                <TabsTrigger
                                    key={i}
                                    value={`game-${i + 1}`}
                                    className="px-2 text-sm sm:px-4 sm:text-base"
                                >
                                    {data.matches.length >= 4 ? (
                                        <>
                                            <span className="hidden sm:inline">Game {i + 1}</span>
                                            <span className="sm:hidden">G{i + 1}</span>
                                        </>
                                    ) : (
                                        <>Game {i + 1}</>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {data.matches.map((match, i) => (
                            <TabsContent key={i} value={`game-${i + 1}`}>
                                <GameTabContent
                                    match={match}
                                    gameNumber={i + 1}
                                    radiantTeam={data.team_a}
                                    direTeam={data.team_b}
                                />
                            </TabsContent>
                        ))}
                    </Tabs>
                ) : (
                    <div className="text-foreground-muted py-12 text-center">No matches available for this series.</div>
                )}
            </div>
        </>
    )
}
