"use client"

import { useEffect, useState } from "react"

export function formatMessageTime(timestamp: number) {
  return new Intl.DateTimeFormat("ka-GE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp))
}

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [breakpoint])

  return isMobile
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  return reduced
}
