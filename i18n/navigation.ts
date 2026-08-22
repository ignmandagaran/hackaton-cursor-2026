import { createNavigation } from "next-intl/navigation"
import { routing } from "./routing"

export const {
  Link: IntlLink,
  usePathname,
  useRouter,
  redirect,
  permanentRedirect,
  getPathname,
} = createNavigation(routing)
