"use client"

import { Chatbot } from "./chatbot"
import { useChatComparison } from "./chat-comparison-context"

export function GlobalChatbot() {
  const { comparison, comparisonId, analysis, repair } = useChatComparison()
  return <Chatbot comparison={comparison} comparisonId={comparisonId} analysis={analysis} repair={repair} />
}
