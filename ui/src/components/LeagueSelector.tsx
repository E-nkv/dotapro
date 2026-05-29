import { useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { getLeagueName, getRecentLeagues, searchLeagues } from "../api"
import { useDebounce } from "../hooks"
import { cn } from "../lib"
import { Spinner } from "./Spinner"

// ============================================================================
// Types
// ============================================================================

interface LeagueSelectorProps {
    onSelect: (leagueId: number | undefined) => void
    initialValue?: number
    className?: string
    id?: string
    "aria-label"?: string
    inputClassName?: string
}

interface League {
    id: number
    name: string
}

// ============================================================================
// Constants
// ============================================================================

const DEBOUNCE_MS = 250
const STALE_TIME_MS = 5000
const NAVIGATION_KEYS = ["ArrowDown", "ArrowUp", "Enter"]

// ============================================================================
// Icons
// ============================================================================

const ClearIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg
        className={cn("text-foreground-muted h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
)

// ============================================================================
// Component
// ============================================================================

export function LeagueSelector({
    onSelect,
    initialValue,
    className,
    id,
    "aria-label": ariaLabel,
    inputClassName,
}: LeagueSelectorProps) {
    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------

    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const [hasFetchedInitialValue, setHasFetchedInitialValue] = useState(false)

    // ---------------------------------------------------------------------------
    // Refs
    // ---------------------------------------------------------------------------

    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLUListElement>(null)
    const itemRefs = useRef<(HTMLLIElement | null)[]>([])
    const isSelectingRef = useRef(false)
    const isExternalUpdateRef = useRef(false)
    const selectedLeagueIdRef = useRef<number | undefined>(undefined)
    const selectedLeagueNameRef = useRef<string | undefined>(undefined)
    const hasSetInitialValueRef = useRef(false)

    // ---------------------------------------------------------------------------
    // Data fetching
    // ---------------------------------------------------------------------------

    const debouncedQuery = useDebounce(inputValue, DEBOUNCE_MS)

    const {
        data: recentLeagues = [],
        isLoading: isRecentLoading,
        isError: isRecentError,
    } = useQuery({
        queryKey: ["leagues", "recent"],
        queryFn: async ({ signal }) => getRecentLeagues(signal),
        staleTime: 5 * 60 * 60 * 1000, // 5 hours, matching backend cache TTL
    })

    const {
        data: searchResults = [],
        isLoading: isSearchLoading,
        isError: isSearchError,
        isFetching,
    } = useQuery({
        queryKey: ["leagues", "search", debouncedQuery],
        queryFn: async ({ signal }) => {
            if (!debouncedQuery.trim()) return []
            return searchLeagues(debouncedQuery, signal)
        },
        enabled: debouncedQuery.trim().length > 0,
        staleTime: STALE_TIME_MS,
    })

    // ---------------------------------------------------------------------------
    // Fetch league name by ID when initialValue is provided
    // ---------------------------------------------------------------------------

    const { data: leagueNameData, isLoading: isLeagueNameLoading } = useQuery({
        queryKey: ["league", "name", initialValue],
        queryFn: async ({ signal }) => {
            if (initialValue === undefined) return null
            return getLeagueName(initialValue, signal)
        },
        enabled: initialValue !== undefined && inputValue === "" && !hasFetchedInitialValue,
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    // Mark initial value as fetched when data is received
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (leagueNameData && !hasFetchedInitialValue) {
            setHasFetchedInitialValue(true)
        }
    }, [leagueNameData, hasFetchedInitialValue])
    /* eslint-enable react-hooks/set-state-in-effect */

    // ---------------------------------------------------------------------------
    // Computed values
    // ---------------------------------------------------------------------------

    const items = useMemo(() => {
        if (debouncedQuery.trim().length > 0) {
            return (searchResults || []).map(l => ({ id: l.league_id, name: l.name }))
        }
        return recentLeagues.map(l => ({ id: l.league_id, name: l.name }))
    }, [debouncedQuery, searchResults, recentLeagues])

    const listboxId = `${id}-listbox`
    const hasQuery = debouncedQuery.trim().length > 0
    const showSpinner = isFetching && hasQuery
    const showClearButton = inputValue && !showSpinner

    type DropdownStatus = "loading" | "error" | "empty" | "results"
    const dropdownStatus: DropdownStatus = useMemo(() => {
        if (!hasQuery) {
            if (isRecentLoading) return "loading"
            if (isRecentError) return "error"
            if (recentLeagues.length === 0) return "empty"
            return "results"
        }
        if (isSearchLoading) return "loading"
        if (isSearchError) return "error"
        if (searchResults.length === 0) return "empty"
        return "results"
    }, [hasQuery, isRecentLoading, isRecentError, recentLeagues, isSearchLoading, isSearchError, searchResults])

    // ---------------------------------------------------------------------------
    // Helper functions
    // ---------------------------------------------------------------------------

    const clearSelectedLeague = useCallback(() => {
        if (selectedLeagueIdRef.current !== undefined) {
            isExternalUpdateRef.current = true
            setInputValue("")
            onSelect(undefined)
            selectedLeagueIdRef.current = undefined
            selectedLeagueNameRef.current = undefined
        }
    }, [onSelect])

    const shouldClearLeagueOnClose = useCallback(() => {
        if (selectedLeagueIdRef.current === undefined) {
            return false
        }
        // Clear if input is empty OR if input differs from the originally selected league name
        return inputValue.trim() === "" || inputValue !== selectedLeagueNameRef.current
    }, [inputValue])

    const closeDropdown = useCallback(() => {
        setIsOpen(false)
        if (shouldClearLeagueOnClose()) {
            clearSelectedLeague()
        }
    }, [shouldClearLeagueOnClose, clearSelectedLeague])

    // ---------------------------------------------------------------------------
    // Effects
    // ---------------------------------------------------------------------------

    // Set initial value when component mounts or initialValue changes
    // Using useLayoutEffect to avoid visual flicker when updating the input
    /* eslint-disable react-hooks/set-state-in-effect */
    useLayoutEffect(() => {
        if (initialValue !== undefined && !hasSetInitialValueRef.current) {
            // First try to find in items (popular leagues or search results)
            const initialItem = items.find(l => l.id === initialValue)

            if (initialItem) {
                // Always update if we have the item, regardless of current inputValue
                isExternalUpdateRef.current = true
                setInputValue(initialItem.name)
                selectedLeagueIdRef.current = initialValue
                selectedLeagueNameRef.current = initialItem.name
                hasSetInitialValueRef.current = true
            } else if (leagueNameData && !isLeagueNameLoading) {
                // If not found in items but we have the name from API, use that
                isExternalUpdateRef.current = true
                setInputValue(leagueNameData.name)
                selectedLeagueIdRef.current = initialValue
                selectedLeagueNameRef.current = leagueNameData.name
                hasSetInitialValueRef.current = true
            }
        } else if (initialValue === undefined && selectedLeagueIdRef.current !== undefined) {
            // Clear the input when initialValue becomes undefined
            setInputValue("")
            selectedLeagueIdRef.current = undefined
            selectedLeagueNameRef.current = undefined
            setHasFetchedInitialValue(false)
            hasSetInitialValueRef.current = false
        }
    }, [initialValue, items, leagueNameData, isLeagueNameLoading])
    /* eslint-enable react-hooks/set-state-in-effect */

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                closeDropdown()
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [closeDropdown])

    // Reset highlighted index when items change
    // Using useLayoutEffect to avoid visual flicker when resetting the highlighted index
    /* eslint-disable react-hooks/set-state-in-effect */
    useLayoutEffect(() => {
        setHighlightedIndex(-1)
        // Only reset itemRefs if the length changed significantly to avoid disrupting scroll-into-view
        if (itemRefs.current.length !== items.length) {
            itemRefs.current = new Array(items.length).fill(null)
        }
    }, [items])
    /* eslint-enable react-hooks/set-state-in-effect */

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
            itemRefs.current[highlightedIndex]?.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
            })
        }
    }, [highlightedIndex])

    // Sync div content with inputValue when it changes externally (e.g., from selection)
    // Using useLayoutEffect to ensure DOM sync happens synchronously before paint
    useLayoutEffect(() => {
        if (inputRef.current) {
            // Always clear the div content when inputValue is empty to ensure placeholder shows
            if (inputValue === "") {
                inputRef.current.textContent = ""
                isExternalUpdateRef.current = false
                return
            }

            if (isExternalUpdateRef.current) {
                // Save the current selection/cursor position
                const selection = window.getSelection()
                const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
                const cursorOffset = range?.startOffset ?? 0

                inputRef.current.textContent = inputValue

                // Restore the cursor position if it was within the input
                if (selection && range && inputRef.current.contains(range.commonAncestorContainer)) {
                    const newRange = document.createRange()
                    const textNode = inputRef.current.firstChild as Text
                    if (textNode) {
                        const newOffset = Math.min(cursorOffset, textNode.length)
                        newRange.setStart(textNode, newOffset)
                        newRange.setEnd(textNode, newOffset)
                        selection.removeAllRanges()
                        selection.addRange(newRange)
                    }
                }

                isExternalUpdateRef.current = false
            }
        }
    }, [inputValue])

    // Ensure text content is set when ref becomes available (for initial value on page refresh)
    useLayoutEffect(() => {
        if (inputRef.current && inputValue && inputRef.current.textContent !== inputValue) {
            inputRef.current.textContent = inputValue
        }
    }, [inputValue, leagueNameData])

    // ---------------------------------------------------------------------------
    // Event handlers
    // ---------------------------------------------------------------------------

    const handleSelect = useCallback(
        (league: League) => {
            isExternalUpdateRef.current = true
            setInputValue(league.name)
            setIsOpen(false)
            onSelect(league.id)
            selectedLeagueIdRef.current = league.id
            selectedLeagueNameRef.current = league.name
            isSelectingRef.current = true
            inputRef.current?.focus()
            setTimeout(() => {
                isSelectingRef.current = false
            }, 0)
        },
        [onSelect],
    )

    const handleClear = useCallback(() => {
        isExternalUpdateRef.current = true
        setInputValue("")
        onSelect(undefined)
        selectedLeagueIdRef.current = undefined
        selectedLeagueNameRef.current = undefined
        inputRef.current?.focus()
    }, [onSelect])

    const handleInputFocus = useCallback(() => {
        if (!isSelectingRef.current && !isOpen && !isExternalUpdateRef.current) {
            setIsOpen(true)
        }
    }, [isOpen])

    const handleInputChange = useCallback((e: React.FormEvent<HTMLDivElement>) => {
        const text = e.currentTarget.textContent || ""
        setInputValue(text)
        if (!isExternalUpdateRef.current) {
            setIsOpen(true)
        }
    }, [])

    const handleInputPaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault()
        const text = e.clipboardData.getData("text/plain")
        document.execCommand("insertText", false, text)
    }, [])

    const handleInputBlur = useCallback(() => {
        // Ensure inputValue is in sync with div content on blur
        if (inputRef.current) {
            const text = inputRef.current.textContent || ""
            // If input is cleared, remove the filter entirely
            if (text === "" && selectedLeagueIdRef.current !== undefined) {
                onSelect(undefined)
                selectedLeagueIdRef.current = undefined
                selectedLeagueNameRef.current = undefined
            }
            // Only update state if value actually changed to avoid unnecessary re-renders
            if (text !== inputValue) {
                setInputValue(text)
            }
        }
    }, [inputValue, onSelect])

    const handleItemMouseEnter = useCallback((index: number) => {
        setHighlightedIndex(index)
    }, [])

    const handleItemClick = useCallback(
        (e: React.MouseEvent, league: League) => {
            e.preventDefault()
            e.stopPropagation()
            handleSelect(league)
        },
        [handleSelect],
    )

    // ---------------------------------------------------------------------------
    // Keyboard navigation
    // ---------------------------------------------------------------------------

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            // Open dropdown on navigation keys when closed
            if (!isOpen) {
                if (NAVIGATION_KEYS.includes(e.key as string)) {
                    // Prevent newline insertion when pressing Enter to open dropdown
                    if (e.key === "Enter") {
                        e.preventDefault()
                        e.stopPropagation()
                    }
                    setIsOpen(true)
                }
                return
            }

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault()
                    e.stopPropagation()
                    setHighlightedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev))
                    break
                case "ArrowUp":
                    e.preventDefault()
                    e.stopPropagation()
                    setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0))
                    break
                case "Enter":
                    e.preventDefault()
                    e.stopPropagation()
                    if (highlightedIndex >= 0 && items[highlightedIndex]) {
                        handleSelect(items[highlightedIndex])
                    }
                    break
                case "Escape":
                    e.stopPropagation()
                    closeDropdown()
                    inputRef.current?.focus()
                    break
                case "Tab":
                    e.stopPropagation()
                    closeDropdown()
                    break
            }
        },
        [isOpen, items, highlightedIndex, handleSelect, closeDropdown],
    )

    // ---------------------------------------------------------------------------
    // Render helpers
    // ---------------------------------------------------------------------------

    const renderInput = () => (
        <div className="relative">
            {inputValue === "" && (
                <span className="text-foreground-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm select-none">
                    Type to search leagues...
                </span>
            )}
            <div
                ref={inputRef}
                id={id}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInputChange}
                onPaste={handleInputPaste}
                onBlur={handleInputBlur}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                aria-label={ariaLabel || "Search leagues"}
                aria-autocomplete="list"
                aria-controls={listboxId}
                aria-expanded={isOpen}
                aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}
                role="combobox"
                className={cn(
                    "min-h-10 w-full rounded-lg border px-3 py-2 pr-10 text-sm",
                    "bg-background border-border text-foreground",
                    "focus-visible:ring-2 focus-visible:ring-red-800/50 focus-visible:outline-none",
                    "transition-all duration-200 ease-in-out",
                    "wrap-break-word whitespace-pre-wrap",
                    inputClassName,
                )}
            />
        </div>
    )

    const renderInputSuffix = () => (
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
            {showSpinner && <Spinner size="sm" aria-label="Loading leagues" />}
            {showClearButton && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="text-foreground-muted hover:text-foreground cursor-pointer transition-colors"
                    aria-label="Clear search"
                >
                    <ClearIcon />
                </button>
            )}
            {!showSpinner && !showClearButton && (
                <button
                    type="button"
                    onClick={() => {
                        setIsOpen(!isOpen)
                        inputRef.current?.focus()
                    }}
                    className="text-foreground-muted hover:text-foreground cursor-pointer transition-colors"
                    aria-label={isOpen ? "Close dropdown" : "Open dropdown"}
                    aria-expanded={isOpen}
                >
                    <ChevronIcon isOpen={isOpen} />
                </button>
            )}
        </div>
    )

    const renderLeagueItem = (league: League, index: number) => (
        <li
            key={league.id}
            ref={el => {
                itemRefs.current[index] = el
            }}
            id={`${listboxId}-option-${index}`}
            role="option"
            aria-selected={highlightedIndex === index}
            onClick={e => handleItemClick(e, league)}
            onMouseEnter={() => handleItemMouseEnter(index)}
            className={cn("cursor-pointer px-4 py-3 text-sm", highlightedIndex === index && "bg-red-800/20")}
        >
            {league.name}
        </li>
    )

    const renderDropdown = () => {
        const content =
            dropdownStatus === "loading" ? (
                <li role="option" aria-selected="false" className="text-foreground-muted flex cursor-pointer items-center gap-2 px-4 py-3 text-sm">
                    <Spinner size="sm" aria-label="Loading leagues" />
                    Loading leagues...
                </li>
            ) : dropdownStatus === "error" ? (
                <li role="option" aria-selected="false" className="text-foreground-muted px-4 py-3 text-sm">
                    Couldn&apos;t load leagues
                </li>
            ) : dropdownStatus === "empty" ? (
                <li role="option" aria-selected="false" className="text-foreground-muted px-4 py-3 text-sm">
                    No leagues found
                </li>
            ) : (
                items.map(renderLeagueItem)
            )

        return (
            <ul
                ref={listRef}
                id={listboxId}
                role="listbox"
                aria-label={ariaLabel || "Leagues"}
                className="border-border-accent bg-background-card absolute top-full z-50 mt-1 max-h-72 w-full min-w-65 overflow-auto rounded-lg border shadow-xl"
            >
                {content}
            </ul>
        )
    }

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <div className="relative">
                {renderInput()}
                {renderInputSuffix()}
                {isOpen && renderDropdown()}
            </div>
        </div>
    )
}
