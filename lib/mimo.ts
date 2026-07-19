/**
 * Shared helper for the MiMo (xiaomimimo) chat-completions API.
 *
 * MiMo API keys hit per-key rate limits / quotas. To keep the AI features
 * working we rotate through a list of keys, advancing to the next one only when
 * a request fails for a key-related reason (rate limit, quota, auth, server or
 * network error). Ordinary successful responses and non-retryable client errors
 * are returned as-is so the caller can handle them.
 */

export const MIMO_URL = "https://api.xiaomimimo.com/v1/chat/completions"

/**
 * Returns the configured MiMo keys in priority order, skipping blank/missing
 * ones. Primary key first, then the numbered fallbacks.
 */
export function getMimoKeys(): string[] {
  return [
    process.env.MIMO_API_KEY,
    process.env.MIMO_API_KEY2,
    process.env.MIMO_API_KEY3,
    process.env.MIMO_API_KEY4,
  ]
    .map((key) => (key ?? "").trim())
    .filter((key) => key.length > 0)
}

export function hasMimoKey(): boolean {
  return getMimoKeys().length > 0
}

/** Whether a failed status justifies trying the next key. */
function shouldTryNextKey(status: number): boolean {
  return (
    status === 401 || // unauthorized
    status === 402 || // payment required / quota
    status === 403 || // forbidden
    status === 429 || // rate limit / quota exceeded
    status >= 500 // upstream server error
  )
}

/**
 * POSTs a chat-completion body to MiMo, injecting the `api-key` header and
 * rotating through the available keys on failure. Each attempt gets its own
 * fresh timeout so a stall on one key falls through to the next.
 *
 * Returns the first `ok` response, or the last response for a non-retryable
 * failure. Throws only when every key fails with a network error (or no key
 * is configured).
 *
 * @param body Chat-completion request body (may include `stream: true`).
 * @param timeoutMs Optional per-attempt timeout. Omit for streaming requests
 *   that should not be aborted mid-stream.
 */
export async function mimoFetch(
  body: Record<string, unknown>,
  timeoutMs?: number,
): Promise<Response> {
  const keys = getMimoKeys()
  if (keys.length === 0) throw new Error("MIMO_API_KEY is not configured")

  const payload = JSON.stringify(body)
  let lastResponse: Response | null = null
  let lastError: unknown = null

  for (const key of keys) {
    try {
      const response = await fetch(MIMO_URL, {
        method: "POST",
        headers: { "api-key": key, "Content-Type": "application/json" },
        body: payload,
        signal: timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined,
      })
      if (response.ok) return response
      lastResponse = response
      if (!shouldTryNextKey(response.status)) return response
      // Release the connection before trying the next key.
      await response.body?.cancel().catch(() => {})
    } catch (err) {
      lastError = err
    }
  }

  if (lastResponse) return lastResponse
  throw lastError instanceof Error ? lastError : new Error("MiMo request failed")
}
