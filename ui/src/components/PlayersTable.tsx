import type { PlayerData, SeriesMatchDetail, TeamInfo } from "@/api"
import { cn, getHeroById, getHeroImageUrl, getItemById, getItemImageUrl, getNeutralById } from "@/lib"
import { Crown, Trophy } from "lucide-react"
import { lazy, Suspense } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tooltip } from "./ui"

// Lazy load tooltip components to reduce initial bundle size
const HeroTooltipContent = lazy(() =>
    import("./series/HeroTooltipContent").then(m => ({ default: m.HeroTooltipContent })),
)
const ItemTooltipContent = lazy(() =>
    import("./series/ItemTooltipContent").then(m => ({ default: m.ItemTooltipContent })),
)

// Wrapper components to handle Suspense inside tooltip content
function HeroTooltipWrapper({ heroId }: { heroId: number }) {
    return (
        <Suspense fallback={<div className="h-32 w-80 animate-pulse rounded-md bg-[#1c1d21]" />}>
            <HeroTooltipContent heroId={heroId} />
        </Suspense>
    )
}

function ItemTooltipWrapper({ itemId }: { itemId: number }) {
    return (
        <Suspense fallback={<div className="h-32 w-72 animate-pulse rounded-md bg-[#1c1d21]" />}>
            <ItemTooltipContent itemId={itemId} />
        </Suspense>
    )
}

interface PlayersTableProps {
    match: SeriesMatchDetail
    radiantTeam: TeamInfo
    direTeam: TeamInfo
}

export function PlayersTable({ match, radiantTeam, direTeam }: PlayersTableProps) {
    const { players_data, radiant_captain, dire_captain, radiant_win, radiant_score, dire_score } = match

    const radiantPlayers = players_data.filter(p => p.is_radiant)
    const direPlayers = players_data.filter(p => !p.is_radiant)

    return (
        <div className="flex flex-col gap-3" role="region" aria-label="Match players statistics">
            <TeamPlayersTable
                players={radiantPlayers}
                team="Radiant"
                captain={radiant_captain}
                teamColor="secondary"
                teamInfo={radiantTeam}
                score={radiant_score}
                isWinner={radiant_win}
            />
            <TeamPlayersTable
                players={direPlayers}
                team="Dire"
                captain={dire_captain}
                teamColor="primary"
                teamInfo={direTeam}
                score={dire_score}
                isWinner={!radiant_win}
            />
        </div>
    )
}

interface TeamPlayersTableProps {
    players: PlayerData[]
    team: "Radiant" | "Dire"
    captain: number | null
    teamColor: "primary" | "secondary"
    teamInfo: TeamInfo
    score: number
    isWinner: boolean
}

const formatNetWorth = (netWorth: number) => {
    if (netWorth >= 1000) {
        return `${(netWorth / 1000).toFixed(1)}K`
    }
    return `${netWorth}K`
}

function TeamPlayersTable({ players, captain, teamInfo, score, isWinner }: TeamPlayersTableProps) {
    return (
        <div
            className="bg-background-accent rounded-lg p-4"
            role="region"
            aria-label={`${teamInfo.name} team statistics`}
        >
            <div className="mb-3 flex items-center gap-2">
                <span className="text-base font-semibold sm:text-sm">{teamInfo.name}</span>
                <span className="text-foreground-muted text-base sm:text-sm" aria-label={`Score: ${score}`}>
                    {score}
                </span>
                {isWinner && (
                    <div
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold text-white"
                        aria-label="Winner"
                    >
                        <Trophy className="text-secondary size-5" aria-hidden="true" />
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <Table className="min-w-225 table-fixed">
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-foreground-muted w-20 px-3 text-xs tracking-wider uppercase">
                                Hero
                            </TableHead>
                            <TableHead className="text-foreground-muted w-48 px-3 text-xs tracking-wider uppercase">
                                Player
                            </TableHead>
                            <TableHead className="text-foreground-muted w-80 px-3 text-xs tracking-wider uppercase">
                                Items
                            </TableHead>
                            <TableHead className="text-secondary-500 w-24 px-3 text-right text-xs tracking-wider uppercase">
                                NET
                            </TableHead>
                            <TableHead className="text-foreground-muted w-32 px-3 text-center text-xs tracking-wider uppercase">
                                <span className="text-success-200">K</span>
                                <span className="text-foreground-muted mx-0.5">/</span>
                                <span className="text-error-300">D</span>
                                <span className="text-foreground-muted mx-0.5">/</span>
                                <span className="text-foreground">A</span>
                            </TableHead>
                            <TableHead className="text-foreground-muted w-20 px-3 text-center text-xs tracking-wider uppercase">
                                LH
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players.map(player => {
                            const isCaptain = captain === player.player_id
                            return (
                                <TableRow
                                    key={player.player_id}
                                    className="border-border hover:bg-background/50 border-b-2"
                                >
                                    {/* Hero */}
                                    <TableCell className="px-3">
                                        <Tooltip
                                            content={<HeroTooltipWrapper heroId={player.hero_id} />}
                                            side="right"
                                            contentClassName="p-0 border-none bg-transparent"
                                        >
                                            <img
                                                src={getHeroImageUrl(player.hero_id)}
                                                alt={getHeroById(player.hero_id)?.displayName ?? `Hero ${player.hero_id}`}
                                                className="h-7 w-auto cursor-pointer sm:h-8"
                                            />
                                        </Tooltip>
                                    </TableCell>
                                    {/* Player */}
                                    <TableCell className="px-3 py-0">
                                        <div className="flex items-center gap-1">
                                            <span
                                                className={cn("text-md", player.name ?? "")}
                                                title={player.name ?? "unknown"}
                                            >
                                                {player.name ?? "unknown"}
                                            </span>
                                            {isCaptain && (
                                                <span className="bg-secondary/20 text-secondary inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-xs">
                                                    <Crown className="h-3 w-3" />
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    {/* Items */}
                                    <TableCell className="px-3 py-1">
                                        <PlayerItems player={player} />
                                    </TableCell>
                                    {/* NET */}
                                    <TableCell className="px-3 py-0 text-right">
                                        <span className="text-secondary-500 text-sm">
                                            {formatNetWorth(player.net_worth)}
                                        </span>
                                    </TableCell>
                                    {/* KDA */}
                                    <TableCell className="px-3 py-0 text-center">
                                        <span className="text-sm">
                                            <span className="text-success-200">{player.kills}</span>
                                            <span className="text-foreground-muted mx-0.5">/</span>
                                            <span className="text-error-300">{player.deaths}</span>
                                            <span className="text-foreground-muted mx-0.5">/</span>
                                            <span className="text-foreground">{player.assists}</span>
                                        </span>
                                    </TableCell>
                                    {/* LH */}
                                    <TableCell className="px-3 py-0 text-center">
                                        <span className="text-foreground-muted text-sm">{player.last_hits}</span>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

// ============================================================================
// Helper Components
// ============================================================================

interface PlayerItemsProps {
    player: PlayerData
}

function PlayerItems({ player }: PlayerItemsProps) {
    return (
        <div className="flex items-center gap-2">
            {/* Inventory items */}
            <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                    {getInventorySlots(player).map(slot => (
                        <ItemSlot
                            key={slot.key}
                            itemId={slot.itemId}
                            itemUrl={slot.itemUrl}
                            widthClass={slot.widthClass}
                            heightClass={slot.heightClass}
                            emptyBgClass={slot.emptyBgClass}
                        />
                    ))}
                </div>
                {/* Backpack section */}
                <div className="flex gap-1">
                    {getBackpackSlots(player).map(slot => (
                        <ItemSlot
                            key={slot.key}
                            itemId={slot.itemId}
                            itemUrl={slot.itemUrl}
                            widthClass={slot.widthClass}
                            heightClass={slot.heightClass}
                            emptyBgClass={slot.emptyBgClass}
                        />
                    ))}
                </div>
            </div>
            {/* Neutral item */}
            <NeutralItemSlot itemId={player.item_neutral} />
        </div>
    )
}

interface ItemSlotProps {
    key: string
    itemId: number
    itemUrl: string
    widthClass: string
    heightClass: string
    emptyBgClass: string
}

function ItemSlot({ itemId, itemUrl, widthClass, heightClass, emptyBgClass }: ItemSlotProps) {
    const isEmpty = itemId === 0 || itemUrl === ""

    return (
        <Tooltip
            content={<ItemTooltipWrapper itemId={itemId} />}
            side="left"
            contentClassName="p-0 border-none bg-transparent"
        >
            <div className={`${widthClass} ${heightClass} rounded ${isEmpty ? emptyBgClass : ""}`}>
                {!isEmpty && <img src={itemUrl} alt={getItemById(itemId)?.displayName ?? "Item"} className="h-full w-full rounded object-cover" />}
            </div>
        </Tooltip>
    )
}

function NeutralItemSlot({ itemId }: { itemId: number }) {
    return (
        <Tooltip
            content={<ItemTooltipWrapper itemId={itemId} />}
            side="right"
            contentClassName="p-0 border-none bg-transparent"
        >
            <div className="border-border h-7 w-10 min-w-10 shrink-0 rounded border bg-black sm:h-8 sm:w-11 sm:min-w-11">
                {itemId > 0 && <img src={getItemImageUrl(itemId)} alt={getNeutralById(itemId)?.displayName ?? "Neutral Item"} className="h-full w-full rounded object-cover" />}
            </div>
        </Tooltip>
    )
}

// ============================================================================
// Helper Functions
// ============================================================================

function emptyLast<T extends { isEmpty: boolean }>(a: T, b: T): number {
    if (a.isEmpty && !b.isEmpty) return 1
    if (!a.isEmpty && b.isEmpty) return -1
    return 0
}

function getInventorySlots(player: PlayerData): ItemSlotProps[] {
    return [0, 1, 2, 3, 4, 5]
        .map(slot => ({
            key: `item-${slot}`,
            itemId: player[`item_${slot}` as keyof PlayerData] as number,
            itemUrl: getItemImageUrl(player[`item_${slot}` as keyof PlayerData] as number),
            widthClass: "w-8 sm:w-9",
            heightClass: "h-6 sm:h-7",
            emptyBgClass: "bg-black border border-border",
        }))
        .map(slot => ({ ...slot, isEmpty: slot.itemId === 0 }))
        .sort(emptyLast)
}

function getBackpackSlots(player: PlayerData): ItemSlotProps[] {
    return [0, 1, 2]
        .map(slot => ({
            key: `backpack-${slot}`,
            itemId: player[`backpack_${slot}` as keyof PlayerData] as number,
            itemUrl: getItemImageUrl(player[`backpack_${slot}` as keyof PlayerData] as number),
            widthClass: "w-7 sm:w-8",
            heightClass: "h-5 sm:h-6",
            emptyBgClass: "bg-background border border-border",
        }))
        .map(slot => ({ ...slot, isEmpty: slot.itemId === 0 }))
        .sort(emptyLast)
}
