"use client"
import { useState } from "react"
import { Check, Copy, Loader2, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/locale-context"

export function ShareButton({ snapshot, className }: { snapshot: unknown; className?: string }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(false)

  async function share() {
    setLoading(true)
    setError(false)
    try {
      const r = await fetch("/api/shares", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(snapshot),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d?.error || "share failed")
      const fullUrl = `${location.origin}${d.url}`
      setUrl(fullUrl)
      await navigator.clipboard.writeText(fullUrl).catch(() => {})
      setCopied(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
  }

  if (url) {
    return (
      <Button variant="outline" onClick={copy} className={className}>
        {copied ? <Check /> : <Copy />}
        {copied ? t("report.linkCopied") : t("report.copyLink")}
      </Button>
    )
  }

  return (
    <Button variant="outline" onClick={share} disabled={loading} className={className}>
      {loading ? <Loader2 className="animate-spin" /> : <Share2 />}
      {error ? t("report.shareError") : t("report.shareButton")}
    </Button>
  )
}
