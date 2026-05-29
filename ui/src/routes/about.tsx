import { SEO } from "@/components"
import { Card, CardContent } from "@/components/ui/card"
import { getPopularData } from "@/lib"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Heart, Lightbulb, Users } from "lucide-react"
export const Route = createFileRoute("/about")({
    component: About,
})

function About() {
    const trackedTeams = getPopularData().popular_teams

    return (
        <>
            <SEO
                title="About"
                description="Learn about dotapro - an open source, completely free-to-use platform about professional Dota 2 analytics."
            />
            <div className="mx-4 min-h-[calc(100vh-4rem)] max-w-4xl space-y-8 py-6 sm:mx-auto">
                {/* Hero Section */}
                <div className="space-y-4 py-8 text-center">
                    <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                        About dotapro
                    </h1>
                    <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg md:text-lg lg:text-xl">
                        An open source platform built for the professional <span className="text-nowrap">Dota 2</span>{" "}
                        community.
                    </p>
                </div>

                {/* What's dotapro */}
                <Card className="border-border/50">
                    <CardContent className="pt-6">
                        <h2 className="text-foreground mb-4 text-xl font-semibold">What is dotapro?</h2>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                            dotapro tracks matches from a focused set of top pro teams — the ones the community
                            actually watches — instead of indexing every professional game on OpenDota. While established
                            platforms like Dotabuff, Stratz, and OpenDota offer comprehensive data across all matches,
                            dotapro's focus is different.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            We distill the noise of public match data and deliver the analytics that actually matter to
                            Dota players—from casual fans following their favorite teams to pro players scouting
                            opponents before big matches.
                        </p>
                    </CardContent>
                </Card>

                <Card id="tracked-teams" className="border-border/50">
                    <CardContent className="pt-6">
                        <h2 className="text-foreground mb-4 text-xl font-semibold">Tracked teams</h2>
                        <ul className="grid gap-3 sm:grid-cols-2">
                            {trackedTeams.map(team => (
                                <li key={team.id} className="flex items-center gap-3">
                                    {team.logo_url && (
                                        <img
                                            src={team.logo_url}
                                            alt={`${team.name} logo`}
                                            className="h-8 w-8 shrink-0 object-contain"
                                        />
                                    )}
                                    <Link
                                        to="/series"
                                        search={{ team: team.id }}
                                        className="text-foreground hover:text-primary font-medium transition-colors"
                                    >
                                        {team.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <p className="text-muted-foreground mt-4 text-sm">
                            This list may grow over time.{" "}
                            <a
                                href="https://github.com/nk1e/dotapro/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                Suggest a team on GitHub
                            </a>
                            .
                        </p>
                    </CardContent>
                </Card>

                {/* Who is it for */}
                <Card className="border-border/50">
                    <CardContent className="pt-6">
                        <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                            <Users className="text-primary h-6 w-6" />
                        </div>
                        <h2 className="text-foreground mb-6 text-xl font-semibold">Who is dotapro for?</h2>
                        <ul className="text-muted-foreground space-y-3">
                            <li>
                                <strong className="text-foreground font-medium">Casual fans</strong> – Follow your
                                favorite teams and jump straight into their recent series without drowning in
                                statistics.
                            </li>
                            <li>
                                <strong className="text-foreground font-medium">Casters and analysts</strong> – Quick
                                access to match history and team performance for broadcast prep.
                            </li>
                            <li>
                                <strong className="text-foreground font-medium">Pro players & coaches</strong> – Scout
                                opponents, analyze strategies, track the evolving meta.
                            </li>
                            <li>
                                <strong className="text-foreground font-medium">Dota enthusiasts</strong> – Deep dive
                                into professional match data with clean, focused tooling.
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Credits */}
                <Card className="border-border/50">
                    <CardContent className="pt-6">
                        <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                            <Heart className="text-primary h-6 w-6" />
                        </div>
                        <h2 className="text-foreground mb-4 text-xl font-semibold">Credits</h2>
                        <ul className="text-muted-foreground space-y-4">
                            <li>
                                <strong className="text-foreground font-medium">OpenDota</strong> — Their API makes
                                professional <span className="text-nowrap">Dota 2</span> data accessible to everyone.
                                <a
                                    href="https://www.opendota.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-1 text-blue-500 hover:underline"
                                >
                                    opendota.com
                                </a>
                            </li>
                            <li>
                                <strong className="text-foreground font-medium">Dota 2 Aegis 3D model</strong> by{" "}
                                <a
                                    href="https://sketchfab.com/dima48"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    dima48
                                </a>{" "}
                                on Sketchfab (CC BY)
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Roadmap */}
                <Card id="features-to-add" className="border-border/50">
                    <CardContent className="pt-6">
                        <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                            <Lightbulb className="text-primary h-6 w-6" />
                        </div>
                        <h2 className="text-foreground mb-4 text-xl font-semibold">Coming soon</h2>
                        <ul className="text-muted-foreground mb-4 space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="bg-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                                <span>
                                    <strong className="text-foreground">No spoiler mode</strong> – Toggle to hide match
                                    and series results when browsing
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                                <span>
                                    <strong className="text-foreground">Multi-language support</strong> – Expanding
                                    beyond English to serve the global community
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                                <span>
                                    <strong className="text-foreground">Interactive draft mode</strong> – Visualize hero
                                    picks and bans for both series and matches
                                </span>
                            </li>
                        </ul>
                        <p className="text-muted-foreground text-sm">
                            Have a feature request?{" "}
                            <a
                                href="https://github.com/nk1e/dotapro/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                Open an issue
                            </a>{" "}
                            and help shape the future of dotapro.
                        </p>
                    </CardContent>
                </Card>

                {/* Contributing */}
                <Card className="border-border/50 from-primary/5 bg-linear-to-br to-transparent">
                    <CardContent className="pt-6">
                        <h2 className="text-foreground mb-4 text-xl font-semibold">Open to contributions</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            dotapro is open source and contributions are welcome. Whether it's fixing bugs, improving
                            the UI, or adding new features—every pull request makes the platform better for everyone.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
