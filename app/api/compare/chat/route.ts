import { NextResponse } from "next/server"
import { GEMINI_MODEL, callGeminiText, toGeminiContents } from "@/lib/ai/gemini"
import { hasMimoKey, mimoFetch } from "@/lib/mimo"

export const runtime = "nodejs"
export const maxDuration = 90

const requests = new Map<string, { count: number; resetsAt: number }>()
const MAX_HISTORY_TURNS = 10

function capMessages<T extends { role: string; content: string }>(messages: T[]) {
  const maxMessages = MAX_HISTORY_TURNS * 2
  if (messages.length <= maxMessages) return messages
  return messages.slice(-maxMessages)
}

function buildSystemPrompt(comparison: Record<string, unknown>, locale?: string) {
  const {
    copart,
    myauto,
    exchangeRate,
    differenceGel,
    savingsPercent,
    roiPercent,
    verdict,
    importTotalGel,
    localTotalGel,
  } = comparison as {
    copart: Record<string, unknown>
    myauto: Record<string, unknown>
    exchangeRate: number
    differenceGel: number
    savingsPercent: number
    roiPercent: number
    verdict: string
    importTotalGel: number
    localTotalGel: number
  }

  const isEn = locale === "en"

  if (isEn) {
    return `
You are Auto Assist's intelligent chat assistant. The user is currently comparing two vehicles, and your goal is to answer any questions they have about these cars.

Here is the active comparison data:

=== Financial Comparison ===
- Import total cost: ${(importTotalGel || 0).toLocaleString("en-US")} GEL (1 USD = ${(exchangeRate || 0).toFixed(4)} GEL)
- Local purchase price: ${(localTotalGel || 0).toLocaleString("en-US")} GEL
- Difference: ${(differenceGel || 0).toLocaleString("en-US")} GEL (${savingsPercent || 0}% savings, ROI: ${roiPercent || 0}%)
- Verdict: ${verdict === "import" ? "Import is cheaper" : verdict === "local" ? "Local purchase is cheaper" : "Costs are almost equal"}

=== US Auction (Copart) ===
- Vehicle: ${copart.title} (${copart.year})
- Engine: ${copart.engineCc} cc (${copart.powertrain})
- Steering: ${copart.steering === "left" ? "Left" : "Right"}
- Mileage: ${copart.mileageKm ? `${Number(copart.mileageKm).toLocaleString("en-US")} km` : "unknown"}
- Drive Type: ${copart.driveType || "unknown"}
- Transmission: ${copart.transmission || "unknown"}
- Damage: Primary: ${copart.damagePrimary || "unknown"}, Secondary: ${copart.damageSecondary || "none"}
- Keys: ${copart.hasKeys === true ? "Yes, has keys" : "No, keys are missing"}
- Status: ${copart.runCondition || "unknown"}
- Document: ${copart.saleDocument || "unknown"}
- Location: ${copart.location}

=== Local Listing (autopapa.ge) ===
- Vehicle: ${myauto.title} (${myauto.year})
- Engine: ${myauto.engineCc} cc (${myauto.powertrain})
- Steering: ${myauto.steering === "left" ? "Left" : "Right"}
- Mileage: ${myauto.mileageKm ? `${Number(myauto.mileageKm).toLocaleString("en-US")} km` : "unknown"}
- Drive Type: ${myauto.driveType || "unknown"}
- Transmission: ${myauto.transmission || "unknown"}
- Customs: ${myauto.customsPassed ? "Cleared" : "Not cleared"}
- Damage: ${myauto.damagePrimary || "Undamaged / Repaired"}
- Description: "${myauto.description || "No description"}"

Your response rules:
1. **Language and Tone**: Always respond in fluent, professional, and natural English. Be polite, objective, and helpful.
2. **Context Knowledge**: Reference the exact numbers and facts above. If the user asks about risks like missing keys, explain that missing keys mean the engine/transmission condition couldn't be verified beforehand, and making a key ($500-$1000) is an extra expense.
3. **Brevity**: This is a chat format. Keep responses concise (max 2-3 short paragraphs) unless a detailed breakdown is requested.
4. **Markdown**: Use simple Markdown - short paragraphs, bullet lists, and **bolding**. Use bullet lists for comparisons (do not use markdown tables).
`.trim()
  }

  return `
შენ ხარ Auto Assist-ის ინტელექტუალური ჩატ-ასისტენტი. მომხმარებელი ახლა ადარებს ორ ავტომობილს და შენი მიზანია უპასუხო მის ნებისმიერ შეკითხვას ამ მანქანებთან დაკავშირებით.

აი აქტიური შედარების მონაცემები:

=== ფინანსური შედარება ===
- იმპორტის სრული ხარჯი: ${(importTotalGel || 0).toLocaleString("ka-GE")} GEL (1 USD = ${(exchangeRate || 0).toFixed(4)} GEL)
- ადგილობრივი შეძენის ფასი: ${(localTotalGel || 0).toLocaleString("ka-GE")} GEL
- სხვაობა: ${(differenceGel || 0).toLocaleString("ka-GE")} GEL (${savingsPercent || 0}% დანაზოგი, ROI: ${roiPercent || 0}%)
- ვერდიქტი: ${verdict === "import" ? "იმპორტი უფრო იაფია" : verdict === "local" ? "ადგილობრივი შეძენა უფრო იაფია" : "ღირებულება თითქმის თანაბარია"}

=== ამერიკული აუქციონი (Copart) ===
- მანქანა: ${copart.title} (${copart.year})
- ძრავი: ${copart.engineCc} cc (${copart.powertrain})
- საჭე: ${copart.steering === "left" ? "მარცხენა" : "მარჯვენა"}
- გარბენი: ${copart.mileageKm ? `${Number(copart.mileageKm).toLocaleString("ka-GE")} კმ` : "უცნობია"}
- წამყვანი თვლები: ${copart.driveType || "უცნობია"}
- კოლოფი: ${copart.transmission || "უცნობია"}
- დაზიანება: ძირითადი: ${copart.damagePrimary || "უცნობია"}, მეორადი: ${copart.damageSecondary || "არ არის"}
- გასაღები: ${copart.hasKeys === true ? "დიახ, აქვს" : "არა, არ აქვს გასაღები"}
- სტატუსი: ${copart.runCondition || "უცნობია"}
- საბუთი: ${copart.saleDocument || "უცნობია"}
- მდებარეობა: ${copart.location}

=== ადგილობრივი შეთავაზება (autopapa.ge) ===
- მანქანა: ${myauto.title} (${myauto.year})
- ძრავი: ${myauto.engineCc} cc (${myauto.powertrain})
- საჭე: ${myauto.steering === "left" ? "მარცხენა" : "მარჯვენა"}
- გარბენი: ${myauto.mileageKm ? `${Number(myauto.mileageKm).toLocaleString("ka-GE")} კმ` : "უცნობია"}
- წამყვანი თვლები: ${myauto.driveType || "უცნობია"}
- კოლოფი: ${myauto.transmission || "უცნობია"}
- განბაჟება: ${myauto.customsPassed ? "განბაჟებულია" : "განუბაჟებელია"}
- დაზიანება: ${myauto.damagePrimary || "უდაზიანო / აღდგენილი"}
- გამყიდველის აღწერა: "${myauto.description || "აღწერის გარეშე"}"

შენი პასუხების წესები:
1. **ენა და ტონი**: უპასუხე ყოველთვის გამართული ქართული სალიტერატურო ენით. იყავი თავაზიანი, პროფესიონალი და დახვეწილი.
2. **კონტექსტის ცოდნა**: დაეყრდენი ზემოთ მოცემულ კონკრეტულ ციფრებს და ფაქტებს. თუ მომხმარებელი გკითხავს რისკებზე, მაგალითად გასაღების არქონაზე, აუხსენი რომ გასაღების არქონა ნიშნავს რომ ძრავისა და კოლოფის მდგომარეობა წინასწარ ვერ შემოწმდებოდა და გასაღების დამზადება ($500-$1000) დამატებითი ხარჯია.
3. **სიმოკლე**: ვინაიდან ეს ჩატის ფორმატია, პასუხები უნდა იყოს შედარებით მოკლე და კონკრეტული (მაქსიმუმ 2-3 მოკლე აბზაცი), თუ მომხმარებელი არ ითხოვს ძალიან დეტალურ დაშლას.
4. **Markdown**: გამოიყენე მარტივი Markdown - მოკლე აბზაცები, bullet სიები და **გამუქება**. შედარებებისთვის გამოიყენე bullet სიები, არა ცხრილები. თავიდან აიცილე markdown ცხრილები (| სვეტები |).
`.trim()
}

function callMimo(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  stream: boolean
) {
  return mimoFetch(
    {
      model: "mimo-v2.5-pro",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream,
      webSearchEnabled: true,
      tools: [
        {
          type: "web_search",
          max_keyword: 3,
          force_search: true,
          limit: 1,
          user_location: {
            type: "approximate",
            country: "Georgia",
            region: "Tbilisi",
            city: "Tbilisi",
          },
        },
      ],
    },
    // No per-attempt timeout for streaming so long streams aren't aborted.
    stream ? undefined : 60000,
  )
}

function formatAnalysis(a: any, locale?: string): string {
  if (!a || typeof a !== "object") return ""
  const isEn = locale === "en"
  const list = (arr: unknown) => (Array.isArray(arr) && arr.length ? arr.join("; ") : "")
  const lines: string[] = [isEn ? "\n\n=== AI Analysis (displayed to the user) ===" : "\n\n=== AI ანალიზი (ეკრანზე ნაჩვენები მომხმარებელს) ==="]
  if (a.title) lines.push(isEn ? `Title: ${a.title}` : `სათაური: ${a.title}`)
  if (a.summary) lines.push(isEn ? `Summary: ${a.summary}` : `შეჯამება: ${a.summary}`)
  const adv = a.advantages ?? {}
  if (list(adv.importPros)) lines.push(isEn ? `Import Pros: ${list(adv.importPros)}` : `იმპორტის დადებითი მხარეები: ${list(adv.importPros)}`)
  if (list(adv.importCons)) lines.push(isEn ? `Import Risks/Cons: ${list(adv.importCons)}` : `იმპორტის რისკები: ${list(adv.importCons)}`)
  if (list(adv.localPros)) lines.push(isEn ? `Local Pros: ${list(adv.localPros)}` : `ადგილობრივის დადებითი მხარეები: ${list(adv.localPros)}`)
  if (list(adv.localCons)) lines.push(isEn ? `Local Risks/Cons: ${list(adv.localCons)}` : `ადგილობრივის რისკები: ${list(adv.localCons)}`)
  const d = a.details ?? {}
  if (d.financialAnalysis) lines.push(isEn ? `Financial Analysis: ${d.financialAnalysis}` : `ფინანსური ანალიზი: ${d.financialAnalysis}`)
  if (d.riskAssessment) lines.push(isEn ? `Risk Assessment: ${d.riskAssessment}` : `რისკების შეფასება: ${d.riskAssessment}`)
  if (d.expertRecommendation) lines.push(isEn ? `Expert Recommendation: ${d.expertRecommendation}` : `ექსპერტის რეკომენდაცია: ${d.expertRecommendation}`)
  return lines.join("\n")
}

function formatRepair(r: any, locale?: string): string {
  if (!r || typeof r !== "object") return ""
  const isEn = locale === "en"
  if (r.needsRepair === false) {
    const msg = r.summaryKa || (r.dataAvailable === false ? (isEn ? "No damage details found." : "დაზიანების დეტალები ვერ მოიძებნა.") : (isEn ? "No major damage." : "მნიშვნელოვანი დაზიანება არ არის."))
    return isEn ? `\n\n=== Repair Estimate ===\n${msg}` : `\n\n=== სარემონტო შეფასება ===\n${msg}`
  }
  const lines: string[] = [isEn ? "\n\n=== Repair Estimate (using myparts.ge prices, displayed) ===" : "\n\n=== სარემონტო შეფასება (myparts.ge-ს ფასებით, ეკრანზე ნაჩვენები) ==="]
  if (r.summaryKa) lines.push(r.summaryKa)
  for (const p of Array.isArray(r.parts) ? r.parts : []) {
    const price = p.priceGel != null ? `${p.priceGel} GEL (×${p.qty ?? 1})` : (isEn ? "price not found" : "ფასი ვერ მოიძებნა")
    lines.push(`- ${p.nameKa}: ${price}${p.note ? ` - ${p.note}` : ""}`)
  }
  if (r.partsSubtotalGel != null) lines.push(isEn ? `Parts Total: ${r.partsSubtotalGel} GEL` : `ნაწილები სულ: ${r.partsSubtotalGel} ₾`)
  if (r.laborEstimateGel) lines.push(isEn ? `Labor (est.): ${r.laborEstimateGel.min}–${r.laborEstimateGel.max} GEL` : `სამუშაო (სავარაუდო): ${r.laborEstimateGel.min}–${r.laborEstimateGel.max} ₾`)
  if (r.totalMinGel != null) lines.push(isEn ? `Total Est. Repair Cost: ${r.totalMinGel}–${r.totalMaxGel} GEL` : `სავარაუდო სარემონტო ხარჯი სულ: ${r.totalMinGel}–${r.totalMaxGel} ₾`)
  return lines.join("\n")
}

async function geminiChatReply(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const text = await callGeminiText({
    model: GEMINI_MODEL,
    systemPrompt,
    contents: toGeminiContents(messages),
  })
  return text
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous"
    const nowMs = Date.now()
    const current = requests.get(ip)
    if (current && current.resetsAt > nowMs && current.count >= 20) {
      return NextResponse.json(
        { error: "ჩატის მოთხოვნების ლიმიტი ამოიწურა. სცადეთ რამდენიმე წუთში." },
        { status: 429 }
      )
    }
    requests.set(
      ip,
      current && current.resetsAt > nowMs
        ? { ...current, count: current.count + 1 }
        : { count: 1, resetsAt: nowMs + 10 * 60 * 1000 }
    )

    const body = await request.json()
    const { messages, comparison, analysis, repair, stream, locale } = body

    if (!messages || !Array.isArray(messages) || !comparison) {
      return NextResponse.json({ error: "არასაკმარისი მონაცემები ჩატისთვის" }, { status: 400 })
    }

    const cappedMessages = capMessages(
      messages.filter(
        (message: unknown): message is { role: string; content: string } =>
          Boolean(
            message &&
              typeof message === "object" &&
              "role" in message &&
              "content" in message &&
              typeof (message as { role: unknown }).role === "string" &&
              typeof (message as { content: unknown }).content === "string"
          )
      )
    )

    const extras = formatAnalysis(analysis, locale) + formatRepair(repair, locale)
    const guidance = extras
      ? (locale === "en"
        ? "\n\nThe AI analysis and repair estimate shown above are already computed and visible to the user - rely on this information, refer to specific numbers/parts/prices, and do not claim that you do not have data."
        : "\n\nზემოთ მოცემული AI ანალიზი და სარემონტო შეფასება უკვე გამოთვლილია და ნაჩვენებია მომხმარებელს - დაეყრდენი ამ ინფორმაციას, მიუთითე კონკრეტული ციფრები/ნაწილები/ფასები და ნუ იტყვი, რომ მონაცემები არ გაქვს.")
      : ""
    const systemPrompt = buildSystemPrompt(comparison, locale) + extras + guidance

    if (stream) {
      try {
        if (!hasMimoKey()) throw new Error("MIMO_API_KEY is not configured")
        const streamResponse = await callMimo(systemPrompt, cappedMessages, true)
        const contentType = streamResponse.headers.get("content-type") ?? ""

        if (streamResponse.ok && contentType.includes("text/event-stream") && streamResponse.body) {
          return new Response(streamResponse.body, {
            headers: {
              "Content-Type": "text/event-stream; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
            },
          })
        }

        if (!streamResponse.ok) {
          const errorText = await streamResponse.text()
          throw new Error(`MiMo chatbot API returned status ${streamResponse.status}: ${errorText}`)
        }

        const data = await streamResponse.json()
        const reply = data.choices?.[0]?.message?.content
        if (!reply || !String(reply).trim()) throw new Error("MiMo returned empty content")
        return NextResponse.json({ reply })
      } catch (mimoError) {
        console.error("MiMo chat failed, falling back to Gemini:", mimoError)
        const reply = await geminiChatReply(systemPrompt, cappedMessages)
        return NextResponse.json({ reply })
      }
    }

    try {
      if (!hasMimoKey()) throw new Error("MIMO_API_KEY is not configured")
      const response = await callMimo(systemPrompt, cappedMessages, false)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`MiMo chatbot API returned status ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content
      if (!reply || !String(reply).trim()) throw new Error("MiMo returned empty content")
      return NextResponse.json({ reply })
    } catch (mimoError) {
      console.error("MiMo chat failed, falling back to Gemini:", mimoError)
      const reply = await geminiChatReply(systemPrompt, cappedMessages)
      return NextResponse.json({ reply })
    }
  } catch (error) {
    console.error("AI Chatbot route error:", error)
    const msg = error instanceof Error ? error.message : "უცნობი შეცდომა"
    return NextResponse.json({ error: `სერვერული შეცდომა ჩატისას: ${msg}` }, { status: 500 })
  }
}
