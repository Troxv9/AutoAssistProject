import { callGeminiText } from "@/lib/ai/gemini"
import { hasMimoKey, mimoFetch } from "@/lib/mimo"

const GEMINI_CHAIN = ["gemini-3.5-flash", "gemini-3-flash-preview"]
const GEMINI_LAST = "gemini-3.1-flash-lite"

async function callMimoStructured(systemPrompt: string, userPrompt: string, webSearch = false): Promise<string> {
  if (!hasMimoKey()) throw new Error("MIMO_API_KEY is not configured")

  const body: Record<string, unknown> = {
    model: "mimo-v2.5-pro",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  }
  if (webSearch) {
    body.webSearchEnabled = true
    body.tools = [
      {
        type: "web_search",
        max_keyword: 3,
        force_search: true,
        limit: 2,
        user_location: { type: "approximate", country: "Georgia", region: "Tbilisi", city: "Tbilisi" },
      },
    ]
  }

  const response = await mimoFetch(body, webSearch ? 70000 : 45000)
  if (!response.ok) {
    const errorText = await response.text().catch(() => "")
    throw new Error(`MiMo returned status ${response.status}: ${errorText}`)
  }
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content || !String(content).trim()) throw new Error("MiMo returned empty content")
  return content as string
}

function parseJsonLoose<T>(text: string): T {
  let clean = text.trim()
  if (clean.startsWith("```json")) clean = clean.slice(7)
  else if (clean.startsWith("```")) clean = clean.slice(3)
  if (clean.endsWith("```")) clean = clean.slice(0, -3)
  clean = clean.trim()
  if (!clean.startsWith("{")) {
    const start = clean.indexOf("{")
    const end = clean.lastIndexOf("}")
    if (start !== -1 && end > start) clean = clean.slice(start, end + 1)
  }
  return JSON.parse(clean) as T
}

export async function completeStructured<T>(opts: {
  systemPrompt: string
  userPrompt: string
  responseSchema?: unknown
  temperature?: number
  maxOutputTokens?: number
  preferMimo?: boolean
  mimoWebSearch?: boolean
}): Promise<T> {
  const gemini = (model: string) => ({
    name: `gemini:${model}`,
    run: () =>
      callGeminiText({
        model,
        systemPrompt: opts.systemPrompt,
        contents: [{ role: "user", parts: [{ text: opts.userPrompt }] }],
        responseSchema: opts.responseSchema,
        temperature: opts.temperature ?? 0.5,
        maxOutputTokens: opts.maxOutputTokens ?? 4096,
        timeoutMs: 60000,
      }),
  })
  const mimo = { name: "mimo", run: () => callMimoStructured(opts.systemPrompt, opts.userPrompt, opts.mimoWebSearch) }

  const providers: Array<{ name: string; run: () => Promise<string> }> = opts.preferMimo
    ? [mimo, gemini(GEMINI_CHAIN[1] ?? GEMINI_LAST), gemini(GEMINI_LAST)]
    : [...GEMINI_CHAIN.map(gemini), mimo, gemini(GEMINI_LAST)]

  const failures: string[] = []
  for (const provider of providers) {
    try {
      const text = await provider.run()
      return parseJsonLoose<T>(text)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      failures.push(`${provider.name}: ${msg}`)
      console.error(`AI provider failed (${provider.name}):`, msg)
    }
  }
  throw new Error(`All AI providers failed: ${failures.join(" | ")}`)
}
