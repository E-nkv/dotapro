import { useCallback, useEffect, useRef, useState } from "react"

export const DEBOUNCE_MS = 250
const NAVIGATION_KEYS = ["ArrowDown", "ArrowUp", "Enter"]

export interface UseSearchSelectorOptions {
    id?: string
    initialValue?: string
    initialValueId?: number
    onSelect?: (id: number | undefined) => void
    debounceMs?: number
}

export interface UseSearchSelectorReturn {
    isOpen: boolean
    inputValue: string
    highlightedIndex: number
    containerRef: React.RefObject<HTMLDivElement | null>
    inputRef: React.RefObject<HTMLDivElement | null>
    listRef: React.RefObject<HTMLUListElement | null>
    itemRefs: React.MutableRefObject<(HTMLLIElement | null)[]>
    setIsOpen: (open: boolean) => void
    setInputValue: (value: string) => void
    setHighlightedIndex: (index: number) => void
    handleInputChange: (text: string) => void
    handleKeyDown: (e: React.KeyboardEvent, itemsLength: number, onSelect: (index: number) => void) => void
    handleInputFocus: () => void
    handleInputBlur: () => void
    handleItemClick: (e: React.MouseEvent, index: number) => void
    handleItemMouseEnter: (index: number) => void
    clearSelection: () => void
    closeDropdown: () => void
}

export function useSearchSelector({
    initialValue = "",
    onSelect,
}: UseSearchSelectorOptions): UseSearchSelectorReturn {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState(initialValue)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)

    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLUListElement>(null)
    const itemRefs = useRef<(HTMLLIElement | null)[]>([])

    const isSelectingRef = useRef(false)
    const isExternalUpdateRef = useRef(false)

    const handleInputFocus = useCallback(() => {
        if (!isSelectingRef.current && !isOpen && !isExternalUpdateRef.current) {
            setIsOpen(true)
        }
    }, [isOpen])

    const handleInputBlur = useCallback(() => {
        if (inputRef.current) {
            const text = inputRef.current.textContent || ""
            if (text !== inputValue) {
                setInputValue(text)
            }
        }
    }, [inputValue])

    const handleInputChange = useCallback((text: string) => {
        setInputValue(text)
        if (!isExternalUpdateRef.current) {
            setIsOpen(true)
        }
    }, [])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, itemsLength: number, onSelect: (index: number) => void) => {
            if (!isOpen) {
                if (NAVIGATION_KEYS.includes(e.key)) {
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
                    setHighlightedIndex(prev => (prev < itemsLength - 1 ? prev + 1 : prev))
                    break
                case "ArrowUp":
                    e.preventDefault()
                    e.stopPropagation()
                    setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0))
                    break
                case "Enter":
                    e.preventDefault()
                    e.stopPropagation()
                    if (highlightedIndex >= 0) {
                        onSelect(highlightedIndex)
                    }
                    break
                case "Escape":
                    e.stopPropagation()
                    setIsOpen(false)
                    inputRef.current?.focus()
                    break
                case "Tab":
                    e.stopPropagation()
                    setIsOpen(false)
                    break
            }
        },
        [isOpen, highlightedIndex],
    )

    const handleItemClick = useCallback((e: React.MouseEvent, index: number) => {
        e.preventDefault()
        e.stopPropagation()
        setHighlightedIndex(index)
    }, [])

    const handleItemMouseEnter = useCallback((index: number) => {
        setHighlightedIndex(index)
    }, [])

    const clearSelection = useCallback(() => {
        isExternalUpdateRef.current = true
        setInputValue("")
        onSelect?.(undefined)
    }, [onSelect])

    const closeDropdown = useCallback(() => {
        setIsOpen(false)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
            itemRefs.current[highlightedIndex]?.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
            })
        }
    }, [highlightedIndex])

    return {
        isOpen,
        inputValue,
        highlightedIndex,
        containerRef,
        inputRef,
        listRef,
        itemRefs,
        setIsOpen,
        setInputValue,
        setHighlightedIndex,
        handleInputChange,
        handleKeyDown,
        handleInputFocus,
        handleInputBlur,
        handleItemClick,
        handleItemMouseEnter,
        clearSelection,
        closeDropdown,
    }
}
