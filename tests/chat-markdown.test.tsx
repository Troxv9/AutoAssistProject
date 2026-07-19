import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { ChatMarkdown, parseBlocks } from "@/lib/chat-markdown"

describe("ChatMarkdown", () => {
  it("renders headings, lists, bold text, and inline code", () => {
    const html = renderToStaticMarkup(
      <ChatMarkdown
        content={`# სათაური
## ქვესათაური
### პუნქტი

- პირველი **მნიშვნელოვანი** ელემენტი
- მეორე ელემენტი

1. ნომერირებული
2. სია

ჩვეულებრივი \`კოდი\` ტექსტი.`}
      />
    )

    expect(html).toContain("<h2")
    expect(html).toContain("<h3")
    expect(html).toContain("<h4")
    expect(html).toContain("<ul")
    expect(html).toContain("<ol")
    expect(html).toContain("<strong")
    expect(html).toContain("<code")
    expect(html).toContain("მნიშვნელოვანი")
  })

  it("parses and renders markdown tables", () => {
    const content = `| პარამეტრი | Copart | MyAuto |
| --- | --- | --- |
| ფასი | $5000 | 18000 GEL |
| გარბენი | 120000 კმ | 90000 კმ |`

    const blocks = parseBlocks(content)
    expect(blocks).toEqual([
      {
        type: "table",
        headers: ["პარამეტრი", "Copart", "MyAuto"],
        rows: [
          ["ფასი", "$5000", "18000 GEL"],
          ["გარბენი", "120000 კმ", "90000 კმ"],
        ],
      },
    ])

    const html = renderToStaticMarkup(<ChatMarkdown content={content} />)
    expect(html).toContain("<table")
    expect(html).toContain("<thead")
    expect(html).toContain("<tbody")
    expect(html).toContain("პარამეტრი")
    expect(html).toContain("18000 GEL")
  })

  it("parses blocks once per stable content", () => {
    const content = "- ერთი\n- ორი"
    const first = parseBlocks(content)
    const second = parseBlocks(content)
    expect(first).toEqual(second)
    expect(first).toEqual([
      { type: "ul", items: ["ერთი", "ორი"] },
    ])
  })
})
