import { NextResponse } from "next/server"
import { z } from "zod"
import { braveSearch } from "@/lib/brave-search"

export const runtime = "nodejs"

const schema = z.object({
  make: z.string().min(1).max(40),
  model: z.string().min(1).max(60),
  year: z.number().int().min(1980).max(2030),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "მოთხოვნის ფორმატი არასწორია" }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "შეამოწმეთ მონაცემები" }, { status: 400 })
  const { make, model, year } = parsed.data
  const results = await braveSearch(`${make} ${model} ${year} ფასი საქართველოში myauto`, 5)
  return NextResponse.json({ results, available: results.length > 0 })
}
