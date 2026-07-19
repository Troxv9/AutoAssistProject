import { NextResponse } from "next/server"
import { syncChatSession } from "@/lib/history"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const result = await syncChatSession(body)
  if ("error" in result) {
    const status = result.error === "unauthorized" ? 401 : result.error === "invalid_input" ? 400 : 500
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json({ ok: true })
}
