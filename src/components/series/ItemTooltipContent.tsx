import { getItemById, getNeutralById, getItemByName } from "@/lib/dotautils"
import { getItemImageUrl } from "@/lib"

export function ItemTooltipContent({ itemId }: { itemId: number }) {
    const item = getItemById(itemId) || getNeutralById(itemId)
    if (!item || item.id === 0) return null

    return (
        <div className="w-72 overflow-hidden rounded-md border border-[#30303f] bg-[#1c1d21] font-sans text-sm text-[#a1aab3] shadow-xl focus-visible:outline-none">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#30303f] bg-linear-to-r from-[#282836] to-[#1c1d21] p-3">
                <img src={getItemImageUrl(item.id)!} alt={item.displayName} className="h-10 w-14 rounded shadow-md" />
                <div>
                    <div className="text-base font-bold text-white">{item.displayName}</div>
                    {item.tier ? (
                        <div className="text-xs font-semibold text-[#e5c158]">Tier {item.tier} Neutral</div>
                    ) : (
                        <div className="flex items-center gap-1 font-semibold text-[#e5c158]">
                            <img
                                src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/tooltips/gold.png"
                                alt="Gold"
                                className="h-4 w-4"
                            />
                            {item.cost}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 p-3">
                {/* Attributes */}
                {item.attrib && item.attrib.length > 0 && (
                    <div className="flex flex-col gap-0.5">
                        {item.attrib.map((attr, idx) => {
                            if (!attr.display) return null
                            const parts = attr.display.split("{value}")
                            return (
                                <div key={idx}>
                                    {parts[0]}
                                    <span className="font-semibold text-white">{attr.value}</span>
                                    {parts[1]}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Abilities */}
                {item.abilities &&
                    item.abilities.map((ability, idx) => (
                        <div key={idx} className="overflow-hidden rounded border border-[#23242b] bg-[#141518]">
                            <div className="flex items-center justify-between bg-[#23242b] px-2 py-1 font-semibold text-white">
                                <span>
                                    {ability.type === "active" ? "Active: " : "Passive: "}
                                    {ability.title}
                                </span>
                                <div className="flex gap-2 text-xs font-normal">
                                    {item.cd && (
                                        <span className="flex items-center gap-1 text-[#95c07a]">⏱ {item.cd}</span>
                                    )}
                                    {item.mc && (
                                        <span className="flex items-center gap-1 text-[#69a1e2]">💧 {item.mc}</span>
                                    )}
                                </div>
                            </div>
                            <div className="p-2 text-xs whitespace-pre-wrap text-[#8c9aa6]">{ability.description}</div>
                        </div>
                    ))}

                {/* Components */}
                {item.components && item.components.length > 0 && (
                    <div className="border-t border-[#30303f] pt-2">
                        <div className="mb-1 text-xs text-white">Components:</div>
                        <div className="flex flex-wrap gap-1">
                            {item.components.map((compName, idx) => {
                                const compItem = getItemByName(compName)
                                if (!compItem) return null
                                return (
                                    <div key={idx} className="group relative">
                                        <img
                                            src={getItemImageUrl(compItem.id)!}
                                            alt={compItem.displayName}
                                            className="h-7 w-10 rounded"
                                        />
                                        <div className="absolute right-0 bottom-0 rounded-tl bg-black/80 px-1 text-[10px] text-[#e5c158]">
                                            {compItem.cost}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
