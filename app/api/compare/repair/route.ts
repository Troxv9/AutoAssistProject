import { NextResponse } from "next/server"
import { completeStructured } from "@/lib/ai/complete"
import { findMypartsPart } from "@/lib/myparts"

export const runtime = "nodejs"
export const maxDuration = 120

const MAX_PARTS = 5

// Fixed myparts.ge listing for key making / programming (24/7 service)
const KEY_SERVICE_URL = "https://myparts.ge/ka/servicesList/s-12875572?pr_type_id=2"

type KeyService = { nameKa: string; descriptionKa: string; url: string }

const KEY_SERVICE: KeyService = {
  nameKa: "გასაღების დამზადება და პროგრამირება",
  descriptionKa:
    "ავტომობილს გასაღები არ ახლავს. საჭიროა ჩიპიანი გასაღების დამზადება და კომპიუტერული პროგრამირება ავტორიზებულ სერვისში.",
  url: KEY_SERVICE_URL,
}

// AI is asked to list key programming as a part; we surface it as a dedicated
// service instead, so filter any key-related entries out of the parts list.
const isKeyPart = (text: string) => /გასაღ|იმობილაიზ|immobil|\bkey(s)?\b/i.test(text)

const REPAIR_SCHEMA = {
  type: "OBJECT",
  properties: {
    needsRepair: { type: "BOOLEAN" },
    summaryKa: { type: "STRING" },
    cautionsKa: { type: "STRING" },
    parts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          nameKa: { type: "STRING" },
          keyword: { type: "STRING" },
          severity: { type: "STRING", enum: ["minor", "moderate", "severe"] },
          qty: { type: "INTEGER" },
          note: { type: "STRING" },
        },
        required: ["nameKa", "keyword", "severity", "qty", "note"],
      },
    },
    laborEstimateGel: {
      type: "OBJECT",
      properties: { min: { type: "INTEGER" }, max: { type: "INTEGER" } },
      required: ["min", "max"],
    },
  },
  required: ["needsRepair", "summaryKa", "cautionsKa", "parts", "laborEstimateGel"],
}

type AiPart = { nameKa: string; keyword: string; severity: "minor" | "moderate" | "severe"; qty: number; note: string }
type AiRepair = {
  needsRepair: boolean
  summaryKa: string
  cautionsKa: string
  parts: AiPart[]
  laborEstimateGel: { min: number; max: number }
}

const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "")
const toInt = (v: unknown, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback
}

function normalizePart(raw: any): AiPart | null {
  const nameKa = clean(raw?.nameKa ?? raw?.name ?? raw?.title ?? raw?.part ?? "")
  const keyword = clean(raw?.keyword ?? raw?.query ?? raw?.searchTerm ?? nameKa)
  if (!nameKa && !keyword) return null
  const sev = clean(raw?.severity).toLowerCase()
  const severity = sev === "minor" || sev === "severe" ? sev : "moderate"
  return {
    nameKa: nameKa || keyword,
    keyword: keyword || nameKa,
    severity: severity as AiPart["severity"],
    qty: toInt(raw?.qty, 1),
    note: clean(raw?.note ?? raw?.reason ?? ""),
  }
}

function normalizeLabor(raw: any): { min: number; max: number } {
  const l = raw ?? {}
  const min = toInt(l.min ?? l.from ?? l.low ?? (typeof l === "number" ? l : 0), 0)
  const max = toInt(l.max ?? l.to ?? l.high ?? min, min)
  return { min, max: Math.max(min, max) }
}

export async function POST(request: Request) {
  let locale: "en" | "ka" = "ka"
  try {
    const body = await request.json().catch(() => null)
    const copart = body?.copart
    locale = body?.locale === "en" ? "en" : "ka"

    if (!copart || !copart.make) {
      return NextResponse.json({ error: locale === "en" ? "Insufficient data for repair estimate" : "არასაკმარისი მონაცემები რემონტის შეფასებისთვის" }, { status: 400 })
    }

    const make = clean(copart.make)
    const model = clean(copart.model)
    const year = copart.year
    const primary = clean(copart.damagePrimary)
    const secondary = clean(copart.damageSecondary)
    const hasKeys = copart.hasKeys
    const runCondition = clean(copart.runCondition)

    const keyService: KeyService | null = hasKeys === false ? (locale === "en" ? {
      nameKa: "Key Making & Programming",
      descriptionKa: "The vehicle has no keys. Making a chip key and computer programming in an authorized service is required.",
      url: KEY_SERVICE_URL,
    } : KEY_SERVICE) : null

    const baseEstimate = {
      cautionsKa: "",
      currency: "GEL",
      parts: [] as unknown[],
      partsSubtotalGel: 0,
      pricedCount: 0,
      totalParts: 0,
      laborEstimateGel: { min: 0, max: 0 },
      totalMinGel: 0,
      totalMaxGel: 0,
      keyService,
      generatedAt: new Date().toISOString(),
    }

    if (!primary && !secondary) {
      return NextResponse.json({
        estimate: {
          ...baseEstimate,
          needsRepair: false,
          dataAvailable: false,
          summaryKa: locale === "en"
            ? "We could not find damage details for this lot, so the repair estimate could not be prepared. Try again later or inspect the lot on Copart/IAAI."
            : "ამ ლოტისთვის დაზიანების დეტალები ვერ მოვიძიეთ, ამიტომ სარემონტო შეფასება ვერ მომზადდა. სცადეთ მოგვიანებით ან შეამოწმეთ ლოტი Copart/IAAI-ზე.",
        },
      })
    }

    const explicitlyClean = /^(no damage|none|normal wear)\.?$/i.test(primary) && !secondary
    if (explicitlyClean) {
      return NextResponse.json({
        estimate: {
          ...baseEstimate,
          needsRepair: false,
          dataAvailable: true,
          summaryKa: locale === "en"
            ? "This vehicle has no major damage listed. No significant repair costs are expected."
            : "აღნიშნულ ავტომობილს მნიშვნელოვანი დაზიანება არ აქვს მითითებული. სავარაუდოდ, დიდი სარემონტო ხარჯი არ იქნება საჭირო.",
        },
      })
    }

    const systemPrompt = locale === "en" ? `
You are a professional mechanic and auto parts expert. Given the damaged vehicle data from a US auction (Copart/IAAI), quickly list the key auto parts that need replacement due to this damage.

CRITICAL RULES:
1. Return ONLY valid JSON with EXACTLY these keys: needsRepair, summaryKa, cautionsKa, parts, laborEstimateGel.
2. Under "summaryKa" and "cautionsKa", write your text in ENGLISH.
3. parts - array of max ${MAX_PARTS} most important parts. In each object:
   - "nameKa": The specific name of the part in ENGLISH (e.g., "Front Bumper", "Right Headlight", "Hood", "Radiator"). Never leave empty.
   - "keyword": Search term for the part in GEORGIAN (e.g. "ბამპერი", "ფარი", "კაპოტი", "რადიატორი"). This keyword will be used to search myparts.ge, so it MUST be in Georgian language!
   - "severity": "minor" | "moderate" | "severe".
   - "qty": integer (usually 1).
   - "note": 1 short sentence in ENGLISH explaining why it's needed.
4. If the vehicle has no keys (hasKeys=false), add key programming as one of the parts/notes (in ENGLISH).
5. laborEstimateGel: { "min": integer, "max": integer } - total labor cost in GEL (Georgian Lari).
6. Do not invent part prices.
7. Be fast and concise. Do not list minor clips/screws.
8. If no damage or negligible: needsRepair=false, parts=[].
`.trim() : `
შენ ხარ ავტოტექნიკოსი და ავტონაწილების ექსპერტი საქართველოში. მოცემულია აშშ-ის აუქციონიდან (Copart/IAAI) დაზიანებული ავტომობილის მონაცემები. სწრაფად და კონკრეტულად დაასახელე ის ავტონაწილები, რომლებიც ამ დაზიანების გამო შესაცვლელი იქნება.

მკაცრი წესები:
1. დააბრუნე მხოლოდ ვალიდური JSON. ზუსტად ეს გასაღებები: needsRepair, summaryKa, cautionsKa, parts, laborEstimateGel.
2. parts - მასივი, მაქსიმუმ ${MAX_PARTS} ყველაზე მნიშვნელოვანი ნაწილი. თითო ობიექტში:
   - "nameKa": ნაწილის კონკრეტული ქართული სახელი (მაგ. "წინა ბამპერი", "მარჯვენა წინა ფარი", "კაპოტი", "წყლის რადიატორი"). არასდროს დატოვო ცარიელი.
   - "keyword": მოკლე ქართული საძიებო ფრაზა myparts.ge-სთვის (მაგ. "წინა ბამპერი", "ფარი", "კაპოტი", "რადიატორი"). არ ჩასვა მარკა/მოდელი.
   - "severity": "minor" | "moderate" | "severe".
   - "qty": მთელი რიცხვი (ჩვეულებრივ 1).
   - "note": 1 მოკლე წინადადება - რატომ არის საჭირო.
3. დაზიანების ზონის ლოგიკა: "Front end" → წინა ბამპერი, კაპოტი, ფარები, წყლის/კონდიციონერის რადიატორი, წინა ფრთა, გისოსი; "Rear end" → უკანა ბამპერი, უკანა ფარები, საბარგულის კარი; "Side" → კარები, ფრთა, გვერდითი სარკე. აირჩიე მხოლოდ ზონასთან დაკავშირებული, ლოგიკური ნაწილები.
4. თუ გასაღები არ აქვს (hasKeys=false), ერთ-ერთ ნაწილად/შენიშვნად დაამატე გასაღების დამზადება/პროგრამირება.
5. laborEstimateGel: { "min": მთელი რიცხვი, "max": მთელი რიცხვი } - მუშახელის ჯამური ღირებულება ლარებში.
6. არ მოიგონო ნაწილების ფასები - ფასს ცალკე მოვიძიებთ myparts.ge-ზე.
7. იყავი სწრაფი და ლაკონური. ნუ ჩამოთვლი უმნიშვნელო წვრილმანებს.
8. თუ დაზიანება არ არის ან უმნიშვნელოა: needsRepair=false, parts=[].
`.trim()

    const userPrompt = locale === "en" ? `
Vehicle: ${year || ""} ${make} ${model}
Primary Damage: ${primary || "unknown"}
Secondary Damage: ${secondary || "none"}
Condition: ${runCondition || "unknown"}
Keys: ${hasKeys === false ? "no keys" : hasKeys === true ? "has keys" : "unknown"}
`.trim() : `
ავტომობილი: ${year || ""} ${make} ${model}
ძირითადი დაზიანება: ${primary || "უცნობია"}
მეორადი დაზიანება: ${secondary || "არ არის"}
მდგომარეობა: ${runCondition || "უცნობია"}
გასაღები: ${hasKeys === false ? "არ აქვს" : hasKeys === true ? "აქვს" : "უცნობია"}
`.trim()

    const ai = await completeStructured<AiRepair>({
      systemPrompt,
      userPrompt,
      responseSchema: REPAIR_SCHEMA,
      temperature: 0.4,
      maxOutputTokens: 2048,
      preferMimo: true,
      mimoWebSearch: true,
    })

    const parts = (Array.isArray(ai.parts) ? ai.parts : [])
      .map(normalizePart)
      .filter((p): p is AiPart => p !== null)
      .filter((p) => !isKeyPart(`${p.nameKa} ${p.keyword}`))
      .slice(0, MAX_PARTS)

    const emptyPart = {
      prices: [] as number[], median: null, url: null, image: null, title: null, seller: null, category: null, partNumber: null,
    }

    const pricedParts = await Promise.all(
      parts.map(async (part) => {
        const carQuery = [part.keyword, make, model].filter(Boolean).join(" ")
        const result = await findMypartsPart(carQuery, part.keyword).catch(() => emptyPart)
        return {
          ...part,
          priceGel: result.median,
          priceCount: result.prices.length,
          sourceUrl: result.url,
          imageUrl: result.image,
          matchedTitle: result.title,
          matchedCategory: result.category,
          seller: result.seller,
          partNumber: result.partNumber,
        }
      })
    )

    const partsSubtotalGel = pricedParts.reduce(
      (sum, p) => sum + (p.priceGel != null ? p.priceGel * p.qty : 0),
      0
    )
    const pricedCount = pricedParts.filter((p) => p.priceGel != null).length
    const labor = normalizeLabor(ai.laborEstimateGel)

    return NextResponse.json({
      estimate: {
        needsRepair: ai.needsRepair !== false,
        dataAvailable: true,
        summaryKa: ai.summaryKa ?? "",
        cautionsKa: ai.cautionsKa ?? "",
        currency: "GEL",
        parts: pricedParts,
        partsSubtotalGel,
        pricedCount,
        totalParts: pricedParts.length,
        laborEstimateGel: labor,
        totalMinGel: partsSubtotalGel + (labor.min || 0),
        totalMaxGel: partsSubtotalGel + (labor.max || 0),
        keyService,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Repair estimate route error:", error)
    const msg = error instanceof Error ? error.message : "უცნობი შეცდომა"
    return NextResponse.json({ error: locale === "en" ? `Server error during estimate: ${msg}` : `სერვერული შეცდომა შეფასებისას: ${msg}` }, { status: 502 })
  }
}
