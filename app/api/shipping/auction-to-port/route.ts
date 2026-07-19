import { NextResponse } from "next/server"
import { hasRapidNewKey, rapidNewFetchJson } from "@/lib/rapidapi"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lotNumber = searchParams.get("lot_number")
  const vin = searchParams.get("vin")
  const slugVin = searchParams.get("slug_vin")

  if (!hasRapidNewKey()) return NextResponse.json({ error: "API credentials not configured" }, { status: 500 })

  const queryParams = new URLSearchParams()
  if (lotNumber) queryParams.set("lot_number", lotNumber)
  if (vin) queryParams.set("vin", vin)
  if (slugVin) queryParams.set("slug_vin", slugVin)

  const { status, json } = await rapidNewFetchJson(
    `/shipping/auction-to-port?${queryParams.toString()}`,
    {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
      "Accept": "application/json",
    },
    12000,
  )
  return NextResponse.json(json || { error: "Failed to fetch shipping rates" }, { status: status || 500 })
}
