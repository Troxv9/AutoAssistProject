"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Search,
  Coins,
  MapPin,
  ChevronRight,
  HelpCircle,
  Truck,
  Ship,
  FileText,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { normalizeDash } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/locale-context"

type Rate = {
  id: string
  location_label: string
  location_label_en: string | null
  location_key: string
  state_code: string
  inland_usd: number
  ocean_usd: number
  insurance_usd: number
  port_usd: number
}

const EAST_COAST = new Set(["NJ", "NY", "MD", "VA", "MA", "PA", "DE", "CT", "RI", "NH", "ME", "VT", "NC", "SC"])
const WEST_COAST = new Set(["CA", "WA", "OR", "AZ", "NV", "UT", "ID", "MT", "WY", "CO", "NM"])
const SOUTH_GULF = new Set(["TX", "FL", "GA", "AL", "LA", "MS", "TN", "AR", "OK"])

export function ShippingRates({
  rates,
  exchangeRate,
  exchangeSource,
}: {
  rates: Rate[]
  exchangeRate: number
  exchangeSource: string
}) {
  const [q, setQ] = useState("")
  const [currency, setCurrency] = useState<"USD" | "GEL">("USD")
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const { t, locale } = useTranslation()

  const labelFor = (r: Rate) =>
    normalizeDash(locale === "en" ? r.location_label_en || r.location_label : r.location_label)

  const REGION_TABS = useMemo(() => [
    { id: "all", label: locale === "ka" ? "ყველა ლოკაცია" : "All Locations", shortLabel: locale === "ka" ? "ყველა" : "All" },
    { id: "east", label: locale === "ka" ? "აღმოსავლეთ სანაპირო" : "East Coast", shortLabel: locale === "ka" ? "აღმ. სანაპირო" : "East Coast" },
    { id: "west", label: locale === "ka" ? "დასავლეთ სანაპირო" : "West Coast", shortLabel: locale === "ka" ? "დას. სანაპირო" : "West Coast" },
    { id: "south", label: locale === "ka" ? "სამხრეთი / ყურე" : "South / Gulf", shortLabel: locale === "ka" ? "სამხრეთი" : "South" },
  ], [locale])

  const gelFmt = useMemo(() => new Intl.NumberFormat(locale === "en" ? "en-US" : "ka-GE", { style: "currency", currency: "GEL", maximumFractionDigits: 0 }), [locale])
  const usdFmt = useMemo(() => new Intl.NumberFormat(locale === "en" ? "en-US" : "ka-GE", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), [locale])

  const formatCost = (usdVal: number) => {
    if (currency === "GEL") {
      return gelFmt.format(Math.round(usdVal * exchangeRate))
    }
    return usdFmt.format(usdVal)
  }

  const matchesRegion = (stateCode: string) => {
    const code = stateCode?.toUpperCase()?.trim()
    if (selectedRegion === "all") return true
    if (selectedRegion === "east") return EAST_COAST.has(code)
    if (selectedRegion === "west") return WEST_COAST.has(code)
    if (selectedRegion === "south") return SOUTH_GULF.has(code)
    return true
  }

  const shown = useMemo(() => {
    return rates.filter((r) => {
      const queryMatch = `${r.location_label} ${r.location_label_en ?? ""} ${r.location_key} ${r.state_code}`
        .toLowerCase()
        .includes(q.toLowerCase())
      const regionMatch = matchesRegion(r.state_code)
      return queryMatch && regionMatch
    })
  }, [q, rates, selectedRegion])

  const tabCounts = useMemo(() => {
    const counts = { all: rates.length, east: 0, west: 0, south: 0, other: 0 }
    rates.forEach((r) => {
      const code = r.state_code?.toUpperCase()?.trim()
      if (EAST_COAST.has(code)) counts.east++
      else if (WEST_COAST.has(code)) counts.west++
      else if (SOUTH_GULF.has(code)) counts.south++
      else counts.other++
    })
    return counts
  }, [rates])

  return (
    <div className="page-container page-section">

      <div className="flex flex-col gap-4 rounded-2xl border border-foreground/8 bg-card/40 p-4 backdrop-blur-[2px] sm:gap-5 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full min-w-0 lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            className="h-11 w-full rounded-xl border border-foreground/10 bg-background pl-10 pr-4 shadow-none outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-foreground/15 hover:bg-muted/10 focus-visible:border-primary/35 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/12"
            placeholder={locale === "ka" ? "ძებნა: შტატი, ქალაქი ან ეზო..." : "Search: state, city or yard..."}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:justify-end">
          <div className="inline-flex min-w-0 items-start gap-1.5 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:items-center sm:py-1.5">
            <Coins className="mt-0.5 size-3.5 shrink-0 text-primary sm:mt-0" aria-hidden="true" />
            <span className="min-w-0 leading-relaxed sm:leading-normal">
              <span className="block sm:inline">{locale === "ka" ? "ცოცხალი კურსი: " : "Live Rate: "}</span>
              <strong className="text-foreground">1 USD = {exchangeRate.toFixed(2)} GEL</strong>
              <span className="mt-0.5 block text-[10px] text-muted-foreground/75 sm:mt-0 sm:ml-1 sm:inline">({exchangeSource})</span>
            </span>
          </div>

          <div
            className="inline-flex h-11 w-full shrink-0 items-center rounded-xl border border-foreground/10 bg-background/50 p-1 shadow-inner sm:w-auto"
            role="group"
            aria-label={locale === "ka" ? "ვალუტის არჩევა" : "Select currency"}
          >
            {(["USD", "GEL"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                className={cn(
                  "flex h-9 flex-1 items-center justify-center rounded-lg px-4 text-xs font-semibold tracking-wider transition-all duration-200 sm:flex-none cursor-pointer",
                  currency === code
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {code === "USD" ? "USD ($)" : "GEL (₾)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border-b pb-3 sm:mt-8 sm:pb-4">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {REGION_TABS.map((tab) => {
            const count = tabCounts[tab.id as keyof typeof tabCounts] ?? 0
            const active = selectedRegion === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRegion(tab.id)}
                className={cn(
                  "inline-flex shrink-0 snap-start items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-semibold transition-all duration-200 sm:px-4 sm:text-xs cursor-pointer",
                  active
                    ? "border-foreground/10 bg-muted text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
              >
                <span className="whitespace-nowrap sm:hidden">{tab.shortLabel}</span>
                <span className="hidden whitespace-nowrap sm:inline">{tab.label}</span>
                <span
                  className={cn(
                    "inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                    active ? "bg-primary text-primary-foreground" : "bg-muted/80 text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 hidden overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-sm md:block sm:mt-6">
        <Table className="w-full table-fixed">
          <TableHeader className="bg-muted/35">
            <TableRow className="border-b border-foreground/10">
              <TableHead className="w-[34%] py-3 pl-3 pr-2 font-semibold whitespace-normal text-foreground sm:pl-4 xl:w-[26%]">
                {t("calculator.location")}
              </TableHead>
              <TableHead className="w-[8%] px-1 font-semibold text-foreground">{t("calculator.state")}</TableHead>
              <TableHead className="hidden px-1 text-right font-semibold text-foreground xl:table-cell">{t("calculator.inland")}</TableHead>
              <TableHead className="hidden px-1 text-right font-semibold text-foreground xl:table-cell">{t("calculator.ocean")}</TableHead>
              <TableHead className="hidden px-1 text-right font-semibold text-foreground xl:table-cell">{t("calculator.insurance")}</TableHead>
              <TableHead className="hidden px-1 text-right font-semibold text-foreground xl:table-cell">{t("calculator.port")}</TableHead>
              <TableHead className="w-[28%] px-1 font-semibold whitespace-normal text-foreground xl:hidden">{t("calculator.total")}</TableHead>
              <TableHead className="w-[14%] px-1 text-right font-semibold text-foreground">{t("calculator.total")}</TableHead>
              <TableHead className="w-[16%] px-1 pr-3 text-right font-semibold text-foreground sm:pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((r) => {
              const totalUsd =
                Number(r.inland_usd) + Number(r.ocean_usd) + Number(r.insurance_usd) + Number(r.port_usd)
              const calcHref = `/import-calculator?inland=${r.inland_usd}&ocean=${r.ocean_usd}&insurance=${r.insurance_usd}&port=${r.port_usd}`
              return (
                <TableRow
                  key={r.id}
                  className="border-b border-foreground/5 transition-colors duration-150 odd:bg-secondary/15 hover:bg-muted/15"
                >
                  <TableCell className="py-3 pl-3 pr-2 font-semibold whitespace-normal sm:pl-4">
                    <div className="flex min-w-0 items-start gap-1.5">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                      <span className="min-w-0 text-pretty text-xs leading-snug sm:text-sm">{labelFor(r)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-1">
                    <Badge variant="outline" className="font-mono text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                      {r.state_code}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden px-1 text-right font-mono text-xs font-medium whitespace-nowrap tabular-nums xl:table-cell">
                    {formatCost(r.inland_usd)}
                  </TableCell>
                  <TableCell className="hidden px-1 text-right font-mono text-xs font-medium whitespace-nowrap tabular-nums xl:table-cell">
                    {formatCost(r.ocean_usd)}
                  </TableCell>
                  <TableCell className="hidden px-1 text-right font-mono text-xs font-medium whitespace-nowrap tabular-nums xl:table-cell">
                    {formatCost(r.insurance_usd)}
                  </TableCell>
                  <TableCell className="hidden px-1 text-right font-mono text-xs font-medium whitespace-nowrap tabular-nums xl:table-cell">
                    {formatCost(r.port_usd)}
                  </TableCell>
                  <TableCell className="px-1 whitespace-normal xl:hidden">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] leading-tight sm:text-[11px]">
                      {[
                        [t("calculator.inland"), r.inland_usd],
                        [t("calculator.ocean"), r.ocean_usd],
                        [t("calculator.insurance").slice(0, 5), r.insurance_usd],
                        [t("calculator.port"), r.port_usd],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="flex min-w-0 items-baseline justify-between gap-1">
                          <span className="shrink-0 text-muted-foreground">{label}</span>
                          <span className="truncate font-mono font-medium tabular-nums">{formatCost(Number(value))}</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-1 text-right font-mono text-xs font-bold whitespace-nowrap tabular-nums text-foreground sm:text-sm">
                    {formatCost(totalUsd)}
                  </TableCell>
                  <TableCell className="px-1 pr-3 text-right sm:pr-4">
                    <Button
                      render={<Link href={calcHref} />}
                      nativeButton={false}
                      variant="ghost"
                      size="sm"
                      className="group inline-flex h-8 max-w-full items-center gap-0.5 rounded-lg px-2 text-[11px] transition-all duration-200 hover:bg-primary hover:text-primary-foreground active:scale-[0.98] sm:gap-1 sm:px-2.5 sm:text-xs"
                    >
                      <span className="truncate">{locale === "ka" ? "გამოთვლა" : "Calculate"}</span>
                      <ChevronRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {shown.length === 0 && <EmptyState message={locale === "ka" ? "მითითებული ფილტრით ტარიფები ვერ მოიძებნა." : "No rates found for the selected filter."} />}
      </div>

      <div className="mt-5 md:hidden sm:mt-6">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {shown.map((r) => {
            const totalUsd =
              Number(r.inland_usd) + Number(r.ocean_usd) + Number(r.insurance_usd) + Number(r.port_usd)
            return (
              <div
                key={r.id}
                className="flex flex-col gap-3.5 rounded-2xl border border-foreground/8 bg-card p-4 shadow-sm transition-all hover:border-foreground/15 sm:gap-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="flex items-start gap-1.5 text-sm font-bold leading-snug">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                      <span className="min-w-0 text-balance">{labelFor(r)}</span>
                    </h4>
                    <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                      {locale === "ka" ? "შტატი: " : "State: "} <span className="font-mono font-semibold uppercase">{r.state_code}</span>
                    </p>
                  </div>
                  <Badge className="shrink-0 px-2.5 py-1 font-mono text-xs font-bold tabular-nums">
                    {formatCost(totalUsd)}
                  </Badge>
                </div>
                <hr className="border-foreground/5" />
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] sm:gap-x-4">
                  {[
                    [locale === "ka" ? "შიდა ტრანსპ." : "Inland Trans.", r.inland_usd],
                    [t("calculator.ocean"), r.ocean_usd],
                    [t("calculator.insurance"), r.insurance_usd],
                    [t("calculator.port"), r.port_usd],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex justify-between gap-2 border-b border-foreground/5 pb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono font-semibold tabular-nums">{formatCost(Number(value))}</span>
                    </div>
                  ))}
                </div>
                <Button
                  render={<Link href={`/import-calculator?inland=${r.inland_usd}&ocean=${r.ocean_usd}&insurance=${r.insurance_usd}&port=${r.port_usd}`} />}
                  nativeButton={false}
                  variant="outline"
                  className="mt-0.5 flex h-12 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-transform active:scale-[0.98] cursor-pointer"
                >
                  {locale === "ka" ? "გამოთვლა კალკულატორში" : "Calculate in Calculator"}
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
        {shown.length === 0 && <EmptyState message={locale === "ka" ? "ტარიფები ვერ მოიძებნა." : "No rates found."} />}
      </div>

      <p className="mt-4 px-1 text-center text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
        {t("calculator.ratesNote")}
      </p>

      <section className="mt-12 border-t border-foreground/8 pt-10 sm:mt-16 sm:pt-12" aria-labelledby="logistics-info-title">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2 id="logistics-info-title" className="text-balance text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
            {locale === "ka" ? "ლოგისტიკის პროცესი & განმარტებები" : "Logistics Process & Definitions"}
          </h2>
          <p className="mt-2 text-pretty text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
            {locale === "ka" ? "გაიგეთ, როგორ ითვლება აშშ-იდან ავტომობილის ტრანსპორტირების თითოეული ეტაპი" : "Learn how each stage of vehicle transport from the US is calculated"}
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            icon={Truck}
            title={locale === "ka" ? "1. შიდა ტრანსპორტირება (Inland)" : "1. Inland Shipping (Inland)"}
            description={locale === "ka" 
              ? "ეს ხარჯი ფარავს ავტომობილის გადაზიდვას უშუალოდ აუქციონის ეზოდან (Copart ან IAAI) უახლოეს პორტამდე (მაგალითად, ნიუ-ჯერსი, სავანა, ჰიუსტონი, ლოს-ანჯელესი). ტარიფი პირდაპირ კავშირშია მანძილთან."
              : "This cost covers the transport of the vehicle directly from the auction yard (Copart or IAAI) to the nearest port (e.g., New Jersey, Savannah, Houston, Los Angeles). The rate is directly related to the distance."
            }
          />
          <InfoCard
            icon={Ship}
            title={locale === "ka" ? "2. საზღვაო ფრახტი (Ocean Cargo)" : "2. Ocean Cargo Freight"}
            description={locale === "ka"
              ? "კონტეინერით გადაზიდვა აშშ-ის პორტიდან ფოთის პორტამდე. ტრანზიტის დრო აღმოსავლეთ სანაპიროდან შეადგენს დაახლოებით 30-45 დღეს, ხოლო დასავლეთ სანაპიროდან (მაგ. კალიფორნია) 55-70 დღემდე."
              : "Container shipment from the US port to Poti port. Transit time from the East Coast is approximately 30-45 days, and from the West Coast (e.g., California) up to 55-70 days."
            }
          />
          <InfoCard
            icon={FileText}
            title={locale === "ka" ? "3. პორტი, დაზღვევა & გაფორმება" : "3. Port, Insurance & Processing"}
            description={locale === "ka"
              ? "მოიცავს კონტეინერის გახსნას და ავტომობილის ჩამოცლას ფოთში, საპორტო მოსაკრებელს, ასევე ტრანზიტის დაზღვევას (რომელიც ჩვეულებრივ მანქანის ღირებულების 1-1.5%-ია) და საბაჟო დეკლარირების დაწყებას."
              : "Includes container opening and unloading of the vehicle in Poti, port fees, transit insurance (typically 1-1.5% of the car's value), and initiating customs declaration."
            }
            className="md:col-span-2 lg:col-span-1"
          />
        </div>
      </section>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-10 text-center sm:p-16" role="status">
      <HelpCircle className="mx-auto mb-3 size-8 text-muted-foreground/60" aria-hidden="true" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  )
}

function InfoCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl border border-foreground/8 bg-card/65 p-5 shadow-sm backdrop-blur-[2px] sm:gap-4 sm:p-6",
        className
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 sm:size-10">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h3 className="text-balance text-sm font-bold sm:text-base">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
