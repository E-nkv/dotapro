import { Spinner } from "@/components/Spinner"
import { cn } from "@/lib"
import { createAegisScene } from "@/lib/aegis/createAegisScene"
import { useEffect, useRef, useState } from "react"

type AegisViewerProps = {
    className?: string
    style?: React.CSSProperties
}

export function AegisViewer({ className, style }: AegisViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handle = createAegisScene(container, {
            modelUrl: "/aegis-transformed.glb",
            onReady: () => setLoading(false),
        })
        return () => handle.dispose()
    }, [])

    return (
        <div className={cn("relative aspect-square w-full touch-none select-none", className)} style={style}>
            {loading && (
                <div
                    className="absolute inset-0 z-10 flex items-center justify-center"
                    aria-hidden={!loading}
                >
                    <Spinner size="lg" className="opacity-60" />
                </div>
            )}
            <div ref={containerRef} className="size-full" />
        </div>
    )
}
