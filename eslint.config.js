import js from "@eslint/js"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig([
    globalIgnores(["dist", "node_modules", "*.config.js", "*.config.ts", "public"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        rules: {
            // Prettier handles formatting, ESLint handles code quality
            // Note: Add "prettier/prettier": "warn" rule after installing eslint-plugin-prettier
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
            "react-hooks/exhaustive-deps": "warn",
        },
    },
])
