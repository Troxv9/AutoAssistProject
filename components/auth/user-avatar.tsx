"use client"

import type { User } from "@supabase/supabase-js"
import { UserRound } from "lucide-react"
import { getUserDisplay } from "@/lib/hooks/use-auth-user"
import { getAvatarUrl } from "@/lib/profile/avatar"
import { cn } from "@/lib/utils"

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-11 text-sm",
} as const

type UserAvatarProps = {
  user: User
  size?: keyof typeof sizes
  className?: string
}

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const { initial } = getUserDisplay(user)
  const avatarUrl = getAvatarUrl(user)

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-semibold text-primary-foreground",
        sizes[size],
        className
      )}
    >
      {avatarUrl ? (
        
        <img src={avatarUrl} alt="" className="size-full object-cover" />
      ) : initial ? (
        initial
      ) : (
        <UserRound className="size-4" />
      )}
    </span>
  )
}
