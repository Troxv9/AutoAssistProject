import type { ReactNode } from "react"

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-muted/25 py-8 sm:py-12 md:py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/70"
        aria-hidden="true"
      />
      <div className="page-container-narrow relative z-10 flex w-full justify-center">{children}</div>
    </section>
  )
}
