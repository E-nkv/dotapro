import { cn } from "@/lib"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    description?: string
    action?: React.ReactNode
    size?: "sm" | "md" | "lg"
    icon?: React.ReactNode
}

const sizeClasses = {
    sm: "p-6",
    md: "p-8",
    lg: "p-12",
}

export function EmptyState({
    title = "No data found",
    description,
    action,
    size = "md",
    icon,
    className,
    ...props
}: EmptyStateProps) {
    return (
        <div
            className={cn("flex flex-col items-center justify-center text-center", sizeClasses[size], className)}
            role="status"
            aria-live="polite"
            {...props}
        >
            <div className="mb-2 flex items-center gap-2">
                <h3 className="text-foreground text-lg font-semibold">{title}</h3>
                {icon && (
                    <span className="text-foreground-muted" aria-hidden="true">
                        {icon}
                    </span>
                )}
            </div>
            {description && <p className="text-foreground-muted mb-4 max-w-sm whitespace-nowrap">{description}</p>}
            {action}
        </div>
    )
}
