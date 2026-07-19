import type { Metadata } from "next"
import { PageHero } from "@/components/page-hero"
import { ShippingRates } from "@/components/shipping-rates"
import { createServerSupabase } from "@/lib/supabase/server"
import { getUsdGelRate } from "@/lib/exchange"
import { getLocale } from "@/lib/get-locale"
import { t } from "@/lib/translations"

export const metadata: Metadata = {
  title: "აშშ ტრანსპორტირების ტარიფები | Auto Assist",
  description: "მოძებნეთ ავტომობილის აშშ შიდა და საზღვაო ტრანსპორტირების შეფასებითი ტარიფები."
}

export default async function Page() {
  const locale = await getLocale()
  const supabase = createServerSupabase();
  const [ratesResult, fx] = await Promise.all([
    supabase
      ? supabase.from("transport_rates").select("id,location_label,location_label_en,location_key,state_code,inland_usd,ocean_usd,insurance_usd,port_usd").eq("active",true).order("priority")
      : Promise.resolve({ data: [] }),
    getUsdGelRate(supabase)
  ]);

  return (
    <>
      <PageHero
        eyebrow={t("calculator.ratesTitle", locale)}
        title={t("calculator.ratesTitleDesc", locale)}
        description={t("calculator.ratesDesc", locale)}
      />
      <ShippingRates
        rates={(ratesResult.data || []) as any}
        exchangeRate={fx.rate}
        exchangeSource={fx.source}
      />
    </>
  )
}
