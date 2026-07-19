export type ComparisonItem = {
  id: string
  copartTitle: string | null
  myautoTitle: string | null
  importTotalGel: number | null
  localTotalGel: number | null
  differenceGel: number | null
  createdAt: string
}

export type ChatItem = {
  id: string
  title: string | null
  context: string | null
  updatedAt: string
}
