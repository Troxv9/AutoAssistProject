import { NextResponse } from "next/server"
import { execFile } from "node:child_process"
import { wafFetchJson } from "@/lib/waf-fetch"
import { rapidNewFetchJson } from "@/lib/rapidapi"
import { firecrawlScrapeHtml } from "@/lib/firecrawl"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"


function hasBinary(bin: string): Promise<boolean> {
  return new Promise((resolve) => {
    execFile(bin, ["--version"], (error) => resolve(!error))
  })
}


export async function GET() {
  const envPresence = (name: string) => {
    const v = process.env[name]
    return { present: typeof v === "string" && v.trim().length > 0, length: (v ?? "").trim().length }
  }

  const envVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "RAPIDAPI_KEY",
    "RAPIDAPI_HOST",
    "RAPIDAPI_NEW_KEY",
    "RAPIDAPI_NEW_HOST",
    "MIMO_API_KEY",
    "GEMINI_API_KEY",
    "BRAVE_API_KEY",
    "FIRECRAWL_API_KEY",
  ]
  const env: Record<string, { present: boolean; length: number }> = {}
  for (const name of envVars) env[name] = envPresence(name)

  let myauto: { status: number; hasData: boolean; snippet: string }
  try {
    const r = await wafFetchJson<{ data?: { info?: { car_id?: unknown } } }>(
      "https://api2.myauto.ge/ka/products/117876543",
      {
        accept: "application/json",
        "accept-language": "ka,en;q=0.8",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
      12000,
    )
    myauto = {
      status: r.status,
      hasData: !!r.json?.data?.info?.car_id,
      snippet: JSON.stringify(r.json ?? "").slice(0, 120),
    }
  } catch (e) {
    myauto = { status: -1, hasData: false, snippet: e instanceof Error ? e.message : "error" }
  }


  let rapid: { status: number; snippet: string }
  try {
    const r = await rapidNewFetchJson<unknown>("/vehicles/40917615", {}, 12000)
    rapid = { status: r.status, snippet: JSON.stringify(r.json ?? "").slice(0, 120) }
  } catch (e) {
    rapid = { status: -1, snippet: e instanceof Error ? e.message : "error" }
  }


  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  let supabaseFetch: { ok: boolean; status: number; error: string | null }
  try {
    const r = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabaseKey },
      signal: AbortSignal.timeout(12000),
    })
    supabaseFetch = { ok: r.ok, status: r.status, error: null }
  } catch (e) {
  
    const err = e as { message?: string; cause?: { code?: string; message?: string } }
    supabaseFetch = {
      ok: false,
      status: -1,
      error: `${err?.message ?? "fetch failed"}${err?.cause?.code ? ` | cause: ${err.cause.code}` : ""}${err?.cause?.message ? ` | ${err.cause.message}` : ""}`,
    }
  }

  let autopapa: {
    status: number
    length: number
    hasCatalog: boolean
    hasPhoto: boolean
    server: string | null
    cfRay: string | null
    error: string | null
  }
  try {
    const r = await fetch("https://autopapa.ge/en/search/toyota/corolla", {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en,ka;q=0.8",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(14000),
    })
    const text = await r.text().catch(() => "")
    autopapa = {
      status: r.status,
      length: text.length,
      hasCatalog: text.includes("boxCatalog2"),
      hasPhoto: text.includes("/system/car/photos/"),
      server: r.headers.get("server"),
      cfRay: r.headers.get("cf-ray"),
      error: null,
    }
  } catch (e) {
    autopapa = {
      status: -1,
      length: 0,
      hasCatalog: false,
      hasPhoto: false,
      server: null,
      cfRay: null,
      error: e instanceof Error ? e.message : "error",
    }
  }

  let firecrawl: {
    tookMs: number
    gotHtml: boolean
    length: number
    hasCatalog: boolean
    hasPhoto: boolean
  }
  {
    const t = Date.now()
    const html = await firecrawlScrapeHtml("https://autopapa.ge/en/search/toyota/corolla", 25000)
    firecrawl = {
      tookMs: Date.now() - t,
      gotHtml: !!html,
      length: html?.length ?? 0,
      hasCatalog: !!html && html.includes("boxCatalog2"),
      hasPhoto: !!html && html.includes("/system/car/photos/"),
    }
  }

  const binaries = {
    curl: await hasBinary("curl"),
    python: await hasBinary("python"),
    python3: await hasBinary("python3"),
  }

  return NextResponse.json({
    note: "Temporary diagnostic. present=true means the .env var is loaded. Secret values are never shown.",
    nodeVersion: process.version,
    env,
    binaries,
    liveProbes: { myauto, rapid, supabaseFetch, autopapa, firecrawl },
  })
}
