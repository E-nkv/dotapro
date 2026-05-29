import { cn } from "@/lib"
import { Link } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"

interface BackLinkProps {
    to: "/matches" | "/series"
    className?: string
}

export function BackLink({ to, className }: BackLinkProps) {
    return (
        <Link
            to={to}
            className={cn("text-foreground-muted hover:text-foreground mb-4 flex w-fit cursor-pointer items-center gap-2", className)}
            aria-label={`Back to ${to === "/matches" ? "matches list" : "series list"}`}
        >
            <ChevronLeft className="h-4 w-4" />
            Back to {to === "/matches" ? "Matches" : "Series"}
        </Link>
    )
}
