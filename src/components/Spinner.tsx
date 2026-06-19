import { cn } from "@/lib"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
    xl: "w-12 h-12 border-4",
}

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
    return (
        <div
            className={cn(
                "spinner-gradient rounded-full border-solid border-transparent",
                sizeClasses[size],
                className,
            )}
            role="status"
            aria-label="Loading"
            aria-live="polite"
            {...props}
        />
    )
}
