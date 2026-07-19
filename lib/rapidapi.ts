import { wafFetchJson } from "@/lib/waf-fetch"

/**
 * Shared helper for the "vehicle-auction-data-api-copart-iaai" RapidAPI endpoint.
 *
 * RapidAPI keys frequently hit per-key rate limits / monthly quotas. To keep the
 * app working we rotate through a list of keys, falling back to the next one only
 * when a request fails for a key-related reason (rate limit, quota, auth, network
 * or upstream server error). We deliberately do NOT retry on ordinary results
 * (200) or client errors like 404, since another key would return the same thing.
 */

export const RAPIDAPI_NEW_HOST =
  process.env.RAPIDAPI_NEW_HOST || "vehicle-auction-data-api-copart-iaai.p.rapidapi.com"

/**
 * Returns the configured RapidAPI "new" keys in priority order, skipping any
 * that are missing or blank. Primary key first, then the numbered fallbacks.
 */
export function getRapidNewKeys(): string[] {
  return [
    process.env.RAPIDAPI_NEW_KEY,
    process.env.RAPIDAPI_NEW_KEY2,
    process.env.RAPIDAPI_NEW_KEY3,
    process.env.RAPIDAPI_NEW_KEY4,
  ]
    .map((key) => (key ?? "").trim())
    .filter((key) => key.length > 0)
}

export function hasRapidNewKey(): boolean {
  return getRapidNewKeys().length > 0
}

/** Whether a failed status justifies trying the next key. */
function shouldTryNextKey(status: number): boolean {
  return (
    status === 0 || // network / timeout
    status === 401 || // unauthorized
    status === 403 || // forbidden / not subscribed / quota
    status === 429 || // rate limit / monthly quota exceeded
    status >= 500 // upstream server error
  )
}

/**
 * Performs a request against the RapidAPI "new" endpoint, automatically injecting
 * the RapidAPI headers and rotating through the available keys on failure.
 *
 * @param pathOrUrl Either a path beginning with "/" (host is prepended) or a full URL.
 * @param extraHeaders Additional request headers (e.g. browser/User-Agent headers).
 * @param timeoutMs Per-request timeout.
 */
export async function rapidNewFetchJson<T = unknown>(
  pathOrUrl: string,
  extraHeaders: Record<string, string> = {},
  timeoutMs = 12000,
): Promise<{ status: number; json: T | null }> {
  const keys = getRapidNewKeys()
  if (keys.length === 0) return { status: 0, json: null }

  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `https://${RAPIDAPI_NEW_HOST}${pathOrUrl}`
  let last: { status: number; json: T | null } = { status: 0, json: null }

  for (const key of keys) {
    last = await wafFetchJson<T>(
      url,
      { ...extraHeaders, "x-rapidapi-key": key, "x-rapidapi-host": RAPIDAPI_NEW_HOST },
      timeoutMs,
    )
    if (last.status === 200 && last.json != null) return last
    if (!shouldTryNextKey(last.status)) return last
  }

  return last
}
