import { cn } from "@/lib/utils"
import * as React from "react"
import { createPortal } from "react-dom"

interface TooltipProps {
    children: React.ReactNode
    content: React.ReactNode
    side?: "top" | "right" | "bottom" | "left"
    sideOffset?: number
    className?: string
    contentClassName?: string
}

// Constants for tooltip dimensions and viewport padding
const TOOLTIP_WIDTH = 320 // w-80 class
const TOOLTIP_HEIGHT = 120 // estimated height
const VIEWPORT_PADDING = 8

type Position = { top: number; left: number }

// Helper functions outside component to avoid hoisting issues
const getInitialPosition = (triggerRect: DOMRect, tooltipSide: string, offset: number): Position => {
    switch (tooltipSide) {
        case "top":
            return {
                top: triggerRect.top - TOOLTIP_HEIGHT - offset,
                left: triggerRect.left + (triggerRect.width - TOOLTIP_WIDTH) / 2,
            }
        case "bottom":
            return {
                top: triggerRect.bottom + offset,
                left: triggerRect.left + (triggerRect.width - TOOLTIP_WIDTH) / 2,
            }
        case "left":
            return {
                top: triggerRect.top + (triggerRect.height - TOOLTIP_HEIGHT) / 2,
                left: triggerRect.left - TOOLTIP_WIDTH - offset,
            }
        case "right":
        default:
            return {
                top: triggerRect.top + (triggerRect.height - TOOLTIP_HEIGHT) / 2,
                left: triggerRect.right + offset,
            }
    }
}

const adjustForViewportBounds = (position: Position, triggerRect: DOMRect, sideOffset: number): Position => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let { top, left } = position

    // Adjust horizontal position
    if (left < VIEWPORT_PADDING) {
        left = VIEWPORT_PADDING
    } else if (left + TOOLTIP_WIDTH > viewportWidth - VIEWPORT_PADDING) {
        left = Math.max(VIEWPORT_PADDING, triggerRect.left - TOOLTIP_WIDTH - sideOffset)
    }

    // Adjust vertical position
    if (top < VIEWPORT_PADDING) {
        top = VIEWPORT_PADDING
    } else if (top + TOOLTIP_HEIGHT > viewportHeight - VIEWPORT_PADDING) {
        top = Math.max(VIEWPORT_PADDING, viewportHeight - TOOLTIP_HEIGHT - VIEWPORT_PADDING)
    }

    return { top, left }
}

export function Tooltip({
    children,
    content,
    side = "right",
    sideOffset = 4,
    className,
    contentClassName,
}: TooltipProps) {
    const [open, setOpen] = React.useState(false)
    const [position, setPosition] = React.useState<Position | null>(null)
    const [isMobile, setIsMobile] = React.useState(false)
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const timeoutRef = React.useRef<number | null>(null)

    // Detect if we're on a mobile device
    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024 || "ontouchstart" in window)
        }

        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // Calculate tooltip position based on trigger element and preferred side
    const calculatePosition = React.useCallback(() => {
        if (!triggerRef.current) return

        const triggerRect = triggerRef.current.getBoundingClientRect()
        const initialPosition = getInitialPosition(triggerRect, side, sideOffset)
        const adjustedPosition = adjustForViewportBounds(initialPosition, triggerRect, sideOffset)

        setPosition(adjustedPosition)
    }, [side, sideOffset])

    // Event handlers
    const handleMouseEnter = () => {
        if (isMobile) return // Disable hover tooltips on mobile

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        calculatePosition()
        setOpen(true)
    }

    const handleMouseLeave = () => {
        if (isMobile) return // Disable hover tooltips on mobile

        // Add a small delay before hiding to prevent flickering
        timeoutRef.current = setTimeout(() => {
            setOpen(false)
            setPosition(null)
        }, 100)
    }

    // Touch event handlers for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault() // Prevent the default touch behavior
        // Don't show tooltip on touch/tap on mobile
    }

    // Recalculate position on scroll/resize
    React.useEffect(() => {
        if (!open || !position) return

        const handleScroll = () => calculatePosition()
        const handleResize = () => calculatePosition()

        window.addEventListener("scroll", handleScroll, true)
        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("scroll", handleScroll, true)
            window.removeEventListener("resize", handleResize)
        }
    }, [open, position, calculatePosition])

    // Render tooltip content using portal
    const renderTooltipContent = () => {
        if (!open || !position) return null

        return createPortal(
            <div
                className={cn("animate-in fade-in-0 zoom-in-95 fixed z-9999", contentClassName)}
                style={{
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                }}
            >
                {content}
            </div>,
            document.body,
        )
    }

    return (
        <>
            <div
                ref={triggerRef}
                className={cn("relative inline-block", className)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
            >
                {children}
            </div>
            {renderTooltipContent()}
        </>
    )
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}

export function TooltipTrigger({
    children,
    ...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props}>{children}</div>
}

export function TooltipContent({
    children,
    className,
    ...props
}: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={className} {...props}>
            {children}
        </div>
    )
}
