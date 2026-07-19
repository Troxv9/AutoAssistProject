import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import type { ComparisonResult } from "@/lib/vehicles"

export async function getUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) return null
  return (data.claims.sub as string) ?? null
}


const numeric = z.number().finite().nullable().optional()

const saveComparisonSchema = z.object({
  copartUrl: z.string().max(2048).nullable().optional(),
  myautoUrl: z.string().max(2048).nullable().optional(),
  snapshot: z.record(z.string(), z.unknown()),
})

export type SaveComparisonInput = z.input<typeof saveComparisonSchema>

export async function saveComparison(input: unknown) {
  const parsed = saveComparisonSchema.safeParse(input)
  if (!parsed.success) return { error: "invalid_input" as const }

  const userId = await getUserId()
  if (!userId) return { error: "unauthorized" as const }

  const snapshot = parsed.data.snapshot as unknown as ComparisonResult
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("comparisons")
    .insert({
      user_id: userId,
      copart_url: parsed.data.copartUrl ?? null,
      myauto_url: parsed.data.myautoUrl ?? null,
      copart_title: snapshot?.copart?.title ?? null,
      myauto_title: snapshot?.myauto?.title ?? null,
      import_total_gel: numeric.safeParse(snapshot?.importTotalGel).success ? snapshot.importTotalGel : null,
      local_total_gel: numeric.safeParse(snapshot?.localTotalGel).success ? snapshot.localTotalGel : null,
      difference_gel: numeric.safeParse(snapshot?.differenceGel).success ? snapshot.differenceGel : null,
      snapshot: parsed.data.snapshot,
    })
    .select("id")
    .single()

  if (error) return { error: "db_error" as const }
  return { id: data.id as string }
}

export async function getComparison(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("comparisons")
    .select("id, snapshot, ai_analysis, created_at")
    .eq("id", id)
    .maybeSingle()
  if (error || !data) return null
  return data
}

const patchSchema = z.object({
  analysis: z.unknown().optional(),
  repair: z.unknown().optional(),
})

export async function saveComparisonFields(id: string, input: unknown) {
  const parsed = patchSchema.safeParse(input)
  if (!parsed.success) return { error: "invalid_input" as const }

  const update: Record<string, unknown> = {}
  if (parsed.data.analysis !== undefined) update.ai_analysis = parsed.data.analysis
  if (parsed.data.repair !== undefined) update.repair_estimate = parsed.data.repair
  if (Object.keys(update).length === 0) return { error: "invalid_input" as const }

  const userId = await getUserId()
  if (!userId) return { error: "unauthorized" as const }

  const supabase = await createClient()
  const { error } = await supabase.from("comparisons").update(update).eq("id", id)
  if (error) return { error: "db_error" as const }
  return { ok: true as const }
}

export async function listComparisons() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("comparisons")
    .select("id, copart_title, myauto_title, import_total_gel, local_total_gel, difference_gel, created_at")
    .order("created_at", { ascending: false })
    .limit(100)
  if (error) return []
  return data ?? []
}

export async function deleteComparison(id: string) {
  const userId = await getUserId()
  if (!userId) return { error: "unauthorized" as const }
  const supabase = await createClient()
  const { error } = await supabase.from("comparisons").delete().eq("id", id)
  if (error) return { error: "db_error" as const }
  return { ok: true as const }
}


const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(20000),
})

const syncChatSchema = z.object({
  sessionId: z.string().uuid(),
  comparisonId: z.string().uuid().nullable().optional(),
  title: z.string().max(200).nullable().optional(),
  messages: z.array(chatMessageSchema).max(60),
})

export async function syncChatSession(input: unknown) {
  const parsed = syncChatSchema.safeParse(input)
  if (!parsed.success) return { error: "invalid_input" as const }

  const userId = await getUserId()
  if (!userId) return { error: "unauthorized" as const }

  const { sessionId, comparisonId, title, messages } = parsed.data
  const supabase = await createClient()

  const { error: sessionError } = await supabase.from("chat_sessions").upsert(
    {
      id: sessionId,
      user_id: userId,
      comparison_id: comparisonId ?? null,
      title: title ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  )
  if (sessionError) return { error: "db_error" as const }

  await supabase.from("chat_messages").delete().eq("session_id", sessionId)

  if (messages.length > 0) {
    const rows = messages.map((m) => ({
      session_id: sessionId,
      user_id: userId,
      role: m.role,
      content: m.content,
    }))
    const { error: msgError } = await supabase.from("chat_messages").insert(rows)
    if (msgError) return { error: "db_error" as const }
  }

  return { ok: true as const }
}

export async function deleteChatSession(id: string) {
  const userId = await getUserId()
  if (!userId) return { error: "unauthorized" as const }
  const supabase = await createClient()
  const { error } = await supabase.from("chat_sessions").delete().eq("id", id)
  if (error) return { error: "db_error" as const }
  return { ok: true as const }
}

export async function listChatSessions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title, comparison_id, created_at, updated_at, comparisons(copart_title, myauto_title)")
    .order("updated_at", { ascending: false })
    .limit(100)
  if (error) return []
  return data ?? []
}

export async function getChatSession(id: string) {
  const supabase = await createClient()
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id, title, comparison_id, created_at, updated_at")
    .eq("id", id)
    .maybeSingle()
  if (!session) return null

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("session_id", id)
    .order("created_at", { ascending: true })

  return { session, messages: messages ?? [] }
}
