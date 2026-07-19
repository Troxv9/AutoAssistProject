import { z } from "zod"

export const comparisonRequestSchema = z.object({
  copartUrl: z.string().refine(
    (value) => value.length === 17 || (value.startsWith("http") && /(copart\.com|iaai\.com)/i.test(value)),
    "მიუთითეთ ვალიდური Copart/IAAI ბმული ან 17-ნიშნა VIN კოდი"
  ),
  // Optional: users may still pin a specific local listing URL (any Georgian
  // marketplace). When omitted, the local side is found via AI market search.
  myautoUrl: z.string().url().optional().or(z.literal("")),
  localListingUrl: z.string().url().optional().or(z.literal("")),
  expectedPriceUsd: z.number().positive().optional(),
  repairsUsd: z.number().min(0).optional(),
})

export type Powertrain = "gasoline" | "diesel" | "hybrid" | "electric"
export type Steering = "left" | "right"

export type Vehicle = {
  provider: "copart" | "myauto"
  externalId: string
  title: string
  year: number
  make: string
  model: string
  engineCc: number
  powertrain: Powertrain
  steering: Steering
  price: number
  currency: "USD" | "GEL"
  mileageKm?: number
  customsPassed?: boolean
  stateCode?: string
  location?: string
  imageUrl?: string
  sourceUrl: string
  fetchedAt: string
  isFallback?: boolean
  vin?: string
  damagePrimary?: string
  damageSecondary?: string
  runCondition?: string
  hasKeys?: boolean
  saleDocument?: string
  driveType?: string
  transmission?: string
  description?: string
}

export type CostLine = { label: string; amountGel: number; hint?: string }

/** A single candidate listing found on the Georgian market. */
export type LocalListing = {
  title: string
  url: string
  priceGel: number | null
  year?: number | null
  mileageKm?: number | null
  location?: string | null
  customsPassed?: boolean | null
  imageUrl?: string | null
  source: string
  steering?: Steering | null
  powertrain?: Powertrain | null
  engineCc?: number | null
}

/** Estimate of a vehicle's local (Georgian) market value. */
export type LocalMarketEstimate = {
  /** Where the estimate came from: real autopapa listings or AI market search. */
  source: "autopapa" | "ai"
  priceGel: number | null
  priceRangeGel: { min: number; max: number } | null
  currency: "GEL"
  confidence: "high" | "medium" | "low"
  sampleSize: number
  listings: LocalListing[]
  mileageKm?: number | null
  customsPassed: boolean
  notesKa: string
  notesEn: string
  query: string
}

/** One fully-costed local purchase scenario (per real autopapa listing). */
export type LocalOption = {
  vehicle: Vehicle
  localLines: CostLine[]
  localTotalGel: number
  differenceGel: number
  savingsPercent: number
  roiPercent: number
  verdict: "import" | "local" | "equal"
}

export type ComparisonResult = {
  copart: Vehicle
  myauto: Vehicle
  /** How the local side was sourced: "ai" (market search) or "listing" (a pinned URL). */
  localSource: "ai" | "listing"
  /** Present when the local side was produced by AI market search. */
  localEstimate?: LocalMarketEstimate
  /** Per-listing costed scenarios for the carousel (autopapa). Optional for back-compat. */
  localOptions?: LocalOption[]
  exchangeRate: number
  exchangeRateSource: string
  transportLabel: string
  importLines: CostLine[]
  importTotalGel: number
  localLines: CostLine[]
  localTotalGel: number
  differenceGel: number
  savingsPercent: number
  roiPercent: number
  verdict: "import" | "local" | "equal"
  ruleVersion: string
  calculatedAt: string
  warnings: string[]
}

export function extractListingId(url: string) {
  if (url.length === 17 || /^\d{5,}$/.test(url)) {
    return url
  }
  try {
    const parsed = new URL(url)
    const segment = parsed.pathname.match(/\/(?:pr|lot|VehicleDetail)\/([a-zA-Z0-9~_-]+)/i)?.[1]
    const queryId = parsed.searchParams.get("id") || parsed.searchParams.get("lot") || parsed.searchParams.get("lot_id")
    const id = segment || queryId || parsed.pathname.match(/\d{5,}/g)?.at(-1)
    if (!id) throw new Error("ბმულიდან განცხადების ნომერი ვერ მოიძებნა")
    return id
  } catch {
    const lastNumMatch = url.match(/\d{5,}/g)?.at(-1)
    if (lastNumMatch) return lastNumMatch
    throw new Error("ბმულიდან განცხადების ნომერი ან VIN კოდი ვერ მოიძებნა")
  }
}
