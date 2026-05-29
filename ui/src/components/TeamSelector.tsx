import { useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { getTeamName, searchTeams } from "../api"
import { useDebounce } from "../hooks"
import { cn, getPopularData } from "../lib"
import { Spinner } from "./Spinner"

// ============================================================================
// Types
// ============================================================================

interface TeamSelectorProps {
    onSelect: (teamId: number | undefined) => void
    initialValue?: number
    className?: string
    id?: string
    "aria-label"?: string
    inputClassName?: string
}

interface Team {
    id: number
    name: string
    logo_url?: string
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

export function TeamSelector({
    onSelect,
    initialValue,
    className,
    id,
    "aria-label": ariaLabel,
    inputClassName,
}: TeamSelectorProps) {
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
    const selectedTeamIdRef = useRef<number | undefined>(undefined)
    const selectedTeamNameRef = useRef<string | undefined>(undefined)
    const hasSetInitialValueRef = useRef(false)

    // ---------------------------------------------------------------------------
    // Data fetching
    // ---------------------------------------------------------------------------

    const debouncedQuery = useDebounce(inputValue, DEBOUNCE_MS)

    const {
        data: searchResults = [],
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["teams", "search", debouncedQuery],
        queryFn: async ({ signal }) => {
            if (!debouncedQuery.trim()) return []
            return searchTeams(debouncedQuery, signal)
        },
        enabled: debouncedQuery.trim().length > 0,
        staleTime: STALE_TIME_MS,
    })

    // ---------------------------------------------------------------------------
    // Fetch team name by ID when initialValue is provided
    // ---------------------------------------------------------------------------

    const { data: teamNameData, isLoading: isTeamNameLoading } = useQuery({
        queryKey: ["team", "name", initialValue],
        queryFn: async ({ signal }) => {
            if (initialValue === undefined) return null
            return getTeamName(initialValue, signal)
        },
        enabled: initialValue !== undefined && inputValue === "" && !hasFetchedInitialValue,
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    // Mark initial value as fetched when data is received
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (teamNameData && !hasFetchedInitialValue) {
            setHasFetchedInitialValue(true)
        }
    }, [teamNameData, hasFetchedInitialValue])
    /* eslint-enable react-hooks/set-state-in-effect */

    // ---------------------------------------------------------------------------
    // Computed values
    // ---------------------------------------------------------------------------

    const items = useMemo(() => {
        if (debouncedQuery.trim().length === 0) {
            return getPopularData().popular_teams.map(t => ({ id: t.id, name: t.name, logo_url: t.logo_url }))
        }
        return (searchResults || []).map(t => ({ id: t.team_id, name: t.name, logo_url: t.logo_url }))
    }, [debouncedQuery, searchResults])

    const listboxId = `${id}-listbox`
    const hasQuery = debouncedQuery.trim().length > 0
    const showSpinner = isFetching && hasQuery
    const showClearButton = inputValue && !showSpinner
    const showEmptyState = items.length === 0 && !isLoading && !isFetching

    // ---------------------------------------------------------------------------
    // Helper functions
    // ---------------------------------------------------------------------------

    const clearSelectedTeam = useCallback(() => {
        if (selectedTeamIdRef.current !== undefined) {
            isExternalUpdateRef.current = true
            setInputValue("")
            onSelect(undefined)
            selectedTeamIdRef.current = undefined
            selectedTeamNameRef.current = undefined
        }
    }, [onSelect])

    const shouldClearTeamOnClose = useCallback(() => {
        if (selectedTeamIdRef.current === undefined) {
            return false
        }
        // Clear if input is empty OR if input differs from the originally selected team name
        return inputValue.trim() === "" || inputValue !== selectedTeamNameRef.current
    }, [inputValue])

    const closeDropdown = useCallback(() => {
        setIsOpen(false)
        if (shouldClearTeamOnClose()) {
            clearSelectedTeam()
        }
    }, [shouldClearTeamOnClose, clearSelectedTeam])

    // ---------------------------------------------------------------------------
    // Effects
    // ---------------------------------------------------------------------------

    // Set initial value when component mounts or initialValue changes
    // Using useLayoutEffect to avoid visual flicker when updating the input
    /* eslint-disable react-hooks/set-state-in-effect */
    useLayoutEffect(() => {
        if (initialValue !== undefined && !hasSetInitialValueRef.current) {
            // First try to find in items (popular teams or search results)
            const initialItem = items.find(t => t.id === initialValue)
            if (initialItem) {
                // Always update if we have the item, regardless of current inputValue
                isExternalUpdateRef.current = true
                setInputValue(initialItem.name)
                selectedTeamIdRef.current = initialValue
                selectedTeamNameRef.current = initialItem.name
                hasSetInitialValueRef.current = true
            } else if (teamNameData && !isTeamNameLoading) {
                // If not found in items but we have the name from API, use that
                isExternalUpdateRef.current = true
                setInputValue(teamNameData.name)
                selectedTeamIdRef.current = initialValue
                selectedTeamNameRef.current = teamNameData.name
                hasSetInitialValueRef.current = true
            }
        } else if (initialValue === undefined && selectedTeamIdRef.current !== undefined) {
            // Clear the input when initialValue becomes undefined
            setInputValue("")
            selectedTeamIdRef.current = undefined
            selectedTeamNameRef.current = undefined
            setHasFetchedInitialValue(false)
            hasSetInitialValueRef.current = false
        }
    }, [initialValue, items, teamNameData, isTeamNameLoading])
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
    }, [inputValue, teamNameData])

    // ---------------------------------------------------------------------------
    // Event handlers
    // ---------------------------------------------------------------------------

    const handleSelect = useCallback(
        (team: Team) => {
            isExternalUpdateRef.current = true
            setInputValue(team.name)
            setIsOpen(false)
            onSelect(team.id)
            selectedTeamIdRef.current = team.id
            selectedTeamNameRef.current = team.name
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
        selectedTeamIdRef.current = undefined
        selectedTeamNameRef.current = undefined
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
            if (text === "" && selectedTeamIdRef.current !== undefined) {
                onSelect(undefined)
                selectedTeamIdRef.current = undefined
                selectedTeamNameRef.current = undefined
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
        (e: React.MouseEvent, team: Team) => {
            e.preventDefault()
            e.stopPropagation()
            handleSelect(team)
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
                    Type to search teams...
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
                aria-label={ariaLabel || "Search teams"}
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
            {showSpinner && <Spinner size="sm" aria-label="Loading teams" />}
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

    const renderEmptyState = () => (
        <li role="option" aria-selected="false" className="text-foreground-muted px-4 py-3 text-sm">
            No teams found
        </li>
    )

    const renderTeamItem = (team: Team, index: number) => (
        <li
            key={team.id}
            ref={el => {
                itemRefs.current[index] = el
            }}
            id={`${listboxId}-option-${index}`}
            role="option"
            aria-selected={highlightedIndex === index}
            onClick={e => handleItemClick(e, team)}
            onMouseEnter={() => handleItemMouseEnter(index)}
            className={cn(
                "flex cursor-pointer items-center gap-3 px-4 py-3 text-sm",
                highlightedIndex === index && "bg-red-800/20",
            )}
        >
            {team.logo_url && (
                <img src={team.logo_url} alt={team.name} className="h-6 w-6 shrink-0 object-contain" loading="lazy" />
            )}
            <span className="truncate">{team.name}</span>
        </li>
    )

    const renderDropdown = () => (
        <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel || "Teams"}
            className="border-border-accent bg-background-card absolute top-full z-50 mt-1 max-h-72 w-full overflow-auto rounded-lg border shadow-xl"
        >
            {showEmptyState ? renderEmptyState() : items.map(renderTeamItem)}
        </ul>
    )

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
