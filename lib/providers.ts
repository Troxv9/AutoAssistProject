import { extractListingId, type Powertrain, type Steering, type Vehicle } from "@/lib/vehicles"
import { hasRapidNewKey, rapidNewFetchJson } from "@/lib/rapidapi"
import { wafFetchJson } from "@/lib/waf-fetch"

const BROWSER_HEADERS = {
  accept: "application/json",
  "accept-language": "ka,en;q=0.8",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
}

const now = () => new Date().toISOString()
const pick = (value: unknown, fallback = "") => (typeof value === "string" && value.trim() ? value.trim() : fallback)
const num = (value: unknown, fallback = 0) => {
  const parsed = Number(String(value ?? "").replace(/[^0-9.]/g, ""))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function powertrainFromText(value: unknown): Powertrain {
  const text = String(value ?? "").toLowerCase()
  if (text.includes("electric") || text.includes("ელექტრო")) return "electric"
  if (text.includes("hybrid") || text.includes("ჰიბრიდ")) return "hybrid"
  if (text.includes("diesel") || text.includes("დიზელ")) return "diesel"
  return "gasoline"
}

const MYAUTO_FUEL: Record<number, Powertrain> = { 1: "gasoline", 2: "gasoline", 3: "diesel", 6: "hybrid", 7: "electric", 8: "hybrid", 9: "gasoline", 10: "gasoline", 12: "electric" }

function normalizeCc(value: unknown, fallbackCc: number) {
  const raw = num(value, 0)
  if (!raw) return fallbackCc
  return Math.round(raw < 20 ? raw * 1000 : raw)
}

let mansCache: { at: number; map: Map<number, string> } | null = null
async function makeName(manId: number): Promise<string> {
  try {
    if (!mansCache || Date.now() - mansCache.at > 24 * 60 * 60 * 1000) {
      const { status, json } = await wafFetchJson<Array<{ man_id: string | number; man_name: string }>>(
        "https://static.my.ge/myauto/js/mans.json",
        BROWSER_HEADERS,
        6000,
      )
      if (status === 200 && Array.isArray(json)) {
        mansCache = { at: Date.now(), map: new Map(json.map((row) => [Number(row.man_id), row.man_name])) }
      }
    }
  } catch {
  }
  return mansCache?.map.get(manId) || `#${manId}`
}

const FEE_BRACKETS: Array<[number, number]> = [
  [49.99, 25], [99.99, 45], [199.99, 80], [299.99, 130], [349.99, 132.5], [399.99, 135], [449.99, 170],
  [499.99, 180], [549.99, 200], [599.99, 225], [699.99, 235], [799.99, 245], [899.99, 265], [999.99, 285],
  [1199.99, 325], [1399.99, 355], [1599.99, 385], [1799.99, 405], [1999.99, 430], [2399.99, 470],
  [2799.99, 510], [3099.99, 535], [3499.99, 570], [3999.99, 610], [4499.99, 655], [4999.99, 705],
  [5999.99, 755], [6999.99, 830], [7499.99, 880], [9999.99, 930], [11499.99, 975], [14999.99, 1030],
]
const BID_FEE_BRACKETS: Array<[number, number]> = [
  [99.99, 0], [499.99, 50], [999.99, 65], [1499.99, 85], [1999.99, 95], [3999.99, 110], [5999.99, 125], [7999.99, 145],
]

export function copartFees(bidUsd: number) {
  const buyer = FEE_BRACKETS.find(([max]) => bidUsd <= max)?.[1] ?? Math.round(bidUsd * 0.075 * 100) / 100
  const bidding = BID_FEE_BRACKETS.find(([max]) => bidUsd <= max)?.[1] ?? 160
  const gate = 95
  const environmental = 15
  const title = 20
  return { buyer, bidding, gate, environmental, title, total: buyer + bidding + gate + environmental + title }
}

async function fetchCopartSolr(externalId: string): Promise<Vehicle | null> {
  try {
    const { status, json } = await wafFetchJson<{ data?: { lotDetails?: any } }>(
      `https://www.copart.com/public/data/lotdetails/solr/${externalId}`,
      BROWSER_HEADERS,
      7000,
    )
    if (status !== 200) return null
    const row = json?.data?.lotDetails
    if (!row) return null
    const year = num(row.lcy ?? row.year, 0)
    if (!year) return null
    const make = pick(row.mkn, "Vehicle")
    const model = pick(row.lm ?? row.mmod, `Lot ${externalId}`)
    const stateCode = pick(row.locState ?? row.state).toUpperCase() || undefined
    return {
      provider: "copart", externalId, title: pick(row.ld, `${year} ${make} ${model}`), year, make, model,
      engineCc: normalizeCc(row.egn, 2500),
      powertrain: powertrainFromText(row.ft ?? row.fuel), steering: "left",
      price: num(row.dynamicLotDetails?.currentBid ?? row.hb ?? row.la, 0), currency: "USD",
      stateCode, location: [pick(row.locCity ?? row.yn), stateCode].filter(Boolean).join(", ") || "United States",
      imageUrl: row.tims ? row.tims.replace("_thb.jpg", "_ful.jpg") : undefined, sourceUrl: `https://www.copart.com/lot/${externalId}`, fetchedAt: now(), isFallback: true,
    }
  } catch {
    return null
  }
}

function unwrapRapidLot(payload: any, externalId: string): any {
  const direct = [
    payload?.data?.lot,
    payload?.data?.lotDetails,
    payload?.data?.result,
    payload?.data,
    payload?.lot,
    payload?.lotDetails,
    payload?.result,
    payload,
  ]
  for (const value of direct) {
    if (Array.isArray(value)) {
      const match = value.find((item) => String(item?.lot_id ?? item?.lotNumber ?? item?.lot_number ?? item?.ln) === externalId)
      if (match) return match
      if (value[0]) return value[0]
    }
    if (value && typeof value === "object") return value
  }
  return null
}

function rapidCurrentBid(row: any): number {
  return num(
    row?.current_bid ?? row?.currentBid ?? row?.current_bid_value ?? row?.currentBidValue ??
    row?.high_bid ?? row?.highBid ?? row?.bid_price ?? row?.bidPrice ?? row?.hb ?? row?.price,
    0,
  )
}

async function rapidRequest(host: string, key: string, path: string, timeoutMs: number): Promise<any | null> {
  try {
    const response = await fetch(`https://${host}${path}`, {
      headers: {
        "x-rapidapi-key": key,
        "x-rapidapi-host": host,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

async function fetchCopartRapid(externalId: string, url: string): Promise<Vehicle | null> {
  const key = process.env.RAPIDAPI_KEY
  if (!key) return null
  const host = process.env.RAPIDAPI_HOST || "copart-vehicle-data-api.p.rapidapi.com"

  const searchPayload = await rapidRequest(host, key, `/api/search-lot/${externalId}`, 18000)
  const searchRow = searchPayload ? unwrapRapidLot(searchPayload, externalId) : null

  const searchYear = num(searchRow?.year ?? searchRow?.lot_year ?? searchRow?.model_year ?? searchRow?.lcy, 0)
  const detailPayload = searchYear ? null : await rapidRequest(host, key, `/api/lot/${externalId}`, 30000)
  const detailRow = detailPayload ? unwrapRapidLot(detailPayload, externalId) : null
  const row = detailRow ? { ...detailRow, ...searchRow } : searchRow
  if (!row) return null

  const year = num(row.year ?? row.lot_year ?? row.model_year ?? row.lcy, 0)
  if (!year) return null
  const make = pick(row.make ?? row.manufacturer ?? row.mkn, "Vehicle")
  const model = pick(row.model ?? row.model_name ?? row.mmod ?? row.lm, `Lot ${externalId}`)
  const location = pick(row.location ?? row.yard_name ?? row.location_name ?? row.yn, "United States")
  const stateCode = location.match(/(?:,|-)\s*([A-Z]{2})\b/)?.[1] || pick(row.state ?? row.locState).toUpperCase() || undefined
  return {
    provider: "copart", externalId, title: pick(row.title ?? row.ld, `${year} ${make} ${model}`), year, make, model,
    engineCc: normalizeCc(row.engine_cc ?? row.engine_size ?? row.engine ?? row.egn, 2500),
    powertrain: powertrainFromText(row.fuel_type ?? row.fuel ?? row.ft), steering: /right/i.test(String(row.steering ?? "")) ? "right" : "left",
    price: rapidCurrentBid(searchRow) || rapidCurrentBid(detailRow), currency: "USD",
    stateCode, location, imageUrl: pick(row.image ?? row.image_url ?? row.primary_image ?? row.tims) || undefined,
    sourceUrl: url, fetchedAt: now(),
  }
}

const US_STATES = new Set(["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"])

export function copartFromSlug(url: string, proxy?: Pick<Vehicle, "engineCc" | "powertrain">): Vehicle | null {
  const externalId = extractListingId(url)
  const slug = url.match(/\/lot\/\d+\/([a-z0-9-]+)/i)?.[1]
  if (!slug) return null
  const tokens = slug.toLowerCase().split("-").filter(Boolean)
  const yearIndex = tokens.findIndex((token) => /^(19|20)\d{2}$/.test(token))
  if (yearIndex === -1) return null
  const year = Number(tokens[yearIndex])
  const make = tokens[yearIndex + 1] ? tokens[yearIndex + 1].toUpperCase() : "VEHICLE"
  let stateCode: string | undefined
  let cityStart = tokens.length
  for (let i = tokens.length - 1; i > yearIndex + 1; i--) {
    if (US_STATES.has(tokens[i].toUpperCase())) { stateCode = tokens[i].toUpperCase(); cityStart = i + 1; break }
  }
  const modelTokens = tokens.slice(yearIndex + 2, stateCode ? tokens.indexOf(stateCode.toLowerCase()) : tokens.length)
  const model = modelTokens.join(" ").toUpperCase() || `LOT ${externalId}`
  const city = tokens.slice(cityStart).map((t) => t[0].toUpperCase() + t.slice(1)).join(" ")
  return {
    provider: "copart", externalId, title: `${year} ${make} ${model}`, year, make, model,
    engineCc: proxy?.engineCc ?? 2500, powertrain: proxy?.powertrain ?? "gasoline", steering: "left",
    price: 0, currency: "USD", stateCode,
    location: [city, stateCode].filter(Boolean).join(", ") || "United States",
    sourceUrl: url, fetchedAt: now(), isFallback: true,
  }
}

async function fetchCopartNewRapid(externalId: string, url: string): Promise<Vehicle | null> {
  if (!hasRapidNewKey()) return null

  const isUrl = url.startsWith("http")
  const path = isUrl
    ? `/vehicles/urltodetails?url=${encodeURIComponent(url)}`
    : `/vehicles/${externalId}`
  try {
    const { status, json } = await rapidNewFetchJson<{ ok?: boolean; data?: any }>(path, BROWSER_HEADERS, 12000)
    if (status !== 200 || !json?.ok || !json.data) return null
    const data = json.data
    const year = num(data.year, 0)
    if (!year) return null
    
    const make = pick(data.make, "Vehicle")
    const model = pick(data.model, `Lot ${externalId}`)
    const price = num(data.pricing?.current_bid_usd ?? data.pricing?.buy_now_usd, 0)
    
    let engineCc = 2500
    const engineSizeL = data.vehicle_specs?.engine?.size_l
    if (engineSizeL) {
      engineCc = Math.round(parseFloat(engineSizeL) * 1000)
    } else {
      const rawEngine = data.vehicle_specs?.engine?.raw
      engineCc = normalizeCc(rawEngine, 2500)
    }

    const locationText = pick(data.location?.display, "United States")
    const stateCodeMatch = locationText.match(/\(([A-Z]{2})\)/)
    const stateCode = stateCodeMatch ? stateCodeMatch[1].toUpperCase() : undefined

    let imageUrl = undefined
    const mediaItems = data.media?.items
    if (Array.isArray(mediaItems) && mediaItems.length > 0) {
      imageUrl = mediaItems[0].large || mediaItems[0].full || mediaItems[0].thumb
    } else if (Array.isArray(data.media?.thumbs) && data.media.thumbs.length > 0) {
      imageUrl = data.media.thumbs[0]
    }

    return {
      provider: "copart",
      externalId,
      title: pick(data.title, `${year} ${make} ${model}`),
      year,
      make,
      model,
      engineCc,
      powertrain: powertrainFromText(data.vehicle_specs?.fuel_type),
      steering: "left",
      price,
      currency: "USD",
      stateCode,
      location: locationText,
      imageUrl,
      sourceUrl: isUrl ? url : (data.lot_number ? `https://www.copart.com/lot/${data.lot_number}` : `https://www.copart.com/lot/${externalId}`),
      fetchedAt: now(),
      vin: data.vin,
      damagePrimary: data.condition?.primary_damage,
      damageSecondary: data.condition?.secondary_damage,
      runCondition: data.condition?.run_condition?.label,
      hasKeys: data.condition?.has_key,
      saleDocument: data.sale_document?.name,
      driveType: data.vehicle_specs?.drive_type,
      transmission: data.vehicle_specs?.transmission,
    }
  } catch {
    return null
  }
}

const copartCache = new Map<string, { at: number; vehicle: Vehicle }>()

export async function fetchCopart(url: string): Promise<Vehicle> {
  const externalId = extractListingId(url)
  const cached = copartCache.get(externalId)
  if (cached && Date.now() - cached.at < 15 * 60 * 1000) return { ...cached.vehicle, sourceUrl: url }

  const newRapid = await fetchCopartNewRapid(externalId, url)
  if (newRapid) {
    copartCache.set(externalId, { at: Date.now(), vehicle: newRapid })
    return newRapid
  }

  const solr = await fetchCopartSolr(externalId)
  const vehicle = solr ? { ...solr, sourceUrl: url } : await fetchCopartRapid(externalId, url)
  if (!vehicle) throw new Error("Copart-ის ლოტის მონაცემები ვერ მოიძებნა - შეამოწმეთ ბმული ან სცადეთ ხელახლა")
  copartCache.set(externalId, { at: Date.now(), vehicle })
  return vehicle
}

export async function fetchMyAuto(url: string): Promise<Vehicle> {
  const externalId = extractListingId(url)
  const { status, json } = await wafFetchJson<{ data?: { info?: any } }>(
    `https://api2.myauto.ge/ka/products/${externalId}`,
    BROWSER_HEADERS,
    10000,
  )
  const info = status === 200 ? json?.data?.info : undefined
  if (!info?.car_id) throw new Error("autopapa.ge-ს განცხადება ვერ მოიძებნა - შეამოწმეთ, რომ განცხადება აქტიურია")

  const year = num(info.prod_year, 2020)
  const make = await makeName(Number(info.man_id))
  const model = pick(info.car_model ?? info.model_name, `#${externalId}`)
  const priceUsd = num(info.price_usd, 0)
  const priceGel = num(info.price_value ?? info.price, 0)
  const fuelId = Number(info.fuel_type_id)
  const powertrain: Powertrain = MYAUTO_FUEL[fuelId] ?? (info.hybrid ? "hybrid" : powertrainFromText(info.fuel_type))
  const steering: Steering = info.right_wheel ? "right" : "left"

  return {
    provider: "myauto", externalId, title: `${year} ${make} ${model}`, year, make, model,
    engineCc: normalizeCc(info.engine_volume, 2500),
    powertrain, steering,
    price: priceUsd || priceGel, currency: priceUsd ? "USD" : "GEL",
    mileageKm: num(info.car_run_km, 0) || undefined,
    customsPassed: Boolean(info.customs_passed),
    location: pick(info.location_name ?? info.city_name, "საქართველო"),
    imageUrl: info.photo && info.car_id ? `https://static.my.ge/myauto/photos/${info.photo}/large/${info.car_id}_1.jpg` : undefined,
    sourceUrl: url, fetchedAt: now(),
    vin: info.vin,
    damagePrimary: info.primary_damage_type === 0 ? "No damage" : undefined,
    runCondition: "Run and Drive",
    hasKeys: true,
    driveType: info.drive_type_id === 2 ? "RWD" : info.drive_type_id === 1 ? "AWD" : "FWD",
    transmission: info.gear_type_id === 2 ? "Automatic" : "Manual",
    description: info.car_desc,
  }
}
