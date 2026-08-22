import { siteConfig } from "@/lib/config/site"
import { ThemeSwitcher } from "./theme-switcher"

export function Header() {
  return (
    <nav className="sticky top-0 z-2 flex items-center justify-between px-safe py-safe">
      <div className="font-heading font-medium text-xl">{siteConfig.shortName}</div>
      <ThemeSwitcher />
    </nav>
  )
}
