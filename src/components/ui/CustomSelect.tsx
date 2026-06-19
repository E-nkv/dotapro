import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import * as React from "react"

interface CustomSelectProps {
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
    className?: string
    id?: string
    "aria-label"?: string
    placeholder?: string
}

// ============================================================================
// Main Select Component. It is required because radix component breaks the UI in the filters (making the body grow horizontally >100%vw).
// ============================================================================

export function CustomSelect({
    value,
    onValueChange,
    children,
    className,
    id,
    "aria-label": ariaLabel,
    placeholder,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [focusedIndex, setFocusedIndex] = React.useState(-1)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const itemsRef = React.useRef<HTMLDivElement[]>([])

    // Extract item values from children
    const itemValues = React.useMemo(() => {
        const values: string[] = []
        React.Children.forEach(children, child => {
            if (React.isValidElement(child) && child.type === CustomSelectItem) {
                values.push((child.props as { value: string }).value)
            }
        })
        return values
    }, [children])

    // Reset items ref when children change
    React.useEffect(() => {
        itemsRef.current = []
    }, [children])

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setFocusedIndex(-1)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle keyboard events if the target is the button or within the dropdown
            const isButtonTarget = buttonRef.current?.contains(e.target as Node)
            const isDropdownTarget = isOpen && containerRef.current?.contains(e.target as Node)

            if (!isButtonTarget && !isDropdownTarget) {
                return
            }

            if (!isOpen) {
                if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                    e.preventDefault()
                    setIsOpen(true)
                    setFocusedIndex(0)
                }
                return
            }

            const itemCount = itemValues.length

            switch (e.key) {
                case "Escape":
                    e.preventDefault()
                    setIsOpen(false)
                    setFocusedIndex(-1)
                    break
                case "ArrowDown":
                    e.preventDefault()
                    setFocusedIndex(prev => (prev + 1) % itemCount)
                    break
                case "ArrowUp":
                    e.preventDefault()
                    setFocusedIndex(prev => (prev - 1 + itemCount) % itemCount)
                    break
                case "Enter":
                case " ":
                    e.preventDefault()
                    if (focusedIndex >= 0 && focusedIndex < itemCount) {
                        onValueChange?.(itemValues[focusedIndex])
                        setIsOpen(false)
                        setFocusedIndex(-1)
                    }
                    break
                case "Tab":
                    setIsOpen(false)
                    setFocusedIndex(-1)
                    break
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, focusedIndex, onValueChange, itemValues])

    // Scroll focused item into view
    React.useEffect(() => {
        if (isOpen && focusedIndex >= 0) {
            const item = itemsRef.current[focusedIndex]
            if (item) {
                item.scrollIntoView({ block: "nearest" })
            }
        }
    }, [isOpen, focusedIndex])

    const handleItemHover = (index: number) => {
        setFocusedIndex(index)
    }

    const handleItemClick = (itemValue: string) => {
        onValueChange?.(itemValue)
        setIsOpen(false)
    }

    const registerItem = (element: HTMLDivElement | null) => {
        if (element) {
            itemsRef.current.push(element)
        }
    }

    // Map values to display text
    const getDisplayText = (val?: string) => {
        if (!val) return placeholder
        if (val === "newest") return "Newest"
        if (val === "oldest") return "Oldest"
        return val
    }

    // Clone children to pass down props
    /* eslint-disable react-hooks/refs */
    const enhancedChildren = React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === CustomSelectItem) {
            const childValue = (child.props as { value: string }).value
            const index = itemValues.indexOf(childValue)
            return React.cloneElement(child, {
                index,
                isFocused: focusedIndex === index,
                isSelected: value === childValue,
                onHover: handleItemHover,
                onClick: handleItemClick,
                registerItem,
            } as Record<string, unknown>)
        }
        return child
    })
    /* eslint-enable react-hooks/refs */

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm whitespace-nowrap",
                    "bg-background border-border text-foreground",
                    "focus-visible:ring-2 focus-visible:ring-red-800/50 focus-visible:outline-none",
                    "data-[state=open]:ring-2 data-[state=open]:ring-red-800/50",
                    "transition-all duration-200 ease-in-out",
                    "data-placeholder:text-foreground-muted [&>span]:line-clamp-1",
                )}
                data-state={isOpen ? "open" : "closed"}
                id={id}
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className={cn(!value && "text-foreground-muted")}>{getDisplayText(value)}</span>
                <ChevronDown
                    className="text-foreground-muted h-4 w-4 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>
            {isOpen && (
                <div
                    role="listbox"
                    className="border-border-accent bg-background-card text-foreground absolute top-full z-50 mt-1 max-h-72 w-full min-w-32 overflow-x-hidden overflow-y-auto rounded-lg border shadow-xl"
                    style={{
                        animation: "fadeIn 0.15s ease-out",
                    }}
                >
                    {enhancedChildren}
                </div>
            )}
        </div>
    )
}

// ============================================================================
// Select Item
// ============================================================================

export function CustomSelectItem({
    value,
    children,
    index = 0,
    isFocused = false,
    isSelected = false,
    onHover,
    onClick,
    registerItem,
}: {
    value: string
    children: React.ReactNode
    index?: number
    isFocused?: boolean
    isSelected?: boolean
    onHover?: (index: number) => void
    onClick?: (value: string) => void
    registerItem?: (element: HTMLDivElement | null) => void
}) {
    const itemRef = React.useRef<HTMLDivElement>(null)

    // Register item ref
    React.useEffect(() => {
        if (registerItem && itemRef.current) {
            registerItem(itemRef.current)
        }
    }, [registerItem])

    const handleClick = () => {
        onClick?.(value)
    }

    const handleMouseEnter = () => {
        onHover?.(index)
    }

    return (
        <div
            ref={itemRef}
            role="option"
            aria-selected={isSelected}
            data-value={value}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            className={cn(
                "relative flex w-full cursor-pointer items-center rounded-lg px-4 py-3 text-sm outline-none select-none",
                "hover:bg-red-900/10",
                isFocused && "bg-red-900/10",
            )}
        >
            {children}
        </div>
    )
}

// ============================================================================
// Add animation styles
// ============================================================================

const style = document.createElement("style")
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`
if (!document.head.querySelector("style[data-custom-select]")) {
    style.setAttribute("data-custom-select", "true")
    document.head.appendChild(style)
}
