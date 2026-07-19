import { createHash, randomBytes } from "node:crypto"
import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // Accept the frozen share payload { result, analysis?, repair? }.
    // Fall back to a bare ComparisonResult for backward compatibility.
    const result = payload?.result ?? payload
    const analysis = payload?.analysis ?? null
    const repair = payload?.repair ?? null

    const snapshot = { result, analysis, repair }
    const serialized = JSON.stringify(snapshot)
    if (serialized.length > 400000) {
      return NextResponse.json({ error: "Report too large" }, { status: 413 })
    }
    if (!result?.calculatedAt || result?.importTotalGel == null) {
      return NextResponse.json({ error: "Invalid report" }, { status: 400 })
    }

    const token = randomBytes(24).toString("base64url")
    const token_hash = createHash("sha256").update(token).digest("hex")
    const expires_at = new Date(Date.now() + 30 * 86400000).toISOString()

    const supabase = createServerSupabase()
    if (!supabase) throw new Error("storage")

    const { error } = await supabase
      .from("shared_comparisons")
      .insert({ token_hash, snapshot, schema_version: 2, expires_at })
    if (error) throw error

    return NextResponse.json({ url: `/share/${token}`, expiresAt: expires_at })
  } catch {
    return NextResponse.json({ error: "Could not create private link" }, { status: 500 })
  }
}
