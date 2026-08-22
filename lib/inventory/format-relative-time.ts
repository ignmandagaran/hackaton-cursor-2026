export function formatRelativeTime(
  isoDate: string,
  locale = "es"
): string {
  const date = new Date(isoDate)
  const now = Date.now()
  const diffSec = Math.round((now - date.getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, "second")

  const diffMin = Math.round(diffSec / 60)
  if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, "minute")

  const diffHour = Math.round(diffMin / 60)
  if (Math.abs(diffHour) < 24) return rtf.format(-diffHour, "hour")

  const diffDay = Math.round(diffHour / 24)
  return rtf.format(-diffDay, "day")
}
