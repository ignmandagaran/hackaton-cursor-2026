import { getTranslations, setRequestLocale } from "next-intl/server"
import { CurrentStockView } from "@/components/inventory/current-stock"
import { RecentMovementsView } from "@/components/inventory/recent-movements"
import { Wrapper } from "@/components/layout/wrapper"
import { MovementForm } from "@/components/movement/movement-form"
import { getRecentMovements } from "@/lib/inventory/movements"
import { getCurrentStock } from "@/lib/inventory/stock"

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("home")

  const currentStock = getCurrentStock()
  const recentMovements = getRecentMovements()

  return (
    <Wrapper>
      <section className="flex grow flex-col items-center gap-12 px-4 py-10">
        <div className="w-full max-w-xl">
          <div className="mb-8 text-center">
            <h1 className="font-heading font-medium text-2xl">
              {t("movementTitle")}
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              {t("movementSubtitle")}
            </p>
          </div>
          <MovementForm />
        </div>

        <div className="w-full max-w-4xl">
          <h2 className="mb-4 font-heading font-medium text-xl">
            {t("currentStockTitle")}
          </h2>
          <CurrentStockView stock={currentStock} />
        </div>

        <div className="w-full max-w-4xl">
          <h2 className="mb-4 font-heading font-medium text-xl">
            {t("recentMovementsTitle")}
          </h2>
          <RecentMovementsView movements={recentMovements} />
        </div>
      </section>
    </Wrapper>
  )
}
