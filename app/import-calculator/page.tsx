import type { Metadata } from "next"
import { PageHero } from "@/components/page-hero"
import { VehicleCalculator } from "@/components/vehicle-calculator"
import { getLocale } from "@/lib/get-locale"
import { t } from "@/lib/translations"

export const metadata:Metadata={title:"იმპორტის სრული კალკულატორი | Auto Assist",description:"შეაფასეთ აშშ-დან ავტომობილის ჩამოყვანის სრული ღირებულება საქართველოში."}

function num(value: string | string[] | undefined): string | undefined {
  const s = Array.isArray(value) ? value[0] : value
  return s && /^\d+(\.\d+)?$/.test(s) ? s : undefined
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getLocale()
  const sp = await searchParams
  const initial: Record<string, string> = {}
  const inland = num(sp.inland); if (inland) initial.inlandUsd = inland
  const ocean = num(sp.ocean); if (ocean) initial.oceanUsd = ocean
  const insurance = num(sp.insurance); if (insurance) initial.insuranceUsd = insurance
  const port = num(sp.port); if (port) initial.portUsd = port

  return (
    <>
      <PageHero 
        eyebrow={t("calculator.importEyebrow", locale) + (locale === "ka" ? "-ის კალკულატორი" : " Calculator")} 
        title={locale === "ka" ? "აუქციონიდან საქართველომდე, სრული ხარჯი" : "From Auction to Georgia, Full Cost"} 
        description={locale === "ka" ? "შეძენა, Copart-ის საკომისიო, ტრანსპორტი, განბაჟება და შეკეთება ერთ გამჭვირვალე ფინანსურ მოდელში." : "Purchase, Copart fees, shipping, customs, and repairs in one transparent financial model."}
      />
      <VehicleCalculator mode="import" initial={initial}/>
    </>
  )
}
