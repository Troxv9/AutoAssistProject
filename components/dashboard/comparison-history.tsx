"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftRight, ChevronRight, Loader2, Scale, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ComparisonItem } from "@/components/dashboard/types"
import { HistoryEmptyState } from "@/components/dashboard/history-empty-state"
import { formatDateTimeKa } from "@/lib/format"
import { useTranslation } from "@/lib/locale-context"
import { cn } from "@/lib/utils"

function getVerdict(differenceGel: number | null) {
  if (differenceGel == null || !Number.isFinite(differenceGel)) {
    return { labelKey: null, variant: "secondary" as const, tone: "neutral" as const }
  }
  if (differenceGel > 0) {
    return { labelKey: "dashboard.verdictImportCheaper", variant: "default" as const, tone: "import" as const }
  }
  if (differenceGel < 0) {
    return { labelKey: "dashboard.verdictLocalCheaper", variant: "outline" as const, tone: "local" as const }
  }
  return { labelKey: "dashboard.verdictEqual", variant: "secondary" as const, tone: "neutral" as const }
}

function VehicleSide({
  label,
  title,
  align,
}: {
  label: string
  title: string
  align: "left" | "right"
}) {
  return (
    <div className={cn("min-w-0", align === "right" && "sm:text-right")}>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-[15px]">
        {title || "-"}
      </p>
    </div>
  )
}

function ComparisonCard({
  item,
  deleting,
  onDelete,
}: {
  item: ComparisonItem
  deleting: boolean
  onDelete: () => void
}) {
  const { t, formatGel } = useTranslation()
  const fmtGel = (v: number | null) => (v != null && Number.isFinite(v) ? formatGel(v) : "-")
  const verdict = getVerdict(item.differenceGel)
  const verdictLabel = verdict.labelKey ? t(verdict.labelKey) : "-"
  const savingPositive = typeof item.differenceGel === "number" && item.differenceGel > 0
  const savingNegative = typeof item.differenceGel === "number" && item.differenceGel < 0

  return (
    <li className="calculator-surface group overflow-hidden rounded-2xl border border-foreground/10 shadow-sm transition-all hover:border-primary/25 hover:shadow-[var(--shadow-elevated)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/25 px-4 py-2.5">
        <Badge variant={verdict.variant} className="shrink-0">
          {verdictLabel}
        </Badge>
        <div className="flex min-w-0 items-center gap-1">
          <time
            dateTime={item.createdAt}
            className="truncate text-[11px] text-muted-foreground sm:text-xs"
          >
            {formatDateTimeKa(item.createdAt)}
          </time>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("dashboard.delete")}
            disabled={deleting}
            onClick={onDelete}
            className="size-8 shrink-0 text-muted-foreground opacity-70 transition-opacity hover:text-destructive group-hover:opacity-100"
          >
            {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
          </Button>
        </div>
      </div>

      <Link href={`/comparison/${item.id}`} className="block p-4 transition-colors hover:bg-muted/10 sm:p-5">
        {/* Vehicles */}
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-4">
          <VehicleSide label="Copart" title={item.copartTitle || "-"} align="left" />

          <div className="flex items-center gap-3 sm:flex-col sm:gap-0">
            <div className="h-px flex-1 bg-border/70 sm:hidden" />
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground shadow-sm">
              <ArrowLeftRight className="size-3.5" />
            </span>
            <div className="h-px flex-1 bg-border/70 sm:hidden" />
          </div>

          <VehicleSide label="autopapa.ge" title={item.myautoTitle || "-"} align="right" />
        </div>

        {/* Metrics */}
        <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-background/50">
          <div className="grid grid-cols-3 divide-x divide-border/60">
            <MetricCell
              label={t("dashboard.metricImport")}
              value={fmtGel(item.importTotalGel)}
              active={verdict.tone === "import"}
            />
            <MetricCell
              label={t("dashboard.metricLocal")}
              value={fmtGel(item.localTotalGel)}
              active={verdict.tone === "local"}
            />
            <MetricCell
              label={t("dashboard.metricDifference")}
              value={fmtGel(item.differenceGel)}
              highlight={savingPositive ? "positive" : savingNegative ? "negative" : undefined}
            />
          </div>
        </div>

        <p className="mt-3 flex items-center justify-end gap-1 text-xs font-medium text-primary opacity-80 transition-opacity group-hover:opacity-100">
          {t("dashboard.viewReport")}
          <ChevronRight className="size-3.5" />
        </p>
      </Link>
    </li>
  )
}

function MetricCell({
  label,
  value,
  active,
  highlight,
}: {
  label: string
  value: string
  active?: boolean
  highlight?: "positive" | "negative"
}) {
  return (
    <div
      className={cn(
        "px-2 py-3 text-center sm:px-3 sm:py-3.5",
        active && "bg-primary/5",
        highlight === "positive" && "bg-emerald-500/8",
        highlight === "negative" && "bg-amber-500/8"
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-sm font-bold tabular-nums tracking-tight sm:text-base",
          highlight === "positive" && "text-emerald-600 dark:text-emerald-400",
          highlight === "negative" && "text-amber-700 dark:text-amber-400",
          !highlight && "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  )
}

export function ComparisonHistory({ items }: { items: ComparisonItem[] }) {
  const { t } = useTranslation()
  const router = useRouter()
  const [list, setList] = useState(items)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  async function handleDelete(id: string) {
    if (!window.confirm(t("dashboard.confirmDeleteComparison"))) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/comparisons/${id}`, { method: "DELETE" })
      if (response.ok) {
        setList((prev) => prev.filter((c) => c.id !== id))
        startTransition(() => router.refresh())
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (list.length === 0) {
    return (
      <HistoryEmptyState
        icon={Scale}
        title={t("dashboard.emptyComparisonsTitle")}
        description={t("dashboard.emptyComparisonsDesc")}
        ctaLabel={t("dashboard.newComparison")}
        ctaHref="/#compare"
      />
    )
  }

  return (
    <ul className="flex flex-col gap-3 sm:gap-4">
      {list.map((c) => (
        <ComparisonCard
          key={c.id}
          item={c}
          deleting={deletingId === c.id}
          onDelete={() => handleDelete(c.id)}
        />
      ))}
    </ul>
  )
}
