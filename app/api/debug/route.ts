import { NextResponse } from "next/server"
import { wafFetchJson } from "@/lib/waf-fetch"
import { rapidNewFetchJson } from "@/lib/rapidapi"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// TEMPORARY DIAGNOSTIC ENDPOINT — remove after debugging.
// Reports whether env vars are loaded (never the secret values) and whether
// the external data sources are reachable from this machine.
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
  ]
  const env: Record<string, { present: boolean; length: number }> = {}
  for (const name of envVars) env[name] = envPresence(name)

  // Live probe: MyAuto (no key needed — tests Cloudflare/WAF reachability).
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

  // Live probe: RapidAPI (tests the RAPIDAPI_NEW_KEY value).
  let rapid: { status: number; snippet: string }
  try {
    const r = await rapidNewFetchJson<unknown>("/vehicles/40917615", {}, 12000)
    rapid = { status: r.status, snippet: JSON.stringify(r.json ?? "").slice(0, 120) }
  } catch (e) {
    rapid = { status: -1, snippet: e instanceof Error ? e.message : "error" }
  }

  // Live probe: Supabase via Node's native fetch (exactly what supabase-js uses).
  // If this fails while curl-based probes succeed, Node's TLS/fetch is being
  // blocked (commonly by antivirus/firewall HTTPS inspection).
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
    // Surface the underlying cause (e.g. certificate errors) which is the tell-tale sign.
    const err = e as { message?: string; cause?: { code?: string; message?: string } }
    supabaseFetch = {
      ok: false,
      status: -1,
      error: `${err?.message ?? "fetch failed"}${err?.cause?.code ? ` | cause: ${err.cause.code}` : ""}${err?.cause?.message ? ` | ${err.cause.message}` : ""}`,
    }
  }

  return NextResponse.json({
    note: "Temporary diagnostic. present=true means the .env var is loaded. Secret values are never shown.",
    nodeVersion: process.version,
    env,
    liveProbes: { myauto, rapid, supabaseFetch },
  })
}
