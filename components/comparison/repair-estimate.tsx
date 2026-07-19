"use client"

import { AlertTriangle, CheckCircle2, ExternalLink, Info, KeyRound, ShieldAlert, Wrench } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/locale-context"

export type RepairPart = {
  nameKa: string
  note: string
  severity: "minor" | "moderate" | "severe"
  qty: number
  priceGel: number | null
  priceCount: number
  sourceUrl: string | null
  imageUrl: string | null
  matchedTitle: string | null
  matchedCategory: string | null
  seller: string | null
  partNumber: string | null
}

export type KeyService = {
  nameKa: string
  descriptionKa: string
  url: string
}

export type RepairEstimateData = {
  needsRepair: boolean
  dataAvailable?: boolean
  summaryKa: string
  cautionsKa: string
  currency: string
  keyService?: KeyService | null
  parts: RepairPart[]
  partsSubtotalGel: number
  pricedCount: number
  totalParts: number
  laborEstimateGel: { min: number; max: number }
  totalMinGel: number
  totalMaxGel: number
}

function Header() {
  const { locale } = useTranslation()
  return (
    <div className="mb-6 flex items-center gap-2 border-b pb-4">
      <Wrench className="size-5 text-primary" />
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
          {locale === "ka" ? "იმპორტის მანქანა" : "Import Vehicle"}
        </p>
        <h3 className="text-xl font-bold md:text-2xl">
          {locale === "ka" ? "სარემონტო შეფასება" : "Repair Estimate"}
        </h3>
      </div>
    </div>
  )
}

export function RepairEstimate({
  estimate,
  loading,
  error,
  importTotalGel,
}: {
  estimate: RepairEstimateData | null
  loading: boolean
  error: string | null
  importTotalGel?: number
}) {
  const { locale, formatGel } = useTranslation()
  const gel = { format: formatGel }

  const SEVERITY: Record<RepairPart["severity"], { label: string; cls: string }> = {
    minor: { label: locale === "ka" ? "მსუბუქი" : "Minor", cls: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400" },
    moderate: { label: locale === "ka" ? "საშუალო" : "Moderate", cls: "bg-amber-500/12 text-amber-600 dark:text-amber-400" },
    severe: { label: locale === "ka" ? "მძიმე" : "Severe", cls: "bg-destructive/12 text-destructive" },
  }

  function rangeText(min: number, max: number) {
    if (min === max) return gel.format(min)
    return `${gel.format(min)} – ${gel.format(max)}`
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-card/65 p-6 backdrop-blur-md md:p-10">
      <Header />

      {!loading && !error && estimate?.keyService && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <KeyRound className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{estimate.keyService.nameKa}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{estimate.keyService.descriptionKa}</p>
            </div>
          </div>
          <a
            href={estimate.keyService.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-xl bg-amber-500 px-4 text-xs font-semibold text-white transition-colors hover:bg-amber-600 sm:self-auto cursor-pointer"
          >
            {locale === "ka" ? "სერვისის ნახვა" : "View Service"}
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="mt-2 h-10 w-1/2" />
        </div>
      )}

      {!loading && error && (
        <Alert variant="destructive">
          <Info />
          <AlertTitle>{locale === "ka" ? "შეფასება ვერ მომზადდა" : "Failed to prepare estimate"}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && estimate && !estimate.needsRepair && estimate.dataAvailable === false && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 p-5">
          <Info className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm leading-relaxed text-foreground">{estimate.summaryKa}</p>
        </div>
      )}

      {!loading && !error && estimate && !estimate.needsRepair && estimate.dataAvailable !== false && (
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/10 p-5">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm leading-relaxed text-foreground">{estimate.summaryKa}</p>
        </div>
      )}

      {!loading && !error && estimate && estimate.needsRepair && (
        <div className="space-y-6">
          {estimate.summaryKa && (
            <p className="text-sm leading-relaxed text-muted-foreground">{estimate.summaryKa}</p>
          )}

          {/* Parts list — responsive cards (no horizontal scroll) */}
          <div className="space-y-3">
            {estimate.parts.map((part, i) => {
              const sev = SEVERITY[part.severity] ?? SEVERITY.moderate
              const meta = [part.matchedTitle, part.partNumber ? `#${part.partNumber}` : null, part.seller]
                .filter(Boolean)
                .join(" · ")
              return (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-2xl border bg-muted/15 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
                      {part.imageUrl ? (
                        <img
                          src={part.imageUrl}
                          alt={part.nameKa}
                          width={56}
                          height={56}
                          className="h-14 w-14 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Wrench className="size-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium text-foreground">{part.nameKa}</span>
                        <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold", sev.cls)}>
                          {sev.label}
                        </span>
                        {part.qty > 1 && (
                          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">×{part.qty}</span>
                        )}
                      </div>
                      {meta && (
                        <div className="mt-1 line-clamp-1 text-xs text-muted-foreground" title={part.matchedTitle ?? ""}>
                          {meta}
                        </div>
                      )}
                      {part.note && (
                        <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{part.note}</div>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 border-t pt-3 text-left sm:border-t-0 sm:pt-0 sm:text-right">
                    {part.priceGel != null ? (
                      <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-end sm:gap-0.5">
                        <span className="font-mono font-semibold tabular-nums">{gel.format(part.priceGel * part.qty)}</span>
                        {part.qty > 1 && (
                          <span className="text-[11px] text-muted-foreground">
                            {gel.format(part.priceGel)} {locale === "ka" ? "/ ცალი" : "/ pc"}
                          </span>
                        )}
                        {part.sourceUrl && (
                          <a
                            href={part.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                          >
                            {locale === "ka" ? "ნახვა" : "View"} <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">{locale === "ka" ? "ფასი ვერ მოიძებნა" : "Price not found"}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totals */}
          <div className="grid gap-3 rounded-2xl border bg-muted/20 p-5 sm:grid-cols-2">
            <div className="flex items-center justify-between sm:flex-col sm:items-start">
              <span className="text-xs text-muted-foreground">
                {locale === "ka" 
                  ? `ნაწილები (${estimate.pricedCount}/${estimate.totalParts} დაფასდა)` 
                  : `Parts (${estimate.pricedCount}/${estimate.totalParts} priced)`
                }
              </span>
              <span className="font-mono text-lg font-semibold tabular-nums">{gel.format(estimate.partsSubtotalGel)}</span>
            </div>
            <div className="flex items-center justify-between sm:flex-col sm:items-start">
              <span className="text-xs text-muted-foreground">{locale === "ka" ? "სამუშაო (სავარაუდო)" : "Labor (Estimated)"}</span>
              <span className="font-mono text-lg font-semibold tabular-nums">
                {rangeText(estimate.laborEstimateGel.min, estimate.laborEstimateGel.max)}
              </span>
            </div>
            <div className="border-t pt-3 sm:col-span-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <span className="text-sm font-medium">{locale === "ka" ? "სავარაუდო სარემონტო ხარჯი სულ" : "Total Estimated Repair Cost"}</span>
                <span className="font-mono text-2xl font-bold tabular-nums text-primary">
                  {rangeText(estimate.totalMinGel, estimate.totalMaxGel)}
                </span>
              </div>
              {typeof importTotalGel === "number" && importTotalGel > 0 && (
                <div className="mt-3 flex flex-col gap-1 border-t pt-3 sm:flex-row sm:items-end sm:justify-between">
                  <span className="text-sm text-muted-foreground">{locale === "ka" ? "იმპორტი + სავარაუდო რემონტი" : "Import + Estimated Repairs"}</span>
                  <span className="font-mono text-lg font-semibold tabular-nums">
                    {rangeText(importTotalGel + estimate.totalMinGel, importTotalGel + estimate.totalMaxGel)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {estimate.cautionsKa && (
            <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 p-4 text-sm text-foreground">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="leading-relaxed">{estimate.cautionsKa}</span>
            </div>
          )}

          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            {locale === "ka" 
              ? "ფასები აღებულია myparts.ge-დან და არის საორიენტაციო. საბოლოო ღირებულება დამოკიდებულია ფარული დაზიანების, ნაწილის მდგომარეობისა (ახალი/მეორადი) და ხელოსნის ტარიფზე."
              : "Prices are fetched from myparts.ge and are estimates. The final cost depends on hidden damage, part condition (new/used), and mechanic rates."
            }
          </p>
        </div>
      )}
    </div>
  )
}
