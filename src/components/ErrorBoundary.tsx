import React, { Component, type ErrorInfo, type ReactNode } from "react"
import { ErrorState } from "./ErrorState"
import { Button } from "./ui"

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
}

/**
 * Error Boundary component to catch JavaScript errors in component tree
 * and display a fallback UI instead of crashing the entire app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error("ErrorBoundary caught an error:", error, errorInfo)
        }

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo)
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: undefined })
    }

    render(): ReactNode {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default error UI
            return (
                <div className="flex min-h-screen items-center justify-center p-4">
                    <ErrorState
                        title="Something went wrong"
                        error={this.state.error?.message || "An unexpected error occurred"}
                        action={
                            <Button onClick={this.handleReset} variant="primary" size="sm">
                                Try Again
                            </Button>
                        }
                        size="lg"
                    />
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * HOC to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
): React.ComponentType<P> {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    )

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

    return WrappedComponent
}
