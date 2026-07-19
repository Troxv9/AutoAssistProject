import type { ComparisonResult } from "@/lib/vehicles"

export type ChatRole = "user" | "assistant"

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: number
  streaming?: boolean
}

export type LoadingPhase = "idle" | "thinking" | "searching"

export type UseChatOptions = {
  comparison: ComparisonResult | null
  analysis?: unknown
  repair?: unknown
  onUnread?: () => void
}

export type UseChatReturn = {
  messages: ChatMessage[]
  input: string
  setInput: (value: string) => void
  loading: boolean
  loadingPhase: LoadingPhase
  error: string | null
  canSend: boolean
  sendMessage: (text: string) => Promise<void>
  retryLastMessage: () => Promise<void>
  clearChat: () => void
  dismissError: () => void
  lastUserMessage: string | null
}
