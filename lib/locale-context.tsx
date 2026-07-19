"use client"

import React, { createContext, useContext, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Locale, t, formatGel, formatUsd } from "./translations"

type LanguageContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  formatGel: (amount: number) => string
  formatUsd: (amount: number) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode
  initialLocale: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const router = useRouter()
  const [, startTransition] = useTransition()

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
    startTransition(() => {
      router.refresh()
    })
  }

  const translate = (key: string) => t(key, locale)
  const fmtGel = (amount: number) => formatGel(amount, locale)
  const fmtUsd = (amount: number) => formatUsd(amount, locale)

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translate, formatGel: fmtGel, formatUsd: fmtUsd }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider")
  }
  return context
}
