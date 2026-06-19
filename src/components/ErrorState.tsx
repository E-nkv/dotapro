import { cn } from "@/lib"
import { AlertCircle } from "lucide-react"

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
    error?: Error | string
    title?: string
    action?: React.ReactNode
    size?: "sm" | "md" | "lg"
}

const sizeClasses = {
    sm: "p-6",
    md: "p-8",
    lg: "p-12",
}

export function ErrorState({ error, title = "Error", action, size = "md", className, ...props }: ErrorStateProps) {
    const rawErrorMessage = typeof error === "string" ? error : error?.message || "An unexpected error occurred"

    // Provide a more user-friendly message for network errors
    const errorMessage = rawErrorMessage.toLowerCase().includes("failed to fetch")
        ? "Unable to connect to the server. Please check your internet connection or try again later."
        : rawErrorMessage

    return (
        <div
            className={cn("flex flex-col items-center justify-center text-center", sizeClasses[size], className)}
            role="alert"
            aria-live="assertive"
            {...props}
        >
            <div className="text-error-500 mb-4" aria-hidden="true">
                <AlertCircle className="h-12 w-12" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>
            <p className="text-foreground-muted mb-4 max-w-sm">{errorMessage}</p>
            {action}
        </div>
    )
}
