import { wafFetchText } from "@/lib/waf-fetch"
import type { LocalListing, LocalMarketEstimate, Vehicle } from "@/lib/vehicles"

/**
 * autopapa.ge local-market data source.
 *
 * autopapa exposes SEO search URLs (`/en/search/{brand}/{model}`) that render
 * matching listings server-side as HTML (no Cloudflare JS challenge), so we can
 * fetch and parse them directly for real Georgian prices — unlike MyAuto, whose
 * API is Cloudflare-gated. Structured filters are passed via `s[...]` query
 * params (year range etc.). Every field below was verified against live markup.
 */

const AUTOPAPA_ORIGIN = "https://autopapa.ge"

const BROWSER_HEADERS = {
  accept: "text/html,application/xhtml+xml",
  "accept-language": "en,ka;q=0.8",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
}

type AutopapaCard = {
  title: string
  url: string
  id: string
  priceGel: number | null
  currency: "GEL" | "USD"
  year: number | null
  mileageKm: number | null
  customsPassed: boolean | null
  location: string | null
  imageUrl: string | null
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s/]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

/** Parses the listing cards out of an autopapa search results page. */
export function parseAutopapaCards(html: string, exchangeRate: number): AutopapaCard[] {
  const chunks = html.split('class="boxCatalog2').slice(1)
  const cards: AutopapaCard[] = []

  for (const card of chunks) {
    const urlM = card.match(/href="(\/[a-z]{2}\/[a-z0-9-]+\/[a-z0-9-]+\/(\d+))"/i)
    if (!urlM) continue
    const url = AUTOPAPA_ORIGIN + urlM[1]
    const id = urlM[2]

    const titleM = card.match(/class="titleCatalog"[^>]*>\s*<a[^>]*>([^<]+)<\/a>/i)
    const title = titleM ? titleM[1].trim() : ""
    if (!title) continue

    const priceBlock = (card.match(/class="priceCatalog[^"]*"[^>]*>([\s\S]*?)<\/div>/i) || [])[1] || ""
    const priceDigits = (priceBlock.replace(/<[^>]+>/g, "").match(/[\d\s]{2,}/) || [""])[0].replace(/\s/g, "")
    const priceRaw = priceDigits ? Number(priceDigits) : null
    const isUsd = /\$|dollar/i.test(priceBlock) && !/lari/i.test(priceBlock)
    const priceGel = priceRaw && priceRaw > 100 ? Math.round(isUsd ? priceRaw * exchangeRate : priceRaw) : null

    let param = ((card.match(/class="paramCatalog"[^>]*>([\s\S]*?)<\/div>/i) || [])[1] || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    // Strip the phone number so it doesn't bleed into the mileage capture.
    param = param.replace(/tel\.?\s*\+\d+/i, " ")

    const year = Number((param.match(/(\d{4})\s*year/i) || [])[1]) || null
    const mileageKm = Number(((param.match(/(\d[\d\s]*)\s*K\.?\s*km/i) || [])[1] || "").replace(/\s/g, "")) || null
    const customsPassed = /not\s*cleared/i.test(param) ? false : /cleared/i.test(param) ? true : null
    const location = (param.match(/\d{4}\s*year,\s*([^,]+?),/i) || [])[1]?.trim() || null
    const imageRel = (card.match(/src="(\/system\/car\/photos\/[^"]+)"/i) || [])[1] || null
    const imageUrl = imageRel ? AUTOPAPA_ORIGIN + imageRel : null

    cards.push({ title, url, id, priceGel, currency: isUsd ? "USD" : "GEL", year, mileageKm, customsPassed, location, imageUrl })
  }
  return cards
}

function matchesTarget(card: AutopapaCard, make: string, modelFirstWord: string): boolean {
  const t = card.title.toLowerCase()
  return t.includes(make.toLowerCase()) && t.includes(modelFirstWord.toLowerCase())
}

async function fetchSearch(path: string): Promise<string | null> {
  const { status, text } = await wafFetchText(`${AUTOPAPA_ORIGIN}${path}`, BROWSER_HEADERS, 14000)
  if (status !== 200 || !text || !text.includes("boxCatalog2")) return null
  return text
}

function buildEstimate(
  cards: AutopapaCard[],
  vehicle: Vehicle,
  locale: "ka" | "en",
): LocalMarketEstimate | null {
  const priced = cards.filter((c) => c.priceGel != null)
  if (priced.length === 0) return null

  const prices = priced.map((c) => c.priceGel as number).sort((a, b) => a - b)
  const price = median(prices)
  const min = prices[0]
  const max = prices[prices.length - 1]

  const mileages = priced.map((c) => c.mileageKm).filter((m): m is number => !!m).sort((a, b) => a - b)
  const mileageKm = mileages.length ? median(mileages) : null

  const clearedVotes = priced.filter((c) => c.customsPassed === true).length
  const unclearedVotes = priced.filter((c) => c.customsPassed === false).length
  const customsPassed = clearedVotes >= unclearedVotes

  const confidence: LocalMarketEstimate["confidence"] =
    priced.length >= 5 ? "high" : priced.length >= 2 ? "medium" : "low"

  // Closest-year listings first for display.
  const target = vehicle.year
  const listings: LocalListing[] = priced
    .slice()
    .sort((a, b) => Math.abs((a.year ?? target) - target) - Math.abs((b.year ?? target) - target))
    .slice(0, 10)
    .map((c) => ({
      title: c.title,
      url: c.url,
      priceGel: c.priceGel,
      year: c.year,
      mileageKm: c.mileageKm,
      location: c.location,
      customsPassed: c.customsPassed,
      imageUrl: c.imageUrl,
      source: "autopapa.ge",
    }))

  const notesKa = `autopapa.ge-ზე მოიძებნა ${priced.length} ანალოგიური ${vehicle.make} ${vehicle.model} (${vehicle.year} წ. ±). წარმოდგენილია მედიანური საბაზრო ფასი.`
  const notesEn = `Found ${priced.length} comparable ${vehicle.make} ${vehicle.model} (${vehicle.year} ±) on autopapa.ge. Showing the median market price.`

  return {
    source: "autopapa",
    priceGel: price,
    priceRangeGel: max > min ? { min, max } : null,
    currency: "GEL",
    confidence,
    sampleSize: priced.length,
    listings,
    mileageKm,
    customsPassed,
    notesKa,
    notesEn,
    query: `${AUTOPAPA_ORIGIN}/en/search/${slugify(vehicle.make)}/${slugify(vehicle.model)}`,
  }
}

/**
 * Searches autopapa.ge for the local-market equivalent of the given vehicle.
 * Tries the precise brand/model URL with a year window, progressively widening,
 * then a brand-only search filtered by title. Returns null if nothing usable
 * is found (caller should fall back to another source).
 */
const estimateCache = new Map<string, { at: number; estimate: LocalMarketEstimate }>()
const CACHE_TTL_MS = 30 * 60 * 1000

export async function findAutopapaMarket(
  vehicle: Vehicle,
  exchangeRate: number,
  locale: "ka" | "en",
): Promise<LocalMarketEstimate | null> {
  const brand = slugify(vehicle.make)
  const model = slugify(vehicle.model)
  const modelFirstWord = vehicle.model.split(/\s+/)[0] || vehicle.model
  if (!brand || !model) return null

  const cacheKey = `${brand}|${model}|${vehicle.year}|${locale}`
  const cached = estimateCache.get(cacheKey)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.estimate

  const cache = (estimate: LocalMarketEstimate): LocalMarketEstimate => {
    estimateCache.set(cacheKey, { at: Date.now(), estimate })
    return estimate
  }

  const windows = [
    { from: vehicle.year - 1, to: vehicle.year + 1 },
    { from: vehicle.year - 2, to: vehicle.year + 2 },
    null, // no year filter
  ]

  // 1) Precise brand/model URL, progressively widening the year window.
  for (const win of windows) {
    const params = new URLSearchParams()
    if (win) {
      params.set("s[year_from]", String(win.from))
      params.set("s[year_to]", String(win.to))
    }
    const qs = params.toString()
    const html = await fetchSearch(`/en/search/${brand}/${model}${qs ? `?${qs}` : ""}`)
    if (!html) continue
    const cards = parseAutopapaCards(html, exchangeRate).filter((c) => matchesTarget(c, vehicle.make, modelFirstWord))
    const estimate = buildEstimate(cards, vehicle, locale)
    if (estimate && estimate.sampleSize >= 2) return cache(estimate)
    if (estimate && win === null) return cache(estimate) // accept even a single match at the widest search
  }

  // 2) Brand-only fallback, filter by model token in the title.
  const brandHtml = await fetchSearch(`/en/search/${brand}`)
  if (brandHtml) {
    const cards = parseAutopapaCards(brandHtml, exchangeRate).filter((c) =>
      matchesTarget(c, vehicle.make, modelFirstWord),
    )
    const estimate = buildEstimate(cards, vehicle, locale)
    if (estimate) return cache(estimate)
  }

  return null
}
