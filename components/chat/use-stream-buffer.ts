export function createStreamFlusher(onFlush: (content: string) => void) {
  let accumulated = ""
  let rafId: number | null = null

  const scheduleFlush = () => {
    if (rafId !== null) return
    rafId = window.requestAnimationFrame(() => {
      rafId = null
      onFlush(accumulated)
    })
  }

  return {
    append(chunk: string) {
      if (!chunk) return
      accumulated += chunk
      scheduleFlush()
    },
    flush(): string {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
        rafId = null
      }
      onFlush(accumulated)
      return accumulated
    },
    get(): string {
      return accumulated
    },
    reset() {
      accumulated = ""
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
        rafId = null
      }
    },
  }
}
