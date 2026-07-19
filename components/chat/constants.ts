import type { ComparisonResult } from "@/lib/vehicles"
import type { ChatMessage } from "./types"

export const gel = new Intl.NumberFormat("ka-GE", {
  style: "currency",
  currency: "GEL",
  maximumFractionDigits: 0,
})

export function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: Date.now(),
  }
}

export function getStorageKey(comparison: ComparisonResult) {
  return `chat_${comparison.copart.externalId}_${comparison.myauto.externalId}`
}

export function buildWelcomeMessage(comparison: ComparisonResult | null, locale?: string): ChatMessage {
  const isEn = locale === "en"
  if (!comparison) {
    return createMessage(
      "assistant",
      isEn
        ? "Hello! I am your personal auto assistant. Please perform a vehicle comparison first so we can discuss the details."
        : "გამარჯობა! მე ვარ თქვენი პერსონალური ავტო-ასისტენტი. გთხოვთ, ჯერ შეასრულოთ ავტომობილების შედარება, რათა დეტალურად განვიხილოთ ისინი."
    )
  }

  const copartName = comparison.copart.title
  const myautoName = comparison.myauto.title

  const gelFormatter = new Intl.NumberFormat(isEn ? "en-US" : "ka-GE", {
    style: "currency",
    currency: "GEL",
    maximumFractionDigits: 0,
  })

  const diffText = isEn
    ? (comparison.verdict === "import"
        ? `import is cheaper by ${gelFormatter.format(comparison.differenceGel)}`
        : comparison.verdict === "local"
          ? `local purchase is cheaper by ${gelFormatter.format(comparison.differenceGel)}`
          : "costs are almost equal")
    : (comparison.verdict === "import"
        ? `იმპორტი ${gelFormatter.format(comparison.differenceGel)}-ით უფრო იაფია`
        : comparison.verdict === "local"
          ? `ადგილობრივი შეძენა ${gelFormatter.format(comparison.differenceGel)}-ით უფრო იაფია`
          : "ღირებულებები თითქმის თანაბარია")

  return createMessage(
    "assistant",
    isEn
      ? `Hello! I see you are comparing **${copartName}** and **${myautoName}**. Financial summary: **${diffText}**.

You can ask me any questions about these cars' damages, shipping, customs clearance, or technical specifications!`
      : `გამარჯობა! მე ვხედავ, რომ ადარებ **${copartName}**-სა და **${myautoName}**-ს. ფინანსური შეჯამებით: **${diffText}**.

შეგიძლიათ დამისვათ ნებისმიერი კითხვა ამ მანქანების დაზიანებებზე, ტრანსპორტირებაზე, განბაჟებაზე ან ტექნიკურ მახასიათებლებზე!`
  )
}

export function normalizeStoredMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null
  const messages: ChatMessage[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") return null
    const record = item as Record<string, unknown>
    if (record.role !== "user" && record.role !== "assistant") return null
    if (typeof record.content !== "string") return null
    messages.push({
      id: typeof record.id === "string" ? record.id : crypto.randomUUID(),
      role: record.role,
      content: record.content,
      createdAt: typeof record.createdAt === "number" ? record.createdAt : Date.now(),
    })
  }
  return messages
}
