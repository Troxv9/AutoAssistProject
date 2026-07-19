import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"

export function PageHero({ eyebrow, title, description, aside }: { eyebrow: string; title: string; description: string; aside?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-card bg-grid-black/[0.01] dark:bg-grid-white/[0.01]">
      <div className="page-container relative z-10 flex flex-col gap-6 py-8 sm:gap-7 sm:py-10 md:py-12 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:py-16">
        <div className="max-w-3xl min-w-0">
          <Badge variant="secondary" className="mb-4 sm:mb-5">{eyebrow}</Badge>
          <h1 className="max-w-4xl text-balance text-[1.625rem] font-semibold leading-[1.12] tracking-tight sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-[1.08] xl:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-[13px] leading-relaxed text-muted-foreground sm:mt-5 sm:text-base sm:leading-7 md:text-lg">
            {description}
          </p>
        </div>
        {aside ? <div className="w-full shrink-0 sm:w-auto">{aside}</div> : null}
      </div>
    </section>
  )
}
