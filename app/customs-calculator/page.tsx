import type { Metadata } from "next"
import { PageHero } from "@/components/page-hero"
import { VehicleCalculator } from "@/components/vehicle-calculator"
import { getLocale } from "@/lib/get-locale"
import { t } from "@/lib/translations"

export const metadata: Metadata = {
  title: "განბაჟების კალკულატორი | Auto Assist",
  description: "გამოთვალეთ ავტომობილის აქციზი, დღგ და განბაჟების სრული ღირებულება საქართველოში."
}

export default async function Page() {
  const locale = await getLocale()
  return (
    <>
      <PageHero 
        eyebrow={t("calculator.customsEyebrow", locale) + (locale === "ka" ? "-ის კალკულატორი" : " Calculator")} 
        title={locale === "ka" ? "განბაჟება, ყველა კომპონენტი ერთ პასუხში" : "Customs Clearance, All Components in One Report"} 
        description={locale === "ka" ? "მიიღეთ აქციზის, დღგ-სა და ფიქსირებული მოსაკრებლების დეტალური შეფასება მოქმედი წესებითა და NBG-ის კურსით." : "Get a detailed estimate of excise, VAT, and fixed fees under active regulations and NBG rate."}
      />
      <VehicleCalculator mode="customs"/>
    </>
  )
}
