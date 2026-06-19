// Shared pagination constants for consistent UI across the application

export const PAGINATION_LIMITS = [10, 20, 40, 60] as const

export const LIMIT_OPTIONS = PAGINATION_LIMITS.map(limit => ({
    value: limit.toString(),
    label: `${limit} per page`,
}))

export type PaginationLimit = (typeof PAGINATION_LIMITS)[number]
