"use client"

import { memo, useMemo, type ReactNode } from "react"

function formatInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

function isTableRow(line: string) {
  const trimmed = line.trim()
  return trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.includes("|")
}

function isTableSeparator(line: string) {
  return /^\|?[\s:-]+\|[\s|:-]*$/.test(line.trim())
}

function parseTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
}

export type MarkdownBlock =
  | { type: "empty" }
  | { type: "h1" | "h2" | "h3" | "p"; content: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }

export function parseBlocks(text: string): MarkdownBlock[] {
  const lines = text.split("\n")
  const blocks: MarkdownBlock[] = []
  let listType: "ul" | "ol" | null = null
  let listItems: string[] = []
  let tableLines: string[] = []

  const flushList = () => {
    if (listType && listItems.length > 0) {
      blocks.push({ type: listType, items: [...listItems] })
    }
    listType = null
    listItems = []
  }

  const flushTable = () => {
    if (tableLines.length === 0) return

    const dataLines = tableLines.filter((line) => !isTableSeparator(line))
    if (dataLines.length === 0) {
      tableLines = []
      return
    }

    const headers = parseTableRow(dataLines[0])
    const rows = dataLines.slice(1).map(parseTableRow)
    blocks.push({ type: "table", headers, rows })
    tableLines = []
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (isTableRow(line)) {
      flushList()
      tableLines.push(line)
      continue
    }

    if (tableLines.length > 0) {
      flushTable()
    }

    if (!trimmed) {
      flushList()
      blocks.push({ type: "empty" })
      continue
    }

    const ulMatch = trimmed.match(/^[-*]\s+(.+)/)
    const olMatch = trimmed.match(/^\d+\.\s+(.+)/)

    if (ulMatch) {
      if (listType !== "ul") {
        flushList()
        listType = "ul"
      }
      listItems.push(ulMatch[1])
      continue
    }

    if (olMatch) {
      if (listType !== "ol") {
        flushList()
        listType = "ol"
      }
      listItems.push(olMatch[1])
      continue
    }

    flushList()

    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", content: trimmed.slice(4) })
    } else if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", content: trimmed.slice(3) })
    } else if (trimmed.startsWith("# ")) {
      blocks.push({ type: "h1", content: trimmed.slice(2) })
    } else {
      blocks.push({ type: "p", content: trimmed })
    }
  }

  flushList()
  flushTable()
  return blocks
}

function ChatMarkdownInner({ content }: { content: string }) {
  const blocks = useMemo(() => parseBlocks(content), [content])

  return (
    <div className="chat-prose space-y-2">
      {blocks.map((block, index) => {
        if (block.type === "empty") {
          return <div key={index} className="h-1" />
        }
        if (block.type === "h1") {
          return (
            <h2 key={index} className="mt-1 text-[15px] font-bold text-primary first:mt-0">
              {formatInline(block.content)}
            </h2>
          )
        }
        if (block.type === "h2") {
          return (
            <h3 key={index} className="mt-2 text-[14px] font-bold text-foreground first:mt-0">
              {formatInline(block.content)}
            </h3>
          )
        }
        if (block.type === "h3") {
          return (
            <h4 key={index} className="mt-1.5 text-[13px] font-semibold text-foreground first:mt-0">
              {formatInline(block.content)}
            </h4>
          )
        }
        if (block.type === "ul") {
          return (
            <ul key={index} className="ml-4 list-disc space-y-1 py-0.5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{formatInline(item)}</li>
              ))}
            </ul>
          )
        }
        if (block.type === "ol") {
          return (
            <ol key={index} className="ml-4 list-decimal space-y-1 py-0.5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{formatInline(item)}</li>
              ))}
            </ol>
          )
        }
        if (block.type === "table") {
          return (
            <div key={index} className="my-1 overflow-x-auto rounded-lg border border-foreground/8">
              <table className="w-full min-w-[220px] border-collapse text-left text-[11px]">
                <thead>
                  <tr className="border-b border-foreground/8 bg-muted/40">
                    {block.headers.map((header, headerIndex) => (
                      <th key={headerIndex} className="px-2.5 py-2 font-semibold text-foreground">
                        {formatInline(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/6">
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-muted/20">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-2.5 py-2 text-muted-foreground">
                          {formatInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        if (block.type === "p") {
          return <p key={index}>{formatInline(block.content)}</p>
        }
        return null
      })}
    </div>
  )
}

export const ChatMarkdown = memo(ChatMarkdownInner)
