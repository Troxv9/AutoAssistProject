"use client"

import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { AutoAssistLogoIcon, AutoAssistWordmark } from "@/components/auto-assist-brand"
import { useTranslation } from "@/lib/locale-context"

function FooterLinkColumn({
  title,
  links,
}: {
  title: string
  links: readonly { href: string; label: string }[]
}) {
  return (
    <nav aria-label={title}>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <ul className="mt-3 flex flex-col gap-0.5">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="inline-flex rounded-lg px-0.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function SiteFooter() {
  const year = new Date().getFullYear()
  const { t } = useTranslation()

  const toolLinks = [
    { href: "/#compare", label: t("nav.compare") },
    { href: "/import-calculator", label: t("footer.importCalc") },
    { href: "/customs-calculator", label: t("footer.customsCalc") },
  ]

  const resourceLinks = [
    { href: "/methodology", label: t("nav.methodology") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/shipping-rates", label: t("footer.shippingRates") },
  ]

  const trustSignals = [
    t("footer.trust1"),
    t("footer.trust2"),
    t("footer.trust3"),
  ]

  return (
    <footer className="mt-auto border-t border-border/80 bg-muted/20" aria-label={t("nav.desc")}>
      <div className="page-container">
        <div className="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12 lg:py-12">
          <div className="flex flex-col gap-5">
            <Link href="/" className="group flex w-fit items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
              <AutoAssistLogoIcon className="size-6 transition-transform group-hover:scale-105" />
              <AutoAssistWordmark className="text-base transition-colors group-hover:[&>span:first-child]:text-primary" />
            </Link>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
              {t("footer.desc")}
            </p>
            <div className="flex flex-wrap gap-2" aria-label="ნდობის სიგნალები">
              {trustSignals.map((signal) => (
                <span
                  key={signal}
                  className="rounded-full border border-border/80 bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <FooterLinkColumn title={t("footer.tools")} links={toolLinks} />
            <FooterLinkColumn title={t("footer.info")} links={resourceLinks} />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border/60 py-5 md:flex-row md:items-start md:justify-between md:gap-8">
          <div className="flex min-w-0 max-w-2xl gap-2.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-pretty text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground/80">{t("footer.disclaimerTitle")}</span>{" "}
              {t("footer.disclaimerText")}
            </p>
          </div>
          <p className="shrink-0 font-mono text-[11px] text-muted-foreground md:text-right">
            © {year} Auto Assist · {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  )
}
