"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { ComparisonResult } from "@/lib/vehicles"
import { ChatContextBar } from "./chat-context-bar"
import { ChatHeader } from "./chat-header"
import { ChatInput } from "./chat-input"
import { ChatMessageList } from "./chat-message-list"
import type { UseChatReturn } from "./types"

type ChatPanelProps = {
  comparison: ComparisonResult | null
  chat: UseChatReturn
  onClose: () => void
  autoFocus?: boolean
  showDragHandle?: boolean
  className?: string
}

export function ChatPanel({ comparison, chat, onClose, autoFocus, showDragHandle, className }: ChatPanelProps) {
  return (
    <div
      id="chat-panel"
      className={className}
      role="dialog"
      aria-label="AI ასისტენტის ჩატი"
      aria-modal="true"
    >
      {showDragHandle ? (
        <div className="flex shrink-0 justify-center border-b border-border/60 bg-muted/40 px-4 py-2.5">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" aria-hidden="true" />
        </div>
      ) : null}
      <ChatHeader
        onClose={onClose}
        onClear={chat.clearChat}
      />
      <ChatContextBar comparison={comparison} />
      <ChatMessageList
        messages={chat.messages}
        loading={chat.loading}
      />

      {chat.error && (
        <Alert variant="destructive" className="mx-3 mb-2 shrink-0 sm:mx-4">
          <AlertCircle />
          <AlertTitle>პასუხი ვერ მოვიდა</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{chat.error}</span>
            <div className="flex gap-2">
              {chat.lastUserMessage && (
                <Button type="button" size="xs" variant="outline" onClick={() => void chat.retryLastMessage()}>
                  თავიდან ცდა
                </Button>
              )}
              <Button type="button" size="xs" variant="ghost" onClick={chat.dismissError}>
                დახურვა
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <ChatInput
        input={chat.input}
        onInputChange={chat.setInput}
        onSend={() => void chat.sendMessage(chat.input)}
        loading={chat.loading}
        canSend={chat.canSend}
        comparison={comparison}
        autoFocus={autoFocus}
        onNavigateToCompare={onClose}
      />
    </div>
  )
}
