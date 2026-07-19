import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getComparison } from "@/lib/history"
import { ComparisonReport } from "@/components/comparison/comparison-report"
import type { ComparisonResult } from "@/lib/vehicles"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "შედარების შედეგი | Auto Assist",
  robots: { index: false, follow: false },
}

export default async function ComparisonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect(`/sign-in?redirect=/comparison/${id}`)

  const row = await getComparison(id)
  if (!row) notFound()

  const result = row.snapshot as unknown as ComparisonResult

  return (
    <ComparisonReport
      result={result}
      comparisonId={row.id as string}
      initialAnalysis={row.ai_analysis ?? undefined}
    />
  )
}
