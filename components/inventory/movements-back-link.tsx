import { routing } from "@/i18n/routing"

export function MovementsBackLink({
  label,
  locale,
  className,
}: {
  label: string
  locale: string
  className?: string
}) {
  const href = locale === routing.defaultLocale ? "/" : `/${locale}`

  return (
    <a href={href} className={className}>
      ← {label}
    </a>
  )
}
