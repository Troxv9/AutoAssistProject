"use client"

import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/locale-context"

export type DashboardTab = "comparisons" | "chats"

type DashboardTabsProps = {
  active: DashboardTab
  comparisonCount: number
  chatCount: number
  onChange: (tab: DashboardTab) => void
}

export function DashboardTabs({ active, comparisonCount, chatCount, onChange }: DashboardTabsProps) {
  const { t } = useTranslation()
  const counts: Record<DashboardTab, number> = {
    comparisons: comparisonCount,
    chats: chatCount,
  }

  const tabs: { id: DashboardTab; label: string }[] = [
    { id: "comparisons", label: t("dashboard.tabComparisons") },
    { id: "chats", label: t("dashboard.tabChats") },
  ]

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("dashboard.historyType")}>
      {tabs.map(({ id, label }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition-all duration-200 sm:px-4 sm:text-xs",
              isActive
                ? "border-primary/20 bg-primary text-primary-foreground shadow-sm"
                : "border-border/80 bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/30 hover:text-foreground"
            )}
          >
            {label}
            <span className={cn("ml-1.5 tabular-nums", isActive ? "opacity-90" : "opacity-70")}>
              ({counts[id]})
            </span>
          </button>
        )
      })}
    </div>
  )
}
