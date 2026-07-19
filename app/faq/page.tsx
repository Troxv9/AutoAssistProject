import type { Metadata } from "next"
import { PageHero } from "@/components/page-hero"
import { FaqList } from "@/components/faq-list"
import { getLocale } from "@/lib/get-locale"
import { t } from "@/lib/translations"

export const metadata: Metadata = {
  title: "ხშირი კითხვები | Auto Assist",
  description:
    "პასუხები Copart-ის ბიდზე, იმპორტის ხარჯებზე, განბაჟებაზე, AI ანალიზზე, სარემონტო შეფასებაზე, ანგარიშსა და კონფიდენციალურობაზე.",
}

export default async function Page() {
  const locale = await getLocale()
  return (
    <>
      <PageHero
        eyebrow={t("faq.eyebrow", locale)}
        title={t("faq.title", locale)}
        description={t("faq.desc", locale)}
      />
      <FaqList />
    </>
  )
}
