"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const credentialsSchema = z.object({
  email: z.string().email("შეიყვანეთ სწორი ელ. ფოსტა"),
  password: z.string().min(6, "პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო"),
})

export type AuthState = {
  error?: string
  message?: string
}

function safeRedirect(target: FormDataEntryValue | null): string {
  const value = typeof target === "string" ? target : ""
  if (value.startsWith("/") && !value.startsWith("//")) return value
  return "/dashboard"
}

function isNextControlFlowError(e: unknown): boolean {
  const digest = (e as { digest?: unknown })?.digest
  return typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND")
}

function envDiag(extra?: Record<string, string>): string {
  const parts = [
    `url:${process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "MISSING"}`,
    `key:${
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "set"
        : "MISSING"
    }`,
  ]
  if (extra) for (const [k, v] of Object.entries(extra)) parts.push(`${k}:${v}`)
  return parts.join(" ")
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შეამოწმეთ მონაცემები" }
  }

  const diag = envDiag()

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data)

    if (error) {
      console.error("[signIn] supabase returned error:", {
        status: error.status,
        code: error.code,
        name: error.name,
        message: error.message,
        env: diag,
      })
      if (error.code === "email_not_confirmed") {
        return { error: "დაადასტურეთ ელ. ფოსტა შესვლამდე. შეამოწმეთ ინბოქსი." }
      }
      if (error.code === "invalid_credentials" || error.status === 400) {
        return { error: "ასეთი მომხმარებელი არ არსებობს ან მონაცემები არასწორია. გთხოვთ, გაიაროთ რეგისტრაცია." }
      }
      return { error: "შესვლა ვერ მოხერხდა. სცადეთ თავიდან." }
    }

    console.error("[signIn] success:", { hasSession: !!data.session, hasUser: !!data.user, env: diag })
  } catch (e) {
    if (isNextControlFlowError(e)) throw e
    const err = e as Error
    console.error("[signIn] THROWN:", { name: err?.name, message: err?.message, env: diag })
    return { error: `DEBUG signIn THROWN: ${err?.name ?? "Error"} — ${err?.message ?? String(e)} [${diag}]` }
  }

  revalidatePath("/", "layout")
  redirect(safeRedirect(formData.get("redirect")))
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შეამოწმეთ მონაცემები" }
  }

  const fullName = (formData.get("fullName") as string | null)?.trim() || undefined
  const origin = (await headers()).get("origin") ?? ""
  const diag = envDiag({ origin: origin || "EMPTY" })

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: fullName ? { full_name: fullName } : undefined,
        emailRedirectTo: `${origin}/auth/confirm`,
      },
    })

    if (error) {
      console.error("[signUp] supabase returned error:", {
        status: error.status,
        code: error.code,
        name: error.name,
        message: error.message,
        env: diag,
      })
      if (error.code === "user_already_exists") {
        return { error: "ამ ელ. ფოსტით მომხმარებელი უკვე არსებობს" }
      }
      return {
        error: `DEBUG signUp: ${error.status ?? "?"} ${error.code ?? error.name} — ${error.message} [${diag}]`,
      }
    }

  
    console.error("[signUp] result:", { hasSession: !!data.session, hasUser: !!data.user, env: diag })

  
    if (data.user && !data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data)
      if (signInError) {
        console.error("[signUp] post-signup signIn error:", {
          status: signInError.status,
          code: signInError.code,
          name: signInError.name,
          message: signInError.message,
          env: diag,
        })
        return {
          error: `DEBUG signUp->signIn: ${signInError.status ?? "?"} ${
            signInError.code ?? signInError.name
          } — ${signInError.message} [${diag}]`,
        }
      }
    }
  } catch (e) {
    if (isNextControlFlowError(e)) throw e
    const err = e as Error
    console.error("[signUp] THROWN:", { name: err?.name, message: err?.message, env: diag })
    return { error: `DEBUG signUp THROWN: ${err?.name ?? "Error"} — ${err?.message ?? String(e)} [${diag}]` }
  }

  revalidatePath("/", "layout")
  redirect(safeRedirect(formData.get("redirect")))
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
