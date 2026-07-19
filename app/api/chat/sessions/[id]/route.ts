import { NextResponse } from "next/server"
import { deleteChatSession } from "@/lib/history"

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await deleteChatSession(id)
  if ("error" in result) {
    const status = result.error === "unauthorized" ? 401 : 500
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json({ ok: true })
}
