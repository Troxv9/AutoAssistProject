"use client"

import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { ArrowRight } from "lucide-react"
import { AvatarUploadControl } from "@/components/auth/avatar-upload-control"
import { buttonVariants } from "@/components/ui/button"
import { getUserDisplay } from "@/lib/hooks/use-auth-user"
import { useTranslation } from "@/lib/locale-context"
import { cn } from "@/lib/utils"

type DashboardHeroProps = {
  user: User
  comparisonCount: number
  chatCount: number
  totalSavings: number | null
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="calculator-surface rounded-2xl border border-foreground/10 px-4 py-3.5 shadow-sm">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">{value}</p>
    </div>
  )
}

export function DashboardHero({ user, comparisonCount, chatCount, totalSavings }: DashboardHeroProps) {
  const { t, formatGel } = useTranslation()
  const { label, email } = getUserDisplay(user)

  return (
    <section className="relative overflow-hidden border-b border-border bg-card bg-grid-black/[0.01] dark:bg-grid-white/[0.01]">
      <div className="page-container relative z-10 py-8 sm:py-10 md:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <AvatarUploadControl
              user={user}
              size="lg"
              showActions={false}
              avatarClassName="size-14 text-base sm:size-16"
            />
            <div className="min-w-0 pt-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{t("dashboard.accountCabinet")}</p>
              <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{label}</h1>
              {email && <p className="mt-1 truncate text-sm text-muted-foreground">{email}</p>}
            </div>
          </div>

          <Link
            href="/#compare"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-11 shrink-0 rounded-full bg-primary px-5 text-sm font-semibold shadow-sm hover:bg-primary/90 sm:h-12"
            )}
          >
            {t("dashboard.newComparison")}
            <span className="flex size-7 items-center justify-center rounded-full bg-white/20">
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <StatCard label={t("dashboard.statComparisons")} value={String(comparisonCount)} />
          <StatCard label={t("dashboard.statChats")} value={String(chatCount)} />
          <StatCard
            label={t("dashboard.statSavings")}
            value={totalSavings != null && totalSavings > 0 ? formatGel(totalSavings) : "-"}
          />
        </div>
      </div>
    </section>
  )
}
