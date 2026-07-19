import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getChatSession } from "@/lib/history"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "ჩატის ისტორია | Auto Assist",
  robots: { index: false, follow: false },
}

const dt = (value: string) =>
  new Date(value).toLocaleString("ka-GE", { dateStyle: "medium", timeStyle: "short" })

export default async function ChatSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect(`/sign-in?redirect=/dashboard/chat/${id}`)

  const result = await getChatSession(id)
  if (!result) notFound()

  const { session, messages } = result

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        ისტორიაზე დაბრუნება
      </Link>

      <header className="mt-6 mb-8 border-b pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{(session.title as string) || "ჩატი"}</h1>
        <p className="mt-2 text-xs text-muted-foreground">{dt(session.updated_at as string)}</p>
      </header>

      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">ამ ჩატში შეტყობინებები არ არის.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {messages.map((m) => {
            const isUser = m.role === "user"
            return (
              <li key={m.id as string} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    isUser
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-secondary text-foreground"
                  )}
                >
                  {m.content as string}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
