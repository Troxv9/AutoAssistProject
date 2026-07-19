const FIRECRAWL_SCRAPE_ENDPOINT = "https://api.firecrawl.dev/v2/scrape"

type FirecrawlScrapeResponse = {
  success?: boolean
  data?: {
    rawHtml?: string
    html?: string
    metadata?: { statusCode?: number }
  }
  error?: string
}

export async function firecrawlScrapeHtml(url: string, timeoutMs = 25000): Promise<string | null> {
  const key = process.env.FIRECRAWL_API_KEY
  if (!key) return null

  try {
    const response = await fetch(FIRECRAWL_SCRAPE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["rawHtml"],
        onlyMainContent: false,
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("[firecrawl] scrape HTTP error:", response.status, url)
      return null
    }

    const json = (await response.json()) as FirecrawlScrapeResponse
    const html = json?.data?.rawHtml || json?.data?.html || null
    if (!html || html.length === 0) {
      console.error("[firecrawl] scrape returned empty content:", url, json?.error ?? "")
      return null
    }
    return html
  } catch (e) {
    console.error("[firecrawl] scrape failed:", e instanceof Error ? e.message : e, url)
    return null
  }
}
