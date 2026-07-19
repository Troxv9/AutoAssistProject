import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type HistoryEmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
}

export function HistoryEmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: HistoryEmptyStateProps) {
  return (
    <div className="calculator-surface flex flex-col items-center rounded-2xl border border-dashed border-foreground/10 px-6 py-12 text-center shadow-sm">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <Link
        href={ctaHref}
        className={cn(buttonVariants({ variant: "default", size: "sm" }), "mt-6 rounded-full px-5")}
      >
        {ctaLabel}
      </Link>
    </div>
  )
}
