"use client"

import { useTranslation } from "@/lib/locale-context"

export type MethodologySection = {
  id: string
  title: string
  description: string
}

export function MethodologyContent({ sections }: { sections: MethodologySection[] }) {
  const { locale } = useTranslation()

  return (
    <div className="page-container page-section">
      {/* Mobile / tablet: sticky section jump bar */}
      <div className="sticky top-[calc(var(--header-offset)-0.25rem)] z-20 mb-5 rounded-xl border border-border/80 bg-background/95 p-2 backdrop-blur-md md:hidden">
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map(({ id, title }) => (
            <a
              key={id}
              href={`#${id}`}
              className="shrink-0 snap-start rounded-lg px-3 py-2 text-[11px] font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:text-xs"
            >
              {title}
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(11rem,13.5rem)_minmax(0,1fr)] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Sidebar from md - fixes ~1010px viewports that missed lg-only nav */}
        <aside className="hidden md:block">
          <nav
            className="sticky top-[calc(var(--header-offset)+1rem)] flex flex-col gap-1.5 text-sm"
            aria-label={locale === "ka" ? "მეთოდოლოგიის სექციები" : "Methodology sections"}
          >
            {sections.map(({ id, title }) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-lg px-3 py-2 leading-snug text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 max-w-3xl md:max-w-none lg:max-w-3xl">
          {sections.map(({ id, title, description }, index) => (
            <section
              key={id}
              id={id}
              className="scroll-mt-28 border-b border-border/80 py-6 first:pt-0 sm:py-8"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary sm:text-xs">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-2 text-balance text-xl font-semibold tracking-tight sm:mt-3 sm:text-2xl">
                {title}
              </h2>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base sm:leading-7">
                {description}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
