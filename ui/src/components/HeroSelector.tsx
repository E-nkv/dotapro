import heroesData from "@/assets/static_data/heroes.json"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useDebounce } from "../hooks"
import { cn, getPopularData } from "../lib"

// ============================================================================
// Types
// ============================================================================

interface HeroSelectorProps {
    onSelect: (heroId: number | undefined) => void
    initialValue?: number
    className?: string
    id?: string
    "aria-label"?: string
    inputClassName?: string
}

interface Hero {
    id: number
    name: string
    displayName: string
}

// ============================================================================
// Constants
// ============================================================================

const DEBOUNCE_MS = 250
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
// Search Algorithm
// ============================================================================

function searchHeroes(query: string, heroes: Hero[]): Hero[] {
    if (!query.trim()) return []

    const normalizedQuery = query.toLowerCase().trim()
    const queryTrigrams = generateTrigrams(normalizedQuery)

    return heroes
        .map(hero => {
            const displayNameLower = hero.displayName.toLowerCase()
            const nameLower = hero.name.toLowerCase()

            // Calculate match score
            let score = 0

            // Exact match on displayName (highest priority)
            if (displayNameLower === normalizedQuery) score += 100
            // Exact match on name
            else if (nameLower === normalizedQuery) score += 80

            // Starts with displayName
            if (displayNameLower.startsWith(normalizedQuery)) score += 50
            // Starts with name
            else if (nameLower.startsWith(normalizedQuery)) score += 30

            // Contains displayName
            if (displayNameLower.includes(normalizedQuery)) score += 20
            // Contains name
            if (nameLower.includes(normalizedQuery)) score += 10

            // Trigram matching (partial matches)
            const displayNameTrigrams = generateTrigrams(displayNameLower)
            const trigramMatches = queryTrigrams.filter(t => displayNameTrigrams.includes(t)).length
            score += trigramMatches * 2

            return { hero, score }
        })
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(result => result.hero)
}

function generateTrigrams(text: string): string[] {
    const trigrams: string[] = []
    for (let i = 0; i < text.length - 2; i++) {
        trigrams.push(text.slice(i, i + 3))
    }
    return trigrams
}

// ============================================================================
// Component
// ============================================================================

export function HeroSelector({
    onSelect,
    initialValue,
    className,
    id = "hero-selector",
    "aria-label": ariaLabel = "Select hero",
    inputClassName,
}: HeroSelectorProps) {
    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------

    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [highlightedIndex, setHighlightedIndex] = useState(-1)

    // ---------------------------------------------------------------------------
    // Refs
    // ---------------------------------------------------------------------------

    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLUListElement>(null)
    const itemRefs = useRef<(HTMLLIElement | null)[]>([])
    const isSelectingRef = useRef(false)
    const isExternalUpdateRef = useRef(false)
    const selectedHeroIdRef = useRef<number | undefined>(undefined)
    const selectedHeroNameRef = useRef<string | undefined>(undefined)
    const hasSetInitialValueRef = useRef(false)

    // ---------------------------------------------------------------------------
    // Data (no API calls - all from heroes.json)
    // ---------------------------------------------------------------------------

    const debouncedQuery = useDebounce(inputValue, DEBOUNCE_MS)

    // Convert heroes.json to array
    const allHeroes: Hero[] = useMemo(() => {
        return Object.values(heroesData).map(hero => ({
            id: hero.id,
            name: hero.name,
            displayName: hero.displayName,
        }))
    }, [])

    // Search results (frontend search)
    const searchResults = useMemo(() => {
        if (!debouncedQuery.trim()) return []
        return searchHeroes(debouncedQuery, allHeroes)
    }, [debouncedQuery, allHeroes])

    // ---------------------------------------------------------------------------
    // Computed values
    // ---------------------------------------------------------------------------

    const items = useMemo(() => {
        if (debouncedQuery.trim().length === 0) {
            return getPopularData().popular_heroes.map(h => ({
                id: h.id,
                name: h.name,
                displayName: allHeroes.find(hero => hero.id === h.id)?.displayName || h.name,
            }))
        }
        return searchResults
    }, [debouncedQuery, searchResults, allHeroes])

    const listboxId = `${id}-listbox`
    const showClearButton = inputValue
    const showEmptyState = items.length === 0

    // ---------------------------------------------------------------------------
    // Helper functions
    // ---------------------------------------------------------------------------

    const clearSelectedHero = useCallback(() => {
        if (selectedHeroIdRef.current !== undefined) {
            isExternalUpdateRef.current = true
            setInputValue("")
            onSelect(undefined)
            selectedHeroIdRef.current = undefined
            selectedHeroNameRef.current = undefined
        }
    }, [onSelect])

    const shouldClearHeroOnClose = useCallback(() => {
        if (selectedHeroIdRef.current === undefined) {
            return false
        }
        // Clear if input is empty OR if input differs from the originally selected hero name
        return inputValue.trim() === "" || inputValue !== selectedHeroNameRef.current
    }, [inputValue])

    const closeDropdown = useCallback(() => {
        setIsOpen(false)
        if (shouldClearHeroOnClose()) {
            clearSelectedHero()
        }
    }, [shouldClearHeroOnClose, clearSelectedHero])

    // ---------------------------------------------------------------------------
    // Effects
    // ---------------------------------------------------------------------------

    // Set initial value when component mounts or initialValue changes
    // Using useLayoutEffect to avoid visual flicker when updating the input
    /* eslint-disable react-hooks/set-state-in-effect */
    useLayoutEffect(() => {
        if (initialValue !== undefined && !hasSetInitialValueRef.current) {
            // Find hero in allHeroes (since we have all data locally)
            const initialHero = allHeroes.find(h => h.id === initialValue)

            if (initialHero) {
                isExternalUpdateRef.current = true
                setInputValue(initialHero.displayName)
                selectedHeroIdRef.current = initialValue
                selectedHeroNameRef.current = initialHero.displayName
                hasSetInitialValueRef.current = true
            }
        } else if (initialValue === undefined && selectedHeroIdRef.current !== undefined) {
            // Clear the input when initialValue becomes undefined
            setInputValue("")
            selectedHeroIdRef.current = undefined
            selectedHeroNameRef.current = undefined
            hasSetInitialValueRef.current = false
        }
    }, [initialValue, allHeroes])
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
    }, [inputValue])

    // ---------------------------------------------------------------------------
    // Event handlers
    // ---------------------------------------------------------------------------

    const handleSelect = useCallback(
        (hero: Hero) => {
            isExternalUpdateRef.current = true
            setInputValue(hero.displayName)
            setIsOpen(false)
            onSelect(hero.id)
            selectedHeroIdRef.current = hero.id
            selectedHeroNameRef.current = hero.displayName
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
        selectedHeroIdRef.current = undefined
        selectedHeroNameRef.current = undefined
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
            if (text === "" && selectedHeroIdRef.current !== undefined) {
                onSelect(undefined)
                selectedHeroIdRef.current = undefined
                selectedHeroNameRef.current = undefined
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
        (e: React.MouseEvent, hero: Hero) => {
            e.preventDefault()
            e.stopPropagation()
            handleSelect(hero)
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
                    Type to search heroes...
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
                aria-label={ariaLabel || "Search heroes"}
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
            {!showClearButton && (
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
            No heroes found
        </li>
    )

    const renderHeroItem = (hero: Hero, index: number) => (
        <li
            key={hero.id}
            ref={el => {
                itemRefs.current[index] = el
            }}
            id={`${listboxId}-option-${index}`}
            role="option"
            aria-selected={highlightedIndex === index}
            onClick={e => handleItemClick(e, hero)}
            onMouseEnter={() => handleItemMouseEnter(index)}
            className={cn("cursor-pointer px-4 py-3 text-sm", highlightedIndex === index && "bg-red-800/20")}
        >
            {hero.displayName}
        </li>
    )

    const renderDropdown = () => (
        <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel || "Heroes"}
            className="border-border-accent bg-background-card absolute top-full z-50 mt-1 max-h-72 w-full min-w-65 overflow-auto rounded-lg border shadow-xl"
        >
            {showEmptyState ? renderEmptyState() : items.map(renderHeroItem)}
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
