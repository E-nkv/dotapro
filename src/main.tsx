import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { queryClient } from "./lib/query-client"
import { routeTree } from "./routeTree.gen"

/* simple comment to check CICD */
const router = createRouter({
    routeTree,
    context: {
        queryClient,
    },
})

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router
    }
}

const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </StrictMode>,
    )
}
