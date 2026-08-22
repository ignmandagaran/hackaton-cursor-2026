import { siteConfig } from "@/lib/config/site"
import { ThemeSwitcher } from "./theme-switcher"

export function Header() {
  return (
    <nav className="sticky top-0 z-2 flex items-center justify-between px-safe py-safe font-mono uppercase">
      <div className="font-bold text-xl">{siteConfig.shortName}</div>
      <ThemeSwitcher />
    </nav>
  )
}
