"use client"

import { MoonIcon, SunIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations("theme")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  let icon: React.ReactNode
  if (!mounted) {
    icon = <span className="size-4" aria-hidden />
  } else if (isDark) {
    icon = <SunIcon weight="regular" />
  } else {
    icon = <MoonIcon weight="regular" />
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? t("switchToLight") : t("switchToDark")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      suppressHydrationWarning
    >
      {icon}
    </Button>
  )
}
