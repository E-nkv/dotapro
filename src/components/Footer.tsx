import { useLocation } from "@tanstack/react-router"

export function Footer() {
    const location = useLocation()
    const isSeriesPage = location.pathname === "/series"
    const isMatchesPage = location.pathname === "/matches"

    return (
        <footer
            className={`border-border/50 mt-auto w-full border-t ${isSeriesPage || isMatchesPage ? "lg:ml-72 lg:w-[calc(100%-18rem)]" : ""}`}
        >
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="text-foreground-muted flex items-center justify-center gap-4 text-sm">
                    <p>
                        <a href="/" className="hover:text-foreground transition-colors">
                            dotapro.org
                        </a>{" "}
                        © 2026
                    </p>
                    <a
                        href="https://github.com/E-nkv/dotapro"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground-muted hover:text-foreground inline-block align-middle transition-all duration-200 hover:scale-110"
                        aria-label="GitHub"
                    >
                        <img src="/github.svg" alt="GitHub" className="h-5 w-5 brightness-0 invert" />
                    </a>
                </div>
            </div>
        </footer>
    )
}
