import { ErrorBoundary, Footer, Navbar } from "@/components"
import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

const RootLayout = () => {
    return (
        <ErrorBoundary>
            <div className="bg-background flex min-h-screen flex-col overflow-x-hidden">
                <Navbar />
                <main className="page-enter flex-1 pt-14 sm:pt-16">
                    <Outlet />
                </main>
                <Footer />
                {import.meta.env.DEV && <TanStackRouterDevtools />}
            </div>
        </ErrorBoundary>
    )
}

interface RouterCtx {
    queryClient: QueryClient
}
export const Route = createRootRouteWithContext<RouterCtx>()({ component: RootLayout })
