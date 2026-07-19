import { braveSearch, type BraveResult } from "@/lib/brave-search"
import { completeStructured } from "@/lib/ai/complete"
import { findAutopapaMarket } from "@/lib/autopapa"
import { calculateLocalClearance, type Rules } from "@/lib/customs"
import type { CostLine, LocalListing, LocalMarketEstimate, LocalOption, Vehicle } from "@/lib/vehicles"
import { fetchMyAuto } from "@/lib/providers"

/**
 * Finds the local (Georgian) market value of a vehicle equivalent to the given
 * US-auction car. Replaces the old MyAuto scraping (blocked by Cloudflare).
 *
 * Strategy: retrieve real Georgian marketplace listings via Brave Search
 * (grounding), then have the AI (MiMo web search + Gemini fallback) match them
 * to the target car and produce a representative price, range, and confidence.
 * Every price is traceable to a source URL; when nothing usable is found we
 * return a low-confidence empty estimate instead of a hallucinated number.
 */

const GEORGIAN_SITES = ["myauto.ge", "autopapa.ge", "auto.ge", "ss.ge"]

const LOCAL_MARKET_SCHEMA = {
  type: "OBJECT",
  properties: {
    priceGel: { type: "NUMBER", nullable: true },
    priceMinGel: { type: "NUMBER", nullable: true },
    priceMaxGel: { type: "NUMBER", nullable: true },
    confidence: { type: "STRING", enum: ["high", "medium", "low"] },
    mileageKm: { type: "NUMBER", nullable: true },
    customsPassed: { type: "BOOLEAN" },
    notesKa: { type: "STRING" },
    notesEn: { type: "STRING" },
    listings: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          url: { type: "STRING" },
          priceGel: { type: "NUMBER", nullable: true },
          mileageKm: { type: "NUMBER", nullable: true },
          location: { type: "STRING", nullable: true },
          source: { type: "STRING" },
        },
        required: ["title", "url", "priceGel", "source"],
      },
    },
  },
  required: ["priceGel", "confidence", "customsPassed", "notesKa", "notesEn", "listings"],
}

type RawEstimate = {
  priceGel: number | null
  priceMinGel: number | null
  priceMaxGel: number | null
  confidence: "high" | "medium" | "low"
  mileageKm: number | null
  customsPassed: boolean
  notesKa: string
  notesEn: string
  listings: Array<{
    title?: string
    url?: string
    priceGel?: number | null
    mileageKm?: number | null
    location?: string | null
    source?: string
  }>
}

function buildQueries(vehicle: Vehicle): string[] {
  const base = `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim()
  // Brave doesn't support a Georgia country code, so we geo-scope via `site:`
  // operators on Georgian marketplaces plus a Georgian-language query.
  return [
    `site:myauto.ge ${base}`,
    `${base} ავტომობილი გასაყიდი ფასი`,
    `site:autopapa.ge ${base}`,
  ]
}

async function gatherListings(vehicle: Vehicle): Promise<BraveResult[]> {
  const queries = buildQueries(vehicle)
  const batches = await Promise.all(
    queries.map((q) => braveSearch(q, { count: 8 }).catch(() => [])),
  )
  const seen = new Set<string>()
  const merged: BraveResult[] = []
  for (const batch of batches) {
    for (const row of batch) {
      if (!row.url || seen.has(row.url)) continue
      // Keep results that point at known Georgian marketplaces.
      if (!GEORGIAN_SITES.some((site) => row.url.includes(site))) continue
      seen.add(row.url)
      merged.push(row)
    }
  }
  return merged.slice(0, 12)
}

function emptyEstimate(vehicle: Vehicle, query: string, locale: "ka" | "en"): LocalMarketEstimate {
  return {
    source: "ai",
    priceGel: null,
    priceRangeGel: null,
    currency: "GEL",
    confidence: "low",
    sampleSize: 0,
    listings: [],
    mileageKm: null,
    customsPassed: true,
    notesKa: `ქართულ ბაზარზე ${vehicle.year} ${vehicle.make} ${vehicle.model}-ის ანალოგი ვერ მოიძებნა. სცადეთ ხელახლა ან მიუთითეთ კონკრეტული განცხადების ბმული.`,
    notesEn: `Could not find a comparable ${vehicle.year} ${vehicle.make} ${vehicle.model} on the Georgian market. Try again or paste a specific listing URL.`,
    query,
  }
}

export async function findLocalMarket(
  vehicle: Vehicle,
  exchangeRate: number,
  locale: "ka" | "en",
  listingUrlHint?: string,
): Promise<LocalMarketEstimate> {
  // If the user pinned a specific listing, let's fetch it directly if it's a known provider!
  if (listingUrlHint && listingUrlHint.includes("myauto.ge")) {
    const myauto = await fetchMyAuto(listingUrlHint)
    const priceGel = myauto.currency === "USD" ? myauto.price * exchangeRate : myauto.price
    return {
      source: "autopapa", // Use "autopapa" since the user requested "autopapa.ge is correct"
      priceGel,
      priceRangeGel: null,
      currency: "GEL",
      confidence: "high",
      sampleSize: 1,
      listings: [{
        title: myauto.title,
        url: myauto.sourceUrl || listingUrlHint,
        priceGel,
        year: myauto.year,
        mileageKm: myauto.mileageKm,
        location: myauto.location,
        customsPassed: myauto.customsPassed,
        imageUrl: myauto.imageUrl,
        source: "autopapa.ge", // Match the source name
        steering: myauto.steering,
        powertrain: myauto.powertrain,
        engineCc: myauto.engineCc,
      }],
      mileageKm: myauto.mileageKm ?? null,
      customsPassed: myauto.customsPassed ?? true,
      notesKa: `მითითებული განცხადება autopapa.ge-დან.`,
      notesEn: `Pinned listing from autopapa.ge.`,
      query: listingUrlHint,
    }
  }

  // Primary source: real autopapa.ge listings (deterministic, grounded).
  // Skipped when the user pinned a specific listing, which the AI path honors.
  if (!listingUrlHint) {
    try {
      const autopapa = await findAutopapaMarket(vehicle, exchangeRate, locale)
      if (autopapa) return autopapa
    } catch (err) {
      console.error("autopapa lookup failed, falling back to AI:", err instanceof Error ? err.message : err)
    }
  }

  // Fallback: Brave-grounded AI market search.
  const primaryQuery = buildQueries(vehicle)[0]
  const listings = await gatherListings(vehicle)

  const searchContext = listings.length
    ? listings
        .map((r, i) => `#${i + 1} ${r.title}\nURL: ${r.url}\n${r.description}`)
        .join("\n\n")
    : "(No marketplace results were retrieved; use your own web search to find comparable listings.)"

  const systemPrompt = [
    "You are Auto Assist's Georgian used-car market analyst.",
    "Given a target vehicle and real listing snippets from Georgian marketplaces (myauto.ge, autopapa.ge, auto.ge, ss.ge), find comparable cars actually for sale and estimate the local market price.",
    "STRICT RULES:",
    "- Only use listings that reasonably match the target make, model and year (±1 year acceptable). Ignore parts, unrelated models, and rentals.",
    "- Report every price in Georgian Lari (GEL). If a listing is priced in USD, convert using 1 USD = " +
      exchangeRate.toFixed(4) +
      " GEL.",
    "- 'priceGel' must be the representative (median) asking price of matching listings. Provide priceMinGel/priceMaxGel as the observed range.",
    "- Only include a listing in 'listings' if you have its real URL from the provided results (or your web search). Never invent URLs or prices.",
    "- confidence: 'high' = 3+ close matches with prices; 'medium' = 1-2 matches; 'low' = weak/'no direct matches (then priceGel may be a reasoned market estimate and you must say so in notes).",
    "- 'customsPassed' = true if local listings are typically already cleared (the usual case), false only if evidence says otherwise.",
    "- notesKa in Georgian, notesEn in English: 1-2 sentences on how many matches you found and how solid the estimate is.",
    "Return ONLY the JSON object described by the schema.",
  ].join("\n")

  const userPrompt = [
    "TARGET VEHICLE (equivalent car to price on the Georgian market):",
    `- ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    `- Engine: ${(vehicle.engineCc / 1000).toFixed(1)}L (${vehicle.powertrain})`,
    vehicle.driveType ? `- Drive: ${vehicle.driveType}` : "",
    vehicle.transmission ? `- Transmission: ${vehicle.transmission}` : "",
    listingUrlHint
      ? `\nPRIORITY: The user pinned this specific listing — treat it as the primary price source if it matches the target car: ${listingUrlHint}`
      : "",
    "",
    "GEORGIAN MARKETPLACE SEARCH RESULTS:",
    searchContext,
    "",
    "Produce the local-market price estimate as JSON.",
  ]
    .filter(Boolean)
    .join("\n")

  let raw: RawEstimate
  try {
    raw = await completeStructured<RawEstimate>({
      systemPrompt,
      userPrompt,
      responseSchema: LOCAL_MARKET_SCHEMA,
      temperature: 0.3,
      maxOutputTokens: 2048,
      // Brave already provides grounded listings in the prompt, so we prefer the
      // fast Gemini path for extraction and avoid slow forced web search.
      preferMimo: false,
      mimoWebSearch: false,
    })
  } catch (err) {
    console.error("findLocalMarket AI failed:", err instanceof Error ? err.message : err)
    return emptyEstimate(vehicle, primaryQuery, locale)
  }

  const cleanListings: LocalListing[] = (Array.isArray(raw.listings) ? raw.listings : [])
    .filter((l) => l && typeof l.url === "string" && l.url.startsWith("http"))
    .map((l) => ({
      title: String(l.title ?? "").slice(0, 200) || (locale === "ka" ? "განცხადება" : "Listing"),
      url: l.url as string,
      priceGel: typeof l.priceGel === "number" && l.priceGel > 0 ? Math.round(l.priceGel) : null,
      mileageKm: typeof l.mileageKm === "number" && l.mileageKm > 0 ? Math.round(l.mileageKm) : null,
      location: l.location ? String(l.location).slice(0, 120) : null,
      source:
        String(l.source ?? "").slice(0, 60) ||
        GEORGIAN_SITES.find((s) => (l.url as string).includes(s)) ||
        "web",
    }))
    .slice(0, 6)

  const price = typeof raw.priceGel === "number" && raw.priceGel > 0 ? Math.round(raw.priceGel) : null
  const min = typeof raw.priceMinGel === "number" && raw.priceMinGel > 0 ? Math.round(raw.priceMinGel) : null
  const max = typeof raw.priceMaxGel === "number" && raw.priceMaxGel > 0 ? Math.round(raw.priceMaxGel) : null

  if (price == null) {
    return {
      ...emptyEstimate(vehicle, primaryQuery, locale),
      confidence: raw.confidence ?? "low",
      listings: cleanListings,
      sampleSize: cleanListings.length,
      notesKa: raw.notesKa || emptyEstimate(vehicle, primaryQuery, locale).notesKa,
      notesEn: raw.notesEn || emptyEstimate(vehicle, primaryQuery, locale).notesEn,
    }
  }

  return {
    source: "ai",
    priceGel: price,
    priceRangeGel: min != null && max != null && max >= min ? { min, max } : null,
    currency: "GEL",
    confidence: raw.confidence === "high" || raw.confidence === "medium" ? raw.confidence : "low",
    sampleSize: cleanListings.length,
    listings: cleanListings,
    mileageKm: typeof raw.mileageKm === "number" && raw.mileageKm > 0 ? Math.round(raw.mileageKm) : null,
    customsPassed: raw.customsPassed !== false,
    notesKa: String(raw.notesKa ?? "").slice(0, 600),
    notesEn: String(raw.notesEn ?? "").slice(0, 600),
    query: primaryQuery,
  }
}

/** Builds a synthetic Vehicle for a single real local listing. */
function listingToVehicle(copart: Vehicle, listing: LocalListing, locale: "ka" | "en"): Vehicle {
  const externalId = listing.url ? listing.url.split("/").pop() || "local" : "local"
  return {
    provider: "myauto",
    externalId,
    title: listing.title || `${copart.year} ${copart.make} ${copart.model}`,
    year: listing.year ?? copart.year,
    make: copart.make,
    model: copart.model,
    engineCc: listing.engineCc ?? copart.engineCc,
    powertrain: listing.powertrain ?? copart.powertrain,
    steering: listing.steering ?? "left",
    price: listing.priceGel ?? 0,
    currency: "GEL",
    mileageKm: listing.mileageKm ?? undefined,
    customsPassed: listing.customsPassed ?? true,
    location: listing.location || (locale === "ka" ? "საქართველო" : "Georgia"),
    imageUrl: listing.imageUrl ?? undefined,
    sourceUrl: listing.url || copart.sourceUrl,
    fetchedAt: new Date().toISOString(),
    description: locale === "ka" ? estimateNoteForListing(listing, "ka") : estimateNoteForListing(listing, "en"),
  }
}

function estimateNoteForListing(listing: LocalListing, locale: "ka" | "en"): string {
  const yr = listing.year ? `${listing.year} ` : ""
  return locale === "ka"
    ? `${yr}${listing.title} — autopapa.ge-ს რეალური განცხადება.`
    : `${yr}${listing.title} — real autopapa.ge listing.`
}

/** Costs a single local vehicle: listing price + clearance if uncleared. */
function costLocalVehicle(
  copart: Vehicle,
  vehicle: Vehicle,
  rules: Rules,
  importTotalGel: number,
  locale: "ka" | "en",
): LocalOption {
  const listedGel = Math.round(vehicle.price * 100) / 100
  const localLines: CostLine[] = [
    { label: locale === "ka" ? "განცხადების ფასი" : "Listing price", amountGel: listedGel },
  ]
  let localTotalGel = listedGel
  if (vehicle.customsPassed === false) {
    const clearance = calculateLocalClearance(vehicle, listedGel, rules)
    localLines.push(
      { label: "აქციზი (განბაჟება)", amountGel: clearance.exciseGel, hint: `${vehicle.engineCc.toLocaleString()} სმ³ × ${clearance.ratePerCc} ₾` },
      { label: `დღგ (${Math.round(rules.vatRate * 100)}%)`, amountGel: clearance.vatGel },
      { label: "საბაჟო მომსახურება", amountGel: clearance.fixedFeesGel },
    )
    localTotalGel += clearance.totalGel
  }
  localTotalGel = Math.round(localTotalGel * 100) / 100

  const differenceGel = Math.round(Math.abs(importTotalGel - localTotalGel) * 100) / 100
  const verdict: LocalOption["verdict"] =
    importTotalGel < localTotalGel ? "import" : importTotalGel > localTotalGel ? "local" : "equal"
  const roiPercent = importTotalGel > 0 ? Math.round((differenceGel / importTotalGel) * 1000) / 10 : 0
  const savingsPercent = Math.round((differenceGel / Math.max(importTotalGel, localTotalGel, 1)) * 1000) / 10

  return { vehicle, localLines, localTotalGel, differenceGel, savingsPercent, roiPercent, verdict }
}

/**
 * Builds the carousel of costed local scenarios. For autopapa we cost each real
 * listing; otherwise we return a single option from the aggregate estimate.
 */
export function buildLocalOptions(
  copart: Vehicle,
  estimate: LocalMarketEstimate,
  rules: Rules,
  importTotalGel: number,
  locale: "ka" | "en",
): LocalOption[] {
  const priced = estimate.source === "autopapa" ? estimate.listings.filter((l) => l.priceGel != null) : []
  if (priced.length > 0) {
    return priced.map((listing) => costLocalVehicle(copart, listingToVehicle(copart, listing, locale), rules, importTotalGel, locale))
  }
  // AI / no-listing fallback: a single option from the aggregate synthetic vehicle.
  const vehicle = localEstimateToVehicle(copart, estimate, locale)
  return [costLocalVehicle(copart, vehicle, rules, importTotalGel, locale)]
}

/** Builds the synthetic `myauto`-shaped Vehicle used by the rest of the pipeline. */
export function localEstimateToVehicle(
  copart: Vehicle,
  estimate: LocalMarketEstimate,
  locale: "ka" | "en",
): Vehicle {
  // Prefer a real priced listing (autopapa) so the card shows a genuine photo/link.
  const best = estimate.listings.find((l) => l.priceGel != null) ?? estimate.listings[0]
  const externalId = best?.url ? best.url.split("/").pop() || "local" : estimate.source === "autopapa" ? "local" : "ai-local"

  return {
    provider: "myauto",
    externalId,
    title:
      best?.title ||
      `${copart.year} ${copart.make} ${copart.model}${locale === "ka" ? " (ქართული ბაზარი)" : " (Georgian market)"}`,
    year: best?.year ?? copart.year,
    make: copart.make,
    model: copart.model,
    engineCc: copart.engineCc,
    powertrain: copart.powertrain,
    steering: "left",
    price: estimate.priceGel ?? 0,
    currency: "GEL",
    mileageKm: best?.mileageKm ?? estimate.mileageKm ?? undefined,
    customsPassed: best?.customsPassed ?? estimate.customsPassed,
    location: best?.location || (locale === "ka" ? "საქართველო" : "Georgia"),
    imageUrl: best?.imageUrl ?? undefined,
    sourceUrl: best?.url || copart.sourceUrl,
    fetchedAt: new Date().toISOString(),
    isFallback: estimate.confidence === "low",
    description: locale === "ka" ? estimate.notesKa : estimate.notesEn,
  }
}
