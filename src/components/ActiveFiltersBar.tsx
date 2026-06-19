import { X } from "lucide-react"
import { Badge } from "./ui/badge"

interface ActiveFiltersBarProps {
    filters: {
        league?: number
        team?: number
        player?: number
        hero?: number
        sort?: string
    }
    onRemove: (key: "league" | "team" | "hero" | "player" | "limit") => void
    labels?: {
        league?: string
        team?: string
        player?: string
        hero?: string
    }
}

export function ActiveFiltersBar({ filters, onRemove, labels = {} }: ActiveFiltersBarProps) {
    const activeFilters = Object.entries(filters).filter(([, value]) => value !== undefined && value !== "")

    if (activeFilters.length === 0) return null

    const getLabel = (key: string, value: string | number) => {
        const label = labels[key as keyof typeof labels]
        if (label) return label
        switch (key) {
            case "league":
                return `League #${value}`
            case "team":
                return `Team #${value}`
            case "hero":
                return `Hero #${value}`
            case "player":
                return `Player #${value}`
            case "sort":
                return value === "newest" ? "Newest first" : "Oldest first"
            case "limit":
                return `Limit ${value}`
            default:
                return String(value)
        }
    }

    return (
        <div className="mb-4 flex flex-wrap gap-2">
            {activeFilters.map(([key, value]) => (
                <Badge key={key} variant="active" className="pr-1 pl-2">
                    <span className="font-normal">{getLabel(key, value as string | number)}</span>
                    <button
                        onClick={() => onRemove(key as "league" | "team" | "hero" | "player")}
                        className="hover:bg-primary-500/20 ml-1 cursor-pointer rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${key} filter`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}
        </div>
    )
}
