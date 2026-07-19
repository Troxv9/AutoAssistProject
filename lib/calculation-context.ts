import { parseRules, DEFAULT_RULES } from "@/lib/customs"
import { getUsdGelRate } from "@/lib/exchange"
import { createServerSupabase } from "@/lib/supabase/server"

export async function getCalculationContext() {
  const supabase = createServerSupabase()
  const [rateResult, rulesResult] = await Promise.all([
    getUsdGelRate(supabase),
    supabase ? supabase.from("customs_rule_sets").select("version,effective_from,vat_rate,rules,source_url").eq("status", "published").order("effective_from", { ascending: false }).limit(1).maybeSingle() : Promise.resolve({ data: null }),
  ])
  const row = rulesResult.data as any
  return {
    exchangeRate: rateResult.rate,
    exchangeSource: rateResult.source,
    rules: row ? parseRules(Number(row.vat_rate), row.rules) : DEFAULT_RULES,
    ruleVersion: row?.version || "2026.2",
    effectiveFrom: row?.effective_from || "2026-01-01",
    sourceUrl: row?.source_url || "https://www.rs.ge/CarClearance",
  }
}
