import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { listChatSessions, listComparisons } from "@/lib/history"
import { DashboardPage } from "@/components/dashboard/dashboard-page"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "ჩემი ისტორია | Auto Assist",
  robots: { index: false, follow: false },
}

export default async function DashboardRoutePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/sign-in?redirect=/dashboard")

  const [comparisons, sessions] = await Promise.all([listComparisons(), listChatSessions()])

  const totalSavings = comparisons.reduce((sum, row) => {
    const diff = row.difference_gel as number | null
    return typeof diff === "number" && diff > 0 ? sum + diff : sum
  }, 0)

  return (
    <DashboardPage
      user={user}
      stats={{
        comparisonCount: comparisons.length,
        chatCount: sessions.length,
        totalSavings: totalSavings > 0 ? totalSavings : null,
      }}
      comparisons={comparisons.map((c) => ({
        id: c.id as string,
        copartTitle: (c.copart_title as string) ?? null,
        myautoTitle: (c.myauto_title as string) ?? null,
        importTotalGel: (c.import_total_gel as number) ?? null,
        localTotalGel: (c.local_total_gel as number) ?? null,
        differenceGel: (c.difference_gel as number) ?? null,
        createdAt: c.created_at as string,
      }))}
      chats={sessions.map((s) => {
        const linked = (s as { comparisons?: { copart_title?: string; myauto_title?: string } }).comparisons
        return {
          id: s.id as string,
          title: (s.title as string) ?? null,
          context: linked
            ? [linked.copart_title, linked.myauto_title].filter(Boolean).join(" ↔ ") || null
            : null,
          updatedAt: s.updated_at as string,
        }
      })}
    />
  )
}
