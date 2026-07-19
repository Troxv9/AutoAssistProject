
const API_URL = "https://api.myparts.ge/api/ka/products/get"
const GEL_CURRENCY_ID = 3

const HEADERS = {
  "content-type": "application/json",
  accept: "application/json",
  origin: "https://www.myparts.ge",
  referer: "https://www.myparts.ge/",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
}

type MpProduct = {
  product_id: number
  cat_id: number
  price_value: string
  currency_id: number
  title?: string | null
  part_number?: string | null
  photos?: Array<{ large?: string; thumbs?: string }> | null
  shop?: { title?: string | null } | null
}

export type MypartsPart = {
  prices: number[]
  median: number | null
  url: string | null
  image: string | null
  title: string | null
  seller: string | null
  category: string | null
  partNumber: string | null
}

const EMPTY: MypartsPart = {
  prices: [], median: null, url: null, image: null, title: null, seller: null, category: null, partNumber: null,
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

async function searchPage(keyword: string, page: number): Promise<MpProduct[]> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ keyword, Page: page }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    })
    if (!res.ok) return []
    const json = await res.json()
    const products = json?.data?.products
    return Array.isArray(products) ? (products as MpProduct[]) : []
  } catch {
    return []
  }
}

async function pricedProducts(keyword: string, pages = 2): Promise<MpProduct[]> {
  const batches = await Promise.all(Array.from({ length: pages }, (_, i) => searchPage(keyword, i + 1)))
  const seen = new Set<number>()
  const out: MpProduct[] = []
  for (const p of batches.flat()) {
    if (seen.has(p.product_id)) continue
    seen.add(p.product_id)
    const price = Number(p.price_value)
    if (p.currency_id === GEL_CURRENCY_ID && Number.isFinite(price) && price > 0) out.push(p)
  }
  return out
}

function toPart(products: MpProduct[]): MypartsPart {
  if (products.length === 0) return EMPTY
  const prices = products.map((p) => Math.round(Number(p.price_value)))
  const med = median(prices) as number
  const rep = products.reduce((best, p) =>
    Math.abs(Math.round(Number(p.price_value)) - med) < Math.abs(Math.round(Number(best.price_value)) - med) ? p : best
  )
  const photo = rep.photos?.[0]
  return {
    prices,
    median: med,
    url: `https://www.myparts.ge/ka/pr/${rep.product_id}`,
    image: photo?.thumbs ?? photo?.large ?? null,
    title: rep.title ?? null,
    seller: rep.shop?.title ?? null,
    category: null,
    partNumber: rep.part_number ?? null,
  }
}


export async function findMypartsPart(carQuery: string, partKeyword: string): Promise<MypartsPart> {
  
  let products = await pricedProducts(carQuery, 2)
  
  if (products.length < 2 && partKeyword && partKeyword !== carQuery) {
    const broad = await pricedProducts(partKeyword, 2)
    if (broad.length > products.length) products = broad
  }
  return toPart(products)
}
