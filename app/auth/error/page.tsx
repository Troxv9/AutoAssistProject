import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "ავტორიზაციის შეცდომა | Auto Assist",
  robots: { index: false, follow: false },
}

export default function AuthErrorPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-background p-10 text-center shadow-[var(--shadow-elevated)]">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">ბმული არასწორია ან ვადაგასულია</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          დამადასტურებელი ბმული ვერ დამუშავდა. სცადეთ ხელახლა შესვლა ან მოითხოვეთ ახალი ბმული.
        </p>
        <Link href="/sign-in" className={cn(buttonVariants({ variant: "default" }), "mt-6 h-11 rounded-xl px-6")}>
          შესვლის გვერდზე დაბრუნება
        </Link>
      </div>
    </div>
  )
}
