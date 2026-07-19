"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { AutoAssistLogoIcon, AutoAssistWordmark } from "@/components/auto-assist-brand"
import { UserMenu } from "@/components/auth/user-menu"
import { MobileNavSheet } from "@/components/mobile-nav-sheet"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "@/lib/locale-context"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()
  const { t } = useTranslation()

  const links = [
    { href: "/customs-calculator", label: t("nav.customs") },
    { href: "/import-calculator", label: t("nav.import") },
    { href: "/shipping-rates", label: t("nav.shipping") },
    { href: "/methodology", label: t("nav.methodology") },
    { href: "/faq", label: t("nav.faq") },
  ]

  return (
    <header className="sticky top-0 z-40 w-full bg-transparent py-4">
      {/* Main Navigation Bar */}
      <div className="page-container">
        <div className="flex h-16 items-center justify-between rounded-full border border-border/60 bg-background/90 px-5 shadow-[var(--shadow-elevated)] backdrop-blur-[12px] sm:px-7">
        {/* Brand Logo - AA Chevron Monogram */}
        <Link 
          href="/" 
          className="flex items-center gap-3 font-semibold tracking-tight group"
        >
          <span className="flex size-9 items-center justify-center text-foreground transition-all group-hover:scale-105 group-active:scale-95">
            <AutoAssistLogoIcon className="size-6" />
          </span>
          <AutoAssistWordmark className="text-base transition-colors group-hover:[&>span:first-child]:text-primary" />
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label={t("nav.title")}>
          {links.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right CTA Button & Sheet Trigger */}
        <div className="flex items-center gap-3">
          {/* Action Button */}
          <Link
            href={pathname === "/" ? "#compare" : "/#compare"}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "hidden lg:flex h-10 rounded-full bg-primary pl-5 pr-2 py-1 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all gap-2.5"
            )}
          >
            <span>{t("nav.compare")}</span>
            <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white">
              <ArrowRight className="size-3.5" />
            </span>
          </Link>

          {/* Language Switcher - Desktop */}
          <LanguageSwitcher className="hidden lg:inline-flex" />

          {/* Auth / user menu - desktop only; mobile uses sheet profile */}
          <div className="hidden lg:block">
            <UserMenu />
          </div>

          <MobileNavSheet compareHref={pathname === "/" ? "#compare" : "/#compare"} />
        </div>
        </div>
      </div>
    </header>
  )
}

