import * as SelectPrimitive from "@radix-ui/react-select"
import { ChevronDown, ChevronUp } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const RadixSelect = SelectPrimitive.Root

const RadixSelectGroup = SelectPrimitive.Group

const RadixSelectValue = SelectPrimitive.Value

const RadixSelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm whitespace-nowrap",
            "bg-background border-border text-foreground",
            "focus-visible:ring-2 focus-visible:ring-red-800/50 focus-visible:outline-none",
            "data-[state=open]:ring-2 data-[state=open]:ring-red-800/50",
            "transition-all duration-200 ease-in-out",
            "data-placeholder:text-foreground-muted disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            className,
        )}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown className="text-foreground-muted h-4 w-4" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
))
RadixSelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const RadixSelectScrollUpButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={cn("flex cursor-default items-center justify-center py-1", className)}
        {...props}
    >
        <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
))
RadixSelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const RadixSelectScrollDownButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={cn("flex cursor-default items-center justify-center py-1", className)}
        {...props}
    >
        <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
))
RadixSelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const RadixSelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={cn(
                "border-border-accent bg-background-card text-foreground relative z-50 max-h-72 min-w-75 overflow-x-hidden overflow-y-auto rounded-lg border shadow-xl",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
                position === "popper" &&
                    "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
                className,
            )}
            position={position}
            {...props}
        >
            <RadixSelectScrollUpButton />
            <SelectPrimitive.Viewport
                className={cn(
                    "p-1",
                    position === "popper" &&
                        "h-[--radix-select-trigger-height] w-full min-w-[--radix-select-trigger-width]",
                )}
            >
                {children}
            </SelectPrimitive.Viewport>
            <RadixSelectScrollDownButton />
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
))
RadixSelectContent.displayName = SelectPrimitive.Content.displayName

const RadixSelectLabel = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
))
RadixSelectLabel.displayName = SelectPrimitive.Label.displayName

const RadixSelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex w-full cursor-pointer items-center rounded-lg px-4 py-3 text-sm outline-none select-none",
            "hover:bg-background-accent data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary",
            "data-disabled:pointer-events-none data-disabled:opacity-50",
            className,
        )}
        {...props}
    >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
))
RadixSelectItem.displayName = SelectPrimitive.Item.displayName

const RadixSelectSeparator = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator ref={ref} className={cn("bg-muted -mx-1 my-1 h-px", className)} {...props} />
))
RadixSelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
    RadixSelect as Select,
    RadixSelectContent as SelectContent,
    RadixSelectGroup as SelectGroup,
    RadixSelectItem as SelectItem,
    RadixSelectLabel as SelectLabel,
    RadixSelectScrollDownButton as SelectScrollDownButton,
    RadixSelectScrollUpButton as SelectScrollUpButton,
    RadixSelectSeparator as SelectSeparator,
    RadixSelectTrigger as SelectTrigger,
    RadixSelectValue as SelectValue,
}
