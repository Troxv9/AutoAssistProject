"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import type { ComparisonResult } from "@/lib/vehicles"

type ChatComparisonContextValue = {
  comparison: ComparisonResult | null
  comparisonId: string | null
  analysis: unknown
  repair: unknown
  setComparison: (comparison: ComparisonResult | null, comparisonId?: string | null) => void
  setAnalysis: (analysis: unknown) => void
  setRepair: (repair: unknown) => void
}

const ChatComparisonContext = createContext<ChatComparisonContextValue | null>(null)

export function ChatComparisonProvider({ children }: { children: ReactNode }) {
  const [comparison, setComp] = useState<ComparisonResult | null>(null)
  const [comparisonId, setId] = useState<string | null>(null)
  const [analysis, setAnalysisState] = useState<unknown>(null)
  const [repair, setRepairState] = useState<unknown>(null)

  const setComparison = useCallback(
    (next: ComparisonResult | null, nextId: string | null = null) => {
      setComp(next)
      setId(nextId)
      setAnalysisState(null)
      setRepairState(null)
    },
    []
  )

  const setAnalysis = useCallback((a: unknown) => setAnalysisState(a), [])
  const setRepair = useCallback((r: unknown) => setRepairState(r), [])

  return (
    <ChatComparisonContext.Provider
      value={{ comparison, comparisonId, analysis, repair, setComparison, setAnalysis, setRepair }}
    >
      {children}
    </ChatComparisonContext.Provider>
  )
}

export function useChatComparison(): ChatComparisonContextValue {
  const ctx = useContext(ChatComparisonContext)
  if (!ctx) {
    return {
      comparison: null, comparisonId: null, analysis: null, repair: null,
      setComparison: () => {}, setAnalysis: () => {}, setRepair: () => {},
    }
  }
  return ctx
}
