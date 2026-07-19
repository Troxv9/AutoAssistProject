import { cookies } from "next/headers"
import { Locale } from "./translations"

export async function getLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies()
    const val = cookieStore.get("NEXT_LOCALE")?.value
    if (val === "en" || val === "ka") {
      return val
    }
  } catch {
    // Fail-safe for build time or non-request context
  }
  return "ka"
}
