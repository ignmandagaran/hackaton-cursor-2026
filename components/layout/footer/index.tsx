import { siteConfig } from "@/lib/config/site"

export function Footer() {
  return (
    <footer className="flex flex-col items-center justify-between p-safe 2xl:flex-row 2xl:items-end">
      <div className="text-foreground">{siteConfig.shortName}</div>
    </footer>
  )
}
