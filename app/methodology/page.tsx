import type { Metadata } from "next"
import { PageHero } from "@/components/page-hero"
import { MethodologyContent, type MethodologySection } from "@/components/methodology-content"
import { getCalculationContext } from "@/lib/calculation-context"
import { getLocale } from "@/lib/get-locale"
import { t } from "@/lib/translations"

export const metadata: Metadata = {
  title: "მეთოდოლოგია | Auto Assist",
  description: "ნახეთ როგორ ითვლება Copart-ის საკომისიო, ტრანსპორტი, აქციზი, დღგ და საბოლოო შედარება.",
}

const sectionsKa: MethodologySection[] = [
  {
    id: "sources",
    title: "მონაცემთა წყაროები",
    description:
      "Copart/IAAI-ს ლოტი იკითხება აუქციონის მონაცემთა API-ებით (მათ შორის დაზიანების, გასაღებისა და საბუთის ინფორმაცია), AutoPapa ოფიციალური პროდუქტის API-ით, ხოლო ნაწილების ფასები - myparts.ge-ს განცხადებებიდან. თითოეულ შედეგს ახლავს მიღების დრო და fallback გაფრთხილება.",
  },
  {
    id: "fees",
    title: "Copart-ის საკომისიო",
    description:
      "შესყიდვის ფასს ემატება საფეხუროვანი buyer fee, ონლაინ ბიდის, გეითის, გარემოსდაცვითი და დოკუმენტის მოსაკრებლები.",
  },
  {
    id: "fx",
    title: "გაცვლითი კურსი",
    description: "USD/GEL კურსი მიიღება NBG-დან და ექვსი საათით ქეშირდება. წყარო ყოველთვის ჩანს შედეგთან.",
  },
  {
    id: "cif",
    title: "CIF და დღგ",
    description:
      "CIF = შეძენა + აუქციონის საკომისიო + აშშ ტრანსპორტი + საზღვაო გადაზიდვა + დაზღვევა. დღგ = (CIF + აქციზი) × მოქმედი დღგ-ს განაკვეთი.",
  },
  {
    id: "excise",
    title: "აქციზი",
    description:
      "აქციზი ეფუძნება ძრავის მოცულობას, ავტომობილის ასაკს, საწვავის ტიპსა და საჭის მხარეს. ელექტრო და ჰიბრიდული ავტომობილების კოეფიციენტები ცალკე გამოიყენება.",
  },
  {
    id: "verdict",
    title: "ვერდიქტი და ROI",
    description:
      "შედარება აერთიანებს სრულ იმპორტის ღირებულებასა და ადგილობრივ საბოლოო ღირებულებას. ROI არის დანაზოგის შეფარდება იმპორტის სრულ ხარჯთან.",
  },
  {
    id: "ai",
    title: "AI ანალიზი",
    description:
      "გამოთვლილი ციფრებისა და ორივე ავტომობილის მახასიათებლების საფუძველზე ხელოვნური ინტელექტი ამზადებს სტრუქტურირებულ დასკვნას: ვერდიქტს, ფინანსური/რისკის/საიმედოობის ქულებს, უპირატესობებსა და რეკომენდაციას. ეს ავსებს (და არა ცვლის) დეტერმინისტულ კალკულაციას და წარმოადგენს მრჩეველ მოსაზრებას.",
  },
  {
    id: "repair",
    title: "სარემონტო შეფასება",
    description:
      "იმპორტის (Copart/IAAI) მანქანის დაზიანების ზონის მიხედვით AI ადგენს შესაცვლელ ნაწილებს, თითოეულს ფასს უძებნის myparts.ge-ზე (რეპრეზენტატიული/მედიანური ფასი) და ცალკე ამატებს სამუშაოს (მუშახელის) სავარაუდო დიაპაზონს. ეს ღირებულება ცალკე სექციაშია და არ ერევა დეტერმინისტულ იმპორტის ჯამში.",
  },
  {
    id: "limits",
    title: "შეზღუდვები",
    description:
      "შედეგი შეფასებითია. AI ანალიზი მრჩეველია, სარემონტო შეფასება კი საორიენტაციო - ფარული დაზიანება, ნაწილის მდგომარეობა, ხელოსნის ტარიფი, გადამზიდავის შეთავაზება და ოფიციალური საბაჟო შეფასება შეიძლება განსხვავდებოდეს.",
  },
]

const sectionsEn: MethodologySection[] = [
  {
    id: "sources",
    title: "Data Sources",
    description:
      "Copart/IAAI lots are fetched via auction data APIs (including damage, key, and document details), AutoPapa via the official product API, and part prices from myparts.ge listings. Each result displays the fetch timestamp and any fallback warnings.",
  },
  {
    id: "fees",
    title: "Copart Auction Fees",
    description:
      "A tiered buyer fee is added to the purchase price, along with online bidding, gate, environmental, and document fees.",
  },
  {
    id: "fx",
    title: "Exchange Rates",
    description: "The USD/GEL exchange rate is fetched from the National Bank of Georgia (NBG) and cached for six hours. The rate source is always visible with the results.",
  },
  {
    id: "cif",
    title: "CIF & VAT",
    description:
      "CIF = Purchase Price + Auction Fees + US Inland Shipping + Ocean Freight + Transit Insurance. VAT = (CIF + Excise Duty) × active VAT rate.",
  },
  {
    id: "excise",
    title: "Excise Duty",
    description:
      "Excise duty calculations are based on engine capacity, vehicle age, fuel type, and steering position. Separate coefficients apply to electric and hybrid vehicles.",
  },
  {
    id: "verdict",
    title: "Verdict & ROI",
    description:
      "The comparison combines the total import cost and local final cost. Return on investment (ROI) represents savings relative to the total import cost.",
  },
  {
    id: "ai",
    title: "AI Analysis",
    description:
      "Based on the calculated figures and specifications of both vehicles, the AI generates a structured report: verdict, scores (financial, risk, reliability), pros/cons, and recommendations. This advises and complements (rather than replaces) the deterministic calculation.",
  },
  {
    id: "repair",
    title: "Repair Estimation",
    description:
      "Based on the damage area of the imported vehicle, the AI identifies parts requiring replacement, searches for representative median prices on myparts.ge, and adds estimated labor cost ranges. This cost is shown in a separate section and does not affect the deterministic import total.",
  },
  {
    id: "limits",
    title: "Limitations & Assumptions",
    description:
      "All results are estimates. AI analysis is advisory, and repair estimates are indicative - hidden damage, parts availability, mechanic rates, shipping quotes, and official customs evaluations may vary.",
  },
]

export default async function Page() {
  const locale = await getLocale()
  const context = await getCalculationContext()
  const sections = locale === "ka" ? sectionsKa : sectionsEn

  return (
    <>
      <PageHero
        eyebrow={locale === "ka" ? `წესები ${context.ruleVersion} · ძალაში ${context.effectiveFrom}` : `Rules ${context.ruleVersion} · Effective ${context.effectiveFrom}`}
        title={t("methodology.title", locale)}
        description={t("methodology.desc", locale)}
      />
      <MethodologyContent sections={sections} />
    </>
  )
}
