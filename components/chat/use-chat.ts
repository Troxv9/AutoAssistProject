"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { ComparisonResult } from "@/lib/vehicles"
import {
  buildWelcomeMessage,
  createMessage,
  getStorageKey,
  normalizeStoredMessages,
} from "./constants"
import type { ChatMessage, LoadingPhase, UseChatOptions, UseChatReturn } from "./types"
import { createStreamFlusher } from "./use-stream-buffer"
import { useTranslation } from "@/lib/locale-context"

const MAX_HISTORY_TURNS = 10

function capMessages(messages: ChatMessage[]) {
  const maxMessages = MAX_HISTORY_TURNS * 2
  if (messages.length <= maxMessages) return messages
  return messages.slice(-maxMessages)
}

function stripStreamingMessages(messages: ChatMessage[]) {
  return messages.filter((message) => !message.streaming)
}

function parseSseChunk(buffer: string): { content: string; done: boolean; remainder: string } {
  let content = ""
  let done = false
  let remainder = buffer
  const lines = buffer.split("\n")
  remainder = lines.pop() ?? ""

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith(":")) continue
    if (trimmed === "data: [DONE]") {
      done = true
      continue
    }
    if (!trimmed.startsWith("data: ")) continue
    try {
      const payload = JSON.parse(trimmed.slice(6)) as {
        choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>
        error?: { message?: string }
      }
      if (payload.error?.message) {
        throw new Error(payload.error.message)
      }
      const delta = payload.choices?.[0]?.delta?.content ?? payload.choices?.[0]?.message?.content
      if (delta) content += delta
    } catch (error) {
      if (error instanceof SyntaxError) continue
      throw error
    }
  }

  return { content, done, remainder }
}

export function useChat({ comparison, analysis, repair, onUnread }: UseChatOptions): UseChatReturn {
  const { locale } = useTranslation()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("idle")
  const [error, setError] = useState<string | null>(null)
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null)
  const searchTimerRef = useRef<number | null>(null)
  const streamFlusherRef = useRef<ReturnType<typeof createStreamFlusher> | null>(null)

  const persistMessages = useCallback(
    (nextMessages: ChatMessage[]) => {
      if (!comparison) return
      const persisted = stripStreamingMessages(nextMessages)
      sessionStorage.setItem(getStorageKey(comparison), JSON.stringify(persisted))
    },
    [comparison]
  )

  const initializeMessages = useCallback(() => {
    if (!comparison) {
      setMessages([buildWelcomeMessage(null, locale)])
      return
    }

    const saved = sessionStorage.getItem(getStorageKey(comparison))
    if (saved) {
      try {
        const parsed = normalizeStoredMessages(JSON.parse(saved))
        if (parsed && parsed.length > 0) {
          setMessages(parsed)
          return
        }
      } catch {
      }
    }

    const welcome = buildWelcomeMessage(comparison, locale)
    setMessages([welcome])
    persistMessages([welcome])
  }, [comparison, persistMessages, locale])

  useEffect(() => {
    initializeMessages()
  }, [initializeMessages])

  useEffect(() => {
    if (!comparison || messages.length <= 1) return
    persistMessages(messages)
  }, [messages, comparison, persistMessages])

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current)
      streamFlusherRef.current?.reset()
    }
  }, [])

  const clearLoadingTimers = () => {
    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current)
      searchTimerRef.current = null
    }
    setLoadingPhase("idle")
  }

  const removeStreamingAssistant = useCallback(() => {
    setMessages((prev) => {
      const last = prev[prev.length - 1]
      if (last?.role === "assistant" && last.streaming) {
        return prev.slice(0, -1)
      }
      return prev
    })
  }, [])

  const updateStreamingAssistant = useCallback((content: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1]
      if (last?.role !== "assistant" || !last.streaming) return prev
      const next = [...prev]
      next[next.length - 1] = { ...last, content }
      return next
    })
  }, [])

  const finalizeStreamingAssistant = useCallback((content: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1]
      if (last?.role !== "assistant" || !last.streaming) return prev
      const next = [...prev]
      next[next.length - 1] = { ...last, content, streaming: false }
      return next
    })
  }, [])

  const sendMessage = useCallback(
    async (textToSend: string) => {
      const trimmed = textToSend.trim()
      if (!trimmed || loading || !comparison) return

      setError(null)
      setLastUserMessage(trimmed)

      const userMsg = createMessage("user", trimmed)
      const assistantPlaceholder: ChatMessage = {
        ...createMessage("assistant", ""),
        streaming: true,
      }
      const updatedMessages = [...messages, userMsg]
      setMessages([...updatedMessages, assistantPlaceholder])
      setInput("")
      setLoading(true)
      setLoadingPhase("thinking")

      searchTimerRef.current = window.setTimeout(() => {
        setLoadingPhase("searching")
      }, 3000)

      const apiMessages = capMessages(updatedMessages).map(({ role, content }) => ({ role, content }))
      const flusher = createStreamFlusher((content) => {
        updateStreamingAssistant(content)
        setLoadingPhase("idle")
      })
      streamFlusherRef.current = flusher

      try {
        const response = await fetch("/api/compare/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            comparison,
            analysis,
            repair,
            stream: true,
            locale,
          }),
        })

        const contentType = response.headers.get("content-type") ?? ""

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(typeof data.error === "string" ? data.error : (locale === "ka" ? "კავშირი ვერ დამყარდა" : "Connection failed"))
        }

        if (contentType.includes("text/event-stream") && response.body) {
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const parsed = parseSseChunk(buffer)
            buffer = parsed.remainder
            if (parsed.content) {
              flusher.append(parsed.content)
            }
            if (parsed.done) break
          }

          const accumulated = flusher.flush()
          if (!accumulated.trim()) {
            throw new Error("პასუხის მომზადება ვერ მოხერხდა")
          }

          finalizeStreamingAssistant(accumulated)
          onUnread?.()
          return
        }

        const data = await response.json()
        if (!data.reply) throw new Error("პასუხის მომზადება ვერ მოხერხდა")
        finalizeStreamingAssistant(data.reply)
        onUnread?.()
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "კავშირი ვერ დამყარდა"
        setError(errMsg)
        removeStreamingAssistant()
      } finally {
        flusher.reset()
        streamFlusherRef.current = null
        clearLoadingTimers()
        setLoading(false)
      }
    },
    [
      comparison,
      analysis,
      repair,
      finalizeStreamingAssistant,
      loading,
      messages,
      onUnread,
      removeStreamingAssistant,
      updateStreamingAssistant,
    ]
  )

  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessage) return
    setError(null)
    setMessages((prev) => {
      const next = [...prev]
      while (next.length > 0) {
        const last = next[next.length - 1]
        if (last.role === "user" || last.streaming) {
          next.pop()
          continue
        }
        break
      }
      return next
    })
    await sendMessage(lastUserMessage)
  }, [lastUserMessage, sendMessage])

  const clearChat = useCallback(() => {
    setError(null)
    setLastUserMessage(null)
    streamFlusherRef.current?.reset()
    const welcome = buildWelcomeMessage(comparison, locale)
    setMessages([welcome])
    if (comparison) persistMessages([welcome])
  }, [comparison, persistMessages, locale])

  const dismissError = useCallback(() => setError(null), [])

  return {
    messages,
    input,
    setInput,
    loading,
    loadingPhase,
    error,
    canSend: Boolean(comparison && input.trim() && !loading),
    sendMessage,
    retryLastMessage,
    clearChat,
    dismissError,
    lastUserMessage,
  }
}
