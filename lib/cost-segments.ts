export const COST_SEGMENT_COLORS = [
  "bg-[#dc2626]",
  "bg-[#0a0a0a]",
  "bg-[#737373]",
  "bg-[#991b1b]",
  "bg-[#404040]",
  "bg-[#ef4444]",
  "bg-[#a3a3a3]",
  "bg-[#262626]",
  "bg-[#7f1d1d]",
  "bg-[#525252]",
] as const

export function costSegmentColor(index: number) {
  return COST_SEGMENT_COLORS[index % COST_SEGMENT_COLORS.length]
}

export function lineShare(amountGel: number, total: number) {
  if (total <= 0) return 0
  return (Math.max(0, amountGel) / total) * 100
}

export function formatShare(share: number) {
  if (share < 1) return "<1%"
  return `${Math.round(share)}%`
}
