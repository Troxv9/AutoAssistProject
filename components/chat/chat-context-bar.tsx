"use client"

import { Badge } from "@/components/ui/badge"
import type { ComparisonResult } from "@/lib/vehicles"
import { useTranslation } from "@/lib/locale-context"

type ChatContextBarProps = {
  comparison: ComparisonResult | null
}

function truncateTitle(title: string, max = 28) {
  if (title.length <= max) return title
  return `${title.slice(0, max - 1)}…`
}

export function ChatContextBar({ comparison }: ChatContextBarProps) {
  const { t, formatGel } = useTranslation()

  if (!comparison) {
    return (
      <div className="shrink-0 border-b border-border/60 bg-background/70 px-3.5 py-2 sm:px-4 sm:py-2.5">
        <p className="text-balance text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
          {t("chat.emptyContext")}
        </p>
      </div>
    )
  }

  const verdictLabel =
    comparison.verdict === "import"
      ? t("chat.verdictImport")
      : comparison.verdict === "local"
        ? t("chat.verdictLocal")
        : t("chat.verdictEqual")

  const verdictVariant =
    comparison.verdict === "import"
      ? "destructive"
      : comparison.verdict === "local"
        ? "default"
        : "secondary"

  return (
    <div className="shrink-0 border-b border-border/60 bg-background/70 px-3.5 py-2 sm:px-4 sm:py-2.5">
      <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground sm:gap-2 sm:text-xs">
        <span className="inline-block size-1.5 rounded-full bg-primary" aria-hidden="true" />
        <span className="truncate font-medium text-foreground" title={comparison.copart.title}>
          {truncateTitle(comparison.copart.title)}
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          vs
        </span>
        <span className="truncate font-medium text-foreground" title={comparison.myauto.title}>
          {truncateTitle(comparison.myauto.title)}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge variant={verdictVariant} className="px-2 py-0.5 text-[10px] uppercase">
          {verdictLabel}
        </Badge>
        <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
          {formatGel(comparison.differenceGel)}
        </span>
      </div>
    </div>
  )
}
