import { User } from "lucide-react"
import { ChatMarkdown } from "@/lib/chat-markdown"
import { cn } from "@/lib/utils"
import { ChatAssistantAvatar } from "./chat-assistant-avatar"
import { ChatStreamText } from "./chat-stream-text"
import { ChatTypingDots } from "./chat-typing-dots"
import type { ChatMessage } from "./types"
import { formatMessageTime } from "./utils"

type ChatMessageBubbleProps = {
  message: ChatMessage
  animate?: boolean
  thinking?: boolean
}

function AssistantMessageBubble({
  content,
  isStreaming,
  thinking = false,
  createdAt,
}: {
  content: string
  isStreaming: boolean
  thinking?: boolean
  createdAt: number
}) {
  const hasContent = Boolean(content.trim())
  const showTyping = isStreaming && !hasContent

  return (
    <>
      <ChatAssistantAvatar thinking={thinking || showTyping} />
      <div className="flex min-w-0 flex-col items-start gap-1">
        <div
          className={cn(
            "rounded-2xl rounded-bl-md border border-foreground/5 bg-muted/50 px-3.5 py-2.5 text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
            showTyping && "flex min-h-9 min-w-[3.25rem] items-center"
          )}
        >
          {showTyping ? (
            <ChatTypingDots />
          ) : isStreaming ? (
            <ChatStreamText content={content} />
          ) : (
            <ChatMarkdown content={content} />
          )}
        </div>
        {!isStreaming && (
          <time
            className="px-1 font-mono text-[10px] text-muted-foreground"
            dateTime={new Date(createdAt).toISOString()}
          >
            {formatMessageTime(createdAt)}
          </time>
        )}
      </div>
    </>
  )
}

export function ChatMessageBubble({ message, animate = true, thinking = false }: ChatMessageBubbleProps) {
  const isUser = message.role === "user"
  const isStreaming = Boolean(message.streaming)

  return (
    <div
      className={cn(
        "flex max-w-[92%] gap-2 overflow-visible sm:max-w-[88%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto",
        animate && "animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
      )}
    >
      {isUser ? (
        <>
          <span
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"
            aria-hidden="true"
          >
            <User className="size-3.5" />
          </span>
          <div className="flex min-w-0 flex-col items-end gap-1">
            <div className="rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-primary-foreground">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
            </div>
            <time
              className="px-1 font-mono text-[10px] text-muted-foreground"
              dateTime={new Date(message.createdAt).toISOString()}
            >
              {formatMessageTime(message.createdAt)}
            </time>
          </div>
        </>
      ) : (
        <AssistantMessageBubble
          content={message.content}
          isStreaming={isStreaming}
          thinking={thinking}
          createdAt={message.createdAt}
        />
      )}
    </div>
  )
}
