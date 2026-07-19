"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ComparisonReport } from "@/components/comparison/comparison-report"
import { PREVIEW_STORAGE_KEY } from "@/lib/comparison-preview"
import type { ComparisonResult } from "@/lib/vehicles"

export default function ComparisonPreviewPage() {
  const router = useRouter()
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PREVIEW_STORAGE_KEY)
      if (!raw) {
        setMissing(true)
        return
      }
      setResult(JSON.parse(raw) as ComparisonResult)
    } catch {
      setMissing(true)
    }
  }, [])

  useEffect(() => {
    if (missing) router.replace("/")
  }, [missing, router])

  if (!result) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  return <ComparisonReport result={result} isAnonymous />
}
