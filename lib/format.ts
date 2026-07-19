export const EMPTY_VALUE = "-"

export function normalizeDash(text: string): string {
  return text.replace(/[\u2012\u2013\u2014\u2015\u2212]/g, "-")
}

export function formatGel(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return EMPTY_VALUE

  const value = Math.round(amount)
  const sign = value < 0 ? "-" : ""
  const grouped = Math.abs(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")

  return `${sign}${grouped} ₾`
}


export function formatDateTimeKa(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tbilisi",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}
