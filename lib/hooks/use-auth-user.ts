"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

export function useAuthUser() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setReady(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      router.refresh()
    })

    return () => sub.subscription.unsubscribe()
  }, [router])

  return { user, ready }
}

export function getUserDisplay(user: User) {
  const label = user.user_metadata?.full_name || user.email || "ანგარიში"
  const initial = String(label).trim().charAt(0).toUpperCase()
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url.length > 0
      ? user.user_metadata.avatar_url
      : null

  return { label, initial, email: user.email ?? null, avatarUrl }
}
