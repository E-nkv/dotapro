import { getHeroImageUrl } from "@/lib"
import { getHeroById } from "@/lib/dotautils"

export function HeroTooltipContent({ heroId }: { heroId: number }) {
    const hero = getHeroById(heroId)
    if (!hero) return null

    return (
        <div className="w-80 overflow-hidden rounded-md border border-[#30303f] bg-[#1c1d21] font-sans text-sm text-[#a1aab3] shadow-xl focus-visible:outline-none">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#30303f] bg-linear-to-r from-[#282836] to-[#1c1d21] p-3">
                <img src={getHeroImageUrl(hero.id)} alt={hero.displayName} className="h-10.5 w-16 rounded shadow-md" />
                <div>
                    <div className="text-base font-bold text-white">{hero.displayName}</div>
                </div>
            </div>
            {/* Lore */}
            <div className="p-3">
                <p className="text-xs leading-relaxed">{hero.lore}</p>
            </div>
        </div>
    )
}
