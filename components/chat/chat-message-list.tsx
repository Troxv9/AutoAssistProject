"use client"

import { useEffect, useRef } from "react"
import type { ChatMessage } from "./types"
import { ChatMessageBubble } from "./chat-message-bubble"

type ChatMessageListProps = {
  messages: ChatMessage[]
  loading: boolean
}

export function ChatMessageList({ messages, loading }: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isStreaming = messages.some((message) => message.streaming)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (isStreaming) {
      container.scrollTop = container.scrollHeight
      return
    }

    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, loading, isStreaming])

  return (
    <div
      ref={containerRef}
      id="chat-messages-container"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="ჩატის შეტყობინებები"
      className="flex-1 space-y-3 overflow-y-auto overflow-x-hidden scroll-smooth p-3 sm:space-y-4 sm:p-4"
    >
      {messages.map((message, index) => (
        <ChatMessageBubble
          key={message.id}
          message={message}
          animate={index === messages.length - 1}
          thinking={loading && Boolean(message.streaming)}
        />
      ))}

      <div ref={bottomRef} className="h-px shrink-0" aria-hidden="true" />
    </div>
  )
}
