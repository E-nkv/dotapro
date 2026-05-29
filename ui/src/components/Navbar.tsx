import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Button } from "./ui/index"

const navLinks = [
    { to: "/", label: "home", ariaLabel: "Home" },
    { to: "/series", label: "series", ariaLabel: "Series" },
    { to: "/matches", label: "matches", ariaLabel: "Matches" },
    { to: "/about", label: "about", ariaLabel: "About" },
    { to: "/guide", label: "guide", ariaLabel: "Guide" },
] as const

function NavLink({
    to,
    label,
    onClick,
    ariaLabel,
}: {
    to: string
    label: string
    onClick?: () => void
    ariaLabel?: string
}) {
    return (
        <Link
            to={to}
            className="text-foreground-muted hover:text-foreground after:bg-primary-500 relative px-2 py-2 text-xs font-medium transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:transition-transform after:duration-200 after:content-[''] sm:px-3 sm:text-sm"
            activeProps={{ className: "text-foreground after:scale-x-100" }}
            onClick={onClick}
            aria-label={ariaLabel || label}
            role="menuitem"
        >
            {label}
        </Link>
    )
}

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [isMobileMenuOpen])

    // Close menu on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isMobileMenuOpen) {
                setIsMobileMenuOpen(false)
            }
        }

        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
    }, [isMobileMenuOpen])

    return (
        <>
            <nav
                className="bg-background/80 border-border/50 shadow-primary-500/5 fixed top-0 right-0 left-0 z-50 border-b shadow-lg backdrop-blur-md"
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between sm:h-16">
                        {/* Logo section - left */}
                        <div className="flex shrink-0 items-center gap-2">
                            <picture>
                                <source srcSet="/logo-48.webp" media="(min-width: 768px)" />
                                <img
                                    src="/logo-32x32.webp"
                                    alt=""
                                    width="32"
                                    height="32"
                                    className="h-10 w-auto lg:h-12"
                                />
                            </picture>

                            <Link
                                to="/"
                                className="font-teko from-foreground to-foreground bg-linear-to-r bg-clip-text text-2xl text-transparent hover:from-[hsl(38,92%,50%)] hover:to-[hsl(0,84%,50%)] sm:text-3xl"
                            >
                                dotapro.org
                            </Link>
                        </div>

                        {/* Nav links section - center (desktop only) */}
                        <div className="hidden md:flex md:flex-1 md:justify-center">
                            <div className="flex items-center space-x-2 sm:space-x-4" role="menubar">
                                {navLinks.map(link => (
                                    <NavLink key={link.to} to={link.to} label={link.label} ariaLabel={link.ariaLabel} />
                                ))}
                            </div>
                        </div>

                        {/* Contact links section - right (desktop only) */}
                        <div className="hidden items-center space-x-2 sm:space-x-4 md:flex">
                            <a
                                href="https://github.com/E-nkv/dotapro"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground-muted hover:text-foreground flex items-center px-2 py-2 transition-all duration-200 hover:scale-110 sm:px-3"
                                aria-label="GitHub"
                                role="menuitem"
                            >
                                <img src="/github.svg" alt="GitHub" className="h-5 w-5 brightness-0 invert" />
                            </a>
                        </div>

                        {/* Mobile menu button - right (mobile only) */}
                        <div className="flex md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    // Dispatch event to close filter modal if open
                                    window.dispatchEvent(new CustomEvent("navbar-menu-open"))
                                    setIsMobileMenuOpen(!isMobileMenuOpen)
                                }}
                                aria-label="Toggle menu"
                                aria-expanded={isMobileMenuOpen}
                                className="h-10 w-10 sm:h-12 sm:w-12"
                            >
                                <svg
                                    className={`h-6 w-6 transition-transform duration-200 ${isMobileMenuOpen ? "rotate-90" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    {isMobileMenuOpen ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    )}
                                </svg>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Full-screen overlay mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-50 md:hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile navigation menu"
                >
                    {/* Backdrop */}
                    <div
                        className="bg-background/80 absolute inset-0 cursor-pointer backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Menu Panel */}
                    <div
                        className="bg-background border-border slide-in-right absolute top-0 right-0 bottom-0 w-72 border-l shadow-xl"
                        role="menu"
                    >
                        <div className="flex h-full flex-col p-6">
                            {/* Close button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute top-4 right-4 h-10 w-10"
                                aria-label="Close menu"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </Button>

                            {/* Nav links */}
                            <div className="mt-16 flex-1 space-y-1" role="menu">
                                {navLinks.map(link => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="hover:bg-background-accent block rounded-lg px-4 py-4 text-lg font-medium transition-colors"
                                        activeProps={{ className: "text-primary-500 bg-background-accent" }}
                                        role="menuitem"
                                        aria-label={link.ariaLabel}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            {/* Contact links */}
                            <div className="border-border border-t pt-6">
                                <a
                                    href="https://github.com/E-nkv/dotapro"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-foreground-muted hover:text-foreground hover:bg-background-accent flex items-center gap-3 rounded-lg px-4 py-3 transition-colors"
                                    aria-label="View source code on GitHub"
                                >
                                    <img src="/github.svg" alt="GitHub" className="h-5 w-5 brightness-0 invert" />
                                    <span className="font-medium">GitHub</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
