import { cn } from "@/lib"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "card" | "text" | "button"
}

export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "skeleton-shimmer rounded-md",
                variant === "card" && "rounded-xl",
                variant === "text" && "h-4 w-3/4",
                variant === "button" && "h-8 w-32 rounded-md",
                className,
            )}
            {...props}
        />
    )
}

// SeriesCard skeleton matching the exact layout
export function SeriesCardSkeleton() {
    return (
        <div className="group bg-background-card/80 text-card-foreground relative overflow-hidden rounded-xl shadow-xl backdrop-blur-sm">
            <div className="relative z-10 flex h-full flex-col p-4">
                {/* Teams and Score */}
                <div className="border-border mb-3 flex items-center justify-between gap-4 border-b pb-3">
                    {/* Team A */}
                    <div className="flex min-w-0 flex-1 items-center">
                        <div className="flex min-w-0 items-center gap-1">
                            <Skeleton className="h-7 w-11 shrink-0 rounded" variant="default" />
                            <Skeleton className="h-5 w-24" variant="text" />
                        </div>
                    </div>

                    {/* Score */}
                    <div className="flex shrink-0 items-center justify-center">
                        <Skeleton className="h-4 w-4" variant="default" />
                        <span className="text-foreground-muted mx-2">-</span>
                        <Skeleton className="h-4 w-4" variant="default" />
                    </div>

                    {/* Team B */}
                    <div className="flex min-w-0 flex-1 items-center justify-end">
                        <div className="flex min-w-0 items-center justify-end gap-1">
                            <Skeleton className="h-5 w-24" variant="text" />
                            <Skeleton className="h-7 w-11 shrink-0 rounded" variant="default" />
                        </div>
                    </div>
                </div>

                {/* League and Date */}
                <div className="text-foreground-muted flex flex-1 flex-col gap-2 text-xs">
                    <Skeleton className="h-3 w-32" variant="default" />
                    <Skeleton className="h-3 w-24" variant="default" />
                </div>

                {/* Button */}
                <div className="mt-auto flex items-center justify-end">
                    <Skeleton className="h-8 w-32 rounded-md" variant="button" />
                </div>
            </div>
        </div>
    )
}

// MatchCard skeleton matching the MatchCard layout
export function MatchCardSkeleton() {
    return (
        <div className="bg-background-card/80 text-card-foreground relative min-w-67.5 overflow-hidden rounded-xl shadow-xl backdrop-blur-sm">
            <div className="relative z-10 flex h-full flex-col p-4">
                {/* Radiant Team */}
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-10 rounded" variant="default" />
                        <Skeleton className="h-5 w-28" variant="text" />
                    </div>
                </div>

                {/* Radiant Heroes */}
                <div className="mb-2 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={`rad-${i}`} className="h-6 w-8" variant="default" />
                    ))}
                </div>

                {/* VS Divider */}
                <div className="my-3 flex justify-center">
                    <Skeleton className="h-6 w-6 rounded-full" variant="default" />
                </div>

                {/* Dire Team */}
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-10 rounded" variant="default" />
                        <Skeleton className="h-5 w-24" variant="text" />
                    </div>
                </div>

                {/* Dire Heroes */}
                <div className="mb-3 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={`dire-${i}`} className="h-6 w-8" variant="default" />
                    ))}
                </div>

                {/* Separator */}
                <div className="border-border mb-3 border-t" />

                {/* League and Date */}
                <div className="text-foreground-muted mb-2 flex flex-col gap-2 text-xs">
                    <Skeleton className="h-3 w-32" variant="default" />
                    <Skeleton className="h-3 w-24" variant="default" />
                </div>

                {/* Button */}
                <div className="mt-auto flex justify-end">
                    <Skeleton className="h-8 w-28 rounded-md" variant="button" />
                </div>
            </div>
        </div>
    )
}
