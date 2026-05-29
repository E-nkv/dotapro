import { useLocation } from "@tanstack/react-router"
import { useEffect } from "react"

interface SEOProps {
    title?: string
    description?: string
    image?: string
    type?: "website" | "article"
    noIndex?: boolean
    canonicalUrl?: string
}

const DEFAULT_TITLE = "dotapro.org - Dota 2 professional analytics"
const DEFAULT_DESCRIPTION =
    "Focused Dota 2 analytics for the pro teams the community watches most. Browse series and matches from a curated set of top teams — no public match clutter."
const DEFAULT_IMAGE = "https://dotapro.org/og-image.webp"
const SITE_URL = "https://dotapro.org"

// Helper to convert relative image paths to absolute URLs
const getAbsoluteImageUrl = (image: string): string => {
    if (image.startsWith("http://") || image.startsWith("https://")) {
        return image
    }
    return `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`
}

/**
 * SEO component for managing document title and meta tags dynamically
 * This component updates the document head with proper SEO metadata
 */
export function SEO({
    title,
    description,
    image = DEFAULT_IMAGE,
    type = "website",
    noIndex = false,
    canonicalUrl,
}: SEOProps) {
    const location = useLocation()

    useEffect(() => {
        // Build full URL
        const fullUrl = canonicalUrl || `${SITE_URL}${location.pathname}`
        const absoluteImageUrl = getAbsoluteImageUrl(image)

        // Set document title
        document.title = title ? `${title} | dotapro.org` : DEFAULT_TITLE

        // Update or create meta tags
        const updateMetaTag = (name: string, content: string, property = false) => {
            const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
            let meta = document.querySelector(selector) as HTMLMetaElement | null

            if (!meta) {
                meta = document.createElement("meta")
                if (property) {
                    meta.setAttribute("property", name)
                } else {
                    meta.setAttribute("name", name)
                }
                document.head.appendChild(meta)
            }

            meta.setAttribute("content", content)
        }

        // Primary Meta Tags
        updateMetaTag("description", description || DEFAULT_DESCRIPTION)
        updateMetaTag(
            "keywords",
            "Dota 2, matches, statistics, teams, leagues, esports, gaming, curated teams, pro scene",
        )

        // Open Graph / Facebook
        updateMetaTag("og:type", type, true)
        updateMetaTag("og:url", fullUrl, true)
        updateMetaTag("og:title", title || "Dotapro - Dota 2 Match Data & Statistics", true)
        updateMetaTag("og:description", description || DEFAULT_DESCRIPTION, true)
        updateMetaTag("og:image", absoluteImageUrl, true)
        updateMetaTag("og:image:width", "1200", true)
        updateMetaTag("og:image:height", "630", true)
        updateMetaTag("og:image:alt", "Dotapro Logo", true)
        updateMetaTag("og:image:secure_url", absoluteImageUrl, true)
        updateMetaTag("og:image:type", "image/webp", true)

        // Twitter
        updateMetaTag("twitter:card", "summary_large_image")
        updateMetaTag("twitter:url", fullUrl, true)
        updateMetaTag("twitter:title", title || "Dotapro - Dota 2 Match Data & Statistics", true)
        updateMetaTag("twitter:description", description || DEFAULT_DESCRIPTION, true)
        updateMetaTag("twitter:image", absoluteImageUrl, true)

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
        if (!canonical) {
            canonical = document.createElement("link")
            canonical.setAttribute("rel", "canonical")
            document.head.appendChild(canonical)
        }
        canonical.setAttribute("href", fullUrl)

        // No Index
        if (noIndex) {
            let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
            if (!robots) {
                robots = document.createElement("meta")
                robots.setAttribute("name", "robots")
                document.head.appendChild(robots)
            }
            robots.setAttribute("content", "noindex, nofollow")
        }

        // Cleanup function to remove meta tags on unmount
        return () => {
            // Note: We don't remove meta tags on unmount as they should persist
            // This is intentional for SEO purposes
        }
    }, [title, description, image, type, noIndex, canonicalUrl, location.pathname])

    return null // This component doesn't render anything
}
