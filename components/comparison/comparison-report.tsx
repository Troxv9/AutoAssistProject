"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft, CarFront, ChevronLeft, ChevronRight, Info, MapPin, RefreshCw } from "lucide-react"
import { useChatComparison } from "@/components/chat"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShareButton } from "@/components/share-button"
import { Spotlight } from "@/components/ui/spotlight-new"
import type { ComparisonResult, CostLine, LocalOption, Vehicle } from "@/lib/vehicles"
import { cn } from "@/lib/utils"
import { CostOverview } from "./charts"
import { AiAnalysis } from "./ai-analysis"
import { RepairEstimate, type RepairEstimateData } from "./repair-estimate"
import { useTranslation } from "@/lib/locale-context"
import {
  translateCostLabel,
  translateCostHint,
  translateWarning,
  translateTransportLabel,
} from "@/lib/translations"

function VehiclePanel({ vehicle, localSource, href }: { vehicle: Vehicle; localSource?: "autopapa" | "ai"; href?: string }) {
  const { t, locale, formatGel, formatUsd } = useTranslation()
  const gel = { format: formatGel }
  const usd = { format: formatUsd }
  const km = new Intl.NumberFormat(locale === "en" ? "en-US" : "ka-GE")

  const fuel: Record<string, string> = locale === "ka"
    ? { gasoline: "ბენზინი", diesel: "დიზელი", hybrid: "ჰიბრიდი", electric: "ელექტრო" }
    : { gasoline: "Gasoline", diesel: "Diesel", hybrid: "Hybrid", electric: "Electric" }

  const showCustomsBadge = vehicle.provider === "myauto" && vehicle.customsPassed !== undefined

  const content = (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="relative aspect-[16/7] shrink-0 overflow-hidden bg-muted">
        {vehicle.imageUrl ? <img src={vehicle.imageUrl} alt={vehicle.title} className="size-full object-cover transition-transform duration-500 hover:scale-[1.025]" /> : <div className="flex size-full items-center justify-center"><CarFront className="size-12 text-muted-foreground" /></div>}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-foreground/80 to-transparent p-4 pt-12 text-primary-foreground">
          <Badge variant="secondary">{vehicle.provider === "copart" ? (locale === "ka" ? "Copart · აშშ" : "Copart · US") : localSource === "autopapa" ? "autopapa.ge" : (locale === "ka" ? "ქართული ბაზარი · AI" : "Georgian market · AI")}</Badge>
          {vehicle.externalId !== "ai-local" && <span className="font-mono text-xs opacity-80">#{vehicle.externalId}</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="min-w-0">
          <h3 className="line-clamp-2 min-h-14 text-balance text-xl font-bold tracking-tight md:min-h-16 md:text-2xl">{vehicle.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-3.5 shrink-0" />{vehicle.location}</p>
        </div>
        <div className="mt-3 flex min-h-5 items-center">
          {showCustomsBadge ? (
            <Badge variant={vehicle.customsPassed ? "outline" : "destructive"}>
              {vehicle.customsPassed 
                ? (locale === "ka" ? "განბაჟებული" : "Cleared") 
                : (locale === "ka" ? "განუბაჟებელი" : "Uncleared")
              }
            </Badge>
          ) : (
            <span className="invisible inline-flex h-5 items-center px-2 text-xs" aria-hidden="true">Cleared</span>
          )}
        </div>
        <div className="mt-4 grid grid-cols-4 divide-x border-y py-4 text-center">
          {[
            [locale === "ka" ? "ძრავა" : "Engine", `${(vehicle.engineCc / 1000).toFixed(1)} ${locale === "ka" ? "ლ" : "L"}`],
            [locale === "ka" ? "საწვავი" : "Fuel", fuel[vehicle.powertrain] || vehicle.powertrain],
            [t("calculator.steering"), vehicle.steering === "left" ? t("calculator.steeringLeft") : t("calculator.steeringRight")],
            [locale === "ka" ? "გარბენი" : "Mileage", vehicle.mileageKm ? `${km.format(vehicle.mileageKm)} ${locale === "ka" ? "კმ" : "km"}` : (locale === "ka" ? "არ არის" : "N/A")],
          ].map(([label, value]) => <div key={label} className="px-2"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 truncate text-xs font-semibold sm:text-sm">{value}</p></div>)}
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <span className="min-w-0 max-w-36 text-xs leading-relaxed text-muted-foreground">
            {vehicle.provider === "copart" 
              ? (locale === "ka" ? "შესყიდვის ფასი" : "Purchase Price") 
              : (locale === "ka" ? "ბაზრის სავარაუდო ფასი" : "Est. market price")
            }
          </span>
          <strong className="shrink-0 font-mono text-xl tracking-tight sm:text-2xl">{vehicle.currency === "USD" ? usd.format(vehicle.price) : gel.format(vehicle.price)}</strong>
        </div>
      </div>
    </article>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full cursor-pointer transition-transform hover:-translate-y-0.5"
        title={vehicle.title}
      >
        {content}
      </a>
    )
  }
  return content
}

function LocalCarousel({ index, total, onPrev, onNext }: { index: number; total: number; onPrev: () => void; onNext: () => void }) {
  const { locale } = useTranslation()
  if (total <= 1) return null
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-card/70 px-3 py-2">
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {locale === "ka" ? "განცხადება" : "Listing"} {index + 1} / {total}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onPrev}
          aria-label={locale === "ka" ? "წინა" : "Previous"}
          className="flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground cursor-pointer"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
        >
          {locale === "ka" ? "შემდეგი" : "Next"}
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

function Breakdown({ title, subtitle, lines, total }: { title: string; subtitle: string; lines: CostLine[]; total: number }) {
  const { formatGel, locale } = useTranslation()
  const gel = { format: formatGel }

  return (
    <section className="rounded-2xl border bg-card p-5 md:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">{locale === "ka" ? "კალკულაცია" : "Calculation"}</p>
          <h3 className="mt-2 text-lg font-bold text-balance sm:text-xl">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="shrink-0 font-mono text-2xl font-bold tabular-nums sm:text-3xl">{gel.format(total)}</p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col">
        {lines.map((line, index) => (
          <div key={`${line.label}-${index}`} className="flex items-start justify-between gap-3 border-b py-3.5 last:border-0 sm:gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">{translateCostLabel(line.label, locale)}</p>
              {line.hint && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{translateCostHint(line.hint, locale)}</p>}
            </div>
            <p className="shrink-0 font-mono text-sm font-semibold tabular-nums">{gel.format(line.amountGel)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function VerdictHero({ result }: { result: ComparisonResult }) {
  const { formatGel, locale } = useTranslation()
  const gel = { format: formatGel }

  const importing = result.verdict === "import"
  const local = result.verdict === "local"
  const tie = !importing && !local
  const max = Math.max(result.importTotalGel, result.localTotalGel, 1)

  const shellClass = tie
    ? "border border-primary/20 bg-card text-foreground shadow-sm"
    : importing
      ? "bg-gradient-to-br from-[#7f1d1d] via-[#862020] to-[#651616] text-white shadow-[var(--shadow-elevated)]"
      : "bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#050505] text-white shadow-[var(--shadow-elevated)]"

  const verdictTitle = importing
    ? (locale === "ka" ? "იმპორტი ფინანსურად უფრო მომგებიანია" : "Import is financially better")
    : local
      ? (locale === "ka" ? "ადგილობრივი შეძენა უფრო მომგებიანია" : "Local purchase is financially better")
      : (locale === "ka" ? "ღირებულებები თითქმის თანაბარია" : "Prices are almost equal")

  const accentPanelClass = tie
    ? "border-border/70 bg-muted/35"
    : "border-white/12 bg-white/[0.07] backdrop-blur-[2px]"

  const mutedTextClass = tie ? "text-muted-foreground" : "text-white/65"
  const dividerClass = tie ? "border-border/70" : "border-white/12"

  return (
    <div className={cn("overflow-hidden rounded-2xl", shellClass, !tie && "ring-1 ring-inset ring-white/10")}>
      <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)] md:items-center md:gap-5 md:p-6 lg:p-7">
        <div className="min-w-0">
          <p className={cn("font-mono text-[10px] uppercase tracking-[0.16em]", mutedTextClass)}>
            {locale === "ka" ? "საბოლოო ვერდიქტი" : "Final Verdict"}
          </p>
          <h2 className="mt-2 max-w-xl text-balance text-xl font-bold leading-tight tracking-tight sm:text-2xl lg:text-[1.75rem]">
            {verdictTitle}
          </h2>
          <p className={cn("mt-2 max-w-lg text-sm leading-relaxed", mutedTextClass)}>
            {locale === "ka" 
              ? "კალკულაცია მოიცავს შესყიდვას, საკომისიოებს, ტრანსპორტს, განბაჟებასა და დამატებით ხარჯებს." 
              : "Calculation includes purchase price, fees, shipping, customs clearance, and additional costs."
            }
          </p>
        </div>

        <div className={cn("rounded-xl border p-4 md:p-5", accentPanelClass)}>
          <p className={cn("text-xs font-medium", mutedTextClass)}>{locale === "ka" ? "პოტენციური ეკონომია" : "Potential Savings"}</p>
          <p className="mt-1 font-mono text-3xl font-bold tracking-tight tabular-nums sm:text-[2rem]">
            {gel.format(result.differenceGel)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                !tie && "border-white/15 bg-white/12 text-white hover:bg-white/12"
              )}
            >
              ROI {result.roiPercent}%
            </Badge>
            <span className={cn("text-xs", mutedTextClass)}>{locale === "ka" ? "სრული ხარჯის მიხედვით" : "Based on total cost"}</span>
          </div>
        </div>
      </div>

      <div className={cn("grid sm:grid-cols-2", dividerClass, "border-t")}>
        {[
          { label: locale === "ka" ? "იმპორტი" : "Import", total: result.importTotalGel, emphasized: importing },
          { label: locale === "ka" ? "ადგილობრივი" : "Local", total: result.localTotalGel, emphasized: local },
        ].map(({ label, total, emphasized }, index) => (
          <div
            key={label}
            className={cn(
              "p-4 md:p-5",
              index > 0 && cn("border-t sm:border-l sm:border-t-0", dividerClass),
              emphasized && !tie && "bg-white/[0.04]"
            )}
          >
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className={mutedTextClass}>{label}</span>
              <strong className="font-mono text-sm font-semibold tabular-nums sm:text-base">
                {gel.format(total)}
              </strong>
            </div>
            <div className={cn("mt-2.5 h-1 overflow-hidden rounded-full", tie ? "bg-muted" : "bg-white/15")}>
              <div
                className={cn(
                  "h-full rounded-full animate-grow-width",
                  tie ? "bg-primary" : emphasized ? "bg-white" : "bg-white/55"
                )}
                style={{ width: `${(total / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ComparisonReport({
  result,
  comparisonId,
  initialAnalysis,
  initialRepair,
  isAnonymous,
  frozen,
}: {
  result: ComparisonResult
  comparisonId?: string | null
  initialAnalysis?: unknown
  initialRepair?: RepairEstimateData | null
  isAnonymous?: boolean
  frozen?: boolean
}) {
  const { locale, formatGel } = useTranslation()
  const gel = { format: formatGel }

  // Local listings carousel (autopapa). Falls back to a single option for old snapshots.
  const options: LocalOption[] = useMemo(() => {
    if (result.localOptions && result.localOptions.length) return result.localOptions
    return [{
      vehicle: result.myauto,
      localLines: result.localLines,
      localTotalGel: result.localTotalGel,
      differenceGel: result.differenceGel,
      savingsPercent: result.savingsPercent,
      roiPercent: result.roiPercent,
      verdict: result.verdict,
    }]
  }, [result])
  const [activeIdx, setActiveIdx] = useState(0)
  const safeIdx = Math.min(activeIdx, options.length - 1)
  const active = options[safeIdx]

  useEffect(() => {
    if (frozen || options.length <= 1) return
    const id = window.setInterval(() => setActiveIdx((i) => (i + 1) % options.length), 3000)
    return () => window.clearInterval(id)
  }, [options.length, safeIdx, frozen])

  const activeResult: ComparisonResult = useMemo(() => ({
    ...result,
    myauto: active.vehicle,
    localLines: active.localLines,
    localTotalGel: active.localTotalGel,
    differenceGel: active.differenceGel,
    savingsPercent: active.savingsPercent,
    roiPercent: active.roiPercent,
    verdict: active.verdict,
  }), [result, active])

  const [aiAnalysis, setAiAnalysis] = useState<any | null>(initialAnalysis ?? null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  const [repair, setRepair] = useState<RepairEstimateData | null>(initialRepair ?? null)
  const [repairLoading, setRepairLoading] = useState(false)
  const [repairError, setRepairError] = useState<string | null>(null)
  const repairFetchedRef = useRef(false)

  const { setComparison, setAnalysis: setChatAnalysis, setRepair: setChatRepair } = useChatComparison()
  useEffect(() => {
    setComparison(result, comparisonId ?? null)
    return () => setComparison(null, null)
  }, [result, comparisonId, setComparison])

  useEffect(() => {
    if (aiAnalysis) setChatAnalysis(aiAnalysis)
  }, [aiAnalysis, setChatAnalysis])

  useEffect(() => {
    if (repair) setChatRepair(repair)
  }, [repair, setChatRepair])

  // AI Expert Analysis is triggered manually (not on load) and analyzes the
  // currently-viewed local listing.
  async function generateAnalysis() {
    if (aiLoading) return
    fetchedRef.current = true
    setAiLoading(true)
    setAiError(null)
    try {
      const response = await fetch("/api/compare/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...activeResult, locale }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setAiAnalysis(data.analysis)

      if (comparisonId) {
        fetch(`/api/comparisons/${comparisonId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ analysis: data.analysis }),
        }).catch(() => {})
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : (locale === "ka" ? "AI ანალიზი ვერ ჩაიტვირთა" : "Failed to load AI analysis"))
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    if (frozen || repair || repairFetchedRef.current) return
    repairFetchedRef.current = true

    ;(async () => {
      setRepairLoading(true)
      setRepairError(null)
      try {
        const response = await fetch("/api/compare/repair", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ copart: result.copart, locale }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setRepair(data.estimate)
      } catch (err) {
        setRepairError(err instanceof Error ? err.message : (locale === "ka" ? "სარემონტო შეფასება ვერ ჩაიტვირთა" : "Failed to load repair estimate"))
        repairFetchedRef.current = false
      } finally {
        setRepairLoading(false)
      }
    })()
  }, [repair, comparisonId, result, locale, frozen])

  const formattedDate = useMemo(() => {
    try {
      return new Date(result.calculatedAt).toLocaleString(locale === "ka" ? "ka-GE" : "en-US")
    } catch {
      return ""
    }
  }, [result.calculatedAt, locale])

  return (
    <>
      <div className="relative overflow-hidden">
        <Spotlight />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-7 px-5 py-10 lg:px-8 lg:py-14">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
              <ArrowLeft className="size-4" />
              {locale === "ka" ? "ახალი შედარება" : "New Comparison"}
            </Link>
            <Badge variant="outline">
              {locale === "ka" ? "წესები" : "Rules"} {result.ruleVersion} · {result.exchangeRateSource === "საქართველოს ეროვნული ბანკი" ? (locale === "ka" ? "საქართველოს ეროვნული ბანკი" : "National Bank of Georgia") : result.exchangeRateSource}
            </Badge>
          </div>

          {isAnonymous && (
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{locale === "ka" ? "შეინახეთ ეს შედარება" : "Save this comparison"}</p>
                  <p className="text-xs text-muted-foreground">
                    {locale === "ka" ? "დარეგისტრირდით, რომ შედარება და AI ჩატი თქვენს ისტორიაში დარჩეს." : "Sign up to save this comparison and AI chat in your history."}
                  </p>
                </div>
              </div>
              <Link href="/sign-up" className={cn(buttonVariants({ variant: "default", size: "sm" }), "h-10 shrink-0 rounded-xl px-5 cursor-pointer")}>
                {locale === "ka" ? "რეგისტრაცია" : "Sign Up"}
              </Link>
            </div>
          )}

          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">{locale === "ka" ? "შედარების შედეგი" : "Comparison Report"}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              1 USD = {result.exchangeRate.toFixed(4)} GEL · {locale === "ka" ? "განახლდა" : "Updated"} {formattedDate}
            </p>
          </div>

          
          <VerdictHero result={activeResult} />

          
          <CostOverview
            lines={activeResult.importLines}
            importTotalGel={activeResult.importTotalGel}
            localTotalGel={activeResult.localTotalGel}
            verdict={activeResult.verdict}
          />

          
          <AiAnalysis analysis={aiAnalysis} loading={aiLoading} error={aiError} onGenerate={frozen ? undefined : generateAnalysis} />

          
          <RepairEstimate estimate={repair} loading={repairLoading} error={repairError} importTotalGel={result.importTotalGel} />

          
          <div className="grid items-stretch gap-5 lg:grid-cols-2">
            <VehiclePanel vehicle={activeResult.copart} />
            <div className="flex flex-col gap-2">
              <LocalCarousel
                index={safeIdx}
                total={options.length}
                onPrev={() => setActiveIdx((i) => (i - 1 + options.length) % options.length)}
                onNext={() => setActiveIdx((i) => (i + 1) % options.length)}
              />
              <VehiclePanel
                vehicle={active.vehicle}
                localSource={result.localEstimate?.source}
                href={active.vehicle.sourceUrl?.includes("autopapa.ge") ? active.vehicle.sourceUrl : undefined}
              />
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Breakdown 
              title={locale === "ka" ? "იმპორტის სრული ღირებულება" : "Total Import Cost"} 
              subtitle={translateTransportLabel(result.transportLabel, locale)} 
              lines={activeResult.importLines} 
              total={activeResult.importTotalGel} 
            />
            <Breakdown 
              title={locale === "ka" ? "ადგილობრივი შეძენა" : "Local Purchase"} 
              subtitle={
                result.localEstimate?.source === "autopapa"
                  ? (locale === "ka" ? "autopapa.ge · მედიანური ფასი (ლარში)" : "autopapa.ge · median price (in GEL)")
                  : (locale === "ka" ? "ქართული ბაზარი · AI შეფასება (ლარში)" : "Georgian market · AI estimate (in GEL)")
              } 
              lines={active.localLines} 
              total={active.localTotalGel} 
            />
          </div>

          {result.warnings.length > 0 && (
            <Alert>
              <Info />
              <AlertTitle>{locale === "ka" ? "შეფასების შესახებ" : "About the estimate"}</AlertTitle>
              <AlertDescription>
                <ul className="mt-1 flex list-disc flex-col gap-1.5 pl-4">
                  {result.warnings.map((warning) => <li key={warning}>{translateWarning(warning, locale)}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-end">
            <ShareButton snapshot={{ result, analysis: aiAnalysis, repair }} className="h-[44px] transition-transform active:scale-[0.98] md:h-10 cursor-pointer" />
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "h-[44px] transition-transform active:scale-[0.98] md:h-10 cursor-pointer")}>
              <RefreshCw data-icon="inline-start" />
              {locale === "ka" ? "ახალი შედარება" : "New Comparison"}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
