import { AegisViewer, Button, FeaturedTeamsStrip, SEO } from "@/components"
import { createFileRoute, Link } from "@tanstack/react-router"

const HOMEPAGE_DESCRIPTION =
    "Professional Dota 2 analytics without the public match noise. Browse series and matches from premium and professional leagues across the pro scene."

export const Route = createFileRoute("/")({
    component: Index,
})

function HeroCTAs({ className }: { className?: string }) {
    return (
        <div className={className}>
            <Button
                asChild
                variant="primary"
                size="sm"
                className="px-6 text-sm sm:px-6 sm:text-sm md:px-6 md:text-sm lg:px-8 lg:text-base"
            >
                <Link to="/series">View Series</Link>
            </Button>
            <Button
                asChild
                variant="cool-outline"
                size="sm"
                className="px-6 text-sm sm:px-6 sm:text-sm md:px-6 md:text-sm lg:px-8 lg:text-base"
            >
                <Link to="/matches">View Matches</Link>
            </Button>
        </div>
    )
}

function Index() {
    return (
        <>
            <SEO description={HOMEPAGE_DESCRIPTION} />
            <main className="min-h-0 flex-1 overflow-x-hidden sm:min-h-[calc(100vh-4rem)]">
                <div className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-4 md:px-6 md:py-8 lg:px-8 lg:py-12">
                    <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
                        <div className="flex flex-col items-center px-1 sm:px-2 md:items-start">
                            <h1 className="text-foreground mb-4 text-center sm:text-center md:text-left text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-tight">
                                Dota 2 analytics that actually help
                            </h1>
                            <p className="text-foreground-muted mb-6 text-center sm:text-center md:text-left text-base sm:text-lg lg:text-xl leading-relaxed">
                                Professional match data from premium and pro leagues — without drowning in public match
                                clutter.
                            </p>
                            <HeroCTAs className="hidden w-full flex-row items-center justify-center gap-2 sm:w-auto sm:gap-3 md:gap-4 lg:flex" />
                        </div>

                        <div className="relative flex justify-center py-6 lg:py-10">
                            <AegisViewer className="w-full max-w-[320px] lg:h-[480px] lg:w-[480px] lg:max-w-none" />
                        </div>

                        <HeroCTAs className="flex w-full flex-row items-center justify-center gap-2 sm:w-auto sm:gap-3 md:gap-4 lg:hidden" />
                    </div>

                    <FeaturedTeamsStrip className="mt-10 lg:mt-14" />
                </div>
            </main>
        </>
    )
}
