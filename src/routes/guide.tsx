import { FeaturedTeamsStrip, SEO } from "@/components"
import { Card, CardContent } from "@/components/ui/card"
import { createFileRoute, Link } from "@tanstack/react-router"
import { BarChart3, Calendar, Gamepad2, Monitor } from "lucide-react"

export const Route = createFileRoute("/guide")({
    component: Guide,
})

function Guide() {
    return (
        <>
            <SEO
                title="Guide"
                description="Learn how to get the most out of dotapro's professional Dota 2 analytics."
            />
            <div className="mx-4 min-h-[calc(100vh-4rem)] max-w-4xl space-y-8 py-6 sm:mx-auto">
                {/* Hero Section */}
                <div className="space-y-4 py-8 text-center">
                    <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                        Welcome to dotapro
                    </h1>
                    <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg md:text-lg lg:text-xl">
                        Your focused gateway to professional Dota 2 analytics — built around the teams the community
                        watches most, not every pro match on the books.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-border/50">
                        <CardContent className="pt-6">
                            <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                                <Calendar className="text-primary h-6 w-6" />
                            </div>
                            <h3 className="text-foreground mb-2 text-xl font-semibold">Explore Series</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Find recent series filtered by league, team, or both. Looking for{" "}
                                <Link to="/series" search={{ league: 19435 }} className="text-blue-500 hover:underline">
                                    PGL Wallachia 2026 Season 7
                                </Link>{" "}
                                or want to see what{" "}
                                <Link to="/series" search={{ team: 2163 }} className="text-blue-500 hover:underline">
                                    Team Liquid
                                </Link>{" "}
                                and{" "}
                                <Link to="/series" search={{ team: 7554697 }} className="text-blue-500 hover:underline">
                                    Nigma Galaxy
                                </Link>{" "}
                                have been playing? It's all here.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50">
                        <CardContent className="pt-6">
                            <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                                <Gamepad2 className="text-primary h-6 w-6" />
                            </div>
                            <h3 className="text-foreground mb-2 text-xl font-semibold">Match Details</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Dive into individual matches with advanced filtering. Search by{" "}
                                <Link to="/matches" className="text-blue-500 hover:underline">
                                    hero
                                </Link>
                                ,{" "}
                                <Link to="/matches" className="text-blue-500 hover:underline">
                                    player
                                </Link>
                                , or any combination of filters to find exactly what you're looking for.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-border/50">
                    <CardContent className="pt-6">
                        <h3 className="text-foreground mb-2 text-xl font-semibold">Start with your team</h3>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            Pick a team to jump straight into their recent series.
                        </p>
                        <FeaturedTeamsStrip limit={10} showAndMore={false} logoClassName="h-8 w-8" />
                    </CardContent>
                </Card>

                {/* Getting Started Section */}
                <Card className="border-border/50">
                    <CardContent className="pt-6">
                        <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                            <BarChart3 className="text-primary h-6 w-6" />
                        </div>
                        <h3 className="text-foreground mb-2 text-xl font-semibold">Analytics That Matter</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Unlike traditional platforms that drown you in public match data, dotapro focuses on
                            professional tier leagues. Every stat, every filter is designed to help you understand the
                            pro scene—whether you're a casual fan, a caster preparing for a broadcast, or a pro player
                            scouting opponents.
                        </p>
                    </CardContent>
                </Card>

                {/* Tips Section */}
                <div className="border-border/50 bg-card/50 rounded-lg border p-6">
                    <div className="mb-4 flex items-center gap-3">
                        <Monitor className="text-muted-foreground h-5 w-5" />
                        <h3 className="text-foreground text-lg font-semibold">Pro Tip</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        While dotapro is responsive across devices, the best experience is on desktop.
                    </p>
                </div>

                {/* Feature Requests */}
                <Card className="border-border/50 from-primary/5 bg-gradient-to-br to-transparent">
                    <CardContent className="pt-6">
                        <h3 className="text-foreground mb-3 text-xl font-semibold">Have an idea?</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            dotapro is actively developed. Check out the{" "}
                            <Link to="/about" hash="features-to-add" className="text-blue-500 hover:underline">
                                planned features
                            </Link>{" "}
                            and let us know what you'd like to see next. Your feedback shapes the future of the
                            platform.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
