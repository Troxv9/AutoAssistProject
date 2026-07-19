"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle, ArrowLeftRight, BarChart3,
  Check, Link2, Loader2, Route, Scale,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { ComparisonResult } from "@/lib/vehicles"
import { cn } from "@/lib/utils"
import { Spotlight } from "@/components/ui/spotlight-new"
import { PREVIEW_STORAGE_KEY } from "@/lib/comparison-preview"
import { useTranslation } from "@/lib/locale-context"
import { formInputShell } from "@/components/calculator-fields"

const compareSourceInputShell = formInputShell

const compareFormFieldGuard = {
  autoComplete: "off",
  "data-form-type": "other",
  "data-lpignore": "true",
  "data-1p-ignore": "",
  suppressHydrationWarning: true,
} as const

function LoadingState({ progress }: { progress: number }) {
  const { t } = useTranslation()
  const current = progress < 38 ? 0 : progress < 76 ? 1 : 2
  const steps = [t("home.step1"), t("home.step2"), t("home.step3")]
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-secondary/45 p-4" role="status" aria-live="polite">
      {steps.map((step, index) => {
        const done = index < current
        const active = index === current
        return (
          <div key={step} className="flex items-center gap-3 py-1.5">
            <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
              {done ? <Check className="size-3.5" aria-hidden="true" /> : active ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : index + 1}
            </span>
            <span className={`text-sm leading-snug ${done ? "font-medium text-foreground" : active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{step}</span>
          </div>
        )
      })}
    </div>
  )
}

function TrustStrip() {
  const { t } = useTranslation()
  const items = [
    { icon: ArrowLeftRight, eyebrow: t("home.trustCurrency"), title: t("home.trustCurrencyVal") },
    { icon: Scale, eyebrow: t("home.trustMethodology"), title: t("home.trustMethodologyVal") },
    { icon: Route, eyebrow: t("home.trustLogistics"), title: t("home.trustLogisticsVal") },
    { icon: BarChart3, eyebrow: t("home.trustTransparency"), title: t("home.trustTransparencyVal") },
  ]
  return (
    <section className="shrink-0 border-y bg-card" aria-label="კალკულაციის უპირატესობები">
      <div className="page-container grid grid-cols-2 divide-x divide-y lg:grid-cols-4 lg:divide-y-0">
        {items.map(({ icon: Icon, eyebrow, title }) => (
          <div key={title} className="flex min-w-0 items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary sm:size-9">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground">{eyebrow}</p>
              <p className="mt-0.5 text-balance text-[13px] font-semibold leading-snug sm:text-sm">{title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function HeroMetrics() {
  const { t } = useTranslation()
  const items = [
    { eyebrow: t("home.metric1"), title: t("home.metric1Val"), hint: t("home.metric1Hint") },
    { eyebrow: t("home.metric2"), title: t("home.metric2Val"), hint: t("home.metric2Hint") },
    { eyebrow: t("home.metric3"), title: t("home.metric3Val"), hint: t("home.metric3Hint") },
  ]

  return (
    <div className="mt-4 grid w-full grid-cols-3 gap-1.5 sm:mt-6 sm:gap-2" aria-label="პლატფორმის შესაძლებლობები">
      {items.map(({ eyebrow, title, hint }) => (
        <div key={title} className="rounded-xl border border-border/70 bg-card/60 px-2.5 py-2 shadow-sm backdrop-blur-[2px] sm:px-3.5 sm:py-2.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p>
          <p className="mt-1 text-xs font-semibold leading-tight tracking-tight sm:text-sm">{title}</p>
          <p className="mt-0.5 hidden text-[10px] leading-snug text-muted-foreground md:block">{hint}</p>
        </div>
      ))}
    </div>
  )
}

function HeroVideo() {
  const { t } = useTranslation()
  return (
    <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border bg-card shadow-lg aspect-video sm:max-w-sm md:max-w-xl lg:max-w-[min(100%,560px)]">
      <video autoPlay loop muted playsInline className="size-full object-cover" poster="/hero-poster.jpg">
        <source src="/hero-video.mp4" type="video/mp4" />
        {t("home.videoError")}
      </video>
    </div>
  )
}

function CompareFormSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b bg-muted/30 py-10 sm:py-12 md:py-16" aria-label="შედარების ფორმა">
      <Spotlight />
      <div className="page-container-narrow relative z-10">{children}</div>
    </section>
  )
}

export function ComparisonApp() {
  const router = useRouter()
  const { t, locale } = useTranslation()
  const [copartUrl, setCopartUrl] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!loading) return
    setProgress(12)
    const timer = window.setInterval(() => setProgress((value) => Math.min(value + (value < 55 ? 8 : 3), 91)), 650)
    return () => window.clearInterval(timer)
  }, [loading])

  useEffect(() => {
    if (window.location.hash !== "#compare") return
    const element = document.getElementById("compare")
    if (!element) return

    requestAnimationFrame(() => {
      element.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      })
    })
  }, [])

  async function saveToHistory(snapshot: ComparisonResult): Promise<string | null> {
    try {
      const response = await fetch("/api/comparisons", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ copartUrl, snapshot }),
      })
      if (!response.ok) return null
      const data = await response.json()
      return (data?.id as string) ?? null
    } catch {
      return null
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setLoading(true)
    try {
      const response = await fetch("/api/compare", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ copartUrl, locale }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setProgress(100)

      const id = await saveToHistory(data)
      if (id) {
        router.push(`/comparison/${id}`)
      } else {
        try { sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(data)) } catch {}
        router.push("/comparison/preview")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("home.errorDefault"))
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="hero-fold">
        <section className="relative flex min-h-0 flex-1 flex-col justify-center overflow-hidden border-b">
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/40 via-background/10 to-background/55" />
          <div className="page-container relative z-10 grid w-full flex-1 gap-5 py-6 sm:gap-6 sm:py-8 md:py-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12 lg:py-12 lg:pt-14">
            <div className="flex w-full flex-col items-start">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{t("home.subtitle")}</div>
              <h1 className="mt-3 max-w-xl text-balance text-[1.625rem] font-bold leading-[1.08] tracking-tight sm:mt-4 sm:text-2xl md:text-3xl lg:text-4xl">
                {t("home.title")}<br /><span className="text-primary">{t("home.titleAccent")}</span>
              </h1>
              <p className="mt-3 max-w-sm text-pretty text-[13px] leading-snug text-muted-foreground sm:mt-4 sm:max-w-md sm:text-sm md:text-[15px] lg:max-w-lg lg:text-base">
                {t("home.desc")}
              </p>
              <HeroMetrics />
            </div>

            <HeroVideo />
          </div>
        </section>

        <TrustStrip />
      </div>

      <CompareFormSection>
        <Card id="compare" className="calculator-surface mx-auto flex w-full scroll-mt-28 flex-col gap-0 overflow-hidden border-foreground/10 py-0 shadow-[var(--shadow-elevated)]">
          <CardContent className="p-5 sm:p-6 md:p-8">
            <form onSubmit={submit} suppressHydrationWarning autoComplete="off" data-form-type="other">
              <FieldGroup className="mx-auto flex w-full max-w-lg flex-col gap-6">
                <h2 className="text-balance text-center text-base font-semibold tracking-tight sm:text-lg">
                  {t("home.source1Desc")}
                </h2>

                <Field className="mx-auto my-4 w-full max-w-md gap-2.5">
                  <FieldLabel htmlFor="copart" className="sr-only">
                    {t("home.source1Title")}
                  </FieldLabel>
                  <div className="group relative">
                    <Link2
                      className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 ease-out group-focus-within:text-primary/80"
                      aria-hidden="true"
                    />
                    <Input
                      id="copart"
                      type="text"
                      className={cn(compareSourceInputShell, "h-12 pl-10 pr-10 text-[15px] sm:h-11 sm:text-sm")}
                      placeholder={t("home.source1Placeholder")}
                      value={copartUrl}
                      onChange={(event) => setCopartUrl(event.target.value)}
                      required
                      {...compareFormFieldGuard}
                    />
                    {copartUrl ? (
                      <span
                        className="pointer-events-none absolute right-3.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-primary/10 text-primary"
                        aria-hidden="true"
                      >
                        <Check className="size-3" />
                      </span>
                    ) : null}
                  </div>
                </Field>

                {loading ? <LoadingState progress={progress} /> : null}
                {error ? (
                  <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>{t("home.errorTitle")}</AlertTitle>
                    <AlertDescription>
                      {error}
                      <span className="mt-1 block">{t("home.errorDesc")}</span>
                    </AlertDescription>
                  </Alert>
                ) : null}

                <div className="flex flex-col items-center space-y-3 pt-1">
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 w-full max-w-[18rem] rounded-xl px-8 text-base font-semibold shadow-sm transition-[transform,box-shadow] hover:shadow-md active:scale-[0.99] md:h-11"
                    disabled={loading || !copartUrl.trim()}
                    suppressHydrationWarning
                  >
                    {loading ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
                    {loading ? t("home.analyzing") : t("home.submit")}
                  </Button>
                  <p className="max-w-[18rem] text-center text-[11px] leading-relaxed text-muted-foreground">
                    {t("home.agreement")}
                  </p>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </CompareFormSection>
    </div>
  )
}

