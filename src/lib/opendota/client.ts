const EXPLORER_URL = "https://api.opendota.com/api/explorer"

type ExplorerResponse<T> = {
    rows?: T[]
    err?: { message?: string } | null
    error?: string
}

export async function runExplorer<T>(sql: string, signal: AbortSignal, errorMessage: string): Promise<T[]> {
    const url = new URL(EXPLORER_URL)
    url.searchParams.set("sql", sql)

    const res = await fetch(url.toString(), { signal })

    if (!res.ok) {
        if (res.status === 429) {
            throw new Error(`${errorMessage}: 429 Too Many Requests`)
        }
        let detail = res.statusText
        try {
            const body = (await res.json()) as ExplorerResponse<T>
            detail = body.error ?? body.err?.message ?? detail
        } catch {
            // ignore parse errors
        }
        throw new Error(`${errorMessage}: ${res.status} ${detail}`)
    }

    const data = (await res.json()) as ExplorerResponse<T>
    if (data.err) {
        throw new Error(`${errorMessage}: 400 ${data.err.message ?? "SQL error"}`)
    }

    return data.rows ?? []
}
