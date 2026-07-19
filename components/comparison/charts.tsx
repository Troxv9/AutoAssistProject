"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { PieChart } from "lucide-react"
import type { CostLine } from "@/lib/vehicles"
import { formatShare, lineShare } from "@/lib/cost-segments"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/locale-context"
import { translateCostLabel } from "@/lib/translations"

const SEGMENT_HEX = [
  "#dc2626", "#0a0a0a", "#737373", "#991b1b", "#404040",
  "#ef4444", "#a3a3a3", "#262626", "#7f1d1d", "#525252",
] as const

function segmentHex(index: number) {
  return SEGMENT_HEX[index % SEGMENT_HEX.length]
}

const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

const DONUT_VIEWBOX = 200
const CHART_INSET = 16

type CostOverviewProps = {
  lines: CostLine[]
  importTotalGel: number
  localTotalGel: number
  verdict: "import" | "local" | "equal"
}

export function CostOverview({ lines, importTotalGel, localTotalGel, verdict }: CostOverviewProps) {
  const { locale, formatGel } = useTranslation()
  const gel = { format: formatGel }

  const total = lines.reduce((sum, line) => sum + Math.max(0, line.amountGel), 0) || 1
  const segments = lines
    .map((line, index) => ({ ...line, index, share: lineShare(line.amountGel, total) }))
    .filter((line) => line.amountGel > 0)
    .sort((a, b) => b.share - a.share || b.amountGel - a.amountGel)

  const [active, setActive] = useState<number | null>(null)

  const size = DONUT_VIEWBOX
  const stroke = 22
  const hoverStroke = stroke + 4
  const radius = (size - hoverStroke) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2
  const segmentGap = 2.5
  const viewBox = `${-CHART_INSET} ${-CHART_INSET} ${size + CHART_INSET * 2} ${size + CHART_INSET * 2}`

  let cumulative = 0
  const arcs = segments.map((seg) => {
    const fraction = seg.amountGel / total
    const dash = Math.max(0, fraction * circumference - segmentGap)
    const offset = -cumulative * circumference - segmentGap / 2
    cumulative += fraction
    return { ...seg, dash, offset, fraction }
  })

  const activeSeg = active != null ? arcs.find((arc) => arc.index === active) : null

  const setSegmentActive = (index: number | null) => setActive(index)
  const toggleSegment = (index: number) => setActive((current) => (current === index ? null : index))

  const totalsMax = Math.max(importTotalGel, localTotalGel, 1)
  const totalRows = useMemo(() => [
    { key: "import", label: locale === "ka" ? "აშშ-დან იმპორტი" : "US Import", value: importTotalGel, cheapest: verdict === "import" },
    { key: "local", label: locale === "ka" ? "ადგილობრივი შეძენა" : "Local Purchase", value: localTotalGel, cheapest: verdict === "local" },
  ], [locale, importTotalGel, localTotalGel, verdict])

  return (
    <div className="rounded-2xl border bg-card p-5 md:p-6 lg:p-7">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">{locale === "ka" ? "კალკულაცია" : "Calculation"}</p>
          <h3 className="mt-1 text-base font-bold tracking-tight sm:text-lg">{locale === "ka" ? "ხარჯების სტრუქტურა და შედარება" : "Cost Structure & Comparison"}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{locale === "ka" ? "დააჰოვერეთ სეგმენტს დეტალებისთვის" : "Hover over a segment for details"}</p>
        </div>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <PieChart className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-6 flex justify-center overflow-visible py-1">
        <div className="relative aspect-square w-56 overflow-visible sm:w-60 md:w-64 lg:w-72">
          <svg
            viewBox={viewBox}
            role="img"
            aria-label={locale === "ka" ? "იმპორტის ხარჯების განაწილება" : "Import cost distribution"}
            className="size-full overflow-visible"
          >
            <g transform={`rotate(-90 ${center} ${center})`}>
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeWidth={stroke}
              />
              {arcs.map((arc) => (
                <motion.circle
                  key={`${arc.label}-${arc.index}`}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={segmentHex(arc.index)}
                  strokeWidth={active === arc.index ? hoverStroke : stroke}
                  strokeLinecap="round"
                  strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
                  strokeDashoffset={arc.offset}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: active == null || active === arc.index ? 1 : 0.28 }}
                  transition={{ duration: 0.25 }}
                  onMouseEnter={() => setSegmentActive(arc.index)}
                  onMouseLeave={() => setSegmentActive(null)}
                  onClick={() => toggleSegment(arc.index)}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </g>
          </svg>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex aspect-square w-[42%] min-w-0 flex-col items-center justify-center rounded-full border border-border/60 bg-card/90 px-2 text-center shadow-sm backdrop-blur-sm">
              <span className="line-clamp-2 text-[9px] font-medium uppercase leading-tight tracking-[0.12em] text-muted-foreground sm:text-[10px]">
                {activeSeg ? translateCostLabel(activeSeg.label, locale) : (locale === "ka" ? "სულ" : "Total")}
              </span>
              <span className="mt-1 font-mono text-sm font-bold tabular-nums leading-none sm:text-base md:text-lg">
                {gel.format(activeSeg ? activeSeg.amountGel : total)}
              </span>
              {activeSeg ? (
                <span className="mt-1 font-mono text-[10px] tabular-nums text-muted-foreground sm:text-xs">
                  {formatShare(activeSeg.share)}
                </span>
              ) : (
                <span className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                  {locale === "ka" ? `${segments.length} სეგმენტი` : `${segments.length} segments`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {arcs.map((arc) => {
          const isActive = active === arc.index
          const color = segmentHex(arc.index)

          return (
            <li key={`legend-${arc.label}-${arc.index}`}>
              <button
                type="button"
                onMouseEnter={() => setSegmentActive(arc.index)}
                onMouseLeave={() => setSegmentActive(null)}
                onClick={() => toggleSegment(arc.index)}
                aria-pressed={isActive}
                className={cn(
                  "flex h-full w-full flex-col rounded-lg border px-2.5 py-2 text-left transition-colors cursor-pointer",
                  isActive
                    ? "border-border/70 bg-muted/40"
                    : "border-border/40 bg-muted/15 hover:border-border/60 hover:bg-muted/30"
                )}
              >
                <div className="flex items-start gap-1.5">
                  <span
                    className="mt-1 size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span className="line-clamp-2 min-w-0 flex-1 text-[11px] font-medium leading-snug text-foreground/90">
                    {translateCostLabel(arc.label, locale)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold tabular-nums text-muted-foreground">
                    {formatShare(arc.share)}
                  </span>
                  <span className="font-mono text-[11px] font-semibold tabular-nums">
                    {gel.format(arc.amountGel)}
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{ width: `${arc.share}%`, backgroundColor: color }}
                  />
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <Separator className="my-6" />

      <div>
        <h4 className="font-bold">{locale === "ka" ? "სრული ღირებულების შედარება" : "Total Cost Comparison"}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{locale === "ka" ? "ვინ არის უფრო იაფი — ვიზუალურად" : "Cheaper option - visualized"}</p>

        <div className="mt-5 flex flex-col gap-4 sm:gap-5">
          {totalRows.map((row) => (
            <div key={row.key}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-medium">
                  <span className="truncate">{row.label}</span>
                  {row.cheapest && (
                    <span className="shrink-0 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {locale === "ka" ? "ყველაზე იაფი" : "Cheapest"}
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-mono font-semibold tabular-nums">{gel.format(row.value)}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={row.cheapest ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-primary"}
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${(row.value / totalsMax) * 100}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
