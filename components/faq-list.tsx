"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { HelpCircle, MessageCircle, Search, BookOpen } from "lucide-react"
import { formInputShell } from "@/components/calculator-fields"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/locale-context"

type FaqCategory = "all" | "pricing" | "ai" | "account"

type FaqItem = {
  id: string
  question: string
  answer: string
  category: Exclude<FaqCategory, "all">
}

const FAQ_ITEMS_KA: FaqItem[] = [
  {
    id: "current-bid",
    category: "pricing",
    question: "Copart-ის მიმდინარე ბიდი საბოლოო ფასია?",
    answer:
      "არა. მიმდინარე ბიდს ემატება Copart-ის მყიდველის, ონლაინ ბიდის, გეითისა და სხვა მოსაკრებლები.",
  },
  {
    id: "override",
    category: "pricing",
    question: "რატომ არსებობს ფასის გადაფარვა?",
    answer: "API-ის მიმდინარე ბიდის ნაცვლად შეგიძლიათ მიუთითოთ თქვენი მაქსიმალური ბიდი ან Buy It Now ფასი.",
  },
  {
    id: "ai-analysis",
    category: "ai",
    question: "რა არის „AI ანალიზი“?",
    answer:
      "შედარების შემდეგ ხელოვნური ინტელექტი აფასებს ორივე ავტომობილს - გამოაქვს ვერდიქტი, ფინანსური, რისკისა და საიმედოობის ქულები, დადებითი/უარყოფითი მხარეები და დეტალური რეკომენდაცია. ეს არის მრჩეველი დასკვნა და არა გარანტია - საბოლოო გადაწყვეტილება თქვენზეა.",
  },
  {
    id: "repair-estimate",
    category: "ai",
    question: "როგორ ითვლება „სარემონტო შეფასება“?",
    answer:
      "აშშ-ის აუქციონის (Copart/IAAI) დაზიანებული მანქანისთვის AI ადგენს, რომელი ნაწილები დასჭირდება შეცვლას დაზიანების ზონის მიხედვით, შემდეგ თითოეულ ნაწილს ფასს უძებნის myparts.ge-ზე და გამოაქვს სავარაუდო ჯამური ხარჯი. ეს არის საორიენტაციო შეფასება - რეალური ხარჯი დამოკიდებულია ფარულ დაზიანებაზე, ნაწილის მდგომარეობასა (ახალი/მეორადი) და ხელოსნის ტარიფზე.",
  },
  {
    id: "repair-prices",
    category: "ai",
    question: "საიდან მოდის ნაწილების ფასები?",
    answer:
      "ნაწილების ფასები აღებულია myparts.ge-ს აქტიური განცხადებებიდან. ვაჩვენებთ რეპრეზენტატიულ (მედიანურ) ფასს და პირდაპირ ბმულს განცხადებაზე, რომ თავად შეამოწმოთ. ფასები იცვლება და შესაძლოა განსხვავდებოდეს.",
  },
  {
    id: "ai-chat",
    category: "ai",
    question: "რა არის AI ასისტენტი (ჩატი)?",
    answer:
      "ყოველ გვერდზე ხელმისაწვდომი ჩატი, რომელსაც შეგიძლიათ ჰკითხოთ კონკრეტული მანქანების, დაზიანების, განბაჟების, ტრანსპორტისა და ნაწილების შესახებ. შედარების გვერდზე ის ხედავს AI ანალიზსა და სარემონტო შეფასებას და პასუხობს კონკრეტული ციფრებით.",
  },
  {
    id: "vat",
    category: "pricing",
    question: "რაზე ითვლება დღგ?",
    answer: "დღგ ითვლება CIF ღირებულებისა და აქციზის ჯამზე. CIF მოიცავს შეძენას, აუქციონის საკომისიოს, ტრანსპორტსა და დაზღვევას.",
  },
  {
    id: "hybrid",
    category: "pricing",
    question: "ჰიბრიდს ან ელექტროს შეღავათი აქვს?",
    answer:
      "კოეფიციენტები დამოკიდებულია მოქმედ წესებზე, ძრავის ტიპსა და საჭის მხარეზე. შედეგში თითოეული გამოყენებული წესი ჩანს.",
  },
  {
    id: "api",
    category: "pricing",
    question: "რა ხდება, თუ API დროებით მიუწვდომელია?",
    answer:
      "სისტემა იყენებს სარეზერვო წყაროებს და ყოველთვის აჩვენებს გაფრთხილებას, თუ მონაცემი ბმულიდან ან fallback წყაროდან აღდგა.",
  },
  {
    id: "fx",
    category: "pricing",
    question: "რომელი გაცვლითი კურსი გამოიყენება?",
    answer: "USD/GEL კურსი მოდის საქართველოს ეროვნული ბანკიდან და ექვსი საათით ინახება უსაფრთხო ქეშში.",
  },
  {
    id: "shipping",
    category: "pricing",
    question: "ტრანსპორტირების ფასი გარანტირებულია?",
    answer: "არა. ტარიფი შეფასებითია; საბოლოო ფასი დამოკიდებულია ზუსტ ეზოზე, მანქანის ზომასა და გადამზიდავზე.",
  },
  {
    id: "account",
    category: "account",
    question: "საჭიროა თუ არა ანგარიში შესადარებლად?",
    answer:
      "არა. შედარება, AI ანალიზი, სარემონტო შეფასება და ჩატი მუშაობს რეგისტრაციის გარეშეც. ანგარიშით კი თქვენი შედარებები და AI ჩატები ავტომატურად ინახება პირად კაბინეტში (ისტორია), რომ მოგვიანებით დაუბრუნდეთ.",
  },
  {
    id: "history",
    category: "account",
    question: "რა ინახება ჩემს ისტორიაში?",
    answer:
      "თუ სისტემაში ხართ შესული, ინახება თქვენ მიერ გაკეთებული შედარებები (მანქანები, ფასები, საბოლოო ვერდიქტი) და AI ჩატის საუბრები. ეს მონაცემები დაცულია და ხელმისაწვდომია მხოლოდ თქვენთვის, თქვენი ანგარიშიდან.",
  },
  {
    id: "privacy",
    category: "account",
    question: "ვინ ხედავს გაზიარებულ შედარებას?",
    answer:
      "მხოლოდ ის, ვისაც აქვს უნიკალური პირადი ბმული. ანგარიში საძიებო სისტემებში არ ინდექსირდება და 30 დღეში იწურება.",
  },
]

const FAQ_ITEMS_EN: FaqItem[] = [
  {
    id: "current-bid",
    category: "pricing",
    question: "Is Copart's current bid the final price?",
    answer:
      "No. Copart buyer, online bid, gate, and other fees are added to the current bid price.",
  },
  {
    id: "override",
    category: "pricing",
    question: "Why is there a price override?",
    answer: "Instead of using the current bid from the API, you can specify your maximum bid or Buy It Now price.",
  },
  {
    id: "ai-analysis",
    category: "ai",
    question: "What is 'AI Analysis'?",
    answer:
      "After comparison, the AI evaluates both vehicles, providing a financial verdict, scores for finance, risk, and reliability, pros/cons, and a detailed recommendation. This is an advisory conclusion, not a guarantee - the final choice is yours.",
  },
  {
    id: "repair-estimate",
    category: "ai",
    question: "How is the 'Repair Estimate' calculated?",
    answer:
      "For a damaged vehicle from a US auction (Copart/IAAI), the AI determines which parts need replacement based on the damage zone, searches for the median price of each part on myparts.ge, and outputs an estimated total cost. This is an indicative estimate - actual costs depend on hidden damage, part condition (new/used), and mechanic rates.",
  },
  {
    id: "repair-prices",
    category: "ai",
    question: "Where do part prices come from?",
    answer:
      "Part prices are fetched from active listings on myparts.ge. We display a representative (median) price and a direct link to the listing for you to check. Prices fluctuate and may vary.",
  },
  {
    id: "ai-chat",
    category: "ai",
    question: "What is the AI Assistant (Chat)?",
    answer:
      "A chat assistant available on every page, where you can ask about specific cars, damage, customs, shipping, and parts. On the comparison page, it accesses the AI analysis and repair estimate and answers with specific numbers.",
  },
  {
    id: "vat",
    category: "pricing",
    question: "What is VAT calculated on?",
    answer: "VAT is calculated on the sum of CIF value and customs excise duty. CIF includes purchase, auction fees, shipping, and insurance.",
  },
  {
    id: "hybrid",
    category: "pricing",
    question: "Are there discounts for hybrid or electric vehicles?",
    answer:
      "Coefficients and deductions depend on active rules, engine type, and steering side. Every applied rule is displayed in the result breakdown.",
  },
  {
    id: "api",
    category: "pricing",
    question: "What happens if the API is temporarily unavailable?",
    answer:
      "The system uses backup sources and always shows a warning if data is recovered from a fallback source or link.",
  },
  {
    id: "fx",
    category: "pricing",
    question: "Which exchange rate is used?",
    answer: "The USD/GEL rate is fetched from the National Bank of Georgia (NBG) and is cached securely for six hours.",
  },
  {
    id: "shipping",
    category: "pricing",
    question: "Is the shipping price guaranteed?",
    answer: "No. Rates are estimates; the final price depends on the exact yard, vehicle size, and the carrier.",
  },
  {
    id: "account",
    category: "account",
    question: "Is an account required to compare?",
    answer:
      "No. Comparison, AI analysis, repair estimates, and chat work without registration. With an account, your comparisons and AI chats are automatically saved in your history to return to later.",
  },
  {
    id: "history",
    category: "account",
    question: "What is stored in my history?",
    answer:
      "If you are logged in, your comparisons (cars, prices, final verdict) and AI chat conversations are saved. This data is private and only accessible to you from your account.",
  },
  {
    id: "privacy",
    category: "account",
    question: "Who can see a shared comparison?",
    answer:
      "Only those with whom you share the unique link. The page is not indexed by search engines and expires after 30 days.",
  },
]

export function FaqList() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<FaqCategory>("all")
  const { t, locale } = useTranslation()

  const CATEGORIES = useMemo(() => [
    { id: "all" as const, label: locale === "ka" ? "ყველა" : "All" },
    { id: "pricing" as const, label: locale === "ka" ? "ფასები & განბაჟება" : "Pricing & Customs" },
    { id: "ai" as const, label: locale === "ka" ? "AI & რემონტი" : "AI & Repairs" },
    { id: "account" as const, label: locale === "ka" ? "ანგარიში & კონფიდენციალურობა" : "Account & Privacy" },
  ], [locale])

  const FAQ_ITEMS = locale === "ka" ? FAQ_ITEMS_KA : FAQ_ITEMS_EN

  const shown = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = category === "all" || item.category === category
      const matchesQuery =
        !normalized ||
        `${item.question} ${item.answer}`.toLowerCase().includes(normalized)
      return matchesCategory && matchesQuery
    })
  }, [query, category, FAQ_ITEMS])

  const hasFilters = Boolean(query.trim()) || category !== "all"

  return (
    <div className="page-container-narrow page-section">
      {/* Search & filters */}
      <div className="rounded-2xl border border-foreground/8 bg-card/60 p-4 shadow-sm backdrop-blur-[2px] sm:p-5">
        <label htmlFor="faq-search" className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
          {locale === "ka" ? "ძებნა" : "Search"}
        </label>
        <div className="group relative mt-2">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 ease-out group-focus-within:text-primary/80"
            aria-hidden="true"
          />
          <Input
            id="faq-search"
            className={cn(formInputShell, "pl-10")}
            placeholder={locale === "ka" ? "მოძებნეთ კითხვა..." : "Search questions..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={locale === "ka" ? "კატეგორიის ფილტრი" : "Category filter"}>
          {CATEGORIES.map(({ id, label }) => {
            const active = category === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all duration-200 sm:text-xs cursor-pointer",
                  active
                    ? "border-primary/20 bg-primary text-primary-foreground shadow-sm animate-press-in"
                    : "border-border/80 bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/30 hover:text-foreground"
                )}
              >
                {label}
              </button>
            )
          })}
        </div>

        {hasFilters && (
          <p className="mt-3 text-xs text-muted-foreground" role="status" aria-live="polite">
            {locale === "ka" ? (
              <>ნაპოვნია <strong className="font-semibold text-foreground">{shown.length}</strong> კითხვა</>
            ) : (
              <>Found <strong className="font-semibold text-foreground">{shown.length}</strong> questions</>
            )}
          </p>
        )}
      </div>

      {/* FAQ list */}
      {shown.length > 0 ? (
        <Card className="calculator-surface mt-5 overflow-hidden border-foreground/10 py-0 shadow-[var(--shadow-elevated)] sm:mt-6">
          <CardContent className="p-0">
            <Accordion className="divide-y divide-border/70">
              {shown.map((item) => (
                <AccordionItem key={item.id} value={item.id} id={item.id} className="border-0 px-4 sm:px-5">
                  <AccordionTrigger className="py-4 text-left text-sm font-semibold leading-snug transition-colors hover:bg-muted/20 hover:no-underline sm:text-[15px] group-aria-expanded/accordion-trigger:bg-muted/15 group-aria-expanded/accordion-trigger:text-primary">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 sm:pb-5">
                    <p className="max-w-3xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-7">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center sm:mt-10 sm:py-16" role="status">
          <HelpCircle className="mb-3 size-8 text-muted-foreground/60" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">{locale === "ka" ? "შესაბამისი კითხვა ვერ მოიძებნა" : "No matching questions found"}</p>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
            {locale === "ka" ? "სცადეთ სხვა საკვანძო სიტყვა ან გადააყენეთ კატეგორიის ფილტრი." : "Try another keyword or reset the category filter."}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setCategory("all")
              }}
              className="mt-4 text-xs font-medium text-primary underline-offset-4 hover:underline cursor-pointer"
            >
              {locale === "ka" ? "ფილტრების გასუფთავება" : "Clear filters"}
            </button>
          )}
        </div>
      )}

      {/* Help links */}
      <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2">
        <Link
          href="/methodology"
          className="group flex items-center gap-3 rounded-xl border border-foreground/8 bg-card/50 p-4 transition-all duration-200 hover:border-foreground/15 hover:bg-card hover:shadow-sm"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-transform group-hover:scale-105">
            <BookOpen className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 text-left">
            <span className="block text-sm font-semibold">{t("nav.methodology")}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{locale === "ka" ? "ფორმულები და წყაროები" : "Formulas and sources"}</span>
          </span>
        </Link>
        <Link
          href="/#compare"
          className="group flex items-center gap-3 rounded-xl border border-foreground/8 bg-card/50 p-4 transition-all duration-200 hover:border-foreground/15 hover:bg-card hover:shadow-sm"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-transform group-hover:scale-105">
            <MessageCircle className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 text-left">
            <span className="block text-sm font-semibold">{locale === "ka" ? "შედარების დაწყება" : "Start Comparison"}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{locale === "ka" ? "ან გამოიყენეთ AI ჩატი" : "Or use the AI chat"}</span>
          </span>
        </Link>
      </div>
    </div>
  )
}
