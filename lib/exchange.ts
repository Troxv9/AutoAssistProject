import type { SupabaseClient } from "@supabase/supabase-js"

const SIX_HOURS = 6 * 60 * 60 * 1000

export async function getUsdGelRate(supabase: SupabaseClient | null): Promise<{ rate: number; source: string }> {
  let cached: { rate: number; source: string; fetched_at: string } | null = null
  if (supabase) {
    const { data } = await supabase.from("exchange_rate_cache").select("rate, source, fetched_at").eq("pair", "USD_GEL").maybeSingle()
    if (data) {
      cached = { rate: Number(data.rate), source: data.source, fetched_at: data.fetched_at }
      if (Date.now() - new Date(data.fetched_at).getTime() < SIX_HOURS) {
        return { rate: cached.rate, source: cached.source }
      }
    }
  }
  try {
    const response = await fetch("https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json", {
      signal: AbortSignal.timeout(6000), cache: "no-store",
    })
    if (response.ok) {
      const payload = await response.json()
      const usd = payload?.[0]?.currencies?.find((row: any) => row.code === "USD")
      const rate = Number(usd?.rate)
      if (Number.isFinite(rate) && rate > 0) {
        if (supabase) {
          await supabase.from("exchange_rate_cache").upsert({
            pair: "USD_GEL", rate, source: "ეროვნული ბანკი (NBG)",
            source_timestamp: usd.date || new Date().toISOString(), fetched_at: new Date().toISOString(),
          })
        }
        return { rate, source: "ეროვნული ბანკი (NBG)" }
      }
    }
  } catch {
  }
  if (cached) return { rate: cached.rate, source: `${cached.source} (ქეში)` }
  return { rate: 2.72, source: "სარეზერვო კურსი" }
}
