export type BraveResult = { title: string; url: string; description: string }

type BraveOptions = {
  count?: number
  country?: string
  searchLang?: string
}

export async function braveSearch(query: string, options: number | BraveOptions = {}): Promise<BraveResult[]> {
  const key = process.env.BRAVE_API_KEY
  if (!key) return []

  const opts: BraveOptions = typeof options === "number" ? { count: options } : options
  const count = Math.min(opts.count ?? 5, 20)

  try {
    const params = new URLSearchParams({ q: query, count: String(count) })
    if (opts.country) params.set("country", opts.country)
    if (opts.searchLang) params.set("search_lang", opts.searchLang)

    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
      headers: { accept: "application/json", "X-Subscription-Token": key },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    })
    if (!response.ok) return []
    const payload = await response.json()
    const rows = payload?.web?.results ?? []
    return rows.slice(0, count).map((row: any) => ({
      title: String(row.title ?? ""),
      url: String(row.url ?? ""),
      description: String(row.description ?? "").replace(/<[^>]+>/g, ""),
    }))
  } catch {
    return []
  }
}
