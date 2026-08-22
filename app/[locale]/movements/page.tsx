import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { RecentMovementsView } from "@/components/inventory/recent-movements"
import { Wrapper } from "@/components/layout/wrapper"
import { IntlLink } from "@/i18n/navigation"
import { getAllMovements } from "@/lib/inventory/movements"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "movements" })

  return {
    title: t("title"),
  }
}

export default async function MovementsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("movements")

  const movements = getAllMovements()

  return (
    <Wrapper>
      <section className="flex grow flex-col items-center px-4 py-10">
        <div className="flex w-full max-w-xl flex-col gap-6">
          <div className="flex flex-col gap-2">
            <IntlLink
              href="/"
              className="text-muted-foreground text-sm underline-offset-2 hover:text-foreground hover:underline"
            >
              ← {t("back")}
            </IntlLink>
            <h1 className="font-heading font-medium text-2xl">{t("title")}</h1>
          </div>
          <RecentMovementsView
            movements={movements}
            emptyMessage={t("empty")}
            deletedLabel={t("deleted")}
            locale={locale}
          />
        </div>
      </section>
    </Wrapper>
  )
}
