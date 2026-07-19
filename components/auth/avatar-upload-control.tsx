"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Camera, Loader2, Trash2 } from "lucide-react"
import { UserAvatar } from "@/components/auth/user-avatar"
import { Button } from "@/components/ui/button"
import { AVATAR_MIME_TYPES, getAvatarUrl } from "@/lib/profile/avatar"
import { cn } from "@/lib/utils"

type AvatarUploadControlProps = {
  user: User
  size?: "sm" | "md" | "lg"
  showActions?: boolean
  className?: string
  avatarClassName?: string
  children?: React.ReactNode
}

export function AvatarUploadControl({
  user,
  size = "lg",
  showActions = true,
  className,
  avatarClassName,
  children,
}: AvatarUploadControlProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasAvatar = Boolean(getAvatarUrl(user))

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.set("file", file)

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })

      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error ?? "ატვირთვა ვერ მოხერხდა")
      } else {
        router.refresh()
      }
    } catch {
      setError("ატვირთვა ვერ მოხერხდა")
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    setRemoving(true)
    setError(null)

    try {
      const response = await fetch("/api/profile/avatar", { method: "DELETE" })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error ?? "წაშლა ვერ მოხერხდა")
      } else {
        router.refresh()
      }
    } catch {
      setError("წაშლა ვერ მოხერხდა")
    } finally {
      setRemoving(false)
    }
  }

  async function handleRemoveClick() {
    if (!window.confirm("ნამდვილად გსურთ პროფილის სურათის წაშლა?")) return
    await handleRemove()
  }

  const busy = uploading || removing

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-3">
        <div className="group/avatar relative shrink-0">
          <UserAvatar user={user} size={size} className={avatarClassName} />
          {hasAvatar && (
            <button
              type="button"
              disabled={busy}
              onClick={handleRemoveClick}
              className={cn(
                "absolute inset-0 flex items-center justify-center rounded-full bg-foreground/60 text-background opacity-0 transition-opacity group-hover/avatar:opacity-100 focus-visible:opacity-100",
                busy && "opacity-100"
              )}
              aria-label="სურათის წაშლა"
            >
              {removing ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Trash2 className="size-5" />
              )}
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "absolute -bottom-0.5 -right-0.5 z-10 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
              busy && "opacity-70"
            )}
            aria-label="პროფილის სურათის შეცვლა"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={AVATAR_MIME_TYPES.join(",")}
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>

        {children}
      </div>

      {showActions && hasAvatar && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={handleRemoveClick}
          className="h-8 w-full justify-start px-2 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
          სურათის წაშლა
        </Button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
