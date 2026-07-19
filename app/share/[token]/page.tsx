import { createHash } from "node:crypto"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { ComparisonReport } from "@/components/comparison/comparison-report"
import type { RepairEstimateData } from "@/components/comparison/repair-estimate"
import { createServerSupabase } from "@/lib/supabase/server"
import { getLocale } from "@/lib/get-locale"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"
import type { ComparisonResult } from "@/lib/vehicles"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "პირადი შედარება | Auto Assist",
  robots: { index: false, follow: false },
}

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!/^[A-Za-z0-9_-]{32}$/.test(token)) notFound()

  const hash = createHash("sha256").update(token).digest("hex")
  const supabase = createServerSupabase()
  if (!supabase) notFound()

  const { data } = await supabase
    .from("shared_comparisons")
    .select("snapshot,expires_at,created_at")
    .eq("token_hash", hash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle()

  if (!data) notFound()

  const locale = await getLocale()
  const raw = data.snapshot as any

  // schema_version 2: { result, analysis, repair }. Fallback to legacy bare result.
  const result = (raw?.result ?? raw) as ComparisonResult
  const analysis = raw?.analysis ?? undefined
  const repair = (raw?.repair ?? undefined) as RepairEstimateData | undefined

  const createdAt = new Date(data.created_at).toLocaleString(locale === "ka" ? "ka-GE" : "en-US")

  return (
    <div>
      <div className="mx-auto max-w-7xl px-5 pt-8 lg:px-8">
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Badge variant="secondary">{t("report.comparisonReportDesc", locale)}</Badge>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("report.shareCreatedAt", locale)} {createdAt}
            </p>
          </div>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "h-10 shrink-0 rounded-xl px-5")}
          >
            {t("report.newComparison", locale)}
          </Link>
        </div>
      </div>

      <ComparisonReport
        result={result}
        initialAnalysis={analysis}
        initialRepair={repair}
        isAnonymous
        frozen
      />

      <p className="mx-auto max-w-7xl px-5 pb-12 text-center text-xs leading-relaxed text-muted-foreground lg:px-8">
        {t("report.shareDisclaimer", locale)}
      </p>
    </div>
  )
}
