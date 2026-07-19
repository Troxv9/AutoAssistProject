import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowRight,
  BookOpen,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  Calculator,
  Ship,
  Truck,
  UserRound,
  X,
} from "lucide-react"
import { signOut } from "@/app/auth/actions"
import { UserAvatar } from "@/components/auth/user-avatar"
import { AutoAssistLogoIcon, AutoAssistWordmark } from "@/components/auto-assist-brand"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "@/lib/locale-context"
import { getUserDisplay, useAuthUser } from "@/lib/hooks/use-auth-user"
import { cn } from "@/lib/utils"

type MobileNavSheetProps = {
  compareHref: string
}

export function MobileNavSheet({ compareHref }: MobileNavSheetProps) {
  const pathname = usePathname()
  const { user, ready } = useAuthUser()
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const navGroups = [
    {
      label: t("nav.customs") === "განბაჟება" ? "კალკულატორები" : "Calculators",
      items: [
        {
          href: "/customs-calculator",
          label: t("nav.customs"),
          description: t("nav.customs") === "განბაჟება" ? "საბაჟო გადასახადები" : "Customs duties",
          icon: Calculator,
        },
        {
          href: "/import-calculator",
          label: t("nav.import"),
          description: t("nav.customs") === "განბაჟება" ? "სრული იმპორტის ხარჯი" : "Total import cost",
          icon: Ship,
        },
        {
          href: "/shipping-rates",
          label: t("nav.shipping"),
          description: t("nav.customs") === "განბაჟება" ? "აშშ-დან ტრანსპორტირება" : "US shipping rates",
          icon: Truck,
        },
      ],
    },
    {
      label: t("nav.customs") === "განბაჟება" ? "ინფორმაცია" : "Information",
      items: [
        {
          href: "/methodology",
          label: t("nav.methodology"),
          description: t("nav.customs") === "განბაჟება" ? "როგორ ვთვლით ხარჯებს" : "How we calculate costs",
          icon: BookOpen,
        },
        {
          href: "/faq",
          label: t("nav.faq"),
          description: t("nav.customs") === "განბაჟება" ? "ხშირი კითხვები" : "Frequently asked questions",
          icon: CircleHelp,
        },
      ],
    },
  ] as const

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full lg:hidden"
            aria-label={t("nav.customs") === "განბაჟება" ? "მენიუს გახსნა" : "Open menu"}
          />
        }
      >
        <Menu className="size-5.5" />
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full max-w-[min(100%,24rem)] flex-col gap-0 overflow-hidden rounded-l-2xl border-l p-0 sm:max-w-sm"
      >
        <SheetTitle className="sr-only">{t("nav.title")}</SheetTitle>
        <SheetDescription className="sr-only">
          {t("nav.desc")}
        </SheetDescription>

        {/* Brand header */}
        <div className="shrink-0 border-b border-border/60 bg-muted/30 px-4 py-5">
          <div className="flex items-center justify-between gap-2.5">
            <Link
              href="/"
              className="group flex min-w-0 flex-1 items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-foreground shadow-sm ring-1 ring-border/60 transition-transform group-active:scale-95">
                <AutoAssistLogoIcon className="size-4.5" />
              </span>
              <div className="min-w-0">
                <AutoAssistWordmark className="text-sm transition-colors group-hover:[&>span:first-child]:text-primary" />
              </div>
            </Link>

            {/* Language Switcher in Mobile Drawer */}
            <LanguageSwitcher className="scale-90" />

            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 rounded-full"
                  aria-label={t("nav.customs") === "განბაჟება" ? "მენიუს დახურვა" : "Close menu"}
                />
              }
            >
              <X className="size-4.5" />
            </SheetClose>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* Account */}
          <div className="px-4 py-4">
            {!ready ? (
              <div className="h-[88px] animate-pulse rounded-2xl bg-muted/60" aria-hidden />
            ) : user ? (
              <AccountCard user={user} onNavigate={() => setOpen(false)} />
            ) : (
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-3.5 transition-colors hover:bg-muted/40"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{t("nav.signIn")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("nav.customs") === "განბაჟება" ? "შეინახე შედარებების ისტორია" : "Save your comparison history"}
                  </p>
                </div>
                <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
              </Link>
            )}
          </div>

          <Separator className="bg-border/60" />

          {/* Navigation */}
          <nav className="flex flex-col gap-5 px-4 py-5" aria-label={t("nav.title")}>
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {group.label}
                </p>
                <ul className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                            isActive
                              ? "bg-primary/8 ring-1 ring-primary/15"
                              : "hover:bg-muted/60"
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground"
                            )}
                          >
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block text-sm leading-tight",
                                isActive ? "font-semibold text-foreground" : "font-medium text-foreground"
                              )}
                            >
                              {item.label}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          </span>
                          <ArrowRight
                            className={cn(
                              "size-3.5 shrink-0 transition-transform",
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground/50 group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                            )}
                          />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer CTA */}
        <div className="shrink-0 border-t border-border/60 bg-background/95 p-4 backdrop-blur-sm">
          <Link
            href={compareHref}
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "flex h-12 w-full items-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            )}
          >
            <span className="flex-1 text-center">{t("nav.compare")}</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/20">
              <ArrowRight className="size-4" />
            </span>
          </Link>

          {ready && user && (
            <form action={signOut} className="mt-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/8 hover:text-destructive"
              >
                <LogOut className="size-4" />
                {t("nav.signOut")}
              </button>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function AccountCard({
  user,
  onNavigate,
}: {
  user: NonNullable<ReturnType<typeof useAuthUser>["user"]>
  onNavigate: () => void
}) {
  const { label, email } = getUserDisplay(user)

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <UserAvatar user={user} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{label}</p>
          {email && (
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          )}
        </div>
      </div>
      <div className="border-t border-border/60 bg-muted/20 px-2 py-2">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-background"
        >
          <LayoutDashboard className="size-4 text-primary" />
          ჩემი ისტორია
          <ArrowRight className="ml-auto size-3.5 text-muted-foreground" />
        </Link>
      </div>
    </div>
  )
}
