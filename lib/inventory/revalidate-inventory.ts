import { revalidatePath } from "next/cache"
import { routing } from "@/i18n/routing"

export function revalidateInventoryPaths() {
  for (const locale of routing.locales) {
    const homePath = locale === routing.defaultLocale ? "/" : `/${locale}`
    const movementsPath =
      locale === routing.defaultLocale ? "/movements" : `/${locale}/movements`

    revalidatePath(homePath)
    revalidatePath(movementsPath)
  }
}
