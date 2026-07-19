"use client"

import { useActionState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { signIn, signUp, type AuthState } from "@/app/auth/actions"
import { formInputShell } from "@/components/calculator-fields"
import { AutoAssistLogoIcon, AutoAssistWordmark } from "@/components/auto-assist-brand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMounted } from "@/lib/hooks/use-mounted"
import { useTranslation } from "@/lib/locale-context"
import { cn } from "@/lib/utils"

type Mode = "sign-in" | "sign-up"

const MODE_CONFIG = {
  "sign-in": { action: signIn, footerLink: "/sign-up" },
  "sign-up": { action: signUp, footerLink: "/sign-in" },
} as const

function FieldBlock({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

export function AuthForm({ mode }: { mode: Mode }) {
  const { t } = useTranslation()
  const config = MODE_CONFIG[mode]
  const mounted = useMounted()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? "/dashboard"
  const [state, formAction, pending] = useActionState<AuthState, FormData>(config.action, {})

  const isSignIn = mode === "sign-in"
  const copy = {
    title: isSignIn ? t("auth.signInTitle") : t("auth.signUpTitle"),
    subtitle: isSignIn ? t("auth.signInSubtitle") : t("auth.signUpSubtitle"),
    submit: isSignIn ? t("auth.submitSignIn") : t("auth.submitSignUp"),
    footer: isSignIn ? t("auth.footerNoAccount") : t("auth.footerHaveAccount"),
    footerCta: isSignIn ? t("auth.signUpTitle") : t("auth.signInTitle"),
  }

  const footerHref =
    config.footerLink + (redirect !== "/dashboard" ? `?redirect=${encodeURIComponent(redirect)}` : "")

  return (
    <div className="w-full max-w-md">
      <div className="calculator-surface overflow-hidden rounded-2xl border border-foreground/10 bg-card p-5 shadow-[var(--shadow-elevated)] sm:rounded-3xl sm:p-8 md:p-10">
        <div className="mb-6 text-center sm:mb-8">
          <Link
            href="/"
            className="group mx-auto mb-5 inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <AutoAssistLogoIcon className="size-6 transition-transform group-hover:scale-105" />
            <AutoAssistWordmark className="text-base transition-colors group-hover:[&>span:first-child]:text-primary" />
          </Link>
          <h1 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">{copy.title}</h1>
          <p className="mt-2 text-pretty text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
            {copy.subtitle}
          </p>
        </div>

        {!mounted ? (
          <AuthFormFieldsSkeleton mode={mode} />
        ) : (
          <form action={formAction} className="flex flex-col gap-4 sm:gap-5" suppressHydrationWarning>
          <input type="hidden" name="redirect" value={redirect} />

          {mode === "sign-up" && (
            <FieldBlock id="fullName" label={t("auth.name")}>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder={t("auth.namePlaceholder")}
                className={formInputShell}
              />
            </FieldBlock>
          )}

          <FieldBlock id="email" label={t("auth.email")}>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={formInputShell}
            />
          </FieldBlock>

          <FieldBlock id="password" label={t("auth.password")}>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              placeholder="••••••••"
              className={formInputShell}
            />
          </FieldBlock>

          {state.error && (
            <div
              className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive sm:px-4"
              role="alert"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="text-pretty leading-relaxed">{state.error}</span>
            </div>
          )}

          {state.message && (
            <div
              className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-3 text-sm text-emerald-700 sm:px-4 dark:text-emerald-400"
              role="status"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="text-pretty leading-relaxed">{state.message}</span>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="mt-0.5 h-12 rounded-xl text-sm font-semibold shadow-sm transition-transform active:scale-[0.99] sm:h-11"
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : copy.submit}
          </Button>
        </form>
        )}

        <p className="mt-5 text-center text-[13px] text-muted-foreground sm:mt-6 sm:text-sm">
          {copy.footer}{" "}
          <Link
            href={footerHref}
            className={cn(
              "font-medium text-primary underline-offset-4 transition-colors hover:underline",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-sm"
            )}
          >
            {copy.footerCta}
          </Link>
        </p>
      </div>
    </div>
  )
}

function AuthFormFieldsSkeleton({ mode }: { mode: Mode }) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5" aria-hidden>
      {mode === "sign-up" && <div className="h-[68px] animate-pulse rounded-xl bg-muted/60" />}
      <div className="h-[68px] animate-pulse rounded-xl bg-muted/60" />
      <div className="h-[68px] animate-pulse rounded-xl bg-muted/60" />
      <div className="mt-0.5 h-12 animate-pulse rounded-xl bg-muted/60" />
    </div>
  )
}
