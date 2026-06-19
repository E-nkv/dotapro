import type { SeriesMatchDetail, TeamInfo } from "@/api"
import { Button, PlayersTable } from ".."
import { copyToClipboard, formatDuration } from "@/lib"
import { Check, Clock, Copy, ExternalLink } from "lucide-react"
import * as React from "react"

interface GameTabContentProps {
    match: SeriesMatchDetail
    gameNumber: number
    radiantTeam: TeamInfo
    direTeam: TeamInfo
}

export function GameTabContent({ match, gameNumber, radiantTeam, direTeam }: GameTabContentProps) {
    const [copied, setCopied] = React.useState(false)

    const handleCopyId = async () => {
        const success = await copyToClipboard(match.match_id.toString())
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div
            className="bg-background-card overflow-hidden rounded-xl border border-white/10 focus:outline-none"
            role="region"
            aria-label={`Game ${gameNumber} details`}
        >
            <div className="p-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h3 className="text-md" id={`match-${match.match_id}`}>
                            Match ID: {match.match_id}
                        </h3>
                        <p className="text-foreground-muted flex items-center gap-1 text-sm select-none">
                            <Clock size={15} aria-hidden="true" />{" "}
                            <span aria-label={`Duration: ${formatDuration(match.duration)}`}>
                                {formatDuration(match.duration)}
                            </span>
                        </p>
                    </div>
                    {/* Mobile: Icon-only buttons */}
                    <div className="flex justify-center gap-2 sm:hidden">
                        <Button variant="outline" size="sm" onClick={handleCopyId} className="p-2" aria-label="Copy ID">
                            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>

                        <Button variant="outline" size="sm" asChild className="p-2" aria-label="View on OpenDota">
                            <a
                                href={`https://opendota.com/matches/${match.match_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                            >
                                OD
                                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </a>
                        </Button>

                        <Button variant="outline" size="sm" asChild className="p-2" aria-label="View on Stratz">
                            <a
                                href={`https://stratz.com/matches/${match.match_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                            >
                                Stratz
                                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </a>
                        </Button>
                    </div>
                    {/* Desktop: Full text buttons */}
                    <div className="hidden gap-2 sm:flex">
                        <Button variant="outline" size="sm" onClick={handleCopyId} className="gap-2 leading-relaxed">
                            {copied ? "Copied!" : "Copy ID"}
                            {!copied ? <Copy className="h-4 w-4" /> : <Check className="h-4 w-4 text-green-600" />}
                        </Button>

                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={`https://opendota.com/matches/${match.match_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 leading-relaxed"
                                aria-label="View match on OpenDota"
                            >
                                <p>OpenDota</p>
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={`https://stratz.com/matches/${match.match_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 leading-relaxed"
                                aria-label="View match on Stratz"
                            >
                                <p>Stratz</p>
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
            <div className="px-6 pb-6">
                <PlayersTable match={match} radiantTeam={radiantTeam} direTeam={direTeam} />
            </div>
        </div>
    )
}
