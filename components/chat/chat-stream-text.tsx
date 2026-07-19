import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

function formatStreamInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

type ChatStreamTextProps = {
  content: string
  showCursor?: boolean
  className?: string
}

export function ChatStreamText({ content, showCursor = true, className }: ChatStreamTextProps) {
  return (
    <div className={cn("chat-prose whitespace-pre-wrap", className)}>
      {formatStreamInline(content)}
      {showCursor && (
        <span className="chat-stream-cursor ml-0.5 inline-block text-primary" aria-hidden="true">
          ▍
        </span>
      )}
    </div>
  )
}
