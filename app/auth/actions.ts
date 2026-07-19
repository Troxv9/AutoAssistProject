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

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შეამოწმეთ მონაცემები" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "დაადასტურეთ ელ. ფოსტა შესვლამდე. შეამოწმეთ ინბოქსი." }
    }
    return { error: "არასწორი ელ. ფოსტა ან პაროლი" }
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
    if (error.code === "user_already_exists") {
      return { error: "ამ ელ. ფოსტით მომხმარებელი უკვე არსებობს" }
    }
    return { error: "რეგისტრაცია ვერ მოხერხდა. სცადეთ თავიდან." }
  }

  // New users are auto-confirmed at the database level, so establish a session
  // right away instead of asking them to check their email.
  if (data.user && !data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data)
    if (signInError) {
      return { message: "გაგზავნილია დამადასტურებელი ბმული თქვენს ელ. ფოსტაზე." }
    }
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
