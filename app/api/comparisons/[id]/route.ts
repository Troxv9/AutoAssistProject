import { NextResponse } from "next/server"
import { deleteComparison, saveComparisonFields } from "@/lib/history"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  const result = await saveComparisonFields(id, body)
  if ("error" in result) {
    const status = result.error === "unauthorized" ? 401 : result.error === "invalid_input" ? 400 : 500
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await deleteComparison(id)
  if ("error" in result) {
    const status = result.error === "unauthorized" ? 401 : 500
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json({ ok: true })
}
