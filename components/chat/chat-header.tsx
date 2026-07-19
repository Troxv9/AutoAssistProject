"use client"

import { useEffect, useRef, useState } from "react"
import { MoreHorizontal, Trash2, X } from "lucide-react"
import { AutoAssistLogoIcon, AutoAssistWordmark } from "@/components/auto-assist-brand"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/locale-context"

type ChatHeaderProps = {
  onClose: () => void
  onClear: () => void
}

export function ChatHeader({ onClose, onClear }: ChatHeaderProps) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [menuOpen])

  return (
    <div className="shrink-0 border-b border-border/60 bg-muted/40">
      <div className="flex items-center justify-between gap-2 px-3.5 py-3 sm:gap-3 sm:px-4 sm:pb-3 sm:pt-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-foreground sm:size-9">
            <AutoAssistLogoIcon className="size-4 sm:size-5" />
          </span>
          <div className="min-w-0">
            <AutoAssistWordmark className="text-xs sm:text-sm" />
            <h3 className="truncate text-xs font-bold leading-tight sm:text-sm">{t("chat.title")}</h3>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <div className="relative" ref={menuRef}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 rounded-full sm:size-8"
              aria-label={t("chat.menu")}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MoreHorizontal className="size-4" />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-10 min-w-44 overflow-hidden rounded-xl border bg-popover p-1 shadow-lg">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    onClear()
                    setMenuOpen(false)
                  }}
                >
                  <Trash2 className="size-4 text-destructive" />
                  {t("chat.clearConversation")}
                </button>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-full sm:size-8"
            onClick={onClose}
            aria-label={t("chat.close")}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
