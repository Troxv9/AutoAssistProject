"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, Loader2, MessagesSquare, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ChatItem } from "@/components/dashboard/types"
import { HistoryEmptyState } from "@/components/dashboard/history-empty-state"
import { formatDateTimeKa } from "@/lib/format"
import { useTranslation } from "@/lib/locale-context"

export function ChatHistory({ items }: { items: ChatItem[] }) {
  const { t } = useTranslation()
  const router = useRouter()
  const [list, setList] = useState(items)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  async function handleDelete(id: string) {
    if (!window.confirm(t("dashboard.confirmDeleteChat"))) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" })
      if (response.ok) {
        setList((prev) => prev.filter((c) => c.id !== id))
        startTransition(() => router.refresh())
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (list.length === 0) {
    return (
      <div className="max-w-xl">
        <HistoryEmptyState
          icon={MessagesSquare}
          title={t("dashboard.emptyChatsTitle")}
          description={t("dashboard.emptyChatsDesc")}
          ctaLabel={t("dashboard.newComparison")}
          ctaHref="/#compare"
        />
      </div>
    )
  }

  return (
    <ul className="flex w-full max-w-xl flex-col gap-3">
      {list.map((s) => (
        <li
          key={s.id}
          className="calculator-surface group rounded-2xl border border-foreground/10 shadow-sm transition-all hover:border-primary/25 hover:shadow-[var(--shadow-elevated)]"
        >
          <div className="flex items-stretch gap-2 p-4 sm:gap-3">
            <Link href={`/dashboard/chat/${s.id}`} className="min-w-0 flex-1">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessagesSquare className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{s.title || t("dashboard.chatFallbackTitle")}</p>
                  {s.context && (
                    <Badge variant="secondary" className="mt-2 max-w-full truncate">
                      {s.context}
                    </Badge>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">{formatDateTimeKa(s.updatedAt)}</p>
                </div>
              </div>
            </Link>

            <div className="flex shrink-0 flex-col items-center justify-between gap-2 py-0.5">
              <Link
                href={`/dashboard/chat/${s.id}`}
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label={t("dashboard.viewChat")}
              >
                <ChevronRight className="size-4" />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("dashboard.deleteChat")}
                disabled={deletingId === s.id}
                onClick={() => handleDelete(s.id)}
                className="size-9 text-muted-foreground hover:text-destructive"
              >
                {deletingId === s.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
