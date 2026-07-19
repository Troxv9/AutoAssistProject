"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { ComparisonResult } from "@/lib/vehicles"
import { ChatPanel } from "./chat-panel"
import { useChat } from "./use-chat"
import { useIsMobile, usePrefersReducedMotion } from "./utils"

type ChatbotProps = {
  comparison: ComparisonResult | null
  comparisonId?: string | null
  analysis?: unknown
  repair?: unknown
}

export function Chatbot({ comparison, comparisonId, analysis, repair }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const isMobile = useIsMobile(768)
  const reducedMotion = usePrefersReducedMotion()

  const fabPosition =
    "bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] sm:bottom-8 sm:right-8"

  const desktopPanelPosition =
    "bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4.25rem)] right-[max(1rem,env(safe-area-inset-right))] sm:bottom-[6.5rem] sm:right-8"

  const handleUnread = useCallback(() => {
    if (!isOpen) setHasUnread(true)
  }, [isOpen])

  const chat = useChat({ comparison, analysis, repair, onUnread: handleUnread })

  const sessionIdRef = useRef<string | null>(null)
  const lastComparisonIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!comparisonId) {
      sessionIdRef.current = null
      lastComparisonIdRef.current = null
      return
    }
    if (lastComparisonIdRef.current !== comparisonId) {
      lastComparisonIdRef.current = comparisonId
      sessionIdRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : null
    }
  }, [comparisonId])

  useEffect(() => {
    if (!comparisonId || !sessionIdRef.current) return

    const persistable = chat.messages
      .filter((m) => !m.streaming && m.content.trim())
      .map((m) => ({ role: m.role, content: m.content }))

    if (!persistable.some((m) => m.role === "user")) return

    const firstUser = persistable.find((m) => m.role === "user")
    const title = firstUser ? firstUser.content.slice(0, 120) : null

    const timer = window.setTimeout(() => {
      fetch("/api/chat/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          comparisonId,
          title,
          messages: persistable,
        }),
      }).catch(() => {
      })
    }, 1200)

    return () => window.clearTimeout(timer)
  }, [chat.messages, comparisonId])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) setHasUnread(false)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  if (!mounted) return null

  const panelClassName =
    "flex h-full min-h-0 flex-col overflow-hidden border-foreground/10 bg-card/95 backdrop-blur-xl"

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(220,38,38,0.28)] transition-all duration-300",
          fabPosition,
          !reducedMotion && "hover:scale-105 active:scale-95",
          "group"
        )}
        aria-label={isOpen ? "ჩატის დახურვა" : "ჩატის გახსნა"}
        aria-expanded={isOpen}
        aria-controls="chat-panel"
      >
        {isOpen ? (
          <X className={cn("size-6", !reducedMotion && "rotate-90 transition-transform duration-300")} />
        ) : (
          <div className="relative">
            <MessageCircle className={cn("size-6", !reducedMotion && "transition-transform duration-300 group-hover:scale-110")} />
            {hasUnread && (
              <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full border-2 border-primary bg-background">
                <span className="size-1.5 rounded-full bg-primary" />
              </span>
            )}
            {!hasUnread && !reducedMotion && (
              <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500" />
              </span>
            )}
          </div>
        )}
      </button>

      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="h-[min(85dvh,calc(100dvh-env(safe-area-inset-bottom)-4rem))] gap-0 rounded-t-3xl border-x-0 border-b-0 p-0"
          >
            <ChatPanel
              comparison={comparison}
              chat={chat}
              onClose={() => setIsOpen(false)}
              autoFocus={isOpen}
              showDragHandle
              className={panelClassName}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <div
          className={cn(
            "fixed z-50 flex h-[min(560px,calc(100dvh-7.5rem))] w-[min(420px,calc(100vw-2rem))] max-h-[calc(100dvh-7.5rem)] flex-col overflow-hidden rounded-3xl border border-foreground/10 bg-card/95 shadow-[var(--shadow-elevated)] backdrop-blur-xl transition-all duration-300 origin-bottom-right",
            desktopPanelPosition,
            !reducedMotion && (isOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-10 scale-75 opacity-0")
          )}
          aria-hidden={!isOpen}
        >
          {isOpen && (
            <ChatPanel
              comparison={comparison}
              chat={chat}
              onClose={() => setIsOpen(false)}
              autoFocus
              className={panelClassName}
            />
          )}
        </div>
      )}
    </>
  )
}
