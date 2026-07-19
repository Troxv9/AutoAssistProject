"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { LayoutDashboard, LogOut } from "lucide-react"
import { signOut } from "@/app/auth/actions"
import { UserAvatar } from "@/components/auth/user-avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { getUserDisplay, useAuthUser } from "@/lib/hooks/use-auth-user"
import { useTranslation } from "@/lib/locale-context"
import { cn } from "@/lib/utils"

export function UserMenu() {
  const { t } = useTranslation()
  const { user, ready } = useAuthUser()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  if (!ready) return <div className="size-10" aria-hidden />

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-10 rounded-full px-4 text-sm font-medium"
        )}
      >
        {t("nav.signIn")}
      </Link>
    )
  }

  const { label, email } = getUserDisplay(user)

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="secondary"
        size="icon"
        aria-label={t("nav.userMenu")}
        aria-expanded={open}
        className="size-10 overflow-hidden rounded-full p-0"
        onClick={() => setOpen((v) => !v)}
      >
        <UserAvatar user={user} size="md" className="size-full" />
      </Button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-border/60 bg-background p-2 shadow-[var(--shadow-elevated)]">
          <div className="flex items-center gap-3 border-b px-3 py-3">
            <UserAvatar user={user} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{label}</p>
              {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
            </div>
          </div>

          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
          >
            <LayoutDashboard className="size-4 text-muted-foreground" />
            {t("nav.history")}
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              {t("nav.signOut")}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
