import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getHeroById, getItemById, getNeutralById } from "./dotautils"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const MS_PER_MINUTE = 60 * 1000
const MS_PER_HOUR = 60 * MS_PER_MINUTE
const MS_PER_DAY = 24 * MS_PER_HOUR
const MS_PER_MONTH = 30.44 * MS_PER_DAY
const MS_PER_YEAR = 365.25 * MS_PER_DAY

const UNIT_LABELS = ["year", "month", "day", "hour", "minute"] as const

export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()

    const years = Math.floor(diffMs / MS_PER_YEAR)
    const months = Math.floor((diffMs % MS_PER_YEAR) / MS_PER_MONTH)
    const days = Math.floor((diffMs % MS_PER_MONTH) / MS_PER_DAY)
    const hours = Math.floor((diffMs % MS_PER_DAY) / MS_PER_HOUR)
    const minutes = Math.floor((diffMs % MS_PER_HOUR) / MS_PER_MINUTE)

    const unitValues = [years, months, days, hours, minutes]
    const firstUnitIndex = unitValues.findIndex(value => value > 0)

    if (firstUnitIndex === -1) {
        return "just now"
    }

    const firstValue = unitValues[firstUnitIndex]
    const firstLabel = UNIT_LABELS[firstUnitIndex]
    const firstPart = `${firstValue} ${firstLabel}${firstValue !== 1 ? "s" : ""}`

    const secondValue = unitValues[firstUnitIndex + 1]
    if (!secondValue || secondValue === 0) {
        return firstPart
    }

    const secondLabel = UNIT_LABELS[firstUnitIndex + 1]
    const secondPart = `${secondValue} ${secondLabel}${secondValue !== 1 ? "s" : ""}`

    return `${firstPart} and ${secondPart}`
}

export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`
    } else if (hours > 0) {
        return `${hours} hour${hours !== 1 ? "s" : ""}`
    }
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`
}

export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (err) {
        console.error("Failed to copy:", err)
        return false
    }
}

// Hero and item image URLs from OpenDota CDN
// Uses hero_id/item_id to name mapping from dota-data.ts

export function getHeroImageUrl(heroId: number): string {
    const hero = getHeroById(heroId)
    if (!hero) {
        // Fallback to a placeholder if hero not found
        return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png`
    }
    // OpenDota CDN pattern: https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/{hero_name}.png
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.name}.png`
}

export function getItemImageUrl(itemId: number): string {
    if (itemId === 0) {
        // Return empty string for empty slots
        return ""
    }
    // First try to find in regular items
    const item = getItemById(itemId)
    if (item) {
        // OpenDota CDN pattern: https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/{item_name}.png
        return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${item.name}.png`
    }
    // Then try to find in neutral items
    const neutral = getNeutralById(itemId)
    if (neutral) {
        // OpenDota CDN pattern: https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/{item_name}.png
        return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${neutral.name}.png`
    }
    // Return empty string for unknown items
    return ""
}
