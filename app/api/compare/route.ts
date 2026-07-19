import { NextResponse } from "next/server"
import { calculateImport, DEFAULT_RULES, parseRules } from "@/lib/customs"
import { getUsdGelRate } from "@/lib/exchange"
import { normalizeDash } from "@/lib/format"
import { copartFees, copartFromSlug, fetchCopart } from "@/lib/providers"
import { buildLocalOptions, findLocalMarket } from "@/lib/local-market"
import { createServerSupabase } from "@/lib/supabase/server"
import { comparisonRequestSchema } from "@/lib/vehicles"
import { hasRapidNewKey, rapidNewFetchJson } from "@/lib/rapidapi"

export const runtime = "nodejs"
export const maxDuration = 90

const requests = new Map<string, { count: number; resetsAt: number }>()

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous"
  const nowMs = Date.now()
  const current = requests.get(ip)
  if (current && current.resetsAt > nowMs && current.count >= 12) {
    return NextResponse.json({ error: "მოთხოვნების ლიმიტი ამოიწურა. სცადეთ რამდენიმე წუთში." }, { status: 429 })
  }
  requests.set(ip, current && current.resetsAt > nowMs ? { ...current, count: current.count + 1 } : { count: 1, resetsAt: nowMs + 10 * 60 * 1000 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "მოთხოვნის ფორმატი არასწორია" }, { status: 400 })
  }
  const parsed = comparisonRequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "შეამოწმეთ მონაცემები" }, { status: 400 })
  const { copartUrl, expectedPriceUsd, repairsUsd } = parsed.data
  const locale: "ka" | "en" = (body as { locale?: string })?.locale === "en" ? "en" : "ka"

  const copartResult = await Promise.allSettled([fetchCopart(copartUrl)]).then((r) => r[0])

  let copart = copartResult.status === "fulfilled" ? copartResult.value : null
  let usedSlugFallback = false
  if (!copart) {
    if (!expectedPriceUsd) {
      return NextResponse.json(
        { error: "Copart-ის მიმდინარე ბიდი ვერ მოიძებნა. შეავსეთ სავალდებულო ველი „მოსალოდნელი მოგების ფასი (USD)“ და სცადეთ ხელახლა." },
        { status: 502 },
      )
    }
    copart = copartFromSlug(copartUrl)
    if (!copart) {
      return NextResponse.json({ error: "Copart-ის ლოტის მონაცემები ვერ მოიძებნა - შეამოწმეთ ბმული" }, { status: 502 })
    }
    usedSlugFallback = true
  }

  const purchaseUsd = expectedPriceUsd || copart.price
  if (!purchaseUsd) return NextResponse.json({ error: "Copart-ის ფასი ვერ მოიძებნა - მიუთითეთ მოსალოდნელი ფასი" }, { status: 422 })

  try {
    const supabase = createServerSupabase()
    const [ratesResult, rulesResult, fx] = await Promise.all([
      supabase ? supabase.from("transport_rates").select("*").eq("active", true).order("priority", { ascending: false }) : Promise.resolve({ data: null }),
      supabase ? supabase.from("customs_rule_sets").select("*").eq("status", "published").order("effective_from", { ascending: false }).limit(1) : Promise.resolve({ data: null }),
      getUsdGelRate(supabase),
    ])
    const rates = ratesResult.data
    const ruleRow = rulesResult.data?.[0]
    const rules = ruleRow ? parseRules(Number(ruleRow.vat_rate), ruleRow.rules) : DEFAULT_RULES

    // Local (Georgian) market value — autopapa.ge real listings, AI fallback.
    const listingHint = parsed.data.localListingUrl || parsed.data.myautoUrl || undefined
    const localEstimate = await findLocalMarket(copart, fx.rate, locale, listingHint)

    const state = (copart.stateCode || "").toUpperCase()
    const locationText = (copart.location || "").toLowerCase()
    const transport =
      rates?.find((rate) => rate.state_code && rate.state_code === state) ||
      rates?.find((rate) => rate.location_key !== "default" && locationText.includes(rate.location_key)) ||
      rates?.find((rate) => rate.location_key === "default")
    let liveInlandUsd: number | null = null
    if (hasRapidNewKey() && copart.externalId && !usedSlugFallback) {
      const isVin = copart.externalId.length === 17
      const queryParam = isVin ? `vin=${copart.externalId}` : `lot_number=${copart.externalId}`
      try {
        const { status, json } = await rapidNewFetchJson<{ ok?: boolean; data?: { shipping?: { recommended_price_usd?: number } } }>(
          `/shipping/auction-to-port?${queryParam}`,
          {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
            "Accept": "application/json",
          },
          8000,
        )
        if (status === 200 && json?.ok && json.data?.shipping?.recommended_price_usd) {
          liveInlandUsd = json.data.shipping.recommended_price_usd
        }
      } catch (err) {
        console.error("Live shipping rate fetch failed:", err)
      }
    }

    const inlandUsd = liveInlandUsd !== null ? liveInlandUsd : Number(transport?.inland_usd ?? 850)
    const oceanUsd = Number(transport?.ocean_usd ?? 1250)
    const insuranceUsd = Number(transport?.insurance_usd ?? 150)
    const portUsd = Number(transport?.port_usd ?? 300)

    const fees = copartFees(purchaseUsd)
    const imported = calculateImport(copart, {
      purchaseUsd, feesUsd: fees.total, inlandUsd, oceanUsd, insuranceUsd, portUsd,
      repairsUsd: repairsUsd ?? 0, exchangeRate: fx.rate,
    }, rules)

    // Cost each real local listing (carousel); default headline = first option.
    const localOptions = buildLocalOptions(copart, localEstimate, rules, imported.totalGel, locale)
    const primary = localOptions[0]
    const myauto = primary.vehicle
    const localLines = primary.localLines
    const localTotalGel = primary.localTotalGel
    const hasLocalPrice = localTotalGel > 0
    const differenceGel = primary.differenceGel
    const verdict = hasLocalPrice ? primary.verdict : "equal"
    const roiPercent = primary.roiPercent
    const savingsPercent = primary.savingsPercent

    const warnings = [
      "შეფასება არ მოიცავს აუქციონის მოულოდნელ ხარჯებსა და შესაძლო დაზიანებების სრულ შეკეთებას.",
      "საბოლოო განბაჟება გადაამოწმეთ rs.ge-ს ოფიციალურ კალკულატორზე.",
    ]
    if (usedSlugFallback) {
      warnings.unshift("Copart-ის API დროებით მიუწვდომელია - ლოტის მონაცემები ბმულიდან აღდგა. გადაამოწმეთ ლოტის დეტალები.")
    } else if (copart.isFallback) {
      warnings.unshift("Copart-ის მონაცემები სარეზერვო წყაროდან იქნა მიღებული - გადაამოწმეთ ლოტის დეტალები.")
    }
    if (!hasLocalPrice) {
      warnings.unshift("ქართულ ბაზარზე ანალოგიური მანქანა ვერ მოიძებნა - ადგილობრივი ფასი საორიენტაციოდ ვერ დაითვალა. სცადეთ ხელახლა ან მიუთითეთ კონკრეტული განცხადება.")
    } else if (localEstimate.source === "autopapa") {
      warnings.unshift(`ადგილობრივი ფასი დაფუძნებულია autopapa.ge-ს ${localEstimate.sampleSize} რეალურ განცხადებაზე (მედიანური ფასი) და საორიენტაციოა.`)
    } else if (localEstimate.confidence === "low") {
      warnings.unshift("ადგილობრივი ფასი AI-ის სავარაუდო შეფასებაა დაბალი სანდოობით - გადაამოწმეთ მითითებულ წყაროებში.")
    } else {
      warnings.unshift("ადგილობრივი ფასი მიღებულია AI-ის ბაზრის ანალიზით (ქართული მარკეტფლეისები) და საორიენტაციოა.")
    }
    if (myauto.customsPassed === false) warnings.unshift("ნაპოვნი autopapa.ge-ს ავტომობილი განუბაჟებელია - ადგილობრივ ფასს დაემატა სავარაუდო განბაჟება.")

    return NextResponse.json({
      copart: { ...copart, price: purchaseUsd }, myauto,
      localSource: listingHint ? "listing" : "ai", localEstimate, localOptions,
      exchangeRate: fx.rate, exchangeRateSource: fx.source,
      transportLabel: normalizeDash(transport?.location_label || "აშშ - სტანდარტული ტარიფი"),
      importLines: imported.lines, importTotalGel: imported.totalGel,
      localLines, localTotalGel,
      differenceGel, savingsPercent,
      roiPercent, verdict,
      ruleVersion: ruleRow?.version || "2026.2", calculatedAt: new Date().toISOString(), warnings,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "კალკულაცია ვერ შესრულდა"
    const isFetchError = message.includes("მოიძებნა") || message.includes("fetch") || message.includes("MyAuto") || message.includes("autopapa")
    return NextResponse.json({ error: message }, { status: isFetchError ? 502 : 500 })
  }
}
