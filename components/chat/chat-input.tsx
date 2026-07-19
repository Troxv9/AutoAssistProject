"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { ArrowUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/locale-context"
import type { ComparisonResult } from "@/lib/vehicles"

type ChatInputProps = {
  input: string
  onInputChange: (value: string) => void
  onSend: () => void
  loading: boolean
  canSend: boolean
  comparison: ComparisonResult | null
  autoFocus?: boolean
  onNavigateToCompare?: () => void
}

export function ChatInput({
  input,
  onInputChange,
  onSend,
  loading,
  canSend,
  comparison,
  autoFocus,
  onNavigateToCompare,
}: ChatInputProps) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const compareHref = pathname === "/" ? "#compare" : "/#compare"
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`
  }, [input])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (canSend) onSend()
    }
  }

  const handleCompareClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onNavigateToCompare?.()

    if (pathname !== "/") return

    event.preventDefault()
    document.querySelector("#compare")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    })
  }

  return (
    <div className="shrink-0 border-t border-foreground/8 bg-card/80 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-4 sm:py-3">
      {!comparison && (
        <p className="mb-2 text-center text-[10px] leading-relaxed text-muted-foreground sm:mb-2.5 sm:text-[11px]">
          <Link
            href={compareHref}
            onClick={handleCompareClick}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("chat.runComparison")}
          </Link>
          {" "}{t("chat.toAsk")}
        </p>
      )}

      <div
        className={cn(
          "flex items-end gap-2 rounded-[1.35rem] border border-foreground/10 bg-background p-1.5 pl-3 shadow-[0_1px_2px_rgba(10,10,10,0.04)] transition-[border-color,box-shadow,background-color] duration-200 ease-out",
          "hover:border-foreground/15 focus-within:border-primary/35 focus-within:shadow-[0_0_0_2px_color-mix(in_oklab,var(--primary)_12%,transparent),0_1px_2px_rgba(10,10,10,0.04)]",
          (!comparison || loading) && "opacity-70"
        )}
      >
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={comparison ? t("chat.placeholder") : t("chat.placeholderDisabled")}
          disabled={!comparison || loading}
          rows={1}
          className="min-h-10 max-h-28 flex-1 resize-none border-0 bg-transparent px-0 py-2 text-[13px] leading-relaxed shadow-none ring-0 placeholder:text-muted-foreground/55 focus-visible:border-transparent focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-100 sm:min-h-9 sm:text-sm"
          aria-label={t("chat.messageLabel")}
        />

        <Button
          type="button"
          size="icon"
          disabled={!canSend}
          onClick={onSend}
          className={cn(
            "mb-0.5 size-9 shrink-0 rounded-full transition-all sm:size-8",
            canSend
              ? "bg-primary text-primary-foreground shadow-[0_2px_10px_rgba(220,38,38,0.32)] hover:bg-primary/90 active:scale-95"
              : "bg-muted/80 text-muted-foreground hover:bg-muted"
          )}
          aria-label={t("chat.send")}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowUp className="size-4" strokeWidth={2.5} />
          )}
        </Button>
      </div>
    </div>
  )
}
