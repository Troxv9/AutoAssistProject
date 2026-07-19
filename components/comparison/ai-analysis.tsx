"use client"

import { AlertTriangle, BadgeCheck, Check, ChevronDown, CircleAlert, Gauge, Info, PiggyBank, ShieldAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spotlight } from "@/components/ui/spotlight-new"
import { useTranslation } from "@/lib/locale-context"

export function AiAnalysis({
  analysis,
  loading,
  error,
  onGenerate,
}: {
  analysis: any | null
  loading: boolean
  error: string | null
  onGenerate?: () => void
}) {
  const { locale } = useTranslation()

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-card/65 p-6 backdrop-blur-md md:p-10">
      <Spotlight />
      <div className="relative z-10">
        <div className="mb-6 border-b pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
              {locale === "ka" ? "ხელოვნური ინტელექტი" : "Artificial Intelligence"}
            </p>
            <h3 className="mt-1 text-xl font-bold md:text-2xl">
              {locale === "ka" ? "AI ანალიზი" : "AI Analysis"}
            </h3>
          </div>
        </div>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <div className="h-2" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}

        {error && (
          <div className="space-y-3">
            <Alert variant="destructive">
              <Info />
              <AlertTitle>{locale === "ka" ? "ანალიზი ვერ ჩაიტვირთა" : "Failed to load analysis"}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            {onGenerate && (
              <Button onClick={onGenerate} variant="outline" className="h-10 rounded-xl cursor-pointer">
                {locale === "ka" ? "ხელახლა ცდა" : "Try again"}
              </Button>
            )}
          </div>
        )}

        {!loading && !error && !analysis && onGenerate && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-muted/20 p-8 text-center md:p-10">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
              <img src="/artificial-intelligence.svg" alt="" className="size-6" />
            </span>
            <div className="max-w-md">
              <p className="text-sm font-semibold">
                {locale === "ka" ? "მიიღეთ AI დეტალური ანალიზი" : "Get a detailed AI analysis"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {locale === "ka"
                  ? "AI შეადარებს ფინანსებს, რისკებსა და საიმედოობას მიმდინარე ადგილობრივი განცხადებისთვის."
                  : "The AI compares finances, risk and reliability for the local listing currently shown."}
              </p>
            </div>
            <Button onClick={onGenerate} className="h-11 rounded-xl px-6 cursor-pointer">
              <img src="/artificial-intelligence.svg" alt="" className="size-4 brightness-0 invert" data-icon="inline-start" />
              {locale === "ka" ? "გენერაცია" : "Generate"}
            </Button>
          </div>
        )}

        {analysis && (
          <div className="space-y-8 text-foreground">
            {/* Header Verdict Card */}
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border bg-muted/20 p-5 md:flex-row md:items-center md:p-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Check
                     className={`size-3.5 shrink-0 ${analysis.verdict === "import" ? "text-[#7f1d1d]" : analysis.verdict === "local" ? "text-primary" : "text-yellow-500"}`}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {locale === "ka" ? "ვერდიქტი" : "Verdict"}
                  </span>
                </div>
                <h4 className="text-base font-bold text-foreground">{analysis.title}</h4>
                <p className="text-xs leading-relaxed text-muted-foreground">{analysis.summary}</p>
              </div>
              <Badge variant={analysis.verdict === "import" ? "destructive" : analysis.verdict === "local" ? "default" : "secondary"} className="shrink-0 px-3 py-1 text-xs font-semibold uppercase">
                {analysis.verdict === "import" 
                  ? (locale === "ka" ? "იმპორტი" : "Import") 
                  : analysis.verdict === "local" 
                    ? (locale === "ka" ? "ადგილობრივი" : "Local") 
                    : (locale === "ka" ? "თანაბარი" : "Equal")
                }
              </Badge>
            </div>

            {/* Metrics Comparison Scorecards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Financial Value Metric */}
              <div className="space-y-4 rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {locale === "ka" ? "ფინანსური სარგებელი" : "Financial Benefit"}
                  </span>
                  <PiggyBank className="size-4 text-primary" />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">{locale === "ka" ? "იმპორტი" : "Import"}</span>
                      <span className="font-mono font-semibold">{analysis.scores?.financialScoreImport || 50}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${analysis.scores?.financialScoreImport || 50}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">{locale === "ka" ? "ადგილობრივი" : "Local"}</span>
                      <span className="font-mono font-semibold">{analysis.scores?.financialScoreLocal || 50}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary/40 transition-all duration-500" style={{ width: `${analysis.scores?.financialScoreLocal || 50}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Risks Metric */}
              <div className="space-y-4 rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {locale === "ka" ? "უსაფრთხოება და რისკები" : "Safety and Risks"}
                  </span>
                  <ShieldAlert className="size-4 text-primary" />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {locale === "ka" ? "იმპორტი (რისკი)" : "Import (Risk)"}
                      </span>
                      <span className="font-mono font-semibold">{analysis.scores?.riskScoreImport || 50}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full transition-all duration-500 ${(analysis.scores?.riskScoreImport || 50) > 70 ? "bg-destructive" : (analysis.scores?.riskScoreImport || 50) > 40 ? "bg-orange-500" : "bg-green-600"}`} style={{ width: `${analysis.scores?.riskScoreImport || 50}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {locale === "ka" ? "ადგილობრივი (რისკი)" : "Local (Risk)"}
                      </span>
                      <span className="font-mono font-semibold">{analysis.scores?.riskScoreLocal || 50}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full transition-all duration-500 ${(analysis.scores?.riskScoreLocal || 50) > 70 ? "bg-destructive" : (analysis.scores?.riskScoreLocal || 50) > 40 ? "bg-orange-500" : "bg-green-600"}`} style={{ width: `${analysis.scores?.riskScoreLocal || 50}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reliability Metric */}
              <div className="space-y-4 rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {locale === "ka" ? "საიმედოობა" : "Reliability"}
                  </span>
                  <Gauge className="size-4 text-primary" />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">{locale === "ka" ? "იმპორტი" : "Import"}</span>
                      <span className="font-mono font-semibold">{analysis.scores?.reliabilityScoreImport || 50}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${analysis.scores?.reliabilityScoreImport || 50}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">{locale === "ka" ? "ადგილობრივი" : "Local"}</span>
                      <span className="font-mono font-semibold">{analysis.scores?.reliabilityScoreLocal || 50}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary/40 transition-all duration-500" style={{ width: `${analysis.scores?.reliabilityScoreLocal || 50}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key specs highlight grid */}
            {analysis.specs && analysis.specs.length > 0 && (
              <div className="space-y-4 rounded-2xl border bg-card p-5">
                <h5 className="text-sm font-bold text-foreground">
                  {locale === "ka" ? "ძირითადი პარამეტრების შედარება" : "Key Parameters Comparison"}
                </h5>
                <div className="flex flex-col gap-3">
                  {analysis.specs.map((spec: any, idx: number) => (
                    <div key={idx} className="rounded-xl border bg-card/40 p-3.5 sm:p-4">
                      <p className="mb-3 text-xs font-bold text-foreground">{spec.name}</p>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        <div className={`min-w-0 rounded-lg p-3 ${spec.highlight === "copart" ? "border border-primary/20 bg-primary/5" : "bg-muted/30"}`}>
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            {locale === "ka" ? "ამერიკული იმპორტი (Copart)" : "US Import (Copart)"}
                          </p>
                          <p className={`mt-1 break-words text-sm ${spec.highlight === "copart" ? "font-bold text-primary" : "font-medium text-foreground"}`}>{spec.copartValue}</p>
                          {spec.highlight === "copart" && spec.comment && <p className="mt-1 text-[11px] leading-normal text-muted-foreground">{spec.comment}</p>}
                        </div>
                        <div className={`min-w-0 rounded-lg p-3 ${spec.highlight === "myauto" ? "border border-primary/20 bg-primary/5" : "bg-muted/30"}`}>
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            {locale === "ka" ? "ადგილობრივი შეთავაზება (autopapa.ge)" : "Local Listing (autopapa.ge)"}
                          </p>
                          <p className={`mt-1 break-words text-sm ${spec.highlight === "myauto" ? "font-bold text-primary" : "font-medium text-foreground"}`}>{spec.myautoValue}</p>
                          {spec.highlight === "myauto" && spec.comment && <p className="mt-1 text-[11px] leading-normal text-muted-foreground">{spec.comment}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pros and Cons */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-4 rounded-2xl border bg-card/45 p-5">
                <h5 className="border-b pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {locale === "ka" ? "ამერიკული იმპორტი (Copart)" : "US Import (Copart)"}
                </h5>
                <div className="space-y-3">
                  {analysis.advantages?.importPros?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-green-600">
                        <Check className="size-3.5" />
                        {locale === "ka" ? "უპირატესობები" : "Advantages"}
                      </p>
                      <ul className="space-y-1">
                        {analysis.advantages.importPros.map((pro: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                            <BadgeCheck className="mt-0.5 size-3 shrink-0 text-green-600" aria-hidden="true" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.advantages?.importCons?.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-destructive">
                        <AlertTriangle className="size-3.5 text-destructive" />
                        {locale === "ka" ? "რისკები და მინუსები" : "Risks and Cons"}
                      </p>
                      <ul className="space-y-1">
                        {analysis.advantages.importCons.map((con: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                            <CircleAlert className="mt-0.5 size-3 shrink-0 text-destructive" aria-hidden="true" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border bg-card/45 p-5">
                <h5 className="border-b pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {locale === "ka" ? "ადგილობრივი შეძენა (autopapa.ge)" : "Local Purchase (autopapa.ge)"}
                </h5>
                <div className="space-y-3">
                  {analysis.advantages?.localPros?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-green-600">
                        <Check className="size-3.5" />
                        {locale === "ka" ? "უპირატესობები" : "Advantages"}
                      </p>
                      <ul className="space-y-1">
                        {analysis.advantages.localPros.map((pro: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                            <BadgeCheck className="mt-0.5 size-3 shrink-0 text-green-600" aria-hidden="true" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.advantages?.localCons?.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-destructive">
                        <AlertTriangle className="size-3.5 text-destructive" />
                        {locale === "ka" ? "რისკები და მინუსები" : "Risks and Cons"}
                      </p>
                      <ul className="space-y-1">
                        {analysis.advantages.localCons.map((con: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                            <CircleAlert className="mt-0.5 size-3 shrink-0 text-destructive" aria-hidden="true" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Analysis Accordion */}
            <div className="border-t pt-4">
              <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {locale === "ka" ? "დეტალური დასკვნა" : "Detailed Verdict"}
              </h5>
              <div className="space-y-2">
                <details className="group overflow-hidden rounded-xl border bg-card/30 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer select-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted/10">
                    <span className="min-w-0">
                      {locale === "ka" ? "1. ფინანსური ხარჯები და დანაზოგის რეალურობა" : "1. Financial Costs & Savings Validity"}
                    </span>
                    <ChevronDown className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="whitespace-pre-line border-t px-4 pb-4 pt-1 text-xs leading-relaxed text-muted-foreground">{analysis.details?.financialAnalysis}</div>
                </details>
                <details className="group overflow-hidden rounded-xl border bg-card/30 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer select-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted/10">
                    <span className="min-w-0">
                      {locale === "ka" ? "2. კრიტიკული რისკების შეფასება (იმპორტი vs ადგილობრივი)" : "2. Critical Risk Assessment (Import vs Local)"}
                    </span>
                    <ChevronDown className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="whitespace-pre-line border-t px-4 pb-4 pt-1 text-xs leading-relaxed text-muted-foreground">{analysis.details?.riskAssessment}</div>
                </details>
                <details className="group overflow-hidden rounded-xl border bg-card/30 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer select-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted/10">
                    <span className="min-w-0">
                      {locale === "ka" ? "3. საბოლოო რეკომენდაცია" : "3. Final Recommendation"}
                    </span>
                    <ChevronDown className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="whitespace-pre-line border-t px-4 pb-4 pt-1 text-xs leading-relaxed text-muted-foreground">{analysis.details?.expertRecommendation}</div>
                </details>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
