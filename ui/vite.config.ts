import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
    build: {
        // Ensure proper handling for SPA routing
        rollupOptions: {
            output: {
                manualChunks: id => {
                    // Vendor chunks
                    if (id.includes("node_modules")) {
                        // React and related
                        if (id.includes("react") || id.includes("react-dom")) {
                            return "react-vendor"
                        }
                        // TanStack libraries
                        if (id.includes("@tanstack")) {
                            return "tanstack-vendor"
                        }
                        // Radix UI
                        if (id.includes("@radix-ui")) {
                            return "radix-vendor"
                        }
                        // Three.js (large - separate chunk)
                        if (id.includes("three")) {
                            return "three-vendor"
                        }
                        // Lucide icons
                        if (id.includes("lucide-react")) {
                            return "lucide-vendor"
                        }
                        // Other node_modules
                        return "vendor"
                    }
                    // Static data chunks
                    if (id.includes("static_data/heroes.json")) {
                        return "heroes-data"
                    }
                    if (id.includes("static_data/items.json")) {
                        return "items-data"
                    }
                    if (id.includes("static_data/neutrals.json")) {
                        return "neutrals-data"
                    }
                    if (id.includes("static_data/popular.json")) {
                        return "popular-data"
                    }
                },
            },
        },
        // Increase chunk size warning limit (Three.js + draco is ~600KB, loaded only on homepage)
        chunkSizeWarningLimit: 700,
    },
    plugins: [
        tailwindcss(),
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
        }),
        react({
            //reactcompiler is only compatible with babel for now
            babel: {
                plugins: [["babel-plugin-react-compiler"]],
            },
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
