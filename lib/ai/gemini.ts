
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview"

export type GeminiContent = { role: "user" | "model"; parts: { text: string }[] }

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

export function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY)
}

export async function callGeminiText(opts: {
  model: string
  systemPrompt: string
  contents: GeminiContent[]
  json?: boolean
  responseSchema?: unknown
  maxOutputTokens?: number
  temperature?: number
  thinkingBudget?: number
  timeoutMs?: number
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error("GEMINI_API_KEY is not configured")

  const generationConfig: Record<string, unknown> = {}
  if (opts.json || opts.responseSchema) generationConfig.responseMimeType = "application/json"
  if (opts.responseSchema) generationConfig.responseSchema = opts.responseSchema
  if (typeof opts.maxOutputTokens === "number") generationConfig.maxOutputTokens = opts.maxOutputTokens
  if (typeof opts.temperature === "number") generationConfig.temperature = opts.temperature
  if (typeof opts.thinkingBudget === "number") {
    generationConfig.thinkingConfig = { thinkingBudget: opts.thinkingBudget }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 60000)

  let response: Response
  try {
    response = await fetch(`${BASE_URL}/${opts.model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: opts.systemPrompt }] },
        contents: opts.contents,
        generationConfig,
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Gemini ${opts.model} timed out after ${opts.timeoutMs ?? 60000}ms`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "")
    throw new Error(`Gemini ${opts.model} returned status ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  const parts = data?.candidates?.[0]?.content?.parts
  const text = Array.isArray(parts)
    ? parts.map((p: { text?: string }) => p?.text ?? "").join("")
    : ""

  if (!text.trim()) throw new Error(`Gemini ${opts.model} returned empty content`)
  return text
}


export function toGeminiContents(messages: Array<{ role: string; content: string }>): GeminiContent[] {
  const contents: GeminiContent[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }))
  
  while (contents.length > 0 && contents[0].role === "model") contents.shift()
  return contents
}
