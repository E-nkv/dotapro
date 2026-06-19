import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (error instanceof Error) {
                    const msg = error.message
                    if (msg.includes("400") || msg.includes("401") || msg.includes("403") || msg.includes("404")) {
                        return false
                    }
                }
                return failureCount < 3
            },
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
    },
})
