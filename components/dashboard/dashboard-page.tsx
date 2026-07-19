"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { ComparisonHistory } from "@/components/dashboard/comparison-history"
import { ChatHistory } from "@/components/dashboard/chat-history"
import { DashboardHero } from "@/components/dashboard/dashboard-hero"
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header"
import { DashboardTabs, type DashboardTab } from "@/components/dashboard/dashboard-tabs"
import { useTranslation } from "@/lib/locale-context"

import type { ChatItem, ComparisonItem } from "@/components/dashboard/types"

type DashboardPageProps = {
  user: User
  comparisons: ComparisonItem[]
  chats: ChatItem[]
  stats: {
    comparisonCount: number
    chatCount: number
    totalSavings: number | null
  }
}

function tabFromHash(): DashboardTab {
  if (typeof window === "undefined") return "comparisons"
  return window.location.hash === "#chats" ? "chats" : "comparisons"
}

export function DashboardPage({ user, comparisons, chats, stats }: DashboardPageProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<DashboardTab>("comparisons")

  useEffect(() => {
    setActiveTab(tabFromHash())

    function onHashChange() {
      setActiveTab(tabFromHash())
    }

    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  function handleTabChange(tab: DashboardTab) {
    setActiveTab(tab)
    const hash = tab === "chats" ? "#chats" : "#comparisons"
    window.history.replaceState(null, "", `${window.location.pathname}${hash}`)
  }

  return (
    <>
      <DashboardHero
        user={user}
        comparisonCount={stats.comparisonCount}
        chatCount={stats.chatCount}
        totalSavings={stats.totalSavings}
      />

      <div className="page-container page-section">
        <DashboardTabs
          active={activeTab}
          comparisonCount={stats.comparisonCount}
          chatCount={stats.chatCount}
          onChange={handleTabChange}
        />

        <div className="mt-6" role="tabpanel">
          {activeTab === "comparisons" ? (
            <>
              <DashboardSectionHeader
                title={t("dashboard.comparisonsSectionTitle")}
                description={t("dashboard.comparisonsSectionDesc")}
              />
              <ComparisonHistory items={comparisons} />
            </>
          ) : (
            <>
              <DashboardSectionHeader
                title={t("dashboard.chatsSectionTitle")}
                description={t("dashboard.chatsSectionDesc")}
              />
              <ChatHistory items={chats} />
            </>
          )}
        </div>
      </div>
    </>
  )
}
