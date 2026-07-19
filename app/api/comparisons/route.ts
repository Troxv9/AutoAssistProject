import { NextResponse } from "next/server"
import { listComparisons, saveComparison } from "@/lib/history"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const result = await saveComparison(body)

  if ("error" in result) {
    const status = result.error === "unauthorized" ? 401 : result.error === "invalid_input" ? 400 : 500
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json({ id: result.id })
}

export async function GET() {
  const items = await listComparisons()
  return NextResponse.json({ items })
}
