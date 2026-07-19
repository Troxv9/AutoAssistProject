"use client"

import { useEffect, useMemo, useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useIsMobile } from "@/components/chat/utils"
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  CarFront,
  ChevronDown,
  CircleDollarSign,
  Info,
  Loader2,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Ship,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EngineField, UsdField, YearField, calculatorControlShell } from "@/components/calculator-fields"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { costSegmentColor, formatShare, lineShare } from "@/lib/cost-segments"
import { useTranslation } from "@/lib/locale-context"

type Result = {
  totalGel: number
  lines: { label: string; amountGel: number; hint?: string }[]
  exchangeRate: number
  exchangeSource: string
  ruleVersion: string
  age: number
  vatGel: number
  exciseGel: number
}

type FormState = {
  purchaseUsd: string
  year: string
  engineCc: string
  powertrain: string
  steering: string
  inlandUsd: string
  oceanUsd: string
  insuranceUsd: string
  portUsd: string
  repairsUsd: string
  feesMode: string
  feesUsd: string
}

const defaultForm: FormState = {
  purchaseUsd: "8500",
  year: "2022",
  engineCc: "2000",
  powertrain: "gasoline",
  steering: "left",
  inlandUsd: "650",
  oceanUsd: "1250",
  insuranceUsd: "150",
  portUsd: "450",
  repairsUsd: "0",
  feesMode: "auto",
  feesUsd: "0",
}

const compactCard = "[--card-spacing:1rem] md:[--card-spacing:1.375rem]"

function LogisticsPanel({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile(768)
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setOpen(!isMobile)
  }, [isMobile])

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="overflow-hidden rounded-xl border bg-muted/15">
      <CollapsibleTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 border-b bg-card/80 px-3.5 py-2.5 text-left sm:px-4 sm:py-3 md:pointer-events-none md:cursor-default"
          />
        }
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <Ship className="size-3.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">{t("calculator.logisticsGroup")}</p>
            <h3 className="text-sm font-semibold tracking-tight">{t("calculator.logisticsTitle")}</h3>
          </div>
        </div>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform md:hidden", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="grid grid-cols-1 gap-3.5 p-3.5 sm:grid-cols-2 sm:gap-4 sm:p-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

function SpecPanel({
  icon: Icon,
  eyebrow,
  title,
  children,
  columns = 1,
}: {
  icon: React.ComponentType<{ className?: string }>
  eyebrow: string
  title: string
  children: React.ReactNode
  columns?: 1 | 2
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-muted/15">
      <div className="flex items-center gap-2.5 border-b bg-card/80 px-3.5 py-2.5 sm:px-4 sm:py-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        </div>
      </div>
      <div
        className={cn(
          "grid gap-3.5 p-3.5 sm:gap-4 sm:p-4",
          columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
        )}
      >
        {children}
      </div>
    </section>
  )
}

function FormCardHeader({ mode }: { mode: "customs" | "import" }) {
  const { t } = useTranslation()
  const copy =
    mode === "customs"
      ? {
          eyebrow: t("calculator.customsEyebrow"),
          title: t("calculator.customsTitle"),
          lead: t("calculator.customsLead"),
        }
      : {
          eyebrow: t("calculator.importEyebrow"),
          title: t("calculator.importTitle"),
          lead: t("calculator.importLead"),
        }

  return (
    <CardHeader className="rounded-none border-b bg-[linear-gradient(180deg,color-mix(in_oklch,var(--secondary)_55%,var(--card))_0%,var(--card)_100%)] px-4 py-3.5 sm:px-5 sm:py-4 [.border-b]:pb-4">
      <div className="flex items-start gap-3 sm:gap-3.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 sm:size-10">
          <Calculator className="size-4" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">{copy.eyebrow}</span>
            <span className="hidden h-3 w-px bg-border sm:block" aria-hidden="true" />
            <span className="text-[11px] leading-snug text-muted-foreground sm:leading-none">{copy.lead}</span>
          </div>

          <CardTitle className="mt-1.5 text-base font-semibold tracking-tight sm:text-lg md:text-xl">{copy.title}</CardTitle>

          <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-2.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-[10px] text-muted-foreground ring-1 ring-border/60">
              <ShieldCheck className="size-3 text-primary" aria-hidden="true" />
              {t("calculator.fxRate")}
            </span>
            <span className="inline-flex items-center rounded-md bg-background/80 px-2 py-1 font-mono text-[10px] text-muted-foreground ring-1 ring-border/60">
              {t("calculator.rules")}
            </span>
            <span className="inline-flex items-center rounded-md bg-background/80 px-2 py-1 text-[10px] text-muted-foreground ring-1 ring-border/60">
              {t("calculator.structure")}
            </span>
          </div>
        </div>
      </div>
    </CardHeader>
  )
}

function SteeringField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useTranslation()
  const options = [
    { value: "left", label: t("calculator.steeringLeft") },
    { value: "right", label: t("calculator.steeringRight") },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("calculator.steering")}>
      {options.map(({ value: optionValue, label }) => {
        const selected = value === optionValue
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(optionValue)}
            className={cn(
              "h-11 rounded-xl border text-sm font-medium transition-[color,box-shadow,background-color,border-color]",
              selected
                ? "border-primary bg-primary text-primary-foreground shadow-sm animate-press-in"
                : "border-input bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function FormFieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <FieldLabel htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
      {children}
    </FieldLabel>
  )
}

function EstimateEmptyState({ mode }: { mode: "customs" | "import" }) {
  const { t } = useTranslation()
  const previewLinesKa =
    mode === "import"
      ? ["შესყიდვა", "Copart საკომისიო", "ტრანსპორტი", "განბაჟება"]
      : ["აქციზი", "დღგ", "საბაჟო მოსაკრებელი"]
  const previewLinesEn =
    mode === "import"
      ? ["Purchase", "Copart Fee", "Shipping", "Customs"]
      : ["Excise", "VAT", "Customs Fee"]
  const previewLines = t("calculator.customsEyebrow") === "განბაჟება" ? previewLinesKa : previewLinesEn

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
      <div className="rounded-xl border border-dashed bg-muted/35 px-4 py-4 text-center">
        <p className="text-sm font-medium">{t("calculator.resultWillAppear")}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {t("calculator.fillData")}
        </p>
      </div>

      <div className="space-y-2.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground">{t("calculator.structure")}</p>
        {previewLines.map((line, index) => (
          <div key={line} className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground/70">{line}</span>
            <span className="h-2.5 w-20 rounded-full bg-muted shimmer" aria-hidden="true" style={{ animationDelay: `${index * 120}ms` }} />
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span>{t("calculator.fxRate")} · {t("calculator.rules")}</span>
      </div>
    </div>
  )
}

function EstimateLoadingState() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-1 flex-col justify-center gap-4 p-4 sm:p-5" role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium">{t("calculator.calculating")}</span>
        <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
      </div>
      <Progress value={68} className="h-1.5" />
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t("calculator.checking")}
      </p>
    </div>
  )
}

function CostStructureBar({ lines, total }: { lines: Result["lines"]; total: number }) {
  const { formatGel } = useTranslation()
  const gel = { format: formatGel }

  const segments = lines
    .map((line, index) => ({ ...line, index, share: lineShare(line.amountGel, total) }))
    .filter((line) => line.amountGel > 0)

  if (segments.length === 0) return null

  return (
    <div className="border-b px-4 py-3 sm:px-5">
      <div
        className="flex h-2.5 gap-px overflow-hidden rounded-full bg-border/50 p-px"
        role="img"
        aria-label="ხარჯების პროპორციული განაწილება"
      >
        {segments.map(({ label, amountGel, index, share }) => (
          <span
            key={`${label}-${index}`}
            className={cn(costSegmentColor(index), "min-w-0 animate-grow-width rounded-[1px]")}
            style={{ width: `${share}%` }}
            title={`${label}: ${gel.format(amountGel)} (${formatShare(share)})`}
          />
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
        {segments.map(({ label, index, share }) => (
          <span
            key={`legend-${label}-${index}`}
            className="inline-flex max-w-full items-center gap-1.5 text-[11px] text-muted-foreground"
          >
            <i
              className={cn("size-2 shrink-0 rounded-full", costSegmentColor(index))}
              aria-hidden="true"
            />
            <span className="truncate">{label}</span>
            <span className="font-mono tabular-nums text-foreground/70">{formatShare(share)}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function EstimateResult({ result, mode }: { result: Result; mode: "customs" | "import" }) {
  const { t, formatGel } = useTranslation()
  const gel = { format: formatGel }

  return (
    <div className="result-reveal flex flex-1 flex-col">
      <CostStructureBar lines={result.lines} total={result.totalGel} />

      <div className="flex-1">
        {result.lines.map((line, index) => {
          const share = lineShare(line.amountGel, result.totalGel)
          return (
            <div
              key={`${line.label}-${index}`}
              className="flex items-start justify-between gap-4 border-b px-4 py-3 last:border-0 sm:px-5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <i
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      line.amountGel > 0 ? costSegmentColor(index) : "bg-muted"
                    )}
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium">{line.label}</p>
                  {share >= 0.5 && (
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                      {formatShare(share)}
                    </span>
                  )}
                </div>
                {line.hint && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{line.hint}</p>}
              </div>
              <strong className="shrink-0 font-mono text-sm tabular-nums">{gel.format(line.amountGel)}</strong>
            </div>
          )
        })}
      </div>

      <div className="mt-auto shrink-0 border-t bg-muted/45 px-4 py-3 sm:px-5">
        <div className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
          <span className="flex items-center gap-1.5">
            <CircleDollarSign className="size-3.5 text-primary" aria-hidden="true" />
            1 USD = {result.exchangeRate.toFixed(4)} GEL
          </span>
          <span className="sm:text-right">{result.exchangeSource}</span>
          <span>{t("calculator.rules")}</span>
          <span className="sm:text-right">
            {mode === "customs" 
              ? `${t("calculator.yearDesc").split(" ")[0]} · ${result.age} ${t("calculator.ageYears")}` 
              : `${t("calculator.exciseDuty")} ${gel.format(result.exciseGel)} · ${t("calculator.vatTax")} ${gel.format(result.vatGel)}`
            }
          </span>
        </div>
      </div>
    </div>
  )
}

function EstimatePanel({
  mode,
  result,
  loading,
}: {
  mode: "customs" | "import"
  result: Result | null
  loading: boolean
}) {
  const { t, formatGel } = useTranslation()
  const gel = { format: formatGel }

  return (
    <aside
      className="flex flex-col md:sticky md:top-[calc(var(--header-offset)+1rem)] md:self-start"
      aria-live="polite"
      aria-atomic="true"
    >
      <Card className={cn("calculator-surface flex flex-col gap-0 overflow-hidden border-foreground/10 py-0 md:min-h-[min(100%,28rem)]", compactCard)}>
        <CardHeader className="rounded-none border-b bg-[linear-gradient(135deg,#0a0a0a_0%,#171717_55%,#7f1d1d_140%)] px-4 py-3.5 text-white sm:px-5 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardDescription className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">
                {t("calculator.fullEstimate")}
              </CardDescription>
              <CardTitle className="mt-1.5 font-mono text-2xl font-bold tracking-tighter tabular-nums sm:text-3xl md:text-[2.25rem]">
                {result ? gel.format(result.totalGel) : "-"}
              </CardTitle>
              {!loading && !result && (
                <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                  {mode === "import" ? t("calculator.importLimit") : t("calculator.customsLimit")}
                </p>
              )}
              {result && (
                <p className="mt-1.5 text-xs text-white/55">
                  {mode === "import" ? t("calculator.importDetails") : t("calculator.customsDetails")}
                </p>
              )}
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur-sm">
              <Receipt className="size-4" aria-hidden="true" />
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          {loading ? (
            <EstimateLoadingState />
          ) : result ? (
            <EstimateResult result={result} mode={mode} />
          ) : (
            <EstimateEmptyState mode={mode} />
          )}
        </CardContent>
      </Card>
    </aside>
  )
}

export function VehicleCalculator({ mode, initial }: { mode: "customs" | "import"; initial?: Partial<FormState> }) {
  const { t, formatUsd } = useTranslation()
  const usd = { format: formatUsd }

  const powertrainLabels: Record<string, string> = {
    gasoline: t("calculator.powertrains.gasoline"),
    diesel: t("calculator.powertrains.diesel"),
    hybrid: t("calculator.powertrains.hybrid"),
    electric: t("calculator.powertrains.electric"),
  }

  const [form, setForm] = useState<FormState>({ ...defaultForm, ...initial })
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const isMobile = useIsMobile(768)
  const showResultFirst = isMobile && (Boolean(result) || loading)

  const set = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const purchasePreview = useMemo(() => {
    const value = Number(form.purchaseUsd)
    return Number.isFinite(value) && value > 0 ? usd.format(value) : null
  }, [form.purchaseUsd, usd])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/calculate/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("calculator.calculationError"))
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setError("")
  }

  const logisticsFields: Array<[keyof FormState, string, string?]> = [
    ["inlandUsd", t("calculator.inlandTax"), t("calculator.inlandUsdDesc")],
    ["oceanUsd", t("calculator.oceanTax"), t("calculator.oceanUsdDesc")],
    ["insuranceUsd", t("calculator.insuranceTax"), t("calculator.insuranceUsdDesc")],
    ["portUsd", t("calculator.portTax"), t("calculator.portUsdDesc")],
    ["repairsUsd", t("calculator.repairsTax"), t("calculator.repairsUsdDesc")],
  ]

  return (
    <div className="page-container page-section grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] md:items-start md:gap-6 lg:gap-8">
      <Card className={cn("calculator-surface flex flex-col gap-0 overflow-hidden border-foreground/10 py-0", compactCard, showResultFirst ? "order-2 md:order-1" : "order-1")}>
        <FormCardHeader mode={mode} />

        <CardContent className="shrink-0 px-4 pt-4 sm:px-5 sm:pt-5">
          <form id="vehicle-calculator-form" onSubmit={submit}>
            <FieldGroup className="gap-4 sm:gap-5">
              <SpecPanel icon={CarFront} eyebrow={t("calculator.specGroup")} title={t("calculator.specTitle")} columns={2}>
                <Field>
                  <FormFieldLabel htmlFor="purchase">{t("calculator.purchasePrice")}</FormFieldLabel>
                  <UsdField
                    id="purchase"
                    value={form.purchaseUsd}
                    onChange={(value) => set("purchaseUsd", value)}
                    placeholder="8500"
                    required
                    min="1"
                  />
                  {purchasePreview && (
                    <FieldDescription className="font-mono text-[11px] tabular-nums">
                      {purchasePreview} · {t("calculator.purchasePriceDesc")}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FormFieldLabel htmlFor="year">{t("calculator.year")}</FormFieldLabel>
                  <YearField
                    id="year"
                    value={form.year}
                    onChange={(value) => set("year", value)}
                    placeholder="2022"
                    required
                  />
                </Field>

                <Field>
                  <FormFieldLabel htmlFor="cc">{t("calculator.engineCc")}</FormFieldLabel>
                  <EngineField
                    id="cc"
                    value={form.engineCc}
                    onChange={(value) => set("engineCc", value)}
                    placeholder="2000"
                    required
                  />
                </Field>

                <Field>
                  <FormFieldLabel htmlFor="powertrain">{t("calculator.powertrain")}</FormFieldLabel>
                  <Select value={form.powertrain} onValueChange={(value) => value && set("powertrain", value)}>
                    <SelectTrigger id="powertrain" className={calculatorControlShell}>
                      <SelectValue>{powertrainLabels[form.powertrain] ?? form.powertrain}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.entries(powertrainLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field className="sm:col-span-2">
                  <FormFieldLabel>{t("calculator.steering")}</FormFieldLabel>
                  <SteeringField value={form.steering} onChange={(value) => set("steering", value)} />
                </Field>
              </SpecPanel>

              {mode === "import" && (
                <LogisticsPanel>
                  <Field>
                    <FormFieldLabel htmlFor="feesMode">{t("calculator.feesMode")}</FormFieldLabel>
                    <Select value={form.feesMode} onValueChange={(value) => value && set("feesMode", value)}>
                      <SelectTrigger id="feesMode" className={calculatorControlShell}>
                        <SelectValue>
                          {form.feesMode === "auto" ? t("calculator.feesModeAuto") : t("calculator.feesModeManual")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="auto">{t("calculator.feesModeAuto")}</SelectItem>
                          <SelectItem value="manual">{t("calculator.feesModeManual")}</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  {form.feesMode === "manual" && (
                    <Field>
                      <FormFieldLabel htmlFor="feesUsd">{t("calculator.feesUsd")}</FormFieldLabel>
                      <UsdField
                        id="feesUsd"
                        value={form.feesUsd}
                        onChange={(value) => set("feesUsd", value)}
                        placeholder="0"
                      />
                    </Field>
                  )}

                  {logisticsFields.map(([key, label, hint]) => (
                    <Field key={key}>
                      <FormFieldLabel htmlFor={key}>{label}</FormFieldLabel>
                      <UsdField id={key} value={form[key]} onChange={(value) => set(key, value)} />
                      {hint && <FieldDescription className="text-[11px]">{hint}</FieldDescription>}
                    </Field>
                  ))}
                </LogisticsPanel>
              )}

              {mode === "customs" && (
                <div className="flex items-center gap-2.5 rounded-xl border border-dashed bg-muted/20 px-3.5 py-2.5">
                  <Info className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {t("calculator.onlyCustomsComponents")}{" "}
                    <a href="/import-calculator" className="font-medium text-foreground underline-offset-4 hover:underline">
                      {t("nav.import") === "იმპორტი" ? "იმპორტის კალკულატორი" : "Import Calculator"}
                    </a>
                  </p>
                </div>
              )}
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="mt-auto flex flex-1 flex-col items-stretch justify-center gap-3 border-t bg-muted/20 px-(--card-spacing) py-5">
          {error && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>{t("calculator.calculationError")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex w-full gap-2.5">
            <Button
              type="submit"
              form="vehicle-calculator-form"
              size="lg"
              className="h-12 min-h-12 flex-1 rounded-xl text-sm shadow-sm transition-transform active:scale-[0.98] md:h-11 md:min-h-11"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  {t("calculator.calculatingBtn")}
                </>
              ) : (
                <>
                  {t("calculator.calculateBtn")}
                  <ArrowRight data-icon="inline-end" />
                </>
              )}
            </Button>
            <Button
              type="button"
              size="icon-lg"
              variant="outline"
              className="size-12 shrink-0 rounded-xl transition-transform active:scale-[0.98] md:size-11"
              aria-label={t("calculator.resetTooltip")}
              onClick={reset}
              disabled={loading || !result}
            >
              <RotateCcw />
            </Button>
          </div>

          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            {t("calculator.disclaimer")}
          </p>
        </CardFooter>
      </Card>

      <div className={cn(showResultFirst ? "order-1 md:order-2" : "order-2 md:order-2")}>
        <EstimatePanel mode={mode} result={result} loading={loading} />
      </div>
    </div>
  )
}
