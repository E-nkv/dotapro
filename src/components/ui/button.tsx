import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium leading-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
    {
        variants: {
            variant: {
                // Primary - Main CTAs (solid primary/red)
                primary: "bg-primary-700 text-white shadow hover:bg-primary-600 hover:shadow-md",
                // Secondary - Secondary actions (solid secondary/gold)
                secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md",
                // Outline - Tertiary actions (subtle hover, no border)
                outline: "bg-background shadow-sm hover:text-primary-foreground hover:bg-primary-500/10",
                // Destructive - Destructive actions (solid error/red)
                destructive: "bg-error-500 text-white shadow-sm hover:bg-error-600 hover:shadow-md",
                // Destructive Outline - Destructive tertiary actions (border only)
                "destructive-outline":
                    "border border-error-500/50 bg-background shadow-sm hover:border-error-500 hover:text-error-500 hover:bg-error-500/10",
                // Cool Outline - Gradient hover effect (used for View Series, Reset defaults)
                "cool-outline":
                    "border border-foreground-muted/50 bg-inherit shadow-sm hover:border-primary-500 hover:text-white hover:bg-linear-to-r hover:from-primary-500 hover:to-primary-950 cursor-pointer",
                // Ghost - Minimal style (no background, hover only)
                ghost: "hover:bg-accent hover:text-accent-foreground",
                // Link - Text-only style
                link: "text-primary underline-offset-4 hover:underline",
                // Default - Alias for primary (backward compatibility)
                default: "bg-primary-500 text-white shadow hover:bg-primary-600 hover:shadow-md",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    },
)
Button.displayName = "Button"

/* eslint-disable react-refresh/only-export-components */
export { Button, buttonVariants }
