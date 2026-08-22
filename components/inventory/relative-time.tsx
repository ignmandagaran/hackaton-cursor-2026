"use client"

import { useEffect, useState } from "react"
import { formatRelativeTime } from "@/lib/inventory/format-relative-time"

export function RelativeTime({
  isoDate,
  locale = "es",
}: {
  isoDate: string
  locale?: string
}) {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    setLabel(formatRelativeTime(isoDate, locale))
  }, [isoDate, locale])

  return <span suppressHydrationWarning>{label ?? "\u00a0"}</span>
}
