import { NextResponse } from "next/server"
import { callGeminiText } from "@/lib/ai/gemini"
import { hasMimoKey, mimoFetch } from "@/lib/mimo"

export const runtime = "nodejs"
export const maxDuration = 90

const ANALYSIS_SCHEMA = {
  type: "OBJECT",
  properties: {
    verdict: { type: "STRING", enum: ["import", "local", "equal"] },
    title: { type: "STRING" },
    summary: { type: "STRING" },
    scores: {
      type: "OBJECT",
      properties: {
        financialScoreImport: { type: "INTEGER" },
        financialScoreLocal: { type: "INTEGER" },
        riskScoreImport: { type: "INTEGER" },
        riskScoreLocal: { type: "INTEGER" },
        reliabilityScoreImport: { type: "INTEGER" },
        reliabilityScoreLocal: { type: "INTEGER" },
      },
      required: [
        "financialScoreImport", "financialScoreLocal", "riskScoreImport",
        "riskScoreLocal", "reliabilityScoreImport", "reliabilityScoreLocal",
      ],
    },
    specs: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          copartValue: { type: "STRING" },
          myautoValue: { type: "STRING" },
          highlight: { type: "STRING", enum: ["copart", "myauto", "neutral"] },
          comment: { type: "STRING" },
        },
        required: ["name", "copartValue", "myautoValue", "highlight", "comment"],
      },
    },
    advantages: {
      type: "OBJECT",
      properties: {
        importPros: { type: "ARRAY", items: { type: "STRING" } },
        importCons: { type: "ARRAY", items: { type: "STRING" } },
        localPros: { type: "ARRAY", items: { type: "STRING" } },
        localCons: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: ["importPros", "importCons", "localPros", "localCons"],
    },
    details: {
      type: "OBJECT",
      properties: {
        financialAnalysis: { type: "STRING" },
        riskAssessment: { type: "STRING" },
        expertRecommendation: { type: "STRING" },
      },
      required: ["financialAnalysis", "riskAssessment", "expertRecommendation"],
    },
  },
  required: ["verdict", "title", "summary", "scores", "specs", "advantages", "details"],
}

async function callMimoAnalyze(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!hasMimoKey()) throw new Error("MIMO_API_KEY is not configured")

  const response = await mimoFetch(
    {
      model: "mimo-v2.5-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
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
    70000,
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`MiMo API returned status ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content || !String(content).trim()) throw new Error("MiMo returned empty content")
  return content as string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { copart, myauto, exchangeRate, differenceGel, savingsPercent, roiPercent, verdict, importTotalGel, localTotalGel, locale } = body

    if (!copart || !myauto) {
      return NextResponse.json({ error: locale === "en" ? "Insufficient data for analysis" : "არასაკმარისი მონაცემები ანალიზისთვის" }, { status: 400 })
    }

    const formattedPrompt = locale === "en" ? `
You are a professional automotive expert and financial advisor. Your goal is to help a Georgian user make an informed choice between two specific vehicles:
1. US auction import (Copart/IAAI)
2. Local listing available on the Georgian market (autopapa.ge)

Here is the data we have:

=== Financial Comparison ===
- Total estimated import cost (including customs clearance and repairs): ${(importTotalGel || 0).toLocaleString('en-US')} GEL (at rate 1 USD = ${(exchangeRate || 0).toFixed(4)} GEL)
- Total price of local purchase (if uncleared, customs duty is added): ${(localTotalGel || 0).toLocaleString('en-US')} GEL
- Difference in price: ${(differenceGel || 0).toLocaleString('en-US')} GEL
- Savings percentage: ${savingsPercent || 0}%
- ROI (Return on Investment): ${roiPercent || 0}%
- Financial verdict: ${verdict === 'import' ? 'Import is cheaper' : verdict === 'local' ? 'Local purchase is cheaper' : 'Costs are almost equal'}

=== US Auction Vehicle (Copart) ===
- Title: ${copart.title}
- Year: ${copart.year}
- Engine: ${copart.engineCc} cc (${copart.powertrain})
- Steering: ${copart.steering === 'left' ? 'Left' : 'Right'}
- Mileage: ${copart.mileageKm ? copart.mileageKm.toLocaleString('en-US') + ' km' : 'Not specified'}
- Drive: ${copart.driveType || 'unknown'}
- Transmission: ${copart.transmission || 'unknown'}
- Damage: Primary: ${copart.damagePrimary || 'unknown'}, Secondary: ${copart.damageSecondary || 'none'}
- Key: ${copart.hasKeys === true ? 'Yes, has key' : 'No, key is missing'}
- Status: ${copart.runCondition || 'unknown'}
- Document Type: ${copart.saleDocument || 'unknown'}
- Location: ${copart.location}

=== Local Vehicle (autopapa.ge) ===
- Title: ${myauto.title}
- Year: ${myauto.year}
- Engine: ${myauto.engineCc} cc (${myauto.powertrain})
- Steering: ${myauto.steering === 'left' ? 'Left' : 'Right'}
- Mileage: ${myauto.mileageKm ? myauto.mileageKm.toLocaleString('en-US') + ' km' : 'Not specified'}
- Drive: ${myauto.driveType || 'unknown'}
- Transmission: ${myauto.transmission || 'unknown'}
- Customs: ${myauto.customsPassed ? 'Cleared' : 'Not cleared'}
- Damage: ${myauto.damagePrimary || 'Undamaged / Repaired'}
- Seller Description: "${myauto.description || 'No description'}"

Prepare a detailed, professional analysis and recommendation in ENGLISH. The analysis must be structured in Markdown format and include the following sections:
1. **Financial Cost Analysis**: Evaluate the difference and savings. Discuss how realistic the savings are given the repair risks.
2. **Technical and Specification Comparison**: Compare mileage (calculate exact difference in km), drive type (e.g., AWD 4MATIC vs RWD), engine type (e.g., Gas vs. Plug-in Hybrid), and specifications.
3. **Critical Risk Assessment**:
   - US auction risks (salvage title, damage level, especially if key is missing: key making, diagnostics, transport risks).
   - Local car risks and advantages (dealer service history, ability to check immediately).
4. **Final Recommendation**: Give the user a clear, objective conclusion on which purchase is more advisable based on their risk tolerance.

Write the analysis in a professional, friendly, and clear tone. Avoid excessive technical jargon where not needed.
    `.trim() : `
შენ ხარ პროფესიონალი ავტო-ანალიტიკოსი და ფინანსური მრჩეველი. შენი მიზანია დაეხმარო ქართველ მომხმარებელს გააკეთოს გონივრული არჩევანი ორ კონკრეტულ მანქანას შორის:
1. ამერიკული აუქციონიდან (Copart/IAAI) იმპორტი
2. ქართულ ბაზარზე (autopapa.ge) არსებული ადგილობრივი შეთავაზება
3. შენი ანალიზი და ყველა ტექსტური ველი (title, summary, specs.name, specs.comment, advantages, details) უნდა იყოს ქართულ ენაზე.

აი მონაცემები, რომლებიც ხელთ გვაქვს:

=== ფინანსური შედარება ===
- იმპორტის სრული სავარაუდო ხარჯი (განბაჟებითა და შეკეთებით): ${(importTotalGel || 0).toLocaleString('ka-GE')} GEL (კურსით 1 USD = ${(exchangeRate || 0).toFixed(4)} GEL)
- ადგილობრივი შეძენის სრული ფასი (თუ განუბაჟებელია, დამატებული აქვს განბაჟება): ${(localTotalGel || 0).toLocaleString('ka-GE')} GEL
- ფასებს შორის სხვაობა: ${(differenceGel || 0).toLocaleString('ka-GE')} GEL
- დანაზოგის პროცენტი: ${savingsPercent || 0}%
- ROI (უკუგება): ${roiPercent || 0}%
- ფინანსური ვერდიქტი: ${verdict === 'import' ? 'იმპორტი უფრო იაფია' : verdict === 'local' ? 'ადგილობრივი შეძენა უფრო იაფია' : 'ღირებულება თითქმის თანაბარია'}

=== ამერიკული აუქციონის მანქანა (Copart) ===
- დასახელება: ${copart.title}
- წელი: ${copart.year}
- ძრავი: ${copart.engineCc} cc (${copart.powertrain})
- საჭე: ${copart.steering === 'left' ? 'მარცხენა' : 'მარჯვენა'}
- გარბენი: ${copart.mileageKm ? copart.mileageKm.toLocaleString('ka-GE') + ' კმ' : 'არ არის მითითებული'}
- წამყვანი თვლები: ${copart.driveType || 'უცნობია'}
- გადაცემათა კოლოფი: ${copart.transmission || 'უცნობია'}
- დაზიანება: ძირითადი: ${copart.damagePrimary || 'უცნობია'}, მეორადი: ${copart.damageSecondary || 'არ არის'}
- გასაღები: ${copart.hasKeys === true ? 'დიახ, აქვს' : 'არა, არ აქვს გასაღები'}
- სტატუსი: ${copart.runCondition || 'უცნობია'}
- საბუთის ტიპი: ${copart.saleDocument || 'უცნობია'}
- მდებარეობა: ${copart.location}

=== ადგილობრივი მანქანა (autopapa.ge) ===
- დასახელება: ${myauto.title}
- წელი: ${myauto.year}
- ძრავი: ${myauto.engineCc} cc (${myauto.powertrain})
- საჭე: ${myauto.steering === 'left' ? 'მარცხენა' : 'მარჯვენა'}
- გარბენი: ${myauto.mileageKm ? myauto.mileageKm.toLocaleString('ka-GE') + ' კმ' : 'არ არის მითითებული'}
- წამყვანი თვლები: ${myauto.driveType || 'უცნობია'}
- გადაცემათა კოლოფი: ${myauto.transmission || 'უცნობია'}
- განბაჟება: ${myauto.customsPassed ? 'განბაჟებულია' : 'განუბაჟებელია'}
- დაზიანება: ${myauto.damagePrimary || 'უდაზიანო / აღდგენილი'}
- გამყიდველის აღწერა: "${myauto.description || 'აღწერის გარეშე'}"

მოამზადე დეტალური, პროფესიონალური ანალიზი და რეკომენდაცია ქართულ ენაზე. ანალიზი უნდა იყოს სტრუქტურირებული Markdown ფორმატში და უნდა მოიცავდეს შემდეგ სექციებს:
1. **ფინანსური ხარჯების ანალიზი**: შეაფასე სხვაობა და დანაზოგი. აღნიშნე, თუ რამდენად რეალურია ეს დანაზოგი გათვალისწინებული შეკეთების რისკის ფონზე.
2. **ტექნიკური და სპეციფიკაციების შედარება**: შეადარე გარბენი (გამოთვალე ზუსტი სხვაობა კილომეტრებში), წამყვანი თვლები (მაგ. AWD 4MATIC vs RWD), ძრავის ტიპი (მაგ. Gas vs. Plug-in Hybrid) და სხვაობა სპეციფიკაციებში.
3. **გადამწყვეტი რისკების შეფასება**:
   - ამერიკული აუქციონის რისკები (სალვაჟი საბუთი, დაზიანების ხარისხი, განსაკუთრებით თუ გასაღები არ აქვს: გასაღების დამზადება, დიაგნოსტიკა, ტრანსპორტირების რისკები).
   - ადგილობრივი მანქანის რისკები და უპირატესობები (ცენტრის ისტორია, დაუყოვნებლივი შემოწმების შესაძლებლობა).
4. **საბოლოო რეკომენდაცია**: მიეცი მომხმარებელს მკაფიო, ობიექტური დასკვნა, თუ რომლის შეძენაა უფრო მიზანშეწონილი მისი რისკ-ტოლერანტობიდან გამომდინარე.

დაწერე ანალიზი პროფესიონალურ, მეგობრულ და გასაგებ ტონში, თავი აარიდე ზედმეტ ტექნიკურ ჟარგონს, სადაც საჭირო არ არის.
    `.trim()

    const systemPrompt = locale === "en" ? `
You are the lead automotive analyst and financial advisor for Auto Assist - an expert in the Georgian car market, US auction imports (Copart/IAAI), and local listings (autopapa.ge).

TASK
Produce an objective, decisive side-by-side comparison of the two vehicles as a single JSON object. All numbers you need are already provided - do not invent facts or prices. Base every score and claim strictly on the given data; when data is missing, say so instead of guessing.

LANGUAGE & TONE
- Write ALL user-facing text in fluent, natural English.
- Be concrete and decisive: reference the actual figures (savings, mileage, damage, keys, title). Avoid filler and hedging.

SCORING (integers 0-100)
- financialScore*: higher = better financial value for that option.
- riskScore*: higher = HIGHER risk (salvage title, missing keys, unknown run condition, heavy damage).
- reliabilityScore*: higher = more predictable / verifiable condition.
Scores for import vs local should reflect real differences - avoid defaulting everything to 50.

BREVITY (keep it fast and focused - respect these limits)
- summary: max 2 sentences.
- specs: 4 to 6 of the most decision-relevant rows only (e.g. Mileage, Drive Type, Document/Status, Key, Engine & Tech). "comment" ≤ 1 sentence.
- advantages: max 3 items per list; each item ≤ 12 words.
- details.*: max 3 short sentences each. Highlight Copart's salvage/missing-keys risks when applicable.

OUTPUT
Return ONLY the JSON object (no markdown, no code fences, no extra text) with exactly these keys:
verdict ("import"|"local"|"equal"), title (≤10 words), summary, scores {financialScoreImport, financialScoreLocal, riskScoreImport, riskScoreLocal, reliabilityScoreImport, reliabilityScoreLocal}, specs [{name, copartValue, myautoValue, highlight ("copart"|"myauto"|"neutral"), comment}], advantages {importPros[], importCons[], localPros[], localCons[]}, details {financialAnalysis, riskAssessment, expertRecommendation}.
`.trim() : `
You are the lead automotive analyst and financial advisor for Auto Assist - an expert in the Georgian car market, US auction imports (Copart/IAAI), and local listings (autopapa.ge).

TASK
Produce an objective, decisive side-by-side comparison of the two vehicles as a single JSON object. All numbers you need are already provided - do not invent facts or prices. Base every score and claim strictly on the given data; when data is missing, say so instead of guessing.

LANGUAGE & TONE
- Write ALL user-facing text in fluent, natural Georgian.
- Be concrete and decisive: reference the actual figures (savings, mileage, damage, keys, title). Avoid filler and hedging.

SCORING (integers 0-100)
- financialScore*: higher = better financial value for that option.
- riskScore*: higher = HIGHER risk (salvage title, missing keys, unknown run condition, heavy damage).
- reliabilityScore*: higher = more predictable / verifiable condition.
Scores for import vs local should reflect real differences - avoid defaulting everything to 50.

BREVITY (keep it fast and focused - respect these limits)
- summary: max 2 sentences.
- specs: 4 to 6 of the most decision-relevant rows only (e.g. გარბენი, წამყვანი თვლები, საბუთი/სტატუსი, გასაღები, ძრავი და ტექნოლოგია). "comment" ≤ 1 sentence.
- advantages: max 3 items per list; each item ≤ 12 words.
- details.*: max 3 short sentences each. Highlight Copart's salvage/missing-keys risks when applicable.

OUTPUT
Return ONLY the JSON object (no markdown, no code fences, no extra text) with exactly these keys:
verdict ("import"|"local"|"equal"), title (≤10 words), summary, scores {financialScoreImport, financialScoreLocal, riskScoreImport, riskScoreLocal, reliabilityScoreImport, reliabilityScoreLocal}, specs [{name, copartValue, myautoValue, highlight ("copart"|"myauto"|"neutral"), comment}], advantages {importPros[], importCons[], localPros[], localCons[]}, details {financialAnalysis, riskAssessment, expertRecommendation}.
`.trim()

    const geminiProvider = (model: string) => ({
      name: `gemini:${model}`,
      run: () =>
        callGeminiText({
          model,
          systemPrompt,
          contents: [{ role: "user", parts: [{ text: formattedPrompt }] }],
          responseSchema: ANALYSIS_SCHEMA,
          temperature: 0.5,
          maxOutputTokens: 8192,
          timeoutMs: 60000,
        }),
    })

    const providers: Array<{ name: string; run: () => Promise<string> }> = [
      geminiProvider("gemini-3.5-flash"),
      geminiProvider("gemini-3-flash-preview"),
      { name: "mimo", run: () => callMimoAnalyze(systemPrompt, formattedPrompt) },
      geminiProvider("gemini-3.1-flash-lite"),
    ]

    let content: string | null = null
    const failures: string[] = []
    for (const provider of providers) {
      try {
        content = await provider.run()
        break
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        failures.push(`${provider.name}: ${msg}`)
        console.error(`AI analyze provider failed (${provider.name}):`, msg)
      }
    }

    if (content == null) {
      return NextResponse.json(
        { error: locale === "en" ? `AI analysis failed with all providers: ${failures.join(" | ")}` : `AI ანალიზი ვერ მოხერხდა ვერცერთი პროვაიდერით: ${failures.join(" | ")}` },
        { status: 502 }
      )
    }

    let parsedData: any
    try {
      let cleanText = content.trim()
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.substring(7);
      }
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith("```")) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      cleanText = cleanText.trim()
      parsedData = JSON.parse(cleanText)
    } catch (e) {
      console.warn("Failed to parse AI response as JSON, falling back to unstructured wrapper:", e)
      parsedData = locale === "en" ? {
        verdict: verdict || "equal",
        title: "AI Analysis",
        summary: "Financial and technical comparison has been successfully prepared.",
        scores: {
          financialScoreImport: verdict === "import" ? 85 : verdict === "local" ? 40 : 50,
          financialScoreLocal: verdict === "local" ? 85 : verdict === "import" ? 40 : 50,
          riskScoreImport: copart.hasKeys === false ? 85 : 60,
          riskScoreLocal: 20,
          reliabilityScoreImport: 40,
          reliabilityScoreLocal: 90
        },
        specs: [
          { name: "Mileage", copartValue: copart.mileageKm ? copart.mileageKm.toLocaleString('en-US') + ' km' : 'Unknown', myautoValue: myauto.mileageKm ? myauto.mileageKm.toLocaleString('en-US') + ' km' : 'Unknown', highlight: "neutral", comment: "Mileage difference affects value." },
          { name: "Drive Type", copartValue: copart.driveType || 'Unknown', myautoValue: myauto.driveType || 'Unknown', highlight: "neutral", comment: "AWD vs RWD/FWD drive quality." }
        ],
        advantages: {
          importPros: ["Financial savings"],
          importCons: [copart.hasKeys === false ? "No key" : "Damaged", "Salvage title"],
          localPros: ["Immediate checkability", "No damage/Repaired"],
          localCons: ["Higher price"]
        },
        details: {
          financialAnalysis: content,
          riskAssessment: "Buying from a US auction requires understanding additional risks like salvage title and potential hidden damages.",
          expertRecommendation: "If you are willing to take risks for savings, choose Import. If you prefer immediate comfort, choose Local."
        }
      } : {
        verdict: verdict || "equal",
        title: "AI ანალიზი",
        summary: "ფინანსური და ტექნიკური შედარება წარმატებით მომზადდა.",
        scores: {
          financialScoreImport: verdict === "import" ? 85 : verdict === "local" ? 40 : 50,
          financialScoreLocal: verdict === "local" ? 85 : verdict === "import" ? 40 : 50,
          riskScoreImport: copart.hasKeys === false ? 85 : 60,
          riskScoreLocal: 20,
          reliabilityScoreImport: 40,
          reliabilityScoreLocal: 90
        },
        specs: [
          { name: "გარბენი", copartValue: copart.mileageKm ? copart.mileageKm.toLocaleString('ka-GE') + ' კმ' : 'უცნობია', myautoValue: myauto.mileageKm ? myauto.mileageKm.toLocaleString('ka-GE') + ' კმ' : 'უცნობია', highlight: "neutral", comment: "გარბენის სხვაობა გავლენას ახდენს ფასზე." },
          { name: "წამყვანი თვლები", copartValue: copart.driveType || 'უცნობია', myautoValue: myauto.driveType || 'უცნობია', highlight: "neutral", comment: "AWD vs RWD/FWD მართვის ხარისხი." }
        ],
        advantages: {
          importPros: ["ფინანსური დანაზოგი"],
          importCons: [copart.hasKeys === false ? "არ აქვს გასაღები" : "დაზიანებული", "სალვაჟი საბუთი"],
          localPros: ["დაუყოვნებლივი შემოწმება", "უდაზიანო სტატუსი"],
          localCons: ["მაღალი ფასი"]
        },
        details: {
          financialAnalysis: content,
          riskAssessment: "ამერიკულ აუქციონზე შესყიდვა მოითხოვს დამატებითი რისკების გააზრებას, როგორიცაა სალვაჟი საბუთი და შესაძლო ფარული დაზიანებები.",
          expertRecommendation: "თუ მზად ხართ რისკისთვის და გსურთ დანაზოგი, აირჩიეთ იმპორტი. თუ ეძებთ მყისიერ კომფორტს, აირჩიეთ ადგილობრივი მანქანა."
        }
      }
    }

    return NextResponse.json({ analysis: parsedData })
  } catch (error) {
    console.error("AI Analysis route error:", error)
    const msg = error instanceof Error ? error.message : "უცნობი შეცდომა"
    return NextResponse.json({ error: `სერვერული შეცდომა AI ანალიზისას: ${msg}` }, { status: 500 })
  }
}
