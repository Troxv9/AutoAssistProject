import { NextResponse } from "next/server"
import { hasRapidNewKey, rapidNewFetchJson } from "@/lib/rapidapi"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const { identifier } = await params
  if (!hasRapidNewKey()) return NextResponse.json({ error: "API credentials not configured" }, { status: 500 })

  const { status, json } = await rapidNewFetchJson(
    `/vehicles/${identifier}/shipping`,
    {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
      "Accept": "application/json",
    },
    12000,
  )
  return NextResponse.json(json || { error: "Failed to fetch vehicle shipping" }, { status: status || 500 })
}
