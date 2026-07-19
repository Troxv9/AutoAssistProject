import { Suspense } from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "შესვლა | Auto Assist",
  robots: { index: false, follow: false },
}

export default async function SignInPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (data?.claims) redirect("/dashboard")

  return (
    <AuthPageShell>
      <Suspense>
        <AuthForm mode="sign-in" />
      </Suspense>
    </AuthPageShell>
  )
}
