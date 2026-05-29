import { useEffect, useRef, useState } from "react"

export interface UseMobileFiltersReturn {
    isMobileFiltersOpen: boolean
    setIsMobileFiltersOpen: (open: boolean) => void
}

export function useMobileFilters(): UseMobileFiltersReturn {
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
    const scrollPositionRef = useRef(0)

    useEffect(() => {
        if (isMobileFiltersOpen) {
            scrollPositionRef.current = window.scrollY
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
            window.scrollTo(0, scrollPositionRef.current)
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [isMobileFiltersOpen])

    useEffect(() => {
        const handleNavbarMenuOpen = () => {
            if (isMobileFiltersOpen) {
                setIsMobileFiltersOpen(false)
            }
        }

        window.addEventListener("navbar-menu-open", handleNavbarMenuOpen)
        return () => {
            window.removeEventListener("navbar-menu-open", handleNavbarMenuOpen)
        }
    }, [isMobileFiltersOpen])

    return { isMobileFiltersOpen, setIsMobileFiltersOpen }
}
