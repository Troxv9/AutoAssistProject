import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Noto_Sans_Georgian, Geist_Mono, Outfit } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroAmbient } from "@/components/hero-ambient"
import { ChatComparisonProvider, GlobalChatbot } from "@/components/chat"
import { getLocale } from "@/lib/get-locale"
import { LanguageProvider } from "@/lib/locale-context"
import "./globals.css"

const noto = Noto_Sans_Georgian({ subsets: ["georgian", "latin"], variable: "--font-noto" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Auto Assist · Copart და AutoPapa შედარება",
  description:
    "შეადარეთ ავტომობილის ადგილობრივი ფასი და აშშ-დან იმპორტის სრული ღირებულება. მიიღეთ AI ანალიზი, სარემონტო ნაწილების შეფასება myparts.ge-დან და AI ასისტენტი.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()

  return (
    <html lang={locale} className="bg-secondary" suppressHydrationWarning>
      <body className={`${noto.variable} ${outfit.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-secondary p-0 sm:p-4`} suppressHydrationWarning>
        <LanguageProvider initialLocale={locale}>
          <TooltipProvider>
            <ChatComparisonProvider>
              <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
                {locale === "en" ? "Skip to content" : "შინაარსზე გადასვლა"}
              </a>
              <div className="relative isolate flex min-h-[calc(100svh-2rem)] flex-col rounded-2xl md:rounded-[32px] border bg-background shadow-sm overflow-hidden">
                <HeroAmbient />
                <SiteHeader />
                <main id="main-content" className="flex min-h-0 flex-1 flex-col">{children}</main>
                <SiteFooter />
              </div>
              <GlobalChatbot />
            </ChatComparisonProvider>
          </TooltipProvider>
        </LanguageProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
